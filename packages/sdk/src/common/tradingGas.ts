import { ChainId } from "@/config/chain";
import { getJSONProvider } from "@/web3";
import { CHAIN_INFO } from "@/config/chains";
import { parseUnits } from "ethers";
import { COMMON_CONFIG_DECIMALS } from "@/config/decimals";

export const bigintTradingGasToRatioCalculator = (gas: bigint, ratio: Number) => {
  return gas *  parseUnits(ratio.toString(), COMMON_CONFIG_DECIMALS) / BigInt(10 ** (COMMON_CONFIG_DECIMALS) )
}

export const bigintTradingGasPriceWithRatio = async (chainId:ChainId) => {
  try {
    const chainInfo = CHAIN_INFO[chainId]
    const provider = getJSONProvider(chainId)
    const { gasPrice } = await provider.getFeeData()
  
    if (!gasPrice) {
      throw new Error('Network Error')
    }
    console.log("gasPrice", gasPrice)
    const gasPriceWithRatio = bigintTradingGasToRatioCalculator(gasPrice, chainInfo.gasPriceRatio)
    console.log('gasPriceWithRatio--->', gasPriceWithRatio)
    return {
      gasPrice: gasPriceWithRatio,
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
