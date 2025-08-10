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
        const response = await fetch(`${botApiUrl}/guilds/${guildId}/settings`, {
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
        console.log('Bot API not available for settings');
      }
    }
    
    // Return default settings structure
    const defaultSettings = {
      prefix: '!',
      language: 'en',
      timezone: 'UTC',
      notifications: {
        welcome_enabled: false,
        welcome_channel: null,
        welcome_message: 'Welcome {user} to {server}!',
        goodbye_enabled: false,
        goodbye_channel: null,
        goodbye_message: 'Goodbye {user}!',
        level_up_enabled: false,
        level_up_channel: null,
      },
      automod: {
        enabled: false,
        spam_detection: false,
        link_filter: false,
        word_filter: false,
        caps_filter: false,
        emoji_spam_filter: false,
        mention_spam_filter: false,
        filtered_words: [],
        allowed_links: [],
      },
      logging: {
        enabled: false,
        message_delete: false,
        message_edit: false,
        member_join: false,
        member_leave: false,
        member_ban: false,
        member_unban: false,
        channel_create: false,
        channel_delete: false,
        role_create: false,
        role_delete: false,
        log_channel: null,
      },
      permissions: {
        admin_roles: [],
        mod_roles: [],
        dj_roles: [],
        muted_role: null,
      },
    };
    
    return NextResponse.json(defaultSettings, { 
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

export async function PUT(
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
    
    const body = await request.json();
    
    // Try bot API if configured
    const botApiUrl = process.env.API_URL;
    const botApiToken = process.env.BOT_API_TOKEN;
    
    if (botApiUrl && botApiToken) {
      try {
        const response = await fetch(`${botApiUrl}/guilds/${guildId}/settings`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${botApiToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
          signal: AbortSignal.timeout(5000),
        });
        
        if (response.ok) {
          const data = await response.json();
          return NextResponse.json(data, { 
            status: 200,
            headers: securityHeaders
          });
        }
      } catch (error) {
        console.log('Bot API not available for settings update');
      }
    }
    
    // Return the updated settings (mock)
    return NextResponse.json(body, { 
      status: 200,
      headers: securityHeaders
    });
    
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: securityHeaders }
    );
  }
}