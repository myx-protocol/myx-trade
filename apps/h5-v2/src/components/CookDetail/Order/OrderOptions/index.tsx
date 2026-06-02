import { EstRate } from '@/components/CookDetail/Order/EstRate.tsx'
import { Box } from '@mui/material'
import { Fee } from '@/pages/Earn/components/Trade/Fee.tsx'

export const OrderOptions = () => {
  return (
    <div>
      {/* Est. Rate */}
      <Box className={'mt-[8px]'}>
        <EstRate />
      </Box>

      {/* fee */}
      <div className="mt-[8px]">
        <Fee />
      </div>
    </div>
  )
}
