import { Box, IconButton } from '@mui/material'
import { type ReactNode, useMemo, useState } from 'react'
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
    <Box className={'flex items-center gap-[18px]'}>
      <Box className={'relative rounded-full'}>
        {token ? (
          <CoinIcon size={40} icon={token.icon ?? ''} />
        ) : (
          <Skeleton width={40} height={40} />
        )}

        <Box className={'absolute right-[-10px] bottom-0 rounded-full bg-[#282C34]'}>
          {token ? (
            <CoinIcon size={16} icon={CHAIN_INFO?.[token?.chainId]?.logoUrl ?? ''} />
          ) : (
            <Skeleton width={16} height={20} />
          )}
        </Box>
      </Box>
      <Box className={'flex flex-col gap-[8px] leading-[1]'}>
        <Box className={'flex items-center gap-[8px]'}>
          {token ? (
            <>
              <h3 className={'text-[20px] font-[700] text-white'}>{token?.name || '--'}</h3>
              <Box
                className={
                  'text-green bg-brand-10 px-[4px] py-[3px] text-[10px] leading-[10px] font-[400]'
                }
              >
                New
              </Box>
            </>
          ) : (
            <Skeleton width={209} />
          )}
        </Box>
        <Box className={'flex items-center gap-[6px] text-[12px]'}>
          {token ? (
            <span className={'text-regular'}>
              <Trans>Low Volatility, Stable Yield</Trans>
            </span>
          ) : (
            <Skeleton width={143} />
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
      className={'flex cursor-pointer flex-col justify-between'}
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
      <Box className={'flex items-end gap-[8px] leading-[1] font-[700]'}>
        {item ? (
          <>
            <Change className={'text-[28px] text-white'} change={item?.apr}>
              {formatNumberPercent(item?.apr)}
            </Change>
            <span className={'text-[16px] text-white'}>24h APR</span>
          </>
        ) : (
          <Skeleton width={200} />
        )}
      </Box>
    </Box>
  )
}
export const Carousel = () => {
  const [page, setPage] = useState(0)

  const next = () => setPage((p) => Math.min(p + 1, maxPage - 1))
  const prev = () => setPage((p) => Math.max(p - 1, 0))

  const { data = [], isLoading } = useQuery({
    queryKey: [{ key: 'QuoteAprTop10' }],
    queryFn: async () => {
      const result = await getQuoteAprTop()
      console.log(result)
      return result?.data || []
    },
  })

  const maxPage = useMemo(() => {
    if (isLoading) {
      return 1
    }
    return Math.ceil(data.length / ITEMS_PER_PAGE)
  }, [data, isLoading])

  const Data = useMemo(() => {
    const arr = Array.from({ length: ITEMS_PER_PAGE }).fill(null)
    if (!data || !data.length) {
      /* empty */
    } else {
      arr.splice(0, data.length, ...data)
    }

    return arr
  }, [data])

  return (
    <Box className="relative mx-auto w-full">
      <Box className="relative w-full overflow-hidden">
        <Box
          className="flex transition-transform duration-500 ease-in-out"
          sx={{ transform: `translateX(-${page * 100}%)` }}
        >
          {Array.from({ length: maxPage }).map((_, i) => (
            <Box key={i} className="border-base flex w-full flex-shrink-0 rounded-[16px] border-1">
              {Data.slice(i * ITEMS_PER_PAGE, i * ITEMS_PER_PAGE + ITEMS_PER_PAGE).map(
                (_item, j) => (
                  <CardContainer key={`${i}${j}`}>
                    <Card item={_item as QuoteAprTop} />
                  </CardContainer>
                ),
              )}
            </Box>
          ))}
        </Box>
      </Box>

      {isLoading ? (
        <></>
      ) : (
        <>
          <IconButton
            onClick={prev}
            disabled={isLoading}
            className="!border-base !text-secondary !absolute top-[70px] left-[-44px] !border-1 bg-black/40 hover:bg-black/60"
          >
            <Prev size={14} />
          </IconButton>

          <IconButton
            onClick={next}
            disabled={isLoading}
            className="!border-base !text-dark-border !absolute top-[70px] right-[-44px] !border-1 bg-black/40 hover:bg-black/60"
          >
            <Next size={14} />
          </IconButton>
        </>
      )}
    </Box>
  )
}
