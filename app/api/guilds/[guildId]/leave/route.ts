import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession, hasGuildAdminPermission } from '@/lib/auth';
import { validateGuildId, checkRateLimit, securityHeaders } from '@/lib/security';
import { env } from '@/lib/env';

interface GuildParams {
  params: {
    guildId: string;
  };
}

/**
 * POST /api/guilds/[guildId]/leave
 * Make the bot leave a specific guild
 */
export async function POST(
  _request: NextRequest,
  { params }: GuildParams
) {
  try {
    // Validate guild ID
    const guildId = validateGuildId(params['guildId']);
    if (!guildId) {
      return NextResponse.json(
        { error: 'Invalid guild ID format' },
        { 
          status: 400,
          headers: securityHeaders
        }
      );
    }
    
    // Get authenticated session
    const session = await getAuthSession();
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized: Please log in' },
        { 
          status: 401,
          headers: securityHeaders
        }
      );
    }
    
    // Check guild-specific permissions
    const hasPermission = await hasGuildAdminPermission(guildId, session);
    
    if (!hasPermission) {
      return NextResponse.json(
        { error: 'Forbidden: You do not have admin access to this guild' },
        { 
          status: 403,
          headers: securityHeaders
        }
      );
    }
    
    // Rate limiting
    if (!checkRateLimit(session.user.id, 'api')) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { 
          status: 429,
          headers: {
            ...securityHeaders,
            'Retry-After': '60',
          }
        }
      );
    }
    
    // Call bot API to leave the guild
    const botResponse = await fetch(
      `${env.API_URL}/guilds/${guildId}/leave`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${env.BOT_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );
    
    if (!botResponse.ok) {
      console.error('Bot API error:', botResponse.status);
      const errorText = await botResponse.text();
      return NextResponse.json(
        { 
          error: 'Failed to leave guild',
          details: process.env.NODE_ENV === 'development' ? errorText : undefined
        },
        { 
          status: botResponse.status,
          headers: securityHeaders
        }
      );
    }
    
    return NextResponse.json(
      {
        success: true,
        message: `Bot has left guild ${guildId}`,
      },
      { 
        status: 200,
        headers: securityHeaders
      }
    );
    
  } catch (error) {
    console.error('Error leaving guild:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' 
          ? (error as Error).message 
          : 'An unexpected error occurred'
      },
      { 
        status: 500,
        headers: securityHeaders
      }
    );
  }
}