# Pegasus Bot Dashboard

A comprehensive Discord bot management dashboard built with Next.js 14+, TypeScript, ShadCN UI, and PostgreSQL.

## Features

- 🔐 Discord OAuth2 authentication
- 📊 Real-time bot status monitoring
- 🛡️ Advanced moderation tools
- 💰 Economy system management
- 📈 XP and leveling system
- 🎫 Ticket support system
- 🔒 Security center with audit logs
- 📱 Fully responsive design
- 🌙 Dark/Light theme support

## Prerequisites

- Node.js 18+ 
- PostgreSQL database
- Discord application with OAuth2 configured
- Discord bot with API endpoints

## Setup Instructions

1. **Clone and install dependencies:**
```bash
npm install
```

2. **Configure environment variables:**
Copy `.env.example` to `.env.local` and fill in your values:
```env
# Bot API Configuration
API_URL=http://localhost:2000
BOT_API_TOKEN=your_bot_api_token_here

# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/database_name

# Discord OAuth2
DISCORD_CLIENT_ID=your_discord_client_id
DISCORD_CLIENT_SECRET=your_discord_client_secret
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=generate_a_secret_here

# Application Settings
NODE_ENV=development
```

3. **Generate NextAuth secret:**
```bash
openssl rand -base64 32
```

4. **Run database migrations (if needed):**
```bash
npm run db:push
```

5. **Start the development server:**
```bash
npm run dev
```

6. **Open the application:**
Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── (auth)/            # Authentication pages
│   ├── dashboard/         # Dashboard pages
│   ├── docs/              # Documentation
│   └── api/               # API routes
├── components/            # React components
│   ├── ui/                # ShadCN UI components
│   └── dashboard/         # Dashboard components
├── lib/                   # Utility functions
│   ├── auth.ts           # NextAuth configuration
│   ├── database.ts       # Database connection
│   ├── schema.ts         # Drizzle schema
│   └── api.ts            # Bot API client
└── public/               # Static assets
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Discord OAuth2 Setup

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create or select your application
3. Navigate to OAuth2 settings
4. Add redirect URL: `http://localhost:3000/api/auth/callback/discord`
5. Copy Client ID and Client Secret to `.env.local`

## Bot API Requirements

The dashboard expects the following endpoints from your bot API:

- `GET /health` - Health check (no auth)
- `GET /status` - Bot status (requires Bearer token)
- Additional endpoints as documented in `lib/api.ts`

## Deployment

For production deployment:

1. Set all environment variables
2. Build the application: `npm run build`
3. Start the server: `npm run start`
4. Configure your reverse proxy (nginx, etc.)
5. Set up SSL certificates

## Security Notes

- Always use HTTPS in production
- Keep your API tokens secure
- Regularly update dependencies
- Enable rate limiting on your API
- Implement proper CORS policies

## Support

For issues or questions, please check the documentation at `/docs` or contact support.

## License

All rights reserved.