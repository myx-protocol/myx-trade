"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const base_1 = require("./base");
const markets_1 = require("./markets");
const trading_1 = require("./trading");
const lp_1 = require("./lp");
// Mixin 工具函数
function applyMixins(derivedCtor, constructors) {
    constructors.forEach(baseCtor => {
        Object.getOwnPropertyNames(baseCtor.prototype).forEach(name => {
            if (name !== 'constructor') {
                Object.defineProperty(derivedCtor.prototype, name, Object.getOwnPropertyDescriptor(baseCtor.prototype, name) || Object.create(null));
            }
        });
    });
}
// 使用 Mixin 模式实现多继承
class MyxClient extends base_1.MyxBase {
    constructor(options) {
        super();
        this.setConfig(options);
        // 初始化各个模块实例
        this.markets = new markets_1.MyxMarkets();
        this.trading = new trading_1.MyxTrading();
        this.lp = new lp_1.MyxLP();
    }
    // 为了保持向后兼容，保留原有的 getPairList 方法
    getPairList() {
        return this.markets.getSymbols();
    }
}
// 应用 Mixin，让 MyxClient 拥有所有模块的方法
applyMixins(MyxClient, [markets_1.MyxMarkets, trading_1.MyxTrading, lp_1.MyxLP]);
const myxClient = new MyxClient({
    chainId: 421614,
    rpcUrl: "https://arb-testnet.g.alchemy.com/v2/demo",
    apiBaseUrl: "https://api-test.myx.cash",
    debug: true
});
const myxClient2 = new MyxClient({
    chainId: 421613,
    rpcUrl: "https://arb-testnet.g.alchemy.com/v2/demo",
    apiBaseUrl: "https://api-test.myx.cash",
    debug: true
});
// 现在可以直接调用模块方法了！就像多继承一样！
console.log('=== 使用示例 ===');
// 方式1：直接调用（推荐）- 就像多继承一样！
console.log('1. 直接调用模块方法（多继承效果）：');
myxClient.getSymbols().then(console.log);
myxClient.placeOrder('BTC/USDT', 'buy', 100).then(console.log);
myxClient.addLiquidity('pool123', 1000).then(console.log);
// 方式2：通过模块属性访问
console.log('\n2. 通过模块属性访问：');
myxClient.markets.getSymbols().then(console.log);
myxClient.trading.placeOrder('ETH/USDT', 'sell', 50).then(console.log);
myxClient.lp.addLiquidity('pool456', 2000).then(console.log);
// 方式3：保持向后兼容的原有方式
console.log('\n3. 向后兼容方式：');
myxClient.getPairList().then(console.log);
console.log('\n=== 所有可用的方法 ===');
console.log('MyxClient 直接拥有的方法:', Object.getOwnPropertyNames(Object.getPrototypeOf(myxClient)).filter(name => name !== 'constructor'));
console.log('Markets 模块方法:', Object.getOwnPropertyNames(Object.getPrototypeOf(myxClient.markets)).filter(name => name !== 'constructor'));
console.log('Trading 模块方法:', Object.getOwnPropertyNames(Object.getPrototypeOf(myxClient.trading)).filter(name => name !== 'constructor'));
console.log('LP 模块方法:', Object.getOwnPropertyNames(Object.getPrototypeOf(myxClient.lp)).filter(name => name !== 'constructor'));
