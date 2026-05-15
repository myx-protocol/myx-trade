import { Copy } from '@/components/Copy'
import { ArrowDown, CloseIcon } from '@/components/Icon'
import { Search } from '@/components/Search'
import { DialogSuspense } from '@/components/Loading'
import { PairLogo } from '@/components/UI/PairLogo'
import { DialogBase } from '@/components/UI/DialogBase'
import { ChainsDrawer } from '@/components/ChainsDrawer'
import { getChainInfo } from '@/config/chainInfo'
import { Box } from '@mui/material'
import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import { encryptionAddress, isSafeNumber } from '@/utils'
import { formatNumber } from '@/utils/number.ts'
import { memo, useCallback, useMemo, useState } from 'react'
import { useDebounceValue } from 'usehooks-ts'
import Big from 'big.js'
import { type Asset, useWalletPortfolio } from '@/hooks/useWalletPortfolio'
import { Skeleton } from '@/components/UI/Skeleton'
import { useWalletConnection } from '@/hooks/wallet/useWalletConnection.ts'
import {
  type CookTokenItem,
  type FindCookPoolFn,
  useCookTokenSelect,
} from '../hook/useCookTokenSelect'

interface CookTokenSelectDialogProps {
  open: boolean
  onClose: () => void
  baseTokenIcon?: string
  /** 选中标的 Token 后进入第二步（计价单位）；不传则列表行无点击逻辑 */
  onSelectBaseToken?: (
    base: CookTokenItem,
    quoteTokens: CookTokenItem[],
    findCookPool: FindCookPoolFn,
  ) => void
}

const drawerSx = {
  '& .MuiDrawer-paper': {
    maxHeight: 'calc(var(--vh, 1vh) * 85)',
  },
}

