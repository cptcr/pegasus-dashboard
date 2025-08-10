import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { securityHeaders } from '@/lib/security';

export async function GET(_request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    
    if (!session || !session.accessToken) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401, headers: securityHeaders }
      );
    }
    
    // Try to fetch from bot API if configured
    const botApiUrl = process.env.API_URL;
    const botApiToken = process.env.BOT_API_TOKEN;
    
    if (botApiUrl && botApiToken) {
      try {
        const response = await fetch(`${botApiUrl}/stats`, {
          headers: {
            'Authorization': `Bearer ${botApiToken}`,
          },
          signal: AbortSignal.timeout(5000),
        });
        
        if (response.ok) {
          const data = await response.json();
          return NextResponse.json(
            { success: true, data },
            { 
              status: 200,
              headers: {
                ...securityHeaders,
                'Cache-Control': 'private, max-age=10',
              }
            }
          );
        }
      } catch (error) {
        console.log('Bot API not available, using mock data');
      }
    }
    
    // Return mock data if bot API is not available
    const mockStats = {
      status: 'online',
      uptime: Date.now() - new Date('2024-01-01').getTime(),
      started_at: new Date('2024-01-01').toISOString(),
      guilds: {
        total: 1250,
        large: 45,
        voice_active: 230,
      },
      users: {
        total: 425000,
        unique: 380000,
        active_today: 12500,
      },
      commands: {
        total_executed: 2450000,
        today: 15600,
        this_hour: 890,
        most_used: [
          { name: 'help', count: 450000 },
          { name: 'play', count: 380000 },
          { name: 'skip', count: 320000 },
          { name: 'queue', count: 280000 },
          { name: 'nowplaying', count: 250000 },
          { name: 'balance', count: 180000 },
          { name: 'daily', count: 165000 },
          { name: 'work', count: 145000 },
        ],
      },
      system: {
        memory_usage: 512,
        memory_total: 2048,
        cpu_usage: 23.5,
        latency: 45,
        shard_count: 4,
      },
      features: {
        music: true,
        moderation: true,
        economy: true,
        leveling: true,
        giveaways: true,
        tickets: true,
        automod: true,
        welcome: true,
        logs: true,
        starboard: false,
        polls: true,
        reminders: true,
      },
      version: '3.2.1',
    };
    
    return NextResponse.json(
      { success: true, data: mockStats },
      { 
        status: 200,
        headers: {
          ...securityHeaders,
          'Cache-Control': 'private, max-age=10',
        }
      }
    );
    
  } catch (error) {
    console.error('Error fetching bot stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: securityHeaders }
    );
  }
}