/**
 * Database Health Check API Endpoint
 * GET /api/health/db
 */

import { NextResponse } from 'next/server';
import { checkDatabaseHealth } from '@/lib/database';
import { getDatabaseStats } from '@/lib/db/migrations';

export async function GET() {
  try {
    // Check database health
    const healthCheck = await checkDatabaseHealth();
    
    // Get database statistics if healthy
    let stats = null;
    if (healthCheck.healthy) {
      const statsResult = await getDatabaseStats();
      if (statsResult.success) {
        stats = statsResult.data;
      }
    }

    // Prepare response
    const response = {
      status: healthCheck.healthy ? 'healthy' : 'unhealthy',
      message: healthCheck.message,
      timestamp: new Date().toISOString(),
      details: {
        ...healthCheck.details,
        statistics: stats,
      },
    };

    // Return appropriate status code
    return NextResponse.json(response, {
      status: healthCheck.healthy ? 200 : 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (error) {
    console.error('Database health check endpoint error:', error);
    
    return NextResponse.json(
      {
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: new Date().toISOString(),
      },
      {
        status: 500,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      }
    );
  }
}

// Handle unsupported methods
export async function POST() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}