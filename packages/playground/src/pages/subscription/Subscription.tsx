import React, { useEffect, useRef, useCallback } from "react";
import { useWalletClient } from "wagmi";
import { BrowserProvider } from "ethers";

import { ChainId } from "../../config/chain";
import {
  MyxClient,
  type TickersDataResponse,
  type KlineDataResponse,
} from "@myx-trade/sdk";

import { Card, Typography } from "antd";

import { useSubscriptionStore } from "@/store/SubscriptionStore";
import { Markets } from "@/components/Markets";

const { Title } = Typography;

const SubscriptionPage: React.FC = () => {
  const { data: walletClient } = useWalletClient();
  const myxClientRef = useRef<MyxClient | null>(null);

  const subscriptionStore = useSubscriptionStore();
  const getPoolList = useCallback(async () => {
    if (!myxClientRef.current) return [];
    return myxClientRef.current?.markets.listPools();
  }, []);

  const onKlineData = useCallback((data: KlineDataResponse) => {
    console.log("Kline data:", data);
    subscriptionStore.addKlineData(data.globalId, data);
  }, [subscriptionStore]);

  const subscribeKline = useCallback(
    (globalId: number) => {
      if (!myxClientRef.current) return;
      myxClientRef.current.subscription.subscribeKline(
        globalId,
        "1d",
        onKlineData
      );
    },
    [onKlineData]
  );

  // const unsubscribeKline = useCallback(
  //   (globalId: number) => {
  //     if (!myxClientRef.current) return;
  //     myxClientRef.current.subscription.unsubscribeKline(
  //       globalId,
  //       "1d",
  //       onKlineData
  //     );
  //   },
  //   [onKlineData]
  // );

  const onTickerData = useCallback((data: TickersDataResponse) => {
    // console.log("Ticker data:", data);
    subscriptionStore.updateTickerPrice(
      data.globalId,
      data.data.p,
      data.data.C
    );
  }, [subscriptionStore]);

  // 订阅ticker的方法
  const subscribeTicker = useCallback(
    (globalId: number) => {
      if (!myxClientRef.current) return;

      // 设置订阅状态
      subscriptionStore.setTickerSubscription(globalId, true);

      // 订阅ticker数据
      myxClientRef.current.subscription.subscribeTickers(
        globalId,
        onTickerData
      );
    },
    [subscriptionStore, onTickerData]
  );

  // 取消订阅ticker的方法
  const unsubscribeTicker = useCallback(
    (globalId: number) => {
      if (!myxClientRef.current) return;

      // 设置取消订阅状态
      subscriptionStore.setTickerSubscription(globalId, false);

      // 取消订阅ticker数据
      myxClientRef.current.subscription.unsubscribeTickers(
        globalId,
        onTickerData
      );
    },
    [subscriptionStore, onTickerData]
  );

  // Initialize client
  const initClient = useCallback(async () => {
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
      // mutatePoolList();
      getPoolList().then(subscriptionStore.setMarketList);
      myxClientRef.current.subscription.connect();
    }
  }, [walletClient, getPoolList, subscriptionStore.setMarketList]);

  useEffect(() => {
    if (walletClient?.transport) {
      initClient();
    }
  }, [walletClient, initClient]);

  return (
    <div style={{ maxWidth: 1400, margin: "0 auto", padding: "24px" }}>
      <Title level={2}>SDK Subscription 测试页面</Title>

      {/* Pool List */}
      <Card title="Pool List" style={{ marginBottom: 24 }}>
        <Markets
          markets={subscriptionStore.marketList}
          onSubscribeTicker={subscribeTicker}
          onUnsubscribeTicker={unsubscribeTicker}
          onSubscribeKline={subscribeKline}
          subscriptionStore={subscriptionStore}
        />
      </Card>

      {/* Kline Data Display */}
      <Card title="Kline Data" style={{ marginBottom: 24 }}>
        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
          {subscriptionStore.marketList.map((market) => {
            const klineData = subscriptionStore.getKlineDataByGlobalId(market.globalId);
            if (klineData.length === 0) return null;
            
            return (
              <div key={market.globalId} style={{ marginBottom: '16px', padding: '12px', border: '1px solid #f0f0f0', borderRadius: '6px' }}>
                <h4>{market.baseSymbol}/{market.quoteSymbol} (Global ID: {market.globalId})</h4>
                <div style={{ fontSize: '12px', color: '#666' }}>
                  {klineData.map((data, index) => (
                    <div key={index} style={{ marginBottom: '8px', padding: '8px', backgroundColor: '#fafafa', borderRadius: '4px' }}>
                      <div><strong>Time:</strong> {new Date(data.data.t).toLocaleString()}</div>
                      <div><strong>Open:</strong> {data.data.o}</div>
                      <div><strong>High:</strong> {data.data.h}</div>
                      <div><strong>Low:</strong> {data.data.l}</div>
                      <div><strong>Close:</strong> {data.data.c}</div>
                      <div><strong>Volume:</strong> {data.data.v}</div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
          {subscriptionStore.marketList.every(market => 
            subscriptionStore.getKlineDataByGlobalId(market.globalId).length === 0
          ) && (
            <div style={{ textAlign: 'center', color: '#999', padding: '40px' }}>
              暂无Kline数据，请点击"Sub Kline"按钮订阅
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default SubscriptionPage;
