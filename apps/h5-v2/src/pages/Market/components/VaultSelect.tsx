import { Trans } from '@lingui/react/macro'
import Box from '@mui/material/Box'
import { TipsOutLine, WalletLine } from '@/components/Icon'
import { memo, useCallback, useContext, useMemo, useState } from 'react'
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
  type MarketPool,
} from '@myx-trade/sdk'
import { useParams } from 'react-router-dom'
import { parseUnits } from 'ethers'
import { Button, styled } from '@mui/material'
import { toast } from '@/components/UI/Toast'
import { useWalletConnection } from '@/hooks/wallet/useWalletConnection.ts'
import { useWalletActions } from '@/hooks/useWalletActions.ts'
import { formatNumber } from '@/utils/number.ts'
import { NumericInputWithAdornment } from '@/pages/Earn/components/Trade/NumericInput'
import { getMarketData } from '@/request'
import { formatNumberPrecision } from '@/utils/formatNumber.ts'
import { COMMON_BASE_DISPLAY_DECIMALS, COMMON_PRICE_DISPLAY_DECIMALS } from '@/constant/decimals.ts'
import { getAssetIcon } from '@/utils/coin.tsx'
import { Tooltips } from '@/components/UI/Tooltips'
import { showErrorToast } from '@/config/error'

enum VaultType {
  Base,
  Quote,
}

const StyledNumericInputWithAdornment = styled(NumericInputWithAdornment)`
  .MuiInputBase-root {
    font-size: 24px;
    padding: 2px 0;
    height: 28px;
  }
  & .MuiInputBase-input {
    height: 24px;
    line-height: 24px;
  }

  & .MuiInputAdornment-root {
    margin-left: 2px;
    color: var(--regular-text);
  }
`
export const BaseVaultInput = memo(
  ({
    value,
    amount,
    balance,
    onChange,
  }: {
    value?: string
    amount: string
    balance?: string
    onChange: (value: string) => void
  }) => {
    const { market, quote, token, poolId } = useContext(TokenContext)
    const onValueChange = useCallback(
      ({ floatValue, value }: { value: string; floatValue?: number }) => {
        onChange(value)
      },
      [onChange],
    )
    return (
      <Box
        className={
          'bg-base-bg mt-[6px] flex flex-col gap-[12px] rounded-[12px] px-[16px] py-[20px]'
        }
      >
        <Box className={'flex items-center gap-[10px]'}>
          <StyledNumericInputWithAdornment
            autoFocus
            placeholder={t`Amount`}
            className={'flex-1'}
            value={amount}
            onValueChange={onValueChange}
          />
          <Box className={'flex items-center gap-[4px]'}>
            <img className={'aspect-square h-[20px] w-[20px] rounded-full'} src={token?.logo} />
            <span className={'text-[16px] leading-[1] font-[500] text-white'}>{token?.symbol}</span>
          </Box>
        </Box>
        <Box className={'flex items-center justify-between gap-[8px]'}>
          <Box className={'flex-1 font-[500]'}>
            ${formatNumberPrecision(value, COMMON_BASE_DISPLAY_DECIMALS)}
          </Box>
          <Box className={'flex flex-1 items-center justify-end gap-[4px]'}>
            <WalletLine size={14} />
            <span className={'font-[500]'}>
              {formatNumberPrecision(balance, COMMON_BASE_DISPLAY_DECIMALS)}
            </span>
            <span className={'font-[500]'}>{token?.symbol}</span>
          </Box>
        </Box>
      </Box>
    )
  },
)

export const QuoteVaultInput = memo(
  ({
    value,
    amount,
    balance,
    onChange,
  }: {
    value?: string
    amount: string
    balance?: string
    onChange: (value: string) => void
  }) => {
    const { market, quote, token, poolId } = useContext(TokenContext)
    const onValueChange = useCallback(
      ({ floatValue, value }: { value: string; floatValue?: number }) => {
        onChange(value)
      },
      [onChange],
    )
    return (
      <Box
        className={
          'bg-base-bg mt-[6px] flex flex-col gap-[12px] rounded-[12px] px-[16px] py-[20px]'
        }
      >
        <Box className={'flex items-center gap-[10px]'}>
          <StyledNumericInputWithAdornment
            autoFocus
            placeholder={t`Amount`}
            className={'flex-1'}
            value={amount}
            onValueChange={onValueChange}
          />
          <Box className={'flex items-center gap-[4px]'}>
            <img
              className={'aspect-square h-[20px] w-[20px] rounded-full'}
              src={quote?.logo || quote?.symbol ? getAssetIcon(quote?.symbol) : ''}
            />
            <span className={'text-[16px] leading-[1] font-[500] text-white'}>{quote?.symbol}</span>
          </Box>
        </Box>
        <Box className={'flex items-center justify-between gap-[8px]'}>
          <Box className={'flex-1 font-[500]'}>
            ${formatNumberPrecision(value, COMMON_PRICE_DISPLAY_DECIMALS)}
          </Box>
          <Box className={'flex flex-1 items-center justify-end gap-[4px]'}>
            <WalletLine size={14} />
            <span className={'font-[500]'}>
              {formatNumberPrecision(balance, COMMON_PRICE_DISPLAY_DECIMALS)}
            </span>
            <span className={'font-[500]'}>{quote?.symbol}</span>
          </Box>
        </Box>
      </Box>
    )
  },
)

