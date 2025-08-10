import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Try to fetch from the bot API if configured
    if (process.env['API_URL'] && process.env['BOT_API_TOKEN']) {
      const response = await fetch(`${process.env['API_URL']}/status`, {
        headers: {
          'Authorization': `Bearer ${process.env['BOT_API_TOKEN']}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        return NextResponse.json(data);
      }
    }
    
    // Return mock data if API is not configured or unavailable
    return NextResponse.json({
      serverCount: 157,
      userCount: 24691,
      uptime: "99.9%",
      status: "online",
      commandsExecuted: 142857,
      messagesProcessed: 8234561,
      memoryUsage: "342 MB",
      ping: 42,
    });
  } catch (error) {
    console.error('Failed to fetch bot status:', error);
    
    // Return mock data on error
    return NextResponse.json({
      serverCount: 157,
      userCount: 24691,
      uptime: "99.9%",
      status: "online",
      commandsExecuted: 142857,
      messagesProcessed: 8234561,
      memoryUsage: "342 MB",
      ping: 42,
    });
  }
}