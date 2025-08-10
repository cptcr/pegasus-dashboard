import NextAuth, { 
  type NextAuthOptions, 
  type Session
} from "next-auth";
import type { JWT } from "next-auth/jwt";
import DiscordProvider from "next-auth/providers/discord";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "./database";
import { env, discordConfig, nextAuthConfig } from "./env";
import { cookies } from "next/headers";
import { getServerSession } from "next-auth/next";

/**
 * Discord API Types
 */
export interface DiscordUser {
  id: string;
  username: string;
  discriminator: string;
  global_name?: string | null;
  avatar: string | null;
  bot?: boolean;
  system?: boolean;
  mfa_enabled?: boolean;
  banner?: string | null;
  accent_color?: number | null;
  locale?: string;
  verified?: boolean;
  email?: string | null;
  flags?: number;
  premium_type?: number;
  public_flags?: number;
}

interface DiscordGuild {
  id: string;
  name: string;
  icon: string | null;
  owner: boolean;
  permissions: string; // Permissions are returned as string in Discord API
  features: string[];
  permissions_new?: string;
}


/**
 * Extended JWT token with Discord-specific fields
 */
interface ExtendedJWT extends JWT {
  id?: string;
  accessToken?: string;
  refreshToken?: string;
  tokenType?: string;
  expiresAt?: number;
  discordId?: string;
  isAdmin?: boolean;
  guilds?: string[]; // Array of guild IDs where user is admin
}

/**
 * Extended Session with Discord user information
 */
interface ExtendedSession extends Session {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    discordId: string;
    isAdmin: boolean;
    guilds?: string[];
  };
  accessToken?: string;
  error?: string;
}

/**
 * Discord permission flags
 */
const DiscordPermissions = {
  CREATE_INSTANT_INVITE: 0x1,
  KICK_MEMBERS: 0x2,
  BAN_MEMBERS: 0x4,
  ADMINISTRATOR: 0x8,
  MANAGE_CHANNELS: 0x10,
  MANAGE_GUILD: 0x20,
  ADD_REACTIONS: 0x40,
  VIEW_AUDIT_LOG: 0x80,
  PRIORITY_SPEAKER: 0x100,
  STREAM: 0x200,
  VIEW_CHANNEL: 0x400,
  SEND_MESSAGES: 0x800,
  SEND_TTS_MESSAGES: 0x1000,
  MANAGE_MESSAGES: 0x2000,
  EMBED_LINKS: 0x4000,
  ATTACH_FILES: 0x8000,
  READ_MESSAGE_HISTORY: 0x10000,
  MENTION_EVERYONE: 0x20000,
  USE_EXTERNAL_EMOJIS: 0x40000,
  VIEW_GUILD_INSIGHTS: 0x80000,
  CONNECT: 0x100000,
  SPEAK: 0x200000,
  MUTE_MEMBERS: 0x400000,
  DEAFEN_MEMBERS: 0x800000,
  MOVE_MEMBERS: 0x1000000,
  USE_VAD: 0x2000000,
  CHANGE_NICKNAME: 0x4000000,
  MANAGE_NICKNAMES: 0x8000000,
  MANAGE_ROLES: 0x10000000,
  MANAGE_WEBHOOKS: 0x20000000,
  MANAGE_EMOJIS_AND_STICKERS: 0x40000000,
  USE_APPLICATION_COMMANDS: 0x80000000,
  REQUEST_TO_SPEAK: 0x100000000,
  MANAGE_EVENTS: 0x200000000,
  MANAGE_THREADS: 0x400000000,
  CREATE_PUBLIC_THREADS: 0x800000000,
  CREATE_PRIVATE_THREADS: 0x1000000000,
  USE_EXTERNAL_STICKERS: 0x2000000000,
  SEND_MESSAGES_IN_THREADS: 0x4000000000,
  USE_EMBEDDED_ACTIVITIES: 0x8000000000,
  MODERATE_MEMBERS: 0x10000000000,
} as const;

/**
 * Check if a user has admin permissions in a guild
 */
function hasAdminPermission(permissions: string | number): boolean {
  try {
    const perms = typeof permissions === 'string' 
      ? BigInt(permissions) 
      : BigInt(permissions);
    return (perms & BigInt(DiscordPermissions.ADMINISTRATOR)) === BigInt(DiscordPermissions.ADMINISTRATOR);
  } catch (error) {
    console.error('Error parsing permissions:', error);
    return false;
  }
}

/**
 * Fetch user's guilds from Discord API
 */
async function fetchUserGuilds(accessToken: string): Promise<DiscordGuild[]> {
  try {
    const response = await fetch('https://discord.com/api/users/@me/guilds', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error(`Failed to fetch guilds: ${response.status} ${response.statusText}`);
      return [];
    }

    const guilds = await response.json() as DiscordGuild[];
    return guilds;
  } catch (error) {
    console.error('Error fetching user guilds:', error);
    return [];
  }
}

