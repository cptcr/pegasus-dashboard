// Database type exports from Drizzle schemas
import type { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import * as schema from '@/lib/db/schemas';

// Guild types
export type Guild = InferSelectModel<typeof schema.guilds>;
export type InsertGuild = InferInsertModel<typeof schema.guilds>;
export type GuildSettings = InferSelectModel<typeof schema.guildSettings>;
export type InsertGuildSettings = InferInsertModel<typeof schema.guildSettings>;

// User types
export type User = InferSelectModel<typeof schema.users>;
export type InsertUser = InferInsertModel<typeof schema.users>;
export type Member = InferSelectModel<typeof schema.members>;
export type InsertMember = InferInsertModel<typeof schema.members>;

// Moderation types
export type ModCase = InferSelectModel<typeof schema.modCases>;
export type InsertModCase = InferInsertModel<typeof schema.modCases>;
export type Warning = InferSelectModel<typeof schema.warnings>;
export type InsertWarning = InferInsertModel<typeof schema.warnings>;
export type WarningAutomation = InferSelectModel<typeof schema.warningAutomations>;
export type InsertWarningAutomation = InferInsertModel<typeof schema.warningAutomations>;

// Economy types
export type EconomyBalance = InferSelectModel<typeof schema.economyBalances>;
export type InsertEconomyBalance = InferInsertModel<typeof schema.economyBalances>;
export type EconomyTransaction = InferSelectModel<typeof schema.economyTransactions>;
export type InsertEconomyTransaction = InferInsertModel<typeof schema.economyTransactions>;
export type EconomyShopItem = InferSelectModel<typeof schema.economyShopItems>;
export type InsertEconomyShopItem = InferInsertModel<typeof schema.economyShopItems>;
export type EconomyUserItem = InferSelectModel<typeof schema.economyUserItems>;
export type InsertEconomyUserItem = InferInsertModel<typeof schema.economyUserItems>;
export type EconomyCooldown = InferSelectModel<typeof schema.economyCooldowns>;
export type InsertEconomyCooldown = InferInsertModel<typeof schema.economyCooldowns>;
export type EconomyGamblingStats = InferSelectModel<typeof schema.economyGamblingStats>;
export type InsertEconomyGamblingStats = InferInsertModel<typeof schema.economyGamblingStats>;
export type EconomySettings = InferSelectModel<typeof schema.economySettings>;
export type InsertEconomySettings = InferInsertModel<typeof schema.economySettings>;

// XP types
export type UserXp = InferSelectModel<typeof schema.userXp>;
export type InsertUserXp = InferInsertModel<typeof schema.userXp>;
export type XpReward = InferSelectModel<typeof schema.xpRewards>;
export type InsertXpReward = InferInsertModel<typeof schema.xpRewards>;
export type XpMultiplier = InferSelectModel<typeof schema.xpMultipliers>;
export type InsertXpMultiplier = InferInsertModel<typeof schema.xpMultipliers>;
export type XpSettings = InferSelectModel<typeof schema.xpSettings>;
export type InsertXpSettings = InferInsertModel<typeof schema.xpSettings>;

// Ticket types
export type TicketPanel = InferSelectModel<typeof schema.ticketPanels>;
export type InsertTicketPanel = InferInsertModel<typeof schema.ticketPanels>;
export type Ticket = InferSelectModel<typeof schema.tickets>;
export type InsertTicket = InferInsertModel<typeof schema.tickets>;
export type TicketMessage = InferSelectModel<typeof schema.ticketMessages>;
export type InsertTicketMessage = InferInsertModel<typeof schema.ticketMessages>;

// Giveaway types
export type Giveaway = InferSelectModel<typeof schema.giveaways>;
export type InsertGiveaway = InferInsertModel<typeof schema.giveaways>;
export type GiveawayEntry = InferSelectModel<typeof schema.giveawayEntries>;
export type InsertGiveawayEntry = InferInsertModel<typeof schema.giveawayEntries>;

// Security types
export type SecurityLog = InferSelectModel<typeof schema.securityLogs>;
export type InsertSecurityLog = InferInsertModel<typeof schema.securityLogs>;
export type Blacklist = InferSelectModel<typeof schema.blacklist>;
export type InsertBlacklist = InferInsertModel<typeof schema.blacklist>;
export type AuditLog = InferSelectModel<typeof schema.auditLogs>;
export type InsertAuditLog = InferInsertModel<typeof schema.auditLogs>;
export type RateLimitViolation = InferSelectModel<typeof schema.rateLimitViolations>;
export type InsertRateLimitViolation = InferInsertModel<typeof schema.rateLimitViolations>;
export type SecurityIncident = InferSelectModel<typeof schema.securityIncidents>;
export type InsertSecurityIncident = InferInsertModel<typeof schema.securityIncidents>;
export type ApiKey = InferSelectModel<typeof schema.apiKeys>;
export type InsertApiKey = InferInsertModel<typeof schema.apiKeys>;

// Enums and constants
export const ModCaseTypes = ['warn', 'mute', 'kick', 'ban', 'timeout', 'unban'] as const;
export type ModCaseType = typeof ModCaseTypes[number];

export const TicketStatuses = ['open', 'claimed', 'closed', 'locked', 'frozen'] as const;
export type TicketStatus = typeof TicketStatuses[number];

export const ShopItemTypes = ['role', 'item', 'boost', 'custom'] as const;
export type ShopItemType = typeof ShopItemTypes[number];

export const ShopItemEffects = ['none', 'xp_boost', 'work_boost', 'rob_protection', 'luck_boost', 'daily_boost', 'bank_access'] as const;
export type ShopItemEffect = typeof ShopItemEffects[number];

export const SecurityEventTypes = ['suspicious_activity', 'rate_limit', 'permission_escalation', 'mass_action', 'configuration_change', 'security_breach', 'api_abuse'] as const;
export type SecurityEventType = typeof SecurityEventTypes[number];

export const SecuritySeverities = ['low', 'medium', 'high', 'critical'] as const;
export type SecuritySeverity = typeof SecuritySeverities[number];

export const BlacklistEntityTypes = ['user', 'guild', 'role', 'channel'] as const;
export type BlacklistEntityType = typeof BlacklistEntityTypes[number];