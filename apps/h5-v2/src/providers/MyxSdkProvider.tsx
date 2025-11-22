import { ChainId } from '@/config/chain'
import { getMarketList, type MarketInfo, MyxClient, type MyxClientConfig } from '@myx-trade/sdk'
import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import { BrowserProvider } from 'ethers'
import { useMount, useUnmount, useUpdateEffect } from 'ahooks'
import { useWalletClient } from 'wagmi'
import { useWalletConnection } from '@/hooks/wallet/useWalletConnection'
import CryptoJS from 'crypto-js'
import { getAccessToken } from '@/api'
import { useRef } from 'react'
import { appPubSub } from '@/utils/pubsub'
import { useQuery } from '@tanstack/react-query'
import { useWalletChainCheck } from '@/hooks/wallet/useWalletChainCheck'

interface MyxSdkContextValue {
  client?: MyxClient
  clientIsAuthenticated: boolean
  setClient: (client: MyxClient) => void
  markets?: MarketInfo[]
}

const myxSdkContext = createContext<MyxSdkContextValue>({} as MyxSdkContextValue)

// 为 SDK 提供的 accessToken 获取方法
const createGetAccessTokenMethod = (address: string) => {
  return async (): Promise<{ accessToken: string; expireAt: number }> => {
    console.log('MYX SDK getAccessToken called')
    const appId = 'test1'
    const timestamp = Math.floor(Date.now() / 1000)
    const expireTime = 3600 * 24
    const allowAccount = address!
    const secret = '69v9kHey9b746PseJ0TP'

    const payload = `${appId}&${timestamp}&${expireTime}&${allowAccount}&${secret}`
    const signature = CryptoJS.SHA256(payload).toString(CryptoJS.enc.Hex)

    const response = await getAccessToken(appId, timestamp, expireTime, allowAccount, signature)

    if (response.code === 0) {
      return {
        accessToken: response.data.accessToken,
        expireAt: response.data.expireAt, // 到期时间戳（秒）
      }
    } else {
      throw new Error(response.msg || 'Failed to get access token')
    }
  }
}

// eslint-disable-next-line react-refresh/only-export-components
export const useMyxSdkClient = () => useContext(myxSdkContext)

export const MyxSdkProvider = ({ children }: { children: ReactNode }) => {
  const [client, setClient] = useState<MyxClient | null>(null)
  const [clientIsAuthenticated, setClientIsAuthenticated] = useState(false)
  const { isWalletConnected, address, chainId } = useWalletConnection()
  const { data: walletClient, refetch: refetchWalletClient } = useWalletClient()
  const myxSdkClientRef = useRef<MyxClient | null>(null)

  useMount(() => {
    const options: MyxClientConfig = {
      chainId: ChainId.ARB_TESTNET,
      brokerAddress: '0x461A33C5E75c292A45f8c961ab816060a94AfbA0',
      isTestnet: true,
      logLevel: 'error',
    }
    const createMyxClientFallback = () => {
      const client = new MyxClient(options)
      setClient(client)
      myxSdkClientRef.current = client
      return client
    }
    console.log('provider-->', walletClient, isWalletConnected, 'sdk init')

    if (walletClient && isWalletConnected) {
      const provider = new BrowserProvider(walletClient?.transport)
      provider
        .getSigner()
        .then((signer) => {
          options.signer = signer
          options.getAccessToken = createGetAccessTokenMethod(address ?? '')
          options.walletClient = walletClient
          const client = new MyxClient(options)
          setClient(client)
          myxSdkClientRef.current = client
        })
        .catch(createMyxClientFallback)
    } else {
      console.log('else-->', isWalletConnected)
      if (isWalletConnected) {
        refetchWalletClient().catch((error) => {
          console.error('Failed to refetch walletClient:', error)
        })
      }
      console.log('createMyxClientFallback-->')
      createMyxClientFallback()
    }
  })

  console.log(walletClient, 'wallctClient')

  useUpdateEffect(() => {
    console.log('myxSdkProvider-updateEffect-->', Date.now())
    if (!isWalletConnected || !address || !myxSdkClientRef.current) {
      setClientIsAuthenticated(false)
      return
    }

    // 如果 walletClient 为 undefined（比如切换链后），尝试手动重新获取
    if (!walletClient) {
      setClientIsAuthenticated(false)
      // 手动触发重新获取 walletClient
      // 使用 setTimeout 避免在 effect 中直接调用异步函数
      refetchWalletClient().catch((error) => {
        console.error('Failed to refetch walletClient:', error)
      })
      return
    }

    const provider = new BrowserProvider(walletClient.transport)
    provider
      .getSigner()
      .then((signer) => {
        myxSdkClientRef.current?.auth({
          signer,
          walletClient: walletClient,
          getAccessToken: createGetAccessTokenMethod(address ?? ''),
        })
        setClientIsAuthenticated(true)
        console.log('authed-emit-authenticated-->', Date.now())
        appPubSub.emit('app:sdk:authenticated')
      })
      .catch((error) => {
        console.error('Failed to get signer:', error)
        setClientIsAuthenticated(false)
      })
  }, [walletClient, isWalletConnected, address, chainId, refetchWalletClient])

  useUnmount(() => {
    if (myxSdkClientRef.current) {
      setClientIsAuthenticated(false)
      myxSdkClientRef.current.close()
    }
  })

  const { data: markets } = useQuery({
    queryKey: [{ key: 'getMarkets' }],
    queryFn: async () => {
      const result = await getMarketList()
      return result?.data || ([] as MarketInfo[])
    },
  })

  const contextValue: MyxSdkContextValue = useMemo(
    () => ({
      client: client ?? undefined,
      setClient,
      clientIsAuthenticated,
      markets,
    }),
    [client, setClient, clientIsAuthenticated, markets],
  )
  return <myxSdkContext.Provider value={contextValue}>{children}</myxSdkContext.Provider>
}
