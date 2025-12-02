import { Trans } from '@lingui/react/macro'
import { EstRate } from '@/components/CookDetail/Order/EstRate.tsx'
import { Box } from '@mui/material'

import { useCookOrderStore } from '@/components/CookDetail/Order/store.ts'
import { PriceImpact } from '@/pages/Earn/components/Trade/PriceImpact.tsx'
import { Fee } from '@/pages/Earn/components/Trade/Fee.tsx'

export const OrderOptions = () => {
  const { slippage, setSlippage } = useCookOrderStore()
  return (
    <div>
      {/* Est. Rate */}
      <Box className={'mt-[8px]'}>
        <EstRate />
      </Box>

      {/* Price Impact */}
      <Box className={'mt-[8px]'}>
        <PriceImpact slippage={slippage} setSlippage={setSlippage} />
      </Box>

      {/* fee */}
      <div className="mt-[8px]">
        <Fee />
      </div>
    </div>
  )
}
