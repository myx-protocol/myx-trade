import { Address } from "viem";
import { MyxClient } from "..";
import { BaseMyxClient } from "../base/BaseMyxClient";

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
    const gasLimit = await this.client.utils.getGasLimitByRatio(
      this.config.chainId,
      _gasLimit
    );
    const gasPrice = await this.client.utils.getGasPriceByRatio(
      this.config.chainId
    );
    const tx = await brokerContract.claimRebate(tokenAddress, {
      gasPrice,
      gasLimit,
    });
    const receipt = await tx.wait();
    return receipt;
  }
}
