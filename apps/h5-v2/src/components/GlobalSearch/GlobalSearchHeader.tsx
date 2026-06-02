import Close from '@/components/Icon/set/Close'
import Search from '@/components/Icon/set/Search'
import { useBoolean, useDebounce, useUpdateEffect } from 'ahooks'
import { t } from '@lingui/core/macro'
import { useRef, useEffect, useCallback } from 'react'
import EditSimply from '@/components/Icon/set/EditSimply'
import clsx from 'clsx'
import { useGlobalSearchStore } from './store'
import { useMyxSdkClient } from '@/providers/MyxSdkProvider'
import {
  ChainId as MyxChainId,
  SearchTypeEnum,
  type SearchMarketParams,
  type SearchResultResponse,
} from '@myx-trade/sdk'
import { useWalletConnection } from '@/hooks/wallet/useWalletConnection'
import { globalSearchPubSub, tradePubSub } from '@/utils/pubsub'

interface GlobalSearchHeaderProps {
  onClose: () => void
}

export const GlobalSearchHeader = ({ onClose }: GlobalSearchHeaderProps) => {
  const { client, clientIsAuthenticated } = useMyxSdkClient()

  const [isFocused, { setTrue: setIsFocusedTrue, setFalse: setIsFocusedFalse }] = useBoolean(false)
  const {
    searchValue,
    setSearchValue,
    searchTab,
    secondSearchTab,
    searchChainId,
    setSearchResult,
    setSearchLoading,
    addSearchHistory,
    setSearchTab,
  } = useGlobalSearchStore()

  const inputRef = useRef<HTMLInputElement>(null)

  const debouncedSearchValue = useDebounce(searchValue, {
    wait: 500,
  })

  useUpdateEffect(() => {
    if (debouncedSearchValue.trim()) {
      addSearchHistory(debouncedSearchValue.trim())
    }
  }, [debouncedSearchValue])

  const { isWalletConnected, address } = useWalletConnection()

  const latestRequestIdRef = useRef(0)
  const latestSearchKeywordRef = useRef<string | null>(null)

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

      const currentId = ++latestRequestIdRef.current

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
          res = await client.markets.searchMarketAuth(params, address as string)
        } else {
          res = await client.markets.searchMarket(params)
        }

        if (latestRequestIdRef.current !== currentId) {
          return null
        }

        if (searchKey !== latestSearchKeywordRef.current) {
          if (searchKey) {
            setSearchTab(SearchTypeEnum.All)
          } else if (searchType === SearchTypeEnum.All) {
            setSearchTab(SearchTypeEnum.Contract)
          }
          latestSearchKeywordRef.current = searchKey ?? null
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
    [client, isWalletConnected, setSearchLoading, setSearchResult, address],
  )

  useEffect(() => {
    if (!client) return
    searchFunc({
      chainId: searchChainId ?? 0,
      searchType: searchTab,
      searchKey: debouncedSearchValue,
      type:
        searchTab === SearchTypeEnum.Contract && secondSearchTab !== 'all'
          ? secondSearchTab
          : undefined,
      loading: true,
    })
  }, [client, searchChainId, debouncedSearchValue, searchTab, secondSearchTab, searchFunc])

  useEffect(() => {
    const refreshSearchResult = () => {
      if (!client) return
      searchFunc({
        chainId: searchChainId ?? 0,
        searchType: searchTab,
        searchKey: debouncedSearchValue,
        type:
          searchTab === SearchTypeEnum.Contract && secondSearchTab !== 'all'
            ? secondSearchTab
            : undefined,
        loading: false,
      })
    }
    tradePubSub.on('global:search:update', refreshSearchResult)
    return () => {
      tradePubSub.off('global:search:update', refreshSearchResult)
    }
  }, [
    client,
    searchChainId,
    debouncedSearchValue,
    searchTab,
    secondSearchTab,
    clientIsAuthenticated,
    searchFunc,
  ])

  useEffect(() => {
    const onFocusFunc = () => {
      if (inputRef.current) {
        inputRef.current.focus()
      }
    }
    globalSearchPubSub.on('global:search:focus', onFocusFunc)
    return () => {
      globalSearchPubSub.off('global:search:focus', onFocusFunc)
    }
  }, [])

  const handleClear = () => {
    setSearchValue('')
    inputRef.current?.focus()
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value)
  }

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault()
    }
  }

  return (
    <div className="sticky top-0 left-0 z-10 flex items-center justify-between rounded-t-[16px] bg-[#18191F] px-[16px] py-[20px]">
      <div className="flex-[1_1_0%]">
        <div className="flex w-full items-center gap-[8px] bg-[#202129] p-[14px]">
          <Search
            size={16}
            color={isFocused ? '#fff' : '#848E9C'}
            onClick={() => inputRef.current?.focus()}
          />
          <input
            ref={inputRef}
            value={searchValue}
            onChange={handleInputChange}
            autoFocus
            placeholder={t`Search`}
            onFocus={() => {
              setIsFocusedTrue()
              inputRef.current?.focus()
            }}
            onKeyDown={handleInputKeyDown}
            onBlur={() => {
              setIsFocusedFalse()
            }}
            className="flex-1 bg-transparent text-[16px] leading-[1] text-white caret-[#00E3A5] outline-none placeholder:text-[#6D7180]"
          />
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
      <div className="flex flex-shrink-0 items-center">
        <div className="mx-[20px] h-[17px] w-[1px] bg-[#31333D] select-none"></div>
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
