import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession, hasGuildAdminPermission } from '@/lib/auth';
import { db } from '@/lib/database';
import { economyShopItems } from '@/lib/db/economy';

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

    const item = await db
      .insert(economyShopItems)
      .values({
        ...body,
        guildId,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return NextResponse.json(item[0]);
  } catch (error) {
    console.error('Error creating shop item:', error);
    return NextResponse.json(
      { error: 'Failed to create shop item' },
      { status: 500 }
    );
  }
}