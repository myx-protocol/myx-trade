import { Contract, ethers, JsonRpcProvider, JsonRpcSigner, Signer, ZeroAddress } from "ethers";
import { Address } from "@/utils/address";
import { ChainId } from "@/config/chain";
import { getChainInfo } from "@/config/chains";
import { RotationProvider } from "@/utils/web3/rotationProvider";

export function getContract(
  address: string,
  ABI: any,
  provider: JsonRpcProvider | JsonRpcSigner | Signer,
): Contract {
  if (Address.from(address).isEqualTo(ZeroAddress)) {
    throw new Error(`Invalid 'address' parameter '${address}'.`);
  }
  
  return new Contract(address, ABI, provider as any);
}

export const getJSONProvider = (chainId: ChainId): JsonRpcProvider => {
  const chainConfig = getChainInfo(chainId);
  const chainProviders: string[] = [];
  if (chainConfig.privateJsonRPCUrl) {
    chainProviders.push(chainConfig.privateJsonRPCUrl);
  }
  if (chainConfig.publicJsonRPCUrl.length > 0) {
    chainConfig.publicJsonRPCUrl.map((rpc) => chainProviders.push(rpc));
  }
  if (chainProviders.length === 0) {
    throw new Error(`${chainId} has no jsonRPCUrl configured`);
  }
  if (chainProviders.length === 1) {
    return new JsonRpcProvider(chainProviders[0], chainId, {
      staticNetwork: true,
    });
  } else {
    // 将RotationProvider转换为JsonRpcProvider类型
    return new RotationProvider(chainProviders, chainId) as unknown as JsonRpcProvider;
  }
};

// export const getWalletProvider = async (chainId?: ChainId) => {
//   try {
//     // 检查是否有钱包连接
//     if (!window.ethereum) {
//       console.log("No wallet installed; using read-only defaults")
//       return ethers.getDefaultProvider("mainnet") as BrowserProvider
//     }

//     // 创建 ethers provider
//     const provider = new ethers.BrowserProvider(window.ethereum)

//     // 如果指定了 chainId，可以验证当前链是否匹配
//     if (chainId) {
//       const network = await provider.getNetwork()
//       console.log(`Connected to chain: ${network.chainId}, requested: ${chainId}`)
//     }

//     return provider
//   } catch (error) {
//     console.error("Error getting wallet provider:", error)
//     // 如果获取失败，返回默认的只读 provider
//     return ethers.getDefaultProvider("mainnet") as BrowserProvider
//   }
// };

export const getSignerProvider = async (chainId?: ChainId) => {
  // @ts-ignore
  const walletClient = await getWalletClient(config, {
    chainId: chainId as ChainId
  })
  
  if(!walletClient) {
    // toast.error({
    //   title: t`missing provider`,
    // })
    return {} as JsonRpcSigner
  }
  
  const provider = new ethers.BrowserProvider(walletClient)
  
  return await provider.getSigner()
};
