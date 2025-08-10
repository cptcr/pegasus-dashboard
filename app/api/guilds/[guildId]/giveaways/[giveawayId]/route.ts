import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession, hasGuildAdminPermission } from '@/lib/auth';
import { db } from '@/lib/database';
import { giveaways } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

export async function GET(
  _request: NextRequest,
  { params }: { params: { guildId: string; giveawayId: string } }
) {
  try {
    const session = await getAuthSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const guildId = params['guildId'];
    const giveawayId = params['giveawayId'];
    
    // Check if user has admin permissions for this guild
    const hasPermission = await hasGuildAdminPermission(guildId, session);
    if (!hasPermission) {
      return NextResponse.json({ error: 'Forbidden: Admin access required for this guild' }, { status: 403 });
    }

    const giveaway = await db
      .select()
      .from(giveaways)
      .where(and(
        eq(giveaways.guildId, guildId),
        eq(giveaways.giveawayId, giveawayId)
      ))
      .limit(1);

    if (!giveaway || giveaway.length === 0) {
      return NextResponse.json({ error: 'Giveaway not found' }, { status: 404 });
    }

    return NextResponse.json(giveaway[0]);
  } catch (error) {
    console.error('Error fetching giveaway:', error);
    return NextResponse.json(
      { error: 'Failed to fetch giveaway' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { guildId: string; giveawayId: string } }
) {
  try {
    const session = await getAuthSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const guildId = params['guildId'];
    const giveawayId = params['giveawayId'];
    
    // Check if user has admin permissions for this guild
    const hasPermission = await hasGuildAdminPermission(guildId, session);
    if (!hasPermission) {
      return NextResponse.json({ error: 'Forbidden: Admin access required for this guild' }, { status: 403 });
    }
    const body = await request.json();

    const updated = await db
      .update(giveaways)
      .set({
        ...body,
        updatedAt: new Date(),
      })
      .where(and(
        eq(giveaways.guildId, guildId),
        eq(giveaways.giveawayId, giveawayId)
      ))
      .returning();

    if (!updated || updated.length === 0) {
      return NextResponse.json({ error: 'Giveaway not found' }, { status: 404 });
    }

    return NextResponse.json(updated[0]);
  } catch (error) {
    console.error('Error updating giveaway:', error);
    return NextResponse.json(
      { error: 'Failed to update giveaway' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { guildId: string; giveawayId: string } }
) {
  try {
    const session = await getAuthSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const guildId = params['guildId'];
    const giveawayId = params['giveawayId'];
    
    // Check if user has admin permissions for this guild
    const hasPermission = await hasGuildAdminPermission(guildId, session);
    if (!hasPermission) {
      return NextResponse.json({ error: 'Forbidden: Admin access required for this guild' }, { status: 403 });
    }

    const deleted = await db
      .delete(giveaways)
      .where(and(
        eq(giveaways.guildId, guildId),
        eq(giveaways.giveawayId, giveawayId)
      ))
      .returning();

    if (!deleted || deleted.length === 0) {
      return NextResponse.json({ error: 'Giveaway not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting giveaway:', error);
    return NextResponse.json(
      { error: 'Failed to delete giveaway' },
      { status: 500 }
    );
  }
}