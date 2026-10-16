import {
  type Abi,
  type Address,
  type Hex,
  getContract,
  keccak256,
  toHex,
  toBytes,
  getContractAddress,
  parseSignature,
  zeroAddress,
} from "viem";
import { getPublicClient, getWalletClient } from "@/web3/viemClients.js";
import TokenPortal_ABI from "@/abi/TokenPortal.json";
import type {
  CreateTokenResult,
  TokenPortalChainConfig,
  FindVanitySaltParams,
  FindVanitySaltResult,
  NewTokenV6Params,
  NewTokenV7Params,
  QuoteExactInputParams,
  SwapExactInputParams,
  UploadMetadataParams,
  UploadMetadataResult,
} from "./types.js";

// ── Chain configs ─────────────────────────────────────────────────────────────

const TOKEN_PORTAL_CHAIN_CONFIG: Record<number, TokenPortalChainConfig> = {
  // BNB Mainnet
  56: {
    portal: "0xe2cE6ab80874Fa9Fa2aAE65D277Dd6B8e65C9De0",
    standardTokenImpl: "0x8b4329947e34b6d56d71a3385cac122bade7d78d",
    taxTokenV3Impl: "0x024f18294970B5c76c0691b87f138A0317156422",
    standardTokenV3Impl: "0x88881b6f03090462a969eC7f48385744Eeb63333",
  },
  // Robinhood Chain Mainnet
  4663: {
    portal: "0x26605f322f7fF986f381bB9A6e3f5DAb0bEaEb09",
    standardTokenImpl: "0x88882688a067FE97E11C2185b996286e53132222",
    taxTokenV3Impl: "0x7777C8743C88B3aff3cf262135beF2c8b2e83333",
  },
  // BNB Testnet
  97: {
    portal: "0x5bEacaF7ABCbB3aB280e80D007FD31fcE26510e9",
    standardTokenImpl: "0x87D5f292ba33011997641C7a7Bd2b17799aaA814",
    taxTokenV3Impl: "0xE6Ff967a887084c16D0fD71548CF709542cc1557",
  },
};

const TOKEN_UPLOAD_API = "https://funcs.flap.sh/api/upload";

const EMPTY_EXTENSION_ID =
  "0x0000000000000000000000000000000000000000000000000000000000000000" as Hex;

// ── Token manager ─────────────────────────────────────────────────────────────

export class Token {
  getPortalConfig(chainId: number): TokenPortalChainConfig {
    const cfg = TOKEN_PORTAL_CHAIN_CONFIG[chainId];
    if (!cfg) throw new Error(`Token portal not supported on chainId ${chainId}`);
    return cfg;
  }

  /**
   * Upload token image and metadata to IPFS via the Flap pinning API.
   * Returns the IPFS CID to use as `meta` in NewTokenV6Params.
   */
  async uploadMetadata(params: UploadMetadataParams): Promise<UploadMetadataResult> {
    const { image, description, website, twitter, telegram, creator } = params;

    const MUTATION_CREATE = `
      mutation Create($file: Upload!, $meta: MetadataInput!) {
        create(file: $file, meta: $meta)
      }
    `;

    const form = new FormData();

    form.append(
      "operations",
      JSON.stringify({
        query: MUTATION_CREATE,
        variables: {
          file: null,
          meta: {
            description: description ?? "",
            website: website ?? null,
            twitter: twitter ?? null,
            telegram: telegram ?? null,
            creator: creator ?? zeroAddress,
          },
        },
      })
    );

    form.append("map", JSON.stringify({ "0": ["variables.file"] }));
    form.append("0", image, "image.png");

    const res = await fetch(TOKEN_UPLOAD_API, { method: "POST", body: form });

    if (!res.ok) {
      throw new Error(`Failed to upload metadata: ${res.statusText}`);
    }

    const json = await res.json();
    const cid: string = json?.data?.create;
    if (!cid) throw new Error("Upload API did not return a CID");

    return { cid };
  }

