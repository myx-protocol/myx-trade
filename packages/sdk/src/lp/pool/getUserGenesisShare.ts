import { ChainId } from "@/config/chain.js";
import { getPoolTokenContract } from "@/web3/providers.js";
import { getErrorTextFormError } from "@/config/error.js";

export const getUserGenesisShare = async (chainId: ChainId, tokenAddress: string, account: string) => {
  try {
    const contract = await getPoolTokenContract (chainId, tokenAddress)
    
    const request = await contract.read.userGenesisShare ([account])
    // console.log (`UserGenesisShare : `,  request)
    return request
  } catch (error) {
    console.error (error)
    throw typeof error === "string" ? error : (await getErrorTextFormError (error))
  }
}
