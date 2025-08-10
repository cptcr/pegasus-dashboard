#!/usr/bin/env tsx
/**
 * Database Initialization Script
 * Run this script to initialize the database with all required tables and indexes
 * Usage: npm run db:init
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import { checkDatabaseHealth, closeDatabaseConnection, runMigrations } from '../lib/database';
import { setupDatabase, checkMigrationStatus } from '../lib/db/migrations';

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') });

async function initDatabase() {
  console.log('🚀 Starting database initialization...\n');

  try {
    // Step 1: Check database connection
    console.log('📡 Checking database connection...');
    const healthCheck = await checkDatabaseHealth();
    
    if (!healthCheck.healthy) {
      throw new Error(`Database connection failed: ${healthCheck.message}`);
    }
    
    console.log('✅ Database connection successful');
    console.log(`   Connection details:`, healthCheck.details);
    console.log('');

    // Step 2: Check migration status
    console.log('🔍 Checking migration status...');
    const hasMigrations = await checkMigrationStatus();
    
    if (!hasMigrations) {
      console.log('📦 No existing migrations found. Running initial setup...\n');
      
      // Step 3: Run Drizzle migrations
      console.log('🔄 Running database migrations...');
      await runMigrations();
      console.log('✅ Migrations completed successfully\n');
    } else {
      console.log('✅ Migrations table exists. Checking for pending migrations...');
      await runMigrations();
      console.log('✅ All migrations are up to date\n');
    }

    // Step 4: Setup database (extensions, indexes, functions)
    console.log('🛠️  Setting up database extensions, indexes, and functions...');
    const setupResult = await setupDatabase();
    
    if (!setupResult.success) {
      throw new Error('Database setup failed');
    }
    
    console.log('✅ Database setup completed successfully\n');

    // Step 5: Final health check
    console.log('🏁 Running final health check...');
    const finalCheck = await checkDatabaseHealth();
    
    if (!finalCheck.healthy) {
      throw new Error('Final health check failed');
    }
    
    console.log('✅ Database is healthy and ready to use!\n');
    console.log('🎉 Database initialization completed successfully!');
    
    // Success summary
    console.log('\n📊 Summary:');
    console.log('   - Database connection: ✅');
    console.log('   - Migrations: ✅');
    console.log('   - Extensions: ✅');
    console.log('   - Indexes: ✅');
    console.log('   - Functions: ✅');
    console.log('   - Health check: ✅');
    
  } catch (error) {
    console.error('\n❌ Database initialization failed:');
    console.error(error instanceof Error ? error.message : error);
    console.error('\nPlease check your database configuration and try again.');
    process.exit(1);
  } finally {
    // Close database connection
    await closeDatabaseConnection();
  }
}

// Run the initialization
initDatabase().catch((error) => {
  console.error('Unexpected error:', error);
  process.exit(1);
});