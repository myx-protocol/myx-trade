import LiquidityRouter_ABI from '@/abi/LiquidityRouter.json'
import { ChainId } from "@/config/chain";
import Address from "@/config/address";
import { getContract, getJSONProvider, getSignerProvider, getWalletProvider } from "@/web3/index";
import type {LiquidityRouter, PoolManager, PoolConfigurator, IERC20Metadata, QuotePool, BasePool} from '@/abi/types'
import  PoolConfigurator_ABI from '@/abi/PoolConfigurator.json'
import  PoolManager_ABI from '@/abi/PoolManager.json'
import IERC20Metadata_ABI from "@/abi/IERC20Metadata.json"
import QuotePool_ABI from "@/abi/QuotePool.json"
import BasePool_ABI from "@/abi/BasePool.json"

export enum ProviderType {
  JSON,
  Signer
}

export const getERC20Contract = async (chainId:ChainId,tokenAddress: string) => {
  const provider = await getSignerProvider (chainId) ;
  return getContract(tokenAddress, IERC20Metadata_ABI, provider) as unknown as IERC20Metadata;
}

/*export const getFeeCollectorContract = async (chainId: ChainId = useAppStore.getState?.()?.activeChainId) => {
  const addresses = Address[chainId as keyof typeof Address];
  const address = addresses.FEE_COLLECTOR_ADDRESS;
  const provider = await getSignerProvider (chainId as number);
  
  return getContract (address, FeeCollector_ABI, provider) as unknown as FeeCollector;
}*/


export const getAccount = async (chainId:ChainId) => {
  const provider = await getWalletProvider (chainId);
  const accounts = await provider.send("eth_requestAccounts", []);
  return  accounts?.[0] ?? undefined;
}

export const getLiquidityRouterContract = async (chainId: ChainId) => {
  const addresses = Address[chainId as keyof typeof Address];
  const address = addresses.LIQUIDITY_ROUTER;
  console.log("LiquidityRouter address", address);
  const provider = await getSignerProvider (chainId as number);
  
  return getContract(address,LiquidityRouter_ABI,provider ) as unknown as LiquidityRouter;
}

export const getPoolManagerContract = async (chainId: ChainId) => {
  const addresses = Address[chainId as keyof typeof Address];
  const address = addresses.POOL_MANAGER;
  const provider = await getSignerProvider(chainId as number);
  
  return getContract(address,PoolManager_ABI,provider ) as unknown as PoolManager;
}

export const getPoolConfiguratorContract = async (chainId: ChainId) => {
  const addresses = Address[chainId as keyof typeof Address];
  const address = addresses.POOL_MANAGER;
  const provider = await getSignerProvider(chainId as number);
  
  return getContract(address,PoolConfigurator_ABI,provider ) as unknown as PoolConfigurator;
}


export const getQuotePoolContract = async (chainId: ChainId, type:ProviderType = ProviderType.JSON) => {
  const addresses = Address[chainId as keyof typeof Address];
  const address = addresses.QUOTE_POOL;
  const provider = type === ProviderType.JSON ? getJSONProvider (chainId as number) : (await getSignerProvider (chainId as number));
  
  return getContract(address,QuotePool_ABI,provider ) as unknown as QuotePool;
}

export const getBasePoolContract = async (chainId: ChainId, type:ProviderType = ProviderType.JSON) => {
  const addresses = Address[chainId as keyof typeof Address];
  const address = addresses.BASE_POOL;
  const provider = type === ProviderType.JSON ? getJSONProvider (chainId as number) : (await getSignerProvider (chainId as number));
  
  return getContract(address,BasePool_ABI,provider ) as unknown as BasePool;
}
