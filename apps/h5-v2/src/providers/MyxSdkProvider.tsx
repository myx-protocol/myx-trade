import { ChainId } from '@/config/chain'
import { MyxClient, type MyxClientConfig } from '@myx-trade/sdk'
import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import { BrowserProvider } from 'ethers'
import { useMount, useUnmount, useUpdateEffect } from 'ahooks'
import { useWalletClient } from 'wagmi'
import { useWalletConnection } from '@/hooks/wallet/useWalletConnection'
import CryptoJS from 'crypto-js'
import { getAccessToken } from '@/api'
import { useEffect } from 'react'
import { useRef } from 'react'
import { appPubSub } from '@/utils/pubsub'

interface MyxSdkContextValue {
  client?: MyxClient
  clientIsAuthenticated: boolean
  setClient: (client: MyxClient) => void
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
  const { isWalletConnected, address } = useWalletConnection()
  const { data: walletClient } = useWalletClient()
  const myxSdkClientRef = useRef<MyxClient | null>(null)
  useMount(() => {
    const options: MyxClientConfig = {
      chainId: ChainId.ARB_TESTNET,
      brokerAddress: '0x461A33C5E75c292A45f8c961ab816060a94AfbA0',
      isTestnet: true,
      logLevel: 'debug',
    }
    const createMyxClientFallback = () => {
      const client = new MyxClient(options)
      setClient(client)
      myxSdkClientRef.current = client
      return client
    }
    if (walletClient && isWalletConnected) {
      const provider = new BrowserProvider(walletClient?.transport ?? window.ethereum)
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
      createMyxClientFallback()
    }
  })

  useUpdateEffect(() => {
    if (!walletClient || !isWalletConnected || !address || !myxSdkClientRef.current) return
    const provider = new BrowserProvider(walletClient?.transport ?? window.ethereum)
    provider.getSigner().then((signer) => {
      myxSdkClientRef.current?.auth({
        signer,
        walletClient: walletClient,
        getAccessToken: createGetAccessTokenMethod(address ?? ''),
      })
      setClientIsAuthenticated(true)
      appPubSub.emit('app:sdk:authenticated')
    })
  }, [walletClient, isWalletConnected, address])

  useUnmount(() => {
    if (myxSdkClientRef.current) {
      setClientIsAuthenticated(false)
      myxSdkClientRef.current.close()
    }
  })

  const contextValue: MyxSdkContextValue = useMemo(
    () => ({
      client: client ?? undefined,
      setClient,
      clientIsAuthenticated,
    }),
    [client, setClient, clientIsAuthenticated],
  )
  return <myxSdkContext.Provider value={contextValue}>{children}</myxSdkContext.Provider>
}
