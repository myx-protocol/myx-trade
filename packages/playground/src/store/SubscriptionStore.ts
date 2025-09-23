import type { MarketPool, KlineDataResponse } from "@myx-trade/sdk";
import { create } from "zustand";

type MarketTicker = MarketPool & {
  price: string;
  change: string;
  isSubscribed: boolean;
};

export interface SubscriptionStore {
  marketList: MarketPool[];
  marketTickerMap: Map<number, MarketTicker>;
  klineDataMap: Map<number, KlineDataResponse[]>;
  klineSubscriptionMap: Map<number, boolean>;
  setMarketList: (marketList: MarketPool[]) => void;
  updateTickerPrice: (globalId: number, price: string, change: string) => void;
  setTickerSubscription: (globalId: number, isSubscribed: boolean) => void;
  getTickerByGlobalId: (globalId: number) => MarketTicker | undefined;
  addKlineData: (globalId: number, data: KlineDataResponse) => void;
  getKlineDataByGlobalId: (globalId: number) => KlineDataResponse[];
  setKlineSubscription: (globalId: number, isSubscribed: boolean) => void;
  getKlineSubscription: (globalId: number) => boolean;
}

export const useSubscriptionStore = create<SubscriptionStore>((set, get) => ({
  marketList: [],
  marketTickerMap: new Map(),
  klineDataMap: new Map(),
  klineSubscriptionMap: new Map(),
  setMarketList: (marketList: MarketPool[]) => set({ marketList }),
  updateTickerPrice: (
    globalId: number,
    price: string,
    change: string = "0"
  ) => {
    set((state) => {
      const newMap = new Map(state.marketTickerMap);
      const existing = newMap.get(globalId);
      if (existing) {
        newMap.set(globalId, { ...existing, price, change });
      } else {
        // 如果不存在，从marketList中找到对应的market
        const market = state.marketList.find((m) => m.globalId === globalId);
        if (market) {
          newMap.set(globalId, {
            ...market,
            price,
            isSubscribed: true,
            change,
          });
        }
      }
      return { marketTickerMap: newMap };
    });
  },
  setTickerSubscription: (globalId: number, isSubscribed: boolean) => {
    set((state) => {
      const newMap = new Map(state.marketTickerMap);
      const existing = newMap.get(globalId);
      if (existing) {
        newMap.set(globalId, { ...existing, isSubscribed });
      } else {
        // 如果不存在，从marketList中找到对应的market
        const market = state.marketList.find((m) => m.globalId === globalId);
        if (market) {
          newMap.set(globalId, {
            ...market,
            price: "0",
            isSubscribed,
            change: "0",
          });
        }
      }
      return { marketTickerMap: newMap };
    });
  },
  getTickerByGlobalId: (globalId: number) => {
    return get().marketTickerMap.get(globalId);
  },
  addKlineData: (globalId: number, data: KlineDataResponse) => {
    set((state) => {
      const newMap = new Map(state.klineDataMap);
      const existingData = newMap.get(globalId) || [];
      newMap.set(globalId, [...existingData, data]);
      return { klineDataMap: newMap };
    });
  },
  getKlineDataByGlobalId: (globalId: number) => {
    return get().klineDataMap.get(globalId) || [];
  },
  setKlineSubscription: (globalId: number, isSubscribed: boolean) => {
    set((state) => {
      const newMap = new Map(state.klineSubscriptionMap);
      newMap.set(globalId, isSubscribed);
      return { klineSubscriptionMap: newMap };
    });
  },
  getKlineSubscription: (globalId: number) => {
    return get().klineSubscriptionMap.get(globalId) || false;
  },
}));
