import { MyxBase } from "../base";

export class MyxTrading extends MyxBase {
  constructor() {
    super();
    this.getConfig();
  }

  placeOrder(symbol: string, side: 'buy' | 'sell', amount: number) {
    return Promise.resolve({
      orderId: '12345',
      symbol,
      side,
      amount,
      status: 'pending'
    });
  }

  cancelOrder(orderId: string) {
    return Promise.resolve({
      orderId,
      status: 'cancelled'
    });
  }

  getOrderHistory() {
    return Promise.resolve([]);
  }
}
