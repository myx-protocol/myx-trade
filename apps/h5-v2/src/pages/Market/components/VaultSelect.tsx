import { Trans } from '@lingui/react/macro'
import Box from '@mui/material/Box'
import { TipsOutLine, WalletLine } from '@/components/Icon'
import { useCallback, useContext, useMemo, useState } from 'react'
import { TokenInfo } from '@/pages/Market/components/TokenInfo.tsx'
import { t } from '@lingui/core/macro'
import { Tips } from '@/pages/Market/components/tips.tsx'
import { TokenContext } from '@/pages/Market/context.ts'
import { useQuery } from '@tanstack/react-query'
import { useAccount } from 'wagmi'
import {
  base as Base,
  quote as Quote,
  COMMON_PRICE_DECIMALS,
  formatUnits,
  getBalanceOf,
} from '@myx-trade/sdk'
import { useParams } from 'react-router-dom'
import { getOraclePrice } from '@/request/price'
import { parseUnits } from 'ethers'
import { Button } from '@mui/material'
import { toast } from 'react-hot-toast'

enum VaultType {
  Base,
  Quote,
}
export const VaultSelect = ({ onNext }: { onNext: () => void }) => {
  const { chainId } = useParams()
  const { market, quote, token, poolId } = useContext(TokenContext)
  const [type, setType] = useState<VaultType>(VaultType.Base)
  const { address: account } = useAccount()
  const [isLoading, setIsLoading] = useState(false)
  const [amount, setAmount] = useState<string>('0.0001')
  const [slippage] = useState<string>('0.01')

  const Token = useMemo(() => (type === VaultType.Base ? token : quote), [type])

  const { data: balance } = useQuery({
    queryKey: [{ key: 'balance' }, type, account, chainId],
    queryFn: async () => {
      const address = type === VaultType.Base ? token?.address : quote?.address
      const decimals = type === VaultType.Base ? token?.decimals : quote?.decimals

      if (!address || !account || !chainId) return
      try {
        const bigintBalance = await getBalanceOf(+chainId, account, address)
        const _balance = formatUnits(bigintBalance, decimals)
        return _balance
      } catch (e) {
        console.error(e)
      }
    },
  })

  const { data: price } = useQuery({
    queryKey: [{ key: 'pirce' }, poolId],
    enabled: !!poolId,
    queryFn: async () => {
      if (!poolId || !chainId) return
      const result = await getOraclePrice(+chainId, [poolId])
      if (result) {
        return result?.data?.[0]?.price
      }
      return
    },
    refetchInterval: 5000,
  })

  const value = useMemo(() => {
    if (type === VaultType.Quote) {
      return balance
    } else if (type === VaultType.Base) {
      if (token && price && balance && Number(balance) > 0) {
        return formatUnits(
          parseUnits(price, COMMON_PRICE_DECIMALS) * parseUnits(balance, token?.decimals),
          COMMON_PRICE_DECIMALS + token?.decimals,
        )
      }
      return ''
    }
  }, [price, type, balance])

  const onConfirm = useCallback(async () => {
    try {
      setIsLoading(true)
      if (!poolId || !amount || !slippage || !chainId) return
      if (type === VaultType.Base) {
        await Base.deposit({
          chainId: +chainId,
          poolId,
          amount: Number(amount),
          slippage: Number(slippage),
        })
      } else {
        await Quote.deposit({
          chainId: +chainId,
          poolId,
          amount: Number(amount),
          slippage: Number(slippage),
        })
      }
      toast.success(t`Successfully deposited`)
      onNext()
    } catch (e) {
      // todo error
      toast.error(t`Failed to deposit`)
    } finally {
      setIsLoading(false)
    }
  }, [type, poolId, amount, slippage, chainId])

  const isInsufficient = useMemo(() => {
    if (!value) return true
    if (Number(value) < Number(market?.poolPrimeThreshold)) return true
    if (Number(amount) >= Number(balance)) return true
    if (Number(amount) < Number(market?.poolPrimeThreshold)) return true
    return false
  }, [market, value])

  return (
    <Box className={'flex flex-1 flex-col'}>
      <h2 className={'text-[24px] leading-[1] font-[700] text-white'}>
        <Trans>Confirm Token Info</Trans>
      </h2>
      <div className={'mt-[8px] leading-[1]'}>
        <Trans>
          Become the Genesis LP and exclusively receive a 2% share of this market's trading fees.
          LPs added after market activation are not eligible for this reward.
        </Trans>
      </div>

      <Box
        className={
          'bg-base-bg mt-[20px] flex items-center justify-between gap-[12px] rounded-[12px] px-[16px] py-[20px]'
        }
      >
        <TokenInfo />
        <Box className={'flex flex-col items-end gap-[4px] leading-[1]'}>
          <h3 className={'text-[20px] font-[700] text-white'}>$2.34K</h3>
          <span>mcap</span>
        </Box>
      </Box>

      <Box className={'mt-[40px] flex flex-col'}>
        <label className={'flex items-center gap-[4px]'}>
          <Trans>Select a vault to provide initial liquidity</Trans>
        </label>
        <Box className={'mt-[16px] flex gap-[6px]'}>
          <Box
            className={`flex flex-1 items-center justify-center gap-[4px] rounded-[12px] px-[40px] py-[16px] leading-[1] font-[500] ${type === VaultType.Base ? 'text-darker bg-white' : 'bg-base-bg text-regular'}`}
            onClick={() => {
              setAmount('0.001')
              setType(VaultType.Base)
            }}
          >
            <Trans>{token?.symbol} Vault</Trans>
            <TipsOutLine size={16} className={'text-secondary'} />
          </Box>

          <Box
            className={`flex flex-1 items-center justify-center gap-[4px] rounded-[12px] px-[40px] py-[16px] leading-[1] font-[500] ${type === VaultType.Quote ? 'text-darker bg-white' : 'bg-base-bg text-regular'}`}
            onClick={() => {
              setAmount(Number(market?.poolPrimeThreshold).toString())
              setType(VaultType.Quote)
            }}
          >
            <Trans>{quote?.symbol} Vault</Trans>
          </Box>
        </Box>

        <Box
          className={
            'bg-base-bg mt-[6px] flex flex-col gap-[12px] rounded-[12px] px-[16px] py-[20px]'
          }
        >
          <Box className={'flex items-center gap-[10px]'}>
            <input
              placeholder={t`Amount`}
              className={'flex-1'}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <Box className={'flex items-center gap-[4px]'}>
              <img className={'aspect-square h-[20px] w-[20px] rounded-full'} src={quote?.icon} />
              <span className={'text-[16px] leading-[1] font-[500] text-white'}>
                {quote?.symbol}
              </span>
            </Box>
          </Box>
          <Box className={'flex items-center justify-between gap-[8px]'}>
            <Box className={'flex-1 font-[500]'}>${value || '--'}</Box>
            <Box className={'flex flex-1 items-center justify-end gap-[4px]'}>
              <WalletLine size={14} />
              <span className={'font-[500]'}>{balance || '--'}</span>
              <span className={'font-[500]'}>{Token?.symbol}</span>
            </Box>
          </Box>
        </Box>

        {isInsufficient && (
          <Box className={'mt-[12px] text-[14px] leading-[1]'}>
            <p className={'text-wrong'}>
              <Trans>Insufficient balance</Trans>
            </p>
          </Box>
        )}
      </Box>

      <Tips className={'mt-[12px]'}>
        <Trans>
          The market will activate immediately once total liquidity reaches $
          {Number(market?.poolPrimeThreshold)}.
        </Trans>
      </Tips>

      <Box className={'mt-[32px] w-full'}>
        <Button
          className={'gradient primary long mx-auto w-full rounded'}
          loading={isLoading}
          onClick={onConfirm}
        >
          <Trans>Create Market</Trans>
        </Button>
      </Box>
    </Box>
  )
}
