import { Trans } from '@lingui/react/macro'
import { PrimaryButton as Button } from '@/components/UI/Button'
import { useReferralStore } from '@/store/referrals'
import { useMemo, useState, type ReactNode, useRef, type RefObject } from 'react'
import { DialogContent } from '@mui/material'
import { useClaimReferralRebate } from '@/pages/Referrals/hooks/useClaimRebate'
import Big from 'big.js'
import { getChainInfo } from '@/config/chainInfo'
import { toast } from '@/components/UI/Toast'
import { DialogTheme, DialogTitleTheme } from '@/components/DialogBase'
import { ArrowDown, Selected } from '@/components/Icon'

import { CoinIcon } from '@/components/UI/CoinIcon'
import type { Address } from 'viem'
import type { ChainId } from '@/config/chain'
import { ZeroAddress } from 'ethers'
import { motion } from 'framer-motion'
import clsx from 'clsx'
import { useOnClickOutside } from 'usehooks-ts'
import { formatNumber } from '@/utils/number'

export function RebateClaim() {
  const { bonusInfo } = useReferralStore()
  const { countdown } = useClaimReferralRebate()
  const [open, setOpen] = useState(false)

  if (!bonusInfo?.availableAmount || !Big(bonusInfo.availableAmount).gt(0)) {
    return null
  }

  return (
    <>
      <Button
        className="w-[160px] lg:w-[108px]"
        disabled={countdown !== 0}
        onClick={() => setOpen(true)}
      >
        {countdown === 0 ? <Trans>Claim</Trans> : <>{Math.round(countdown / 1000)}s</>}
      </Button>
      <RebateClaimDialog open={open} onClose={() => setOpen(false)} />
    </>
  )
}

interface SelectOption<T = number | string> {
  label: ReactNode
  value: T
  icon?: string
}
interface SelectProps<T = number | string> {
  label: ReactNode
  options: SelectOption<T>[]
  value: T
  onChange: (value: T) => void
  placeholder?: ReactNode
}
const Select = <T = number | string,>({
  label,
  options,
  value,
  onChange,
  placeholder,
}: SelectProps<T>) => {
  const selectedOption = useMemo(() => {
    return options.find((option) => option.value === value)
  }, [options, value])
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useOnClickOutside(ref as RefObject<HTMLElement>, () => setOpen(false))
  return (
    <div className="relative leading-[1]" ref={ref}>
      <div
        className="rounded-[10px] bg-[#202129] p-[16px]"
        role="button"
        onClick={() => setOpen(!open)}
      >
        <p className="text-[14px] text-[#848E9C]">{label}</p>
        <div className="mt-[12px] flex items-center justify-between">
          {/* left */}
          <div className="flex items-center gap-[4px]">
            {selectedOption && (
              <>
                {selectedOption.icon ? (
                  <CoinIcon
                    icon={selectedOption.icon ?? ''}
                    size={20}
                    className="border-light-border border-[1px]"
                  />
                ) : (
                  <></>
                )}
                <p className="text-[14px] leading-none font-medium">{selectedOption?.label}</p>
              </>
            )}
            {!selectedOption && (
              <p className="text-[14px] leading-none font-medium text-[#848E9C]">{placeholder}</p>
            )}
          </div>
          {/* right */}
          <ArrowDown size={20} color="#848E9C" />
        </div>
      </div>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.2 }}
          className="absolute top-[100%] left-0 z-20 max-h-[114px] w-full translate-y-[2px] overflow-y-auto rounded-[12px] bg-[#202129] p-[4px]"
        >
          {options.map((item) => (
            <div
              key={item.value as string}
              role="button"
              onClick={() => {
                onChange(item.value)
                setOpen(false)
              }}
              className={clsx(
                'flex items-center justify-between rounded-[8px] p-[12px] hover:bg-[#282933]',
                {
                  'bg-[#282933]': value === item.value,
                },
              )}
            >
              <div className="flex items-center gap-[4px]">
                {/* icon */}
                {item.icon ? (
                  <CoinIcon
                    icon={item.icon ?? ''}
                    size={20}
                    className="border-light-border border-[1px]"
                  />
                ) : (
                  <></>
                )}
                <p className="text-[14px] leading-none font-medium">{item.label}</p>
              </div>
              {value === item.value && (
                <div className="flex">
                  <Selected size={14} />
                </div>
              )}
            </div>
          ))}
        </motion.div>
      )}
    </div>
  )
}

function RebateClaimDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [confirming, setConfirming] = useState(false)
  const { bonusChainInfo } = useReferralStore()
  const { claimChainId, setClaimChainId, onClaimReferralRebate } = useClaimReferralRebate()

  const availableMapByChainId = useMemo(() => {
    const availableMapByChainId: Record<
      number,
      Record<
        Address,
        {
          availableAmount: string
          token: Address
          tokenName: string
        }
      >
    > = {}
    if (!bonusChainInfo) return availableMapByChainId
    bonusChainInfo.forEach((item) => {
      if (!availableMapByChainId[item.chainId]) {
        availableMapByChainId[item.chainId] = {}
      }
      availableMapByChainId[item.chainId][item.token as Address] = {
        availableAmount: item.availableAmount,
        token: item.tokenAddress,
        tokenName: item.token,
      }
    })

    return availableMapByChainId
  }, [bonusChainInfo])

  const [selectedChainId, setSelectedChainId] = useState<number>(0)
  const [selectedToken, setSelectedToken] = useState<Address>(ZeroAddress as Address)

  const { chainOptions, tokenOptions } = useMemo(() => {
    const chainOptions: SelectOption<number>[] = []
    const tokenOptions: SelectOption<Address>[] = []
    if (!Object.keys(availableMapByChainId).length)
      return {
        chainOptions,
        tokenOptions,
      }
    const chainList = Object.keys(availableMapByChainId)
      .map((chainId) => {
        try {
          return {
            ...getChainInfo(parseInt(chainId) as ChainId),
            chainId: parseInt(chainId),
          }
        } catch (error) {
          return undefined
        }
      })
      .filter((item) => item !== undefined)

    if (chainList.length) {
      chainList.forEach((item) => {
        chainOptions.push({
          label: item.label,
          value: item.chainId,
          icon: item.logoUrl,
        })
      })
    }

    if (selectedChainId && availableMapByChainId[selectedChainId]) {
      Object.keys(availableMapByChainId[selectedChainId]).forEach((token) => {
        tokenOptions.push({
          label: token,
          value: token as Address,
        })
      })
    }
    return {
      chainOptions,
      tokenOptions,
    }
  }, [availableMapByChainId, selectedChainId])

  const selectedTokenInfo = useMemo(() => {
    if (availableMapByChainId && selectedChainId && selectedToken) {
      return availableMapByChainId?.[selectedChainId]?.[selectedToken] || null
    }
    return null
  }, [availableMapByChainId, selectedChainId, selectedToken])

  const handleClaim = async () => {
    if (!selectedTokenInfo?.availableAmount || !selectedTokenInfo?.availableAmount) {
      return
    }
    try {
      setConfirming(true)
      await onClaimReferralRebate(selectedTokenInfo?.token as Address)
      onClose()
    } catch (e: any) {
      toast.error({ title: e.message || 'Error' })
    } finally {
      setConfirming(false)
    }
  }

  return (
    <DialogTheme open={open} onClose={onClose}>
      <DialogTitleTheme onClose={onClose}>
        <Trans>Select Claim Amount</Trans>
      </DialogTitleTheme>
      <DialogContent
        sx={{
          paddingTop: '4px !important',
        }}
      >
        <Select
          label={<Trans>选择链接</Trans>}
          options={chainOptions}
          value={selectedChainId}
          onChange={(value) => {
            setClaimChainId(value)
            setSelectedChainId(value as number)
          }}
          placeholder={<Trans>Select Chain</Trans>}
        />
        <div className="mt-[8px]">
          <Select
            label={<Trans>选择币种</Trans>}
            options={tokenOptions}
            value={selectedToken}
            onChange={(value) => setSelectedToken(value as Address)}
            placeholder={<Trans>Select Token</Trans>}
          />
        </div>
        <div className="mt-[8px] rounded-[10px] border border-[#31333D] bg-[#202129] p-[16px] leading-[1]">
          <p className="text-[14px] text-[#848E9C]">{<Trans>可领取</Trans>}</p>
          <p className="font-white mt-[12px] text-[20px] leading-[1] font-medium">
            {formatNumber(selectedTokenInfo?.availableAmount || '0')} {selectedTokenInfo?.tokenName}
          </p>
        </div>

        <div className="mt-[16px]">
          <Button
            style={{
              height: '44px',
              borderRadius: '999px',
            }}
            className="w-full"
            loading={confirming}
            disabled={
              !selectedTokenInfo?.availableAmount ||
              !selectedTokenInfo?.availableAmount ||
              !claimChainId
            }
            onClick={handleClaim}
          >
            <Trans>Confirm</Trans>
          </Button>
        </div>
      </DialogContent>
    </DialogTheme>
  )
}
