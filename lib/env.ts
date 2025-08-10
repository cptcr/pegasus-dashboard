import { z } from 'zod';

/**
 * Server-side environment variables schema
 * These variables are validated at build time and runtime
 */
const serverEnvSchema = z.object({
  // Bot API Configuration
  API_URL: z.string().url().default('http://localhost:2000'),
  BOT_API_TOKEN: z.string().min(1, 'BOT_API_TOKEN is required'),

  // Database Configuration
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),

  // Discord OAuth2
  DISCORD_CLIENT_ID: z.string().min(1, 'DISCORD_CLIENT_ID is required'),
  DISCORD_CLIENT_SECRET: z.string().min(1, 'DISCORD_CLIENT_SECRET is required'),

  // NextAuth Configuration
  NEXTAUTH_URL: z.string().url().default('http://localhost:3000'),
  NEXTAUTH_SECRET: z.string().min(32, 'NEXTAUTH_SECRET must be at least 32 characters'),

  // Application Settings
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
});

/**
 * Client-side environment variables schema
 * These variables are exposed to the browser
 * Must be prefixed with NEXT_PUBLIC_
 */
const clientEnvSchema = z.object({
  NEXT_PUBLIC_DISCORD_CLIENT_ID: z.string().min(1, 'NEXT_PUBLIC_DISCORD_CLIENT_ID is required').optional(),
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
});

/**
 * Parse and validate server environment variables
 */
const parseServerEnv = () => {
  const parsed = serverEnvSchema.safeParse(process.env);

  if (!parsed.success) {
    console.error(
      '❌ Invalid environment variables:',
      JSON.stringify(parsed.error.flatten().fieldErrors, null, 2)
    );
    throw new Error('Invalid environment variables');
  }

  return parsed.data;
};

/**
 * Parse and validate client environment variables
 */
const parseClientEnv = () => {
  const parsed = clientEnvSchema.safeParse(process.env);

  if (!parsed.success) {
    console.error(
      '❌ Invalid client environment variables:',
      JSON.stringify(parsed.error.flatten().fieldErrors, null, 2)
    );
    throw new Error('Invalid client environment variables');
  }

  return parsed.data;
};

// Only validate server env on the server side
const serverEnv = typeof window === 'undefined' ? parseServerEnv() : ({} as z.infer<typeof serverEnvSchema>);
const clientEnv = parseClientEnv();

/**
 * Combined environment object
 * Use this throughout the application for type-safe environment variable access
 */
export const env = {
  ...serverEnv,
  ...clientEnv,
} as const;

/**
 * Type definitions for environment variables
 */
export type ServerEnv = z.infer<typeof serverEnvSchema>;
export type ClientEnv = z.infer<typeof clientEnvSchema>;
export type Env = typeof env;

/**
 * Helper function to check if we're in development mode
 */
export const isDevelopment = () => env.NODE_ENV === 'development';

/**
 * Helper function to check if we're in production mode
 */
export const isProduction = () => env.NODE_ENV === 'production';

/**
 * Helper function to check if we're in test mode
 */
export const isTest = () => env.NODE_ENV === 'test';

/**
 * Get the base API URL with proper formatting
 */
export const getApiUrl = (path?: string) => {
  const baseUrl = env.API_URL.replace(/\/$/, ''); // Remove trailing slash
  if (!path) return baseUrl;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
};

/**
 * Get the database connection URL (masked for security in logs)
 */
export const getDatabaseUrl = () => {
  if (isDevelopment()) {
    return env.DATABASE_URL;
  }
  // Mask password in production logs
  return env.DATABASE_URL.replace(/:([^@]+)@/, ':****@');
};

/**
 * Discord OAuth2 configuration
 */
export const discordConfig = {
  clientId: env.DISCORD_CLIENT_ID,
  clientSecret: env.DISCORD_CLIENT_SECRET,
  publicClientId: env.NEXT_PUBLIC_DISCORD_CLIENT_ID || env.DISCORD_CLIENT_ID,
  authorizationUrl: `https://discord.com/oauth2/authorize?client_id=${env.NEXT_PUBLIC_DISCORD_CLIENT_ID || env.DISCORD_CLIENT_ID}&permissions=8&scope=bot%20applications.commands`,
  redirectUri: `${env.NEXTAUTH_URL}/api/auth/callback/discord`,
} as const;

/**
 * Get the bot invite URL
 */
export const getBotInviteUrl = (guildId?: string) => {
  const clientId = typeof window !== 'undefined' 
    ? env.NEXT_PUBLIC_DISCORD_CLIENT_ID || env.DISCORD_CLIENT_ID
    : env.DISCORD_CLIENT_ID;
    
  let url = `https://discord.com/oauth2/authorize?client_id=${clientId}&permissions=8&scope=bot%20applications.commands`;
  if (guildId) {
    url += `&guild_id=${guildId}`;
  }
  return url;
};

/**
 * NextAuth configuration
 */
export const nextAuthConfig = {
  url: env.NEXTAUTH_URL,
  secret: env.NEXTAUTH_SECRET,
} as const;

/**
 * Bot API configuration
 */
export const botApiConfig = {
  url: env.API_URL,
  token: env.BOT_API_TOKEN,
  headers: {
    Authorization: `Bearer ${env.BOT_API_TOKEN}`,
    'Content-Type': 'application/json',
  },
} as const;