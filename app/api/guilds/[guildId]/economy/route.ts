import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { checkRateLimit, securityHeaders } from '@/lib/security';

interface RouteParams {
  params: {
    guildId: string;
  };
}

/**
 * GET /api/guilds/[guildId]/economy
 * Fetch economy data for a guild
 */
export async function GET(
  _request: NextRequest,
  { params }: RouteParams
) {
  try {
    const guildId = params.guildId;
    
    // Get authenticated session
    const session = await getServerSession(authOptions);
    
    if (!session || !session.accessToken) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401, headers: securityHeaders }
      );
    }
    
    // Rate limiting
    if (!checkRateLimit(session.user.id, 'api')) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429, headers: securityHeaders }
      );
    }
    
    // TODO: Fetch actual economy data from your bot API or database
    // For now, return default data structure
    
    const defaultEconomyData = {
      settings: {
        enabled: false,
        currency_name: 'coins',
        currency_symbol: '🪙',
        starting_balance: 100,
        daily_amount: 50,
        daily_streak_bonus: 10,
        max_balance: 1000000,
        shop_enabled: true,
      },
      shopItems: [],
      topBalances: [],
      stats: {
        total_currency: 0,
        total_transactions: 0,
        active_users: 0,
        richest_user: null,
      }
    };
    
    // Try to fetch from bot API if configured
    const botApiUrl = process.env.API_URL;
    const botApiToken = process.env.BOT_API_TOKEN;
    
    if (botApiUrl && botApiToken) {
      try {
        const response = await fetch(`${botApiUrl}/guilds/${guildId}/economy`, {
          headers: {
            'Authorization': `Bearer ${botApiToken}`,
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          return NextResponse.json(data, { 
            status: 200,
            headers: {
              ...securityHeaders,
              'Cache-Control': 'private, max-age=30',
            }
          });
        }
      } catch (error) {
        console.log('Bot API not available, returning defaults');
      }
    }
    
    // Return default data if no bot API or data not found
    return NextResponse.json(defaultEconomyData, { 
      status: 200,
      headers: {
        ...securityHeaders,
        'Cache-Control': 'private, max-age=30',
      }
    });
    
  } catch (error) {
    console.error('Error fetching economy data:', error);
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: securityHeaders }
    );
  }
}