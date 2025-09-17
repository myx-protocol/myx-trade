import { ConfigManager, MyxClientConfig } from "../config/index";

export class MyxBase  {
    configManager: ConfigManager;
     constructor () {
        this.configManager = ConfigManager.getInstance();
    }

    getConfig () {
        return this.configManager.getConfig();
    }

    setConfig (config: MyxClientConfig) {
        this.configManager.setConfig(config);
    }
}