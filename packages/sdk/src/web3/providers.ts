import LiquidityRouter_ABI from "@/abi/LiquidityRouter.json";
import { ChainId } from "@/config/chain";
import {
  getContract,
  getJSONProvider,
  getSignerProvider,
  getWalletProvider,
} from "@/web3/index";
import type {
  LiquidityRouter,
  PoolManager,
  PoolConfigurator,
  IERC20Metadata,
  QuotePool,
  BasePool,
  Broker,
  OrderManager,
  IPyth,
  PoolToken,
  MarketManager,
  DataProvider,
  Forwarder,
  Reimbursement,
  DisputeCourt,
} from "@/abi/types";
import PoolConfigurator_ABI from "@/abi/PoolConfigurator.json";
import PoolManager_ABI from "@/abi/PoolManager.json";
import IERC20Metadata_ABI from "@/abi/IERC20Metadata.json";
import QuotePool_ABI from "@/abi/QuotePool.json";
import BasePool_ABI from "@/abi/BasePool.json";
import { Signer } from "ethers";
import Broker_ABI from "@/abi/Broker.json";
import OrderManager_ABI from "@/abi/OrderManager.json";
import Pyth_ABI from "@/abi/IPyth.json";
import PoolToken_ABI from "@/abi/PoolToken.json";
import MarketManager_ABI from "@/abi/MarketManager.json";
import DataProvider_ABI from "@/abi/DataProvider.json";
import Forwarder_ABI from "@/abi/Forwarder.json";
import Reimbursement_ABI from "@/abi/Reimbursement.json";
import DisputeCourt_ABI from "@/abi/DisputeCourt.json";
import { getContractAddressByChainId } from "@/config/address";
export enum ProviderType {
  JSON,
  Signer,
}

export const getTokenContract = async (
  chainId: ChainId,
  tokenAddress: string
) => {
  const provider = getJSONProvider(chainId);
  return getContract(
    tokenAddress,
    IERC20Metadata_ABI,
    provider
  ) as unknown as IERC20Metadata;
};

export const getERC20Contract = async (
  chainId: ChainId,
  tokenAddress: string
) => {
  const provider = await getSignerProvider(chainId);
  return getContract(
    tokenAddress,
    IERC20Metadata_ABI,
    provider
  ) as unknown as IERC20Metadata;
};

/*export const getFeeCollectorContract = async (chainId: ChainId = useAppStore.getState?.()?.activeChainId) => {
  const addresses = Address[chainId as keyof typeof Address];
  const address = addresses.FEE_COLLECTOR_ADDRESS;
  const provider = await getSignerProvider (chainId as number);
  
  return getContract (address, FeeCollector_ABI, provider) as unknown as FeeCollector;
}*/

export const getAccount = async (chainId: ChainId) => {
  const provider = await getSignerProvider(chainId);
  const account = await provider?.getAddress();
  return account ?? undefined;
};

export const getLiquidityRouterContract = async (chainId: ChainId) => {
  const addresses = getContractAddressByChainId(chainId);
  const address = addresses.LIQUIDITY_ROUTER;
  const provider = await getSignerProvider(chainId as number);

  return getContract(
    address,
    LiquidityRouter_ABI,
    provider
  ) as unknown as LiquidityRouter;
};

export const getPoolManagerContract = async (
  chainId: ChainId,
  type = ProviderType.Signer
) => {
  const addresses = getContractAddressByChainId(chainId);
  const address = addresses.POOL_MANAGER;
  const provider =
    type === ProviderType.JSON
      ? getJSONProvider(chainId as number)
      : await getSignerProvider(chainId as number);

  return getContract(
    address,
    PoolManager_ABI,
    provider
  ) as unknown as PoolManager;
};

export const getPoolConfiguratorContract = async (chainId: ChainId) => {
  const addresses = getContractAddressByChainId(chainId);
  const address = addresses.POOL_MANAGER;
  const provider = await getSignerProvider(chainId as number);

  return getContract(
    address,
    PoolConfigurator_ABI,
    provider
  ) as unknown as PoolConfigurator;
};

export const getQuotePoolContract = async (
  chainId: ChainId,
  type: ProviderType = ProviderType.JSON
) => {
  const addresses = getContractAddressByChainId(chainId);
  const address = addresses.QUOTE_POOL;
  const provider =
    type === ProviderType.JSON
      ? getJSONProvider(chainId as number)
      : await getSignerProvider(chainId as number);

  return getContract(address, QuotePool_ABI, provider) as unknown as QuotePool;
};

