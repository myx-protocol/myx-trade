import {
  getDisputeCourtContract,
  getReimbursementContract,
} from "@/web3/providers";
import { MyxClient } from "..";
import { MyxErrorCode, MyxSDKError } from "../error/const";
import { BytesLike, EventLog, Log, Signer } from "ethers";
import { Address } from "viem";
import { BaseMyxClient } from "../base/BaseMyxClient";
import { AppealVoteParams } from "./type";
import {
  AppealReimbursementParams,
  AppealUploadEvidenceParams,
  GetAppealDetailParams,
  GetAppealListParams,
  GetAppealNodeVoteListParams,
  GetAppealReconsiderationDetailParams,
  GetAppealReconsiderationListParams,
  GetAppealVoteNodeDetailParams,
  GetIsVoteNodeParams,
  PostVoteSignatureParams,
} from "../api/appeal-type";

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

    const value = BigInt(prices[0].value.toString() || "1");

    const _gasLimit = await contract.fileDispute.estimateGas(
      prices,
      poolId,
      lpToken,
      {
        value,
      }
    );
    this.client.logger.debug("_gasLimit", _gasLimit);
    const gasLimit = await this.client.utils.getGasLimitByRatio(_gasLimit);
    const gasPrice = await this.client.utils.getGasPriceByRatio();
    this.client.logger.debug("txParams", {
      gasLimit,
      gasPrice,
      value,
    });
    const tx = await contract.fileDispute(prices, poolId, lpToken, {
      value,
      gasLimit,
      gasPrice,
    });
    const receipt = await tx.wait();
    // receipt.
    const DisputeFiledLog = receipt?.logs.find((item: EventLog | Log) => {
      if ((item as EventLog).eventName === "DisputeFiled") {
        return true;
      }
      return false;
    });
    if (!DisputeFiledLog || !receipt) {
      throw new MyxSDKError(
        MyxErrorCode.TransactionFailed,
        "DisputeFiledLog not found"
      );
    }
    const caseId = (DisputeFiledLog as EventLog).args.getValue(
      "caseId"
    ) as bigint;
    this.client.logger.debug("caseId", caseId);
    this.client.logger.debug("event", DisputeFiledLog);
    return {
      transaction: receipt,
      caseId: caseId,
    };
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

  async appealReconsideration(
    caseId: number,
    appealToken: Address,
    appealAmount: string
  ) {
    const contract = await this.getDisputeCourtContract();
    const account = (await this.config.signer?.getAddress()) ?? "";
    const spenderAddress = this.getAddressConfig().DISPUTE_COURT;
    const isNeedApprove = await this.client.utils.needsApproval(
      account,
      this.config.chainId,
      appealToken,
      appealAmount,
      spenderAddress
    );
    if (isNeedApprove) {
      const res = await this.client.utils.approveAuthorization({
        chainId: this.config.chainId,
        quoteAddress: appealToken,
        spenderAddress,
      });
      if (res.code !== 0) {
        throw new MyxSDKError(MyxErrorCode.TransactionFailed, res.message);
      }
    }
    const _gasLimit = await contract.appeal.estimateGas(caseId);
    const gasLimit = await this.client.utils.getGasLimitByRatio(_gasLimit);
    const gasPrice = await this.client.utils.getGasPriceByRatio();
    const tx = await contract.appeal(caseId, {
      gasLimit,
      gasPrice,
    });
    const receipt = await tx.wait();
    return receipt;
  }

  /**
   * http api
   */

  async getAppealList(params: GetAppealListParams) {
    return this.client.api.getAppealList(params);
  }

  async getAppealDetail(params: GetAppealDetailParams) {
    return this.client.api.getAppealDetail(params);
  }

  async uploadAppealEvidence(params: AppealUploadEvidenceParams) {
    return this.client.api.uploadAppealEvidence(params);
  }

  async getAppealReconsiderationList(
    params: GetAppealReconsiderationListParams
  ) {
    return this.client.api.getAppealReconsiderationList(params);
  }

  async getAppealReconsiderationDetail(
    params: GetAppealReconsiderationDetailParams
  ) {
    return this.client.api.getAppealReconsiderationDetail(params);
  }

  async getAppealReimbursementList(params: AppealReimbursementParams) {
    return this.client.api.getAppealReimbursementList(params);
  }

  async getAppealNodeVoteList(params: GetAppealNodeVoteListParams) {
    return this.client.api.getAppealNodeVoteList(params);
  }

  async getAppealNodeVoteDetail(params: GetAppealVoteNodeDetailParams) {
    return this.client.api.getAppealNodeVoteDetails(params);
  }

  async getIsVoteNode(params: GetIsVoteNodeParams) {
    return this.client.api.getIsVoteNode(params);
  }

  async postVoteSignature(params: PostVoteSignatureParams) {
    return this.client.api.postVoteSignature(params);
  }

  async getPedingVoteCount() {
    return this.client.api.getPedingVoteCount();
  }

  async getMyAppealCount() {
    return this.client.api.getMyAppealCount();
  }
}
