import { TradeButton } from '@/components/Button/TradeButton'
import { Box } from '@mui/material'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { isSupportedChainFn } from '@/config/chain'
import { useChainInfo } from '@/hooks/chain/useChainInfo'
import { usePoolDetail } from '@/hooks/lp/usePoolDetail'
import { PoolType } from '@/request/type'
import { useWalletConnection } from '@/hooks/wallet/useWalletConnection'
import { useWalletActions } from '@/hooks/useWalletActions'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  base as Base,
  quote as Quote,
  COMMON_LP_AMOUNT_DECIMALS,
  formatUnits,
  getBalanceOf,
  parseUnits,
  MarketPoolState,
} from '@myx-trade/sdk'
import { formatNumber } from '@/utils/number'
import { isCookState } from '@/utils/cook'
import { isSafeNumber } from '@/utils'
import { BoostType, PoolBaseState, PoolSecurityState, type BaseLpDetail } from '@/request/lp/type'
import { toast } from '@/components/UI/Toast'
import { showErrorToast } from '@/config/error'
import { t } from '@lingui/core/macro'
import { formatNumberPercent } from '@/utils/formatNumber'
import { sleep } from '@/utils'
import { ConfirmEnableTradingDialog } from '@/components/Dialog/ConfirmEnableTradingDialog'
import { MarketLaunchStatusDialog } from '@/components/Dialog/MarketLaunchStatusDialog'
import { MarketActivationFailedDialog } from '@/components/Dialog/MarketActivationFailedDialog'
import { useOnBoostPool } from '@/hooks/lp/useOnBoostPool'
import { useOnUnBoostPool } from '@/hooks/lp/useOnUnBoostPool'
import { useClaimRefund } from '@/hooks/lp/useClaimRefund'
import { SellButton } from '@/components/Button/SellButton'
import { usePoolSymbol } from '@/hooks/pool/usePoolSymbol'
import { useCookOrderStore } from '@/components/CookDetail/Order/store'
import { CookDetailNavBar } from './components/CookDetailNavBar'
import { DetailHeaderSection } from './components/DetailHeaderSection'
import { TradeContentSection } from './components/TradeContentSection'
import { ProgressSection } from './components/ProgressSection'
import { WarningTipsSection } from './components/WarningTipsSection'
import { CookTokenSelectDialog } from './components/CookTokenSelectDialog'
import { CookQuoteUnitSelectDialog } from './components/CookQuoteUnitSelectDialog'
import { CookDetailOrderTips } from './components/CookDetailOrderTips'
import { CookRedeemGenesisBurnTip } from './components/CookRedeemGenesisBurnTip'
import type { CookTokenItem, FindCookPoolFn } from './hook/useCookTokenSelect'
import { getQuoteTokenInfo } from '@/config/token'

type ActionType = 'deposit' | 'redeem' | 'activate'
type VaultType = 'base' | 'stable'

const actionTabs: Array<{ key: ActionType; label: string; buttonLabel: string }> = [
  { key: 'deposit', label: 'deposit', buttonLabel: 'confirm-deposit' },
  { key: 'redeem', label: 'redeem', buttonLabel: 'confirm-redeem' },
  { key: 'activate', label: 'activate', buttonLabel: 'confirm-activate' },
]

const vaultTabs: Array<{ key: VaultType; label: string }> = [
  { key: 'base', label: 'base-vault' },
  { key: 'stable', label: 'stable-vault' },
]

const ratioList: Array<{ label: string; value: number | 'max' }> = [
  { label: '25%', value: 0.25 },
  { label: '50%', value: 0.5 },
  { label: '75%', value: 0.75 },
  { label: 'Max', value: 'max' },
]

const calcProgressPercent = (current: number, total: number) => {
  if (!total) return 0
  return Math.min((current / total) * 100, 100)
}

const RATIO_AMOUNT_DECIMALS = 2

/** 比例/Max 填入金额：截断到指定位小数（不四舍五入、无千分位） */
const toRatioAmountString = (value: number | string, decimals = RATIO_AMOUNT_DECIMALS): string => {
  const str = String(value)
  if (!str || str === 'NaN') return '0'
  const [intPart, decPart] = str.split('.')
  if (!decPart || decimals <= 0) return intPart
  const trimmedDec = decPart.slice(0, decimals)
  return trimmedDec ? `${intPart}.${trimmedDec}` : intPart
}

