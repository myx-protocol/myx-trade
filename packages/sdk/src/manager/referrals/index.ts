import type { Address } from "viem";
import { MyxClient } from "../index.js";
import { BaseMyxClient } from "../base/BaseMyxClient.js";
import { getBrokerSingerContract } from "@/web3/providers";
import { getPublicClient } from "@/web3/viemClients.js";

export class Referrals extends BaseMyxClient {
  constructor(client: MyxClient) {
    super(client);
  }

  async claimRebate(tokenAddress: Address) {
    const config = this.getConfig();
    const brokerContract = await getBrokerSingerContract(this.config.chainId, config!.brokerAddress);
    const _gasLimit = await brokerContract.estimateGas!.claimRebate([tokenAddress]);
    const gasLimit = await this.client.utils.getGasLimitByRatio(_gasLimit);
    const gasPrice = await this.client.utils.getGasPriceByRatio();
    const hash = await brokerContract.write!.claimRebate([tokenAddress], { gasPrice, gasLimit });
    return getPublicClient(this.config.chainId).waitForTransactionReceipt({ hash });
  }
}
