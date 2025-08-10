import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { securityHeaders } from '@/lib/security';

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
    
    // Try bot API if configured
    const botApiUrl = process.env.API_URL;
    const botApiToken = process.env.BOT_API_TOKEN;
    
    if (botApiUrl && botApiToken) {
      try {
        const response = await fetch(`${botApiUrl}/guilds/${guildId}/xp`, {
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
        console.log('Bot API not available for XP');
      }
    }
    
    // Return default XP data
    const defaultData = {
      leaderboard: [],
      topUsers: [],
      settings: {
        enabled: false,
        xp_rate: 15,
        xp_cooldown: 60,
        level_up_message: 'Congratulations {user}! You have reached level {level}!',
        level_up_channel: null,
        stack_roles: true,
        ignored_channels: [],
        ignored_roles: [],
        multipliers: {
          voice: 1.5,
          weekend: 2.0,
          boost: 1.25,
        },
      },
      rewards: [],
      roles: [],
      stats: {
        total_users: 0,
        active_today: 0,
        total_xp_earned: 0,
        highest_level: 0,
      },
    };
    
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