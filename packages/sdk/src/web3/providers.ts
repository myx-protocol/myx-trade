import { getContract as getViemContract, type Abi } from "viem";
import LiquidityRouter_ABI from "@/abi/LiquidityRouter.json";
import { ChainId } from "@/config/chain.js";
import { getPublicClient, getWalletClient } from "@/web3/viemClients.js";
import type { WalletClient } from "viem";
import type { Address } from "@/api"

/** Cast viem getContract result so .read/.write and legacy contract.methodName() accept any ABI function name. */
export type ContractLike = {
  address: Address;
  abi: Abi;
  read: Record<string, (...args: any[]) => Promise<any>>;
  write?: Record<string, (...args: any[]) => Promise<any>>;
  estimateGas?: Record<string, (...args: any[]) => Promise<any>>;
  simulate?: Record<string, (...args: any[]) => Promise<any>>;
  /** Allow legacy ethers-style contract.methodName() (e.g. in lp/) until migrated to .read/.write */
  [key: string]: any;
};
function asContract<T>(c: T): ContractLike {
  return c as unknown as ContractLike;
}
import PoolConfigurator_ABI from "@/abi/PoolConfigurator.json";
import PoolManager_ABI from "@/abi/PoolManager.json";
import IERC20Metadata_ABI from "@/abi/IERC20Metadata.json";
import QuotePool_ABI from "@/abi/QuotePool.json";
import BasePool_ABI from "@/abi/BasePool.json";
import Broker_ABI from "@/abi/Broker.json";
import OrderManager_ABI from "@/abi/OrderManager.json";
import Pyth_ABI from "@/abi/IPyth.json";
import PoolToken_ABI from "@/abi/PoolToken.json";
import MarketManager_ABI from "@/abi/MarketManager.json";
import DataProvider_ABI from "@/abi/DataProvider.json";
import Forwarder_ABI from "@/abi/Forwarder.json";
import Reimbursement_ABI from "@/abi/Reimbursement.json";
import DisputeCourt_ABI from "@/abi/DisputeCourt.json";
import Account_ABI from "@/abi/Account.json";
import { getContractAddressByChainId } from "@/config/address";

export enum ProviderType {
  JSON,
  Signer,
}

export const getTokenContract = (chainId: ChainId, tokenAddress: string) => {
  const client = getPublicClient(chainId);
  return asContract(getViemContract({
    address: tokenAddress as Address,
    abi: IERC20Metadata_ABI as Abi,
    client,
  }));
};

export const getERC20Contract = async (chainId: ChainId, tokenAddress: string) => {
  const client = await getWalletClient(chainId);
  return asContract(getViemContract({
    address: tokenAddress as Address,
    abi: IERC20Metadata_ABI as Abi,
    client,
  }));
};

export const getAccount = async (chainId: ChainId) => {
  const client = await getWalletClient(chainId);
  const [account] = await client.getAddresses();
  return account ?? undefined;
};

export const getLiquidityRouterContract = async (chainId: ChainId) => {
  const addresses = getContractAddressByChainId(chainId);
  const client = await getWalletClient(chainId);
  return asContract(getViemContract({
    address: addresses.LIQUIDITY_ROUTER as Address,
    abi: LiquidityRouter_ABI as Abi,
    client,
  }));
};

export const getPoolManagerContract = (chainId: ChainId, type = ProviderType.Signer) => {
  const addresses = getContractAddressByChainId(chainId);
  const client = type === ProviderType.JSON ? getPublicClient(chainId) : null;
  if (client) {
    return Promise.resolve(asContract(getViemContract({ address: addresses.POOL_MANAGER as Address, abi: PoolManager_ABI as Abi, client })));
  }
  return getWalletClient(chainId).then((walletClient) =>
    asContract(getViemContract({ address: addresses.POOL_MANAGER as Address, abi: PoolManager_ABI as Abi, client: walletClient }))
  );
};

export const getPoolConfiguratorContract = async (chainId: ChainId) => {
  const addresses = getContractAddressByChainId(chainId);
  const client = await getWalletClient(chainId);
  return asContract(getViemContract({
    address: addresses.POOL_MANAGER as Address,
    abi: PoolConfigurator_ABI as Abi,
    client,
  }));
};

export const getQuotePoolContract = (chainId: ChainId, type: ProviderType = ProviderType.JSON) => {
  const addresses = getContractAddressByChainId(chainId);
  const client = type === ProviderType.JSON ? getPublicClient(chainId) : null;
  if (client) {
    return Promise.resolve(asContract(getViemContract({ address: addresses.QUOTE_POOL as Address, abi: QuotePool_ABI as Abi, client })));
  }
  return getWalletClient(chainId).then((walletClient) =>
    asContract(getViemContract({ address: addresses.QUOTE_POOL as Address, abi: QuotePool_ABI as Abi, client: walletClient }))
  );
};

export const getBasePoolContract = (chainId: ChainId, type: ProviderType = ProviderType.JSON) => {
  const addresses = getContractAddressByChainId(chainId);
  const client = type === ProviderType.JSON ? getPublicClient(chainId) : null;
  if (client) {
    return Promise.resolve(asContract(getViemContract({ address: addresses.BASE_POOL as Address, abi: BasePool_ABI as Abi, client })));
  }
  return getWalletClient(chainId).then((walletClient) =>
    asContract(getViemContract({ address: addresses.BASE_POOL as Address, abi: BasePool_ABI as Abi, client: walletClient }))
  );
};

