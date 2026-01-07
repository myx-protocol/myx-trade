import React, { memo, type ReactNode, useCallback, useMemo, useRef, useState } from 'react'
import { DialogTheme, DialogTitleTheme } from '@/components/DialogBase'
import { Trans } from '@lingui/react/macro'
import { DialogSuspense } from '@/components/Loading'
import { Box } from '@mui/material'
import { Search } from '../Search'
import { t } from '@lingui/core/macro'
import { Tag } from '../Tag'
import { useQuery } from '@tanstack/react-query'
import { useWalletConnection } from '@/hooks/wallet/useWalletConnection.ts'
import { ChainId } from '@/config/chain.ts'
import { getMarketData, getMarketPoolStateData, type MarketDataSearchParams } from '@/request'
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

const TokenItem = ({ state, asset, onSelected }: TokenItemProps) => {
  const disabled = useMemo(() => {
    return (
      state === MarketPoolState.Cook ||
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
      className={`flex items-center justify-between gap-[10px] rounded-[6px] py-[12px] ${disabled ? 'cursor-not-allowed opacity-[0.35]' : 'cursor-pointer'}`}
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
                <span className={'text-[14px] leading-[1] font-[500] text-white'}>
                  {asset.symbol}
                </span>

                <Tag type={disabled ? 'disabled' : 'primary'}>
                  {inactive && <Trans>Inactive</Trans>}
                  {disabled && <Trans>Active</Trans>}
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
                <span>{asset.name}</span>
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

  const [keyword] = useDebounceValue(input, 500)

  // 用户停止输入 400ms 后才更新

  const { data: searchList = [], isLoading: isSearching } = useQuery({
    queryKey: [{ key: 'getAssetsSearch' }, chainId, keyword],
    enabled: !!keyword,
    queryFn: async () => {
      if (!keyword) return [] as Asset[]
      const type = detectInputType(keyword)

      if (type === 'unknown') return [] as Asset[]

      let params: MarketDataSearchParams
      if (type === 'symbol') {
        params = { chainId: chainId, symbol: keyword }
      } else {
        params = { chainId: chainId, asset: keyword }
      }
      const result = await getMarketData(params)
      if (result.data) {
        console.log(result.data)
        return (result.data?.contracts || [])
          .filter((item: any) => isSupportedChainId(item?.blockchainId))
          ?.map((item: any) => {
            /*   {
           "id": 59313,
           "name": "MYX Finance",
           "symbol": "MYX",
           "decimals": 18,
           "logo": "https://metadata.mobula.io/assets/logos/27381cfaedc7961f07aa99f3d27af167278263841e303637b6e23d516d9d3505.png",
           "rank": 190,
           "price": 2.500862957159864,
           "market_cap": 477101305.367397,
           "market_cap_diluted": 2500862957.15986,
           "volume": 1457570.310834008,
           "volume_change_24h": 0,
           "volume_7d": 0,
           "liquidity": 614460.2365173926,
           "liquidityMax": 614460.2365173926,
           "ath": 2.536288278998393,
           "atl": 2.500862957159864,
           "off_chain_volume": 31914988,
           "is_listed": true,
           "price_change_1h": -0.2777187708955553,
           "price_change_24h": -4.439836272199036,
           "price_change_7d": 0.1185800264169198,
           "price_change_1m": -4.087638311756054,
           "price_change_1y": 0,
           "total_supply": 1000000000,
           "circulating_supply": 190774670,
           "contracts": [
           {
             "address": "0xd82544bf0dfe8385ef8fa34d67e6e4940cc63e16",
             "blockchainId": "56",
             "blockchain": "BNB Smart Chain (BEP20)",
             "decimals": 18
           }
         ],
           "native": {
           "name": "BNB",
             "symbol": "BNB",
             "address": "0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c",
             "type": "native",
             "decimals": 18,
             "logo": "https://coin-images.coingecko.com/coins/images/825/large/bnb-icon2_2x.png?1696501970"
         }
         }*/
            const token = {
              chainId: +item.blockchainId,
              address: item.address,
              decimals: item.decimals,
              logo: result.data.logo,
              name: result.data.name,
              symbol: result.data.symbol,
              price: result.data.price,
              change: result.data.price_change_24h,
              balance: '',
              mca: result.data.market_cap,
              liq: result.data.liquidity,
            } as Asset

            return token
          })
      }

      return [] as Asset[]
    },
  })

  const { data: marketStateMap } = useQuery({
    queryKey: [{ key: 'searchMarketStateData' }, account, keyword, searchList, walletAssets],
    enabled: !!account,
    queryFn: async () => {
      const map = {} as MarketStateMap
      const list = keyword ? searchList : walletAssets
      if (!list || list.length === 0) return map
      const result = await getMarketPoolStateData(
        list.map((token: { chainId: number; address: string }) => {
          return {
            chainId: token.chainId,
            address: token.address,
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
    return marketStateMap
      ? marketStateMap?.[`${asset.chainId}-${asset.address}` as MarketStateKey]?.state || null
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
        >
          <ChainSelector
            value={chainId || null}
            onChange={(id) => setChainId(id as ChainId)}
            showLabelText={false}
          />
        </Search>
      </Box>
      <Box className={'px-[16px]'}>
        {!!input && (
          <>
            <Box className={'text-secondary text-[14px] leading-[1] font-[500]'}>
              <Trans>搜索结果</Trans>
            </Box>

            {(searchList || []).map((asset: Asset, index: number) => {
              return (
                <TokenItem
                  key={index}
                  asset={{
                    ...asset,
                    balance: walletAssets.length
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
            <Box className={'text-secondary text-[14px] leading-[1] font-[500]'}>
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
