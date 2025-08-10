import { NextResponse } from 'next/server';
import { botAPI } from '@/lib/api';
import { checkDatabaseHealth } from '@/lib/database';
import { monitoring } from '@/lib/monitoring';

export const dynamic = 'force-dynamic';

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  checks: {
    database: 'up' | 'down';
    botApi: 'up' | 'down';
    discord: 'up' | 'down';
  };
  details?: {
    database?: {
      latency?: number;
      error?: string;
    };
    botApi?: {
      latency?: number;
      error?: string;
    };
  };
  uptime: number;
}

export async function GET() {
  // const startTime = Date.now();
  const transaction = monitoring.startTransaction('Health Check', 'health.check');

  try {
    // Check database health
    const dbStart = Date.now();
    let dbStatus: 'up' | 'down' = 'down';
    let dbError: string | undefined;
    
    try {
      const dbHealthResult = await checkDatabaseHealth();
      dbStatus = dbHealthResult.healthy ? 'up' : 'down';
    } catch (error) {
      dbError = error instanceof Error ? error.message : 'Database check failed';
      monitoring.reportError(error, { service: 'database' });
    }
    
    const dbLatency = Date.now() - dbStart;
    transaction.setData('db.latency', dbLatency);
    transaction.setData('db.status', dbStatus);

    // Check bot API health
    const apiStart = Date.now();
    let apiStatus: 'up' | 'down' = 'down';
    let apiError: string | undefined;
    
    try {
      const apiHealth = await botAPI.getHealth();
      apiStatus = apiHealth.success ? 'up' : 'down';
      if (!apiHealth.success) {
        apiError = apiHealth.error.message;
      }
    } catch (error) {
      apiError = error instanceof Error ? error.message : 'Bot API check failed';
      monitoring.reportError(error, { service: 'bot-api' });
    }
    
    const apiLatency = Date.now() - apiStart;
    transaction.setData('api.latency', apiLatency);
    transaction.setData('api.status', apiStatus);

    // Discord is up if bot API is up
    const discordStatus = apiStatus;

    // Calculate overall status
    const allServicesUp = dbStatus === 'up' && apiStatus === 'up';
    const someServicesUp = dbStatus === 'up' || apiStatus === 'up';
    const overallStatus = allServicesUp ? 'healthy' : someServicesUp ? 'degraded' : 'unhealthy';

    transaction.setStatus(overallStatus === 'healthy' ? 'ok' : 'error');
    transaction.setData('overall.status', overallStatus);

    const response: HealthStatus = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      checks: {
        database: dbStatus,
        botApi: apiStatus,
        discord: discordStatus,
      },
      details: {
        database: {
          latency: dbLatency,
          ...(dbError && { error: dbError }),
        },
        botApi: {
          latency: apiLatency,
          ...(apiError && { error: apiError }),
        },
      },
      uptime: process.uptime(),
    };

    // Log health check result
    if (overallStatus !== 'healthy') {
      monitoring.reportMessage(
        `Health check ${overallStatus}: DB=${dbStatus}, API=${apiStatus}`,
        'warning'
      );
    }

    return NextResponse.json(response, {
      status: overallStatus === 'healthy' ? 200 : 503,
      headers: {
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    transaction.setStatus('error');
    monitoring.reportError(error, { endpoint: '/api/health' });

    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        checks: {
          database: 'down',
          botApi: 'down',
          discord: 'down',
        },
        error: error instanceof Error ? error.message : 'Health check failed',
        uptime: process.uptime(),
      },
      {
        status: 500,
        headers: {
          'Cache-Control': 'no-store',
        },
      }
    );
  } finally {
    transaction.finish();
  }
}