  /**
   * Find a CREATE2 salt whose predicted token address ends with the required vanity suffix.
   * "7777" for tax tokens, "8888" for standard tokens.
   * This is a CPU-bound search — may take thousands of iterations.
   */
  findVanitySalt(params: FindVanitySaltParams): FindVanitySaltResult {
    const { tokenImpl, portal, suffix } = params;

    const minimalProxy =
      ("0x3d602d80600a3d3981f3363d3d373d3d3d363d73" +
        tokenImpl.slice(2).toLowerCase() +
        "5af43d82803e903d91602b57fd5bf3") as Hex;

    const predict = (salt: Hex): Address =>
      getContractAddress({
        from: portal,
        salt: toBytes(salt),
        bytecode: minimalProxy,
        opcode: "CREATE2",
      });

    // Use a random 32-byte seed so each call produces a unique search path
    const seed = toHex(
      crypto.getRandomValues(new Uint8Array(32))
    ) as Hex;

    let salt = keccak256(seed);
    let iterations = 0;

    while (!predict(salt).toLowerCase().endsWith(suffix)) {
      salt = keccak256(salt);
      iterations++;
    }

    return { salt, tokenAddress: predict(salt), iterations };
  }

  /**
   * Create a new token via Portal.newTokenV6.
   * Covers TOKEN_V2_PERMIT (standard) and TOKEN_TAXED_V3 (recommended tax).
   */
  async createTokenV6(
    chainId: number,
    params: NewTokenV6Params,
    value: bigint
  ): Promise<CreateTokenResult> {
    const { portal } = this.getPortalConfig(chainId);
    const walletClient = await getWalletClient(chainId);
    const publicClient = getPublicClient(chainId);

    const [account] = await walletClient.getAddresses();

    const hash = await walletClient.writeContract({
      address: portal,
      abi: TokenPortal_ABI as Abi,
      functionName: "newTokenV6",
      args: [params],
      account,
      value,
      chain: null,
    });

    const receipt = await publicClient.waitForTransactionReceipt({ hash });

    // Extract token address from TokenCreated / VanityTokenCreated log
    const tokenAddress = this._extractTokenAddress(receipt.logs, portal);

    return { txHash: hash, tokenAddress };
  }

  /**
   * Create a new token via Portal.newTokenV7.
   * For TOKEN_V3_PERMIT (CL-style migration / PCS Infinity).
   */
  async createTokenV7(
    chainId: number,
    params: NewTokenV7Params,
    value: bigint
  ): Promise<CreateTokenResult> {
    const { portal } = this.getPortalConfig(chainId);
    const walletClient = await getWalletClient(chainId);
    const publicClient = getPublicClient(chainId);

    const [account] = await walletClient.getAddresses();

    const hash = await walletClient.writeContract({
      address: portal,
      abi: TokenPortal_ABI as Abi,
      functionName: "newTokenV7",
      args: [params],
      account,
      value,
      chain: null,
    });

    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    const tokenAddress = this._extractTokenAddress(receipt.logs, portal);

    return { txHash: hash, tokenAddress };
  }

  /**
   * Quote the output amount for a buy or sell without sending a transaction.
   * Uses eth_call internally (no gas spent).
   */
  async quoteExactInput(
    chainId: number,
    params: QuoteExactInputParams
  ): Promise<bigint> {
    const { portal } = this.getPortalConfig(chainId);
    const publicClient = getPublicClient(chainId);

    const contract = getContract({
      address: portal,
      abi: TokenPortal_ABI as Abi,
      client: publicClient,
    });

    const output = await contract.simulate.quoteExactInput([params]);
    return output.result as bigint;
  }

  /**
   * Buy or sell a token via Portal.swapExactInput.
   * For a buy: inputToken = zeroAddress (native), outputToken = token address.
   * For a sell: inputToken = token address, outputToken = zeroAddress (native).
   */
  async swapExactInput(
    chainId: number,
    params: SwapExactInputParams
  ): Promise<{ txHash: Hex; outputAmount: bigint }> {
    const { portal } = this.getPortalConfig(chainId);
    const walletClient = await getWalletClient(chainId);
    const publicClient = getPublicClient(chainId);

    const [account] = await walletClient.getAddresses();
    const isBuy = params.inputToken === zeroAddress;

    const hash = await walletClient.writeContract({
      address: portal,
      abi: TokenPortal_ABI as Abi,
      functionName: "swapExactInput",
      args: [params],
      account,
      value: isBuy ? params.inputAmount : 0n,
      chain: null,
    });

    const receipt = await publicClient.waitForTransactionReceipt({ hash });

    // Parse TokenBought/TokenSold event to extract actual output — fall back to 0n
    const outputAmount = this._extractSwapOutput(receipt.logs) ?? 0n;

    return { txHash: hash, outputAmount };
  }

