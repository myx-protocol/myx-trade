import { Address } from "viem";
import { MyxClient } from "../index.js";
import { BaseMyxClient } from "../base/BaseMyxClient.js";

export class Referrals extends BaseMyxClient {
  constructor(client: MyxClient) {
    super(client);
  }

  async claimRebate(tokenAddress: Address) {
    const brokerContract = await this.connectContract(
      await this.getBrokerContract()
    );
    const _gasLimit = await brokerContract.claimRebate.estimateGas(
      tokenAddress
    );
    const gasLimit = await this.client.utils.getGasLimitByRatio(_gasLimit);
    const gasPrice = await this.client.utils.getGasPriceByRatio();
    const tx = await brokerContract.claimRebate(tokenAddress, {
      gasPrice,
      gasLimit,
    });
    const receipt = await tx.wait();
    return receipt;
  }
}
