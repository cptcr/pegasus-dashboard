/**
 * Bot API utilities for checking bot presence in guilds
 * This uses the Discord Bot Token to check guilds directly
 */

// Cache for bot guilds
let botGuildsCache: Set<string> | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Fetch all guilds the bot is in using Discord Bot Token
 */
export async function fetchBotGuilds(): Promise<Set<string>> {
  // Check cache first
  if (botGuildsCache && Date.now() - cacheTimestamp < CACHE_TTL) {
    console.log('[Bot API] Returning cached bot guilds');
    return botGuildsCache;
  }

  const botToken = process.env.DISCORD_BOT_TOKEN;
  
  if (!botToken) {
    console.log('[Bot API] No DISCORD_BOT_TOKEN configured');
    return new Set();
  }

  try {
    console.log('[Bot API] Fetching bot guilds from Discord');
    
    // Use Discord API with Bot token
    const response = await fetch('https://discord.com/api/v10/users/@me/guilds', {
      headers: {
        Authorization: `Bot ${botToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error(`[Bot API] Failed to fetch bot guilds: ${response.status}`);
      
      // If unauthorized, the token might be invalid
      if (response.status === 401) {
        console.error('[Bot API] Invalid bot token');
      }
      
      return new Set();
    }

    const guilds = await response.json();
    const guildIds = new Set(guilds.map((g: any) => g.id));
    
    console.log(`[Bot API] Bot is in ${guildIds.size} guilds`);
    
    // Cache the result
    botGuildsCache = guildIds;
    cacheTimestamp = Date.now();
    
    return guildIds;
  } catch (error) {
    console.error('[Bot API] Error fetching bot guilds:', error);
    return new Set();
  }
}

/**
 * Check if bot is in a specific guild
 */
export async function isBotInGuild(guildId: string): Promise<boolean> {
  const botGuilds = await fetchBotGuilds();
  return botGuilds.has(guildId);
}

/**
 * Check user's admin status in a guild via bot
 */
export async function checkUserAdminViaBot(guildId: string, userId: string): Promise<boolean> {
  const botToken = process.env.DISCORD_BOT_TOKEN;
  
  if (!botToken) {
    return false;
  }

  try {
    // Fetch member data from Discord
    const response = await fetch(
      `https://discord.com/api/v10/guilds/${guildId}/members/${userId}`,
      {
        headers: {
          Authorization: `Bot ${botToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      console.log(`[Bot API] Could not fetch member ${userId} in guild ${guildId}: ${response.status}`);
      return false;
    }

    const member = await response.json();
    
    // Check if user has Administrator permission
    if (member.permissions) {
      const permissions = BigInt(member.permissions);
      const ADMINISTRATOR = BigInt(0x8);
      const hasAdmin = (permissions & ADMINISTRATOR) === ADMINISTRATOR;
      
      console.log(`[Bot API] User ${userId} in guild ${guildId}: Admin=${hasAdmin}`);
      return hasAdmin;
    }
    
    // Check roles for admin permission
    // This would require fetching role data and checking permissions
    // For now, return false if we can't determine
    return false;
  } catch (error) {
    console.error(`[Bot API] Error checking user admin status:`, error);
    return false;
  }
}