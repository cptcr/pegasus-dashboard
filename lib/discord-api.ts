/**
 * Discord API utilities for fetching user guilds and checking permissions
 */

export interface DiscordGuild {
  id: string;
  name: string;
  icon: string | null;
  owner: boolean;
  permissions: string;
  features: string[];
}

export interface GuildWithBotStatus extends DiscordGuild {
  hasBot: boolean;
  isAdmin: boolean; // Admin status checked via bot API, not Discord permissions
}

/**
 * Discord permission flags
 */
const PERMISSIONS = {
  ADMINISTRATOR: 0x8,
  MANAGE_GUILD: 0x20,
  MANAGE_ROLES: 0x10000000,
  MANAGE_CHANNELS: 0x10,
  KICK_MEMBERS: 0x2,
  BAN_MEMBERS: 0x4,
  MANAGE_NICKNAMES: 0x8000000,
  MANAGE_WEBHOOKS: 0x20000000,
} as const;

/**
 * Check if user has manage server permissions in a guild
 */
export function hasManagePermission(permissions: string): boolean {
  try {
    const perms = BigInt(permissions);
    // Check for Administrator or Manage Guild permission
    const hasAdmin = (perms & BigInt(PERMISSIONS.ADMINISTRATOR)) === BigInt(PERMISSIONS.ADMINISTRATOR);
    const hasManage = (perms & BigInt(PERMISSIONS.MANAGE_GUILD)) === BigInt(PERMISSIONS.MANAGE_GUILD);
    
    if (hasAdmin || hasManage) {
      console.log(`[Permissions] User has admin permissions: Admin=${hasAdmin}, Manage=${hasManage}`);
    }
    
    return hasAdmin || hasManage;
  } catch (error) {
    console.error('[Permissions] Error checking permissions:', error);
    return false;
  }
}

/**
 * Check if user has admin permissions in a guild (legacy function name)
 */
export function hasAdminPermission(permissions: string): boolean {
  return hasManagePermission(permissions);
}

/**
 * Simple in-memory cache for Discord API responses
 */
const discordCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 60000; // Cache for 1 minute

/**
 * Sleep function for delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Fetch user's guilds from Discord API with rate limit handling
 */
