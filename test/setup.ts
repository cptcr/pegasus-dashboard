import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: vi.fn(),
      replace: vi.fn(),
      prefetch: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
      refresh: vi.fn(),
    };
  },
  usePathname() {
    return '/';
  },
  useSearchParams() {
    return new URLSearchParams();
  },
}));

// Mock environment variables
vi.stubEnv('NEXT_PUBLIC_API_URL', 'http://localhost:3000');
vi.stubEnv('API_URL', 'http://localhost:2000');
vi.stubEnv('BOT_API_TOKEN', 'test-token');
vi.stubEnv('DATABASE_URL', 'postgresql://test:test@localhost:5432/test');
vi.stubEnv('DISCORD_CLIENT_ID', 'test-client-id');
vi.stubEnv('DISCORD_CLIENT_SECRET', 'test-client-secret');
vi.stubEnv('NEXTAUTH_URL', 'http://localhost:3000');
vi.stubEnv('NEXTAUTH_SECRET', 'test-secret-min-32-chars-long-for-testing');

// Mock fetch globally
global.fetch = vi.fn();

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));