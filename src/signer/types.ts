/**
 * Minimal signer interface supported by the SDK.
 * Implementations can wrap ethers v5/v6 Signer or viem WalletClient
 * so that the SDK does not depend on a specific version.
 */
export interface ISigner {
  getAddress(): Promise<string>;
  signMessage(message: string | Uint8Array): Promise<string>;
  sendTransaction(tx: {
    to?: string;
    data?: string;
    value?: bigint | string;
    gasLimit?: bigint | string;
    gasPrice?: bigint | string;
    maxFeePerGas?: bigint | string;
    maxPriorityFeePerGas?: bigint | string;
  }): Promise<{ hash: string }>;
  /** EIP-712 signTypedData; required for permit/forwarder flows when using ISigner. */
  signTypedData?(params: { domain: Record<string, unknown>; types: Record<string, unknown>; primaryType: string; message: Record<string, unknown> }): Promise<string>;
}

/**
 * Type that the SDK accepts as "signer" in auth():
 * - ISigner (generic)
 * - viem WalletClient
 * - Any object with getAddress, signMessage, sendTransaction (ethers v5/v6 Signer)
 */
export type SignerLike = ISigner | WalletClientLike | MinimalSignerLike;

export interface MinimalSignerLike {
  getAddress(): Promise<string>;
  signMessage(message: string | Uint8Array): Promise<string>;
  sendTransaction(tx: Record<string, unknown>): Promise<{ hash: string }>;
}

// Viem WalletClient is not imported here to avoid hard dependency; use type-only shape
export type WalletClientLike = {
  getAddresses(): Promise<readonly `0x${string}`[]>;
  signMessage(args: { message: string | { raw: Uint8Array } }): Promise<`0x${string}`>;
  sendTransaction(args: {
    to: `0x${string}`;
    data?: `0x${string}`;
    value?: bigint;
    gas?: bigint;
    gasPrice?: bigint;
    maxFeePerGas?: bigint;
    maxPriorityFeePerGas?: bigint;
  }): Promise<`0x${string}`>;
  transport?: { request(args: { method: string; params?: unknown[] }): Promise<unknown> };
};
