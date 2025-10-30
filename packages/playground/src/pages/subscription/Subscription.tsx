import React, {  useRef, useCallback, useContext } from "react";
import { useAccount } from "wagmi";
import CryptoJS from "crypto-js";

import {
  MyxClient,
  type TickersDataResponse,
  type KlineDataResponse,
} from "@myx-trade/sdk";

import { Card, Typography, Button, Space, notification } from "antd";

import { useSubscriptionStore } from "@/store/SubscriptionStore";
import { Markets } from "@/components/Markets";
import { MyxClientContext } from "@providers/MyxClientContext.ts";

const { Title } = Typography;

const SubscriptionPage: React.FC = () => {
  const { address, isConnected } = useAccount();
  const {myxClient} = useContext(MyxClientContext);
  const myxClientRef = useRef<MyxClient | null>(myxClient);

  const subscriptionStore = useSubscriptionStore();
  const getPoolList = useCallback(async () => {
    if (!myxClientRef.current) return [];
    return myxClientRef.current?.markets.listPools();
  }, []);

  const onKlineData = useCallback(
    (data: KlineDataResponse) => {
      console.log("Kline data:", data);
      subscriptionStore.addKlineData(data.globalId, data);
    },
    [subscriptionStore]
  );

  const subscribeKline = useCallback(
    (globalId: number) => {
      if (!myxClientRef.current) return;

      // 设置订阅状态
      subscriptionStore.setKlineSubscription(globalId, true);

      myxClientRef.current.subscription.subscribeKline(
        globalId,
        "1m",
        onKlineData
      );
    },
    [onKlineData, subscriptionStore]
  );

  const unsubscribeKline = useCallback(
    (globalId: number) => {
      if (!myxClientRef.current) return;

      // 设置取消订阅状态
      subscriptionStore.setKlineSubscription(globalId, false);

      myxClientRef.current.subscription.unsubscribeKline(
        globalId,
        "1m",
        onKlineData
      );
    },
    [onKlineData, subscriptionStore]
  );

  const onTickerData = useCallback(
    (data: TickersDataResponse) => {
      // console.log("Ticker data:", data);
      subscriptionStore.updateTickerPrice(
        data.globalId,
        data.data.p,
        data.data.C
      );
    },
    [subscriptionStore]
  );

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

  // Order 数据回调
  const onOrderData = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (data: any) => {
      console.log("Order data:", data);
      subscriptionStore.addOrderData(data);
    },
    [subscriptionStore]
  );

  // Position 数据回调
  const onPositionData = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (data: any) => {
      console.log("Position data:", data);
      subscriptionStore.addPositionData(data);
    },
    [subscriptionStore]
  );

  // 订阅 Order
  const subscribeOrder = useCallback(async () => {
    if (!myxClientRef.current) return;

    try {
      // 先进行认证
      await myxClientRef.current.subscription.auth().then(() => {});

      // 设置订阅状态

      // 订阅订单数据
      myxClientRef.current.subscription
        .subscribeOrder(onOrderData)
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
  }, [onOrderData, subscriptionStore]);

  // 取消订阅 Order
  const unsubscribeOrder = useCallback(() => {
    if (!myxClientRef.current) return;

    // 设置取消订阅状态
    subscriptionStore.setOrderSubscription(false);

    // 取消订阅订单数据
    myxClientRef.current.subscription.unsubscribeOrder(onOrderData);
  }, [onOrderData, subscriptionStore]);

  // 订阅 Position
  const subscribePosition = useCallback(async () => {
    if (!myxClientRef.current) return;

    try {
      // 先进行认证
      await myxClientRef.current.subscription.auth();

      // 设置订阅状态
      subscriptionStore.setPositionSubscription(true);

      // 订阅持仓数据
      myxClientRef.current.subscription.subscribePosition(onPositionData);
    } catch (error) {
      console.error("订阅Position失败:", error);
      subscriptionStore.setPositionSubscription(false);
    }
  }, [onPositionData, subscriptionStore]);

  // 取消订阅 Position
  const unsubscribePosition = useCallback(() => {
    if (!myxClientRef.current) return;

    // 设置取消订阅状态
    subscriptionStore.setPositionSubscription(false);

    // 取消订阅持仓数据
    myxClientRef.current.subscription.unsubscribePosition(onPositionData);
  }, [onPositionData, subscriptionStore]);


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
