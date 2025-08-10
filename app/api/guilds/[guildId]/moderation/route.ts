import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { checkRateLimit, securityHeaders } from '@/lib/security';

interface RouteParams {
  params: {
    guildId: string;
  };
}

export async function GET(
  _request: NextRequest,
  { params }: RouteParams
) {
  try {
    const guildId = params.guildId;
    const session = await getServerSession(authOptions);
    
    if (!session || !session.accessToken) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401, headers: securityHeaders }
      );
    }
    
    // Default moderation data
    const defaultData = {
      warnings: [],
      automations: [],
      recentCases: [],
      stats: {
        totalWarnings: 0,
        totalBans: 0,
        totalMutes: 0,
        totalKicks: 0,
        activeAutomations: 0,
      },
      settings: {
        enabled: true,
        auto_mod_enabled: false,
        log_channel: null,
        mute_role: null,
        warn_threshold: 3,
        kick_threshold: 5,
        ban_threshold: 10,
      }
    };
    
    // Try bot API if configured
    const botApiUrl = process.env.API_URL;
    const botApiToken = process.env.BOT_API_TOKEN;
    
    if (botApiUrl && botApiToken) {
      try {
        const response = await fetch(`${botApiUrl}/guilds/${guildId}/moderation`, {
          headers: { 'Authorization': `Bearer ${botApiToken}` },
          signal: AbortSignal.timeout(5000),
        });
        
        if (response.ok) {
          const data = await response.json();
          return NextResponse.json(data, { 
            status: 200,
            headers: { ...securityHeaders, 'Cache-Control': 'private, max-age=30' }
          });
        }
      } catch (error) {
        console.log('Bot API not available for moderation');
      }
    }
    
    return NextResponse.json(defaultData, { 
      status: 200,
      headers: { ...securityHeaders, 'Cache-Control': 'private, max-age=30' }
    });
    
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: securityHeaders }
    );
  }
}