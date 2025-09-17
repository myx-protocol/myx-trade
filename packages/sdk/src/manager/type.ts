import { Signer } from "ethers";

class Manager {
  private signer: Signer | null;
  private chainId: number | null;
  private isTestnet: boolean;
  private poolingInterval: number;
  private seamlessMode: boolean;
  private seamlessKeyPath: string;
  private seamlessKeyPassword: string;

  constructor({signer, chainId, isTestnet, poolingInterval, seamlessMode, seamlessKeyPath, seamlessKeyPassword}: {signer: Signer, chainId: number, isTestnet?: boolean, poolingInterval: number, seamlessMode: boolean, seamlessKeyPath: string, seamlessKeyPassword: string}) { 
    this.signer = signer;
    this.chainId = chainId;
    this.isTestnet = !!isTestnet;
    this.poolingInterval = 2000;
    this.seamlessMode = seamlessMode;
    this. seamlessKeyPath = seamlessKeyPath;
    this.seamlessKeyPassword = seamlessKeyPassword;
  }

  async initialize() {
    // ws初始化 
    await this.initWebSocket();

  }

  async initWebSocket() {

  }
}

export default Manager;