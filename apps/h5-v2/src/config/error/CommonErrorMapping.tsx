import { Trans } from '@lingui/react/macro'
import type { ReactElement } from 'react'

export const CommonErrorMapping: Record<string, ReactElement> = {
  'contract runner does not support gas estimation': (
    <Trans>contract runner does not support gas estimation</Trans>
  ),
  'Upfront cost exceeds account balance (transaction up-front cost 0x7000000 exceeds transaction sender account balance 0x0)':
    <Trans>Upfront cost exceeds account balance</Trans>,
  UserRejectedRequestError: <Trans>User Rejected</Trans>,
  ACTION_REJECTED: <Trans>User Rejected</Trans>,
  'User Rejected': <Trans>User Rejected</Trans>,
  INSUFFICIENT_BALANCE: <Trans>Insufficient wallet balance</Trans>,
  'Insufficient wallet balance': <Trans>Insufficient wallet balance</Trans>,
  'AccountInsufficientFreeAmount()': <Trans>AccountInsufficientFreeAmount()</Trans>,
  'AccountInsufficientReservedAmount()': <Trans>AccountInsufficientReservedAmount()</Trans>,
  'AccountInsufficientTradableAmount(uint256,uint256)': (
    <Trans>AccountInsufficientTradableAmount(uint256,uint256)</Trans>
  ),
  'AddressEmptyCode(address)': <Trans>AddressEmptyCode(address)</Trans>,
  'ERC1967InvalidImplementation(address)': <Trans>ERC1967InvalidImplementation(address)</Trans>,
  'ERC1967NonPayable()': <Trans>ERC1967NonPayable()</Trans>,
  'FailedCall()': <Trans>FailedCall()</Trans>,
  'InvalidInitialization()': <Trans>InvalidInitialization()</Trans>,
  'NotAddressManager()': <Trans>NotAddressManager()</Trans>,
  'NotDependencyManager()': <Trans>NotDependencyManager()</Trans>,
  'NotInitializing()': <Trans>NotInitializing()</Trans>,
  'NotProxyAdmin()': <Trans>NotProxyAdmin()</Trans>,
  'PermissionDenied(address,address)': <Trans>PermissionDenied(address,address)</Trans>,
  'SafeERC20FailedOperation(address)': <Trans>SafeERC20FailedOperation(address)</Trans>,
  'UUPSUnauthorizedCallContext()': <Trans>UUPSUnauthorizedCallContext()</Trans>,
  'UUPSUnsupportedProxiableUUID(bytes32)': <Trans>UUPSUnsupportedProxiableUUID(bytes32)</Trans>,
  'SafeCastOverflowedUintToInt(uint256)': <Trans>SafeCastOverflowedUintToInt(uint256)</Trans>,
  'ConvertAmountMismatch(uint256,uint256)': <Trans>ConvertAmountMismatch(uint256,uint256)</Trans>,
  'EnforcedPause()': <Trans>EnforcedPause()</Trans>,
  'ExpectedPause()': <Trans>ExpectedPause()</Trans>,
  'InRewindMode()': <Trans>InRewindMode()</Trans>,
  'InsufficientOutputAmount()': <Trans>InsufficientOutputAmount()</Trans>,
  'MismatchExecuteFee(uint256,uint256,uint256)': (
    <Trans>MismatchExecuteFee(uint256,uint256,uint256)</Trans>
  ),
  'NotInRewindMode()': <Trans>NotInRewindMode()</Trans>,
  'OnlyRelayer()': <Trans>OnlyRelayer()</Trans>,
  'OwnableInvalidOwner(address)': <Trans>OwnableInvalidOwner(address)</Trans>,
  'OwnableUnauthorizedAccount(address)': <Trans>OwnableUnauthorizedAccount(address)</Trans>,
  'ReentrancyGuardReentrantCall()': <Trans>ReentrancyGuardReentrantCall()</Trans>,
  'TransferFailed()': <Trans>TransferFailed()</Trans>,
  'InternalOnly()': <Trans>InternalOnly()</Trans>,
  'ExceedOrderSize(uint256)': <Trans>ExceedOrderSize(uint256)</Trans>,
  'InsufficientCollateral(uint256,uint256)': <Trans>InsufficientCollateral(uint256,uint256)</Trans>,
  'InvalidParameter()': <Trans>InvalidParameter()</Trans>,
  'NotActiveBroker(address)': <Trans>NotActiveBroker(address)</Trans>,
  'NotOrderOwner()': <Trans>NotOrderOwner()</Trans>,
  'NotPositionOwner()': <Trans>NotPositionOwner()</Trans>,
  'OrderNotExist(OrderId)': <Trans>OrderNotExist(OrderId)</Trans>,
  'PoolNotActive(PoolId)': <Trans>PoolNotActive(PoolId)</Trans>,
  'AlreadyMinted()': <Trans>AlreadyMinted()</Trans>,
  'ERC721IncorrectOwner(address,uint256,address)': (
    <Trans>ERC721IncorrectOwner(address,uint256,address)</Trans>
  ),
  'ERC721InsufficientApproval(address,uint256)': (
    <Trans>ERC721InsufficientApproval(address,uint256)</Trans>
  ),
  'ERC721InvalidApprover(address)': <Trans>ERC721InvalidApprover(address)</Trans>,
  'ERC721InvalidOperator(address)': <Trans>ERC721InvalidOperator(address)</Trans>,
  'ERC721InvalidOwner(address)': <Trans>ERC721InvalidOwner(address)</Trans>,
  'ERC721InvalidReceiver(address)': <Trans>ERC721InvalidReceiver(address)</Trans>,
  'ERC721InvalidSender(address)': <Trans>ERC721InvalidSender(address)</Trans>,
  'ERC721NonexistentToken(uint256)': <Trans>ERC721NonexistentToken(uint256)</Trans>,
  'ExceedMaxLeverage(PositionId)': <Trans>ExceedMaxLeverage(PositionId)</Trans>,
  'ExceedPositionSize()': <Trans>ExceedPositionSize()</Trans>,
  'InvalidPosition(PositionId)': <Trans>InvalidPosition(PositionId)</Trans>,
  'PositionNotHealthy(PositionId,uint256)': <Trans>PositionNotHealthy(PositionId,uint256)</Trans>,
  'PositionNotInitialized(PositionId)': <Trans>PositionNotInitialized(PositionId)</Trans>,
  'UnderflowOI()': <Trans>UnderflowOI()</Trans>,
  'InsufficientBalance()': <Trans>InsufficientBalance()</Trans>,
  'InsufficientRiskReserves()': <Trans>InsufficientRiskReserves()</Trans>,
  'InvalidAmount()': <Trans>InvalidAmount()</Trans>,
  'InvalidSplitConfig()': <Trans>InvalidSplitConfig()</Trans>,
  'AlreadyMigrated(PositionId,PositionId)': <Trans>AlreadyMigrated(PositionId,PositionId)</Trans>,
  'ExceedBaseCollateral(uint256,uint256)': <Trans>ExceedBaseCollateral(uint256,uint256)</Trans>,
  'ExceedDebt(uint256,uint256)': <Trans>ExceedDebt(uint256,uint256)</Trans>,
  'ExceedExchangeable()': <Trans>ExceedExchangeable()</Trans>,
  'ExceedMaxBaseProfit()': <Trans>ExceedMaxBaseProfit()</Trans>,
  'ExceedMinOutputAmount()': <Trans>ExceedMinOutputAmount()</Trans>,
  'InsufficientBalance(address,uint256,uint256)': (
    <Trans>InsufficientBalance(address,uint256,uint256)</Trans>
  ),
  'InsufficientCollateral(PositionId,uint256)': (
    <Trans>InsufficientCollateral(PositionId,uint256)</Trans>
  ),
  'InsufficientPoolProfit()': <Trans>InsufficientPoolProfit()</Trans>,
  'InsufficientReturnAmount(uint256,uint256)': (
    <Trans>InsufficientReturnAmount(uint256,uint256)</Trans>
  ),
  'MatchNotSupported()': <Trans>MatchNotSupported()</Trans>,
  'PoolFundingFeeNotPositive(int256,uint256,Direction)': (
    <Trans>PoolFundingFeeNotPositive(int256,uint256,Direction)</Trans>
  ),
  'PoolNotCompoundable(PoolId)': <Trans>PoolNotCompoundable(PoolId)</Trans>,
  'ECDSAInvalidSignature()': <Trans>ECDSAInvalidSignature()</Trans>,
  'ECDSAInvalidSignatureLength(uint256)': <Trans>ECDSAInvalidSignatureLength(uint256)</Trans>,
  'ECDSAInvalidSignatureS(bytes32)': <Trans>ECDSAInvalidSignatureS(bytes32)</Trans>,
  'ExpiredFeeData()': <Trans>ExpiredFeeData()</Trans>,
  'InvalidFeeRate()': <Trans>InvalidFeeRate()</Trans>,
  'NoRebateToClaim()': <Trans>NoRebateToClaim()</Trans>,
  'NotBrokerSigner(address)': <Trans>NotBrokerSigner(address)</Trans>,
  'UnsupportedAssetClass(AssetClass)': <Trans>UnsupportedAssetClass(AssetClass)</Trans>,
  'UnsupportedFeeTier(uint8)': <Trans>UnsupportedFeeTier(uint8)</Trans>,
  'BrokerAlreadyExists()': <Trans>BrokerAlreadyExists()</Trans>,
  'BrokerNotFound()': <Trans>BrokerNotFound()</Trans>,
  'NotBrokerAdmin()': <Trans>NotBrokerAdmin()</Trans>,
  'InvalidFeeTier()': <Trans>InvalidFeeTier()</Trans>,
  'InitializationFunctionReverted(address,bytes)': (
    <Trans>InitializationFunctionReverted(address,bytes)</Trans>
  ),
  'ExcessiveSlippage()': <Trans>ExcessiveSlippage()</Trans>,
  'InvalidADLPosition(OrderId,PositionId)': <Trans>InvalidADLPosition(OrderId,PositionId)</Trans>,
  'InvalidOrder(OrderId)': <Trans>InvalidOrder(OrderId)</Trans>,
  'NoADLNeeded(OrderId)': <Trans>NoADLNeeded(OrderId)</Trans>,
  'NotReachedPrice(OrderId,uint256,uint256,TriggerType)': (
    <Trans>NotReachedPrice(OrderId,uint256,uint256,TriggerType)</Trans>
  ),
  'OnlyKeeper()': <Trans>OnlyKeeper()</Trans>,
  'SafeCastOverflowedIntToUint(int256)': <Trans>SafeCastOverflowedIntToUint(int256)</Trans>,
  'NotMeetEarlyCloseCriteria(PositionId)': <Trans>NotMeetEarlyCloseCriteria(PositionId)</Trans>,
  'AlreadyInitialized()': <Trans>AlreadyInitialized()</Trans>,
  'InvalidRewindPrice()': <Trans>InvalidRewindPrice()</Trans>,
  'PositionRemainsHealthy(PositionId)': <Trans>PositionRemainsHealthy(PositionId)</Trans>,
  'InvalidOrderPair(OrderId,OrderId)': <Trans>InvalidOrderPair(OrderId,OrderId)</Trans>,
  'PoolNotInPreBenchState(PoolId)': <Trans>PoolNotInPreBenchState(PoolId)</Trans>,
  'RiskCloseNotAllowed()': <Trans>RiskCloseNotAllowed()</Trans>,
  'NotAllowedTarget(address)': <Trans>NotAllowedTarget(address)</Trans>,
  'ExceedsMaximumRelayFee()': <Trans>ExceedsMaximumRelayFee()</Trans>,
  'InconsistentParamsLength()': <Trans>InconsistentParamsLength()</Trans>,
  'InsufficientFeeAllowance(address,uint256,uint256)': (
    <Trans>InsufficientFeeAllowance(address,uint256,uint256)</Trans>
  ),
  'InsufficientFeeBalance(address,uint256,uint256)': (
    <Trans>InsufficientFeeBalance(address,uint256,uint256)</Trans>
  ),
  'MismatchedSender(address)': <Trans>MismatchedSender(address)</Trans>,
  'RelayerRegistered(address)': <Trans>RelayerRegistered(address)</Trans>,
  'RemoveRelayerFailed()': <Trans>RemoveRelayerFailed()</Trans>,
  'IncorrectFee(uint256)': <Trans>IncorrectFee(uint256)</Trans>,
  'InvalidPrice()': <Trans>InvalidPrice()</Trans>,
  'VerifyPriceFailed()': <Trans>VerifyPriceFailed()</Trans>,
  'ETHTransferFailed()': <Trans>ETHTransferFailed()</Trans>,
  'PoolOracleFeeCharged()': <Trans>PoolOracleFeeCharged()</Trans>,
  'PoolOracleFeeNotCharged()': <Trans>PoolOracleFeeNotCharged()</Trans>,
  'PoolOracleFeeNotExisted()': <Trans>PoolOracleFeeNotExisted()</Trans>,
  'PoolOracleFeeNotSoldOut()': <Trans>PoolOracleFeeNotSoldOut()</Trans>,
  'ETHTransferFailed(address,uint256)': <Trans>ETHTransferFailed(address,uint256)</Trans>,
  'GasLimitExceeded(address,uint256,uint256)': (
    <Trans>GasLimitExceeded(address,uint256,uint256)</Trans>
  ),
  'GasLimitNotSet(address)': <Trans>GasLimitNotSet(address)</Trans>,
  'InvalidAmount(uint256)': <Trans>InvalidAmount(uint256)</Trans>,
  'BaseFeeNotSoldOut()': <Trans>BaseFeeNotSoldOut()</Trans>,
  'LPNotFullyMinted()': <Trans>LPNotFullyMinted()</Trans>,
  'PositionNotEmpty()': <Trans>PositionNotEmpty()</Trans>,
  'UnexpectedPoolState()': <Trans>UnexpectedPoolState()</Trans>,
  'UnhealthyAfterRiskTierApplied(PositionId)': (
    <Trans>UnhealthyAfterRiskTierApplied(PositionId)</Trans>
  ),
  'NotEmptyAddress()': <Trans>NotEmptyAddress()</Trans>,
  'AccessControlBadConfirmation()': <Trans>AccessControlBadConfirmation()</Trans>,
  'AccessControlUnauthorizedAccount(address,bytes32)': (
    <Trans>AccessControlUnauthorizedAccount(address,bytes32)</Trans>
  ),
  'AlreadyVoted()': <Trans>AlreadyVoted()</Trans>,
  'BondNotReleased()': <Trans>BondNotReleased()</Trans>,
  'BondZeroAmount()': <Trans>BondZeroAmount()</Trans>,
  'CaseAppealNotFinished()': <Trans>CaseAppealNotFinished()</Trans>,
  'CaseDeadlineNotReached()': <Trans>CaseDeadlineNotReached()</Trans>,
  'CaseDeadlineReached()': <Trans>CaseDeadlineReached()</Trans>,
  'CaseNotAccepted()': <Trans>CaseNotAccepted()</Trans>,
  'CaseNotExist(CaseId)': <Trans>CaseNotExist(CaseId)</Trans>,
  'CaseRespondentAppealed(CaseId,address)': <Trans>CaseRespondentAppealed(CaseId,address)</Trans>,
  'ChainIdMismatch()': <Trans>ChainIdMismatch()</Trans>,
  'DisputeNotAllowed()': <Trans>DisputeNotAllowed()</Trans>,
  'InvalidAccountNonce(address,uint256)': <Trans>InvalidAccountNonce(address,uint256)</Trans>,
  'InvalidContractAddress()': <Trans>InvalidContractAddress()</Trans>,
  'InvalidFunctionSignature()': <Trans>InvalidFunctionSignature()</Trans>,
  'InvalidPayloadLength(uint256,uint256)': <Trans>InvalidPayloadLength(uint256,uint256)</Trans>,
  'InvalidPoolToken()': <Trans>InvalidPoolToken()</Trans>,
  'InvalidProfitAmount()': <Trans>InvalidProfitAmount()</Trans>,
  'InvalidResponseVersion()': <Trans>InvalidResponseVersion()</Trans>,
  'InvalidSourceChain()': <Trans>InvalidSourceChain()</Trans>,
  'NoChainResponse()': <Trans>NoChainResponse()</Trans>,
  'NotCaseRespondent(CaseId,address)': <Trans>NotCaseRespondent(CaseId,address)</Trans>,
  'NumberOfResponsesMismatch()': <Trans>NumberOfResponsesMismatch()</Trans>,
  'RequestTypeMismatch()': <Trans>RequestTypeMismatch()</Trans>,
  'RiskCloseNotCompleted()': <Trans>RiskCloseNotCompleted()</Trans>,
  'SignatureExpired()': <Trans>SignatureExpired()</Trans>,
  'UnexpectedCaseState()': <Trans>UnexpectedCaseState()</Trans>,
  'UnexpectedCaseType()': <Trans>UnexpectedCaseType()</Trans>,
  'UnexpectedNumberOfResults()': <Trans>UnexpectedNumberOfResults()</Trans>,
  'UnsupportedQueryType(uint8)': <Trans>UnsupportedQueryType(uint8)</Trans>,
  'UntrustfulVoting()': <Trans>UntrustfulVoting()</Trans>,
  'VerificationFailed()': <Trans>VerificationFailed()</Trans>,
  'VersionMismatch()': <Trans>VersionMismatch()</Trans>,
  'WrongQueryType(uint8,uint8)': <Trans>WrongQueryType(uint8,uint8)</Trans>,
  'ZeroQueries()': <Trans>ZeroQueries()</Trans>,
  'AlreadyClaimed(CaseId,address)': <Trans>AlreadyClaimed(CaseId,address)</Trans>,
  'InvalidAmount(CaseId,address)': <Trans>InvalidAmount(CaseId,address)</Trans>,
  'MerkleTreeVerificationFailed(CaseId,address)': (
    <Trans>MerkleTreeVerificationFailed(CaseId,address)</Trans>
  ),
  'ReimbursementValidity(CaseId)': <Trans>ReimbursementValidity(CaseId)</Trans>,
  'TreeAlreadySet()': <Trans>TreeAlreadySet()</Trans>,
  'InDisputeMode()': <Trans>InDisputeMode()</Trans>,
  'InsufficientFreeCollateral(PositionId,uint256)': (
    <Trans>InsufficientFreeCollateral(PositionId,uint256)</Trans>
  ),
  'InsufficientLockedCollateral(PositionId,uint256)': (
    <Trans>InsufficientLockedCollateral(PositionId,uint256)</Trans>
  ),
  'SafeCastOverflowedUintDowncast(uint8,uint256)': (
    <Trans>SafeCastOverflowedUintDowncast(uint8,uint256)</Trans>
  ),
  'UserProfitFrozen()': <Trans>UserProfitFrozen()</Trans>,
  'ExceedMinOutput(uint256,uint256)': <Trans>ExceedMinOutput(uint256,uint256)</Trans>,
  'NotAllowedCaller(address)': <Trans>NotAllowedCaller(address)</Trans>,
  'ERC20InsufficientAllowance(address,uint256,uint256)': (
    <Trans>ERC20InsufficientAllowance(address,uint256,uint256)</Trans>
  ),
  'ERC20InsufficientBalance(address,uint256,uint256)': (
    <Trans>ERC20InsufficientBalance(address,uint256,uint256)</Trans>
  ),
  'ERC20InvalidApprover(address)': <Trans>ERC20InvalidApprover(address)</Trans>,
  'ERC20InvalidReceiver(address)': <Trans>ERC20InvalidReceiver(address)</Trans>,
  'ERC20InvalidSender(address)': <Trans>ERC20InvalidSender(address)</Trans>,
  'ERC20InvalidSpender(address)': <Trans>ERC20InvalidSpender(address)</Trans>,
  'ERC2612ExpiredSignature(uint256)': <Trans>ERC2612ExpiredSignature(uint256)</Trans>,
  'ERC2612InvalidSigner(address,address)': <Trans>ERC2612InvalidSigner(address,address)</Trans>,
  'InvalidShortString()': <Trans>InvalidShortString()</Trans>,
  'StringTooLong(string)': <Trans>StringTooLong(string)</Trans>,
  'ExceedMaxPriceDeviation()': <Trans>ExceedMaxPriceDeviation()</Trans>,
  'ExchangeRateAlreadyApplied()': <Trans>ExchangeRateAlreadyApplied()</Trans>,
  'ExchangeRateAlreadyDisabled()': <Trans>ExchangeRateAlreadyDisabled()</Trans>,
  'InvalidDeviationRatio()': <Trans>InvalidDeviationRatio()</Trans>,
  'InvalidUpdateFee()': <Trans>InvalidUpdateFee()</Trans>,
  'PriceDeviationBelowMinimum()': <Trans>PriceDeviationBelowMinimum()</Trans>,
  'PriceDeviationThresholdReached()': <Trans>PriceDeviationThresholdReached()</Trans>,
  'StalePrice()': <Trans>StalePrice()</Trans>,
  'ExceedMaxExchangeableAmount()': <Trans>ExceedMaxExchangeableAmount()</Trans>,
  'NotSupportVersion()': <Trans>NotSupportVersion()</Trans>,
  'ArrayEmpty()': <Trans>ArrayEmpty()</Trans>,
  'ExceedMaxProfit()': <Trans>ExceedMaxProfit()</Trans>,
  'PoolNotExist(PoolId)': <Trans>PoolNotExist(PoolId)</Trans>,
  'InvalidQuoteTokenAddress()': <Trans>InvalidQuoteTokenAddress()</Trans>,
  'InvalidRatioParams()': <Trans>InvalidRatioParams()</Trans>,
  'MarketAlreadyExisted()': <Trans>MarketAlreadyExisted()</Trans>,
  'MarketNotExisted()': <Trans>MarketNotExisted()</Trans>,
  'InvalidBaseToken()': <Trans>InvalidBaseToken()</Trans>,
  'MarketNotExist(MarketId)': <Trans>MarketNotExist(MarketId)</Trans>,
  'PoolExists(PoolId)': <Trans>PoolExists(PoolId)</Trans>,
  'ExceedBaseReserved(uint256,uint256)': <Trans>ExceedBaseReserved(uint256,uint256)</Trans>,
  'ExceedQuoteReserved(uint256,uint256)': <Trans>ExceedQuoteReserved(uint256,uint256)</Trans>,
  'ExceedReservable(uint256,uint256,uint256)': (
    <Trans>ExceedReservable(uint256,uint256,uint256)</Trans>
  ),
  'InsufficientLiquidity(uint256,uint256,uint256)': (
    <Trans>InsufficientLiquidity(uint256,uint256,uint256)</Trans>
  ),
  'InvalidDistributionAmount()': <Trans>InvalidDistributionAmount()</Trans>,
  'ReservableNotEnough(uint256,uint256)': <Trans>ReservableNotEnough(uint256,uint256)</Trans>,
  'ERC2771ForwarderExpiredRequest(uint48)': <Trans>ERC2771ForwarderExpiredRequest(uint48)</Trans>,
  'ERC2771ForwarderInvalidSigner(address,address)': (
    <Trans>ERC2771ForwarderInvalidSigner(address,address)</Trans>
  ),
  'ERC2771ForwarderMismatchedValue(uint256,uint256)': (
    <Trans>ERC2771ForwarderMismatchedValue(uint256,uint256)</Trans>
  ),
  'ERC2771UntrustfulTarget(address,address)': (
    <Trans>ERC2771UntrustfulTarget(address,address)</Trans>
  ),
  'InsufficientBalance(uint256,uint256)': <Trans>InsufficientBalance(uint256,uint256)</Trans>,
  'DifferentMarket(PoolId,PoolId)': <Trans>DifferentMarket(PoolId,PoolId)</Trans>,
  'InsufficientQuoteIn(uint256,uint256,uint256)': (
    <Trans>InsufficientQuoteIn(uint256,uint256,uint256)</Trans>
  ),
  'InvalidLiquidityAmount()': <Trans>InvalidLiquidityAmount()</Trans>,
  'InvalidTpsl(uint256)': <Trans>InvalidTpsl(uint256)</Trans>,
  'SamePoolMigration(PoolId)': <Trans>SamePoolMigration(PoolId)</Trans>,
  'SlippageExceeded(uint256,uint256)': <Trans>SlippageExceeded(uint256,uint256)</Trans>,
  'DesignatedTokenMismatch(address,address)': (
    <Trans>DesignatedTokenMismatch(address,address)</Trans>
  ),
  'NotForwardAllowedTarget(address)': <Trans>NotForwardAllowedTarget(address)</Trans>,
  'ExecutionFeeNotCollected()': <Trans>ExecutionFeeNotCollected()</Trans>,
  'InsufficientSize()': <Trans>InsufficientSize()</Trans>,
  'InvalidQuoteToken()': <Trans>InvalidQuoteToken()</Trans>,
  'MarketNotInitialized()': <Trans>MarketNotInitialized()</Trans>,
  'NotInDisputeMode()': <Trans>NotInDisputeMode()</Trans>,
  'OrderExpired(OrderId)': <Trans>OrderExpired(OrderId)</Trans>,
  'PoolNotInitialized()': <Trans>PoolNotInitialized()</Trans>,
  'BoostFeeClaimFailed()': <Trans>Refund already claimed.</Trans>,
}
