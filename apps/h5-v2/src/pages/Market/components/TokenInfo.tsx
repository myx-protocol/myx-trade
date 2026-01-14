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
      <Box className={'relative h-[32px] w-[32px] min-w-[32px] rounded-full'}>
        <PairLogo
          baseLogoSize={32}
          quoteLogoSize={12}
          baseLogo={token?.logo ?? ''}
          quoteLogo={CHAIN_INFO?.[token?.chainId as keyof typeof CHAIN_INFO]?.logoUrl ?? ''}
          baseSymbol={token?.name ?? ''}
        />
      </Box>
      <Box className={'flex flex-col gap-[6px] leading-[1]'}>
        <Box className={'flex items-center gap-[4px] leading-[1]'}>
          <h3 className={'text-[14px] font-[700] text-white'}>{token?.symbol || '--'}</h3>
          <span className={'text-secondary max-w-[20em] truncate text-[12px]'}>
            {token?.name || '--'}
          </span>
        </Box>
        <Box className={'text-secondary flex items-center gap-[4px] text-[12px]'}>
          <span className={''}>{token?.address ? encryptionAddress(token?.address) : '--'}</span>
          <Copy content={token?.address || '--'} />
        </Box>
      </Box>
    </Box>
  )
}
