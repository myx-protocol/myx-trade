import { useContext } from 'react'
import { ActiveMarket } from '@/pages/Market/components/activeMarket.tsx'
import { VaultSelect } from '@/pages/Market/components/VaultSelect.tsx'
import { useQuery } from '@tanstack/react-query'
import { MarketPoolState, pool } from '@myx-trade/sdk'
import { useParams } from 'react-router-dom'
import { TokenContext } from '@/pages/Market/context.ts'
import { styled } from '@mui/material'
import { NumericInputWithAdornment } from '@/pages/Earn/components/Trade/NumericInput.tsx'

const StyledNumericInputWithAdornment = styled(NumericInputWithAdornment)`
  .MuiInputBase-root {
    font-size: 24px;
    padding: 2px 0;
    height: 28px;
  }
  & .MuiInputBase-input {
    height: 24px;
    line-height: 24px;
  }

  & .MuiInputAdornment-root {
    margin-left: 2px;
    color: var(--regular-text);
  }
`
export const ConfirmToken = ({ onNext }: { onNext: () => void }) => {
  const { chainId } = useParams()
  const { poolId } = useContext(TokenContext)

  const { data: poolInfo } = useQuery({
    queryKey: [{ key: 'getMarketPoolInfo' }, chainId],
    queryFn: async () => {
      if (!chainId || !poolId) return
      const info = await pool.getPoolDetail(+chainId, poolId)
      return info
    },
  })

  return (
    <>
      {poolInfo?.state !== MarketPoolState.Bench && <VaultSelect onNext={() => onNext()} />}
      {poolInfo?.state === MarketPoolState.Bench && (
        <ActiveMarket
          onNext={() => {
            // setActive(false)
            onNext()
          }}
        />
      )}
    </>
  )
}
