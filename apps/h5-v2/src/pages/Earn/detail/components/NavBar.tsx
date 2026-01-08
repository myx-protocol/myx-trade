import { Box, Rating } from '@mui/material'
import type { ReactNode } from 'react'
import { BackIcon } from '@/components/Icon'
import { useNavigate } from 'react-router-dom'
import { CoinIcon } from '@/components/UI/CoinIcon'
import { CHAIN_INFO } from '@/config/chainInfo.ts'
import Dropdown from '@/components/Icon/set/Dropdown.tsx'

import { RiseFallTextPrecent } from '@/components/RiseFallText/RiseFallTextPrecent.tsx'
import { useGlobalSearchStore } from '@/components/GlobalSearch/store.ts'
import { Mode } from '@/pages/Earn/type.ts'
import { usePoolContext } from '../../hook'
import { RatingLevel } from '@/components/Rating.tsx'
import { formatNumber } from '@/utils/number.ts'

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
                'absolute right-[-2px] bottom-0 aspect-square h-[10px] w-[10px] min-w-[10px] overflow-hidden rounded-full'
              }
            >
              <CoinIcon
                size={10}
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
                ${formatNumber(price, { showUnit: false })}
              </span>

              {quoteLpDetail?.rating && <RatingLevel rating={quoteLpDetail?.rating} />}
            </Box>
          </Box>
        </Box>
        <Box className={'flex items-center justify-end gap-[6px] leading-[1]'}>
          <span className={'text-secondary text-[12px]'}>APR</span>
          <span className={'text-[18px] font-[500]'}>
            <RiseFallTextPrecent value={Number(quoteLpDetail?.apr)} />
          </span>
        </Box>
      </Box>
    </Box>
  )
}