export const getBrokerSingerContract = async (chainId: ChainId, brokerAddress: string) => {
  const client = await getWalletClient(chainId);
  return asContract(getViemContract({
    address: brokerAddress as Address,
    abi: Broker_ABI as Abi,
    client,
  }));
};

export const getSeamlessBrokerContract = (brokerAddress: string, walletClient: WalletClient) => {
  return asContract(getViemContract({
    address: brokerAddress as Address,
    abi: Broker_ABI as Abi,
    client: walletClient,
  }));
};

export const getBrokerContract = (chainId: ChainId, brokerAddress: string) => {
  const client = getPublicClient(chainId);
  return asContract(getViemContract({
    address: brokerAddress as Address,
    abi: Broker_ABI as Abi,
    client,
  }));
};

export const getOrderManagerSingerContract = async (chainId: ChainId) => {
  const addresses = getContractAddressByChainId(chainId);
  const client = await getWalletClient(chainId);
  return asContract(getViemContract({
    address: addresses.ORDER_MANAGER as Address,
    abi: OrderManager_ABI as Abi,
    client,
  }));
};

export const getPythContract = (chainId: ChainId, type: ProviderType = ProviderType.JSON) => {
  const addresses = getContractAddressByChainId(chainId);
  const client = type === ProviderType.JSON ? getPublicClient(chainId) : null;
  if (client) {
    return Promise.resolve(asContract(getViemContract({ address: addresses.PYTH as Address, abi: Pyth_ABI as Abi, client })));
  }
  return getWalletClient(chainId).then((walletClient) =>
    asContract(getViemContract({ address: addresses.PYTH as Address, abi: Pyth_ABI as Abi, client: walletClient }))
  );
};

export const getPoolTokenContract = (chainId: ChainId, lpTokenAddress: string, type: ProviderType = ProviderType.JSON) => {
  const client = type === ProviderType.JSON ? getPublicClient(chainId) : null;
  if (client) {
    return Promise.resolve(asContract(getViemContract({ address: lpTokenAddress as Address, abi: PoolToken_ABI as Abi, client })));
  }
  return getWalletClient(chainId).then((walletClient) =>
    asContract(getViemContract({ address: lpTokenAddress as Address, abi: PoolToken_ABI as Abi, client: walletClient }))
  );
};

export const getMarketManageContract = (chainId: ChainId, type: ProviderType = ProviderType.JSON) => {
  const addresses = getContractAddressByChainId(chainId);
  const client = type === ProviderType.JSON ? getPublicClient(chainId) : null;
  if (client) {
    return Promise.resolve(asContract(getViemContract({ address: addresses.MARKET_MANAGER as Address, abi: MarketManager_ABI as Abi, client })));
  }
  return getWalletClient(chainId).then((walletClient) =>
    asContract(getViemContract({ address: addresses.MARKET_MANAGER as Address, abi: MarketManager_ABI as Abi, client: walletClient }))
  );
};

export const getDataProviderContract = (chainId: ChainId, type: ProviderType = ProviderType.JSON) => {
  const addresses = getContractAddressByChainId(chainId);
  const client = type === ProviderType.JSON ? getPublicClient(chainId) : null;
  if (client) {
    return Promise.resolve(asContract(getViemContract({ address: addresses.DATA_PROVIDER as Address, abi: DataProvider_ABI as Abi, client })));
  }
  return getWalletClient(chainId).then((walletClient) =>
    asContract(getViemContract({ address: addresses.DATA_PROVIDER as Address, abi: DataProvider_ABI as Abi, client: walletClient }))
  );
};

export const getAccountContract = async (chainId: ChainId) => {
  const addresses = getContractAddressByChainId(chainId);
  const client = await getWalletClient(chainId);
  return asContract(getViemContract({ address: addresses.Account as Address, abi: Account_ABI as Abi, client }));
};

export const getForwarderContract = (chainId: ChainId, type: ProviderType = ProviderType.JSON) => {
  const addresses = getContractAddressByChainId(chainId);
  const client = type === ProviderType.JSON ? getPublicClient(chainId) : null;
  if (client) {
    return Promise.resolve(asContract(getViemContract({ address: addresses.FORWARDER as Address, abi: Forwarder_ABI as Abi, client })));
  }
  return getWalletClient(chainId).then((walletClient) =>
    asContract(getViemContract({ address: addresses.FORWARDER as Address, abi: Forwarder_ABI as Abi, client: walletClient }))
  );
};

export const getReimbursementContract = (chainId: ChainId, type: ProviderType = ProviderType.JSON) => {
  const addresses = getContractAddressByChainId(chainId);
  const client = type === ProviderType.JSON ? getPublicClient(chainId) : null;
  if (client) {
    return Promise.resolve(asContract(getViemContract({ address: addresses.REIMBURSEMENT as Address, abi: Reimbursement_ABI as Abi, client })));
  }
  return getWalletClient(chainId).then((walletClient) =>
    asContract(getViemContract({ address: addresses.REIMBURSEMENT as Address, abi: Reimbursement_ABI as Abi, client: walletClient }))
  );
};

export const getDisputeCourtContract = (chainId: ChainId, type: ProviderType = ProviderType.JSON) => {
  const addresses = getContractAddressByChainId(chainId);
  const client = type === ProviderType.JSON ? getPublicClient(chainId) : null;
  if (client) {
    return Promise.resolve(asContract(getViemContract({ address: addresses.DISPUTE_COURT as Address, abi: DisputeCourt_ABI as Abi, client })));
  }
  return getWalletClient(chainId).then((walletClient) =>
    asContract(getViemContract({ address: addresses.DISPUTE_COURT as Address, abi: DisputeCourt_ABI as Abi, client: walletClient }))
  );
};