export async function fetchUserGuilds(accessToken: string): Promise<DiscordGuild[]> {
  const cacheKey = `guilds_${accessToken}`;
  
  // Check cache first
  const cached = discordCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    console.log('[Discord API] Returning cached guilds');
    return cached.data;
  }
  
  // Retry logic with exponential backoff
  let retries = 0;
  const maxRetries = 3;
  
  while (retries < maxRetries) {
    try {
      console.log(`[Discord API] Fetching user guilds (attempt ${retries + 1}/${maxRetries})`);
      
      const response = await fetch("https://discord.com/api/v10/users/@me/guilds", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('[Discord API] Response status:', response.status);

      // Handle rate limiting
      if (response.status === 429) {
        const errorData = await response.json();
        const retryAfter = errorData.retry_after || 1;
        console.log(`[Discord API] Rate limited. Retrying after ${retryAfter} seconds`);
        await sleep(retryAfter * 1000);
        retries++;
        continue;
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[Discord API] Failed to fetch guilds: ${response.status}`, errorText);
        return [];
      }

      const guilds = await response.json() as DiscordGuild[];
      console.log(`[Discord API] Successfully fetched ${guilds.length} guilds`);
      
      // Cache the result
      discordCache.set(cacheKey, { data: guilds, timestamp: Date.now() });
      
      return guilds;
    } catch (error) {
      console.error(`[Discord API] Error fetching user guilds (attempt ${retries + 1}):`, error);
      retries++;
      
      if (retries < maxRetries) {
        // Exponential backoff: 1s, 2s, 4s
        const delay = Math.pow(2, retries - 1) * 1000;
        console.log(`[Discord API] Retrying in ${delay}ms`);
        await sleep(delay);
      }
    }
  }
  
  console.error('[Discord API] Failed to fetch guilds after all retries');
  return [];
}

import { isBotInGuild, checkUserAdminViaBot } from './bot-api';

/**
 * Cache for bot status checks
 */
const botStatusCache = new Map<string, { data: any; timestamp: number }>();
const BOT_CACHE_TTL = 120000; // Cache for 2 minutes

/**
 * Check if bot is in a guild and get user's admin status (server-side only)
 */
export async function checkBotAndUserStatus(guildId: string, userId: string): Promise<{ hasBot: boolean; isAdmin: boolean }> {
  try {
    // This function should only run on the server
    if (typeof window !== 'undefined') {
      console.error('checkBotAndUserStatus should only be called on the server');
      return { hasBot: false, isAdmin: false };
    }
    
    // Check cache first
    const cacheKey = `bot_${guildId}_${userId}`;
    const cached = botStatusCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < BOT_CACHE_TTL) {
      console.log(`[Bot Check] Returning cached status for guild ${guildId}`);
      return cached.data;
    }
    
    // First, try to use Discord Bot Token if available
    const discordBotToken = process.env.DISCORD_BOT_TOKEN;
    if (discordBotToken) {
      console.log(`[Bot Check] Using Discord Bot Token to check guild ${guildId}`);
      
      const hasBot = await isBotInGuild(guildId);
      let isAdmin = false;
      
      if (hasBot) {
        // Bot is in guild, check if user is admin
        isAdmin = await checkUserAdminViaBot(guildId, userId);
      }
      
      const result = { hasBot, isAdmin };
      botStatusCache.set(cacheKey, { data: result, timestamp: Date.now() });
      return result;
    }
    
    // Fallback to custom bot API if configured
    const apiUrl = process.env.API_URL || 'http://localhost:2000';
    const botApiToken = process.env.BOT_API_TOKEN;
    
    if (!botApiToken && !discordBotToken) {
      console.log(`[Bot Check] No bot tokens configured`);
      const result = { hasBot: false, isAdmin: false };
      botStatusCache.set(cacheKey, { data: result, timestamp: Date.now() });
      return result;
    }
    
    try {
      // Check if bot is in the guild
      console.log(`[Bot Check] Checking bot status for guild ${guildId}`);
      
      // Try different endpoint formats
      const endpoints = [
        `${apiUrl}/api/guilds/${guildId}`,
        `${apiUrl}/guilds/${guildId}`,
        `${apiUrl}/api/servers/${guildId}`,
        `${apiUrl}/servers/${guildId}`,
      ];
      
      let botCheckResponse = null;
      for (const endpoint of endpoints) {
        try {
          console.log(`[Bot Check] Trying endpoint: ${endpoint}`);
          botCheckResponse = await fetch(endpoint, {
            headers: {
              Authorization: `Bearer ${botToken}`,
              'Content-Type': 'application/json',
            },
            // Add timeout to prevent hanging
            signal: AbortSignal.timeout(2000),
          });
          
          if (botCheckResponse.ok || botCheckResponse.status === 404) {
            break; // Found the right endpoint format
          }
        } catch (err) {
          console.log(`[Bot Check] Endpoint ${endpoint} failed:`, err);
        }
      }
      
      if (!botCheckResponse) {
        console.log(`[Bot Check] All endpoints failed for guild ${guildId}`);
        return { hasBot: false, isAdmin: false };
      }
      
      if (!botCheckResponse.ok) {
        if (botCheckResponse.status === 404) {
          console.log(`[Bot Check] Bot NOT in guild ${guildId}`);
          return { hasBot: false, isAdmin: false };
        }
        console.log(`[Bot Check] Bot check failed for guild ${guildId}: ${botCheckResponse.status}`);
        return { hasBot: false, isAdmin: false };
      }
      
      // Bot is in guild, now check user's admin status
      console.log(`[Bot Check] Bot IS in guild ${guildId}, checking user ${userId} admin status`);
      
      const memberResponse = await fetch(`${apiUrl}/api/guilds/${guildId}/members/${userId}`, {
        headers: {
          Authorization: `Bearer ${botToken}`,
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(5000),
      });
      
      if (!memberResponse.ok) {
        console.log(`[Bot Check] Could not fetch member ${userId} in guild ${guildId}: ${memberResponse.status}`);
        // Bot is in server but couldn't check user - assume no admin
        return { hasBot: true, isAdmin: false };
      }
      
      const memberData = await memberResponse.json();
      console.log(`[Bot Check] Member data for ${userId}:`, memberData);
      
      // Check if user has Administrator permission
      let isAdmin = false;
      
      // Check different possible response formats
      if (memberData.permissions) {
        const permissions = BigInt(memberData.permissions);
        const ADMINISTRATOR = BigInt(0x8);
        isAdmin = (permissions & ADMINISTRATOR) === ADMINISTRATOR;
      } else if (memberData.isAdmin !== undefined) {
        isAdmin = memberData.isAdmin;
      } else if (memberData.roles && Array.isArray(memberData.roles)) {
        // Check if user has admin roles (this would need role permission checking)
        // For now, we'll assume false unless we have explicit permission data
        isAdmin = false;
      }
      
      console.log(`[Bot Check] Guild ${guildId}: Bot=true, Admin=${isAdmin}`);
      const result = { hasBot: true, isAdmin };
      
      // Cache the result
      botStatusCache.set(cacheKey, { data: result, timestamp: Date.now() });
      
      return result;
      
    } catch (apiError: any) {
      if (apiError.name === 'AbortError') {
        console.log(`[Bot Check] Timeout checking guild ${guildId}`);
      } else {
        console.log(`[Bot Check] API error for guild ${guildId}:`, apiError.message);
      }
      
      // If API is not available or errors, assume bot is NOT in server
      // This is the safe default - we only show servers as manageable if we're SURE
      const result = { hasBot: false, isAdmin: false };
      
      // Cache even failures to prevent repeated failed requests
      botStatusCache.set(cacheKey, { data: result, timestamp: Date.now() });
      
      return result;
    }
  } catch (error) {
    console.error(`[Bot Check] Unexpected error for guild ${guildId}:`, error);
    return { hasBot: false, isAdmin: false };
  }
}

/**
 * Legacy function - kept for compatibility
 */
export async function checkBotInGuild(guildId: string): Promise<boolean> {
  const { hasBot } = await checkBotAndUserStatus(guildId, '');
  return hasBot;
}

/**
 * Get ALL user guilds with bot and permission status
 */
export async function getAllUserGuilds(accessToken: string, userId: string): Promise<GuildWithBotStatus[]> {
  try {
    // Fetch all user guilds from Discord
    const guilds = await fetchUserGuilds(accessToken);
    
    console.log(`[getAllUserGuilds] Fetched ${guilds.length} guilds for user ${userId}`);
    
    // First, identify servers where user has admin/manage permissions from Discord
    const adminGuilds = guilds.filter(guild => {
      const hasPerms = hasManagePermission(guild.permissions) || guild.owner;
      if (hasPerms) {
        console.log(`[getAllUserGuilds] User has admin/owner in: ${guild.name} (${guild.id}) - Owner: ${guild.owner}`);
      }
      return hasPerms;
    });
    
    console.log(`[getAllUserGuilds] User has admin/owner in ${adminGuilds.length} servers`);
    
    // Process guilds in smaller batches
    const BATCH_SIZE = 5;
    const guildsWithStatus: GuildWithBotStatus[] = [];
    
    for (let i = 0; i < guilds.length; i += BATCH_SIZE) {
      const batch = guilds.slice(i, i + BATCH_SIZE);
      
      const batchResults = await Promise.all(
        batch.map(async (guild) => {
          // Check Discord permissions first
          const hasDiscordAdmin = hasManagePermission(guild.permissions) || guild.owner;
          
          // Only check bot status for servers where user has admin
          let hasBot = false;
          let isAdmin = hasDiscordAdmin; // Start with Discord permissions
          
          if (hasDiscordAdmin) {
            // User has admin, now check if bot is in the server
            const botStatus = await checkBotAndUserStatus(guild.id, userId);
            hasBot = botStatus.hasBot;
            
            // For the final admin status:
            // User must have Discord admin/owner AND bot must be in server
            isAdmin = hasDiscordAdmin && hasBot;
            
            console.log(`[getAllUserGuilds] ${guild.name}: Discord Admin=${hasDiscordAdmin}, Bot Present=${hasBot}, Can Manage=${isAdmin}`);
          }
          
          return {
            ...guild,
            hasBot,
            isAdmin, // Can only manage if BOTH conditions are met
          };
        })
      );
      
      guildsWithStatus.push(...batchResults);
      
      // Add a small delay between batches
      if (i + BATCH_SIZE < guilds.length) {
        await sleep(100);
      }
    }
    
    return guildsWithStatus;
  } catch (error) {
    console.error("[getAllUserGuilds] Error getting all user guilds:", error);
    return [];
  }
}

/**
 * Get user's admin guilds with bot status (legacy - for backwards compatibility)
 */
export async function getUserAdminGuilds(accessToken: string): Promise<GuildWithBotStatus[]> {
  try {
    const allGuilds = await getAllUserGuilds(accessToken);
    // Filter for guilds where user has manage permissions
    return allGuilds.filter(guild => guild.isAdmin);
  } catch (error) {
    console.error("Error getting admin guilds:", error);
    return [];
  }
}

/**
 * Generate bot invite URL for a specific guild
 */
export function getBotInviteUrl(guildId?: string): string {
  const baseUrl = "https://discord.com/oauth2/authorize";
  
  // Use the client ID from environment or fallback to the known ID
  const clientId = typeof window !== 'undefined' 
    ? process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID || "1375140177961418774"
    : process.env.DISCORD_CLIENT_ID || process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID || "1375140177961418774";
  
  const params = new URLSearchParams({
    client_id: clientId,
    permissions: "8", // Administrator permission
    scope: "bot applications.commands",
  });
  
  if (guildId) {
    params.append("guild_id", guildId);
    params.append("disable_guild_select", "true");
  }
  
  return `${baseUrl}?${params.toString()}`;
}