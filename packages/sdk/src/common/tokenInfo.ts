import { ethers } from "ethers";
import { getERC20Contract, getTokenContract } from "@/web3/providers";
/**
 * 检查图片 URL 是否可访问
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
    console.log(_name);
    
    // 并行请求
    const [name, symbol, decimals, totalSupply] = await Promise.all([
      token.name(),
      token.symbol(),
      token.decimals(),
      token.totalSupply()
    ]);
    // TrustWallet 图标 URL
    const normalized = ethers.getAddress(tokenAddress); // 校正大小写
    const iconUrl = `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/${chainId}/assets/${normalized}/logo.png`;
    
    // 默认备用图标（本地 or CDN 均可）
    const fallbackIcon =
      "";
    
    // 检查该图标是否存在
    const icon = await checkImageExists(iconUrl) ? iconUrl : fallbackIcon;
    
    // 可选：获取某个地址余额
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
