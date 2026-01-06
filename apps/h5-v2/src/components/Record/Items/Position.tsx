import { Trans } from '@lingui/react/macro'
import { Tag } from '@/components/Tag/index'
import { formatNumber } from '@/utils/number'
import { RiseFallText } from '@/components/RiseFallText'
import { RiseFallTextPrecent } from '@/components/RiseFallText/RiseFallTextPrecent'
import { DirectionEnum } from '@myx-trade/sdk'
import { t } from '@lingui/core/macro'
import { parseBigNumber } from '@/utils/bn'
import { useGetFundingFee } from '@/hooks/calculate/use-get-fundingfee'
import useSWR from 'swr'
import { useGetLiqPrice } from '@/hooks/calculate/use-get-liq-price'
import { useGetPoolConfig } from '@/hooks/use-get-pool-config'
import { ClosePositionButton } from './components/ClosePositionButton'
import { AdjustMarginDialog } from '@/components/Trade/Dialog/AdjustMargin'
import { TpSlButton } from '@/components/Trade/Dialog/TPSL'
import { PairLogo } from '@/components/UI/PairLogo'
import { usePoolSymbol } from '@/hooks/pool/usePoolSymbol'
import { getChainInfo } from '@/config/chainInfo'
import { useMemo } from 'react'
import { SharePositionDialog } from '@/components/SharePositionDialog'

