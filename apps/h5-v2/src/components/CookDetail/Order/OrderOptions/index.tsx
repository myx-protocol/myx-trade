import { Trans } from '@lingui/react/macro'
import { EstRate } from '@/components/CookDetail/Order/EstRate.tsx'
import { Box } from '@mui/material'

import { useCookOrderStore } from '@/components/CookDetail/Order/store.ts'
import { PriceImpact } from '@/pages/Earn/components/Trade/PriceImpact.tsx'

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
      <div className="mt-[8px] flex items-center justify-between text-[12px] font-normal text-white">
        <div className="flex items-center text-[#848E9C]">
          <p className="border-b-[1px] border-dashed border-b-[#848E9C]">
            <Trans>Fee</Trans>
          </p>
        </div>

        <div className="flex items-center">
          {/* Free forever */}
          <p className="rounded-[9999px] border-[1px] border-[#00E3A5] bg-[rgba(0,227,165,0.1)] px-[8px] py-[4px] text-[10px] font-medium text-[#00E3A5]">
            <Trans>Free forever</Trans>
          </p>
        </div>
      </div>
    </div>
  )
}
