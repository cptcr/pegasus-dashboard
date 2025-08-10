/**
 * Fallback environment validation without Zod
 * This file provides environment variable validation without external dependencies
 * Once zod is installed, use lib/env.ts instead
 */

interface ServerEnv {
  API_URL: string;
  BOT_API_TOKEN: string;
  DATABASE_URL: string;
  DISCORD_CLIENT_ID: string;
  DISCORD_CLIENT_SECRET: string;
  NEXTAUTH_URL: string;
  NEXTAUTH_SECRET: string;
  NODE_ENV: 'development' | 'test' | 'production';
}


/**
 * Validate required environment variables
 */
function validateEnv(): ServerEnv {
  const errors: string[] = [];

  // Bot API Configuration
  const API_URL = process.env.API_URL || 'http://localhost:2000';
  const BOT_API_TOKEN = process.env.BOT_API_TOKEN || '';
  
  if (!BOT_API_TOKEN) {
    errors.push('BOT_API_TOKEN is required');
  }

  // Database Configuration
  const DATABASE_URL = process.env.DATABASE_URL || '';
  if (!DATABASE_URL) {
    errors.push('DATABASE_URL is required');
  }

  // Discord OAuth2
  const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID || '';
  const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET || '';
  
  if (!DISCORD_CLIENT_ID) {
    errors.push('DISCORD_CLIENT_ID is required');
  }
  if (!DISCORD_CLIENT_SECRET) {
    errors.push('DISCORD_CLIENT_SECRET is required');
  }

  // NextAuth Configuration
  const NEXTAUTH_URL = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET || '';
  
  if (!NEXTAUTH_SECRET) {
    errors.push('NEXTAUTH_SECRET is required');
  }
  if (NEXTAUTH_SECRET && NEXTAUTH_SECRET.length < 32) {
    errors.push('NEXTAUTH_SECRET must be at least 32 characters');
  }

  // Application Settings
  const NODE_ENV = (process.env.NODE_ENV || 'development') as 'development' | 'test' | 'production';
  
  if (!['development', 'test', 'production'].includes(NODE_ENV)) {
    errors.push('NODE_ENV must be one of: development, test, production');
  }

  // Throw error if validation fails
  if (errors.length > 0) {
    console.error('❌ Invalid environment variables:');
    errors.forEach(error => console.error(`  - ${error}`));
    throw new Error('Invalid environment variables');
  }

  return {
    API_URL,
    BOT_API_TOKEN,
    DATABASE_URL,
    DISCORD_CLIENT_ID,
    DISCORD_CLIENT_SECRET,
    NEXTAUTH_URL,
    NEXTAUTH_SECRET,
    NODE_ENV,
  };
}

// Only validate server env on the server side
const serverEnv = typeof window === 'undefined' ? validateEnv() : ({} as ServerEnv);

/**
 * Combined environment object
 * Use this throughout the application for type-safe environment variable access
 */
export const env = serverEnv;

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
  authorizationUrl: `https://discord.com/oauth2/authorize?client_id=${env.DISCORD_CLIENT_ID}&permissions=8&scope=bot%20applications.commands`,
  redirectUri: `${env.NEXTAUTH_URL}/api/auth/callback/discord`,
};

/**
 * NextAuth configuration
 */
export const nextAuthConfig = {
  url: env.NEXTAUTH_URL,
  secret: env.NEXTAUTH_SECRET,
};

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
};