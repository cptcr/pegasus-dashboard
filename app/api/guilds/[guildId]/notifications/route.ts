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
        const response = await fetch(`${botApiUrl}/guilds/${guildId}/notifications`, {
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
        console.log('Bot API not available for notifications');
      }
    }
    
    // Return default notifications data
    const defaultData = {
      channels: [],
      settings: {
        welcome: {
          enabled: false,
          channel: null,
          message: 'Welcome {user} to **{server}**! You are member #{count}.',
          embed: false,
          embed_color: '#5865F2',
          dm_enabled: false,
          dm_message: null,
          role_assign: [],
        },
        goodbye: {
          enabled: false,
          channel: null,
          message: '{user} has left the server.',
          embed: false,
          embed_color: '#ED4245',
        },
        level_up: {
          enabled: false,
          channel: null,
          message: 'GG {user}, you leveled up to level {level}!',
          dm_enabled: false,
        },
        boost: {
          enabled: false,
          channel: null,
          message: 'Thank you {user} for boosting the server! We now have {boosts} boosts.',
        },
        announcements: {
          enabled: false,
          channel: null,
          role_ping: null,
        },
      },
      recent_notifications: [],
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