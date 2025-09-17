import { MyxBase } from "./base";
import { type MyxClientConfig } from "./config/index";
import { MyxMarkets } from "./markets";
import { MyxTrading } from "./trading";
import { MyxLP } from "./lp";

// Mixin  core
function applyMixins(derivedCtor: any, constructors: any[]) {
  constructors.forEach((baseCtor) => {
    Object.getOwnPropertyNames(baseCtor.prototype).forEach((name) => {
      if (name !== "constructor") {
        Object.defineProperty(
          derivedCtor.prototype,
          name,
          Object.getOwnPropertyDescriptor(baseCtor.prototype, name) ||
            Object.create(null)
        );
      }
    });
  });
}

// Mixin types
interface MyxClient extends MyxMarkets, MyxTrading, MyxLP {}
class MyxClient extends MyxBase {
  constructor(options: MyxClientConfig) {
    super();
    this.setConfig(options);
  }
}

// apply Mixin
applyMixins(MyxClient, [MyxMarkets, MyxTrading, MyxLP]);
