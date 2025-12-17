import { memo } from 'react'
import { useGetLevelUpdateInfo } from '@/hooks/vip/useVipLevel.ts'
import { Box, LinearProgress } from '@mui/material'
import { Trans } from '@lingui/react/macro'
import { encryptionAddress } from '@/utils'
import { formatNumberPrecision } from '@/utils/formatNumber.ts'

import { useWalletConnection } from '@/hooks/wallet/useWalletConnection.ts'
import { COMMON_PRICE_DISPLAY_DECIMALS } from '@/constant/decimals.ts'
import type { VipProps } from '@/pages/VIP/type.ts'

export const VIPCard = memo(({ vipInfo, isLoading }: VipProps) => {
  const { address: account } = useWalletConnection()

  const { nextLevelInfo, requiredTradeAmount, tradeAmount, myxBalance, process, maxLevel } =
    useGetLevelUpdateInfo()

  return (
    <Box
      className={`vip-container vip-card mt-[24px] flex h-[250px] flex-col justify-between gap-[24px] text-[12px] leading-[1.5] font-[500] text-white vip${vipInfo?.level && vipInfo?.level > 6 ? 6 : vipInfo?.level || 0}`}
    >
      <Box className={'flex flex-col gap-[6px]'}>
        <Box className={'flex items-end gap-[7px]'}>
          <h1 className={'title text-[32px] leading-[1] font-[700]'}>
            VIP{isLoading ? '--' : vipInfo && vipInfo?.level >= 0 ? vipInfo?.level : '--'}
          </h1>
          <span>
            <Trans>Current Level</Trans>
          </span>
        </Box>
        <p className={''}>{encryptionAddress(account)}</p>
      </Box>

      <Box className={'flex flex-col gap-[6px] text-[16px]'}>
        <Box className={'flex gap-[4px]'}>
          {nextLevelInfo && nextLevelInfo.level >= maxLevel ? (
            <span>
              <Trans>Congratulations! You’ve unlocked the highest VIP level.</Trans>
            </span>
          ) : (
            <>
              <span>
                <Trans>Upgrade to VIP{nextLevelInfo ? nextLevelInfo.level : '--'} by trading</Trans>
              </span>
              <span>
                {nextLevelInfo && requiredTradeAmount
                  ? formatNumberPrecision(requiredTradeAmount, COMMON_PRICE_DISPLAY_DECIMALS)
                  : '--'}{' '}
                U{' '}
              </span>
            </>
          )}
        </Box>

        <Box className={'flex flex-col gap-[4px]'}>
          <LinearProgress className={'progress'} variant="determinate" value={process ?? 0} />
        </Box>
      </Box>
    </Box>
  )
})
