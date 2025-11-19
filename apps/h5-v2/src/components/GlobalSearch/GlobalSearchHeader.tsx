import Close from '@/components/Icon/set/Close'
import ArrowDown from '@/components/Icon/set/ArrowDown'
import ChainSwitchIcon from '@/assets/images/header/chain-icon.png'
import Search from '@/components/Icon/set/Search'
import { useBoolean, useDebounce, useUpdateEffect } from 'ahooks'
import { t } from '@lingui/core/macro'
import { useRef, useState, useEffect, useCallback } from 'react'
import EditSimply from '@/components/Icon/set/EditSimply'
import clsx from 'clsx'
import { type ChainId, getSupportedChainIdsByEnv } from '@/config/chain'
import { getChainInfo, type BaseChainInfo } from '@/config/chainInfo'
import { HoverCard } from '../UI/HoverCard'
import { useGlobalSearchStore } from './store'
import { useMyxSdkClient } from '@/providers/MyxSdkProvider'
import {
  ChainId as MyxChainId,
  SearchTypeEnum,
  type SearchMarketParams,
  type SearchResultResponse,
} from '@myx-trade/sdk'
import { useWalletConnection } from '@/hooks/wallet/useWalletConnection'
import { appPubSub, tradePubSub } from '@/utils/pubsub'
import { CoinIcon } from '../UI/CoinIcon'
interface GlobalSearchHeaderProps {
  onClose: () => void
}

const CHAIN_LIST: Array<
  BaseChainInfo & {
    chainId: number
  }
> = getSupportedChainIdsByEnv().map((chainId) => {
  return {
    ...getChainInfo(chainId),
    chainId,
  }
})