export const VaultSelect = ({
  onNext,
  poolInfo,
}: {
  onNext: () => void
  poolInfo?: MarketPool
}) => {
  const { chainId } = useParams()
  const { market, quote, token, poolId } = useContext(TokenContext)
  const { chainId: curChainId } = useWalletConnection()
  const onAction = useWalletActions()
  const [type, setType] = useState<VaultType>(VaultType.Base)
  const { address: account } = useAccount()
  const [isLoading, setIsLoading] = useState(false)
  const [baseAmount, setBaseAmount] = useState<string>('')
  const [quoteAmount, setQuoteAmount] = useState<string>('')
  const [slippage] = useState<string>('0.01')

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
    queryKey: [{ key: 'price' }, token?.address, chainId],
    enabled: !!token?.address && !!chainId,
    queryFn: async () => {
      if (!token?.address || !chainId) return
      const result = await getMarketData({ asset: token.address, chainId: +chainId })
      if (result) {
        return result?.data?.price
      }
      return
    },
    refetchInterval: 5000,
  })

  const value = useMemo(() => {
    if (type === VaultType.Quote) {
      return quoteAmount
    } else if (type === VaultType.Base) {
      if (token && price && baseAmount && Number(baseAmount) > 0) {
        return formatUnits(
          parseUnits(price.toString(), COMMON_PRICE_DECIMALS) *
            parseUnits(baseAmount, token?.decimals),
          COMMON_PRICE_DECIMALS + token?.decimals,
        )
      }
      return ''
    }
  }, [price, type, quoteAmount, baseAmount])

  const amount = useMemo(() => {
    return type === VaultType.Base ? baseAmount : quoteAmount
  }, [type, baseAmount, quoteAmount])

  const onConfirm = useCallback(async () => {
    try {
      setIsLoading(true)
      if (!poolId || !amount || !slippage || !chainId) return
      const checked = await onAction()
      if (!checked) return
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
      toast.success({ title: t`Successfully deposited` })
      onNext()
    } catch (e) {
      // todo error
      showErrorToast(e)
    } finally {
      setIsLoading(false)
    }
  }, [type, poolId, amount, slippage, chainId, curChainId, onAction])

  const isInsufficient = useMemo(() => {
    console.log(111111)
    if (!amount) return false
    if (Number(amount) >= Number(balance)) return true
    // if () return true
    return false
  }, [market, value, amount, balance])

  return (
    <Box className={'flex flex-1 flex-col'}>
      <h2 className={'text-[18px] leading-[1] font-[700] text-white'}>
        <Trans>Confirm Token Info</Trans>
      </h2>
      <div className={'text-secondary mt-[6px] text-[12px] leading-[1.5]'}>
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
          <h3 className={'text-[14px] font-[700] text-white'}>
            ${token?.mca ? formatNumber(Number(token?.mca)) : '--'}
          </h3>
          <span className={'text-secondary text-[12px]'}>mcap</span>
        </Box>
      </Box>

      <Box className={'mt-[32px] flex flex-col'}>
        <label
          className={'text-regular flex items-center gap-[4px] text-[16px] leading-[1] font-[500]'}
        >
          <Trans>Select a vault to provide initial liquidity</Trans>
        </label>
        <Box className={'mt-[16px] flex gap-[6px]'}>
          <Box
            className={`flex flex-1 items-center justify-center gap-[4px] rounded-[12px] px-[40px] py-[14px] text-[12px] leading-[1] font-[500] ${type === VaultType.Base ? 'text-darker bg-white' : 'bg-base-bg text-regular'}`}
            onClick={() => {
              setType(VaultType.Base)
              setBaseAmount('')
              setQuoteAmount('')
            }}
          >
            <Trans>{token?.symbol} Vault</Trans>
            <Tooltips title={t`Deposit underlying assets, gain price exposure, and earn fees.`}>
              <TipsOutLine size={16} className={'text-secondary cursor-pointer'} />
            </Tooltips>
          </Box>

          <Box
            className={`flex flex-1 items-center justify-center gap-[4px] rounded-[12px] px-[40px] py-[14px] text-[12px] leading-[1] font-[500] ${type === VaultType.Quote ? 'text-darker bg-white' : 'bg-base-bg text-regular'}`}
            onClick={() => {
              setType(VaultType.Quote)
              setBaseAmount('')
              setQuoteAmount('')
            }}
          >
            <Trans>{quote?.symbol} Vault</Trans>
          </Box>
        </Box>
      </Box>

      {type === VaultType.Base ? (
        <BaseVaultInput
          amount={baseAmount}
          value={value}
          balance={balance}
          onChange={setBaseAmount}
        />
      ) : (
        <QuoteVaultInput
          amount={quoteAmount}
          value={value}
          balance={balance}
          onChange={setQuoteAmount}
        />
      )}
      {isInsufficient && (
        <Box className={'mt-[12px] text-[14px] leading-[1]'}>
          <p className={'text-wrong'}>
            <Trans>Insufficient balance</Trans>
          </p>
        </Box>
      )}

      <Tips className={'mt-[12px]'}>
        <Trans>
          The market will activate immediately once total liquidity reaches $
          {market ? formatNumberPrecision(market?.poolPrimeThreshold, 0) : '--'}.
        </Trans>
      </Tips>

      <Box className={'mt-[32px] w-full'}>
        <Button
          className={'gradient primary long mx-auto w-full rounded'}
          loading={isLoading || !poolInfo}
          onClick={onConfirm}
          disabled={isLoading || isInsufficient || !market || !value || Number(value) <= 0}
          loadingPosition={'start'}
        >
          <Trans>Create Market</Trans>
        </Button>
      </Box>
    </Box>
  )
}
