import {
  getDisputeCourtContract,
  getReimbursementContract,
  ProviderType,
} from "@/web3/providers";
import { getPublicClient } from "@/web3/viemClients.js";
import { MyxClient } from "../index.js";
import { MyxErrorCode, MyxSDKError } from "../error/const.js";
import { decodeEventLog } from "viem";
import type { Address } from "viem";
import DisputeCourt_ABI from "@/abi/DisputeCourt.json";
import { BaseMyxClient } from "../base/BaseMyxClient.js";
import { AppealVoteParams } from "./type.js";
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
  GetWarmholeSignParams,
  GuardianSignatureItem,
  PostVoteSignatureParams,
} from "../api/appeal-type.js";
import { ConfigManager } from "../config/index.js";

export class Appeal extends BaseMyxClient {
  private configManager: ConfigManager;
  constructor(client: MyxClient, configManager: ConfigManager) {
    super(client);
    this.configManager = configManager;
  }

  private getDisputeCourtContract(auth: boolean = true) {
    return getDisputeCourtContract(this.config.chainId, auth ? ProviderType.Signer : ProviderType.JSON);
  }

  private getReimbursementContract(auth: boolean = true) {
    return getReimbursementContract(this.config.chainId, auth ? ProviderType.Signer : ProviderType.JSON);
  }

  private getCaseIdFromReceiptLogs(receipt: { logs: { address: Address; topics: unknown[]; data: `0x${string}` }[] }, eventName: "DisputeFiled" | "AppealFiled") {
    const key = eventName === "DisputeFiled" ? "caseId" : "appealCaseId";
    for (const log of receipt.logs) {
      try {
        const decoded = decodeEventLog({ abi: DisputeCourt_ABI as any, data: log.data, topics: log.topics as [`0x${string}`, ...`0x${string}`[]] }) as { eventName: string; args?: Record<string, bigint> };
        if (decoded.eventName === eventName && decoded.args && key in decoded.args) {
          return decoded.args[key];
        }
      } catch {
        continue;
      }
    }
    return null;
  }

  /**
   * submit appeal
   * @param poolId - the pool id
   * @param poolToken - the pool token
   * @returns the transaction receipt
   */
  async submitAppeal(poolId: string, lpToken: Address, lpAmount: string) {
    // lp approve check
    const account = this.configManager.hasSigner() ? await this.configManager.getSignerAddress(this.config.chainId) : "";
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

    const _gasLimit = await contract.estimateGas!.fileDispute([prices, poolId as `0x${string}`, lpToken], { value });
    const gasLimit = await this.client.utils.getGasLimitByRatio(_gasLimit);
    const gasPrice = await this.client.utils.getGasPriceByRatio();
    const hash = await contract.write!.fileDispute([prices, poolId as `0x${string}`, lpToken], {
      value,
      gasLimit,
      gasPrice,
    });
    const receipt = await getPublicClient(this.config.chainId).waitForTransactionReceipt({ hash });
    const caseId = this.getCaseIdFromReceiptLogs(receipt, "DisputeFiled");
    if (caseId == null) {
      throw new MyxSDKError(MyxErrorCode.TransactionFailed, "DisputeFiledLog not found");
    }
    return { transaction: receipt, caseId };
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
    const _gasLimit = await contract.estimateGas!.vote([caseId, validator, isFor ? 1 : 0, deadline, v, r, s]);
    const gasLimit = await this.client.utils.getGasLimitByRatio(_gasLimit);
    const gasPrice = await this.client.utils.getGasPriceByRatio();
    const hash = await contract.write!.vote([caseId, validator, isFor ? 1 : 0, deadline, v, r, s], { gasLimit, gasPrice });
    const receipt = await getPublicClient(this.config.chainId).waitForTransactionReceipt({ hash });
    return receipt;
  }

