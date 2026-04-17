/**
 * Viem-based public and wallet clients. Replaces ethers JsonRpcProvider / Signer for chain reads and writes.
 */
import { createPublicClient, fallback, http, type Chain, type PublicClient, type Transport, type WalletClient } from "viem";
import { getChainInfo } from "@/config/chains/index.js";
import { ChainId } from "@/config/chain.js";
const chainIdToChain: Record<number, Chain> = {} as Record<number, Chain>;

export function getChain(chainId: number): Chain {
  if (!chainIdToChain[chainId]) {
    const info = getChainInfo(chainId as ChainId);
    const urls = [
      ...(info.privateJsonRPCUrl ? [info.privateJsonRPCUrl] : []),
      ...(Array.isArray(info.publicJsonRPCUrl) ? [...info.publicJsonRPCUrl] : []),
    ].filter(Boolean) as string[];
    if (urls.length === 0) throw new Error(`${chainId} has no jsonRPCUrl configured`);
    chainIdToChain[chainId] = {
      id: chainId,
      name: info.label || `Chain ${chainId}`,
      nativeCurrency: info.nativeCurrency as { name: string; symbol: string; decimals: number },
      rpcUrls: { default: { http: urls } },
    } as Chain;
  }
  return chainIdToChain[chainId];
}

const publicClients: Record<number, PublicClient> = {};

export function getPublicClient(chainId: number): PublicClient {
  if (!publicClients[chainId]) {
    const info = getChainInfo(chainId as ChainId);
    const urls = [
      ...(info.privateJsonRPCUrl ? [info.privateJsonRPCUrl] : []),
      ...(Array.isArray(info.publicJsonRPCUrl) ? [...info.publicJsonRPCUrl] : []),
    ].filter(Boolean) as string[];
    if (urls.length === 0) throw new Error(`${chainId} has no jsonRPCUrl configured`);
    const transport: Transport = urls.length === 1 ? http(urls[0]) : fallback(urls.map((u) => http(u)) as [Transport, ...Transport[]]);
    publicClients[chainId] = createPublicClient({
      chain: getChain(chainId),
      transport,
    });
  }
  return publicClients[chainId];
}

interface ConfigManagerRef {
  hasSigner(): boolean;
  getViemWalletClient(chainId: number): Promise<WalletClient>;
}

let configManagerRef: ConfigManagerRef | null = null;

export function setConfigManagerForViem(cm: ConfigManagerRef | null) {
  configManagerRef = cm;
}

export function getConfigManagerForViem(): ConfigManagerRef | null {
  return configManagerRef;
}

/** Returns WalletClient for the chain (from config walletClient or wrapped ISigner). Use for writeContract / sendTransaction. */
export async function getWalletClient(chainId: number): Promise<WalletClient> {
  const cm = configManagerRef;
  if (!cm?.hasSigner()) throw new Error("No signer: call auth({ signer }) or auth({ walletClient })");
  return cm.getViemWalletClient(chainId);
}