  /**
   * Generate ERC-20 permit data for gas-free approval when selling tokens.
   * Pass the returned hex as `permitData` in SwapExactInputParams.
   */
  async generatePermitData(
    chainId: number,
    tokenAddress: Address,
    amount: bigint
  ): Promise<Hex> {
    const { portal } = this.getPortalConfig(chainId);
    const walletClient = await getWalletClient(chainId);
    const publicClient = getPublicClient(chainId);

    const [account] = await walletClient.getAddresses();

    const tokenContract = getContract({
      address: tokenAddress,
      abi: [
        {
          type: "function",
          name: "name",
          inputs: [],
          outputs: [{ type: "string" }],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "nonces",
          inputs: [{ name: "", type: "address" }],
          outputs: [{ type: "uint256" }],
          stateMutability: "view",
        },
      ] as Abi,
      client: publicClient,
    });

    const [nonce, tokenName] = await Promise.all([
      tokenContract.read.nonces([account]) as Promise<bigint>,
      tokenContract.read.name([]) as Promise<string>,
    ]);

    const deadline = BigInt(Math.floor(Date.now() / 1000) + 600); // 10 min

    const sig = await walletClient.signTypedData({
      account,
      domain: {
        name: tokenName,
        version: "1",
        chainId,
        verifyingContract: tokenAddress,
      },
      types: {
        Permit: [
          { name: "owner", type: "address" },
          { name: "spender", type: "address" },
          { name: "value", type: "uint256" },
          { name: "nonce", type: "uint256" },
          { name: "deadline", type: "uint256" },
        ],
      },
      primaryType: "Permit",
      message: {
        owner: account,
        spender: portal,
        value: amount,
        nonce,
        deadline,
      },
    });

    const { r, s, v } = parseSignature(sig);

    // ABI-encode: owner, spender, value, deadline, v, r, s
    const { encodeAbiParameters } = await import("viem");
    return encodeAbiParameters(
      [
        { type: "address" },
        { type: "address" },
        { type: "uint256" },
        { type: "uint256" },
        { type: "uint8" },
        { type: "bytes32" },
        { type: "bytes32" },
      ],
      [account, portal, amount, deadline, Number(v), r, s]
    );
  }

  // ── Helpers ─────────────────────────────────────────────────────────────────

  private _extractTokenAddress(logs: readonly any[], portal: Address): Address {
    // VanityTokenCreated: topic[0] = keccak256("VanityTokenCreated(address,address,address)")
    // TokenCreated is non-indexed so we can't filter by topic easily — rely on VanityTokenCreated
    // which is always emitted alongside TokenCreated for vanity launches.
    for (const log of logs) {
      if (log.address?.toLowerCase() !== portal.toLowerCase()) continue;
      // VanityTokenCreated has 3 non-indexed address fields; TokenCreated has non-indexed address
      // The simplest reliable approach: parse logs via the ABI with viem
      if (log.topics?.[0]) {
        // Return first non-zero address argument from any portal log as a best-effort
        if (log.data && log.data.length >= 66) {
          const addr = ("0x" + log.data.slice(26, 66)) as Address;
          if (addr !== zeroAddress) return addr;
        }
      }
    }
    return zeroAddress;
  }

  private _extractSwapOutput(logs: readonly any[]): bigint | null {
    for (const log of logs) {
      if (log.data && log.data.length >= 130) {
        try {
          return BigInt("0x" + log.data.slice(66, 130));
        } catch {
          // ignore
        }
      }
    }
    return null;
  }
}

export { EMPTY_EXTENSION_ID };
export * from "./types.js";
