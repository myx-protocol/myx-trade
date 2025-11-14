import { ChainId } from "@/config/chain";
import { getJSONProvider } from "@/web3";
import { ethers } from "ethers";
import TOKEN_ABI from "@/abi/IERC20Metadata.json";

export const getAllowanceApproved = async(chainId: ChainId, account: string,tokenAddress: string, approveAddress: string, approveAmount: bigint) => {
  try {
    const provider = getJSONProvider(chainId);
    const contractInterface = new ethers.Interface(TOKEN_ABI)
    const data = contractInterface.encodeFunctionData('allowance', [account, approveAddress])
    // console.log("approve token ", tokenAddress)
    // console.log("approve address ", approveAddress)
    
    const callData = {
      to: tokenAddress,
      data,
    }
    const result = await provider.call(callData)
    const allowance = BigInt(result)
    // 输出授权额度（结果是一个大整数，通常是以 wei 为单位）
    // console.log('Allowance:', allowance.toString())
    // console.log('ApproveAmount:', approveAmount.toString())
    // console.log(BN.from(ethers.BigNumber.from(result).toString()).gte(BN.from(approveAmount)))
    // console.log(ethers.BigNumber.from(result).gte(ethers.BigNumber.from(approveAmount)))
    if (allowance >= approveAmount) {
      // console.log('Allowance approved.')
      return true
    }
    return false
  } catch (e) {
    throw e
  }
}
