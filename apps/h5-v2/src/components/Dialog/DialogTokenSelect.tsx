import React, { memo, type ReactNode, useCallback, useMemo, useRef, useState } from 'react'
import { DialogTheme, DialogTitleTheme } from '@/components/DialogBase'
import { Trans } from '@lingui/react/macro'
import { DialogSuspense } from '@/components/Loading'
import { Box, IconButton, MenuItem } from '@mui/material'
import { Search } from '../Search'
import { t } from '@lingui/core/macro'
import { Tag } from '../Tag'
import { ArrowDown } from '@/components/Icon'
import { StyledMenu } from '@/components/Menu.tsx'
import { useQuery } from '@tanstack/react-query'
import { useWalletConnection } from '@/hooks/wallet/useWalletConnection.ts'
import { ChainId, getSupportedChainIdsByEnv } from '@/config/chain.ts'
import { getMarketData, getMarketPoolStateData, type MarketDataSearchParams } from '@/request'
import { Skeleton } from '@/components/UI/Skeleton'
import { CHAIN_INFO } from '@/config/chainInfo.ts'
import { encryptionAddress } from '@/utils'
import { formatNumberPrecision } from '@/utils/formatNumber.ts'
import { formatNumber } from '@/utils/number.ts'
import { COMMON_PRICE_DISPLAY_DECIMALS } from '@/constant/decimals.ts'
import { CoinIcon } from '../UI/CoinIcon'
import { Empty } from '@/components/Empty.tsx'
import { type Asset, useWalletPortfolio } from '@/hooks/useWalletPortfolio'
import { useDebounceValue } from 'usehooks-ts'
import { detectInputType } from '@/utils/symbol.ts'
import { isSupportedChainId } from '@/pages/Market/untils'
import type { MarketPoolStateData } from '@/request/lp/type.ts'
import { MarketPoolState } from '@myx-trade/sdk'

interface TokenItemProps {
  // disabled?: boolean
  asset?: Asset
  onSelected?: (asset: Asset) => void
  // children?: ReactNode
  state?: MarketPoolState | null
}
type MarketStateKey = `${ChainId}-0x${string}`
type MarketStateMap = Record<MarketStateKey, MarketPoolStateData>

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
    return state === null
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
                {state !== undefined && (
                  <Tag type={disabled ? 'disabled' : 'primary'}>
                    {inactive && <Trans>Inactive</Trans>}
                    {disabled && <Trans>Active</Trans>}
                    {uncreate && <Trans>Not Created</Trans>}
                  </Tag>
                )}
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
          {asset ? (
            `$${formatNumberPrecision(asset.price, COMMON_PRICE_DISPLAY_DECIMALS)}`
          ) : (
            <Skeleton width={50} />
          )}
        </Box>
      </Box>
    </Box>
  )
}
interface ChainSelectProps<T> {
  value?: T | null
  options: { label: string; value: T; icon?: string }[]
  onChange?: (value: T | null) => void
}
const options = getSupportedChainIdsByEnv().map((_chainId) => {
  const { logoUrl, label } = CHAIN_INFO[_chainId]
  return {
    icon: logoUrl,
    label,
    value: _chainId,
  }
})

const ChainSelector = ({ value = null, onChange, options = [] }: ChainSelectProps<number>) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)
  const chainIds = getSupportedChainIdsByEnv()

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }
  const handleClose = () => {
    setAnchorEl(null)
  }
  const handleChange = (_value: number) => {
    onChange?.(_value)
    handleClose()
  }
  const chains = useMemo(() => {
    const arr = Array.from({ length: 4 }).fill(null)
    if (!chainIds || !chainIds.length) {
      /* empty */
    } else {
      arr.splice(0, chainIds.length, ...chainIds)
    }

    return arr
  }, [chainIds])

  return (
    <Box className={'flex items-center gap-[4px] pr-[12px]'}>
      <Box className={'grid h-[18px] w-[18px] grid-cols-2 grid-rows-2 gap-[2px]'}>
        {value === null || value === undefined ? (
          <>
            {(chains as ChainId[]).map((item: ChainId, i: number) => {
              return (
                <Box key={i} className={'bg-base-bg rounded-[2px]'}>
                  <CoinIcon size={8} icon={CHAIN_INFO?.[item]?.logoUrl ?? ''} />
                </Box>
              )
            })}
          </>
        ) : (
          <Box className={'bg-base-bg h-[18px] w-[18px] rounded-full'}>
            <CoinIcon size={18} icon={CHAIN_INFO?.[value]?.logoUrl ?? ''} />
          </Box>
        )}
      </Box>
      <IconButton
        id="basic-button"
        aria-controls={open ? 'basic-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onClick={handleClick}
      >
        <ArrowDown size={12} className={'text-white'} />
      </IconButton>
      <StyledMenu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        slotProps={{
          list: {
            'aria-labelledby': 'basic-button',
          },
        }}
      >
        {options.map((option, index) => {
          return (
            <MenuItem
              className={'!hover:bg-base-bg'}
              key={option.value}
              onClick={() => handleChange(option.value)}
              disableRipple
            >
              <CoinIcon
                size={24}
                icon={CHAIN_INFO?.[option.value]?.logoUrl ?? ''}
                symbol={CHAIN_INFO?.[option.value]?.chainSymbol}
              />
              <span>{option.label}</span>
            </MenuItem>
          )
        })}
      </StyledMenu>
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
            options={options}
            onChange={(id) => setChainId(id as ChainId)}
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
      <DialogTheme
        onClose={() => onClose?.()}
        open={open}
        sx={{
          '.MuiPaper-root': {
            maxWidth: '390px',
            minHeight: '433px',
            overflow: 'hidden',
          },
        }}
      >
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
