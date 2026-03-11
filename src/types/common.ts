/**
 * Common utility types and interfaces
 */

// Address type (Ethereum address)
export type Address = `0x${string}`;

// Transaction hash type
export type TransactionHash = `0x${string}`;

// BigNumber string type for precise decimal calculations
export type BigNumberString = string;

// Timestamp (Unix timestamp in milliseconds)
export type Timestamp = number;

// Chain ID type
export type ChainId = number;

// Token amount with decimals
export interface TokenAmount {
  amount: BigNumberString;
  decimals: number;
  symbol: string;
  address: Address;
}

// Price information
export interface Price {
  value: BigNumberString;
  currency: string;
  timestamp: Timestamp;
}

// Transaction result
export interface TransactionResult {
  hash: TransactionHash;
  chainId: ChainId;
  blockNumber?: number;
  blockHash?: string;
  gasUsed?: BigNumberString;
  gasPrice?: BigNumberString;
  status?: 'success' | 'failed';
  timestamp?: Timestamp;
}

// Gas estimation
export interface GasEstimation {
  gasLimit: BigNumberString;
  gasPrice: BigNumberString;
  maxFeePerGas?: BigNumberString;
  maxPriorityFeePerGas?: BigNumberString;
  estimatedCost: BigNumberString;
}

// Wallet connection info
export interface WalletInfo {
  address: Address;
  chainId: ChainId;
  connected: boolean;
  balance?: TokenAmount[];
}

// Network information
export interface NetworkInfo {
  chainId: ChainId;
  name: string;
  rpcUrl: string;
  blockExplorer: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
}

// SDK configuration
export interface SDKConfig {
  chainId: ChainId;
  rpcUrl?: string;
  apiBaseUrl?: string;
  wsUrl?: string;
  debug?: boolean;
  timeout?: number;
  retries?: number;
}

// Callback function types
export type EventCallback<T = any> = (data: T) => void;
export type ErrorCallback = (error: Error) => void;
export type SuccessCallback<T = any> = (result: T) => void;

// Generic API response wrapper
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: number;
    message: string;
    details?: any;
  };
  timestamp: Timestamp;
}

// Subscription management
export interface Subscription {
  id: string;
  channel: string;
  active: boolean;
  callback: EventCallback;
  createdAt: Timestamp;
}

// Rate limiting
export interface RateLimit {
  requests: number;
  windowMs: number;
  remaining: number;
  resetTime: Timestamp;
}

// Utility types for making properties optional/required
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// Deep partial type
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// Pick properties by type
export type PickByType<T, U> = {
  [K in keyof T as T[K] extends U ? K : never]: T[K];
};

// Exclude properties by type
export type ExcludeByType<T, U> = {
  [K in keyof T as T[K] extends U ? never : K]: T[K];
};

// Key-value pair
export interface KeyValuePair<K = string, V = any> {
  key: K;
  value: V;
}

// Configuration with validation
export interface ConfigWithValidation<T> {
  value: T;
  isValid: boolean;
  errors: string[];
}

// Async operation state
export interface AsyncOperationState<T = any> {
  loading: boolean;
  data?: T;
  error?: Error;
  lastUpdated?: Timestamp;
}

// Cache entry
export interface CacheEntry<T = any> {
  key: string;
  value: T;
  expiresAt: Timestamp;
  createdAt: Timestamp;
}

// Event emitter types
export type EventMap = Record<string, any>;
export type EventKey<T extends EventMap> = string & keyof T;
export type EventReceiver<T> = (params: T) => void;

// Branded types for type safety
export type Brand<T, B> = T & { __brand: B };
export type PositionId = Brand<string, 'PositionId'>;
export type OrderId = Brand<string, 'OrderId'>;
export type PoolId = Brand<string, 'PoolId'>;
