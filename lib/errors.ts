
/**
 * API Response types for error handling
 */
export type ApiResponse<T> = 
  | { success: true; data: T }
  | { success: false; error: ApiError };

export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
  timestamp?: string;
  path?: string;
}

/**
 * Custom error classes
 */
export class AppError extends Error {
  constructor(
    message: string,
    public code: string = 'APP_ERROR',
    public statusCode: number = 500,
    public details?: unknown
  ) {
    super(message);
    this.name = 'AppError';
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export class ApiRequestError extends AppError {
  constructor(message: string, statusCode: number = 500, details?: unknown) {
    super(message, 'API_REQUEST_ERROR', statusCode, details);
    this.name = 'ApiRequestError';
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, 'AUTH_ERROR', 401);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Insufficient permissions') {
    super(message, 'AUTHZ_ERROR', 403);
    this.name = 'AuthorizationError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 'VALIDATION_ERROR', 400, details);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, 'NOT_FOUND', 404);
    this.name = 'NotFoundError';
  }
}

export class RateLimitError extends AppError {
  constructor(retryAfter?: number) {
    super('Rate limit exceeded', 'RATE_LIMIT', 429, { retryAfter });
    this.name = 'RateLimitError';
  }
}

/**
 * Error handling utilities
 */
export async function safeApiCall<T>(
  operation: () => Promise<T>,
  fallback: T,
  errorContext: string
): Promise<ApiResponse<T>> {
  try {
    const data = await operation();
    return { success: true, data };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorDetails = error instanceof AppError ? error.details : error;
    
    // Log error for monitoring
    if (typeof window === 'undefined') {
      // Server-side logging
      console.error(`[${errorContext}] API Error:`, {
        message: errorMessage,
        details: errorDetails,
        timestamp: new Date().toISOString()
      });
    }
    
    return {
      success: false,
      error: {
        code: error instanceof AppError ? error.code : 'API_ERROR',
        message: errorMessage,
        details: errorDetails,
        timestamp: new Date().toISOString(),
        path: errorContext
      }
    };
  }
}

/**
 * Retry with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 1000
): Promise<T> {
  let lastError: Error | undefined;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      
      if (i < maxRetries - 1) {
        const delay = initialDelay * Math.pow(2, i);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
}

/**
 * Transaction wrapper for database operations
 */
export async function withTransaction<T>(
  operation: (tx: any) => Promise<T>,
  db: any
): Promise<T> {
  const connection = await db.getConnection();
  const transaction = await connection.beginTransaction();
  
  try {
    const result = await operation(transaction);
    await transaction.commit();
    return result;
  } catch (error) {
    await transaction.rollback();
    throw new AppError(
      `Transaction failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'TRANSACTION_ERROR',
      500,
      error
    );
  } finally {
    await connection.release();
  }
}


/**
 * Error message formatter
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof AppError) {
    return error.message;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message);
  }
  
  return 'An unexpected error occurred';
}

/**
 * Format error for user display
 */
export function formatErrorForUser(error: unknown): {
  title: string;
  message: string;
  action?: string;
} {
  if (error instanceof AuthenticationError) {
    return {
      title: 'Authentication Required',
      message: 'Please log in to continue',
      action: 'Login'
    };
  }
  
  if (error instanceof AuthorizationError) {
    return {
      title: 'Access Denied',
      message: 'You do not have permission to perform this action',
      action: 'Go Back'
    };
  }
  
  if (error instanceof ValidationError) {
    return {
      title: 'Invalid Input',
      message: error.message,
      action: 'Try Again'
    };
  }
  
  if (error instanceof NotFoundError) {
    return {
      title: 'Not Found',
      message: error.message,
      action: 'Go Home'
    };
  }
  
  if (error instanceof RateLimitError) {
    return {
      title: 'Too Many Requests',
      message: 'Please wait a moment before trying again',
      action: 'Retry'
    };
  }
  
  if (error instanceof ApiRequestError) {
    return {
      title: 'Connection Error',
      message: 'Unable to connect to the server. Please check your connection.',
      action: 'Retry'
    };
  }
  
  return {
    title: 'Error',
    message: getErrorMessage(error),
    action: 'Try Again'
  };
}

/**
 * Safe JSON parse with error handling
 */
export function safeJsonParse<T>(
  json: string,
  fallback: T
): T {
  try {
    return JSON.parse(json) as T;
  } catch {
    return fallback;
  }
}

/**
 * Type guard for API errors
 */
export function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'message' in error &&
    typeof (error as ApiError).code === 'string' &&
    typeof (error as ApiError).message === 'string'
  );
}

/**
 * Type guard for successful API response
 */
export function isApiSuccess<T>(
  response: ApiResponse<T>
): response is { success: true; data: T } {
  return response.success === true;
}

/**
 * Extract data from API response or throw
 */
export function unwrapApiResponse<T>(response: ApiResponse<T>): T {
  if (isApiSuccess(response)) {
    return response.data;
  }
  
  throw new ApiRequestError(
    response.error.message,
    500,
    response.error.details
  );
}