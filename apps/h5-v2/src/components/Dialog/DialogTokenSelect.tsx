import React, { memo, useCallback, useMemo, useRef, useState } from 'react'
import { DialogTheme, DialogTitleTheme } from '@/components/DialogBase'
import { Trans } from '@lingui/react/macro'
import { DialogSuspense } from '@/components/Loading'
import { Box } from '@mui/material'
import { Search } from '../Search'
import { t } from '@lingui/core/macro'
import { Tag } from '../Tag'
import { useQuery } from '@tanstack/react-query'
import { useWalletConnection } from '@/hooks/wallet/useWalletConnection.ts'
import { ChainId, getSupportedChainIdsByEnv, PROD_ENV_CHAIN_IDS } from '@/config/chain.ts'
import {
  getMarketDataSearch,
  getMarketPoolStateData,
  type MarketDataFastSearchParams,
} from '@/request'
import { Skeleton } from '@/components/UI/Skeleton'
import { CHAIN_INFO } from '@/config/chainInfo.ts'
import { encryptionAddress, isSafeNumber } from '@/utils'
import { formatNumber } from '@/utils/number.ts'
import { CoinIcon } from '../UI/CoinIcon'
import { Empty } from '@/components/Empty.tsx'
import { type Asset, useWalletPortfolio } from '@/hooks/useWalletPortfolio'
import { useDebounceValue } from 'usehooks-ts'
import { detectInputType } from '@/utils/symbol.ts'
import { isSupportedChainId } from '@/pages/Market/untils'
import type { MarketPoolStateData } from '@/request/lp/type.ts'
import { MarketPoolState } from '@myx-trade/sdk'
import Big from 'big.js'
import ChainSelector from '@/components/ChainSelector.tsx'
import { NATIVE_TOKEN } from '@/constant/token.ts'
import { isProdMode } from '@/utils/env.ts'
import { isCookState } from '@/utils/cook.ts'

interface TokenItemProps {
  // disabled?: boolean
  asset?: Asset
  onSelected?: (asset: Asset) => void
  // children?: ReactNode
  state?: MarketPoolState | null
}
type MarketStateKey = `${ChainId}-0x${string}`
type MarketStateMap = Record<MarketStateKey, MarketPoolStateData>

const style = {
  '.MuiPaper-root': {
    maxWidth: '390px',
    minHeight: '433px',
    overflow: 'hidden',
  },
}
const disabled = false
const TokenItem = ({ state, asset, onSelected }: TokenItemProps) => {
  const active = useMemo(() => {
    return (
      isCookState(state as number) ||
      state === MarketPoolState.Trench ||
      state === MarketPoolState.Primed ||
      state === MarketPoolState.PreBench
    )
  }, [state])

  const inactive = useMemo(() => {
    return state === MarketPoolState.Bench
  }, [state])

  const uncreate = useMemo(() => {
    return state === null || state === undefined
  }, [state])
  return (
    <Box
      className={`hover:bg-base mx-[-8px] flex items-center justify-between gap-[10px] rounded-[6px] px-[8px] py-[12px] ${disabled ? 'cursor-not-allowed opacity-[0.35]' : 'cursor-pointer'}`}
      onClick={() => {
        if (!disabled) {
          onSelected?.(asset as Asset)
        }
      }}
    >
      <Box className="flex flex-1 items-center gap-[10px]">
        <Box className={'relative rounded-full'}>
          {asset ? (
            <CoinIcon icon={asset.logo} size={32} symbol={asset.symbol} />
          ) : (
            <Skeleton width={32} height={32} />
          )}

          <Box className={'absolute right-[-6px] bottom-0 z-[1] rounded-full'}>
            {asset ? (
              <CoinIcon icon={CHAIN_INFO?.[asset?.chainId]?.logoUrl ?? ''} size={12} />
            ) : (
              <Skeleton width={12} height={12} />
            )}
          </Box>
        </Box>
        <Box className={'flex flex-1 flex-col gap-[4px]'}>
          <Box className={'flex items-center gap-[6px]'}>
            {asset ? (
              <>
                <span
                  className={'max-w-[10em] truncate text-[14px] leading-[1] font-[500] text-white'}
                >
                  {asset.symbol}
                </span>

                <Tag type={disabled ? 'disabled' : 'primary'}>
                  {inactive && <Trans>Inactive</Trans>}
                  {active && <Trans>Active</Trans>}
                  {uncreate && <Trans>Not Created</Trans>}
                </Tag>
              </>
            ) : (
              <Skeleton width={120} height={24} />
            )}
          </Box>
          <Box className={'text-secondary flex gap-[6px] text-[12px] leading-[1]'}>
            {asset ? (
              <>
                <span className={'max-w-[10em] truncate'}>{asset.name}</span>
                <span>{encryptionAddress(asset.address)}</span>
              </>
            ) : (
              <>
                <Skeleton width={100} />
                <Skeleton width={100} />
              </>
            )}
          </Box>
        </Box>
      </Box>
      <Box className={'flex flex-shrink-0 flex-col items-end gap-[6px] text-right leading-[1]'}>
        <Box className={'text-[14px] font-[500] text-white'}>
          {asset?.balance ? formatNumber(asset?.balance) : <Skeleton width={60} />}
        </Box>
        <Box className={'text-secondary text-[12px] font-[500]'}>
          {isSafeNumber(asset?.price) && asset?.balance ? (
            `$${formatNumber(new Big(asset?.price || '0').mul(new Big(asset.balance)), { showUnit: false })}`
          ) : (
            <Skeleton width={50} />
          )}
        </Box>
      </Box>
    </Box>
  )
}

