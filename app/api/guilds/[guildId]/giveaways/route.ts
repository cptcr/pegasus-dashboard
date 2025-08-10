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
        const response = await fetch(`${botApiUrl}/guilds/${guildId}/giveaways`, {
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
        console.log('Bot API not available for giveaways');
      }
    }
    
    // Return default giveaways data
    const defaultData = {
      active_giveaways: [],
      ended_giveaways: [],
      stats: {
        total_giveaways: 0,
        active_giveaways: 0,
        total_participants: 0,
        total_winners: 0,
      },
      settings: {
        enabled: true,
        reaction_emoji: '🎉',
        dm_winner: true,
        reroll_enabled: true,
        max_entries_per_user: 1,
        bonus_entries: {
          boost: 2,
          level_10: 1,
          level_20: 2,
          level_30: 3,
        },
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