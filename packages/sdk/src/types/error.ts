/**
 * Error types and error handling
 */

// Error codes enum
export const ErrorCode = {
  // Network errors (1000-1999)
  NETWORK_ERROR: 1000,
  CONNECTION_TIMEOUT: 1001,
  CONNECTION_REFUSED: 1002,
  DNS_RESOLUTION_FAILED: 1003,

  // Authentication errors (2000-2999)
  AUTHENTICATION_FAILED: 2000,
  INVALID_API_KEY: 2001,
  EXPIRED_TOKEN: 2002,
  INSUFFICIENT_PERMISSIONS: 2003,

  // Validation errors (3000-3999)
  INVALID_PARAMETERS: 3000,
  MISSING_REQUIRED_FIELD: 3001,
  INVALID_FORMAT: 3002,
  VALUE_OUT_OF_RANGE: 3003,
  INVALID_ADDRESS: 3004,
  INVALID_AMOUNT: 3005,

  // Trading errors (4000-4999)
  INSUFFICIENT_BALANCE: 4000,
  INSUFFICIENT_LIQUIDITY: 4001,
  INVALID_SLIPPAGE: 4002,
  ORDER_SIZE_TOO_SMALL: 4003,
  ORDER_SIZE_TOO_LARGE: 4004,
  INVALID_LEVERAGE: 4005,
  POSITION_NOT_FOUND: 4006,
  ORDER_NOT_FOUND: 4007,
  MARKET_CLOSED: 4008,
  PRICE_TOO_HIGH: 4009,
  PRICE_TOO_LOW: 4010,

  // Pool errors (5000-5999)
  POOL_NOT_FOUND: 5000,
  POOL_INACTIVE: 5001,
  POOL_SUSPENDED: 5002,
  POOL_MAINTENANCE: 5003,
  INVALID_POOL_STATE: 5004,

  // Contract errors (6000-6999)
  CONTRACT_EXECUTION_FAILED: 6000,
  GAS_ESTIMATION_FAILED: 6001,
  TRANSACTION_REVERTED: 6002,
  INSUFFICIENT_GAS: 6003,
  NONCE_TOO_LOW: 6004,
  NONCE_TOO_HIGH: 6005,

  // System errors (9000-9999)
  INTERNAL_SERVER_ERROR: 9000,
  SERVICE_UNAVAILABLE: 9001,
  RATE_LIMIT_EXCEEDED: 9002,
  MAINTENANCE_MODE: 9003,
  UNKNOWN_ERROR: 9999
} as const;
export type ErrorCode = typeof ErrorCode[keyof typeof ErrorCode];

// Base SDK error class
export class SDKError extends Error {
  public readonly code: ErrorCode;
  public readonly details?: any;
  public readonly timestamp: number;

  constructor(code: ErrorCode, message: string, details?: any) {
    super(message);
    this.name = 'SDKError';
    this.code = code;
    this.details = details;
    this.timestamp = Date.now();

    // Maintain proper stack trace for where our error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, SDKError);
    }
  }

  toJSON() {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      details: this.details,
      timestamp: this.timestamp,
      stack: this.stack
    };
  }
}

// Network error
export class NetworkError extends SDKError {
  constructor(message: string, details?: any) {
    super(ErrorCode.NETWORK_ERROR, message, details);
    this.name = 'NetworkError';
  }
}

// Validation error
export class ValidationError extends SDKError {
  public readonly field?: string;

  constructor(message: string, field?: string, details?: any) {
    super(ErrorCode.INVALID_PARAMETERS, message, details);
    this.name = 'ValidationError';
    this.field = field;
  }
}

// Trading error
export class TradingError extends SDKError {
  constructor(code: ErrorCode, message: string, details?: any) {
    super(code, message, details);
    this.name = 'TradingError';
  }
}

// Contract error
export class ContractError extends SDKError {
  public readonly transactionHash?: string;

  constructor(code: ErrorCode, message: string, transactionHash?: string, details?: any) {
    super(code, message, details);
    this.name = 'ContractError';
    this.transactionHash = transactionHash;
  }
}

// API error
export class ApiError extends SDKError {
  public readonly statusCode?: number;
  public readonly response?: any;

  constructor(code: ErrorCode, message: string, statusCode?: number, response?: any) {
    super(code, message, response);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.response = response;
  }
}

// Error factory for creating specific error types
export class ErrorFactory {
  static createNetworkError(message: string, details?: any): NetworkError {
    return new NetworkError(message, details);
  }

  static createValidationError(message: string, field?: string, details?: any): ValidationError {
    return new ValidationError(message, field, details);
  }

  static createTradingError(code: ErrorCode, message: string, details?: any): TradingError {
    return new TradingError(code, message, details);
  }

  static createContractError(code: ErrorCode, message: string, transactionHash?: string, details?: any): ContractError {
    return new ContractError(code, message, transactionHash, details);
  }

  static createApiError(code: ErrorCode, message: string, statusCode?: number, response?: any): ApiError {
    return new ApiError(code, message, statusCode, response);
  }
}

// Error handler type
export type ErrorHandler = (error: SDKError) => void;

// Error retry configuration
export interface RetryConfig {
  maxRetries: number;
  retryDelay: number;
  exponentialBackoff: boolean;
  retryableErrors: ErrorCode[];
}
