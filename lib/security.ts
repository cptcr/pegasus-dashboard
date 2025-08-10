/**
 * Security utilities for input sanitization, validation, and protection
 */

import { z } from 'zod';
import DOMPurify from 'isomorphic-dompurify';

/**
 * Discord ID validation schema
 */
export const discordIdSchema = z.string().regex(/^\d{17,20}$/, 'Invalid Discord ID format');

/**
 * Guild ID validation schema
 */
export const guildIdSchema = discordIdSchema;

/**
 * User ID validation schema
 */
export const userIdSchema = discordIdSchema;

/**
 * Sanitize HTML content to prevent XSS attacks
 */
export function sanitizeHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'span', 'p', 'br'],
    ALLOWED_ATTR: [],
  });
}

/**
 * Sanitize user input for display (strips all HTML)
 */
export function sanitizeText(text: string): string {
  return DOMPurify.sanitize(text, { ALLOWED_TAGS: [] });
}

/**
 * Validate and sanitize Discord ID
 */
export function validateDiscordId(id: string): string | null {
  try {
    const result = discordIdSchema.parse(id);
    return result;
  } catch {
    return null;
  }
}

/**
 * Validate and sanitize guild ID
 */
export function validateGuildId(id: string): string | null {
  return validateDiscordId(id);
}

/**
 * Validate and sanitize user ID
 */
export function validateUserId(id: string): string | null {
  return validateDiscordId(id);
}

/**
 * Rate limiting configuration
 */
export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
}

/**
 * Default rate limits for different endpoints
 */
export const RateLimits = {
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5, // 5 login attempts per 15 minutes
  },
  api: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 60, // 60 requests per minute
  },
  write: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10, // 10 write operations per minute
  },
} as const;

/**
 * Simple in-memory rate limiter (for development)
 * In production, use Redis or another distributed solution
 */
class RateLimiter {
  private attempts: Map<string, { count: number; resetTime: number }> = new Map();

  check(key: string, config: RateLimitConfig): boolean {
    const now = Date.now();
    const attempt = this.attempts.get(key);

    if (!attempt || now > attempt.resetTime) {
      // New window
      this.attempts.set(key, {
        count: 1,
        resetTime: now + config.windowMs,
      });
      return true;
    }

    if (attempt.count >= config.maxRequests) {
      // Rate limit exceeded
      return false;
    }

    // Increment counter
    attempt.count++;
    return true;
  }

  reset(key: string): void {
    this.attempts.delete(key);
  }

  cleanup(): void {
    const now = Date.now();
    for (const [key, attempt] of this.attempts.entries()) {
      if (now > attempt.resetTime) {
        this.attempts.delete(key);
      }
    }
  }
}

// Global rate limiter instance
export const rateLimiter = new RateLimiter();

// Cleanup old entries every 5 minutes
if (typeof window === 'undefined') {
  setInterval(() => {
    rateLimiter.cleanup();
  }, 5 * 60 * 1000);
}

/**
 * Check rate limit for a given key
 */
export function checkRateLimit(
  identifier: string,
  endpoint: keyof typeof RateLimits
): boolean {
  const config = RateLimits[endpoint];
  const key = `${endpoint}:${identifier}`;
  return rateLimiter.check(key, config);
}

/**
 * Reset rate limit for a given key
 */
export function resetRateLimit(identifier: string, endpoint: keyof typeof RateLimits): void {
  const key = `${endpoint}:${identifier}`;
  rateLimiter.reset(key);
}

/**
 * Generate a secure random token
 */
export function generateSecureToken(length: number = 32): string {
  const array = new Uint8Array(length);
  if (typeof window !== 'undefined' && window.crypto) {
    window.crypto.getRandomValues(array);
  } else {
    // Node.js environment
    const crypto = require('crypto');
    crypto.randomFillSync(array);
  }
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Hash a password or sensitive data (server-side only)
 */
export async function hashSensitiveData(data: string): Promise<string> {
  if (typeof window !== 'undefined') {
    throw new Error('hashSensitiveData should only be used server-side');
  }
  
  const bcrypt = await import('bcryptjs');
  return bcrypt.hash(data, 12);
}

/**
 * Verify a hashed password or sensitive data (server-side only)
 */
export async function verifySensitiveData(data: string, hash: string): Promise<boolean> {
  if (typeof window !== 'undefined') {
    throw new Error('verifySensitiveData should only be used server-side');
  }
  
  const bcrypt = await import('bcryptjs');
  return bcrypt.compare(data, hash);
}

/**
 * Escape special characters in strings for safe database queries
 */
export function escapeString(str: string): string {
  return str
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t')
    .replace(/\x00/g, '\\0')
    .replace(/\x1a/g, '\\Z');
}

/**
 * Validate URL to prevent SSRF attacks
 */
export function isValidUrl(url: string, allowedHosts?: string[]): boolean {
  try {
    const parsed = new URL(url);
    
    // Only allow HTTPS in production
    if (process.env.NODE_ENV === 'production' && parsed.protocol !== 'https:') {
      return false;
    }
    
    // Check against allowed hosts if provided
    if (allowedHosts && !allowedHosts.includes(parsed.hostname)) {
      return false;
    }
    
    // Block local addresses to prevent SSRF
    const blockedHosts = [
      'localhost',
      '127.0.0.1',
      '0.0.0.0',
      '[::1]',
      '[::ffff:127.0.0.1]',
    ];
    
    if (blockedHosts.includes(parsed.hostname)) {
      return false;
    }
    
    // Block private IP ranges
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (ipRegex.test(parsed.hostname)) {
      const parts = parsed.hostname.split('.').map(Number);
      
      // 10.0.0.0/8
      if (parts[0] === 10) return false;
      
      // 172.16.0.0/12
      if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return false;
      
      // 192.168.0.0/16
      if (parts[0] === 192 && parts[1] === 168) return false;
    }
    
    return true;
  } catch {
    return false;
  }
}

/**
 * Content Security Policy header generator
 */
export function generateCSP(nonce?: string): string {
  const directives: Record<string, string[]> = {
    'default-src': ["'self'"],
    'script-src': [
      "'self'",
      nonce ? `'nonce-${nonce}'` : "'unsafe-inline'",
      'https://cdn.jsdelivr.net',
    ],
    'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
    'font-src': ["'self'", 'https://fonts.gstatic.com'],
    'img-src': [
      "'self'",
      'data:',
      'https://cdn.discordapp.com',
      'https://*.discordapp.com',
    ],
    'connect-src': ["'self'", 'https://discord.com', 'https://discordapp.com'],
    'frame-ancestors': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
    'object-src': ["'none'"],
  };
  
  return Object.entries(directives)
    .map(([key, values]) => `${key} ${values.join(' ')}`)
    .join('; ');
}

/**
 * CORS configuration for API routes
 */
export const corsHeaders = {
  'Access-Control-Allow-Origin': process.env.NEXTAUTH_URL || 'http://localhost:3000',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Max-Age': '86400',
};

/**
 * Security headers for all responses
 */
export const securityHeaders = {
  'X-DNS-Prefetch-Control': 'on',
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
};