import { getBrokerSingerContract } from "@/web3/providers";
import { UserFeeRateParams, PlaceOrderParams } from "./type";
import { ChainId } from "@/config/chain";
import { TIME_IN_FORCE } from "@/config/con";
import { Signer } from "ethers";

// get User fee rate
export const getUserFeeRate = async ({ address, poolId, chainId }: UserFeeRateParams, singer: Signer) => {
  const brokerContract = await getBrokerSingerContract(chainId, singer);
  const userFeeRate = await brokerContract.getUserFeeRate(address, poolId);
  return userFeeRate;
}

export const placeOrder = async (params: PlaceOrderParams, singer: Signer) => {
  // todo
  // 计算订单金额
  
  // 计算执行费用
  
  // 划点 
  
  // 划点成功 检查钱包是否充足
  
  // 检查钱包充足 执行订单  
  
  // 执行订单成功 检查订单是否成功
  
  // gas
  
  console.log('params--->', params, JSON.stringify(params))
  // 执行订单
  const brokerContract = await getBrokerSingerContract(params.chainId, singer);

  // @ts-ignore
  const gasLimit = await brokerContract.placeOrder.estimateGas(
    {
      user: params.address,
      poolId: params.poolId,
      positionId: params.positionId,
      orderType: params.orderType,
      triggerType: params.triggerType,
      operation: params.operation,
      direction: params.direction,
      collateralAmount: params.collateralAmount,
      size: params.size,
      orderPrice: params.orderPrice,
      triggerPrice: params.triggerPrice,
      timeInForce: TIME_IN_FORCE,
      postOnly: params.postOnly,
      slippagePct: params.slippagePct,
      executionFeeToken: params.executionFeeToken,
      leverage: params.leverage,
      tpSize: params.tpSize,
      tpPrice: params.tpPrice,
      slSize: params.slSize,
      slPrice: params.slPrice,
    }
  )
  console.log('gasLimit--->', gasLimit)

  const response = await brokerContract.placeOrder(
    {
      user: params.address,
      poolId: params.poolId,
      positionId: params.positionId,
      orderType: params.orderType,
      triggerType: params.triggerType,
      operation: params.operation,
      direction: params.direction,
      collateralAmount: params.collateralAmount,
      size: params.size,
      orderPrice: params.orderPrice,
      triggerPrice: params.triggerPrice,
      timeInForce: TIME_IN_FORCE,
      postOnly: params.postOnly,
      slippagePct: params.slippagePct,
      executionFeeToken: params.executionFeeToken,
      leverage: params.leverage,
      tpSize: params.tpSize,
      tpPrice: params.tpPrice,
      slSize: params.slSize,
      slPrice: params.slPrice,
    },
  );

  const receipt = await response?.wait()

  return receipt;
}

export const cancelOrder = async (chainId: ChainId, orderId: string, singer: Signer) => {
  const brokerContract = await getBrokerSingerContract(chainId, singer);
  const response = await brokerContract.cancelOrder(orderId);
  const receipt = await response?.wait()

  return receipt;
}


export const cancelOrders = async (chainId: ChainId, orderIds: string[], singer: Signer) => {
  const brokerContract = await getBrokerSingerContract(chainId, singer);
  const response = await brokerContract.cancelOrders(orderIds);
  const receipt = await response?.wait()

  return receipt;
}

export const adjustCollateral = async (chainId: ChainId, positionId: string, adjustAmount: string, singer: Signer) => {
  const brokerContract = await getBrokerSingerContract(chainId, singer);
  const response = await brokerContract.adjustCollateral(positionId, adjustAmount);
  const receipt = await response?.wait()

  return receipt;
}