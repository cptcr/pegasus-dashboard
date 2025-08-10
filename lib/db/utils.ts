/**
 * Database Utility Functions
 * Common database operations and helpers
 */

import { eq, and, or, desc, asc, sql, gte, lte, like, inArray, isNull, isNotNull } from 'drizzle-orm';
import { db, withTransaction } from '../database';
import * as schema from './schema';

/**
 * Get user by Discord ID with error handling
 */
export async function getUserById(userId: string) {
  try {
    const user = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, userId))
      .limit(1);
    
    return user[0] || null;
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
}

/**
 * Get guild by Discord ID with settings
 */
export async function getGuildWithSettings(guildId: string) {
  try {
    const result = await db
      .select({
        guild: schema.guilds,
        settings: schema.guildSettings,
      })
      .from(schema.guilds)
      .leftJoin(schema.guildSettings, eq(schema.guilds.id, schema.guildSettings.guildId))
      .where(eq(schema.guilds.id, guildId))
      .limit(1);
    
    return result[0] || null;
  } catch (error) {
    console.error('Error fetching guild with settings:', error);
    return null;
  }
}

/**
 * Get member with user data
 */
export async function getMemberWithUser(guildId: string, userId: string) {
  try {
    const result = await db
      .select({
        member: schema.members,
        user: schema.users,
      })
      .from(schema.members)
      .innerJoin(schema.users, eq(schema.members.userId, schema.users.id))
      .where(
        and(
          eq(schema.members.guildId, guildId),
          eq(schema.members.userId, userId)
        )
      )
      .limit(1);
    
    return result[0] || null;
  } catch (error) {
    console.error('Error fetching member with user:', error);
    return null;
  }
}

/**
 * Upsert user (create or update)
 */
export async function upsertUser(userData: schema.NewUser) {
  try {
    const result = await db
      .insert(schema.users)
      .values(userData)
      .onConflictDoUpdate({
        target: schema.users.id,
        set: {
          username: userData.username,
          discriminator: userData.discriminator,
          globalName: userData.globalName,
          avatar: userData.avatar,
          avatarUrl: userData.avatarUrl,
          updatedAt: new Date(),
        },
      })
      .returning();
    
    return result[0];
  } catch (error) {
    console.error('Error upserting user:', error);
    throw error;
  }
}

/**
 * Upsert guild (create or update)
 */
export async function upsertGuild(guildData: schema.NewGuild) {
  try {
    const result = await db
      .insert(schema.guilds)
      .values(guildData)
      .onConflictDoUpdate({
        target: schema.guilds.id,
        set: {
          prefix: guildData.prefix,
          language: guildData.language,
          updatedAt: new Date(),
        },
      })
      .returning();
    
    return result[0];
  } catch (error) {
    console.error('Error upserting guild:', error);
    throw error;
  }
}

/**
 * Get economy balance with transaction
 */
export async function getEconomyBalance(guildId: string, userId: string) {
  try {
    const result = await db
      .select()
      .from(schema.economyBalances)
      .where(
        and(
          eq(schema.economyBalances.guildId, guildId),
          eq(schema.economyBalances.userId, userId)
        )
      )
      .limit(1);
    
    return result[0] || null;
  } catch (error) {
    console.error('Error fetching economy balance:', error);
    return null;
  }
}

/**
 * Update economy balance with transaction support
 */
export async function updateEconomyBalance(
  guildId: string,
  userId: string,
  amount: number,
  type: schema.EconomyTransactionType,
  description?: string
) {
  return withTransaction(async (tx) => {
    // Get current balance or create new one
    const currentBalance = await tx
      .select()
      .from(schema.economyBalances)
      .where(
        and(
          eq(schema.economyBalances.guildId, guildId),
          eq(schema.economyBalances.userId, userId)
        )
      )
      .limit(1);

    let newBalance: number;
    
    if (currentBalance[0]) {
      // Update existing balance
      newBalance = currentBalance[0].balance + amount;
      
      await tx
        .update(schema.economyBalances)
        .set({
          balance: newBalance,
          totalEarned: amount > 0 ? currentBalance[0].totalEarned + amount : currentBalance[0].totalEarned,
          totalSpent: amount < 0 ? currentBalance[0].totalSpent + Math.abs(amount) : currentBalance[0].totalSpent,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(schema.economyBalances.guildId, guildId),
            eq(schema.economyBalances.userId, userId)
          )
        );
    } else {
      // Create new balance
      newBalance = amount;
      
      await tx.insert(schema.economyBalances).values({
        guildId,
        userId,
        balance: newBalance,
        bankBalance: 0,
        totalEarned: amount > 0 ? amount : 0,
        totalSpent: amount < 0 ? Math.abs(amount) : 0,
        totalGambled: 0,
      });
    }

    // Record transaction
    await tx.insert(schema.economyTransactions).values({
      userId,
      guildId,
      type,
      amount,
      description,
    });

    return newBalance;
  });
}

/**
 * Get active warnings for a user in a guild
 */
