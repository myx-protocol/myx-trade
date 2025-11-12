import React, { useRef, useCallback, useContext, useEffect } from "react";

import {
  MyxClient,
  type TickersDataResponse,
  type KlineDataResponse,
} from "@myx-trade/sdk";

import { Card, Typography, Button, Space, notification } from "antd";

import { useSubscriptionStore } from "@/store/SubscriptionStore";
import { Markets } from "@/components/Markets";
import { MyxClientContext } from "@providers/MyxClientContext.ts";
import { getPools } from "@/api";

const { Title } = Typography;

const SubscriptionPage: React.FC = () => {
  const { myxClient } = useContext(MyxClientContext);

  const myxClientRef = useRef<MyxClient | null>(myxClient);

  useEffect(() => {
    myxClientRef.current = myxClient;
    if (myxClient) {
      myxClient.subscription.connect();

      return () => {
        myxClient.subscription.disconnect();
      };
    }
  }, [myxClient]);

  const subscriptionStore = useSubscriptionStore();

  // 使用 ref 持有最新的 store，避免回调闭包导致引用变更
  const subscriptionStoreRef = useRef(subscriptionStore);
  useEffect(() => {
    subscriptionStoreRef.current = subscriptionStore;
  }, [subscriptionStore]);

  // 为每种订阅维护稳定的回调引用，确保取消订阅传入同一个函数
  const tickerHandlerMapRef = useRef(
    new Map<number, (data: TickersDataResponse) => void>()
  );
  const klineHandlerMapRef = useRef(
    new Map<number, (data: KlineDataResponse) => void>()
  );
  const orderHandlerRef = useRef<((data: unknown) => void) | null>(null);
  const positionHandlerRef = useRef<((data: unknown) => void) | null>(null);

  useEffect(() => {
    getPools().then((pools) => {
      subscriptionStore.setMarketList(pools.data);
    });
  }, [ subscriptionStore]);

  const ensureKlineHandler = useCallback((globalId: number) => {
    if (!klineHandlerMapRef.current.has(globalId)) {
      const handler = (data: KlineDataResponse) => {
        // 使用最新的 store 引用
        subscriptionStoreRef.current.addKlineData(data.globalId, data);
      };
      klineHandlerMapRef.current.set(globalId, handler);
    }
    return klineHandlerMapRef.current.get(globalId)!;
  }, []);

  const subscribeKline = useCallback(
    (globalId: number) => {
      if (!myxClientRef.current) return;
      subscriptionStore.setKlineSubscription(globalId, true);
      const handler = ensureKlineHandler(globalId);
      myxClientRef.current.subscription.subscribeKline(
        globalId,
        "1m",
        handler
      );
    },
    [ensureKlineHandler, subscriptionStore]
  );

  const unsubscribeKline = useCallback(
    (globalId: number) => {
      if (!myxClientRef.current) return;
      subscriptionStore.setKlineSubscription(globalId, false);
      const handler = ensureKlineHandler(globalId);
      myxClientRef.current.subscription.unsubscribeKline(
        globalId,
        "1m",
        handler
      );
    },
    [ensureKlineHandler, subscriptionStore]
  );

  const ensureTickerHandler = useCallback((globalId: number) => {
    if (!tickerHandlerMapRef.current.has(globalId)) {
      const handler = (data: TickersDataResponse) => {
        subscriptionStoreRef.current.updateTickerPrice(
          data.globalId,
          data.data.p,
          data.data.C
        );
      };
      tickerHandlerMapRef.current.set(globalId, handler);
    }
    return tickerHandlerMapRef.current.get(globalId)!;
  }, []);

  // 订阅ticker的方法
  const subscribeTicker = useCallback(
    (globalId: number) => {
      if (!myxClientRef.current) return;
      subscriptionStore.setTickerSubscription(globalId, true);
      const handler = ensureTickerHandler(globalId);
      myxClientRef.current.subscription.subscribeTickers(globalId, handler);
    },
    [subscriptionStore, ensureTickerHandler]
  );

  // 取消订阅ticker的方法
  const unsubscribeTicker = useCallback(
    (globalId: number) => {
      if (!myxClientRef.current) return;
      subscriptionStore.setTickerSubscription(globalId, false);
      const handler = ensureTickerHandler(globalId);
      myxClientRef.current.subscription.unsubscribeTickers(globalId, handler);
    },
    [subscriptionStore, ensureTickerHandler]
  );

  // Order 数据回调
  if (!orderHandlerRef.current) {
    orderHandlerRef.current = (data: unknown) => {
      subscriptionStoreRef.current.addOrderData(data);
    };
  }

  // Position 数据回调
  if (!positionHandlerRef.current) {
    positionHandlerRef.current = (data: unknown) => {
      subscriptionStoreRef.current.addPositionData(data);
    };
  }

  // 订阅 Order
  const subscribeOrder = useCallback(async () => {
    if (!myxClientRef.current) return;

    try {
      // 先进行认证
      await myxClientRef.current.subscription.auth().then(() => {});

      // 设置订阅状态

      // 订阅订单数据
      myxClientRef.current.subscription
        .subscribeOrder(orderHandlerRef.current!)
        .then(() => {
          subscriptionStore.setOrderSubscription(true);
        })
        .catch((err) => {
          notification.error({
            message: "订阅Order失败",
            description: err.message,
          });
        });
    } catch (error) {
      console.error("订阅Order失败:", error);
      subscriptionStore.setOrderSubscription(false);
    }
  }, [subscriptionStore]);

  // 取消订阅 Order
  const unsubscribeOrder = useCallback(() => {
    if (!myxClientRef.current) return;

    // 设置取消订阅状态
    subscriptionStore.setOrderSubscription(false);

    // 取消订阅订单数据
    myxClientRef.current.subscription.unsubscribeOrder(orderHandlerRef.current!);
  }, [subscriptionStore]);

  // 订阅 Position
  const subscribePosition = useCallback(async () => {
    if (!myxClientRef.current) return;

    try {
      // 先进行认证
      await myxClientRef.current.subscription.auth();

      // 设置订阅状态
      subscriptionStore.setPositionSubscription(true);

      // 订阅持仓数据
      myxClientRef.current.subscription.subscribePosition(
        positionHandlerRef.current!
      );
    } catch (error) {
      console.error("订阅Position失败:", error);
      subscriptionStore.setPositionSubscription(false);
    }
  }, [subscriptionStore]);

  // 取消订阅 Position
  const unsubscribePosition = useCallback(() => {
    if (!myxClientRef.current) return;

    // 设置取消订阅状态
    subscriptionStore.setPositionSubscription(false);

    // 取消订阅持仓数据
    myxClientRef.current.subscription.unsubscribePosition(
      positionHandlerRef.current!
    );
  }, [subscriptionStore]);

  return (
    <div style={{ maxWidth: 1400, margin: "0 auto", padding: "24px" }}>
      <Title level={2}>SDK Subscription 测试页面</Title>

      {/* 账户信息订阅控制 */}
      <Card title="账户信息订阅" style={{ marginBottom: 24 }}>
        <Space size="middle">
          <div>
            <Button
              type={subscriptionStore.isOrderSubscribed ? "default" : "primary"}
              onClick={
                subscriptionStore.isOrderSubscribed
                  ? unsubscribeOrder
                  : subscribeOrder
              }
            >
              {subscriptionStore.isOrderSubscribed
                ? "取消订阅 Order"
                : "订阅 Order"}
            </Button>
            <span
              style={{
                marginLeft: 8,
                color: subscriptionStore.isOrderSubscribed ? "#52c41a" : "#999",
              }}
            >
              {subscriptionStore.isOrderSubscribed ? "已订阅" : "未订阅"}
            </span>
          </div>
          <div>
            <Button
              type={
                subscriptionStore.isPositionSubscribed ? "default" : "primary"
              }
              onClick={
                subscriptionStore.isPositionSubscribed
                  ? unsubscribePosition
                  : subscribePosition
              }
            >
              {subscriptionStore.isPositionSubscribed
                ? "取消订阅 Position"
                : "订阅 Position"}
            </Button>
            <span
              style={{
                marginLeft: 8,
                color: subscriptionStore.isPositionSubscribed
                  ? "#52c41a"
                  : "#999",
              }}
            >
              {subscriptionStore.isPositionSubscribed ? "已订阅" : "未订阅"}
            </span>
          </div>
          <Button onClick={() => subscriptionStore.clearOrderData()}>
            清空订单数据
          </Button>
          <Button onClick={() => subscriptionStore.clearPositionData()}>
            清空持仓数据
          </Button>
        </Space>
      </Card>

      {/* Pool List */}
      <Card title="Pool List" style={{ marginBottom: 24 }}>
        <Markets
          markets={subscriptionStore.marketList}
          onSubscribeTicker={subscribeTicker}
          onUnsubscribeTicker={unsubscribeTicker}
          onSubscribeKline={subscribeKline}
          onUnsubscribeKline={unsubscribeKline}
          subscriptionStore={subscriptionStore}
        />
      </Card>

      {/* Kline Data Display */}
      <Card title="Kline Data" style={{ marginBottom: 24 }}>
        <div style={{ maxHeight: "400px", overflowY: "auto" }}>
          {subscriptionStore.marketList.map((market) => {
            const klineData = subscriptionStore.getKlineDataByGlobalId(
              market.globalId
            );
            if (klineData.length === 0) return null;

            return (
              <div
                key={market.globalId}
                style={{
                  marginBottom: "16px",
                  padding: "12px",
                  border: "1px solid #f0f0f0",
                  borderRadius: "6px",
                }}
              >
                <h4>
                  {market.baseSymbol}/{market.quoteSymbol} (Global ID:{" "}
                  {market.globalId})
                </h4>
                <div style={{ fontSize: "12px", color: "#666" }}>
                  {klineData.map((data, index) => (
                    <div
                      key={index}
                      style={{
                        marginBottom: "8px",
                        padding: "8px",
                        backgroundColor: "#fafafa",
                        borderRadius: "4px",
                      }}
                    >
                      <div>
                        <strong>Time:</strong>{" "}
                        {new Date(data.data.t).toLocaleString()}
                      </div>
                      <div>
                        <strong>Open:</strong> {data.data.o}
                      </div>
                      <div>
                        <strong>High:</strong> {data.data.h}
                      </div>
                      <div>
                        <strong>Low:</strong> {data.data.l}
                      </div>
                      <div>
                        <strong>Close:</strong> {data.data.c}
                      </div>
                      <div>
                        <strong>Volume:</strong> {data.data.v}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
          {subscriptionStore.marketList.every(
            (market) =>
              subscriptionStore.getKlineDataByGlobalId(market.globalId)
                .length === 0
          ) && (
            <div
              style={{ textAlign: "center", color: "#999", padding: "40px" }}
            >
              暂无Kline数据，请点击"Sub Kline"按钮订阅
            </div>
          )}
        </div>
      </Card>

      {/* Order Data Display */}
      <Card title="订单数据 (Order Data)" style={{ marginBottom: 24 }}>
        <div style={{ maxHeight: "400px", overflowY: "auto" }}>
          {subscriptionStore.orderData.length > 0 ? (
            subscriptionStore.orderData.map((order, index) => (
              <div
                key={index}
                style={{
                  marginBottom: "16px",
                  padding: "12px",
                  border: "1px solid #f0f0f0",
                  borderRadius: "6px",
                }}
              >
                <div style={{ fontSize: "12px", color: "#666" }}>
                  <div>
                    <strong>时间:</strong>{" "}
                    {new Date(order.timestamp).toLocaleString()}
                  </div>
                  <pre
                    style={{
                      margin: "8px 0",
                      padding: "8px",
                      backgroundColor: "#fafafa",
                      borderRadius: "4px",
                      fontSize: "11px",
                      overflow: "auto",
                    }}
                  >
                    {JSON.stringify(order, null, 2)}
                  </pre>
                </div>
              </div>
            ))
          ) : (
            <div
              style={{ textAlign: "center", color: "#999", padding: "40px" }}
            >
              暂无订单数据，请点击"订阅 Order"按钮订阅
            </div>
          )}
        </div>
      </Card>

      {/* Position Data Display */}
      <Card title="持仓数据 (Position Data)" style={{ marginBottom: 24 }}>
        <div style={{ maxHeight: "400px", overflowY: "auto" }}>
          {subscriptionStore.positionData.length > 0 ? (
            subscriptionStore.positionData.map((position, index) => (
              <div
                key={index}
                style={{
                  marginBottom: "16px",
                  padding: "12px",
                  border: "1px solid #f0f0f0",
                  borderRadius: "6px",
                }}
              >
                <div style={{ fontSize: "12px", color: "#666" }}>
                  <div>
                    <strong>时间:</strong>{" "}
                    {new Date(position.timestamp).toLocaleString()}
                  </div>
                  <pre
                    style={{
                      margin: "8px 0",
                      padding: "8px",
                      backgroundColor: "#fafafa",
                      borderRadius: "4px",
                      fontSize: "11px",
                      overflow: "auto",
                    }}
                  >
                    {JSON.stringify(position, null, 2)}
                  </pre>
                </div>
              </div>
            ))
          ) : (
            <div
              style={{ textAlign: "center", color: "#999", padding: "40px" }}
            >
              暂无持仓数据，请点击"订阅 Position"按钮订阅
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default SubscriptionPage;
