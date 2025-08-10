import { AppError } from './errors';

/**
 * Error reporting service interface
 */
interface ErrorReporter {
  captureException(error: Error, context?: Record<string, unknown>): void;
  captureMessage(message: string, level?: 'info' | 'warning' | 'error'): void;
  setUser(user: { id: string; email?: string; username?: string }): void;
  setContext(key: string, context: Record<string, unknown>): void;
  addBreadcrumb(breadcrumb: {
    message: string;
    category?: string;
    level?: 'debug' | 'info' | 'warning' | 'error';
    data?: Record<string, unknown>;
  }): void;
}

/**
 * Performance monitoring interface
 */
interface PerformanceMonitor {
  startTransaction(name: string, op: string): Transaction;
  measureAsync<T>(name: string, fn: () => Promise<T>): Promise<T>;
}

interface Transaction {
  setData(key: string, value: unknown): void;
  setStatus(status: 'ok' | 'error' | 'cancelled'): void;
  finish(): void;
}

/**
 * Mock implementation for development
 */
class DevelopmentErrorReporter implements ErrorReporter {
  captureException(error: Error, context?: Record<string, unknown>): void {
    console.error('[Error Reporter]', error.message, {
      stack: error.stack,
      context,
      timestamp: new Date().toISOString(),
    });
  }

  captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info'): void {
    const logFn = level === 'error' ? console.error : level === 'warning' ? console.warn : console.info;
    logFn(`[${level.toUpperCase()}]`, message);
  }

  setUser(user: { id: string; email?: string; username?: string }): void {
    console.info('[User Context]', user);
  }

  setContext(key: string, context: Record<string, unknown>): void {
    console.info(`[Context: ${key}]`, context);
  }

  addBreadcrumb(breadcrumb: {
    message: string;
    category?: string;
    level?: 'debug' | 'info' | 'warning' | 'error';
    data?: Record<string, unknown>;
  }): void {
    console.info('[Breadcrumb]', breadcrumb);
  }
}

class DevelopmentPerformanceMonitor implements PerformanceMonitor {
  startTransaction(name: string, op: string): Transaction {
    const startTime = performance.now();
    const data: Record<string, unknown> = {};
    let status: 'ok' | 'error' | 'cancelled' = 'ok';

    return {
      setData(key: string, value: unknown): void {
        data[key] = value;
      },
      setStatus(s: 'ok' | 'error' | 'cancelled'): void {
        status = s;
      },
      finish(): void {
        const duration = performance.now() - startTime;
        console.info(`[Transaction] ${name} (${op})`, {
          duration: `${duration.toFixed(2)}ms`,
          status,
          data,
        });
      },
    };
  }

  async measureAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const startTime = performance.now();
    try {
      const result = await fn();
      const duration = performance.now() - startTime;
      console.info(`[Performance] ${name}: ${duration.toFixed(2)}ms`);
      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      console.error(`[Performance] ${name}: ${duration.toFixed(2)}ms (failed)`, error);
      throw error;
    }
  }
}

/**
 * Monitoring service singleton
 */
class MonitoringService {
  private errorReporter: ErrorReporter;
  private performanceMonitor: PerformanceMonitor;
  private initialized = false;

  constructor() {
    // Use development implementations by default
    this.errorReporter = new DevelopmentErrorReporter();
    this.performanceMonitor = new DevelopmentPerformanceMonitor();
  }

