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
  request: NextRequest,
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
    
    // Parse query parameters for filtering
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    
    // Try bot API if configured
    const botApiUrl = process.env.API_URL;
    const botApiToken = process.env.BOT_API_TOKEN;
    
    if (botApiUrl && botApiToken) {
      try {
        const url = new URL(`${botApiUrl}/guilds/${guildId}/logs`);
        if (type) url.searchParams.append('type', type);
        url.searchParams.append('limit', limit.toString());
        url.searchParams.append('offset', offset.toString());
        
        const response = await fetch(url.toString(), {
          headers: { 'Authorization': `Bearer ${botApiToken}` },
          signal: AbortSignal.timeout(5000),
        });
        
        if (response.ok) {
          const data = await response.json();
          return NextResponse.json(data, { 
            status: 200,
            headers: { ...securityHeaders, 'Cache-Control': 'private, max-age=10' }
          });
        }
      } catch (error) {
        console.log('Bot API not available for logs');
      }
    }
    
    // Return default logs data
    const defaultData = {
      logs: [],
      total: 0,
      types: {
        message_delete: 0,
        message_edit: 0,
        member_join: 0,
        member_leave: 0,
        member_ban: 0,
        member_kick: 0,
        member_warn: 0,
        member_mute: 0,
        role_given: 0,
        role_removed: 0,
        channel_create: 0,
        channel_delete: 0,
        command_use: 0,
      },
      settings: {
        enabled: false,
        log_channel: null,
        logged_events: [],
      },
    };
    
    return NextResponse.json(defaultData, { 
      status: 200,
      headers: { ...securityHeaders, 'Cache-Control': 'private, max-age=10' }
    });
    
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: securityHeaders }
    );
  }
}