export async function getActiveWarnings(guildId: string, userId: string) {
  try {
    const warnings = await db
      .select()
      .from(schema.warnings)
      .where(
        and(
          eq(schema.warnings.guildId, guildId),
          eq(schema.warnings.userId, userId),
          eq(schema.warnings.active, true)
        )
      )
      .orderBy(desc(schema.warnings.createdAt));
    
    return warnings;
  } catch (error) {
    console.error('Error fetching active warnings:', error);
    return [];
  }
}

/**
 * Get XP leaderboard for a guild
 */
export async function getXpLeaderboard(guildId: string, limit = 10) {
  try {
    const leaderboard = await db
      .select({
        user: schema.users,
        xp: schema.userXp.xp,
        level: schema.userXp.level,
      })
      .from(schema.userXp)
      .innerJoin(schema.users, eq(schema.userXp.userId, schema.users.id))
      .where(eq(schema.userXp.guildId, guildId))
      .orderBy(desc(schema.userXp.xp))
      .limit(limit);
    
    return leaderboard;
  } catch (error) {
    console.error('Error fetching XP leaderboard:', error);
    return [];
  }
}

/**
 * Get economy leaderboard for a guild
 */
export async function getEconomyLeaderboard(guildId: string, limit = 10) {
  try {
    const leaderboard = await db
      .select({
        user: schema.users,
        balance: schema.economyBalances.balance,
        bankBalance: schema.economyBalances.bankBalance,
        totalEarned: schema.economyBalances.totalEarned,
      })
      .from(schema.economyBalances)
      .innerJoin(schema.users, eq(schema.economyBalances.userId, schema.users.id))
      .where(eq(schema.economyBalances.guildId, guildId))
      .orderBy(desc(sql`${schema.economyBalances.balance} + ${schema.economyBalances.bankBalance}`))
      .limit(limit);
    
    return leaderboard;
  } catch (error) {
    console.error('Error fetching economy leaderboard:', error);
    return [];
  }
}

/**
 * Get active giveaways for a guild
 */
export async function getActiveGiveaways(guildId: string) {
  try {
    const giveaways = await db
      .select()
      .from(schema.giveaways)
      .where(
        and(
          eq(schema.giveaways.guildId, guildId),
          eq(schema.giveaways.status, 'active')
        )
      )
      .orderBy(asc(schema.giveaways.endTime));
    
    return giveaways;
  } catch (error) {
    console.error('Error fetching active giveaways:', error);
    return [];
  }
}

/**
 * Get open tickets for a user
 */
export async function getUserOpenTickets(guildId: string, userId: string) {
  try {
    const tickets = await db
      .select()
      .from(schema.tickets)
      .where(
        and(
          eq(schema.tickets.guildId, guildId),
          eq(schema.tickets.userId, userId),
          inArray(schema.tickets.status, ['open', 'claimed'])
        )
      )
      .orderBy(desc(schema.tickets.createdAt));
    
    return tickets;
  } catch (error) {
    console.error('Error fetching user open tickets:', error);
    return [];
  }
}

/**
 * Log audit event
 */
export async function logAuditEvent(
  action: string,
  userId: string,
  guildId: string,
  details?: any,
  targetId?: string,
  targetType?: string
) {
  try {
    await db.insert(schema.auditLogs).values({
      action,
      userId,
      guildId,
      targetId,
      targetType,
      details,
    });
  } catch (error) {
    console.error('Error logging audit event:', error);
  }
}

/**
 * Log security event
 */
export async function logSecurityEvent(
  guildId: string,
  action: string,
  severity: schema.SecuritySeverity,
  description: string,
  userId?: string,
  metadata?: any
) {
  try {
    await db.insert(schema.securityLogs).values({
      guildId,
      userId,
      action,
      severity,
      description,
      metadata,
    });
  } catch (error) {
    console.error('Error logging security event:', error);
  }
}

/**
 * Check if user is blacklisted
 */
export async function isUserBlacklisted(userId: string) {
  try {
    const blacklist = await db
      .select()
      .from(schema.blacklist)
      .where(
        and(
          eq(schema.blacklist.entityType, 'user'),
          eq(schema.blacklist.entityId, userId),
          eq(schema.blacklist.active, true)
        )
      )
      .limit(1);
    
    return blacklist.length > 0;
  } catch (error) {
    console.error('Error checking user blacklist:', error);
    return false;
  }
}

/**
 * Batch operations helper
 */
export async function batchInsert<T>(
  table: any,
  data: T[],
  batchSize = 1000
): Promise<void> {
  for (let i = 0; i < data.length; i += batchSize) {
    const batch = data.slice(i, i + batchSize);
    await db.insert(table).values(batch);
  }
}

// Export all utilities
export default {
  getUserById,
  getGuildWithSettings,
  getMemberWithUser,
  upsertUser,
  upsertGuild,
  getEconomyBalance,
  updateEconomyBalance,
  getActiveWarnings,
  getXpLeaderboard,
  getEconomyLeaderboard,
  getActiveGiveaways,
  getUserOpenTickets,
  logAuditEvent,
  logSecurityEvent,
  isUserBlacklisted,
  batchInsert,
};