import type { MarketPool } from "@myx-trade/sdk";
import { Button, Table, type TableColumnsType } from "antd";
import { useMemo } from "react";
import { type SubscriptionStore } from "@/store/SubscriptionStore";

type MarketProps = {
  markets: MarketPool[];
  onSubscribeTicker: (globalId: number) => void;
  onUnsubscribeTicker: (globalId: number) => void;
  onSubscribeKline: (globalId: number) => void;
  onUnsubscribeKline: (globalId: number) => void;
  subscriptionStore: SubscriptionStore;
};

export const Markets = ({
  markets,
  onSubscribeTicker,
  onUnsubscribeTicker,
  onSubscribeKline,
  onUnsubscribeKline,
  subscriptionStore,
}: MarketProps) => {
  const columns = useMemo<TableColumnsType<MarketPool>>(() => {
    return [
      {
        title: "Global ID",
        dataIndex: "globalId",
      },
      {
        title: "Pair",
        dataIndex: "baseSymbol + quoteSymbol",
        render(_, row) {
          return `${row.baseSymbol}/${row.quoteSymbol}`;
        },
      },
      {
        title: "Price",
        render(_, row) {
          const ticker = subscriptionStore.getTickerByGlobalId(row.globalId);
          return ticker?.price || "-";
        },
      },
      {
        title: "Change",
        render(_, row) {
          const ticker = subscriptionStore.getTickerByGlobalId(row.globalId);
          return ticker?.change || "-";
        },
      },
      {
        title: "Operation",
        render(_, row) {
          const ticker = subscriptionStore.getTickerByGlobalId(row.globalId);
          const isTickerSubscribed = ticker?.isSubscribed || false;
          const isKlineSubscribed = subscriptionStore.getKlineSubscription(row.globalId);

          return (
            <div style={{ display: 'flex', gap: '8px' }}>
              <Button
                type={isTickerSubscribed ? "default" : "primary"}
                onClick={() => {
                  if (isTickerSubscribed) {
                    onUnsubscribeTicker(row.globalId);
                  } else {
                    onSubscribeTicker(row.globalId);
                  }
                }}
              >
                {isTickerSubscribed ? "UnSub Ticker" : "Sub Ticker"}
              </Button>
              <Button
                type={isKlineSubscribed ? "default" : "primary"}
                onClick={() => {
                  if (isKlineSubscribed) {
                    onUnsubscribeKline(row.globalId);
                  } else {
                    onSubscribeKline(row.globalId);
                  }
                }}
              >
                {isKlineSubscribed ? "UnSub Kline" : "Sub Kline"}
              </Button>
            </div>
          );
        },
      },
    ];
  }, [onSubscribeTicker, onUnsubscribeTicker, onSubscribeKline, onUnsubscribeKline, subscriptionStore]);

  return <Table dataSource={markets} columns={columns} />;
};
