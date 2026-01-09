import type { ReactNode } from 'react'
import { useWalletConnection } from '@/hooks/wallet/useWalletConnection.ts'
import { Box, Button } from '@mui/material'
import { Empty } from '@/components/Empty.tsx'
import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'

export const ConnectWallet = ({ children }: { children: ReactNode }) => {
  const { address, isWalletConnected, setLoginModalOpen } = useWalletConnection()
  if (address && isWalletConnected) {
    return children
  }
  return (
    <Box className={'flex w-full flex-col items-center justify-center gap-[16px] py-[80px]'}>
      <Empty emptyText={t`Get Started to view`} className={'py-[0px]'} />

      <Button
        variant="contained"
        className={'h-[36px] w-[165px] !rounded-[40px] !bg-[#008C66] !text-white'}
        onClick={() => setLoginModalOpen(true)}
      >
        <Trans>Connect wallet</Trans>
      </Button>
    </Box>
  )
}
