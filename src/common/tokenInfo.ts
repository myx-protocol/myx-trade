import { ethers } from "ethers";
import {  getTokenContract } from "@/web3/providers";
/**
 * Check if an image URL is accessible
 */
async function checkImageExists(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, { method: "HEAD" });
    return res.ok;
  } catch {
    return false;
  }
}
export const getTokenInfo = async (chainId: number, tokenAddress: string, account?:string) => {
  try {
    const token = await getTokenContract(chainId, tokenAddress);
    const _name = await token.name();
    // console.log(_name);
    // Fetch metadata in parallel
    const [name, symbol, decimals, totalSupply] = await Promise.all([
      token.name(),
      token.symbol(),
      token.decimals(),
      token.totalSupply()
    ]);
    // TrustWallet icon URL
    const normalized = ethers.getAddress(tokenAddress); // Normalize checksum casing
    const iconUrl = `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/${chainId}/assets/${normalized}/logo.png`;
    // Default fallback icon (local or CDN)
    const fallbackIcon =
      "";
    // Check whether the icon exists
    const icon = await checkImageExists(iconUrl) ? iconUrl : fallbackIcon;
    // Optionally fetch balance for a specific address
    let balance;
    if (account) {
      const rawBalance = await token.balanceOf(account);
      balance = Number(ethers.formatUnits(rawBalance, decimals));
    }
    return {
      address: tokenAddress,
      name,
      symbol,
      decimals,
      icon,
      totalSupply: Number(ethers.formatUnits(totalSupply, decimals)),
      ...(account ? { balance } : {})
    };
  } catch (e) {
    console.error(e)
    throw e
  }
}
