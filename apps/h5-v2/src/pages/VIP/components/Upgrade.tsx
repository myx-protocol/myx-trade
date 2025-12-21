import { memo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGetLevelUpdateInfo } from '@/hooks/vip/useVipLevel.ts'
import { Box, Button, LinearProgress } from '@mui/material'
import { Trans } from '@lingui/react/macro'
import { formatNumberPrecision } from '@/utils/formatNumber.ts'
import { COMMON_PERCENT_DISPLAY_DECIMALS, COMMON_PRICE_DISPLAY_DECIMALS } from '@/constant/decimals'
import { MYX_SWAP_LINK } from '@/config'
import { TradeButton } from '@/components/Button/TradeButton.tsx'

export const Upgrade = memo(() => {
  const navigate = useNavigate()
  const {
    requiredTradeAmount,
    tradeAmount,
    safeTradeProcess,
    nextLevelInfo,
    requiredMyxAmount,
    myxBalance,
    safeMyxProcess,
    maxLevel,
    process,
    nextMyxAmount,
  } = useGetLevelUpdateInfo()
  return (
    <Box className={'mt-[24px] flex flex-col gap-[16px]'}>
      <Box className={'flex flex-col gap-[12px]'}>
        <span className={'text-basic-white text-[20px] leading-[1] font-[700]'}>
          <Trans>Upgrade</Trans>
        </span>
        {nextLevelInfo && nextLevelInfo.vipTier >= maxLevel ? (
          <p className={'text-regular text-[14px] leading-[1.5] font-[500]'}>
            <Trans>Congratulations! You’ve unlocked the highest VIP level.</Trans>
          </p>
        ) : process < 100 ? (
          <></>
        ) : (
          <p>
            <Trans>Upgrade conditions met! New VIP tier updates today, 22:00 - 23:00 UTC.</Trans>
          </p>
        )}
      </Box>

      <Box
        className={
          'border-dark-border flex flex-col gap-[24px] rounded-[12px] border-1 px-[12px] py-[20px]'
        }
      >
        <Box className={'flex justify-between'}>
          <Box className={'flex flex-col gap-[6px]'}>
            <span className={'text-secondary text-[12px] leading-[14px] font-[500]'}>
              <Trans>Trading Volume</Trans>
            </span>
            <span className={'text-basic-white leading-[1] font-[700]'}>
              $
              {nextLevelInfo
                ? formatNumberPrecision(tradeAmount, COMMON_PRICE_DISPLAY_DECIMALS)
                : '--'}
            </span>
          </Box>

          <Box className={'flex flex-col items-end gap-[6px]'}>
            <span className={'text-secondary text-[12px] leading-[14px] font-[500]'}>
              <Trans>Upgrade Progress</Trans>
            </span>
            <span className={'text-basic-white leading-[1] font-[700]'}>
              {nextLevelInfo
                ? formatNumberPrecision(safeTradeProcess, COMMON_PERCENT_DISPLAY_DECIMALS)
                : '--'}
              %
            </span>
          </Box>
        </Box>

        <Box className={'flex flex-col gap-[6px]'}>
          <span className={'text-secondary text-[12px] leading-[1.5] font-[500]'}>
            {nextLevelInfo && nextLevelInfo.vipTier >= maxLevel ? (
              <Trans>You’ve unlocked the highest VIP level.</Trans>
            ) : (
              <Trans>
                To upgrade to VIP{nextLevelInfo?.vipTier ?? '--'}, you need an additional $
                {nextLevelInfo
                  ? formatNumberPrecision(requiredTradeAmount, COMMON_PRICE_DISPLAY_DECIMALS)
                  : '--'}{' '}
                USD
              </Trans>
            )}
          </span>

          <Box>
            <LinearProgress
              className={'progress progress-primary'}
              variant="determinate"
              value={safeTradeProcess ?? 0}
            />
          </Box>
        </Box>

        <Box>
          <TradeButton
            className={'!rounded-full'}
            fullWidth
            variant="contained"
            onClick={() => navigate('/trade')}
          >
            <Trans>Trade</Trans>
          </TradeButton>
        </Box>
      </Box>

      {nextMyxAmount && (
        <Box
          className={
            'border-dark-border flex flex-col gap-[24px] rounded-[12px] border-1 px-[12px] py-[20px]'
          }
        >
          <Box className={'flex justify-between'}>
            <Box className={'flex flex-col gap-[6px]'}>
              <span className={'text-secondary text-[12px] leading-[14px] font-[500]'}>
                <Trans>Holding MYX</Trans>
              </span>
              <span className={'text-basic-white leading-[1] font-[700]'}>
                {nextLevelInfo
                  ? formatNumberPrecision(myxBalance, COMMON_PERCENT_DISPLAY_DECIMALS)
                  : '--'}
              </span>
            </Box>

            <Box className={'flex flex-col items-end gap-[6px]'}>
              <span className={'text-secondary text-[12px] leading-[14px] font-[500]'}>
                <Trans>Current Status</Trans>
              </span>
              <span className={'text-basic-white leading-[1] font-[700]'}>{safeMyxProcess}%</span>
            </Box>
          </Box>

          <Box className={'flex flex-col gap-[6px]'}>
            <span className={'text-secondary text-[12px] leading-[1.5] font-[500]'}>
              {nextLevelInfo && nextLevelInfo.vipTier >= maxLevel ? (
                <Trans>You’ve unlocked the highest VIP level.</Trans>
              ) : (
                <Trans>
                  You need to hold{' '}
                  {formatNumberPrecision(requiredMyxAmount, COMMON_PRICE_DISPLAY_DECIMALS)} MYX to
                  upgrade to VIP{nextLevelInfo?.vipTier}
                </Trans>
              )}
            </span>

            <Box>
              <LinearProgress
                className={'progress progress-primary'}
                variant="determinate"
                value={safeMyxProcess ?? 0}
              />
            </Box>
          </Box>

          <Box>
            <TradeButton
              className={'!rounded-full'}
              fullWidth
              variant="contained"
              onClick={() => window.open(MYX_SWAP_LINK)}
            >
              <Trans>Buy MYX</Trans>
            </TradeButton>
          </Box>
        </Box>
      )}
    </Box>
  )
})
