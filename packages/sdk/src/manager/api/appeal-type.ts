import { type Address } from "viem";

export enum AppealType {
  UnderReview = 1,
  InitialVote = 2,
  PublicNotice = 3,
  UnderReconsideration = 4,
  Won = 5,
  Failed = 6,
  PlatformRuling = 7,
  PlatformRevoked = 8,
}

export enum AppealReconsiderationType {
  InitialVoting = 1,
  PublicNotice = 2,
  UnderReconsideration = 3,
  Won = 5,
  Failed = 4,
  PlatformRuling = 6,
  PlatformRevoked = 7,
  ReconsiderationVoting = 8,
  AppealRevert = 9,
}

export enum AppealStage {
  UnderReview = 1,
  PublicNotice = 2,
  UnderReconsideration = 3,
  Completed = 4,
}

export interface GetAppealListParams {
  chainId?: number;
  poolId?: string;
  type?: AppealType;
  stage?: AppealStage;
  before?: number;
  after?: number;
  limit?: number;
}

export interface AppealListItem {
  id: number;
  chainId: number;
  caseId: number;
  poolId: string;
  complainant: string; // appeal user
  poolToken: string; // appeal margin token
  disputeBond: string; // appeal margin amount
  type: AppealType;
  stage: AppealStage;
  totalVoteCount: number; // total vote count
  votedCount: number; // voted count
  appealCount: number; // 反诉总数
  appealDeadline: number; // 反诉截止时间
  compClaimDeadline: number; // 补偿领取时间
  updateTime: number; // update time
  disputeBondState: AppealClaimStatusEnum
  disputeBondClaimTime: number
  claimStatus: AppealClaimStatusEnum // 补偿金领取状态
  baseAmount?: string
  quoteAmount?: string
}

export interface GetAppealDetailParams {
  caseId: number;
}

export enum NodeTypeEnum {
  ElectionNode = 0,
  OfficialNode = 1,
}

export enum VoteTypeEnum {
  Reject = 0,
  Support = 1,
}

export interface AppealVoteItem {
  time: number;
  node: string;
  type: NodeTypeEnum;
  option: VoteTypeEnum;
}

export interface AppealReconsiderationItem {
  respondent: string; // 上诉地址
  type: AppealReconsiderationType;
  stage: AppealStage;
  voteCount: number;
  totalVoteCount: number;
}

export interface AppealDetail {
  caseId: number;
  chainId: number;
  poolId: string;
  complainant: string;
  poolToken: string;
  disputeBond: string;
  type: AppealType;
  stage: AppealStage;
  totalVoteCount: number;
  votedCount: number;
  appealCount: number;
  appealDeadline: number;
  voteDeadline: number;
  epochStartTime: number;
  epochEndTime: number;
  publicNoticeTime: number;
  respondents: string[];
  compClaimDeadline: number;
  votes: AppealVoteItem[];
  appeals: AppealReconsiderationItem[];
  disputeTime: number; // 申诉时间
  txHash: string; // 申诉交易hash
  disputeBondState: AppealClaimStatusEnum;
  disputeBondClaimTime: number
  claimStatus: AppealClaimStatusEnum
  baseAmount?: string
  quoteAmount?: string
}

export interface AppealUploadEvidenceParams {
  caseId: number;
  poolId: string;
  evidenceUrl: string;
}

export interface GetAppealReconsiderationListParams {
  chainId?: number;
  poolId?: string;
  type?: AppealReconsiderationType;
  stage?: AppealStage;
  before?: number;
  after?: number;
  limit?: number;
}

export interface AppealReconsiderationListItem {
  id: number;
  chainId: number;
  caseId: number;
  poolId: string;
  respondent: string;
  appealToken: string; // margin token address
  appealBond: string; // margin amount
  type: AppealReconsiderationType;
  stage: AppealStage;
  totalVoteCount: number;
  votedCount: number
  appealDeadline: number; // appeal deadline
  publicNoticeEndTime: number; // public notice end time
  updateTime: number; // update time
  appealCaseId?: number; // 反诉案件ID
  aappealBondClaimTime?: number
}

