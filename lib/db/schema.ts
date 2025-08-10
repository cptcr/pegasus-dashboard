/**
 * Comprehensive Database Schema
 * This file exports all database schemas and types for the Discord bot dashboard
 */

// Re-export all schemas from individual files
export * from './auth';
export * from './users';
export * from './guilds';
export * from './members';
export * from './moderation';
export * from './economy';
export * from './xp';
export * from './tickets';
export * from './giveaways';
export * from './security';

// Import types for comprehensive type exports
import type { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import * as authSchema from './auth';
import * as usersSchema from './users';
import * as guildsSchema from './guilds';
import * as membersSchema from './members';
import * as moderationSchema from './moderation';
import * as economySchema from './economy';
import * as xpSchema from './xp';
import * as ticketsSchema from './tickets';
import * as giveawaysSchema from './giveaways';
import * as securitySchema from './security';

// Authentication Types
export type Account = InferSelectModel<typeof authSchema.accounts>;
export type NewAccount = InferInsertModel<typeof authSchema.accounts>;
export type Session = InferSelectModel<typeof authSchema.sessions>;
export type NewSession = InferInsertModel<typeof authSchema.sessions>;
export type VerificationToken = InferSelectModel<typeof authSchema.verificationTokens>;
export type NewVerificationToken = InferInsertModel<typeof authSchema.verificationTokens>;

// User Types
export type User = InferSelectModel<typeof usersSchema.users>;
export type NewUser = InferInsertModel<typeof usersSchema.users>;

// Guild Types
export type Guild = InferSelectModel<typeof guildsSchema.guilds>;
export type NewGuild = InferInsertModel<typeof guildsSchema.guilds>;
export type GuildSettings = InferSelectModel<typeof guildsSchema.guildSettings>;
export type NewGuildSettings = InferInsertModel<typeof guildsSchema.guildSettings>;

// Member Types
export type Member = InferSelectModel<typeof membersSchema.members>;
export type NewMember = InferInsertModel<typeof membersSchema.members>;

// Moderation Types
export type ModCase = InferSelectModel<typeof moderationSchema.modCases>;
export type NewModCase = InferInsertModel<typeof moderationSchema.modCases>;
export type Warning = InferSelectModel<typeof moderationSchema.warnings>;
export type NewWarning = InferInsertModel<typeof moderationSchema.warnings>;
export type WarningAutomation = InferSelectModel<typeof moderationSchema.warningAutomations>;
export type NewWarningAutomation = InferInsertModel<typeof moderationSchema.warningAutomations>;

// XP System Types
export type UserXp = InferSelectModel<typeof xpSchema.userXp>;
export type NewUserXp = InferInsertModel<typeof xpSchema.userXp>;
export type XpReward = InferSelectModel<typeof xpSchema.xpRewards>;
export type NewXpReward = InferInsertModel<typeof xpSchema.xpRewards>;
export type XpMultiplier = InferSelectModel<typeof xpSchema.xpMultipliers>;
export type NewXpMultiplier = InferInsertModel<typeof xpSchema.xpMultipliers>;
export type XpSettings = InferSelectModel<typeof xpSchema.xpSettings>;
export type NewXpSettings = InferInsertModel<typeof xpSchema.xpSettings>;

// Ticket Types
export type TicketPanel = InferSelectModel<typeof ticketsSchema.ticketPanels>;
export type NewTicketPanel = InferInsertModel<typeof ticketsSchema.ticketPanels>;
export type Ticket = InferSelectModel<typeof ticketsSchema.tickets>;
export type NewTicket = InferInsertModel<typeof ticketsSchema.tickets>;
export type TicketMessage = InferSelectModel<typeof ticketsSchema.ticketMessages>;
export type NewTicketMessage = InferInsertModel<typeof ticketsSchema.ticketMessages>;

// Giveaway Types
export type Giveaway = InferSelectModel<typeof giveawaysSchema.giveaways>;
export type NewGiveaway = InferInsertModel<typeof giveawaysSchema.giveaways>;
export type GiveawayEntry = InferSelectModel<typeof giveawaysSchema.giveawayEntries>;
export type NewGiveawayEntry = InferInsertModel<typeof giveawaysSchema.giveawayEntries>;

// Security Types
export type SecurityLog = InferSelectModel<typeof securitySchema.securityLogs>;
export type NewSecurityLog = InferInsertModel<typeof securitySchema.securityLogs>;
export type Blacklist = InferSelectModel<typeof securitySchema.blacklist>;
export type NewBlacklist = InferInsertModel<typeof securitySchema.blacklist>;
export type AuditLog = InferSelectModel<typeof securitySchema.auditLogs>;
export type NewAuditLog = InferInsertModel<typeof securitySchema.auditLogs>;
export type RateLimitViolation = InferSelectModel<typeof securitySchema.rateLimitViolations>;
export type NewRateLimitViolation = InferInsertModel<typeof securitySchema.rateLimitViolations>;
export type SecurityIncident = InferSelectModel<typeof securitySchema.securityIncidents>;
export type NewSecurityIncident = InferInsertModel<typeof securitySchema.securityIncidents>;
export type ApiKey = InferSelectModel<typeof securitySchema.apiKeys>;
export type NewApiKey = InferInsertModel<typeof securitySchema.apiKeys>;

// Enum Types for better type safety
export enum ModActionType {
  WARN = 'warn',
  MUTE = 'mute',
  KICK = 'kick',
  BAN = 'ban',
  UNBAN = 'unban',
  TIMEOUT = 'timeout',
  UNTIMEOUT = 'untimeout',
}

export enum TicketStatus {
  OPEN = 'open',
  CLAIMED = 'claimed',
  CLOSED = 'closed',
  LOCKED = 'locked',
  FROZEN = 'frozen',
}

export enum GiveawayStatus {
  ACTIVE = 'active',
  ENDED = 'ended',
  CANCELLED = 'cancelled',
}

export enum SecuritySeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum SecurityIncidentStatus {
  OPEN = 'open',
  INVESTIGATING = 'investigating',
  RESOLVED = 'resolved',
  FALSE_POSITIVE = 'false_positive',
}

export enum EconomyTransactionType {
  DAILY = 'daily',
  WORK = 'work',
  GAMBLE = 'gamble',
  ROB = 'rob',
  SHOP = 'shop',
  TRANSFER = 'transfer',
  ADMIN = 'admin',
}

export enum EconomyShopItemType {
  PROTECTION = 'protection',
  BOOSTER = 'booster',
  ROLE = 'role',
  CUSTOM = 'custom',
}

export enum BlacklistEntityType {
  USER = 'user',
  GUILD = 'guild',
  ROLE = 'role',
}

// Helper type for database operations with proper error handling
export type DatabaseResult<T> = 
  | { success: true; data: T }
  | { success: false; error: string };

// Validation schemas using Zod (if needed)
export { z } from 'zod';

// Common validation patterns
export const DISCORD_ID_REGEX = /^\d{17,20}$/;
export const HEX_COLOR_REGEX = /^#[0-9A-Fa-f]{6}$/;

// Helper function to validate Discord IDs
export function isValidDiscordId(id: string): boolean {
  return DISCORD_ID_REGEX.test(id);
}

// Helper function to validate hex colors
export function isValidHexColor(color: string): boolean {
  return HEX_COLOR_REGEX.test(color);
}

// Transaction helpers
export type TransactionCallback<T> = (tx: any) => Promise<T>;

// Export everything as a namespace for convenience
export * as Schema from './schema';