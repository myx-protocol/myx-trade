import { MyxBase } from "./base";
import { ConfigManager, type MyxClientConfig } from "./config/index";
import { MyxMarkets } from "./markets";
import { MyxTrading } from "./trading";
import { MyxLP } from "./lp";

// Mixin 工具函数
function applyMixins(derivedCtor: any, constructors: any[]) {
    constructors.forEach(baseCtor => {
        Object.getOwnPropertyNames(baseCtor.prototype).forEach(name => {
            if (name !== 'constructor') {
                Object.defineProperty(
                    derivedCtor.prototype,
                    name,
                    Object.getOwnPropertyDescriptor(baseCtor.prototype, name) || Object.create(null)
                );
            }
        });
    });
}

// 定义 Mixin 接口
interface MyxClient extends MyxMarkets, MyxTrading, MyxLP {}

// 使用 Mixin 模式实现多继承
class MyxClient extends MyxBase {
    constructor (options: MyxClientConfig) {
        super();
        this.setConfig(options);
    }

}

// 应用 Mixin，让 MyxClient 拥有所有模块的方法
applyMixins(MyxClient, [MyxMarkets, MyxTrading, MyxLP]);




