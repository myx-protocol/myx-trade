import { Outlet } from "react-router-dom";
import { MyxClientContext } from "@providers/MyxClientContext.ts";
import { useContext, useEffect } from "react";
import { useAccount, useWalletClient } from "wagmi";
import { MyxClient } from "@myx-trade/sdk";
import { BrowserProvider } from "ethers";
import { ChainId } from "@config/chain.ts";
import CryptoJS from "crypto-js";

const getAccessToken = async (appId: string, timestamp: number, expireTime: number, allowAccount: string, signature: string) => {
  try {
    const rs = await fetch(`https://api-test.myx.cash/openapi/gateway/auth/api_key/create_token?appId=${appId}&timestamp=${timestamp}&expireTime=${expireTime}&allowAccount=${allowAccount}&signature=${signature}`)
    const res = await rs.json();
    
    return {
      code: 0,
      msg: null,
      data: {
        accessToken: res.data.accessToken,
        expireAt: res.data.expireAt,
        allowAccount: res.data.allowAccount,
        appId: appId,
      },
    };
  } catch (error) {
    console.error("getAccessToken error-->", error);
    return {
      code: -1,
      msg: "getAccessToken error",
      data: {
        accessToken: "",
        expireAt: 0,
        allowAccount: "",
        appId: "",
      },
    };
  }
}


export default function Layout() {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const { setMyxClient} = useContext(MyxClientContext);
  
  // 为 SDK 提供的 accessToken 获取方法
  const createGetAccessTokenMethod = () => {
    return async (): Promise<{ accessToken: string; expireAt: number }> => {
      const appId = "test1";
      const timestamp = Math.floor(Date.now() / 1000);
      const expireTime = 3600 * 24;
      const allowAccount = address!;
      const secret = "69v9kHey9b746PseJ0TP";
      
      const payload = `${appId}&${timestamp}&${expireTime}&${allowAccount}&${secret}`;
      const signature = CryptoJS.SHA256(payload).toString(CryptoJS.enc.Hex);
      
      const response = await getAccessToken(appId, timestamp, expireTime, allowAccount, signature);
      
      if (response.code === 0) {
        return {
          accessToken: response.data.accessToken,
          expireAt: response.data.expireAt // 到期时间戳（秒）
        };
      } else {
        throw new Error(response.msg || 'Failed to get access token');
      }
    };
  };
  
  
  const initClient = async () => {
    if (walletClient?.transport && address) {
      const provider = new BrowserProvider(walletClient.transport);
      const signer = await provider.getSigner();
      
      const client = new MyxClient({
        signer: signer,
        chainId: ChainId.ARB_TESTNET,
        walletClient: walletClient,
        brokerAddress: "0x461A33C5E75c292A45f8c961ab816060a94AfbA0",
        isTestnet: true,
        logLevel: 'debug',
        getAccessToken: createGetAccessTokenMethod(), // 传入 accessToken 获取方法
      });
      
      setMyxClient(client);
    }
  };
  
  useEffect (() => {
    if (walletClient?.transport) {
      initClient();
    }
  }, [walletClient])
  return (
      <Outlet />
  );
}
