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


  const provider = {
    request: async (args: { method: string; params?: unknown[] }) => {
      if (args.method === 'eth_accounts') {
        return [address]
      }
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
      // Wallet-only methods must be signed locally, not forwarded to public RPC.
      if (args.method === "eth_signTypedData_v4" || args.method === "eth_signTypedData") {
        if (!signer.signTypedData) {
          // fallback: try eth_signTypedData_v4 via RPC if signer doesn't support it
          const res = await fetch(rpcUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: args.method, params: args.params ?? [] }),
          });
          const json = (await res.json()) as { result?: unknown; error?: { message: string } };
          if (json.error) throw new Error(json.error.message);
          return json.result;
        }
        const typedDataJson = args.params?.[1];
        if (typeof typedDataJson !== "string") {
          throw new Error("Invalid eth_signTypedData_v4 params");
        }
        const typedData = JSON.parse(typedDataJson) as {
          domain: Record<string, unknown>;
          types: Record<string, unknown>;
          primaryType: string;
          message: Record<string, unknown>;
        };
        const { EIP712Domain: _domain, ...types } = typedData.types as Record<string, unknown>;
        return (await signer.signTypedData({
          domain: typedData.domain,
          types,
          primaryType: typedData.primaryType,
          message: typedData.message,
        })) as `0x${string}`;
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
    account: address as `0x${string}`,
    chain,
    transport: custom(provider as unknown as Parameters<typeof custom>[0]),
  }) as WalletClient;
}
