/**
 * Database Migration Utilities
 * Handles database migrations and schema initialization
 */

import { sql } from 'drizzle-orm';
import { db } from '../database';

/**
 * Initialize database with required extensions
 */
export async function initializeDatabase() {
  try {
    // Enable required PostgreSQL extensions
    await db.execute(sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
    await db.execute(sql`CREATE EXTENSION IF NOT EXISTS "pg_trgm"`); // For fuzzy text search
    
    console.log('Database extensions initialized successfully');
    return { success: true };
  } catch (error) {
    console.error('Failed to initialize database extensions:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Create indexes for better query performance
 */
export async function createIndexes() {
  try {
    // Create composite indexes for frequently queried combinations
    const indexQueries = [
      // User-Guild combinations
      sql`CREATE INDEX IF NOT EXISTS idx_members_guild_xp ON members(guild_id, xp DESC)`,
      sql`CREATE INDEX IF NOT EXISTS idx_user_xp_guild_level ON user_xp(guild_id, level DESC)`,
      
      // Economy queries
      sql`CREATE INDEX IF NOT EXISTS idx_economy_balances_guild_balance ON economy_balances(guild_id, balance DESC)`,
      sql`CREATE INDEX IF NOT EXISTS idx_economy_transactions_user_created ON economy_transactions(user_id, created_at DESC)`,
      
      // Moderation queries
      sql`CREATE INDEX IF NOT EXISTS idx_warnings_guild_active ON warnings(guild_id, active)`,
      sql`CREATE INDEX IF NOT EXISTS idx_mod_cases_guild_created ON mod_cases(guild_id, created_at DESC)`,
      
      // Ticket queries
      sql`CREATE INDEX IF NOT EXISTS idx_tickets_guild_status ON tickets(guild_id, status)`,
      sql`CREATE INDEX IF NOT EXISTS idx_tickets_user_status ON tickets(user_id, status)`,
      
      // Security queries
      sql`CREATE INDEX IF NOT EXISTS idx_security_logs_guild_created ON security_logs(guild_id, created_at DESC)`,
      sql`CREATE INDEX IF NOT EXISTS idx_audit_logs_guild_action ON audit_logs(guild_id, action)`,
      
      // Giveaway queries
      sql`CREATE INDEX IF NOT EXISTS idx_giveaways_guild_status ON giveaways(guild_id, status)`,
      sql`CREATE INDEX IF NOT EXISTS idx_giveaways_end_time ON giveaways(end_time)`,
    ];

    for (const query of indexQueries) {
      await db.execute(query);
    }

    console.log('Database indexes created successfully');
    return { success: true };
  } catch (error) {
    console.error('Failed to create database indexes:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Create database functions and triggers
 */
export async function createFunctions() {
  try {
    // Function to automatically update updated_at timestamp
    await db.execute(sql`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);

    // Apply update trigger to tables with updated_at column
    const tablesWithUpdatedAt = [
      'users',
      'guilds',
      'guild_settings',
      'members',
      'economy_balances',
      'economy_shop_items',
      'economy_settings',
      'xp_settings',
      'user_xp',
      'ticket_panels',
      'tickets',
      'giveaways',
      'giveaway_entries',
      'blacklist',
      'rate_limit_violations',
      'security_incidents',
      'api_keys',
    ];

    for (const table of tablesWithUpdatedAt) {
      await db.execute(sql`
        DROP TRIGGER IF EXISTS update_${sql.raw(table)}_updated_at ON ${sql.raw(table)};
        CREATE TRIGGER update_${sql.raw(table)}_updated_at
        BEFORE UPDATE ON ${sql.raw(table)}
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
      `);
    }

    console.log('Database functions and triggers created successfully');
    return { success: true };
  } catch (error) {
    console.error('Failed to create database functions:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Seed initial data for development
 */
export async function seedDatabase() {
  try {
    // Only seed in development environment
    if (process.env.NODE_ENV !== 'development') {
      console.log('Skipping database seeding in production');
      return { success: true };
    }

    // Add any initial seed data here if needed
    console.log('Database seeded successfully');
    return { success: true };
  } catch (error) {
    console.error('Failed to seed database:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Run all database setup tasks
 */
export async function setupDatabase() {
  console.log('Starting database setup...');
  
  const steps = [
    { name: 'Initialize Extensions', fn: initializeDatabase },
    { name: 'Create Indexes', fn: createIndexes },
    { name: 'Create Functions', fn: createFunctions },
    { name: 'Seed Database', fn: seedDatabase },
  ];

  for (const step of steps) {
    console.log(`Running: ${step.name}...`);
    const result = await step.fn();
    
    if (!result.success) {
      console.error(`Failed at step: ${step.name}`);
      return result;
    }
  }

  console.log('Database setup completed successfully');
  return { success: true };
}

/**
 * Check if migrations are needed
 */
export async function checkMigrationStatus() {
  try {
    // Check if the drizzle migrations table exists
    const result = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = '__drizzle_migrations'
      );
    `);

    return result.rows[0]?.exists ?? false;
  } catch (error) {
    console.error('Failed to check migration status:', error);
    return false;
  }
}

/**
 * Get database statistics
 */
export async function getDatabaseStats() {
  try {
    const stats = await db.execute(sql`
      SELECT 
        (SELECT COUNT(*) FROM users) as total_users,
        (SELECT COUNT(*) FROM guilds) as total_guilds,
        (SELECT COUNT(*) FROM tickets WHERE status = 'open') as open_tickets,
        (SELECT COUNT(*) FROM giveaways WHERE status = 'active') as active_giveaways,
        (SELECT COUNT(*) FROM economy_transactions WHERE created_at > NOW() - INTERVAL '24 hours') as recent_transactions,
        (SELECT pg_database_size(current_database())) as database_size;
    `);

    return {
      success: true,
      data: stats.rows[0] || {},
    };
  } catch (error) {
    console.error('Failed to get database stats:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export default {
  initializeDatabase,
  createIndexes,
  createFunctions,
  seedDatabase,
  setupDatabase,
  checkMigrationStatus,
  getDatabaseStats,
};