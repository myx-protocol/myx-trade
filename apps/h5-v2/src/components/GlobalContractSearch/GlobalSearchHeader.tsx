import Close from '@/components/Icon/set/Close'
import ArrowDown from '@/components/Icon/set/ArrowDown'
import ChainSwitchIcon from '@/assets/images/header/chain-icon.png'
import Search from '@/components/Icon/set/Search'
import { useBoolean, useDebounce, useUpdateEffect } from 'ahooks'
import { t } from '@lingui/core/macro'
import { useRef, useState, useEffect, useCallback } from 'react'
import clsx from 'clsx'
import { type ChainId, getSupportedChainIdsByEnv } from '@/config/chain'
import { getChainInfo, type BaseChainInfo } from '@/config/chainInfo'
import { HoverCard } from '../UI/HoverCard'
import { useGlobalContractSearchStore } from './store'
import { useMyxSdkClient } from '@/providers/MyxSdkProvider'
import ClearIcon from '@/components/Icon/set/Clear'
import {
  ChainId as MyxChainId,
  SearchTypeEnum,
  type SearchMarketParams,
  type SearchResultResponse,
} from '@myx-trade/sdk'
import { useWalletConnection } from '@/hooks/wallet/useWalletConnection'
import { appPubSub, tradePubSub } from '@/utils/pubsub'
import { CoinIcon } from '../UI/CoinIcon'
import { CloseIcon } from '../Icon'
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
  const { address } = useWalletConnection()
  const [isFocused, { setTrue: setIsFocusedTrue, setFalse: setIsFocusedFalse }] = useBoolean(false)
  const {
    searchValue,
    setSearchValue,
    searchTab,
    secondSearchTab,
    setSearchResult,
    setSearchLoading,
    addSearchHistory,
    searchChainId,
  } = useGlobalContractSearchStore()

  const inputRef = useRef<HTMLInputElement>(null)

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
          res = await client.markets.searchMarketAuth(params, address ?? '')
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
      chainId: searchChainId ?? 0,
      searchType: searchTab,
      searchKey: debouncedSearchValue,
      type: searchTab === SearchTypeEnum.Contract ? secondSearchTab : undefined,
      loading: true,
    })
  }, [client, searchChainId, debouncedSearchValue, searchTab, secondSearchTab, searchFunc])

  // refresh search result when global search update（收藏变更 / SDK 鉴权等）
  useEffect(() => {
    const refreshSearchResult = () => {
      if (!client) return
      searchFunc({
        chainId: searchChainId ?? 0,
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
  }, [client, searchChainId, debouncedSearchValue, searchTab, secondSearchTab, searchFunc])

  const handleClear = () => {
    setSearchValue('')
    inputRef.current?.focus()
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value)
  }

  return (
    <div className="px-[16px] pt-[12px]">
      {/* left */}
      <div className="flex-[1_1_0%] rounded-[6px] bg-[#202129] p-[12px]">
        <div className="flex w-full items-center gap-[8px]">
          <Search
            size={12}
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
            className="flex-1 bg-transparent text-[12px] leading-none font-normal text-white caret-[#00E3A5] outline-none placeholder:text-[#848E9C]"
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
            <ClearIcon size={16} color="#848E9C" />
          </div>
        </div>
      </div>
    </div>
  )
}
