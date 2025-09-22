import type { MarketPool } from "@myx-trade/sdk";
import { Button, Table, type TableColumnsType } from "antd";
import { useMemo } from "react";
import { type SubscriptionStore } from "@/store/SubscriptionStore";

type MarketProps = {
  markets: MarketPool[];
  onSubscribeTicker: (globalId: number) => void;
  onUnsubscribeTicker: (globalId: number) => void;
  onSubscribeKline: (globalId: number) => void;
  subscriptionStore: SubscriptionStore;
};

export const Markets = ({
  markets,
  onSubscribeTicker,
  onUnsubscribeTicker,
  onSubscribeKline,
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
          const isSubscribed = ticker?.isSubscribed || false;

          return (
            <div style={{ display: 'flex', gap: '8px' }}>
              <Button
                type={isSubscribed ? "default" : "primary"}
                onClick={() => {
                  if (isSubscribed) {
                    onUnsubscribeTicker(row.globalId);
                  } else {
                    onSubscribeTicker(row.globalId);
                  }
                }}
              >
                {isSubscribed ? "UnSub Ticker" : "Sub Ticker"}
              </Button>
              <Button
                type="primary"
                onClick={() => {
                  onSubscribeKline(row.globalId);
                }}
              >
                Sub Kline
              </Button>
            </div>
          );
        },
      },
    ];
  }, [onSubscribeTicker, onUnsubscribeTicker, onSubscribeKline, subscriptionStore]);

  return <Table dataSource={markets} columns={columns} />;
};
