import { Copy } from '@/components/Copy'
import { ArrowDown, CloseIcon } from '@/components/Icon'
import { TradeButton } from '@/components/Button/TradeButton'
import { DialogSuspense } from '@/components/Loading'
import { PairLogo } from '@/components/UI/PairLogo'
import { DialogBase } from '@/components/UI/DialogBase'
import { Empty } from '@/components/Empty'
import { Skeleton } from '@/components/UI/Skeleton'
import { Box } from '@mui/material'
import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import { encryptionAddress, isSafeNumber } from '@/utils'
import { formatNumber } from '@/utils/number.ts'
import Big from 'big.js'
import { type Asset, useWalletPortfolio } from '@/hooks/useWalletPortfolio'
import { useWalletConnection } from '@/hooks/wallet/useWalletConnection.ts'
import { ChainId } from '@/config/chain'
import { memo, useCallback, useEffect, useMemo, useState } from 'react'
import type { CookTokenItem } from '../hook/useCookTokenSelect'
import { CoinIcon } from '@/components/UI/CoinIcon'
import { truncateAddress } from '@/utils/string'
import { Radio } from '@/components/UI/Radio'

interface CookQuoteUnitSelectDialogProps {
  open: boolean
  onClose: () => void
  baseToken: CookTokenItem | null
  quoteTokens: CookTokenItem[]
  chainLabel?: string
  chainLogo?: string
  baseTokenIcon?: string
  onBackToBase: () => void
  onConfirm: (quote: CookTokenItem) => void
}

const drawerSx = {
  '& .MuiDrawer-paper': {
    maxHeight: 'calc(var(--vh, 1vh) * 85)',
  },
}

