import React, { useEffect, useRef, useState } from "react";
import { useWalletClient, useChainId } from "wagmi";
import { BrowserProvider } from "ethers";

import { ChainId } from "../../config/chain";
import { MyxClient } from "@myx-trade/sdk";

import useSWR from "swr";
import { Button } from "antd";

const TradePage: React.FC = () => {
  const currentChainId = useChainId();
  const { data: walletClient } = useWalletClient();
  const myxClientRef = useRef<MyxClient | null>(null);

  const onTickerMessage = (data: any) => {
    console.log("subscribeMarketList", data);
  };

  const subscribeMarketList = () => {
    console.log("subscribeMarketList--start");
    myxClientRef.current?.subscription.subscribeTickers(1, onTickerMessage);
  };

  const onSubScribeMarketList = () => {
    console.log("subscribeMarketList--end");
    myxClientRef.current?.subscription.unsubscribeTickers(1, onTickerMessage);
  };

  const initClient = async () => {
    if (walletClient?.transport) {
      const provider = new BrowserProvider(walletClient.transport);
      const signer = await provider.getSigner();
      myxClientRef.current = new MyxClient({
        signer: signer,
        chainId: ChainId.ARB_TESTNET,
        brokerAddress: "0xa70245309631Ce97425532466F24ef86FE630311",
        isTestnet: true,
        logLevel: "debug",
      });
      mutatePoolList();
      myxClientRef.current.subscription.connect();
    }
  };

  useEffect(() => {
    if (walletClient?.transport) {
      initClient();
    }
  }, [walletClient]);

  const { data: poolList, mutate: mutatePoolList } = useSWR(
    "getPoolList",
    async () => {
      const poolList = await myxClientRef.current?.markets.listPools();
      console.log("poolList-->", poolList);

      const poolsWithLevel = await Promise.all(
        poolList.map(async (pool: any) => {
          try {
            const levelRes =
              await myxClientRef.current?.markets.getPoolLevelConfig(
                pool.poolId
              );
            return { ...pool, levelData: levelRes.data };
          } catch (error) {
            console.error(
              `Failed to get level data for pool ${pool.poolId}:`,
              error
            );
            return { ...pool, levelData: null };
          }
        })
      );

      return poolsWithLevel;
    },
    {
      revalidateOnFocus: false,
    }
  );

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px" }}>
      <Button onClick={subscribeMarketList}>订阅单个市场行情</Button>
      <Button onClick={onSubScribeMarketList}>取消订阅单个市场行情</Button>
    </div>
  );
};

export default TradePage;
