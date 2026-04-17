import { ChainId } from "@/config/chain.js";
import { getPublicClient } from "@/web3/viemClients.js";
import { CHAIN_INFO } from "@/config/chains/index.js";
import { parseUnits } from "viem";
import { COMMON_CONFIG_DECIMALS } from "@/config/decimals.js";

export const bigintTradingGasToRatioCalculator = (gas: bigint, ratio: Number) => {
  return BigInt(gas) * parseUnits(ratio.toString(), COMMON_CONFIG_DECIMALS) / BigInt(10 ** COMMON_CONFIG_DECIMALS);
};

export const bigintTradingGasPriceWithRatio = async (chainId: ChainId) => {
  try {
    const chainInfo = CHAIN_INFO[chainId];
    const minGasPrice= chainInfo?.gasPrice || 0n;
    const client = getPublicClient(chainId);
    const gasPrice = await client.getGasPrice();
    if (gasPrice == null) {
      throw new Error("Network Error");
    }
    const gasPriceWithRatio = bigintTradingGasToRatioCalculator(gasPrice, chainInfo.gasPriceRatio);
    return {
      gasPrice: gasPriceWithRatio > minGasPrice ? gasPriceWithRatio : minGasPrice ,
    }
    
  } catch (e) {
    // todo show error message
    throw e
  }
  
}


// slipper < 1 && > 0
export const bigintAmountSlipperCalculator = (amount: bigint, slipper: Number = 0.01) => {
  const radio = parseUnits('1', COMMON_CONFIG_DECIMALS) - parseUnits(slipper.toString(), COMMON_CONFIG_DECIMALS)
  return amount * radio  / BigInt(10 ** (COMMON_CONFIG_DECIMALS) )
}
