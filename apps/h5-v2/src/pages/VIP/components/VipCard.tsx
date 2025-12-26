import { memo } from 'react'
import { useGetLevelUpdateInfo } from '@/hooks/vip/useVipLevel.ts'
import { Box, LinearProgress } from '@mui/material'
import { Trans } from '@lingui/react/macro'
import { encryptionAddress } from '@/utils'
import { formatNumberPrecision } from '@/utils/formatNumber.ts'

import { useWalletConnection } from '@/hooks/wallet/useWalletConnection.ts'
import { COMMON_PRICE_DISPLAY_DECIMALS } from '@/constant/decimals.ts'
import { useVipContext } from '@/pages/VIP/context.ts'

const MAX_UI_LEVEL = 6

export const VIPCard = memo(() => {
  const { address: account } = useWalletConnection()
  const { userVipInfo: vipInfo, isLoading } = useVipContext()
  const { nextLevelInfo, requiredTradeAmount, process, maxLevel } = useGetLevelUpdateInfo()

  return (
    <Box
      className={`vip-container vip-card flex h-[150px] flex-col justify-between gap-[24px] text-[12px] leading-[1.5] font-[500] text-white vip${vipInfo?.level && vipInfo?.level > MAX_UI_LEVEL ? MAX_UI_LEVEL : vipInfo?.level || 0}`}
    >
      <Box className={'flex flex-col gap-[6px]'}>
        <Box className={'flex items-end gap-[7px]'}>
          <h1 className={'title text-[32px] leading-[1] font-[700]'}>
            VIP{isLoading ? '--' : vipInfo && vipInfo?.level >= 0 ? vipInfo?.level : '--'}
          </h1>
          <span className={'opacity-65'}>
            <Trans>Current Level</Trans>
          </span>
        </Box>
        <p className={'opacity-65'}>{encryptionAddress(account)}</p>
      </Box>

      <Box className={'flex flex-col gap-[6px] text-[12px]'}>
        <Box className={'flex gap-[4px] opacity-85'}>
          {nextLevelInfo && nextLevelInfo.vipTier >= maxLevel ? (
            <span>
              <Trans>Congratulations! You’ve unlocked the highest VIP level.</Trans>
            </span>
          ) : (
            <>
              <span>
                <Trans>
                  Upgrade to VIP{nextLevelInfo ? nextLevelInfo.vipTier : '--'} by trading
                </Trans>
              </span>
              <span>
                $
                {nextLevelInfo && requiredTradeAmount
                  ? formatNumberPrecision(requiredTradeAmount, COMMON_PRICE_DISPLAY_DECIMALS)
                  : '--'}
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