export const CookDetail = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { chainId, poolId } = useParams()
  const { address: account } = useWalletConnection()
  const onAction = useWalletActions()
  const [activeAction, setActiveAction] = useState<ActionType>('deposit')
  const [activeVault, setActiveVault] = useState<VaultType>('base')
  const [amount, setAmount] = useState('')
  const [selectedRatio, setSelectedRatio] = useState<string>('25%')
  const [submitLoading, setSubmitLoading] = useState(false)
  /** 快速启动链上已付、boostInfo 尚未同步为 Requested 时的过渡态 */
  const [isOnBoostSuccess, setIsOnBoostSuccess] = useState(false)
  const [tokenSelectDialogOpen, setTokenSelectDialogOpen] = useState(false)
  const [quoteSelectDialogOpen, setQuoteSelectDialogOpen] = useState(false)
  const [draftBaseToken, setDraftBaseToken] = useState<CookTokenItem | null>(null)
  const [draftQuoteTokens, setDraftQuoteTokens] = useState<CookTokenItem[]>([])
  const findCookPoolRef = useRef<FindCookPoolFn | null>(null)
  const prevRoutePoolKeyRef = useRef<string | null>(null)
  const { slippage } = useCookOrderStore()

  const chainInfo = useChainInfo(parseInt(chainId || '0'))
  const quotePoolDetail = usePoolDetail(PoolType.quote)
  const basePoolDetail = usePoolDetail(PoolType.base)

  const isDeposit = activeAction === 'deposit'
  const isRedeem = activeAction === 'redeem'
  const isActivate = activeAction === 'activate'
  /** Stable 金库 = 计价资产（多为 USDC）→ quote 池；Base 金库 = 标的 → base 池 */
  const isQuoteSideVault = activeVault === 'stable'
  const currentPool = isQuoteSideVault ? quotePoolDetail.pool : basePoolDetail.pool
  const currentLpDetail = isQuoteSideVault ? quotePoolDetail.lpDetail : basePoolDetail.lpDetail
  const currentRiskConfig = isQuoteSideVault
    ? quotePoolDetail.riskLevelConfig
    : basePoolDetail.riskLevelConfig
  const boostedPrimeTvl = Number(
    (isQuoteSideVault ? quotePoolDetail.boostedPrimeTvl : basePoolDetail.boostedPrimeTvl) || 0,
  )
  const totalTvl = Number(currentLpDetail?.totalTvl || currentLpDetail?.tvl || 0)
  const currentMarkets = isQuoteSideVault ? quotePoolDetail.markets : basePoolDetail.markets
  const currentMarket = currentMarkets?.find(
    (market) => market.marketId === currentLpDetail?.marketId,
  )
  const marketPrimeThreshold = Number(currentMarket?.poolPrimeThreshold || 0)
  const baseBoostInfo = basePoolDetail.boostInfo
  const isBoostActivationRequested = baseBoostInfo?.type === BoostType.Requested
  /** 与 Trench/OrderTips 一致：仅 Cook、Boosted 阶段存在「快速启动」；Primed 等（准备上线文案）不展示小火箭 */
  const baseLpState = basePoolDetail.lpDetail?.state

  const poolInfo = usePoolSymbol({
    chainId: Number(chainId || 0),
    poolId,
  })

  const vaultTabList = vaultTabs

  /** 池子切换后 currentPool 才到位；不把池标识放进 queryKey 会导致仍用旧闭包/空池跑一次且不再刷新 */
  const currentPoolBalanceKey = useMemo(() => {
    if (!currentPool) return ''
    return [
      currentPool.quoteToken,
      currentPool.baseToken,
      currentPool.quotePoolToken,
      currentPool.basePoolToken,
      String(currentPool.quoteDecimals ?? ''),
      String(currentPool.baseDecimals ?? ''),
    ].join('|')
  }, [currentPool])

  useEffect(() => {
    const routeKey = `${chainId}:${poolId}`
    if (prevRoutePoolKeyRef.current === null) {
      prevRoutePoolKeyRef.current = routeKey
      return
    }
    if (prevRoutePoolKeyRef.current === routeKey) return
    prevRoutePoolKeyRef.current = routeKey
    setAmount('')
    setSelectedRatio('25%')
  }, [chainId, poolId])

  useEffect(() => {
    if (isBoostActivationRequested) {
      setIsOnBoostSuccess(false)
    }
  }, [isBoostActivationRequested])

  useEffect(() => {
    setIsOnBoostSuccess(false)
  }, [chainId, poolId])

  const { data: balance = '' as string, refetch: refetchBalance } = useQuery({
    queryKey: [
      { key: 'cook_detail_balance' },
      activeAction,
      activeVault,
      chainId,
      poolId,
      account,
      currentPoolBalanceKey,
      isQuoteSideVault,
    ],
    enabled: !!chainId && !!poolId && !!account && !!currentPool && !!currentPoolBalanceKey,
    refetchInterval: 5000,
    queryFn: async () => {
      if (!chainId || !poolId || !account || !currentPool) return ''

      if (activeAction === 'deposit' || activeAction === 'activate') {
        const tokenAddress =
          isQuoteSideVault || activeAction === 'activate'
            ? currentPool.quoteToken
            : currentPool.baseToken
        const tokenDecimals =
          isQuoteSideVault || activeAction === 'activate'
            ? currentPool.quoteDecimals
            : currentPool.baseDecimals
        const rawBalance = await getBalanceOf(+chainId, account, tokenAddress)
        return formatUnits(rawBalance, tokenDecimals)
      }

      const poolTokenAddress = isQuoteSideVault
        ? currentPool.quotePoolToken
        : currentPool.basePoolToken
      const rawBalance = await getBalanceOf(+chainId, account, poolTokenAddress)
      return formatUnits(rawBalance, COMMON_LP_AMOUNT_DECIMALS)
    },
  })

  const { data: withdrawableLpAmount } = useQuery({
    queryKey: [
      { key: 'cook_detail_withdrawable_lp' },
      activeAction,
      activeVault,
      amount,
      chainId,
      poolId,
      currentPoolBalanceKey,
    ],
    enabled:
      activeAction === 'redeem' &&
      !!amount &&
      Number(amount) > 0 &&
      !!chainId &&
      !!poolId &&
      !!account &&
      !!currentPool &&
      !!currentPoolBalanceKey,
    queryFn: async () => {
      if (!chainId || !poolId) return
      if (isQuoteSideVault) {
        return Quote.withdrawableLpAmount({
          chainId: +chainId,
          poolId,
        })
      }
      return Base.withdrawableLpAmount({
        chainId: +chainId,
        poolId,
      })
    },
  })

  const displayBalance = isSafeNumber(balance) ? Number(balance) : 0

  /** 与 CookDetailOrderTips 一致：快速启动费已付后，进度以 base 池 TVL → boostedPrimeTvl 为准 */
  const baseBoostedPrimeTvl = Number(basePoolDetail.boostedPrimeTvl || 0)
  const basePoolTotalTvl = Number(
    basePoolDetail.poolInfo?.tvl?.totalTvl ||
      basePoolDetail.lpDetail?.totalTvl ||
      basePoolDetail.lpDetail?.tvl ||
      0,
  )
  const progressCurrent = isBoostActivationRequested ? basePoolTotalTvl : totalTvl
  const progressTotal = isBoostActivationRequested
    ? baseBoostedPrimeTvl
    : marketPrimeThreshold || boostedPrimeTvl
  const progressPercent = calcProgressPercent(progressCurrent, progressTotal)
  const progressDisplayCurrent = Math.min(progressCurrent, progressTotal || progressCurrent)

  const getActionLabel = (action: ActionType) => {
    if (action === 'deposit') return t`存入`
    if (action === 'redeem') return t`赎回`
    return t`激活`
  }

  const getActionButtonLabel = (action: ActionType) => {
    if (action === 'deposit') return t`确认存入`
    if (action === 'redeem') return t`确认赎回`
    return t`确认激活`
  }

  const getVaultLabel = (vault: VaultType) => {
    if (vault === 'base') return t`Base Valut`
    return t`Stable Vault`
  }

  const getRatioLabel = (ratio: string) => {
    if (ratio === 'Max') return t`Max`
    return ratio
  }

  /** 快速启动费已付（含链上已付待同步、boostInfo 已为 Requested） */
  const isQuickActivateFeePaid = isOnBoostSuccess || isBoostActivationRequested

  const confirmButtonText = useMemo(() => {
    if (isActivate) {
      if (isQuickActivateFeePaid) {
        return t`等待市场开启`
      }
      if (baseLpState === MarketPoolState.Primed) {
        return t`准备上线中`
      }
    }
    return getActionButtonLabel(activeAction)
  }, [activeAction, isActivate, isQuickActivateFeePaid, baseLpState])

  const isAmountInvalid = useMemo(() => {
    if (!amount || !isSafeNumber(amount)) return true
    if (!isSafeNumber(balance)) return true
    if (basePoolDetail.lpDetail?.state === MarketPoolState.Bench) return true
    if (isRedeem) {
      try {
        return (
          parseUnits(amount, COMMON_LP_AMOUNT_DECIMALS) >
          parseUnits(balance, COMMON_LP_AMOUNT_DECIMALS)
        )
      } catch {
        return true
      }
    }

    const numericAmount = Number(amount)
    return !numericAmount || numericAmount > Number(balance)
  }, [amount, balance, isRedeem, basePoolDetail.lpDetail?.state])

  /**
   * 赎回提交金额：Max 时始终用链上 balance（输入框默认 2 位会截断 amount 并触发 onChange）
   */
  const redeemSubmitAmount = useMemo(() => {
    if (!isRedeem) return amount
    if (selectedRatio === 'Max' && isSafeNumber(balance)) return balance
    return amount
  }, [isRedeem, selectedRatio, balance, amount])

  const displayTokenSymbol = useMemo(() => {
    if (isActivate) return currentPool?.quoteSymbol || '--'
    if (isRedeem) {
      return isQuoteSideVault ? currentPool?.quoteSymbol || '--' : currentPool?.baseSymbol || '--'
    }
    return isQuoteSideVault ? currentPool?.quoteSymbol || '--' : currentPool?.baseSymbol || '--'
  }, [isActivate, isRedeem, isQuoteSideVault, currentPool?.baseSymbol, currentPool?.quoteSymbol])

  const displayTokenName = useMemo(() => {
    if (isActivate) return chainInfo?.label || '--'
    if (isRedeem) {
      return isQuoteSideVault ? currentPool?.quoteSymbol || '--' : currentPool?.baseSymbol || '--'
    }
    return isQuoteSideVault ? currentPool?.quoteSymbol || '--' : currentPool?.baseSymbol || '--'
  }, [
    isActivate,
    isRedeem,
    isQuoteSideVault,
    currentPool?.baseSymbol,
    currentPool?.quoteSymbol,
    chainInfo?.label,
  ])
  const displayPairSymbol =
    currentPool?.baseSymbol && currentPool.quoteSymbol
      ? `${currentPool.baseSymbol}${currentPool.quoteSymbol}`
      : '--'
  const displayAddress = isQuoteSideVault
    ? currentPool?.quoteToken || ''
    : currentPool?.baseToken || ''
  const displayBaseTokenName = currentLpDetail?.symbolName || '--'

  const displayTradeTokenSymbol = isActivate
    ? getQuoteTokenInfo(currentPool?.chainId, currentPool?.quoteToken || '')?.name || '--'
    : isQuoteSideVault
      ? currentPool?.quoteSymbol || '--'
      : currentLpDetail?.symbolName || '--'

  const genesisYieldText = formatNumberPercent(
    currentRiskConfig?.levelConfig?.genesisFeeRate,
    0,
    false,
  )
  /** 快速启动费用：市场配置 boostFeeUsd（与确认弹窗 Pay 金额一致），固定读 base 池市场 */
  const baseMarket = (basePoolDetail.markets || []).find(
    (market) => market.marketId === basePoolDetail.lpDetail?.marketId,
  )
  const boostFeeUsd = Number(baseMarket?.boostFeeUsd || 0)
  const boostRefundFeeUsd = Number(baseMarket?.boostRefundFeeUsd || 0)
  const activateAmount = boostFeeUsd
  const deductedAmount = String(Math.max(boostFeeUsd - boostRefundFeeUsd, 0))
  const canOpenQuickActivate =
    isCookState(baseLpState as number) &&
    !isBoostActivationRequested &&
    !isOnBoostSuccess &&
    progressTotal > 0 &&
    progressCurrent < progressTotal &&
    currentRiskConfig?.securityState !== PoolSecurityState.UNKNOWN &&
    currentRiskConfig?.securityState !== PoolSecurityState.NOT_SECURITY
  /** 不允许快速启动时整颗隐藏，与 Trench 侧仅在有资格时出现入口一致 */
  const canShowQuickActivateEntry = isDeposit && canOpenQuickActivate
  const isSubmitDisabled = isActivate
    ? !canOpenQuickActivate || isQuickActivateFeePaid
    : isAmountInvalid

  const refreshAllData = async () => {
    await Promise.all([
      refetchBalance(),
      quotePoolDetail.refetch(),
      basePoolDetail.refetch(),
      quotePoolDetail.poolInfoRefetch(),
      basePoolDetail.poolInfoRefetch(),
    ])
  }

  const { boostConfirmBoostOpen, setBoostConfirmBoostOpen, onBoostPool } = useOnBoostPool({
    onSuccess: async () => {
      setIsOnBoostSuccess(true)
      await refreshAllData()
      await sleep(1200)
      await refreshAllData()
    },
  })
  const { unBoostConfirmBoostOpen, setUnBoostConfirmBoostOpen, onUnBoostPool } = useOnUnBoostPool()
  const { claimRefundOpen, setClaimRefundOpen, onClaimRefund } = useClaimRefund()

  const onOpenQuickActivate = () => {
    if (!canOpenQuickActivate) return
    if (!baseBoostInfo || baseBoostInfo.type !== BoostType.Requested) {
      setBoostConfirmBoostOpen(true)
      return
    }
    if (basePoolDetail.riskLevelConfig?.baseState === PoolBaseState.PRIME_FAIL) {
      setClaimRefundOpen(true)
      return
    }
    setUnBoostConfirmBoostOpen(true)
  }

  const displayButtonStyle = isRedeem
    ? {
        borderColor: '#F66276',
        background: 'linear-gradient(305deg, #C23749 3.47%, #BA4C47 99.82%)',
      }
    : {
        borderColor: '#80FF95',
        background: 'linear-gradient(128deg, #3D996B 0%, #1D9D75 18.58%, #00996F 100%)',
      }

  const onClickRatio = (ratioLabel: string, ratioValue: number | 'max') => {
    setSelectedRatio(ratioLabel)
    if (ratioValue === 'max') {
      setAmount(toRatioAmountString(displayBalance))
      return
    }
    setAmount(toRatioAmountString(displayBalance * ratioValue))
  }
  const onChangeAction = (action: ActionType) => {
    setActiveAction(action)
    setSelectedRatio('25%')
    setAmount('')
  }

  const displayTradeTokenIcon = useMemo(() => {
    if (isActivate || isQuoteSideVault)
      return getQuoteTokenInfo(currentPool?.chainId, currentPool?.quoteToken || '')?.logoUrl || ''
    return poolInfo?.baseTokenIcon || ''
  }, [
    isQuoteSideVault,
    isActivate,
    currentPool?.chainId,
    currentPool?.quoteToken,
    poolInfo?.baseTokenIcon,
  ])

  const onConfirm = async () => {
    try {
      if (!chainId || !poolId) return
      if (activeAction !== 'activate' && !amount) return
      if (activeAction === 'activate') {
        onOpenQuickActivate()
        return
      }

      setSubmitLoading(true)
      const checked = await onAction()
      if (!checked) return

      if (activeAction === 'deposit') {
        if (currentRiskConfig?.securityState === PoolSecurityState.NOT_SECURITY) return

        if (isQuoteSideVault) {
          await Quote.deposit({
            chainId: +chainId,
            poolId,
            amount: Number(amount),
            slippage: Number(slippage),
          })
        } else {
          await Base.deposit({
            chainId: +chainId,
            poolId,
            amount: Number(amount),
            slippage: Number(slippage),
          })
        }

        toast.success({ title: t`Successfully deposit` })
      }

      if (activeAction === 'redeem') {
        if (
          withdrawableLpAmount !== undefined &&
          parseUnits(redeemSubmitAmount, COMMON_LP_AMOUNT_DECIMALS) > withdrawableLpAmount
        ) {
          toast.error({
            title: t`Some funds are locked in active trades. Max available to sell: [${formatNumber(formatUnits(withdrawableLpAmount, COMMON_LP_AMOUNT_DECIMALS), { showUnit: false })}] LP.`,
          })
          return
        }

        if (isQuoteSideVault) {
          await Quote.withdraw({
            chainId: +chainId,
            poolId,
            amount: redeemSubmitAmount,
            slippage: Number(slippage),
          })
        } else {
          await Base.withdraw({
            chainId: +chainId,
            poolId,
            amount: Number(redeemSubmitAmount),
            slippage: Number(slippage),
          })
        }

        toast.success({ title: t`Successfully redeem` })
      }

      setAmount('')
      setSelectedRatio('25%')

      // 提交后先立刻刷新一轮，尽快回填本地 UI
      await refreshAllData()

      // 链上状态异步落库有延迟，再补一轮刷新提升稳定性
      await sleep(2000)
      await refreshAllData()
    } catch (error) {
      showErrorToast(error)
    } finally {
      setSubmitLoading(false)
    }
  }

  if (!chainId || !poolId || !isSupportedChainFn(parseInt(chainId))) {
    return <Navigate to="/cook" replace />
  }

  return (
    <Box className="bg-deep fixed inset-0 z-30 flex h-[100vh] min-h-[100vh] w-full flex-col overflow-y-auto pb-[50px]">
      <Box className="bg-deep sticky top-0 z-[1] shrink-0">
        <CookDetailNavBar
          displayPairSymbol={displayPairSymbol}
          displayBaseTokenName={displayBaseTokenName}
          displayAddress={displayAddress}
          chainLabel={chainInfo?.label}
          chainLogo={chainInfo?.logoUrl}
          baseTokenIcon={poolInfo?.baseTokenIcon}
          onBack={() => navigate('/cook', { replace: true })}
          onOpenTokenSelectDialog={() => setTokenSelectDialogOpen(true)}
        />
        <DetailHeaderSection
          actionTabs={actionTabs}
          activeAction={activeAction}
          onChangeAction={onChangeAction}
          getActionLabel={getActionLabel}
          isShowVaultTabs={!isActivate}
          vaultTabList={vaultTabList}
          activeVault={activeVault}
          onChangeVault={setActiveVault}
          getVaultLabel={getVaultLabel}
          showActionTabsOnly
        />
      </Box>

      <Box className="flex flex-col gap-[20px] px-[16px] pt-[16px]">
        <DetailHeaderSection
          actionTabs={actionTabs}
          activeAction={activeAction}
          onChangeAction={onChangeAction}
          getActionLabel={getActionLabel}
          isShowVaultTabs={!isActivate}
          vaultTabList={vaultTabList}
          activeVault={activeVault}
          onChangeVault={setActiveVault}
          getVaultLabel={getVaultLabel}
          showVaultTabsOnly
        />

        <TradeContentSection
          isActivate={isActivate}
          isDeposit={isDeposit}
          activeAction={activeAction}
          activeActionLabel={getActionLabel(activeAction)}
          displayBalance={displayBalance}
          displayTokenSymbol={displayTokenSymbol}
          displayTokenName={displayTokenName}
          chainLabel={chainInfo?.label}
          chainLogo={chainInfo?.logoUrl}
          baseTokenIcon={displayTradeTokenIcon}
          amount={amount}
          setAmount={setAmount}
          ratioList={ratioList}
          selectedRatio={selectedRatio}
          onClickRatio={onClickRatio}
          getRatioLabel={getRatioLabel}
          activateAmount={activateAmount}
          genesisYieldText={genesisYieldText}
          showRetainGenesisOption={isRedeem && !isQuoteSideVault}
          displayTradeTokenSymbol={displayTradeTokenSymbol}
        />

        <CookRedeemGenesisBurnTip
          enabled={isRedeem && !isQuoteSideVault && !!chainId && !!poolId}
          chainId={Number(chainId)}
          poolId={poolId as string}
          pool={basePoolDetail.pool}
          genesisFeeRateDisplay={genesisYieldText}
          lpSymbol={basePoolDetail.lpDetail?.mBaseQuoteSymbol}
          amount={amount}
        />

        <ProgressSection
          show={!isRedeem}
          progressPercent={progressPercent}
          progressDisplayCurrent={formatNumber(progressDisplayCurrent, { showUnit: false })}
          progressTotalDisplay={formatNumber(progressTotal, { showUnit: false })}
          canShowQuickActivateEntry={canShowQuickActivateEntry}
          onOpenQuickActivate={onOpenQuickActivate}
        />

        <WarningTipsSection
          securityState={currentRiskConfig?.securityState}
          isDeposit={isDeposit}
          isBoostActivationRequested={isBoostActivationRequested}
          isOnBoostSuccess={isOnBoostSuccess}
          progressTotal={progressTotal}
          progressCurrent={progressCurrent}
          progressRemainingDisplay={formatNumber(Math.max(progressTotal - progressCurrent, 0), {
            showUnit: false,
          })}
          boostFeeDisplay={formatNumber(boostFeeUsd, { showUnit: false })}
          boostFeeUsd={boostFeeUsd}
          baseLpDetail={basePoolDetail.lpDetail as BaseLpDetail}
          onOpenQuickActivateDialog={() => {
            if (!canOpenQuickActivate) return
            setBoostConfirmBoostOpen(true)
          }}
        />

        <CookDetailOrderTips
          securityState={currentRiskConfig?.securityState}
          baseLpDetail={basePoolDetail.lpDetail as BaseLpDetail}
          pool={basePoolDetail.pool}
          poolInfoTvl={basePoolDetail.poolInfo?.tvl}
          markets={basePoolDetail.markets}
          riskLevelConfig={basePoolDetail.riskLevelConfig}
          boostedPrimeTvl={basePoolDetail.boostedPrimeTvl}
          boostInfo={basePoolDetail.boostInfo}
          genesisFeeRate={String(basePoolDetail.genesisFeeRate ?? '')}
          refetchLpDetail={() => basePoolDetail.refetch()}
          onOpenViewLaunchStatus={() => {
            setUnBoostConfirmBoostOpen(true)
          }}
          onOpenClaimRefund={() => {
            setClaimRefundOpen(true)
          }}
        />

        {!isRedeem ? (
          <TradeButton
            variant="contained"
            disabled={isSubmitDisabled}
            loading={submitLoading}
            className="!h-[44px] !w-full !rounded-[44px] !border !text-[14px] !font-[500]"
            sx={{
              borderColor: displayButtonStyle.borderColor,
              background: displayButtonStyle.background,
            }}
            onClick={onConfirm}
          >
            {confirmButtonText}
          </TradeButton>
        ) : (
          <SellButton
            variant="contained"
            disabled={isSubmitDisabled}
            loading={submitLoading}
            className="!h-[44px] !w-full !rounded-[44px] !border !text-[14px] !font-[500]"
            sx={{
              borderColor: displayButtonStyle.borderColor,
              background: displayButtonStyle.background,
            }}
            onClick={onConfirm}
          >
            {confirmButtonText}
          </SellButton>
        )}
      </Box>

      {/* <CookOrderRecordsSection poolId={poolId as string} chainId={Number(chainId)} /> */}

      <ConfirmEnableTradingDialog
        open={boostConfirmBoostOpen}
        tokenSymbol={currentPool?.quoteSymbol}
        feeAmount={baseMarket?.boostFeeUsd}
        refundAmount={baseMarket?.boostRefundFeeUsd}
        deductedAmount={deductedAmount}
        tvlThreshold={String(progressTotal)}
        onClose={() => setBoostConfirmBoostOpen(false)}
        onNotNow={() => setBoostConfirmBoostOpen(false)}
        onPay={async () => {
          await onBoostPool()
        }}
      />
      <MarketLaunchStatusDialog
        open={unBoostConfirmBoostOpen}
        tokenSymbol={currentPool?.quoteSymbol}
        minTVL={String(progressTotal)}
        feeAmount={baseMarket?.boostFeeUsd}
        penaltyAmount={deductedAmount}
        refundAmount={baseMarket?.boostRefundFeeUsd}
        onClose={() => setUnBoostConfirmBoostOpen(false)}
        onAbort={async () => {
          await onUnBoostPool()
          await refreshAllData()
          await sleep(1200)
          await refreshAllData()
        }}
        onWait={() => setUnBoostConfirmBoostOpen(false)}
      />
      <MarketActivationFailedDialog
        open={claimRefundOpen}
        tokenSymbol={currentPool?.quoteSymbol}
        deductedAmount={deductedAmount}
        refundAmount={baseMarket?.boostRefundFeeUsd}
        onClose={() => setClaimRefundOpen(false)}
        onLater={() => setClaimRefundOpen(false)}
        onClaimRefund={async () => {
          await onClaimRefund(currentLpDetail?.state || 0)
          await refreshAllData()
          await sleep(1200)
          await refreshAllData()
        }}
      />
      <CookTokenSelectDialog
        open={tokenSelectDialogOpen}
        onClose={() => setTokenSelectDialogOpen(false)}
        baseTokenIcon={poolInfo?.baseTokenIcon}
        onSelectBaseToken={(base, quoteTokens, findCookPool) => {
          findCookPoolRef.current = findCookPool
          setDraftBaseToken(base)
          setDraftQuoteTokens(quoteTokens)
          setTokenSelectDialogOpen(false)
          setQuoteSelectDialogOpen(true)
        }}
      />
      <CookQuoteUnitSelectDialog
        open={quoteSelectDialogOpen}
        onClose={() => {
          findCookPoolRef.current = null
          setQuoteSelectDialogOpen(false)
          setDraftBaseToken(null)
          setDraftQuoteTokens([])
        }}
        baseToken={draftBaseToken}
        quoteTokens={draftQuoteTokens}
        chainLabel={chainInfo?.label}
        chainLogo={chainInfo?.logoUrl}
        baseTokenIcon={poolInfo?.baseTokenIcon}
        onBackToBase={() => {
          setQuoteSelectDialogOpen(false)
          setTokenSelectDialogOpen(true)
        }}
        onConfirm={(quote) => {
          const base = draftBaseToken
          if (!base) return
          const pool = findCookPoolRef.current?.(base.chainId, base.address, quote.address)
          if (!pool) {
            toast.error({ title: t`Pool not found` })
            return
          }
          const nextChain = String(pool.chainId)
          const nextPool = pool.poolId
          navigate(`/cook/${nextChain}/${nextPool}`, { replace: true })
          findCookPoolRef.current = null
          setQuoteSelectDialogOpen(false)
          setDraftBaseToken(null)
          setDraftQuoteTokens([])
          // 下一轮再失效：确保路由已更新；并清掉 usePoolDetail 里 placeholderData 残留的旧池
          setTimeout(() => {
            void queryClient.invalidateQueries({ queryKey: [{ key: 'cook_detail_balance' }] })
            void queryClient.invalidateQueries({
              queryKey: [{ key: 'cook_detail_withdrawable_lp' }],
            })
            void queryClient.invalidateQueries({
              queryKey: [{ key: 'pool_detail_by_poolId' }, nextPool, nextChain],
            })
            void queryClient.invalidateQueries({
              queryKey: [{ key: 'getQuotePoolDetail' }, nextChain, nextPool],
            })
            void queryClient.invalidateQueries({
              queryKey: [{ key: 'getBasePoolDetail' }, nextChain, nextPool],
            })
            void queryClient.invalidateQueries({
              queryKey: [{ key: 'getQuoteContractPoolInfo' }, nextPool, nextChain],
            })
            void queryClient.invalidateQueries({
              queryKey: [{ key: 'getBaseContractPoolInfo' }, nextPool, nextChain],
            })
            void queryClient.invalidateQueries({
              queryKey: [{ key: 'getMarketPoolRiskRate' }, nextChain, nextPool],
            })
            void queryClient.invalidateQueries({ queryKey: [{ key: 'boostInfo' }] })
          }, 0)
        }}
      />
    </Box>
  )
}
