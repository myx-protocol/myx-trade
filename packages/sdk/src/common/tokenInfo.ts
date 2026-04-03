import { getAddress, formatUnits } from "viem";
import { sdkError } from "@/logger";
import { getPublicClient } from "@/web3/viemClients.js";
import TOKEN_ABI from "@/abi/IERC20Metadata.json";
import { type Address } from "@/api";

async function checkImageExists(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, { method: "HEAD" });
    return res.ok;
  } catch {
    return false;
  }
}

export const getTokenInfo = async (chainId: number, tokenAddress: string, account?: string) => {
  try {
    const client = getPublicClient(chainId);
    const addr = tokenAddress as Address;
    const [name, symbol, decimals, totalSupply] = await Promise.all([
      client.readContract({ address: addr, abi: TOKEN_ABI as never, functionName: "name" }),
      client.readContract({ address: addr, abi: TOKEN_ABI as never, functionName: "symbol" }),
      client.readContract({ address: addr, abi: TOKEN_ABI as never, functionName: "decimals" }),
      client.readContract({ address: addr, abi: TOKEN_ABI as never, functionName: "totalSupply" }),
    ]);
    const normalized = getAddress(addr);
    const iconUrl = `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/${chainId}/assets/${normalized}/logo.png`;
    const fallbackIcon = "";
    const icon = (await checkImageExists(iconUrl)) ? iconUrl : fallbackIcon;
    let balance: number | undefined;
    if (account) {
      const rawBalance = await client.readContract({ address: addr, abi: TOKEN_ABI as never, functionName: "balanceOf", args: [account as Address] });
      balance = Number(formatUnits(rawBalance as bigint, Number(decimals)));
    }
    return {
      address: tokenAddress,
      name: name as string,
      symbol: symbol as string,
      decimals: Number(decimals),
      icon,
      totalSupply: Number(formatUnits(totalSupply as bigint, Number(decimals))),
      ...(account ? { balance } : {}),
    };
  } catch (e) {
    sdkError(e);
    throw e;
  }
};