export const CookQuoteUnitSelectDialog = memo(
  ({
    open,
    onClose,
    baseToken,
    quoteTokens,
    chainLabel,
    chainLogo,
    baseTokenIcon,
    onBackToBase,
    onConfirm,
  }: CookQuoteUnitSelectDialogProps) => {
    const { isWalletConnected } = useWalletConnection()
    const {
      walletAssets,
      isPending: isWalletPending,
      isError: isWalletError,
      setChainId,
    } = useWalletPortfolio()

    const [selectedQuoteAddress, setSelectedQuoteAddress] = useState<string | null>(null)

    useEffect(() => {
      if (!open || !baseToken) return
      setChainId(baseToken.chainId as ChainId)
    }, [open, baseToken, setChainId])

    useEffect(() => {
      if (!open || quoteTokens.length === 0) {
        setSelectedQuoteAddress(null)
        return
      }
      setSelectedQuoteAddress((prev) => {
        if (prev && quoteTokens.some((q) => q.address === prev)) return prev
        return quoteTokens[0].address
      })
    }, [open, quoteTokens])

    const selectedQuote = useMemo(
      () => quoteTokens.find((q) => q.address === selectedQuoteAddress) ?? null,
      [quoteTokens, selectedQuoteAddress],
    )

    const resolveWalletAsset = useCallback(
      (chainId: number, address: string) =>
        walletAssets?.find(
          (a: Asset) => a.chainId === chainId && a.address.toLowerCase() === address.toLowerCase(),
        ),
      [walletAssets],
    )

    const renderAmountValue = (
      balance: string | number | undefined,
      price: string | number | undefined,
    ) => (
      <>
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
      </>
    )

    if (!baseToken) {
      return null
    }

    const pairLabel = selectedQuote
      ? `${baseToken.tokenSymbol}${selectedQuote.tokenSymbol}`
      : baseToken.tokenSymbol

    const quoteWallet = selectedQuote
      ? resolveWalletAsset(selectedQuote.chainId, selectedQuote.address)
      : undefined
    const baseWallet = resolveWalletAsset(baseToken.chainId, baseToken.address)

    return (
      <DialogBase open={open} onClose={onClose} title={null} sx={drawerSx}>
        <DialogSuspense>
          <Box className="pb-[24px]">
            <Box className="flex items-center justify-between">
              <Box className="flex items-center gap-[8px]">
                <p className="text-[20px] leading-none font-[500] text-white">
                  <span>
                    <Trans>Step2</Trans>
                  </span>
                  <span className="text-[#6D7180]">/2</span>
                </p>
                <p className="text-[20px] leading-none font-[700] text-white">
                  <Trans>选择计价单位</Trans>
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

            <Box className="mt-[24px] flex flex-col">
              <Box>
                <Box>
                  <p className="text-[14px] leading-none text-[#848E9C]">
                    <Trans>已选择token</Trans>
                  </p>
                  <Box className="mt-[12px] flex items-center justify-between rounded-[8px] bg-[#202129] p-[16px]">
                    <Box className="flex min-w-0 flex-1 items-center">
                      <PairLogo
                        baseLogoSize={36}
                        quoteLogoSize={10}
                        baseSymbol={baseToken.tokenSymbol}
                        quoteSymbol={chainLabel}
                        quoteLogo={chainLogo}
                        baseLogo={baseToken.tokenIcon ?? baseTokenIcon}
                        baseClassName="rounded-[36px]"
                        quoteClassName="rounded-[10px] border border-[#101114]"
                      />
                      <Box className="ml-[8px] flex min-w-0 flex-1 flex-col gap-[6px]">
                        <p className="truncate text-[14px] leading-none font-[500] text-white">
                          {baseToken.tokenSymbol}
                        </p>
                        <Box className="flex flex-wrap items-center gap-[8px] text-[14px] leading-none text-[#848E9C]">
                          <span className="truncate">{baseToken.tokenName}</span>
                          <Box
                            className="flex shrink-0 items-center gap-[4px]"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <span>{encryptionAddress(baseToken.address)}</span>
                            <Copy content={baseToken.address} />
                          </Box>
                        </Box>
                      </Box>
                    </Box>
                    <Box
                      role="button"
                      className="ml-[8px] flex h-[34px] shrink-0 cursor-pointer items-center gap-[4px] rounded-[34px] bg-[#18191F] px-[16px] text-[14px] text-[#CED1D9]"
                      onClick={onBackToBase}
                    >
                      <span>
                        <Trans>修改</Trans>
                      </span>
                      <ArrowDown size={14} className="text-[#848E9C]" />
                    </Box>
                  </Box>
                </Box>

                <Box className="mt-[20px]">
                  <p className="text-[14px] leading-none text-[#848E9C]">
                    <Trans>选择合约计价资产</Trans>
                  </p>
                  <Box className="mt-[12px]">
                    {quoteTokens.length === 0 ? (
                      <Box className="py-[24px]">
                        <Empty />
                      </Box>
                    ) : (
                      quoteTokens.map((item) => {
                        const isActive = selectedQuoteAddress === item.address
                        return (
                          <Box
                            key={item.address}
                            role="button"
                            className={`border-dark-border flex cursor-pointer items-center justify-between rounded-[10px] border bg-[#202129] px-[16px] py-[12px]`}
                            onClick={() => setSelectedQuoteAddress(item.address)}
                          >
                            <Box className="flex items-center gap-[8px]">
                              <CoinIcon icon={item.tokenIcon} size={36} symbol={item.tokenSymbol} />
                              <div>
                                <p className="text-[16px] leading-none font-[500] text-white">
                                  {item.tokenSymbol}
                                </p>
                                <p className="text-secondary mt-[6px] text-[14px] leading-none">
                                  {truncateAddress(item.address)}
                                </p>
                              </div>
                            </Box>
                            <Box className="flex w-[105px] flex-col items-end gap-[6px] text-right leading-[1]">
                              <Radio
                                size={20}
                                checked={isActive}
                                onChange={() => setSelectedQuoteAddress(item.address)}
                              />
                            </Box>
                          </Box>
                        )
                      })
                    )}
                  </Box>
                </Box>
              </Box>

              <Box className="mt-[24px]">
                <p className="text-[14px] leading-none font-medium text-[#848E9C]">
                  <Trans>余额</Trans>
                </p>
                <Box className="border-dark-border mt-[10px] rounded-[10px] border px-[20px] py-[16px]">
                  <Box className="flex items-center justify-between text-[14px] leading-none">
                    <span className="truncate pr-[8px] text-[#CED1D9]">
                      {pairLabel} <Trans>Base Valut</Trans>
                    </span>
                    <Box className="flex shrink-0 flex-col items-end gap-[4px] text-right leading-[1]">
                      {renderAmountValue(baseWallet?.balance, baseWallet?.price)}
                    </Box>
                  </Box>
                  <Box className="mt-[16px] flex items-center justify-between text-[14px] leading-none">
                    <span className="truncate pr-[8px] text-[#CED1D9]">
                      {pairLabel} <Trans>Stable Vault</Trans>
                    </span>
                    <Box className="flex shrink-0 flex-col items-end gap-[4px] text-right leading-[1]">
                      {selectedQuote
                        ? renderAmountValue(quoteWallet?.balance, quoteWallet?.price)
                        : renderAmountValue(undefined, undefined)}
                    </Box>
                  </Box>
                </Box>
              </Box>

              <TradeButton
                variant="contained"
                disabled={!selectedQuote}
                className="!mt-[24px] !h-[44px] !w-full !rounded-[44px] !border !border-[#80FF95] !text-[14px] !font-[500]"
                sx={{
                  background: 'linear-gradient(128deg, #3D996B 0%, #1D9D75 18.58%, #00996F 100%)',
                }}
                onClick={() => {
                  if (selectedQuote) onConfirm(selectedQuote)
                }}
              >
                <Trans>Confirm</Trans>
              </TradeButton>
            </Box>
          </Box>
        </DialogSuspense>
      </DialogBase>
    )
  },
)
