import { getAccount, getQuotePoolContract, ProviderType } from "@/web3/providers";
import { ClaimParams } from "@/lp/type";
import { CHAIN_INFO } from "@/config/chains/index";
import { Market } from "@/config/market";
import { checkParams } from "@/common/checkParams";
import {
  bigintTradingGasPriceWithRatio,
  bigintTradingGasToRatioCalculator
} from "@/common/tradingGas";

export const claim = async (
  params: ClaimParams
) => {
  try {
    const { chainId, poolId} = params;
    
    const chainInfo =  CHAIN_INFO[chainId];
    const account = await getAccount (chainId);
    
    const decimals = Market[chainId as keyof typeof Market].lpDecimals;
    
    await checkParams ({
      account,
      chainId,
    })
    
    const data = {
      poolId,
      user: account,
      recipient: account
    }
    
    const contract = await getQuotePoolContract(chainId, ProviderType.Signer)
    
    // estimateGas
    const _gasLimit = await contract.claimUserRebate.estimateGas(poolId, account, account)
    const gasLimit = bigintTradingGasToRatioCalculator(_gasLimit, chainInfo.gasLimitRatio)
    const {gasPrice}  = await bigintTradingGasPriceWithRatio(chainId)
    const response = await contract.claimUserRebate (poolId, account, account, {
      gasLimit,
      gasPrice
    })
    
    console.log('quote claim',response)
    return response
    
  } catch (error) {
    console.error(error);
    throw error;
  }
}