export const CookTokenSelectDialog = memo(
  ({ open, onClose, baseTokenIcon, onSelectBaseToken }: CookTokenSelectDialogProps) => {
    const { isWalletConnected } = useWalletConnection()
    const {
      walletAssets,
      isPending: isWalletPending,
      isError: isWalletError,
      chainId: portfolioChainId,
      setChainId,
    } = useWalletPortfolio()
    const [searchInput, setSearchInput] = useState('')
    const [chainSelectOpen, setChainSelectOpen] = useState(false)
    const [debouncedKeyword] = useDebounceValue(searchInput.trim(), 2000)

    const chainSelectInfo = useMemo(() => {
      if (!portfolioChainId) return null
      try {
        return getChainInfo(portfolioChainId)
      } catch {
        return null
      }
    }, [portfolioChainId])

    const { isLoading, baseTokenList, tokenInfoMap, baseTokenMapQuoteToken, findCookPool } =
      useCookTokenSelect({
        chainId: portfolioChainId ?? 0,
        keyword: debouncedKeyword,
      })

    const resolveWalletAsset = useCallback(
      (chainId: number, address: string) =>
        walletAssets?.find(
          (a: Asset) => a.chainId === chainId && a.address.toLowerCase() === address.toLowerCase(),
        ),
      [walletAssets],
    )

    const displayList = useMemo(() => {
      return baseTokenList.flatMap((baseToken) => {
        const info = tokenInfoMap.get(baseToken as `0x${string}`)
        return info ? [info] : []
      })
    }, [baseTokenList, tokenInfoMap])

    const getChainInfoFunc = useCallback((chainId: number) => {
      try {
        return getChainInfo(chainId)
      } catch (error) {
        console.error(error)
        return null
      }
    }, [])

    return (
      <DialogBase open={open} onClose={onClose} title={null} sx={drawerSx}>
        <DialogSuspense>
          <Box className="pb-[12px]">
            <Box className="flex items-center justify-between px-[12px]">
              <Box className="flex items-center gap-[8px]">
                <p className="text-[20px] leading-none font-[500] text-white">
                  <span>
                    <Trans>Step1</Trans>
                  </span>
                  <span className="text-[#6D7180]">/2</span>
                </p>
                <p className="text-[20px] leading-none font-[700] text-white">
                  <Trans>选择Token</Trans>
                </p>
              </Box>
              <Box
                role="button"
                className="flex cursor-pointer text-[#848E9C]"
                onClick={onClose}
                aria-label={t`关闭`}
              >
                <CloseIcon size={16} />
              </Box>
            </Box>

            <Search
              isRounded={false}
              className="mt-[24px] min-h-[48px] rounded-[8px] pl-[12px]"
              value={searchInput}
              onChange={setSearchInput}
              placeholder={t`Search name or paste address`}
            >
              <Box
                className="flex shrink-0 cursor-pointer items-center gap-[2px] pr-[12px] text-[#CED1D9]"
                role="button"
                onClick={() => {
                  if (isLoading) return
                  setChainSelectOpen(true)
                }}
              >
                <span className="text-[12px] whitespace-nowrap">
                  {chainSelectInfo ? chainSelectInfo.label : t`All Chain`}
                </span>
                <ArrowDown size={12} color="#CED1D9" />
              </Box>
              <ChainsDrawer
                open={chainSelectOpen}
                onClose={() => setChainSelectOpen(false)}
                chainId={portfolioChainId}
                onChainChange={(chainId) => {
                  setChainId(chainId)
                  setChainSelectOpen(false)
                }}
              />
            </Search>

            <Box className="mt-[12px] px-[12px]">
              <Box className="flex items-center justify-between pt-[12px] pb-[4px] text-[12px] leading-[1.5] text-[#6D7180]">
                <span>
                  <Trans>Token</Trans>
                </span>
                <span>
                  <Trans>Amount / Value</Trans>
                </span>
              </Box>

              <Box className="max-h-[360px] overflow-y-auto pr-[4px]">
                {displayList.map((item) => {
                  const walletAsset = resolveWalletAsset(item.chainId, item.address)
                  const balance = walletAsset?.balance
                  const price = walletAsset?.price

                  const onRowClick = () => {
                    if (!onSelectBaseToken) return
                    const quoteAddrs = baseTokenMapQuoteToken[item.address] ?? []
                    const quoteTokens = quoteAddrs
                      .map((addr) => tokenInfoMap.get(addr as `0x${string}`))
                      .filter((x): x is CookTokenItem => !!x)
                    onSelectBaseToken(item, quoteTokens, findCookPool)
                  }

                  const chainInfo = getChainInfoFunc(item.chainId)

                  return (
                    <Box
                      key={item.address}
                      role="button"
                      className={`flex h-[60px] items-center justify-between rounded-[6px] px-[8px] py-[12px] hover:bg-[#202129] ${onSelectBaseToken ? 'cursor-pointer' : ''}`}
                      onClick={onRowClick}
                    >
                      <Box className="flex items-center gap-[8px]">
                        <PairLogo
                          baseLogoSize={32}
                          quoteLogoSize={12}
                          baseSymbol={item.tokenSymbol}
                          quoteSymbol={chainInfo?.label}
                          quoteLogo={chainInfo?.logoUrl}
                          baseLogo={item.tokenIcon ?? baseTokenIcon}
                          baseClassName="rounded-[56px]"
                          quoteClassName="rounded-[12px] border border-[#101114]"
                        />
                        <Box className="flex flex-col gap-[6px]">
                          <p className="text-[14px] leading-none font-[500] text-white">
                            {item.tokenSymbol}
                          </p>
                          <Box className="flex items-center gap-[6px] text-[12px] leading-none text-[#848E9C]">
                            <span>{item.tokenName}</span>
                            <Box
                              className="flex items-center gap-[4px]"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <span>{encryptionAddress(item.address)}</span>
                              <Copy content={item.address} />
                            </Box>
                          </Box>
                        </Box>
                      </Box>

                      <Box className="flex w-[105px] flex-col items-end gap-[6px] text-right leading-[1]">
                        <Box className="text-[14px] font-[500] text-white">
                          {!isWalletConnected ? (
                            '--'
                          ) : isWalletPending ? (
                            <Skeleton width={60} height={14} />
                          ) : isWalletError && walletAssets === undefined ? (
                            '--'
                          ) : balance ? (
                            formatNumber(balance)
                          ) : (
                            '0'
                          )}
                        </Box>
                        <Box className="text-[12px] font-[500] text-[#848E9C]">
                          {!isWalletConnected ? (
                            '--'
                          ) : isWalletPending ? (
                            <Skeleton width={50} height={12} />
                          ) : isWalletError && walletAssets === undefined ? (
                            '--'
                          ) : isSafeNumber(price) && balance ? (
                            `$${formatNumber(new Big(price || '0').mul(new Big(balance)), { showUnit: false })}`
                          ) : (
                            '$0'
                          )}
                        </Box>
                      </Box>
                    </Box>
                  )
                })}
              </Box>
            </Box>
          </Box>
        </DialogSuspense>
      </DialogBase>
    )
  },
)
