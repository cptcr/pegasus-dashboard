import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import * as schema from './db';

// Validate database URL
const connectionString = process.env['DATABASE_URL'];
if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is required');
}

// Create postgres client with optimized connection pooling
const client = postgres(connectionString, {
  max: process.env.NODE_ENV === 'production' ? 25 : 10, // Max connections
  idle_timeout: 20, // Seconds to close idle connections
  connect_timeout: 10, // Seconds to wait for connection
  max_lifetime: 60 * 30, // Max lifetime of a connection in seconds (30 minutes)
  prepare: true, // Use prepared statements for better performance
  onnotice: process.env.NODE_ENV === 'development' ? console.log : () => {}, // Log notices in dev
  debug: process.env.NODE_ENV === 'development', // Debug mode in development
  transform: {
    undefined: null, // Transform undefined to null for consistency
  },
});

// Create Drizzle instance with schema
export const db = drizzle(client, { 
  schema,
  logger: process.env.NODE_ENV === 'development',
});

// Health check function
export async function checkDatabaseHealth(): Promise<{
  healthy: boolean;
  message: string;
  details?: {
    activeConnections?: number;
    waitingConnections?: number;
    idleConnections?: number;
    totalConnections?: number;
  } | undefined;
}> {
  try {
    // Test basic connectivity
    const result = await client`SELECT 1 as health_check`;
    
    if (!result || result.length === 0) {
      throw new Error('Database query returned no results');
    }

    // Get connection pool stats if available
    const poolStats = (client as any).connections;
    
    const details = poolStats ? {
      activeConnections: poolStats.active as number,
      waitingConnections: poolStats.waiting as number,
      idleConnections: poolStats.idle as number,
      totalConnections: poolStats.total as number,
    } : undefined;
    
    return {
      healthy: true,
      message: 'Database connection is healthy',
      details,
    };
  } catch (error) {
    console.error('Database health check failed:', error);
    return {
      healthy: false,
      message: error instanceof Error ? error.message : 'Unknown database error',
    };
  }
}

// Transaction helper with error handling
export async function withTransaction<T>(
  callback: (tx: typeof db) => Promise<T>
): Promise<T> {
  try {
    return await db.transaction(async (tx) => {
      // Cast the transaction to the expected type
      return await callback(tx as any);
    });
  } catch (error) {
    console.error('Transaction failed:', error);
    throw error;
  }
}

// Migration runner
export async function runMigrations() {
  try {
    console.log('Running database migrations...');
    await migrate(db, { migrationsFolder: './drizzle' });
    console.log('Migrations completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
}

// Graceful shutdown handler
export async function closeDatabaseConnection() {
  try {
    await client.end();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error closing database connection:', error);
    throw error;
  }
}

// Handle process termination
if (process.env.NODE_ENV !== 'test') {
  process.on('SIGINT', async () => {
    await closeDatabaseConnection();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    await closeDatabaseConnection();
    process.exit(0);
  });
}

export default db;