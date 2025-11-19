import Box from '@mui/material/Box'
import { Copy } from '@/components/Copy.tsx'
import { useContext } from 'react'
import { TokenContext } from '@/pages/Market/context.ts'
import { CHAIN_INFO } from '@/config/chainInfo.ts'
import { encryptionAddress } from '@/utils'
import { PairLogo } from '@/components/UI/PairLogo'

export const TokenInfo = () => {
  const { token } = useContext(TokenContext)
  return (
    <Box className={'flex items-center gap-[10px]'}>
      <Box className={'relative h-[48px] w-[48px] min-w-[48px] rounded-full'}>
        <PairLogo
          baseLogoSize={48}
          quoteLogoSize={16}
          baseLogo={token?.icon ?? ''}
          quoteLogo={CHAIN_INFO?.[token?.chainId as keyof typeof CHAIN_INFO]?.logoUrl ?? ''}
          baseSymbol={token?.name ?? ''}
        />
      </Box>
      <Box className={'flex flex-col gap-[6px] leading-[1]'}>
        <Box className={'flex items-center gap-[4px]'}>
          <h3 className={'text-[20px] font-[700] text-white'}>{token?.name || '--'}</h3>
          <span className={''}>{token?.symbol || '--'}</span>
        </Box>
        <Box className={'flex items-center gap-[4px]'}>
          <span className={''}>{token?.address ? encryptionAddress(token?.address) : '--'}</span>
          <Copy content={token?.address || '--'} />
        </Box>
      </Box>
    </Box>
  )
}
