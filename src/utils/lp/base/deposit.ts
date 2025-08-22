import { getLiquidityRouterContract } from "@/utils/web3/providers";
import { type AddressLike, type BigNumberish, type BytesLike, hexlify, parseEther } from "ethers/lib.esm";
import { ChainId } from "@/config/chain";



export const deposit = async (chainId:ChainId) => {
  try {
    
    const tpslParams = [{
      amount: parseEther('1'),
      triggerPrice: parseEther('1'),
      triggerType: parseEther('1'),
      minQuoteOut: parseEther('1'),
    }]
    poolId: BytesLike;
    amountIn: BigNumberish;
    minAmountOut: BigNumberish;
    recipient: AddressLike;
    const contract = await getLiquidityRouterContract(chainId)
    //estimateGas
    await contract.depositBase ({
      poolId: hexlify(p)
    })
  } catch (e) {
    throw e
  }
}