export const getBasePoolContract = async (
  chainId: ChainId,
  type: ProviderType = ProviderType.JSON
) => {
  const addresses = getContractAddressByChainId(chainId);
  const address = addresses.BASE_POOL;
  const provider =
    type === ProviderType.JSON
      ? getJSONProvider(chainId as number)
      : await getSignerProvider(chainId as number);

  return getContract(address, BasePool_ABI, provider) as unknown as BasePool;
};

export const getBrokerSingerContract = async (
  chainId: ChainId,
  brokerAddress: string
) => {
  const address = brokerAddress;
  const provider = await getSignerProvider(chainId as number);

  return getContract(address, Broker_ABI, provider) as unknown as Broker;
};

export const getSeamlessBrokerContract = async (
  brokerAddress: string,
  singer: Signer
) => {
  return getContract(brokerAddress, Broker_ABI, singer) as unknown as Broker;
}

export const getBrokerContract = async (chainId: ChainId, brokerAddress: string) => {
  const address = brokerAddress;
  const provider = getJSONProvider(chainId as number)
  return getContract(address, Broker_ABI, provider) as unknown as Broker;
}


export const getOrderManagerSingerContract = async (chainId: ChainId) => {
  const addresses = getContractAddressByChainId(chainId);
  const address = addresses.ORDER_MANAGER;
  const provider = await getSignerProvider(chainId as number);

  return getContract(
    address,
    OrderManager_ABI,
    provider
  ) as unknown as OrderManager;
};

export const getPythContract = async (
  chainId: ChainId,
  type: ProviderType = ProviderType.JSON
) => {
  const addresses = getContractAddressByChainId(chainId);
  const address = addresses.PYTH;
  const provider =
    type === ProviderType.JSON
      ? getJSONProvider(chainId as number)
      : await getSignerProvider(chainId as number);

  return getContract(address, Pyth_ABI, provider) as unknown as IPyth;
};

export const getPoolTokenContract = async (
  chainId: ChainId,
  lpTokenAddress: string,
  type: ProviderType = ProviderType.JSON
) => {
  const address = lpTokenAddress;
  const provider =
    type === ProviderType.JSON
      ? getJSONProvider(chainId as number)
      : await getSignerProvider(chainId as number);

  return getContract(address, PoolToken_ABI, provider) as unknown as PoolToken;
};

export const getMarketManageContract = async (
  chainId: ChainId,
  type: ProviderType = ProviderType.JSON
) => {
  const addresses = getContractAddressByChainId(chainId);
  const address = addresses.MARKET_MANAGER;
  const provider =
    type === ProviderType.JSON
      ? getJSONProvider(chainId as number)
      : await getSignerProvider(chainId as number);

  return getContract(
    address,
    MarketManager_ABI,
    provider
  ) as unknown as MarketManager;
};

export const getDataProviderContract = async (
  chainId: ChainId,
  type: ProviderType = ProviderType.JSON
) => {
  const addresses = getContractAddressByChainId(chainId);
  const address = addresses.DATA_PROVIDER;
  const provider =
    type === ProviderType.JSON
      ? getJSONProvider(chainId as number)
      : await getSignerProvider(chainId as number);

  return getContract(
    address,
    DataProvider_ABI,
    provider
  ) as unknown as DataProvider;
};

export const getForwarderContract = async (
  chainId: ChainId,
  type: ProviderType = ProviderType.JSON
) => {
  const addresses = getContractAddressByChainId(chainId);

  const address = addresses.FORWARDER;
  const provider =
    type === ProviderType.JSON
      ? getJSONProvider(chainId as number)
      : await getSignerProvider(chainId as number);

  return getContract(address, Forwarder_ABI, provider) as unknown as Forwarder;
};

export const getReimbursementContract = async (
  chainId: ChainId,
  type: ProviderType = ProviderType.JSON
) => {
  const addresses = getContractAddressByChainId(chainId);
  const address = addresses.REIMBURSEMENT;
  const provider =
    type === ProviderType.JSON
      ? getJSONProvider(chainId as number)
      : await getSignerProvider(chainId as number);

  return getContract(
    address,
    Reimbursement_ABI,
    provider
  ) as unknown as Reimbursement;
};

export const getDisputeCourtContract = async (
  chainId: ChainId,
  type: ProviderType = ProviderType.JSON
) => {
  const addresses = getContractAddressByChainId(chainId);
  const address = addresses.DISPUTE_COURT;
  const provider =
    type === ProviderType.JSON
      ? getJSONProvider(chainId as number)
      : await getSignerProvider(chainId as number);
  return getContract(
    address,
    DisputeCourt_ABI,
    provider
  ) as unknown as DisputeCourt;
};
