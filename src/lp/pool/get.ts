import { CreatePoolRequest } from "@/lp/pool/type.js";
import { getDataProviderContract, getPoolManagerContract, ProviderType, } from "../../web3/providers.js";
import { ChainId } from "@/config/chain.js";
import { ErrorCode, Errors, getErrorTextFormError } from "@/config/error.js";
import { sdkError } from "@/logger";
import { getContractAddressByChainId } from "@/config/address.js";
import sdk from "@/web3/index.js";

export const getMarketInfo = (chainId: ChainId, quoteToken: string) => {
  const marketId = sdk?.Markets?.find((m) => m.chainId === chainId && m.quoteToken === quoteToken);
  return marketId;
};

export const getMarketPoolId = async ({
  chainId,
  baseToken,
  marketId,
}: CreatePoolRequest) => {
  try {
    // if (!isSupportedChainFn(chainId)) {
    //   throw new Error(Errors[ ErrorCode.Invalid_Chain_ID]);
    // }
    if (!baseToken) {
      throw new Error(Errors[ErrorCode.Invalid_TOKEN_ADDRESS]);
    }
    const addresses = getContractAddressByChainId(chainId);
    const contract = await getPoolManagerContract(chainId, ProviderType.JSON);

    const data = [marketId, baseToken];
    
    const request = await contract.read!.getMarketPool(data);

    return request.poolId === '0x0000000000000000000000000000000000000000000000000000000000000000' || !request.poolId
      ? undefined
      : request.poolId;
  } catch (error) {
    sdkError(error);
    throw typeof error === "string"
      ? error
      : (await getErrorTextFormError(error));
  }
};

export const getMarketPools = async (chainId: ChainId) => {
  try {
    // if (!isSupportedChainFn(chainId)) {
    //   throw new Error(Errors[ ErrorCode.Invalid_Chain_ID]);
    // }

    // const chainInfo = CHAIN_INFO[chainId];
    // const addresses = Address[chainId as keyof typeof Address];
    // const address = addresses.POOL_MANAGER;
    const contract = await getPoolManagerContract(chainId);

    // const data =  [ marketId ]

    const request = await contract.read.getPools();
    return request || [];
  } catch (error) {
    sdkError(error);
    throw typeof error === "string"
      ? error
      : (await getErrorTextFormError(error));
  }
};

export const getPoolInfo = async (
  chainId: ChainId,
  poolId: string,
  marketPrice: bigint = 0n
) => {
  try {
    const contract = await getDataProviderContract(chainId);
    const request = await contract.read.getPoolInfo([poolId, marketPrice]);
    // console.log(request);
    const info = {
      quotePool: {
        poolToken: request.quotePool.poolToken,
        exchangeRate: request.quotePool.exchangeRate,
        poolTokenPrice: request.quotePool.poolTokenPrice,
        poolTokenSupply: request.quotePool.poolTokenSupply,
        totalDebt: request.quotePool.totalDebt,
        baseCollateral: request.quotePool.baseCollateral,
      },
      basePool: {
        poolToken: request.basePool.poolToken,
        exchangeRate: request.basePool.exchangeRate,
        poolTokenPrice: request.basePool.poolTokenPrice,
        poolTokenSupply: request.basePool.poolTokenSupply,
        totalDebt: request.basePool.totalDebt,
        baseCollateral: request.basePool.baseCollateral,
      },
      reserveInfo: {
        baseTotalAmount: request.reserveInfo.baseTotalAmount,
        baseReservedAmount: request.reserveInfo.baseReservedAmount,
        quoteTotalAmount: request.reserveInfo.quoteTotalAmount,
        quoteReservedAmount: request.reserveInfo.quoteReservedAmount,
      },
      fundingInfo: {
        nextFundingRate: request.fundingInfo.nextFundingRate,
        lastFundingFeeTracker: request.fundingInfo.lastFundingFeeTracker,
        nextEpochTime: request.fundingInfo.nextEpochTime,
      },

      ioTracker: {
        tracker: request.oi.tracker,
        longSize: request.oi.longSize,
        shortSize: request.oi.shortSize,
        poolEntryPrice: request.oi.poolEntryPrice,
      },
      liquidityInfo: {
        windowCaps: request.liquidityInfo.windowCaps,
        openInterest: request.liquidityInfo.openInterest,
      }
    };
    // console.log(info);
    return info;
  } catch (error) {
    sdkError(error);
    throw typeof error === "string"
      ? error
      : (await getErrorTextFormError(error));
  }
};
