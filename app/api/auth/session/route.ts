import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { securityHeaders } from '@/lib/security';

/**
 * GET /api/auth/session
 * Validate and return current session with admin status
 */
export async function GET(_request: NextRequest) {
  try {
    const session = await getAuthSession();
    
    if (!session) {
      return NextResponse.json(
        { 
          authenticated: false,
          user: null,
        },
        { 
          status: 200,
          headers: securityHeaders
        }
      );
    }
    
    // Return session data
    return NextResponse.json(
      {
        authenticated: true,
        user: {
          id: session.user.id,
          discordId: session.user.discordId,
          name: session.user.name,
          email: session.user.email,
          image: session.user.image,
          isAdmin: session.user.isAdmin,
          guilds: session.user.guilds,
        },
        expiresAt: session.expires,
      },
      { 
        status: 200,
        headers: {
          ...securityHeaders,
          'Cache-Control': 'private, no-cache, no-store, must-revalidate',
        }
      }
    );
    
  } catch (error) {
    console.error('Error validating session:', error);
    
    return NextResponse.json(
      { 
        authenticated: false,
        user: null,
        error: 'Failed to validate session'
      },
      { 
        status: 500,
        headers: securityHeaders
      }
    );
  }
}