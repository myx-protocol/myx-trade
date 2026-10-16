import type { Address, Hex } from "viem";

// ── Enums ────────────────────────────────────────────────────────────────────

export enum TokenVersion {
  TOKEN_LEGACY_MINT_NO_PERMIT = 0,
  TOKEN_LEGACY_MINT_NO_PERMIT_DUPLICATE = 1,
  TOKEN_V2_PERMIT = 2,
  TOKEN_GOPLUS = 3,
  TOKEN_TAXED = 4,
  TOKEN_TAXED_V2 = 5,
  TOKEN_TAXED_V3 = 6,
  TOKEN_V3_PERMIT = 7,
}

export enum DexThreshType {
  TWO_THIRDS = 0,   // 66.67%
  FOUR_FIFTHS = 1,  // 80%
  HALF = 2,         // 50%
  _95_PERCENT = 3,  // 95%
  _81_PERCENT = 4,  // 81%
  _1_PERCENT = 5,   // 1% (testing only)
}

export enum MigratorType {
  V3_MIGRATOR = 0,
  V2_MIGRATOR = 1,
  V4_UNI_MIGRATOR = 2,
  PCS_INFINITY_CL_MIGRATOR = 3,
}

export enum DEXId {
  DEX0 = 0,
  DEX1 = 1,
  DEX2 = 2,
}

export enum V3LPFeeProfile {
  LP_FEE_PROFILE_STANDARD = 0,
  LP_FEE_PROFILE_LOW = 1,
  LP_FEE_PROFILE_HIGH = 2,
}

export enum FeeType {
  NONE = 0,
  MARKETING_OR_VAULT = 1,
  DIVIDEND = 2,
  DEFLATION = 3,
  LP_BPS = 4,
}

// ── Core params ───────────────────────────────────────────────────────────────

export interface NewTokenV6Params {
  name: string;
  symbol: string;
  /** IPFS CID of metadata JSON */
  meta: string;
  dexThresh: DexThreshType;
  /** CREATE2 salt — must produce the correct vanity suffix */
  salt: Hex;
  migratorType: MigratorType;
  /** Native gas token = zeroAddress */
  quoteToken: Address;
  /** Initial quote amount (in wei) to seed the bonding curve */
  quoteAmt: bigint;
  /** Beneficiary address for tax revenue */
  beneficiary: Address;
  permitData: Hex;
  extensionID: Hex;
  extensionData: Hex;
  dexId: DEXId;
  lpFeeProfile: V3LPFeeProfile;
  // Tax fields — set to 0 for non-tax tokens
  buyTaxRate: number;
  sellTaxRate: number;
  taxDuration: bigint;
  antiFarmerDuration: bigint;
  /** mktBps + deflationBps + dividendBps + lpBps must equal 10000 */
  mktBps: number;
  deflationBps: number;
  dividendBps: number;
  lpBps: number;
  minimumShareBalance: bigint;
  dividendToken: Address;
  commissionReceiver: Address;
  tokenVersion: TokenVersion;
}

export interface FeeConfig {
  feeType: FeeType;
  bps: number;
  marketingAddress: Address;
  dividendToken: Address;
  minimumShareBalance: bigint;
}

export interface NewTokenV7Params {
  name: string;
  symbol: string;
  meta: string;
  dexThresh: DexThreshType;
  salt: Hex;
  migratorType: MigratorType;
  quoteToken: Address;
  quoteAmt: bigint;
  permitData: Hex;
  extensionID: Hex;
  extensionData: Hex;
  dexId: DEXId;
  buyTaxRate: number;
  sellTaxRate: number;
  taxDuration: bigint;
  antiFarmerDuration: bigint;
  commissionReceiver: Address;
  tokenVersion: TokenVersion;
  /** Exactly 4 FeeConfig entries; bps values must sum to 10000 */
  feeConfigs: [FeeConfig, FeeConfig, FeeConfig, FeeConfig];
}

// ── Metadata ──────────────────────────────────────────────────────────────────

export interface TokenMetadata {
  description?: string;
  website?: string | null;
  twitter?: string | null;
  telegram?: string | null;
  creator?: string;
}

export interface UploadMetadataParams extends TokenMetadata {
  /** Image as File (browser) or Buffer/Blob */
  image: File | Blob;
}

export interface UploadMetadataResult {
  /** IPFS CID to pass as `meta` in NewTokenV6Params */
  cid: string;
}

// ── Vanity salt ───────────────────────────────────────────────────────────────

export interface FindVanitySaltParams {
  /** Token implementation address (from deployed-contract-addresses) */
  tokenImpl: Address;
  /** Portal contract address */
  portal: Address;
  /** 4-character suffix: "7777" for tax tokens, "8888" for standard tokens */
  suffix: "7777" | "8888";
}

export interface FindVanitySaltResult {
  salt: Hex;
  tokenAddress: Address;
  iterations: number;
}

// ── Create token result ───────────────────────────────────────────────────────

export interface CreateTokenResult {
  txHash: Hex;
  tokenAddress: Address;
}

// ── Trade ─────────────────────────────────────────────────────────────────────

export interface QuoteExactInputParams {
  /** Input token address; zeroAddress = native gas */
  inputToken: Address;
  /** Output token address; zeroAddress = native gas */
  outputToken: Address;
  /** Amount of inputToken in raw units (wei) */
  inputAmount: bigint;
}

export interface SwapExactInputParams {
  inputToken: Address;
  outputToken: Address;
  inputAmount: bigint;
  minOutputAmount: bigint;
  /** ERC-20 permit data for gas-free approval on sells; use "0x" to skip */
  permitData: Hex;
}

export interface TokenPortalChainConfig {
  portal: Address;
  standardTokenImpl: Address;
  taxTokenV3Impl: Address;
  standardTokenV3Impl?: Address;
}
