import Box from '@mui/material/Box'
import { Trans } from '@lingui/react/macro'
import { TokenInfo } from '@/pages/Market/components/TokenInfo.tsx'
import { WalletLine } from '@/components/Icon'
import { Tips } from '@/pages/Market/components/tips.tsx'
import { formatUnits, Market, market as _Market, pool as Pool } from '@myx-trade/sdk'
import { useCallback, useContext, useState } from 'react'
import { TokenContext } from '@/pages/Market/context.ts'
import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { Button } from '@mui/material'
// import { useContext } from 'react'
// import { TokenContext } from '@/pages/Market/context.ts'

export const ActiveMarket = ({ onNext }: { onNext: () => void }) => {
  const { chainId } = useParams()
  const { poolId } = useContext(TokenContext)
  const [loading, setLoading] = useState<boolean>(false)
  const { data: fee } = useQuery({
    queryKey: [{ key: 'market_fee_Info' }, chainId],
    queryFn: async () => {
      if (!chainId) return null
      const result = await _Market.getOracleFee(+chainId, Market[+chainId].marketId)

      return result ? formatUnits(result, Market[+chainId].decimals) : undefined
    },
  })

  const onReprime = useCallback(async () => {
    try {
      if (!poolId || !chainId) return
      setLoading(true)
      await Pool.reprime(+chainId, poolId)
      // message.success('Pool reprime')
      onNext?.()
    } catch (e) {
      console.error(e)
      // message.error(JSON.stringify(e))
    } finally {
      setLoading(false)
    }
  }, [poolId, chainId])
  return (
    <Box className={'flex flex-1 flex-col'}>
      <h2 className={'text-[24px] leading-[1] font-[700] text-white'}>
        <Trans>Activate Your Trading Contract</Trans>
      </h2>

      <Box
        className={
          'bg-base-bg mt-[20px] flex items-center justify-between gap-[12px] rounded-[12px] px-[16px] py-[20px]'
        }
      >
        <TokenInfo />
        <Box className={'flex flex-col items-end gap-[4px] leading-[1]'}>
          <h3 className={'text-[20px] font-[700] text-white'}>$2.34K</h3>
          <span>mcap</span>
        </Box>
      </Box>

      <Box className={'mt-[40px] flex flex-col'}>
        <label className={'text-regular flex items-center gap-[4px]'}>
          <Trans>Pay with USDT</Trans>
        </label>

        <Box
          className={
            'bg-base-bg mt-[16px] flex flex-col gap-[12px] rounded-[12px] px-[16px] py-[20px]'
          }
        >
          <Box className={'flex items-center justify-between gap-[10px]'}>
            <span className={'text-[24px] leading-[1] font-[700] text-white'}>{fee}</span>
            <Box className={'flex items-center gap-[4px]'}>
              <img className={'aspect-square h-[20px] w-[20px] rounded-full'} src={''} />
              <span className={'text-[16px] leading-[1] font-[500] text-white'}>USDT</span>
            </Box>
          </Box>
          <Box className={'flex items-center justify-between gap-[8px]'}>
            <Box className={'flex-1 font-[500]'}>$100</Box>
            <Box className={'flex flex-1 items-center justify-end gap-[4px]'}>
              <WalletLine size={14} />
              <span className={'font-[500]'}>100</span>
              <span className={'font-[500]'}>USDT</span>
            </Box>
          </Box>
        </Box>
      </Box>

      <Tips className={'mt-[12px]'}>
        <Trans>
          This fee is for the oracle service. Activation will be completed within 24 hours after
          payment.
        </Trans>
      </Tips>

      <Box className={'mt-[32px]'}>
        <Button
          loading={loading}
          className={'gradient primary long mx-auto w-full rounded'}
          onClick={onReprime}
        >
          <Trans>Activate Market</Trans>
        </Button>
      </Box>
    </Box>
  )
}
