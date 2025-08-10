import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { getAllUserGuilds } from "@/lib/discord-api";
import { checkRateLimit, securityHeaders } from '@/lib/security';

/**
 * GET /api/guilds
 * Fetch ALL user guilds with bot membership and permission status
 */
export async function GET(_request: NextRequest) {
  try {
    // Get authenticated session
    const session = await getServerSession(authOptions);
    
    console.log('[API] Session:', session ? {
      userId: session.user?.id,
      hasAccessToken: !!session.accessToken,
      tokenLength: session.accessToken?.length
    } : 'No session');
    
    if (!session || !session.accessToken) {
      console.error('[API] Missing session or access token');
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
    
    // Fetch ALL user guilds with bot and permission status
    const guilds = await getAllUserGuilds(session.accessToken, session.user.id);
    
    // Check if we got rate limited and returned empty
    if (guilds.length === 0) {
      // Check if this is actually because user has no guilds or due to rate limit
      console.log('[API] No guilds returned - could be rate limited or user has no guilds');
    }
    
    // Format response - include ALL guilds with their permission status
    const formattedGuilds = guilds.map((guild) => ({
      id: guild.id,
      name: guild.name,
      icon: guild.icon 
        ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`
        : null,
      owner: guild.owner,
      hasBot: guild.hasBot,
      isAdmin: guild.isAdmin, // Whether user can manage this server
      permissions: guild.permissions,
      features: guild.features,
    }));
    
    return NextResponse.json(
      {
        success: true,
        data: {
          guilds: formattedGuilds,
          total: formattedGuilds.length,
          withBot: formattedGuilds.filter(g => g.hasBot).length,
          withoutBot: formattedGuilds.filter(g => !g.hasBot).length,
        }
      },
      { 
        status: 200,
        headers: {
          ...securityHeaders,
          'Cache-Control': 'private, max-age=60', // Cache for 1 minute
        }
      }
    );
    
  } catch (error) {
    console.error('Error fetching guilds:', error);
    
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