import { Box, MenuItem } from '@mui/material'
import { ArrowDown, GlobalLine } from '@/components/Icon'
import { CoinIcon } from '@/components/UI/CoinIcon'
import { CHAIN_INFO } from '@/config/chainInfo.ts'
import { StyledMenu } from '@/components/Menu.tsx'
import { Trans } from '@lingui/react/macro'
import React, { type ReactNode, useState } from 'react'
import { ChainId, getSupportedChainIdsByEnv } from '@/config/chain.ts'
const options = getSupportedChainIdsByEnv().map((_chainId) => {
  const { logoUrl, label } = CHAIN_INFO[_chainId]
  return {
    icon: logoUrl,
    label,
    value: _chainId,
  }
})
interface ChainSelectProps {
  className?: string
  label?: ReactNode
  value?: ChainId | null
  onChange?: (value: ChainId | null | undefined) => void
  showLabelText?: boolean
}

const ChainSelector = ({
  label,
  className = '',
  value,
  onChange,
  showLabelText = true,
}: ChainSelectProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    setAnchorEl(event.currentTarget)
  }
  const handleClose = () => {
    setAnchorEl(null)
  }
  const handleChange = (_value?: number) => {
    onChange?.(_value)
    handleClose()
  }

  return (
    <>
      <Box
        className={`flex min-h-[30px] cursor-pointer items-center gap-[4px] pr-[12px] ${className}`}
        id="basic-button"
        aria-controls={open ? 'basic-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onClick={handleClick}
      >
        {label ? (
          label
        ) : (
          <>
            <Box className={'h-[18px] w-[18px] rounded-full'}>
              {value === null || value === undefined ? (
                <GlobalLine size={18} className={'text-white'} />
              ) : (
                <CoinIcon size={18} icon={CHAIN_INFO?.[value]?.logoUrl ?? ''} />
              )}
            </Box>
            {showLabelText && (
              <span className={'text-[14px] text-white'}>
                {value === null || value === undefined ? (
                  <Trans>All Chains</Trans>
                ) : (
                  CHAIN_INFO?.[value]?.label
                )}
              </span>
            )}
          </>
        )}

        <ArrowDown size={12} className={'text-white'} />
      </Box>
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
        <MenuItem
          className={'!hover:bg-base-bg'}
          key={'all'}
          onClick={() => handleChange(undefined)}
          disableRipple
        >
          <GlobalLine size={24} />
          <span>
            <Trans>All Chain</Trans>
          </span>
        </MenuItem>
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
    </>
  )
}

export default ChainSelector
