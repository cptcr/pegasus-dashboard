import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession, hasGuildAdminPermission } from '@/lib/auth';
import { db } from '@/lib/database';
import { userXp } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

export async function POST(
  request: NextRequest,
  { params }: { params: { guildId: string } }
) {
  try {
    const session = await getAuthSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const guildId = params['guildId'];
    
    // Check if user has admin permissions for this guild
    const hasPermission = await hasGuildAdminPermission(guildId, session);
    if (!hasPermission) {
      return NextResponse.json({ error: 'Forbidden: Admin access required for this guild' }, { status: 403 });
    }
    const body = await request.json();

    if (body.resetAll) {
      // Reset all XP for the guild
      await db
        .delete(userXp)
        .where(eq(userXp.guildId, guildId));
      
      return NextResponse.json({ success: true, message: 'All XP reset successfully' });
    } else if (body.userId) {
      // Reset XP for a specific user
      await db
        .delete(userXp)
        .where(and(
          eq(userXp.guildId, guildId),
          eq(userXp.userId, body.userId)
        ));
      
      return NextResponse.json({ success: true, message: 'User XP reset successfully' });
    } else {
      return NextResponse.json(
        { error: 'Invalid request: userId or resetAll required' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error resetting XP:', error);
    return NextResponse.json(
      { error: 'Failed to reset XP' },
      { status: 500 }
    );
  }
}