import { ChainId } from "@/config/chain";
import { getPoolTokenContract } from "@/web3/providers";
import { getErrorTextFormError } from "@/config/error";

export const getUserGenesisShare = async (chainId: ChainId, tokenAddress: string, account: string) => {
  try {
    const contract = await getPoolTokenContract (chainId, tokenAddress)
    
    const request = await contract.userGenesisShare (account)
    console.log (`UserGenesisShare : `,  request)
    return request
  } catch (error) {
    console.error (error)
    throw typeof error === "string" ? error : (await getErrorTextFormError (error))
  }
}