/**
 * Verify if user is admin in at least one guild
 */
async function verifyAdminStatus(accessToken: string): Promise<{ isAdmin: boolean; adminGuilds: string[] }> {
  try {
    const guilds = await fetchUserGuilds(accessToken);
    const adminGuilds = guilds
      .filter(guild => hasAdminPermission(guild.permissions))
      .map(guild => guild.id);
    
    return {
      isAdmin: adminGuilds.length > 0,
      adminGuilds,
    };
  } catch (error) {
    console.error('Error verifying admin status:', error);
    return { isAdmin: false, adminGuilds: [] };
  }
}

/**
 * NextAuth configuration with Discord OAuth2
 */
export const authOptions: NextAuthOptions = {
  debug: process.env['NODE_ENV'] === 'development',
  secret: process.env['NEXTAUTH_SECRET'],
  // Remove adapter temporarily to simplify auth flow
  // adapter: DrizzleAdapter(db),
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/login',
    error: '/login', // Error code passed in query string as ?error=
  },
  providers: [
    DiscordProvider({
      clientId: discordConfig.clientId,
      clientSecret: discordConfig.clientSecret,
      authorization: {
        params: {
          scope: 'identify email guilds',
          // Remove prompt: 'none' to ensure proper authorization
        },
      },
      profile(profile) {
        return {
          id: profile.id,
          name: profile.global_name || profile.username,
          email: profile.email,
          image: profile.avatar 
            ? `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png`
            : `https://cdn.discordapp.com/embed/avatars/${parseInt(profile.discriminator || '0') % 5}.png`,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }): Promise<boolean | string> {
      try {
        // Only check for Discord provider
        if (account?.provider !== 'discord') {
          return '/login?error=InvalidProvider';
        }

        // Verify access token exists
        if (!account.access_token) {
          console.error('No access token received from Discord');
          return '/login?error=NoAccessToken';
        }

        // Verify admin status
        const { isAdmin } = await verifyAdminStatus(account.access_token);
        
        if (!isAdmin) {
          console.warn(`User ${user.id} attempted to sign in without admin permissions`);
          return '/login?error=NoAdminPermission';
        }

        return true;
      } catch (error) {
        console.error('Error during sign in:', error);
        return '/login?error=SignInFailed';
      }
    },

    async jwt({ token, account, user, trigger }): Promise<ExtendedJWT> {
      // Initial sign in
      if (account && user) {
        const { isAdmin, adminGuilds } = await verifyAdminStatus(account.access_token || '');
        
        return {
          ...token,
          id: user.id,
          discordId: user.id,
          accessToken: account.access_token ?? undefined,
          refreshToken: account.refresh_token ?? undefined,
          tokenType: account.token_type ?? undefined,
          expiresAt: account.expires_at ?? undefined,
          isAdmin,
          guilds: adminGuilds,
        } as ExtendedJWT;
      }

      // Return existing token if not expired
      if (token['expiresAt'] && Date.now() < (token['expiresAt'] as number) * 1000) {
        return token as ExtendedJWT;
      }

      // Token refresh logic could go here if needed
      // For now, we'll re-verify admin status periodically
      if (trigger === 'update' && token['accessToken']) {
        const { isAdmin, adminGuilds } = await verifyAdminStatus(token['accessToken'] as string);
        return {
          ...token,
          isAdmin,
          guilds: adminGuilds,
        } as ExtendedJWT;
      }

      return token as ExtendedJWT;
    },

    async session({ session, token }): Promise<ExtendedSession> {
      const extendedSession: ExtendedSession = {
        ...session,
        user: {
          ...session.user,
          id: (token['id'] as string) || (token.sub as string),
          discordId: (token['discordId'] as string) || (token.sub as string),
          isAdmin: (token['isAdmin'] as boolean) || false,
          guilds: (token['guilds'] as string[]) || [],
        },
        accessToken: token['accessToken'] as string,
      };

      // Re-verify admin status on session creation
      if (token['accessToken'] && typeof token['accessToken'] === 'string') {
        const { isAdmin, adminGuilds } = await verifyAdminStatus(token['accessToken'] as string);
        extendedSession.user.isAdmin = isAdmin;
        extendedSession.user.guilds = adminGuilds;
        
        if (!isAdmin) {
          extendedSession.error = 'NoAdminPermission';
        }
      }

      return extendedSession;
    },

    async redirect({ url, baseUrl }) {
      // Allow relative callbacks
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      
      // Allow callbacks to the same origin
      if (new URL(url).origin === baseUrl) return url;
      
      // Default redirect to dashboard after sign in
      return `${baseUrl}/dashboard`;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
    signOut: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  // Use default cookie configuration for development
  cookies: env.NODE_ENV === 'production' ? {
    sessionToken: {
      name: `__Secure-next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: true,
      },
    },
    callbackUrl: {
      name: `__Secure-next-auth.callback-url`,
      options: {
        sameSite: 'lax',
        path: '/',
        secure: true,
      },
    },
    csrfToken: {
      name: `__Host-next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: true,
      },
    },
  } : undefined, // Use NextAuth defaults in development
  secret: nextAuthConfig.secret,
  debug: env.NODE_ENV === 'development',
};

/**
 * Get the current session with admin verification
 */
export async function getAuthSession(): Promise<ExtendedSession | null> {
  try {
    const session = await getServerSession(authOptions) as ExtendedSession | null;
    
    if (!session?.user?.isAdmin) {
      return null;
    }
    
    return session;
  } catch (error) {
    console.error('Error getting auth session:', error);
    return null;
  }
}

/**
 * Middleware to verify authenticated admin user
 */
export async function requireAuth(): Promise<ExtendedSession> {
  const session = await getAuthSession();
  
  if (!session) {
    throw new Error('Unauthorized: No valid session');
  }
  
  if (!session.user.isAdmin) {
    throw new Error('Forbidden: Admin access required');
  }
  
  return session;
}

/**
 * Check if user has admin permissions in a specific guild
 */
export async function hasGuildAdminPermission(
  guildId: string, 
  session?: ExtendedSession | null
): Promise<boolean> {
  try {
    const authSession = session || await getAuthSession();
    
    if (!authSession?.user?.isAdmin || !authSession.accessToken) {
      return false;
    }
    
    // Check cached guild permissions first
    if (authSession.user.guilds?.includes(guildId)) {
      return true;
    }
    
    // Fetch fresh guild data to verify
    const guilds = await fetchUserGuilds(authSession.accessToken);
    const guild = guilds.find(g => g.id === guildId);
    
    if (!guild) {
      return false;
    }
    
    return hasAdminPermission(guild.permissions);
  } catch (error) {
    console.error(`Error checking guild admin permission for ${guildId}:`, error);
    return false;
  }
}

/**
 * Get user's admin guilds with bot membership status
 */
export async function getAdminGuildsWithBotStatus(
  session?: ExtendedSession | null
): Promise<Array<{ guild: DiscordGuild; hasBot: boolean }>> {
  try {
    const authSession = session || await getAuthSession();
    
    if (!authSession?.accessToken) {
      return [];
    }
    
    const guilds = await fetchUserGuilds(authSession.accessToken);
    const adminGuilds = guilds.filter(guild => hasAdminPermission(guild.permissions));
    
    // Check bot membership for each guild
    const guildsWithBotStatus = await Promise.all(
      adminGuilds.map(async (guild) => {
        try {
          // Call bot API to check if bot is in guild
          const response = await fetch(`${env.API_URL}/guilds/${guild.id}/status`, {
            headers: {
              Authorization: `Bearer ${env.BOT_API_TOKEN}`,
            },
          });
          
          const hasBot = response.ok;
          return { guild, hasBot };
        } catch {
          return { guild, hasBot: false };
        }
      })
    );
    
    return guildsWithBotStatus;
  } catch (error) {
    console.error('Error fetching admin guilds with bot status:', error);
    return [];
  }
}

/**
 * Generate Discord bot invite URL for a specific guild
 */
export function getBotInviteUrl(guildId?: string): string {
  const baseUrl = `https://discord.com/oauth2/authorize`;
  const params = new URLSearchParams({
    client_id: discordConfig.clientId,
    permissions: '8', // Administrator permission
    scope: 'bot applications.commands',
  });
  
  if (guildId) {
    params.append('guild_id', guildId);
    params.append('disable_guild_select', 'true');
  }
  
  return `${baseUrl}?${params.toString()}`;
}

/**
 * CSRF token validation
 */
export async function validateCSRFToken(token: string): Promise<boolean> {
  try {
    const cookieStore = cookies();
    const csrfCookie = cookieStore.get('__Host-next-auth.csrf-token');
    
    if (!csrfCookie?.value) {
      return false;
    }
    
    const [cookieToken] = csrfCookie.value.split('|');
    return token === cookieToken;
  } catch (error) {
    console.error('CSRF validation error:', error);
    return false;
  }
}

/**
 * Sign out and clear session
 */
export async function signOutUser(): Promise<void> {
  try {
    const cookieStore = cookies();
    
    // Clear all auth cookies
    cookieStore.delete('__Secure-next-auth.session-token');
    cookieStore.delete('__Secure-next-auth.callback-url');
    cookieStore.delete('__Host-next-auth.csrf-token');
  } catch (error) {
    console.error('Error during sign out:', error);
  }
}

export default NextAuth(authOptions);