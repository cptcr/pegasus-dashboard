import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession, hasGuildAdminPermission } from '@/lib/auth';
import { db } from '@/lib/database';
import { xpSettings } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function PUT(
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

    // Check if settings exist
    const existing = await db
      .select()
      .from(xpSettings)
      .where(eq(xpSettings.guildId, guildId))
      .limit(1);

    let result;
    
    if (existing.length > 0) {
      // Update existing settings
      result = await db
        .update(xpSettings)
        .set({
          ...body,
          updatedAt: new Date(),
        })
        .where(eq(xpSettings.guildId, guildId))
        .returning();
    } else {
      // Create new settings
      result = await db
        .insert(xpSettings)
        .values({
          guildId,
          ...body,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('Error updating XP settings:', error);
    return NextResponse.json(
      { error: 'Failed to update XP settings' },
      { status: 500 }
    );
  }
}