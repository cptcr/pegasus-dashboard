import { NextResponse } from 'next/server';

export async function GET() {
  // Only show in development
  if (process.env['NODE_ENV'] !== 'development') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 });
  }

  return NextResponse.json({
    hasDiscordClientId: !!process.env['DISCORD_CLIENT_ID'],
    hasDiscordClientSecret: !!process.env['DISCORD_CLIENT_SECRET'],
    hasNextAuthUrl: !!process.env['NEXTAUTH_URL'],
    hasNextAuthSecret: !!process.env['NEXTAUTH_SECRET'],
    nextAuthUrl: process.env['NEXTAUTH_URL'],
    discordClientId: process.env['DISCORD_CLIENT_ID'],
    nodeEnv: process.env['NODE_ENV'],
  });
}