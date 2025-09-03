import { CreatePoolRequest } from "@/pool/type";
import { getPoolManagerContract } from "../web3/providers";
import { ChainId, isSupportedChainFn } from "@/config/chain";
import { bigintTradingGasPriceWithRatio, bigintTradingGasToRatioCalculator } from "@/common/tradingGas";
import { Market } from "@/config/market";
import { getPools } from "@/api";
import { ErrorCode, Errors, getErrorTextFormError } from "@/config/error";
import { CHAIN_INFO } from "@/config/chains";
import { deposit } from "@/lp/quote/deposit";
import Address from "@/config/address";
import {ZeroAddress} from 'ethers'

const chainId = ChainId.ARB_TESTNET;
const marketId = Market[chainId].marketId;

export const getMarketPoolId = async ({chainId, baseToken}:CreatePoolRequest) => {
  try {
    if (!isSupportedChainFn(chainId)) {
      throw new Error(Errors[ ErrorCode.Invalid_Chain_ID]);
    }
    
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