  /**
   * Initialize monitoring with Sentry in production
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    const isDevelopment = process.env.NODE_ENV === 'development';
    const sentryDsn = process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN;

    if (!isDevelopment && sentryDsn) {
      try {
        // Dynamically import Sentry only in production
        const Sentry = await import('@sentry/nextjs');
        
        Sentry.init({
          dsn: sentryDsn,
          environment: process.env.NODE_ENV,
          tracesSampleRate: 1.0,
          debug: false,
          integrations: [
            new Sentry.BrowserTracing(),
            new Sentry.Replay({
              maskAllText: true,
              blockAllMedia: true,
            }),
          ],
          beforeSend(event, hint) {
            // Filter out non-error events in production
            if (event.level === 'debug') return null;
            
            // Sanitize sensitive data
            if (event.request?.cookies) {
              delete event.request.cookies;
            }
            
            return event;
          },
        });

        // Use Sentry as the error reporter
        this.errorReporter = {
          captureException: (error, context) => {
            Sentry.withScope((scope) => {
              if (context) {
                Object.entries(context).forEach(([key, value]) => {
                  scope.setContext(key, value as Record<string, unknown>);
                });
              }
              Sentry.captureException(error);
            });
          },
          captureMessage: (message, level = 'info') => {
            Sentry.captureMessage(message, level);
          },
          setUser: (user) => {
            Sentry.setUser(user);
          },
          setContext: (key, context) => {
            Sentry.setContext(key, context);
          },
          addBreadcrumb: (breadcrumb) => {
            Sentry.addBreadcrumb(breadcrumb);
          },
        };

        // Use Sentry for performance monitoring
        this.performanceMonitor = {
          startTransaction: (name, op) => {
            const transaction = Sentry.startTransaction({ name, op });
            return {
              setData: (key, value) => transaction.setData(key, value),
              setStatus: (status) => transaction.setStatus(status),
              finish: () => transaction.finish(),
            };
          },
          measureAsync: async (name, fn) => {
            const transaction = Sentry.startTransaction({ name, op: 'async' });
            try {
              const result = await fn();
              transaction.setStatus('ok');
              return result;
            } catch (error) {
              transaction.setStatus('error');
              throw error;
            } finally {
              transaction.finish();
            }
          },
        };
      } catch (error) {
        console.error('Failed to initialize Sentry:', error);
      }
    }

    this.initialized = true;
  }

  /**
   * Report an error with context
   */
  reportError(error: Error | unknown, context?: Record<string, unknown>): void {
    const errorObj = error instanceof Error ? error : new Error(String(error));
    
    // Add breadcrumb for error
    this.addBreadcrumb({
      message: `Error: ${errorObj.message}`,
      category: 'error',
      level: 'error',
      data: context,
    });

    this.errorReporter.captureException(errorObj, context);
  }

  /**
   * Report a message
   */
  reportMessage(message: string, level: 'info' | 'warning' | 'error' = 'info'): void {
    this.errorReporter.captureMessage(message, level);
  }

  /**
   * Set user context
   */
  setUser(user: { id: string; email?: string; username?: string } | null): void {
    if (user) {
      this.errorReporter.setUser(user);
    }
  }

  /**
   * Add context information
   */
  setContext(key: string, context: Record<string, unknown>): void {
    this.errorReporter.setContext(key, context);
  }

  /**
   * Add breadcrumb for debugging
   */
  addBreadcrumb(breadcrumb: {
    message: string;
    category?: string;
    level?: 'debug' | 'info' | 'warning' | 'error';
    data?: Record<string, unknown>;
  }): void {
    this.errorReporter.addBreadcrumb(breadcrumb);
  }

  /**
   * Start a performance transaction
   */
  startTransaction(name: string, op: string): Transaction {
    return this.performanceMonitor.startTransaction(name, op);
  }

  /**
   * Measure async operation performance
   */
  measureAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
    return this.performanceMonitor.measureAsync(name, fn);
  }

  /**
   * Track API call
   */
  async trackApiCall<T>(
    endpoint: string,
    fn: () => Promise<T>
  ): Promise<T> {
    const transaction = this.startTransaction(`API: ${endpoint}`, 'http.client');
    
    try {
      const result = await fn();
      transaction.setStatus('ok');
      return result;
    } catch (error) {
      transaction.setStatus('error');
      this.reportError(error, { endpoint });
      throw error;
    } finally {
      transaction.finish();
    }
  }

  /**
   * Track database query
   */
  async trackDatabaseQuery<T>(
    query: string,
    fn: () => Promise<T>
  ): Promise<T> {
    const transaction = this.startTransaction(`DB: ${query}`, 'db.query');
    
    try {
      const result = await fn();
      transaction.setStatus('ok');
      return result;
    } catch (error) {
      transaction.setStatus('error');
      this.reportError(error, { query });
      throw error;
    } finally {
      transaction.finish();
    }
  }
}

// Export singleton instance
export const monitoring = new MonitoringService();

// Initialize monitoring on module load
if (typeof window !== 'undefined') {
  monitoring.initialize().catch(console.error);
}

/**
 * Custom hook for monitoring in React components
 */
export function useMonitoring() {
  return {
    reportError: (error: Error | unknown, context?: Record<string, unknown>) =>
      monitoring.reportError(error, context),
    reportMessage: (message: string, level?: 'info' | 'warning' | 'error') =>
      monitoring.reportMessage(message, level),
    addBreadcrumb: (breadcrumb: Parameters<typeof monitoring.addBreadcrumb>[0]) =>
      monitoring.addBreadcrumb(breadcrumb),
    measureAsync: <T>(name: string, fn: () => Promise<T>) =>
      monitoring.measureAsync(name, fn),
  };
}

