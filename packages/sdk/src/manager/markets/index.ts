import { MyxBase } from "../base";
import { ConfigManager } from "../config";

export class MyxMarkets extends MyxBase {
  constructor() {
    super();
    this.getConfig();
  }

  getSymbols () {
    return Promise.resolve([])
  }
}