export interface GetAppealReconsiderationDetailParams {
  caseId: number;
  appealCaseId?: number;
}

export interface AppealReconsiderationDetail {
  id: number;
  chainId: number;
  poolId: string;
  complainant: string;
  respondent: string;
  type: AppealReconsiderationType;
  stage: AppealStage;
  disputeTotalVoteCount: number;
  disputeVotedCount: number;
  disputeTxHash: string;
  disputeVoteDeadline: number;
  disputeStartTime: number;
  disputeVotes: AppealVoteItem[]; // 初审投票
  publicNoticeStartTime: number;
  publicNoticeEndTime: number;
  appealDeadline: number; // 反诉结束时间
  respondents: string[]; // 操作者列表
  appealToken: string; // margin token address
  appealBond: string; // margin amount
  appealVotes: AppealVoteItem[]; // 反诉投票
  appealTotalVoteCount: number; //可投票总数
  appealVotedCount: number; // 已投票数
  appealCaseId?: number; // 反诉案件ID
  appealType: AppealReconsiderationType; // 反诉类型-与当前用户绑定
  appealStage: AppealStage; // 反诉阶段-与当前用户绑定
  appealBondState: AppealClaimStatusEnum; // 反诉保证金状态
  appealBondClaimTime?: number
}

export interface AppealReimbursementParams {
  before?: number;
  after?: number;
  limit?: number;
}

export enum AppealClaimStatusEnum {
  UnClaimed = 0,
  Claimed = 1,
}

export interface AppealReimbursementItem {
  id: number;
  caseId: number;
  chainId: number;
  poolId: string;
  baseAmount: string;
  quoteAmount: string;
  claimStatus: AppealClaimStatusEnum
  claimTime: number;
  expireTime: number;
  createTime: number;
  proof: string[]
}

export interface GetAppealNodeVoteListParams {
  before?: number;
  after?: number;
  limit?: number;
}

export enum AppealNodeVotedStateEnum {
  NotVoted = 0,
  Voted = 1,
}

export enum AppealCaseTypeEnum {
  Appeal = 1,
  Reconsideration = 2,
}

export enum AppealNodeStateEnum {
  NoVote = 0,
  Supported = 1,
  Rejected = 2,
}

export interface AppealNodeVoteListItem {
  id: number;
  chainId: number;
  caseId: number;
  poolId: string;
  appealCaseId: number;
  type: AppealCaseTypeEnum;
  deadline: number;
  votedCount: number;
  totalVoteCount: number;
  voteOption: VoteTypeEnum;
  state: AppealNodeVotedStateEnum;
  nodeState: AppealNodeStateEnum;
}

export interface AppealNodeVoteItem {
  disputeEvidenceUrl: string;
  appealEvidenceUrl: NodeTypeEnum;
  disputeRemark: VoteTypeEnum;
  appealRemark: string;
  chainId: number;
  poolId: string;
  respondent: string;
  respondents: string[];
  voteDeadline: number;
}

export interface GetIsVoteNodeParams {
  account: string;
}

export enum IsVoteNodeEnum {
  Yes = 1,
  No = 0,
}

export interface GetAppealVoteNodeDetailParams {
  caseId: number;
  appealCaseId?: number;
}

export interface PostVoteSignatureParams {
  chainId: number;
  address: Address; // DisputeCourt contract address
  caseId: number;
  type: AppealCaseTypeEnum;
  validator: Address;
  voteOption: VoteTypeEnum;
  nonce: number;
  deadline: number;
  signature: string;
}

export type PostVoteResponse = 1 | 0;


export interface GetWarmholeSignParams {
  account: string
}

export interface GuardianSignatureItem {
  r: string
  s: string
  v: string
  guardianIndex: number
}
export interface GetWarmholeSignResponse {
  epoch: number // 质押期数
  response: string // data
  guardianSignatures: GuardianSignatureItem[]

}
