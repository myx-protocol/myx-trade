import { CreatePoolRequest } from "@/lp/pool/type";
import { getDataProviderContract, getPoolManagerContract } from "../../web3/providers";
import { ChainId } from "@/config/chain";
import { Market } from "@/config/market";
import { ErrorCode, Errors, getErrorTextFormError } from "@/config/error";
import { CHAIN_INFO } from "@/config/chains/index";
import Address from "@/config/address";
import { ZeroAddress } from 'ethers'


export const getMarketInfo =  (chainId: ChainId) => {
  const marketId = Market[chainId].marketId;
  return marketId;
}

export const getMarketPoolId = async ({chainId, baseToken}:CreatePoolRequest) => {
  try {
    // if (!isSupportedChainFn(chainId)) {
    //   throw new Error(Errors[ ErrorCode.Invalid_Chain_ID]);
    // }
    const marketId = getMarketInfo(chainId);
    if (!baseToken) {
      throw new Error(Errors[ErrorCode.Invalid_TOKEN_ADDRESS]);
    }
    const chainInfo = CHAIN_INFO[chainId];
    const addresses = Address[chainId as keyof typeof Address];
    const address = addresses.POOL_MANAGER;
    const contract = await getPoolManagerContract(chainId)
    
    const data =  [ marketId, baseToken ]
   
    // console.log( data, address );
    // const request = await contract.getPool('0xd7a6e43cc289cb0a53795ca67b10d12abccded3abaada411d9d4dbe78e5fc739')
    // console.log(request)
    const request = await contract.getMarketPool(marketId, baseToken)
    
    return request.poolId === ZeroAddress  || !request.poolId? undefined : request.poolId;
  } catch (error) {
    console.error(error)
    throw typeof error === "string" ? error : (await getErrorTextFormError (error))
  }
}


export const getMarketPools = async (chainId: ChainId) => {
  try {
    // if (!isSupportedChainFn(chainId)) {
    //   throw new Error(Errors[ ErrorCode.Invalid_Chain_ID]);
    // }
    
    // const chainInfo = CHAIN_INFO[chainId];
    // const addresses = Address[chainId as keyof typeof Address];
    // const address = addresses.POOL_MANAGER;
    const contract = await getPoolManagerContract(chainId)
    
    // const data =  [ marketId ]
    
    const request = await contract.getPools()
    console.log(request)
    return request || []
  } catch (error) {
    console.error(error)
    throw typeof error === "string" ? error : (await getErrorTextFormError (error))
  }
}

export const getPoolInfo = async (chainId: ChainId, poolId: string, marketPrice: bigint) => {
  try {
    const contract = await getDataProviderContract(chainId)
    const request = await contract.getPoolInfo( poolId, marketPrice )
    console.log(request?.quotePool, request.basePool, request.reserveInfo, request.fundingInfo);
    return {
      quotePool: request.quotePool,
      basePool: request.basePool,
      reserveInfo: request.reserveInfo,
      fundingInfo: request.fundingInfo,
    }
  }catch(error) {
    console.error(error)
    throw typeof error === "string" ? error : (await getErrorTextFormError (error))
  }
}
