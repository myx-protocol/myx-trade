import {
  getDisputeCourtContract,
  getReimbursementContract,
} from "@/web3/providers";
import { MyxClient } from "..";
import { MyxErrorCode, MyxSDKError } from "../error/const";
import { BytesLike, Signer } from "ethers";
import { Address } from "viem";
import { BaseMyxClient } from "../base/BaseMyxClient";

export class Appeal extends BaseMyxClient {
  constructor(client: MyxClient) {
    super(client);
  }

  private async getDisputeCourtContract() {
    const contract = await getDisputeCourtContract(this.getConfig()?.chainId);
    return this.connectContract(contract);
  }

  private async getReimbursementContract() {
    const contract = await getReimbursementContract(this.getConfig()?.chainId);
    return this.connectContract(contract);
  }

  /**
   * submit appeal
   * @param poolId - the pool id
   * @param poolToken - the pool token
   * @returns the transaction receipt
   */
  async submitAppeal(poolId: string, poolToken: string) {
    const contract = await this.getDisputeCourtContract();
    const tx = await contract.fileDispute(poolId, poolToken);
    const receipt = await tx.wait();
    return receipt;
  }

  /**
   * vote for appeal
   * @param caseId - the case id
   * @param isFor - true if for the appeal, false if against the appeal
   * @returns the transaction receipt
   */
  async voteForAppeal(caseId: number, isFor: boolean) {
    const contract = await this.getDisputeCourtContract();
    const tx = await contract.vote(caseId, isFor ? 1 : 0);
    const receipt = await tx.wait();
    return receipt;
  }

  /**
   * claim appeal margin
   * @param caseId - the case id
   * @returns the transaction receipt
   */
  async claimAppealMargin(caseId: number) {
    const contract = await this.getDisputeCourtContract();
    const tx = await contract.claimBond(caseId);
    const receipt = await tx.wait();
    return receipt;
  }

  /**
   * claim reimbursement
   * @param caseId - the case id
   * @param baseAmount - the base amount
   * @param quoteAmount - the quote amount
   * @param merkleProof - the merkle proof
   * @returns the transaction receipt
   */
  async claimReimbursement(
    caseId: number,
    baseAmount: number,
    quoteAmount: number,
    merkleProof: BytesLike[]
  ) {
    const contract = await this.getReimbursementContract();
    const tx = await contract.claimReimbursement(
      caseId,
      baseAmount,
      quoteAmount,
      merkleProof
    );
    const receipt = await tx.wait();
    return receipt;
  }
}
