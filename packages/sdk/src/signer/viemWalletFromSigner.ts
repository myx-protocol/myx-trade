/**
 * Creates a viem WalletClient that uses ISigner for eth_sendTransaction and signTypedData.
 * Uses a local account that delegates to signer so getAddresses() and signTypedData work.
 */
import { createWalletClient, custom, type WalletClient } from "viem";
import { getChainInfo } from "@/config/chains/index.js";
import { ChainId } from "@/config/chain.js";
import type { ISigner } from "./types.js";

function getRpcUrl(chainId: number): string {
  const info = getChainInfo(chainId as ChainId);
  const urls = [
    ...(info.privateJsonRPCUrl ? [info.privateJsonRPCUrl] : []),
    ...(Array.isArray(info.publicJsonRPCUrl) ? [...info.publicJsonRPCUrl] : []),
  ].filter(Boolean) as string[];
  if (urls.length === 0) throw new Error(`${chainId} has no jsonRPCUrl configured`);
  return urls[0]!;
}

const chainCache: Record<number, { id: number; name: string; nativeCurrency: { name: string; symbol: string; decimals: number }; rpcUrls: { default: { http: string[] } } }> = {};

function getChain(chainId: number) {
  if (!chainCache[chainId]) {
    const info = getChainInfo(chainId as ChainId);
    chainCache[chainId] = {
      id: chainId,
      name: info.label || `Chain ${chainId}`,
      nativeCurrency: info.nativeCurrency as { name: string; symbol: string; decimals: number },
      rpcUrls: { default: { http: [getRpcUrl(chainId)] } },
    };
  }
  return chainCache[chainId];
}

/** Returns a viem WalletClient that uses the given ISigner for sending transactions and signing. */
export async function createWalletClientFromSigner(signer: ISigner, chainId: number): Promise<WalletClient> {
  const rpcUrl = getRpcUrl(chainId);
  const chain = getChain(chainId) as import("viem").Chain;
  const address = (await signer.getAddress()) as `0x${string}`;

  const account = {
    address,
    type: "local" as const,
    async signMessage({ message }: { message: import("viem").SignableMessage }) {
      const msg = typeof message === "string" ? message : message.raw;
      return (await signer.signMessage(msg)) as `0x${string}`;
    },
    async signTypedData(typedData: import("viem").TypedDataDefinition) {
      if (!signer.signTypedData) throw new Error("ISigner.signTypedData required for this operation");
      return (await signer.signTypedData({
        domain: typedData.domain as Record<string, unknown>,
        types: typedData.types as Record<string, unknown>,
        primaryType: typedData.primaryType,
        message: typedData.message as Record<string, unknown>,
      })) as `0x${string}`;
    },
    source: "custom",
  } as unknown as import("viem").LocalAccount;

  const provider = {
    request: async (args: { method: string; params?: unknown[] }) => {
      if (args.method === "eth_sendTransaction") {
        const tx = (args.params?.[0] ?? {}) as Record<string, unknown>;
        const { hash } = await signer.sendTransaction({
          to: tx.to as string,
          data: tx.data as string | undefined,
          value: tx.value != null ? BigInt(tx.value as string | number) : undefined,
          gasLimit: tx.gas != null ? BigInt(tx.gas as string | number) : undefined,
          gasPrice: tx.gasPrice != null ? BigInt(tx.gasPrice as string | number) : undefined,
          maxFeePerGas: tx.maxFeePerGas != null ? BigInt(tx.maxFeePerGas as string | number) : undefined,
          maxPriorityFeePerGas: tx.maxPriorityFeePerGas != null ? BigInt(tx.maxPriorityFeePerGas as string | number) : undefined,
        });
        return hash as `0x${string}`;
      }
      const res = await fetch(rpcUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: args.method, params: args.params ?? [] }),
      });
      const json = (await res.json()) as { result?: unknown; error?: { message: string } };
      if (json.error) throw new Error(json.error.message);
      return json.result;
    },
  };

  return createWalletClient({
    account,
    chain,
    transport: custom(provider),
  }) as WalletClient;
}
