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
    const tx = await brokerContract.claimRebate(tokenAddress);
    const receipt = await tx.wait();
    return receipt;
  }
}