export const PositionItem = ({
  position,
  marketPrice,
  pool,
}: {
  position: any
  marketPrice: string
  pool: any
}) => {
  const { getFundingFee } = useGetFundingFee(position.poolId, position.chainId)

  const { data: fundingFee } = useSWR(
    `getFundingFee-${position.positionId}`,
    async () => {
      const rs = await getFundingFee(position.fundingRateIndex, position.size, position.direction)

      return rs
    },
    {
      refreshInterval: 10000,
    },
  )

  const { getLiqPrice } = useGetLiqPrice({ poolId: position.poolId, chainId: position.chainId })
  const { poolConfig } = useGetPoolConfig(position.poolId, position.chainId)

  const assetClass = poolConfig?.levelConfig?.assetClass ?? 0
  const { data: liqPrice } = useSWR(
    `getLiqPrice-${position.positionId}`,
    async () => {
      const rs = await getLiqPrice({
        entryPrice: position.entryPrice,
        collateralAmount: position.collateralAmount,

        size: position.size,
        price: marketPrice,
        assetClass: assetClass,
        fundingRateIndexEntry: position.fundingRateIndex,
        direction: position.direction,
        maintainMarginRate: poolConfig?.levelConfig?.maintainCollateralRate.toString() ?? '0',
      })

      return rs
    },
    {
      refreshInterval: 10000,
    },
  )

  let pnl
  if (position.direction === DirectionEnum.Long) {
    pnl =
      parseBigNumber(marketPrice)
        .minus(parseBigNumber(position.entryPrice))
        .mul(parseBigNumber(position.size)) ?? '0'
  } else {
    pnl =
      parseBigNumber(position.entryPrice)
        .minus(parseBigNumber(marketPrice))
        .mul(parseBigNumber(position.size)) ?? '0'
  }
  const rate = pnl.div(parseBigNumber(position.collateralAmount).plus(pnl)).toString() ?? '0'

  const originalCollateralRatio = parseBigNumber(position.entryPrice)
    .mul(parseBigNumber(position.size))
    .mul(parseBigNumber(0.01))
  const currentCollateral = parseBigNumber(position.collateralAmount).plus(pnl)

  const ratio = originalCollateralRatio.div(currentCollateral).mul(100).toFixed(2) ?? '0'

  const symbolInfo = usePoolSymbol({
    chainId: position.chainId,
    poolId: position.poolId,
  })
  const chainInfo = useMemo(() => {
    if (!position.chainId) return null
    return getChainInfo(position.chainId)
  }, [position.chainId])

  return (
    <div className="w-full border-b border-[#202129] px-[16px] py-[20px]">
      <div className="flex items-center justify-between">
        {/* symbol info */}
        <div>
          <div className="flex items-center gap-[4px]">
            <PairLogo
              baseLogoSize={24}
              quoteLogoSize={10}
              baseLogo={symbolInfo?.baseTokenIcon}
              quoteLogo={chainInfo?.logoUrl}
              quoteClassName=" ml-[-8px]!"
            />
            <div className="flex flex-col items-start gap-[4px]">
              <p className="text-[14px] text-white">
                {position.baseSymbol}/{position.quoteSymbol}
              </p>
              <div className="flex gap-[4px]">
                <Tag type={position.direction === DirectionEnum.Long ? 'success' : 'danger'}>
                  <Trans>{position.direction === DirectionEnum.Long ? t`Long` : t`Short`}</Trans>
                </Tag>
                <Tag type="info">
                  <Trans>Isolated {position.userLeverage}x</Trans>
                </Tag>
              </div>
            </div>
          </div>
        </div>
        {/* time */}
        {/* <p className="text-[12px] text-[#848E9C]">{dayjs().format('YYYY/MM/DD HH:mm:ss')}</p> */}
        <div role="button" className="shrink-0 text-white">
          <SharePositionDialog
            position={position}
            roe={marketPrice ? rate : '--'}
            price={marketPrice}
          />
        </div>
      </div>
      {/* info */}
      <div className="mt-[16px]">
        <div className="grid grid-cols-3 justify-between gap-[16px] text-[12px] text-[#848E9C]">
          {/* left */}
          {/* unPnl */}
          <div>
            <p>
              <Trans>unPnl</Trans>
            </p>
            <p className="mt-[4px] text-[14px] font-medium text-white">
              <RiseFallText value={pnl} />
            </p>
          </div>
          {/* roe */}
          <div className="text-left">
            <p>
              <Trans>Roe</Trans>
            </p>
            <p className="mt-[4px] text-[14px] font-medium text-white">
              <RiseFallTextPrecent value={marketPrice ? rate : '--'} />
            </p>
          </div>
          {/* Margin ratio */}
          <div className="text-right">
            <p>
              <Trans>Margin ratio</Trans>
            </p>
            <p className="mt-[4px] text-[14px] font-medium text-white">
              {marketPrice ? ratio : '--'}%
            </p>
          </div>
          {/* size */}
          <div>
            <p>
              <Trans>Size({position.baseSymbol})</Trans>
            </p>
            <p className="mt-[4px] text-[14px] font-medium text-white">
              {formatNumber(position.size, { showUnit: false })}
            </p>
          </div>
          {/* entry price */}
          <div className="text-left">
            <p>
              <Trans>Entry price</Trans>
            </p>
            <p className="mt-[4px] text-[14px] font-medium text-white">
              {formatNumber(position.entryPrice, { showUnit: false })}
            </p>
          </div>
          {/* margin amount */}
          <div className="text-right">
            <p>
              <Trans>Margin({position.quoteSymbol})</Trans>
            </p>
            <p className="mt-[4px] text-[14px] font-medium text-white">
              {formatNumber(position.collateralAmount, { showUnit: false })}
            </p>
          </div>
          {/* funding fee usdt */}
          <div>
            <p>
              <Trans>Funding fee</Trans>
            </p>
            <p
              className="mt-[4px] text-[14px] font-medium text-white"
              style={{ color: parseBigNumber(fundingFee ?? '0').gt(0) ? '#00E3A5' : '#EC605A' }}
            >
              {formatNumber(fundingFee ?? '0', { showUnit: false })}
            </p>
          </div>
          {/* liquidation price */}
          <div className="text-left">
            <p>
              <Trans>Liq.Price</Trans>
            </p>
            <p className="text-warning mt-[4px] text-[14px] font-medium">
              {parseBigNumber(liqPrice ?? '0').gt(0)
                ? formatNumber(liqPrice ?? '0', { showUnit: false })
                : '--'}
            </p>
          </div>
          {/* auto tp price */}
          <div className="text-right">
            <p>
              <Trans>Auto TP Price</Trans>
            </p>
            <p className="mt-[4px] text-[14px] font-medium text-white">
              {parseBigNumber(position.earlyClosePrice ?? '0').gt(0)
                ? formatNumber(position.earlyClosePrice ?? '0', { showUnit: false })
                : '--'}
            </p>
          </div>
        </div>
      </div>

      {/* buttons */}
      <div className="mt-[20px] flex justify-center gap-[8px]">
        <AdjustMarginDialog position={position} />
        <TpSlButton position={position} poolInfo={pool} />
        <ClosePositionButton
          style={{
            width: '100%',
            padding: '10px 16px',
            borderRadius: '6px',
            fontWeight: 500,
          }}
          position={position}
          marketPrice={marketPrice}
          symbolInfo={pool}
        />
      </div>
    </div>
  )
}
