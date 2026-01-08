import { Box, IconButton } from '@mui/material'
import { type ReactNode, useCallback, useMemo, useState } from 'react'
import { Next, Prev } from '@/components/Icon'
import { Trans } from '@lingui/react/macro'
import { useQuery } from '@tanstack/react-query'
import { getQuoteAprTop } from '@/request'
import type { QuoteAprTop } from '@/request/lp/type.ts'
import { CHAIN_INFO } from '@/config/chainInfo.ts'
import { useNavigate } from 'react-router-dom'
import { formatNumberPercent } from '@/utils/formatNumber.ts'
import { Skeleton } from '@/components/UI/Skeleton'
import { CoinIcon } from '@/components/UI/CoinIcon'
import { Change } from '@/components/Change.tsx'
import { Swiper, SwiperSlide } from 'swiper/react'
import { decimalToPercent } from '@/utils/number.ts'
import { isSafeNumber } from '@/utils'

type Token = {
  icon: string
  name: string
  label: string
  chainId: number
}
const ITEMS_PER_PAGE = 3

const CardContainer = ({ children }: { children?: ReactNode }) => {
  return (
    <Box
      className={
        'item [&+.item]:border-base flex h-[172px] flex-1 px-[24px] py-[32px] text-white [&+.item]:border-l-1'
      }
    >
      {children}
    </Box>
  )
}
const TokenInfo = ({ token }: { token?: Token }) => {
  return (
    <Box className={'flex items-center gap-[6px]'}>
      <Box className={'relative rounded-full'}>
        {token ? (
          <CoinIcon size={28} icon={token.icon ?? ''} />
        ) : (
          <Skeleton width={28} height={28} />
        )}

        <Box className={'absolute right-[-2px] bottom-0 rounded-full bg-[#282C34]'}>
          {token ? (
            <CoinIcon
              size={10}
              icon={CHAIN_INFO?.[token?.chainId]?.logoUrl ?? ''}
              className={'border-deep overflow-hidden rounded-full border-1'}
            />
          ) : (
            <Skeleton width={10} height={10} />
          )}
        </Box>
      </Box>
      <Box className={'flex flex-col gap-[6px] leading-[1]'}>
        <Box className={'flex items-center gap-[4px]'}>
          {token ? (
            <>
              <h3 className={'text-[14px] font-[700] text-white'}>{token?.name || '--'}</h3>
              <Box
                className={
                  'text-green bg-brand-10 px-[4px] py-[3px] text-[8px] leading-[10px] font-[400]'
                }
              >
                New
              </Box>
            </>
          ) : (
            <Skeleton width={100} />
          )}
        </Box>
        <Box className={'flex items-center gap-[6px] text-[10px]'}>
          {token ? (
            <span className={'text-regular whitespace-nowrap'}>
              <Trans>Low Volatility, Stable Yield</Trans>
            </span>
          ) : (
            <Skeleton width={119} />
          )}
        </Box>
      </Box>
    </Box>
  )
}

const Card = ({ item }: { item?: QuoteAprTop }) => {
  const navigate = useNavigate()
  return (
    <Box
      className={'flex cursor-pointer flex-col justify-between gap-[20px]'}
      onClick={() => {
        if (!item) return
        navigate(`/earn/${item.chainId}/${item.poolId}`)
      }}
    >
      <TokenInfo
        token={
          item
            ? {
                icon: item.tokenIcon,
                name: item.mQuoteBaseSymbol,
                chainId: item.chainId,
                label: item.mQuoteBaseSymbol,
              }
            : undefined
        }
      />
      <Box className={'flex items-end gap-[8px] leading-[1]'}>
        {item ? (
          <>
            <Change className={'text-[18px] font-[700] text-white'} change={item?.apr}>
              {isSafeNumber(item?.apr) ? decimalToPercent(item?.apr) : '--%'}
            </Change>
            <span className={'text-[12px] text-white'}>
              <Trans>24h APR</Trans>
            </span>
          </>
        ) : (
          <Skeleton width={200} />
        )}
      </Box>
    </Box>
  )
}
export const Carousel = () => {
  const { data = [], isLoading } = useQuery({
    queryKey: [{ key: 'QuoteAprTop10' }],
    queryFn: async () => {
      const result = await getQuoteAprTop()
      console.log(result)
      return result?.data || []
    },
  })

  return (
    <Box className="relative mx-auto w-full px-[16px]">
      <h2 className={'mb-[8px] text-[18px] leading-[1] font-[700] text-white'}>
        <Trans>Recommend</Trans>
      </h2>

      <Swiper
        slidesPerView="auto"
        spaceBetween={12}
        // onReachEnd={loadMore}    // 🚀滑到最后自动加载下一页
      >
        {(isLoading ? Array.from({ length: 3 }).fill(null) : data).map((item, index) => (
          <SwiperSlide key={index} className={'flex !w-[193px]'}>
            <Box className={'border-base h-[110px] rounded-[8px] border-1 p-[20px]'}>
              <Card item={item as QuoteAprTop} />
            </Box>
          </SwiperSlide>
        ))}
      </Swiper>
    </Box>
  )
}
