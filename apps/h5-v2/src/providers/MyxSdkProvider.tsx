import { ChainId, getAsSupportedChainIdFn, isSupportedChainFn } from '@/config/chain'
import { getMarketList, type MarketInfo, MyxClient, type MyxClientConfig } from '@myx-trade/sdk'
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { BrowserProvider, type Signer } from 'ethers'
import { useUnmount, useUpdateEffect } from 'ahooks'
import { useWalletClient } from 'wagmi'
import { useWalletConnection } from '@/hooks/wallet/useWalletConnection'
import { useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import type { WalletClient } from 'viem'
import { isBetaMode } from '@/utils/env'

interface MyxSdkContextValue {
  client?: Record<number, MyxClient>
  clientIsAuthenticated: Record<number, boolean>
  setClient: (chainId: number, client: MyxClient) => void
  markets?: MarketInfo[]
}

const myxSdkContext = createContext<MyxSdkContextValue>({} as MyxSdkContextValue)

/**
 * create MyxClient
 */
interface CreateMyxClientOptions {
  chainId: number
}

const createMyxClient = ({ chainId }: CreateMyxClientOptions) => {
  const validChainId = getAsSupportedChainIdFn(chainId)

  const brokerAddress = brokerAddressMap[chainId]

  // 根据打包模式区分环境
  const mode = import.meta.env.MODE // 'test' | 'beta' | 'development' | 'production'

  // 环境配置
  const isTestnet = mode === 'test' || mode === 'development' // test 和 development 使用测试网
  const isBetaMode = mode === 'beta' // beta 模式
  const logLevel = mode === 'development' ? 'debug' : 'info' // 开发环境显示 debug 日志

  const options: MyxClientConfig = {
    chainId: validChainId,
    brokerAddress: brokerAddress,
    isTestnet,
    isBetaMode,
    logLevel: logLevel as 'debug' | 'info' | 'warn' | 'error',
  }

  console.log(`MYX SDK 环境: ${mode}`, { isTestnet, isBetaMode, logLevel })

  return new MyxClient(options)
}

/**
 * Get Siger
 */

const getSigner = async (walletClient: WalletClient | undefined) => {
  if (!walletClient) return null
  const provider = new BrowserProvider(walletClient?.transport)
  const signer = await provider.getSigner()
  return signer as Signer
}

// 为 SDK 提供的 accessToken 获取方法
const createGetAccessTokenMethod = () => {
  return async (): Promise<{ accessToken: string; expireAt: number }> => {
    // console.log('MYX SDK getAccessToken called')
    // const appId = 'test1'
    // const timestamp = Math.floor(Date.now() / 1000)
    // const expireTime = 3600 * 24
    // const allowAccount = address!
    // const secret = '69v9kHey9b746PseJ0TP'

    // const payload = `${appId}&${timestamp}&${expireTime}&${allowAccount}&${secret}`
    // const signature = CryptoJS.SHA256(payload).toString(CryptoJS.enc.Hex)

    // const response = await getAccessToken(appId, timestamp, expireTime, allowAccount, signature)

    return new Promise((resolve) => {
      resolve({
        accessToken: 'myx',
        expireAt: Math.floor(Date.now() / 1000) + 3600 * 24, // 到期时间戳（秒）
      })
    })
    // if (response.code === 0) {
    //   return {
    //     accessToken: response.data.accessToken,
    //     expireAt: response.data.expireAt, // 到期时间戳（秒）
    //   }
    // } else {
    //   throw new Error(response.msg || 'Failed to get access token')
    // }
  }
}

// 使用 Map 存储正在创建的 Promise，确保同一个 chainId 只创建一次
const creatingClientPromises = new Map<number, Promise<MyxClient>>()
// eslint-disable-next-line react-refresh/only-export-components
export const useMyxSdkClient = (chainId?: number) => {
  const { client, setClient, clientIsAuthenticated, markets } = useContext(myxSdkContext)

  useEffect(() => {
    const _chainId = getAsSupportedChainIdFn(chainId)
    if (_chainId && client && isSupportedChainFn(_chainId)) {
      const _client = client[_chainId]
      if (!_client) {
        // 如果已经有正在创建的 Promise，直接等待它
        let createPromise = creatingClientPromises.get(_chainId)

        if (!createPromise) {
          // 如果没有正在创建的 Promise，创建一个新的
          console.log('create client chainId-->', _chainId, Date.now())
          createPromise = Promise.resolve().then(() => {
            const newClient = createMyxClient({ chainId: _chainId })
            setClient(_chainId, newClient)
            creatingClientPromises.delete(_chainId)
            return newClient
          })
          creatingClientPromises.set(_chainId, createPromise)
        }
      }
    }
  }, [chainId, client, setClient])
  return useMemo(() => {
    const _chainId = chainId ?? getAsSupportedChainIdFn()
    const _client = client?.[_chainId]

    if (isSupportedChainFn(_chainId) || !_client) {
      return {
        client: _client,
        clientIsAuthenticated: clientIsAuthenticated?.[_chainId] ?? false,
        markets: markets,
      }
    }
    return {
      client: _client ?? undefined,
      clientIsAuthenticated: clientIsAuthenticated?.[_chainId] ?? false,
      markets: markets,
    }
  }, [chainId, client, clientIsAuthenticated, markets])
}

const brokerAddressMap: Record<number, string> = {
  [ChainId.ARB_TESTNET]: isBetaMode()
    ? '0x4A3054177DBdC01BfcA007FB45d9A9803eBc2eA4'
    : '0x30b5B4E85C61c1251162493aee01F9FE6F374E78',
  [ChainId.LINEA_SEPOLIA]: isBetaMode() ? '' : '0xAc6C93eaBDc3DBE4e1B0176914dc2a16f8Fd1800',
  [ChainId.BSC_TESTNET]: isBetaMode() ? '0x144E5067E690635b2cbeE10D96f431D143739f48' : '',
  [ChainId.BSC_MAINNET]: '0x100121F45b81A41bB81712ad6e60e14c37bd9D93',
}

export const MyxSdkProvider = ({ children }: { children: ReactNode }) => {
  const [client, setClient] = useState<Record<number, MyxClient>>({})
  const [clientIsAuthenticated, setClientIsAuthenticated] = useState<Record<number, boolean>>({})
  const { isWalletConnected, address } = useWalletConnection()
  const { data: walletClient, refetch: refetchWalletClient } = useWalletClient()
  const myxSdkClientRef = useRef<Map<number, MyxClient>>(new Map())

  useUpdateEffect(() => {
    const isClientEmpty = myxSdkClientRef.current.size === 0
    console.log('useUpdateEffect myxSdkClientRef', myxSdkClientRef.current, {
      isWalletConnected,
      address,
      isClientEmpty,
    })
    if (!isWalletConnected || !address || isClientEmpty) {
      setClientIsAuthenticated({})
      return
    }

    // 如果 walletClient 为 undefined（比如切换链后），尝试手动重新获取
    if (!walletClient) {
      setClientIsAuthenticated({})
      // 手动触发重新获取 walletClient
      // 使用 setTimeout 避免在 effect 中直接调用异步函数
      refetchWalletClient().catch((error) => {
        console.error('Failed to refetch walletClient:', error)
      })
      return
    }

    getSigner(walletClient)
      .then((signer) => {
        if (signer) {
          console.log('signer-->', signer)
          // auth the all clients
          myxSdkClientRef.current.forEach((_client, chainId) => {
            _client.auth({
              signer,
              walletClient: walletClient as any,
              getAccessToken: createGetAccessTokenMethod(),
            } as any)
            setClientIsAuthenticated((prev) => ({ ...prev, [chainId]: true }))
            console.log('authed-emit-authenticated-->', Date.now(), chainId)
          })
        }
      })
      .catch((error) => {
        console.error('Failed to get signer:', error)
        setClientIsAuthenticated({})
      })
  }, [walletClient, isWalletConnected, address, refetchWalletClient, client])

  useUnmount(() => {
    setClientIsAuthenticated({})
    Object.values(myxSdkClientRef.current).forEach((client) => {
      client.close()
    })
  })

  const { data: markets } = useQuery({
    queryKey: [{ key: 'getMarkets' }, myxSdkClientRef.current?.size],
    queryFn: async () => {
      if (myxSdkClientRef.current?.size) {
        const result = await getMarketList()
        return result?.data || ([] as MarketInfo[])
      }
      return []
    },
  })

  const contextValue: MyxSdkContextValue = useMemo(
    () => ({
      client: client ?? undefined,
      setClient: (chainId, client) => {
        setClient((prev) => ({ ...prev, [chainId]: client }))
        myxSdkClientRef.current.set(chainId, client)
      },
      clientIsAuthenticated,
      markets,
    }),
    [client, setClient, clientIsAuthenticated, markets],
  )
  return <myxSdkContext.Provider value={contextValue}>{children}</myxSdkContext.Provider>
}
