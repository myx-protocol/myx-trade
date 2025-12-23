import { Trans } from '@lingui/react/macro'
import { Tag } from '@/components/Tag/index'
import { formatNumber } from '@/utils/number'
import { RiseFallText } from '@/components/RiseFallText'
import dayjs from 'dayjs'
import SortDownIcon from '@/components/Icon/set/SortDown'
import { FlexRowLayout } from '@/components/FlexRowLayout'
import { Copy } from '@/components/Copy'
import { truncateString } from '@/utils/string'
import { motion } from 'framer-motion'
import { useMemo, useState } from 'react'
import type { TradeFlowItem } from '@myx-trade/sdk'
import { t } from '@lingui/core/macro'
import { TradeFlowAccountTypeEnum, TradeFlowTypeEnum } from '@myx-trade/sdk'
import Big from 'big.js'
import { usePoolSymbol } from '@/hooks/pool/usePoolSymbol'
import { getChainInfo } from '@/config/chainInfo'
import { PairLogo } from '@/components/UI/PairLogo'
import { useNavigate } from 'react-router-dom'
import IconArrowRight from '@/components/UI/Icon/ArrowRightIcon'
import { getChainsTokenInfo } from '@/config/address'

const TradeFlowType: Record<TradeFlowTypeEnum, () => string> = {
  [TradeFlowTypeEnum.Increase]: () => t`开仓`,
  [TradeFlowTypeEnum.Decrease]: () => t`平仓`,
  [TradeFlowTypeEnum.AddMargin]: () => t`添加保证金`,
  [TradeFlowTypeEnum.RemoveMargin]: () => t`减少保证金`,
  [TradeFlowTypeEnum.CancelOrder]: () => t`取消订单`,
  [TradeFlowTypeEnum.ADL]: () => t`ADL`,
  [TradeFlowTypeEnum.Liquidation]: () => t`爆仓`,
  [TradeFlowTypeEnum.MarketClose]: () => t`市场关闭`,
  [TradeFlowTypeEnum.EarlyClose]: () => t`提前平仓`,
  [TradeFlowTypeEnum.AddTPSL]: () => t`添加止盈止损`,
  [TradeFlowTypeEnum.TransferToWallet]: () => t`划转至钱包`,
  [TradeFlowTypeEnum.MarginAccountDeposit]: () => t`划转至保证金`,
  [TradeFlowTypeEnum.ReferralReward]: () => t`邀请返佣`,
  [TradeFlowTypeEnum.ReferralRewardClaim]: () => t`领取邀请返佣`,
  [TradeFlowTypeEnum.SecurityDeposit]: () => t`风控扣除`,
}

const FinanceTransferItem = ({ item }: { item: TradeFlowItem }) => {
  const tokenInfo = useMemo(() => {
    if (item.token) return getChainsTokenInfo(item.chainId, item.token)
    return null
  }, [item.token, item.chainId])

  const chainInfo = useMemo(() => {
    if (!item.chainId) return null
    return getChainInfo(item.chainId)
  }, [item.chainId])
  return (
    <div className="w-full border-b border-[#202129] p-[16px]">
      <div className="flex items-center justify-between" role="button">
        {/* symbol info */}
        <div className="flex items-center gap-[4px]">
          <PairLogo
            baseLogoSize={24}
            quoteLogoSize={10}
            baseLogo={tokenInfo?.logo}
            quoteLogo={chainInfo?.logoUrl}
            quoteClassName=" ml-[-8px]!"
          />
          <div>
            <p className="text-[14px] font-medium text-white">
              {tokenInfo ? <>{tokenInfo?.symbol}</> : <>--</>}
            </p>
            <p className="text-[12px] text-[#6D7180]">
              {dayjs.unix(item.txTime).format('M/D HH:mm:ss')}
            </p>
          </div>
        </div>
        {/* margin amount */}
        <div className="flex flex-col items-end gap-[6px]">
          {Big(item.collateralAmount || '0')
            .abs()
            .gt(0) && (
            <p>
              {formatNumber(item.collateralAmount, {
                showSign: true,
                showUnit: false,
              })}
              <span className="ml-[2px]">{tokenInfo?.symbol}</span>
            </p>
          )}
          {Big(item.collateralBase || '0')
            .abs()
            .gt(0) && (
            <p>
              {formatNumber(item.collateralBase, {
                showSign: true,
                showUnit: false,
              })}
              <span className="ml-[2px]">{tokenInfo?.symbol}</span>
            </p>
          )}
        </div>
      </div>
      <div className="mt-[8px] flex items-center justify-between text-[12px] font-normal text-[#CED1D9]">
        <p className="text-[#848E9C]">
          <Trans>流入/流出</Trans>
        </p>
        <p>
          {item.type === TradeFlowTypeEnum.TransferToWallet ? (
            <Trans>钱包账户</Trans>
          ) : (
            <Trans>保证金账户</Trans>
          )}
        </p>
      </div>
    </div>
  )
}

