import { Box } from '@mui/material'
import type { ReactNode } from 'react'
import { BackIcon } from '@/components/Icon'
import { useNavigate } from 'react-router-dom'
import { CoinIcon } from '@/components/UI/CoinIcon'
import { CHAIN_INFO } from '@/config/chainInfo.ts'
import Dropdown from '@/components/Icon/set/Dropdown.tsx'

import { formatNumberPrecision } from '@/utils/formatNumber.ts'
import { COMMON_PRICE_DISPLAY_DECIMALS } from '@/constant/decimals.ts'
import { RiseFallTextPrecent } from '@/components/RiseFallText/RiseFallTextPrecent.tsx'
import { useGlobalSearchStore } from '@/components/GlobalSearch/store.ts'
import { Mode } from '@/pages/Earn/type.ts'
import { usePoolContext } from '../../hook'

export const NavBar = ({ className, children }: { className?: string; children?: ReactNode }) => {
  const navigate = useNavigate()
  const { quoteLpDetail, price, mode } = usePoolContext()
  const { open: openGlobalSearch } = useGlobalSearchStore()
  const onSymbolClick = () => {}
  return (
    <Box
      display={'flex'}
      gap={'12px'}
      className={'text-basic-white w-full px-[16px] py-[12px]'}
      alignItems={'center'}
    >
      <Box className="flex w-full items-center justify-between">
        <Box className={'flex items-center gap-[8px]'}>
          <Box width={'24px'} height={'24px'} onClick={() => navigate(-1)}>
            <BackIcon size={24} />
          </Box>
          <Box className={'relative aspect-square'}>
            <CoinIcon
              icon={quoteLpDetail?.tokenIcon as string}
              size={28}
              symbol={quoteLpDetail?.mQuoteBaseSymbol}
            />

            <Box
              className={
                'absolute right-[-2px] bottom-0 aspect-square h-[8px] w-[8px] min-w-[8px] overflow-hidden rounded-full'
              }
            >
              <CoinIcon
                size={8}
                icon={CHAIN_INFO?.[quoteLpDetail?.chainId as number]?.logoUrl ?? ''}
              />
            </Box>
          </Box>
          <Box className={'flex flex-1 flex-col gap-[4px]'}>
            <Box className={'flex items-center gap-[3px]'}>
              <span className={'text-[18px] leading-[1] font-[700] text-white'}>
                {quoteLpDetail?.mBaseQuoteSymbol}
              </span>

              <Box className={'text-secondary'} onClick={() => openGlobalSearch()}>
                <Dropdown size={10} />
              </Box>
            </Box>
            <Box className={'flex items-center gap-[6px] text-[12px] leading-[1] font-[500]'}>
              <span className={mode === Mode.Rise ? 'text-rise' : 'text-fall'}>
                ${formatNumberPrecision(price, COMMON_PRICE_DISPLAY_DECIMALS)}
              </span>
              <span
                className={'bg-brand-10 text-green rounded-[2px] px-[6px] py-[4px] text-[10px]'}
              >
                {quoteLpDetail?.rating}
              </span>
            </Box>
          </Box>
        </Box>
        <Box className={'flex items-center justify-end gap-[6px] leading-[1]'}>
          <span className={'text-[12px]'}>APR</span>
          <span className={'text-[18px] font-[500]'}>
            <RiseFallTextPrecent value={Number(quoteLpDetail?.apr)} />
          </span>
        </Box>
      </Box>
    </Box>
  )
}