export const GlobalSearchHeader = ({ onClose }: GlobalSearchHeaderProps) => {
  const { client } = useMyxSdkClient()

  // chain select
  const [chainSelectOpen, setChainSelectOpen] = useState(false)

  const [isFocused, { setTrue: setIsFocusedTrue, setFalse: setIsFocusedFalse }] = useBoolean(false)
  const {
    searchValue,
    setSearchValue,
    searchTab,
    secondSearchTab,
    setSearchResult,
    setSearchLoading,
    addSearchHistory,
  } = useGlobalSearchStore()

  const inputRef = useRef<HTMLInputElement>(null)
  //   chainid select

  const [chainIdSelected, setChainIdSelected] = useState<number | null>(null)

  const debouncedSearchValue = useDebounce(searchValue, {
    wait: 500,
  })

  useUpdateEffect(() => {
    if (debouncedSearchValue.trim()) {
      addSearchHistory(debouncedSearchValue.trim())
    }
  }, [debouncedSearchValue])

  const { isWalletConnected } = useWalletConnection()

  // 用于实现“逻辑取消”：每次发起新请求时递增，旧请求返回时如果 id 不匹配就丢弃结果
  const latestRequestIdRef = useRef(0)

  const searchFunc = useCallback(
    async ({
      chainId,
      searchType,
      searchKey,
      type,
      loading,
    }: SearchMarketParams & {
      loading?: boolean
    }) => {
      if (!client) return null

      // 开始一次新的请求
      const currentId = ++latestRequestIdRef.current

      // 暴露一个 cancel 方法：调用后会让当前请求结果被丢弃
      ;(searchFunc as any).cancel = () => {
        latestRequestIdRef.current++
      }

      if (loading) {
        setSearchLoading(true)
      }

      try {
        const params: SearchMarketParams = {
          chainId: chainId ? (chainId as MyxChainId) : 0,
          searchType,
          searchKey: (searchKey ?? '').trim(),
        }

        if (searchType === SearchTypeEnum.Contract) {
          params.type = type ?? undefined
        }

        let res: SearchResultResponse | null
        if (isWalletConnected) {
          res = await client.markets.searchMarketAuth(params)
        } else {
          res = await client.markets.searchMarket(params)
        }

        // 如果这期间又发起了新的请求，就丢弃本次结果
        if (latestRequestIdRef.current !== currentId) {
          return null
        }

        setSearchResult(res ?? null)
        return res ?? null
      } catch (e) {
        if (latestRequestIdRef.current !== currentId) {
          return null
        }
        setSearchResult(null)
        throw e
      } finally {
        if (latestRequestIdRef.current === currentId && loading) {
          setSearchLoading(false)
        }
      }
    },
    [client, isWalletConnected, setSearchLoading, setSearchResult],
  )

  // 依赖变化时自动发起搜索（支持空 searchKey）
  useEffect(() => {
    if (!client) return
    searchFunc({
      chainId: chainIdSelected ?? 0,
      searchType: searchTab,
      searchKey: debouncedSearchValue,
      type: searchTab === SearchTypeEnum.Contract ? secondSearchTab : undefined,
      loading: true,
    })
  }, [client, chainIdSelected, debouncedSearchValue, searchTab, secondSearchTab, searchFunc])

  // refresh search result when global search update（收藏变更 / SDK 鉴权等）
  useEffect(() => {
    const refreshSearchResult = () => {
      if (!client) return
      searchFunc({
        chainId: chainIdSelected ?? 0,
        searchType: searchTab,
        searchKey: debouncedSearchValue,
        type: searchTab === SearchTypeEnum.Contract ? secondSearchTab : undefined,
        loading: false,
      })
    }
    appPubSub.on('app:sdk:authenticated', refreshSearchResult)
    tradePubSub.on('global:search:update', refreshSearchResult)
    return () => {
      tradePubSub.off('global:search:update', refreshSearchResult)
      appPubSub.off('app:sdk:authenticated', refreshSearchResult)
    }
  }, [client, chainIdSelected, debouncedSearchValue, searchTab, secondSearchTab, searchFunc])

  const handleClear = () => {
    setSearchValue('')
    inputRef.current?.focus()
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value)
  }

  const handleChainIdSelect = (chainId: ChainId) => {
    if (chainIdSelected === chainId) {
      setChainIdSelected(null)
      return
    } else {
      setChainIdSelected(chainId)
    }
    setChainSelectOpen(false)
  }
  return (
    <div className="sticky top-0 left-0 z-10 flex items-center justify-between rounded-t-[16px] bg-[#18191F] px-[16px] pt-[16px] pb-[20px]">
      {/* left */}
      <div className="flex-[1_1_0%] px-[12px] py-[4px]">
        <div className="flex w-full items-center gap-[8px]">
          <Search
            size={16}
            color={isFocused ? '#fff' : '#848E9C'}
            onClick={() => inputRef.current?.focus()}
          />
          <input
            ref={inputRef}
            value={searchValue}
            onChange={handleInputChange}
            placeholder={t`Search for token name/address`}
            onFocus={() => {
              setIsFocusedTrue()
              inputRef.current?.focus()
            }}
            onBlur={() => {
              setIsFocusedFalse()
            }}
            className="flex-1 bg-transparent text-[16px] leading-[1] font-normal text-white caret-[#00E3A5] outline-none placeholder:text-[#6D7180]"
          />
          {/* Clear button - only show when focused and has value */}
          <div
            className={clsx(
              'flex cursor-pointer items-center justify-center gap-[4px] rounded-[9999px] bg-[#202129] px-[6px] py-[4px] opacity-0 select-none',
              {
                'opacity-100': isFocused && searchValue,
              },
            )}
            onClick={handleClear}
          >
            <EditSimply size={12} color="#848E9C" />
            <span className="text-[12px] font-normal text-[#CED1D9]">{t`Clear`}</span>
          </div>
        </div>
      </div>
      {/* right */}
      <div className="flex flex-shrink-0 items-center">
        {/* chain select */}
        <HoverCard
          className="bg-transparent!"
          trigger={
            <div className="flex cursor-pointer items-center gap-[4px] select-none">
              <CoinIcon
                size={17}
                icon={
                  chainIdSelected ? (getChainInfo(chainIdSelected).logoUrl ?? '') : ChainSwitchIcon
                }
              />
              <ArrowDown size={12} color="#fff" />
            </div>
          }
          open={chainSelectOpen}
          onOpenChange={setChainSelectOpen}
        >
          <div className="rounded-[8px] border-[1px] border-[#31333D] bg-[#202129] px-[8px] py-[4px]">
            {CHAIN_LIST.map((chainInfo) => (
              <div
                key={chainInfo.chainId}
                className={clsx(
                  'flex cursor-pointer items-center gap-[12px] rounded-[6px] px-[12px] py-[9px] select-none hover:bg-[#18191F]',
                  {
                    'bg-[#18191F]': chainIdSelected === chainInfo.chainId,
                  },
                )}
                onClick={() => {
                  handleChainIdSelect(chainInfo.chainId)
                }}
              >
                {/* chain logo */}
                <div className="h-[24px] w-[24px] overflow-hidden rounded-[9999px]">
                  <CoinIcon size={24} icon={chainInfo.logoUrl ?? ''} />
                </div>
                {/* chain name */}
                <div className="text-[14px] font-medium text-white">{chainInfo.label}</div>
              </div>
            ))}
          </div>
        </HoverCard>

        {/* split */}
        <div className="mx-[20px] h-[17px] w-[1px] bg-[#31333D] select-none"></div>
        {/* close */}
        <div
          className="flex h-[16px] w-[16px] cursor-pointer items-center justify-center text-[#848E9C] select-none"
          onClick={onClose}
        >
          <Close size={16} />
        </div>
      </div>
    </div>
  )
}