export const FinanceDetailItem = ({ item }: { item: TradeFlowItem }) => {
  const [open, setOpen] = useState(false)
  const symbolInfo = usePoolSymbol({
    chainId: item.chainId,
    poolId: item.poolId,
  })
  const chainInfo = useMemo(() => {
    if (!item.chainId) return null
    return getChainInfo(item.chainId)
  }, [item.chainId])
  const amountInfo = useMemo(() => {
    let baseTokenAmountBig = Big(item.basePnl || '0')
    let quoteTokenAmountBig = Big(item.quotePnl || '0')
      .add(item.fundingFee || '0')
      .add(item.executionFee || '0')
      .add(item.tradingFee || '0')
      .add(item.tradingFee || '0')
      .add(item.collateralAmount || '0')
      .add(item.referralRebate || '0')
      .add(item.referrerRebate || '0')
      .add(item.rebateClaimedAmount || '0')
    let seamlessFeeBig = Big(0)
    if (item.seamlessFeeSymbol === symbolInfo?.baseSymbol) {
      seamlessFeeBig = seamlessFeeBig.add(item.seamlessFee || '0')
    }
    if (item.seamlessFeeSymbol === symbolInfo?.quoteSymbol) {
      quoteTokenAmountBig = quoteTokenAmountBig.add(item.seamlessFee || '0')
    }
    if (item.seamlessFeeSymbol === symbolInfo?.baseSymbol) {
      baseTokenAmountBig = baseTokenAmountBig.add(item.seamlessFee || '0')
    }
    return {
      baseTokenAmountBig,
      quoteTokenAmountBig,
      seamlessFeeBig,
    }
  }, [item, symbolInfo])
  const navigate = useNavigate()

  const renderOrderType = () => {
    switch (item.type) {
      case TradeFlowTypeEnum.Increase:
      case TradeFlowTypeEnum.Decrease:
      case TradeFlowTypeEnum.AddTPSL:
        return <Tag type="success">{TradeFlowType[item.type]?.()}</Tag>
      case TradeFlowTypeEnum.ADL:
      case TradeFlowTypeEnum.Liquidation:
        return <Tag type="danger">{TradeFlowType[item.type]?.()}</Tag>
      default:
        return <Tag type="info">{TradeFlowType[item.type]?.()}</Tag>
    }
  }

  return (
    <div className="w-full border-b border-[#202129] p-[16px]">
      <div
        className="flex items-center justify-between"
        role="button"
        onClick={() => setOpen(!open)}
      >
        {/* symbol info */}
        <div className="flex items-center gap-[4px]">
          <PairLogo
            baseLogoSize={24}
            quoteLogoSize={10}
            baseLogo={symbolInfo?.baseTokenIcon}
            quoteLogo={chainInfo?.logoUrl}
            quoteClassName=" ml-[-8px]!"
          />
          <div>
            <p className="text-[14px] font-medium text-white">
              {symbolInfo ? (
                <>
                  {symbolInfo?.baseSymbol}/{symbolInfo?.quoteSymbol}
                </>
              ) : (
                <>--</>
              )}
            </p>
            <div className="mt-[4px] flex items-center gap-[4px]">
              {renderOrderType()}
              <p className="text-[12px] text-[#6D7180]">
                {dayjs.unix(item.txTime).format('M/D HH:mm:ss')}
              </p>
            </div>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-[2px] text-[14px] text-white font-stretch-semi-condensed">
          <div className="flex flex-col items-end gap-[16px]">
            {/* quote */}
            {Big(amountInfo.quoteTokenAmountBig).abs().gt(0) && (
              <p>
                {formatNumber(amountInfo.quoteTokenAmountBig.toNumber(), {
                  showSign: true,
                  showUnit: false,
                })}
                <span className="ml-[2px]">{symbolInfo?.quoteSymbol}</span>
              </p>
            )}
            {/* base */}
            {Big(amountInfo.baseTokenAmountBig).abs().gt(0) && (
              <p>
                {formatNumber(amountInfo.baseTokenAmountBig.toNumber(), {
                  showSign: true,
                  showUnit: false,
                })}
                <span className="ml-[2px]">{symbolInfo?.baseSymbol}</span>
              </p>
            )}
            {/* seamless fee */}
            {Big(amountInfo.seamlessFeeBig).abs().gt(0) && (
              <p>
                {formatNumber(amountInfo.seamlessFeeBig.toNumber(), {
                  showSign: true,
                  showUnit: false,
                })}
                <span className="ml-[2px]">{item.seamlessFeeSymbol}</span>
              </p>
            )}
          </div>
          <span role="button" className="ml-[2px] flex">
            <SortDownIcon size={8} color="#848E9C" />
          </span>
        </div>
      </div>
      {/* info */}
      {open && (
        <motion.div
          className="mt-[16px] flex flex-col gap-[10px] text-[12px] text-[#9397A3]"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
          style={{ overflow: 'hidden' }}
        >
          {/* PnL */}
          {Big(item.quotePnl || '0')
            .abs()
            .gt(0) ||
            (Big(item.basePnl || '0')
              .abs()
              .gt(0) && (
              <FlexRowLayout
                left={<Trans>PnL</Trans>}
                right={
                  <div className="flex flex-col items-end gap-[10px]">
                    {Big(item.quotePnl || '0')
                      .abs()
                      .gt(0) && (
                      <p className="font-medium text-white">
                        <RiseFallText
                          value={item.quotePnl}
                          renderOptions={{
                            showUnit: false,
                            showSign: true,
                          }}
                          suffix={<span className="ml-[2px]">{symbolInfo?.quoteSymbol}</span>}
                        />
                      </p>
                    )}
                    {Big(item.basePnl || '0')
                      .abs()
                      .gt(0) && (
                      <p className="font-medium text-white">
                        <RiseFallText
                          value={item.basePnl}
                          renderOptions={{
                            showUnit: false,
                            showSign: true,
                          }}
                          suffix={<span className="ml-[2px]">{symbolInfo?.baseSymbol}</span>}
                        />
                      </p>
                    )}
                  </div>
                }
              />
            ))}

          {/* margin */}
          {Boolean(Number(item.collateralAmount)) && (
            <FlexRowLayout
              left={<Trans>保证金</Trans>}
              right={
                <p className="font-medium">
                  <RiseFallText
                    value={item.collateralAmount}
                    suffix={<span className="ml-[2px]">{symbolInfo?.quoteSymbol || ''}</span>}
                    renderOptions={{
                      showSign: true,
                      showUnit: false,
                    }}
                  />
                </p>
              }
            />
          )}

          {/* funding fee */}
          {Big(item.fundingFee || '0')
            .abs()
            .gt(0) && (
            <FlexRowLayout
              left={<Trans>Funding Fee</Trans>}
              right={
                <p className="font-medium text-white">
                  <RiseFallText
                    value={item.fundingFee}
                    renderOptions={{
                      showUnit: false,
                      showSign: true,
                    }}
                    suffix={<span className="ml-[2px]">{symbolInfo?.quoteSymbol}</span>}
                  />
                </p>
              }
            />
          )}
          {/* execution fee */}
          {Big(item.executionFee || '0')
            .abs()
            .gt(0) && (
            <FlexRowLayout
              left={<Trans>Execution Fee</Trans>}
              right={
                <p className="font-medium text-white">
                  <RiseFallText
                    value={item.executionFee}
                    renderOptions={{
                      showUnit: false,
                      showSign: true,
                    }}
                    suffix={<span className="ml-[2px]">{symbolInfo?.quoteSymbol}</span>}
                  />
                </p>
              }
            />
          )}
          {/* trading fee */}
          {Big(item.tradingFee || '0')
            .abs()
            .gt(0) && (
            <FlexRowLayout
              left={<Trans>Trading Fee</Trans>}
              right={
                <p className="font-medium text-white">
                  <RiseFallText
                    value={item.tradingFee}
                    renderOptions={{
                      showUnit: false,
                      showSign: true,
                    }}
                    suffix={<span className="ml-[2px]">{symbolInfo?.quoteSymbol}</span>}
                  />
                </p>
              }
            />
          )}
          {/* seamless fee */}
          {Big(item.seamlessFee || '0')
            .abs()
            .gt(0) && (
            <FlexRowLayout
              left={<Trans>无感Gas费</Trans>}
              right={
                <p className="font-medium text-white">
                  <RiseFallText
                    value={item.seamlessFee}
                    renderOptions={{
                      showUnit: false,
                      showSign: true,
                    }}
                    suffix={<span className="ml-[2px]">{item.seamlessFeeSymbol}</span>}
                  />
                </p>
              }
            />
          )}
          {/* flow direction */}
          <FlexRowLayout
            left={<Trans>流入/流出</Trans>}
            right={
              <p className="font-medium text-white">
                {item.accountType === TradeFlowAccountTypeEnum.MarginAccount && (
                  <span>
                    <Trans>保证金账户</Trans>
                  </span>
                )}
                {item.accountType === TradeFlowAccountTypeEnum.WalletAccount && (
                  <span>
                    <Trans>钱包账户</Trans>
                  </span>
                )}
                {item.accountType === TradeFlowAccountTypeEnum.ReferralReward && (
                  <span
                    className="text-green flex items-center"
                    role="button"
                    onClick={() => {
                      navigate(`/referrals`)
                    }}
                  >
                    <Trans>邀请返佣</Trans>
                    <IconArrowRight size={12} />
                  </span>
                )}
              </p>
            }
          />
          {/* hash */}
          <FlexRowLayout
            left={<Trans>Hash</Trans>}
            right={
              <p className="flex items-center gap-[4px] font-medium text-white">
                <span>{truncateString(item.txHash || '', 10, 4)}</span>
                <Copy content={item.txHash || ''} />
              </p>
            }
          />
        </motion.div>
      )}
    </div>
  )
}

export const FinanceItem = ({ item }: { item: TradeFlowItem }) => {
  if (
    item.type === TradeFlowTypeEnum.TransferToWallet ||
    item.type === TradeFlowTypeEnum.MarginAccountDeposit
  ) {
    return <FinanceTransferItem item={item} />
  }
  return <FinanceDetailItem item={item} />
}
