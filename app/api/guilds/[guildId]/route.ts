import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { checkRateLimit, securityHeaders } from '@/lib/security';

interface GuildParams {
  params: {
    guildId: string;
  };
}

/**
 * GET /api/guilds/[guildId]
 * Fetch specific guild information
 */
export async function GET(
  _request: NextRequest,
  { params }: GuildParams
) {
  try {
    const guildId = params.guildId;
    
    // Get authenticated session
    const session = await getServerSession(authOptions);
    
    if (!session || !session.accessToken) {
      return NextResponse.json(
        { error: 'Unauthorized: Please log in' },
        { 
          status: 401,
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
    
    // Fetch user's guilds to check if they have access
    const guildsResponse = await fetch(
      'https://discord.com/api/v10/users/@me/guilds',
      {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      }
    );
    
    if (!guildsResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch user guilds' },
        { 
          status: guildsResponse.status,
          headers: securityHeaders
        }
      );
    }
    
    const userGuilds = await guildsResponse.json();
    const userGuild = userGuilds.find((g: any) => g.id === guildId);
    
    if (!userGuild) {
      return NextResponse.json(
        { error: 'Guild not found or you are not a member' },
        { 
          status: 404,
          headers: securityHeaders
        }
      );
    }
    
    // Check if user has admin permissions
    const permissions = BigInt(userGuild.permissions);
    const ADMINISTRATOR = BigInt(0x8);
    const MANAGE_GUILD = BigInt(0x20);
    const hasAdmin = (permissions & ADMINISTRATOR) === ADMINISTRATOR || 
                     (permissions & MANAGE_GUILD) === MANAGE_GUILD ||
                     userGuild.owner;
    
    if (!hasAdmin) {
      return NextResponse.json(
        { error: 'Forbidden: You do not have admin access to this guild' },
        { 
          status: 403,
          headers: securityHeaders
        }
      );
    }
    
    // Try to get more detailed guild info using bot token if available
    let detailedGuildData = null;
    const botToken = process.env.DISCORD_BOT_TOKEN;
    
    if (botToken) {
      try {
        const botGuildResponse = await fetch(
          `https://discord.com/api/v10/guilds/${guildId}`,
          {
            headers: {
              Authorization: `Bot ${botToken}`,
            },
          }
        );
        
        if (botGuildResponse.ok) {
          detailedGuildData = await botGuildResponse.json();
        }
      } catch (error) {
        console.log('Could not fetch detailed guild data:', error);
      }
    }
    
    // Format response - use detailed data if available, otherwise use basic data
    const guildData = detailedGuildData || userGuild;
    
    const formattedGuild = {
      id: guildData.id,
      name: guildData.name,
      icon: guildData.icon 
        ? `https://cdn.discordapp.com/icons/${guildData.id}/${guildData.icon}.png`
        : null,
      banner: guildData.banner
        ? `https://cdn.discordapp.com/banners/${guildData.id}/${guildData.banner}.png`
        : null,
      description: guildData.description || null,
      owner_id: guildData.owner_id || (userGuild.owner ? session.user.id : null),
      member_count: guildData.approximate_member_count || guildData.member_count || 0,
      presence_count: guildData.approximate_presence_count || 0,
      features: guildData.features || [],
      premium_tier: guildData.premium_tier || 0,
      premium_subscription_count: guildData.premium_subscription_count || 0,
      preferred_locale: guildData.preferred_locale || 'en-US',
      verification_level: guildData.verification_level || 0,
      explicit_content_filter: guildData.explicit_content_filter || 0,
      mfa_level: guildData.mfa_level || 0,
      has_bot: true, // We assume bot is present if user can access this page
    };
    
    return NextResponse.json(
      {
        success: true,
        data: formattedGuild,
      },
      { 
        status: 200,
        headers: {
          ...securityHeaders,
          'Cache-Control': 'private, max-age=60',
        }
      }
    );
    
  } catch (error) {
    console.error('Error fetching guild:', error);
    
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