  /**
   * claim appeal margin
   * @param caseId - the case id
   * @returns the transaction receipt
   */
  async claimAppealMargin(caseId: number) {
    const contract = await this.getDisputeCourtContract();
    const _gasLimit = await contract.estimateGas!.claimBond([caseId]);
    const gasLimit = await this.client.utils.getGasLimitByRatio(_gasLimit);
    const gasPrice = await this.client.utils.getGasPriceByRatio();
    const hash = await contract.write!.claimBond([caseId], { gasLimit, gasPrice });
    return getPublicClient(this.config.chainId).waitForTransactionReceipt({ hash });
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
    baseAmount: string,
    quoteAmount: string,
    merkleProof: `0x${string}`[]
  ) {
    const contract = await this.getReimbursementContract();
    const _gasLimit = await contract.estimateGas!.claimReimbursement([caseId, baseAmount, quoteAmount, merkleProof]);
    const gasLimit = await this.client.utils.getGasLimitByRatio(_gasLimit);
    const gasPrice = await this.client.utils.getGasPriceByRatio();
    const hash = await contract.write!.claimReimbursement([caseId, baseAmount, quoteAmount, merkleProof], { gasLimit, gasPrice });
    return getPublicClient(this.config.chainId).waitForTransactionReceipt({ hash });
  }

  /**
   * get dispute configuration
   */
  async getDisputeConfiguration() {
    const contract = await this.getDisputeCourtContract(false);
    return contract.read.getDisputeConfiguration();
  }

  /**
   * 
   * vote node for submit appeal
   */
  async submitAppealByVoteNode(poolId: string, response: string, guardianSignatures: GuardianSignatureItem[]) {
    const contract = await this.getDisputeCourtContract();
    const gasPrice = await this.client.utils.getGasPriceByRatio();
    const gasLimit = await this.client.utils.getGasLimitByRatio(await contract.estimateGas!.fileDisputeFromStaker([poolId as `0x${string}`, response, guardianSignatures]));
    const hash = await contract.write!.fileDisputeFromStaker([poolId as `0x${string}`, response, guardianSignatures], { gasLimit, gasPrice });
    const receipt = await getPublicClient(this.config.chainId).waitForTransactionReceipt({ hash });
    const caseId = this.getCaseIdFromReceiptLogs(receipt, "DisputeFiled");
    if (caseId == null) throw new MyxSDKError(MyxErrorCode.TransactionFailed, "DisputeFiledLog not found");
    return { tx: receipt, caseId };
  }

  async appealReconsideration(
    caseId: number,
    appealToken: Address,
    appealAmount: string
  ) {
    const contract = await this.getDisputeCourtContract();
    const account = this.configManager.hasSigner() ? await this.configManager.getSignerAddress(this.config.chainId) : "";
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
    const _gasLimit = await contract.estimateGas!.appeal([caseId]);
    const gasLimit = await this.client.utils.getGasLimitByRatio(_gasLimit);
    const gasPrice = await this.client.utils.getGasPriceByRatio();
    const hash = await contract.write!.appeal([caseId], { gasLimit, gasPrice });
    const receipt = await getPublicClient(this.config.chainId).waitForTransactionReceipt({ hash });
    const appealCaseId = this.getCaseIdFromReceiptLogs(receipt, "AppealFiled");
    if (appealCaseId == null) throw new MyxSDKError(MyxErrorCode.TransactionFailed, "AppealFiledLog not found");
    return { tx: receipt, appealCaseId, caseId };
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

  async getWarmholeSign(params: GetWarmholeSignParams) {
    return this.client.api.getWarmholeSign(params)
  }
  async getDisputeTotalCount() {
    return this.client.api.getDisputeTotalCount();
  }
  async getAppealTotalCount() {
    return this.client.api.getAppealTotalCount();
  }
  async getReimbursementTotalCount() {
    return this.client.api.getReimbursementTotalCount();
  }
  async getAppealStatus(poolId: string, chainId: number, address: string) {
    return this.client.api.getPoolAppealStatus({ poolId, chainId, address, accessToken: await this.configManager.getAccessToken() ?? '' });
  }
}
