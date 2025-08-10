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
        const response = await fetch(`${botApiUrl}/guilds/${guildId}/tickets`, {
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
        console.log('Bot API not available for tickets');
      }
    }
    
    // Return default tickets data
    const defaultData = {
      tickets: [],
      panels: [],
      categories: [],
      stats: {
        total_tickets: 0,
        open_tickets: 0,
        closed_tickets: 0,
        average_response_time: 0,
        average_resolution_time: 0,
      },
      settings: {
        enabled: false,
        ticket_category: null,
        support_roles: [],
        max_tickets_per_user: 3,
        auto_close_after: 7, // days
        transcript_channel: null,
        welcome_message: 'Thank you for creating a ticket! Support will be with you shortly.',
        close_message: 'This ticket has been closed. Thank you for contacting support.',
        button_label: 'Create Ticket',
        button_emoji: '🎫',
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