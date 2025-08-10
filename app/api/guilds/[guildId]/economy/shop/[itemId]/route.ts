import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession, hasGuildAdminPermission } from '@/lib/auth';
import { db } from '@/lib/database';
import { economyShopItems } from '@/lib/db/economy';
import { eq, and } from 'drizzle-orm';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { guildId: string; itemId: string } }
) {
  try {
    const session = await getAuthSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const guildId = params['guildId'];
    const itemId = params['itemId'];
    
    // Check if user has admin permissions for this guild
    const hasPermission = await hasGuildAdminPermission(guildId, session);
    if (!hasPermission) {
      return NextResponse.json({ error: 'Forbidden: Admin access required for this guild' }, { status: 403 });
    }
    const body = await request.json();

    const updated = await db
      .update(economyShopItems)
      .set({
        ...body,
        updatedAt: new Date(),
      })
      .where(and(
        eq(economyShopItems.guildId, guildId),
        eq(economyShopItems.id, itemId)
      ))
      .returning();

    if (!updated || updated.length === 0) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    return NextResponse.json(updated[0]);
  } catch (error) {
    console.error('Error updating shop item:', error);
    return NextResponse.json(
      { error: 'Failed to update shop item' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { guildId: string; itemId: string } }
) {
  try {
    const session = await getAuthSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const guildId = params['guildId'];
    const itemId = params['itemId'];
    
    // Check if user has admin permissions for this guild
    const hasPermission = await hasGuildAdminPermission(guildId, session);
    if (!hasPermission) {
      return NextResponse.json({ error: 'Forbidden: Admin access required for this guild' }, { status: 403 });
    }

    const deleted = await db
      .delete(economyShopItems)
      .where(and(
        eq(economyShopItems.guildId, guildId),
        eq(economyShopItems.id, itemId)
      ))
      .returning();

    if (!deleted || deleted.length === 0) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting shop item:', error);
    return NextResponse.json(
      { error: 'Failed to delete shop item' },
      { status: 500 }
    );
  }
}