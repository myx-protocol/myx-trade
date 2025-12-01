import { encryptionAddress } from '@/utils'
import { Copy } from '@/components/Copy.tsx'
import { Box } from '@mui/material'

export const Address = ({ address, className = '' }: { address: string; className?: string }) => {
  if (address)
    return (
      <Box className={`flex items-center gap-[4px] ${className}`}>
        <span>{encryptionAddress(address)}</span>
        <Copy content={address} />
      </Box>
    )

  return <></>
}