const TokenSelectDialogContent = ({ onSelected }: { onSelected: (asset: Asset) => void }) => {
  const { address: account, isWalletConnected } = useWalletConnection()
  const { walletAssets, isLoading, chainId, setChainId } = useWalletPortfolio()
  const [input, setInput] = useState('')
  const searchRef = useRef<HTMLInputElement>(null)

  const [keyword] = useDebounceValue(input, 2000)

  const { data: searchList = [], isLoading: isSearching } = useQuery({
    queryKey: [{ key: 'getAssetsSearch' }, chainId, keyword],
    enabled: !!keyword,
    queryFn: async () => {
      try {
        if (!keyword) return [] as Asset[]
        const type = detectInputType(keyword)

        if (type === 'unknown') return [] as Asset[]

        const params: MarketDataFastSearchParams = {
          chains:
            chainId === undefined
              ? ((isProdMode()
                  ? getSupportedChainIdsByEnv()
                  : PROD_ENV_CHAIN_IDS) as unknown as number[])
              : [chainId],
          input: keyword,
        }
        const result = await getMarketDataSearch(params)
        if (result.data) {
          console.log(result.data)
          const apiResults = result.data || []
          const uniqueResults = Array.from(
            new Map(apiResults.map((item: any) => [item.address.toLowerCase(), item])).values(),
          )
          return uniqueResults
            .filter((item: any) => item.address !== NATIVE_TOKEN)
            ?.map((item: any) => {
              const token = {
                chainId: Number(item.chainId.replace('evm:', '')),
                address: item.address,
                decimals: item.decimals,
                logo: item.logo,
                name: item.name,
                symbol: item.symbol,
                price: item.priceTokenString,
                change: item.priceChange24hPercentage,
                balance: '',
                mca: item.marketCapUSD,
                liq: item.liquidityUSD,
              } as Asset

              return token
            })
            .filter(
              (item: Asset) =>
                (isProdMode() ? isSupportedChainId(item.chainId) : true) &&
                (!chainId ? true : item.chainId === chainId),
            )
        }

        return [] as Asset[]
      } catch (e) {
        console.error(e)
        return [] as Asset[]
      }
    },
  })

  const { data: marketStateMap } = useQuery({
    queryKey: [{ key: 'searchMarketStateData' }, account, keyword, searchList, walletAssets],
    enabled: !!account,
    queryFn: async () => {
      try {
        const map = {} as MarketStateMap
        const list = keyword ? searchList : walletAssets
        if (!list || list?.length === 0) return map

        const result = await getMarketPoolStateData(
          list.map((token: { chainId: number; address: string }) => {
            return {
              chainId: token.chainId,
              baseToken: token.address,
            }
          }),
        )

        if (!result?.data) {
          return undefined
        }

        return (result?.data || []).reduce((prev, curr) => {
          prev[`${curr.chainId}-${curr.baseToken}` as MarketStateKey] = curr
          return prev
        }, {} as MarketStateMap)
      } catch (e) {
        console.error(e)
        return {} as MarketStateMap
      }
    },
  })

  const onSearch = useCallback(
    (value: string) => {
      setInput(value.trimStart().trimEnd())
    },
    [input, setInput],
  )
  const onBlur = () => {}

  const getTokenState = (asset: Asset) => {
    if (!asset) {
      return undefined
    }
    console.log(marketStateMap)
    return marketStateMap && marketStateMap?.[`${asset.chainId}-${asset.address}` as MarketStateKey]
      ? marketStateMap?.[`${asset.chainId}-${asset.address}` as MarketStateKey]?.state
      : undefined
  }

  return (
    <Box className={'scroll-y-auto flex-1'}>
      <Box
        className={
          'bg-base-bg sticky top-[0] z-[10] flex w-full items-center gap-[4px] px-[16px] py-[12px]'
        }
      >
        <Search
          isRounded={false}
          ref={searchRef}
          autoFocus={true}
          value={input}
          onChange={onSearch}
          onBlur={onBlur}
          placeholder={t`Search name or paste address`}
          className={'!bg-base'}
        >
          <ChainSelector
            className={'ml-[-12px]'}
            value={chainId || null}
            onChange={(id) => setChainId(id as ChainId)}
            showLabelText={false}
          />
        </Search>
      </Box>
      <Box className={'px-[16px] pb-[12px]'}>
        {!!input && (
          <>
            <Box className={'text-secondary mb-[4px] text-[14px] leading-[1] font-[500]'}>
              <Trans>搜索结果</Trans>
            </Box>

            {(searchList || []).map((asset: Asset, index: number) => {
              return (
                <TokenItem
                  key={index}
                  asset={{
                    ...asset,
                    balance: walletAssets?.length
                      ? walletAssets.find(
                          (_asset: { address: string }) => _asset.address === asset.address,
                        )?.balance
                      : '',
                  }}
                  state={getTokenState(asset)}
                  onSelected={onSelected}
                />
              )
            })}
            {!isSearching && searchList?.length === 0 && <Empty />}
          </>
        )}
        {!input && (
          <>
            <Box className={'text-secondary mb-[4px] text-[14px] leading-[1] font-[500]'}>
              <Trans>My Tokens</Trans>
            </Box>

            {(isLoading ? Array.from({ length: 3 }) : walletAssets || []).map(
              (asset: Asset, index: number) => {
                return (
                  <TokenItem
                    key={index}
                    asset={asset}
                    onSelected={onSelected}
                    state={getTokenState(asset)}
                  />
                )
              },
            )}
            {(!isWalletConnected || (!isLoading && walletAssets?.length === 0)) && <Empty />}
          </>
        )}
      </Box>
    </Box>
  )
}

export const DialogTokenSelect = memo(
  ({
    open,
    onClose,
  }: {
    open: boolean
    onClose?: (e?: React.ReactNode, asset?: Asset) => void
  }) => {
    return (
      <DialogTheme onClose={() => onClose?.()} open={open} sx={style}>
        <DialogTitleTheme onClose={onClose}>
          <Trans>Select a Token</Trans>
        </DialogTitleTheme>

        <DialogSuspense>
          <TokenSelectDialogContent onSelected={(asset?: Asset) => onClose?.(undefined, asset)} />
        </DialogSuspense>
      </DialogTheme>
    )
  },
)
