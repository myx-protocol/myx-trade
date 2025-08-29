import { getAccount, getLiquidityRouterContract } from "@/web3/providers";
import { type AddressLike, type BigNumberish, type BytesLike, hexlify, parseEther } from "ethers";
import { ChainId } from "@/config/chain";
import { bigintTradingGasPriceWithRatio, bigintTradingGasToRatioCalculator } from "@/common/tradingGas";
import { CHAIN_INFO } from "@/config/chains";

interface Deposit {
  chainId: ChainId,
  poolId: string;
  // address: AddressLike;
  // amountIn: bigint;
}

export const deposit = async ({poolId, chainId}: Deposit) => {
  try {
    const chainInfo =  CHAIN_INFO[chainId];
    const account = await getAccount (chainId);
    const tpslParams = []
    // poolId: BytesLike;
    // amountIn: BigNumberish;
    // minAmountOut: BigNumberish;
    // recipient: AddressLike;
    const slipper = 0.01
    
    
    const data = {
      poolId: poolId as unknown as BytesLike,
      amountIn: BigInt(10 ** 18),
      minAmountOut: 99000000000000000000n,
      recipient: account,
      tpslParams: []
    }
    
    const contract = await getLiquidityRouterContract(chainId)
    //estimateGas
    const _gasLimit =  await contract.depositBase.estimateGas(data)
    
    const gasLimit = bigintTradingGasToRatioCalculator(_gasLimit, chainInfo.gasLimitRatio)
    const {gasPrice} = await bigintTradingGasPriceWithRatio (chainId);
    const result = await contract.depositBase(data, {
      gasLimit,
      gasPrice
    })
    
    console.log("deposit", result)
  } catch (e) {
    throw e
  }
}
