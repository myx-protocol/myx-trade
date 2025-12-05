import { Box } from '@mui/material'
import { Copy } from '@/components/Copy.tsx'
import { getTimeDiff } from '@/utils/date.ts'
import { CoinIcon } from '@/components/UI/CoinIcon'
import { Skeleton } from '@/components/UI/Skeleton'
import { CHAIN_INFO } from '@/config/chainInfo.ts'
import { encryptionAddress } from '@/utils'
import type { Vault } from '@/pages/Earn/type.ts'
import { RatingLevel } from '@/components/Rating.tsx'

export const Token = ({ token }: { token?: Vault }) => {
  return (
    <Box className={'flex items-center gap-[6px]'}>
      <Box className={'relative rounded-full'}>
        {token ? (
          <CoinIcon size={28} icon={token.icon ?? ''} symbol={token.name} />
        ) : (
          <Skeleton className={'rounded-full'} width={28} height={28} />
        )}

        <Box
          className={'absolute right-[-2px] bottom-0 h-[10px] w-[10px] rounded-full bg-[#282C34]'}
        >
          {token ? (
            <CoinIcon size={10} icon={CHAIN_INFO?.[token?.chainId]?.logoUrl ?? ''} />
          ) : (
            <Skeleton className={'rounded-full'} width={10} height={10} />
          )}
        </Box>
      </Box>
      <Box className={'flex flex-col gap-[6px] leading-[1]'}>
        <Box className={'flex items-center gap-[4px]'}>
          {token ? (
            <>
              <h3 className={'text-[14px] font-[500] text-white'}>{token?.name || '--'}</h3>
              <span className={'text-secondary'}>{token?.label || '--'}</span>
              {/*<span*/}
              {/*  className={'bg-brand-10 text-green rounded-[2px] px-[6px] py-[4px] text-[10px]'}*/}
              {/*>*/}
              {/*  {token?.rating}*/}
              {/*</span>*/}
              <RatingLevel rating={token?.rating} />
            </>
          ) : (
            <Skeleton width={93} />
          )}
        </Box>
        <Box className={'flex items-center gap-[6px] text-[12px]'}>
          {token ? (
            <>
              <span className={'text-regular'}> {getTimeDiff(token?.time as number)}</span>
              <Box className={'text-secondary flex items-center gap-[4px]'}>
                <span className={''}>
                  {token?.address ? encryptionAddress(token?.address) : '--'}
                </span>
                <Copy content={token?.address || '--'} />
              </Box>
            </>
          ) : (
            <Skeleton width={123} />
          )}
        </Box>
      </Box>
    </Box>
  )
}
