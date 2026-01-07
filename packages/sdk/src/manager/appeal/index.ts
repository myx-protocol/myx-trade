import {
  getDisputeCourtContract,
  getReimbursementContract,
} from "@/web3/providers";
import { MyxClient } from "..";
import { MyxErrorCode, MyxSDKError } from "../error/const";
import { BytesLike, Signer } from "ethers";
import { Address } from "viem";
import { BaseMyxClient } from "../base/BaseMyxClient";
import { AppealVoteParams } from "./type";

export class Appeal extends BaseMyxClient {
  constructor(client: MyxClient) {
    super(client);
  }

  private async getDisputeCourtContract() {
    const contract = await getDisputeCourtContract(this.config.chainId);
    return this.connectContract(contract);
  }

  private async getReimbursementContract() {
    const contract = await getReimbursementContract(this.config.chainId);
    return this.connectContract(contract);
  }

  /**
   * submit appeal
   * @param poolId - the pool id
   * @param poolToken - the pool token
   * @returns the transaction receipt
   */
  async submitAppeal(poolId: string, lpToken: Address, lpAmount: string) {
    // lp approve check
    const account = (await this.config.signer?.getAddress()) ?? "";
    const needApprove = await this.client.utils.needsApproval(
      account,
      this.config.chainId,
      lpToken,
      lpAmount,
      this.getAddressConfig().DISPUTE_COURT
    );
    this.client.logger.debug("need-approve", needApprove);
    if (needApprove) {
      await this.client.utils.approveAuthorization({
        chainId: this.config.chainId,
        quoteAddress: lpToken,
        spenderAddress: this.getAddressConfig().DISPUTE_COURT,
      });
    }
    const contract = await this.getDisputeCourtContract();
    const prices = await this.client.utils.buildUpdatePriceParams(
      poolId,
      this.config.chainId
    );
    this.client.logger.debug("prices", prices);
    // const _gasLimit = await contract.fileDispute.estimateGas(
    //   prices,
    //   poolId,
    //   lpToken
    // );
    // const gasLimit = await this.client.utils.getGasLimitByRatio(_gasLimit);
    // const gasPrice = await this.client.utils.getGasPriceByRatio();
    // this.client.logger.debug("txParams", {
    //   gasLimit,
    //   gasPrice,
    // });
    const tx = await contract.fileDispute(prices, poolId, lpToken, {
      value: prices[0].value.toString() || '1'
    });
    const receipt = await tx.wait();
    return receipt;
  }

  /**
   * vote for appeal
   * @param caseId - the case id
   * @param isFor - true if for the appeal, false if against the appeal
   * @returns the transaction receipt
   */
  async voteForAppeal({
    caseId,
    validator,
    isFor,
    deadline,
    v,
    r,
    s,
  }: AppealVoteParams) {
    const contract = await this.getDisputeCourtContract();
    const _gasLimit = await contract.vote.estimateGas(
      caseId,
      validator,
      isFor ? 1 : 0,
      deadline,
      v,
      r,
      s
    );
    const gasLimit = await this.client.utils.getGasLimitByRatio(_gasLimit);
    const gasPrice = await this.client.utils.getGasPriceByRatio();
    const tx = await contract.vote(
      caseId,
      validator,
      isFor ? 1 : 0,
      deadline,
      v,
      r,
      s,
      {
        gasLimit,
        gasPrice,
      }
    );
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
    const _gasLimit = await contract.claimBond.estimateGas(caseId);
    const gasLimit = await this.client.utils.getGasLimitByRatio(_gasLimit);
    const gasPrice = await this.client.utils.getGasPriceByRatio();
    const tx = await contract.claimBond(caseId, {
      gasLimit,
      gasPrice,
    });
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
    const _gasLimit = await contract.claimReimbursement.estimateGas(
      caseId,
      baseAmount,
      quoteAmount,
      merkleProof
    );
    const gasLimit = await this.client.utils.getGasLimitByRatio(_gasLimit);
    const gasPrice = await this.client.utils.getGasPriceByRatio();
    const tx = await contract.claimReimbursement(
      caseId,
      baseAmount,
      quoteAmount,
      merkleProof,
      {
        gasLimit,
        gasPrice,
      }
    );
    const receipt = await tx.wait();
    return receipt;
  }

  /**
   * get dispute configuration
   */
  async getDisputeConfiguration() {
    const contract = await this.getDisputeCourtContract();
    const configuration = await contract.getDisputeConfiguration();
    return configuration;
  }
}
