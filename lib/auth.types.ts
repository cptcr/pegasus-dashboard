/**
 * Type definitions for authentication and Discord integration
 */

import type { Session } from "next-auth";
import type { JWT } from "next-auth/jwt";

/**
 * Discord User object from the Discord API
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

/**
 * Discord Guild object from the Discord API
 */
export interface DiscordGuild {
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
export interface ExtendedJWT extends JWT {
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
export interface ExtendedSession extends Session {
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
 * Guild with bot membership status
 */
export interface GuildWithBotStatus {
  guild: DiscordGuild;
  hasBot: boolean;
}

/**
 * Authentication error types
 */
export type AuthError = 
  | 'InvalidProvider'
  | 'NoAccessToken'
  | 'NoAdminPermission'
  | 'SignInFailed'
  | 'SessionExpired'
  | 'Unauthorized'
  | 'Forbidden';

/**
 * Discord permission flags as constants
 */
export const DiscordPermissions = {
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
 * Helper type for Discord permission names
 */
export type DiscordPermissionName = keyof typeof DiscordPermissions;