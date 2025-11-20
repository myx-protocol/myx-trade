import React, { memo, useCallback, useRef, useState } from 'react'
import { DialogTheme, DialogTitleTheme, type DialogBaseProps } from '@/components/DialogBase'
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
import { type ChainId, getSupportedChainIdsByEnv } from '@/config/chain.ts'
import { getAccountHoldings } from '@/request'
import { Skeleton } from '@/components/UI/Skeleton'
import { CHAIN_INFO } from '@/config/chainInfo.ts'
import { encryptionAddress } from '@/utils'
import { formatNumberPrecision } from '@/utils/formatNumber.ts'
import { formatNumber } from '@/utils/number.ts'
import { COMMON_PRICE_DISPLAY_DECIMALS } from '@/constant/decimals.ts'
import { CoinIcon } from '../UI/CoinIcon'
import { Empty } from '@/components/Empty.tsx'
import { type Asset, useWalletPortfolio } from '@/hooks/useWalletPortfolio'

interface TokenItemProps {
  disabled?: boolean
  asset?: Asset
}

const TokenItem = ({ disabled = false, asset }: TokenItemProps) => {
  return (
    <Box
      className={`flex items-center justify-between rounded-[6px] py-[12px] ${disabled ? 'cursor-not-allowed opacity-[0.35]' : 'cursor-pointer'}`}
    >
      <Box className="flex items-center gap-[10px]">
        <Box className={'relative h-[32px] w-[32px] min-w-[32px] rounded-full'}>
          {asset ? (
            <CoinIcon icon={asset.logo} size={32} symbol={asset.symbol} />
          ) : (
            <Skeleton width={32} height={32} />
          )}

          <Box
            className={
              'absolute right-[-6px] bottom-0 z-[1] h-[12px] w-[12px] overflow-hidden rounded-full'
            }
          >
            {asset ? (
              <CoinIcon icon={CHAIN_INFO?.[asset?.chainId]?.logoUrl ?? ''} size={12} />
            ) : (
              <Skeleton width={12} height={12} />
            )}
          </Box>
        </Box>
        <Box className={'flex flex-col gap-[4px]'}>
          <Box className={'flex items-center gap-[6px]'}>
            {asset ? (
              <>
                <span className={'text-[14px] leading-1 font-[500] text-white'}>
                  {asset.symbol}
                </span>
                <Tag type={disabled ? 'disabled' : 'primary'}>Not Created</Tag>
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
      <Box className={'flex flex-col items-end gap-[6px] text-right leading-[1]'}>
        <Box className={'text-[14px] font-[500] text-white'}>
          {asset ? formatNumber(asset.balance) : <Skeleton width={60} />}
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

  return (
    <Box className={'flex items-center gap-[4px] pr-[12px]'}>
      <Box className={'grid h-[18px] w-[18px] grid-cols-2 grid-rows-2 gap-[2px]'}>
        {value === null || value === undefined ? (
          <>
            <Box className={'bg-base-bg rounded-[2px]'}></Box>
            <Box className={'bg-base-bg rounded-[2px]'}></Box>
            <Box className={'bg-base-bg rounded-[2px]'}></Box>
            <Box className={'bg-base-bg rounded-[2px]'}></Box>
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

const TokenSelectDialogContent = () => {
  const { address: account } = useWalletConnection()
  const { walletAssets, isLoading, chainId, setChainId } = useWalletPortfolio()
  const [input, setInput] = useState('')
  const searchRef = useRef<HTMLInputElement>(null)

  const { data: searchList, isLoading: isSearching } = useQuery({
    queryKey: [{ key: 'getWalletAssets' }, chainId, account],
    enabled: !!account,
    queryFn: async () => {
      if (!account) return undefined
      const result = await getAccountHoldings(
        account,
        !chainId ? ((getSupportedChainIdsByEnv() as unknown as ChainId[]) ?? undefined) : [chainId],
      )
      return (result.data?.assets || []).map((item: any) => {
        const token = {
          chainId: Number(item.asset?.blockchains?.[0].replace('evm:', '')),
          address: item.asset.contracts[0],
          decimals: item.asset.decimals[0],
          logo: item.asset.logo,
          name: item.asset.name,
          symbol: item.asset.symbol,
          price: item.price,
          change: item.price_change_24h,
          balance: item.token_balance,
        } as Asset
        return token
      })
    },
  })

  const onSearch = useCallback(
    (value: string) => {
      setInput(value)
    },
    [setInput],
  )
  const onBlur = () => {}

  return (
    <Box className={'scroll-y-auto flex-1 px-[16px] py-[12px]'}>
      <Box className={'flex h-[41px] w-full items-center gap-[4px]'}>
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
      <Box className={'mt-[12px]'}>
        <Box className={'text-secondary text-[14px] leading-[1] font-[500]'}>
          <Trans>My Tokens</Trans>
        </Box>

        {(isLoading ? Array.from({ length: 3 }) : walletAssets || []).map(
          (asset: Asset, index: number) => {
            return <TokenItem key={index} asset={asset} />
          },
        )}
        {!isLoading && walletAssets?.length === 0 && <Empty />}
      </Box>
    </Box>
  )
}

export const DialogTokenSelect = memo(({ open, onClose }: DialogBaseProps) => {
  return (
    <DialogTheme
      onClose={onClose}
      open={open}
      sx={{
        '.MuiPaper-root': {
          maxWidth: '390px',
        },
      }}
    >
      <DialogTitleTheme onClose={onClose}>
        <Trans>Select a Token</Trans>
      </DialogTitleTheme>

      <DialogSuspense>
        <TokenSelectDialogContent />
      </DialogSuspense>
    </DialogTheme>
  )
})
