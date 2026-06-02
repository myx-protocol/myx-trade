import { InfoButton, PrimaryButton } from '@/components/UI/Button'
import { usePoolNoTradable } from '@/hooks/pool/usePoolNoTradable'
import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import { MarketPoolState } from '@myx-trade/sdk'
import { useNavigate } from 'react-router-dom'
import MarketStatusPng from '@/assets/trade/market-status.png'
import { TradeSide } from '@/pages/Earn/components/Trade/Context'
import { CookOrderSideEnum } from '@/components/CookDetail/Order/type'

interface NoTradeableProps {
  poolId?: string
  chainId?: number
}

export const NoTradeable = (props: NoTradeableProps) => {
  const { poolId, chainId } = props

  const navigate = useNavigate()
  const { marketDetail } = usePoolNoTradable({ poolId, chainId })
  const isBench = marketDetail?.state === MarketPoolState.Bench
  const toCook = () => {
    navigate(`/cook/${chainId}/${poolId}`)
  }
  const toTrench = (isRedeem = false) => {
    navigate(
      `/trench/${chainId}/${poolId}?side=${isRedeem ? CookOrderSideEnum.Sell : CookOrderSideEnum.Buy}`,
    )
  }
  const toEarn = (isRedeem = false) => {
    navigate(`/earn/${chainId}/${poolId}?side=${isRedeem ? TradeSide.Redeem : TradeSide.Subscribe}`)
  }
  const toReactivate = () => {
    if (!marketDetail?.baseToken) return
    navigate(`/market/${chainId}/${marketDetail?.baseToken}`)
  }
  const renderButtons = () => {
    if (isBench) {
      return (
        <>
          <PrimaryButton
            style={{
              width: '133px',
              height: '38px',
              borderRadius: '100px',
              padding: '0 24px',
              fontSize: '12px',
              fontWeight: 500,
              lineHeight: 1.2,
            }}
            onClick={toReactivate}
          >
            <Trans>Reactivate Pool </Trans>
          </PrimaryButton>
          <PrimaryButton
            style={{
              width: '133px',
              height: '38px',
              borderRadius: '100px',
              padding: '0 24px',
              fontSize: '12px',
              fontWeight: 500,
              lineHeight: 1.2,
              borderColor: 'rgba(128, 255, 149, 0.2)',
              color: '#00E3A5',
              whiteSpace: 'break-spaces',
              backgroundImage:
                'linear-gradient(95deg, rgba(61, 153, 107, 0.10) 0%, rgba(0, 153, 111, 0.10) 18.58%)',
              '&:hover': {
                backgroundImage:
                  'linear-gradient(95deg, rgba(61, 153, 107, 0.20) 0%, rgba(0, 153, 111, 0.20) 18.58%)',
              },
              '& > div > div:last-child': {
                width: '100%',
                textAlign: 'center',
                wordBreak: 'break-word',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              },
            }}
            onClick={() => {
              toTrench(true)
            }}
          >
            <Trans>
              Redeem m{marketDetail?.baseSymbol}.{marketDetail?.quoteSymbol}
            </Trans>
          </PrimaryButton>
          <PrimaryButton
            style={{
              width: '133px',
              height: '38px',
              borderRadius: '100px',
              padding: '0 24px',
              fontSize: '12px',
              whiteSpace: 'break-spaces',
              fontWeight: 500,
              lineHeight: 1.2,
              borderColor: 'rgba(128, 255, 149, 0.2)',
              color: '#00E3A5',
              backgroundImage:
                'linear-gradient(95deg, rgba(61, 153, 107, 0.10) 0%, rgba(0, 153, 111, 0.10) 18.58%)',
              '&:hover': {
                backgroundImage:
                  'linear-gradient(95deg, rgba(61, 153, 107, 0.20) 0%, rgba(0, 153, 111, 0.20) 18.58%)',
              },
              '& > div > div:last-child': {
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                width: '100%',
                textAlign: 'center',
                wordBreak: 'break-word',
              },
            }}
            onClick={() => {
              toEarn(true)
            }}
          >
            <Trans>
              Redeem m{marketDetail?.quoteSymbol}.{marketDetail?.baseSymbol}
            </Trans>
          </PrimaryButton>
        </>
      )
    }
    return (
      <>
        <InfoButton
          style={{
            width: '133px',
            height: '38px',
            borderRadius: '100px',
            padding: '0 24px',
            fontSize: '12px',
            fontWeight: 500,
            lineHeight: 1,
          }}
          onClick={toCook}
        >
          <p>
            <Trans>Join Cook Pool</Trans>
          </p>
          <p className="text-[10px] leading-[1.2] opacity-70">
            <Trans>(Provide {marketDetail?.baseSymbol})</Trans>
          </p>
        </InfoButton>

        <PrimaryButton
          style={{
            width: '133px',
            height: '38px',
            borderRadius: '100px',
            padding: '0 24px',
            fontSize: '12px',
            fontWeight: 500,
            lineHeight: 1.2,
          }}
          onClick={toEarn}
        >
          <p>
            <Trans>Join Earn Pool</Trans>
          </p>
          <p className="text-[10px] leading-[1.2] opacity-70">
            <Trans>(Provide {marketDetail?.quoteSymbol})</Trans>
          </p>
        </PrimaryButton>
      </>
    )
  }
  return (
    <div className="flex h-full w-full flex-col items-center justify-center px-[16px] py-[24px]">
      <div className="bg-base flex h-[80px] w-[80px] items-center justify-center rounded-full">
        <img src={MarketStatusPng} alt="no-tradable" className="h-[44px] w-[48px]" />
      </div>
      <p className="mt-[16px] text-[16px] leading-none font-medium text-white">
        {isBench ? t`Market Delisted` : `Trading Not Live Yet`}
      </p>
      {/* description */}
      <p className="text-secondary mt-[8px] text-center text-[12px] leading-[1.3]">
        {isBench
          ? t`Trading is currently suspended as this market has been delisted. You can step up to reactivate the pool and bring this market back online.`
          : t`The market is gathering initial liquidity. Be a pioneer—provide liquidity to trigger the launch and lock in a LIFETIME 2% Genesis fee share! Choose your preferred pool to get started:`}
      </p>
      <div className="mt-[20px] flex items-center justify-center gap-[12px]">{renderButtons()}</div>
    </div>
  )
}
