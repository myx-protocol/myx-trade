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
  NotAppealFailed = 10
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
  appealCount: number; // Total appeal count
  appealDeadline: number; // Appeal deadline
  compClaimDeadline: number; // Compensation claim deadline
  updateTime: number; // Update time
  disputeBondState: AppealClaimStatusEnum
  disputeBondClaimTime: number
  claimStatus: AppealClaimStatusEnum // Compensation claim status
  baseAmount?: string
  quoteAmount?: string
  successVoteCount: number
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
  respondent: string; // Respondent address
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
  disputeTime: number; // Dispute time
  txHash: string; // Dispute tx hash
  disputeBondState: AppealClaimStatusEnum;
  disputeBondClaimTime: number
  claimStatus: AppealClaimStatusEnum
  baseAmount?: string
  quoteAmount?: string
  successVoteCount: number
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
  appealCaseId?: number; // Appeal case ID
  appealBondClaimTime?: number
  successVoteCount: number
  appealSuccessVoteCount?: number
  appealTotalVoteCount?: number
  appealVotedCount?: number 
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
  disputeVotes: AppealVoteItem[]; // First-instance votes
  publicNoticeStartTime: number;
  publicNoticeEndTime: number;
  appealDeadline: number; // Appeal end time
  respondents: string[]; // Respondent list
  appealToken: string; // Margin token address
  appealBond: string; // Margin amount
  appealVotes: AppealVoteItem[]; // Appeal votes
  appealTotalVoteCount: number; // Total votable count
  appealVotedCount: number; // Voted count
  appealCaseId?: number; // Appeal case ID
  appealType: AppealReconsiderationType; // Appeal type (bound to current user)
  appealStage: AppealStage; // Appeal stage (bound to current user)
  appealBondState: AppealClaimStatusEnum; // Appeal bond state
  appealBondClaimTime?: number
  txHash: string
  appealStartTime: number
  appealEndTime: number
  appealSuccessVoteCount?: number
  successVoteCount: number
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
  proof: string
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
  epoch: number // Staking epoch
  response: string // data
  guardianSignatures: GuardianSignatureItem[]
}

export enum AppealStatus {
  None = 0,
  isAppealing = 1,
}