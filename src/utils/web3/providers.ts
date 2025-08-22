import LiquidityRouter_ABI from '@/abi/LiquidityRouter.json'
import { ChainId } from "@/config/chain";
import Address from "@/config/address";
import { getContract, getSignerProvider } from "@/utils/web3/index";
import {LiquidityRouter} from '@/abi/types'

/*export const getERC20Contract = async (tokenAddress: string) => {
  const chainId = useAppStore.getState?.()?.activeChainId;
  const provider = getJSONProvider(chainId as number);
  return getContract(tokenAddress, IERC20Metadata_ABI, provider) as unknown as IERC20Metadata;
}*/

/*export const getFeeCollectorContract = async (chainId: ChainId = useAppStore.getState?.()?.activeChainId) => {
  const addresses = Address[chainId as keyof typeof Address];
  const address = addresses.FEE_COLLECTOR_ADDRESS;
  const provider = await getSignerProvider (chainId as number);
  
  return getContract (address, FeeCollector_ABI, provider) as unknown as FeeCollector;
}*/

export const getLiquidityRouterContract = async (chainId: ChainId) => {
  const addresses = Address[chainId as keyof typeof Address];
  const address = addresses.FEE_COLLECTOR_ADDRESS;
  const provider = await getSignerProvider (chainId as number);
  
  return getContract(address,LiquidityRouter_ABI,provider ) as unknown as LiquidityRouter;
}
