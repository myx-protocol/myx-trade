import { Box, Button, MenuItem } from '@mui/material'
import { ChainId, getSupportedChainIdsByEnv } from '@/config/chain.ts'
import { Trans } from '@lingui/react/macro'
import { CHAIN_INFO } from '@/config/chainInfo.ts'
import { ArrowDown } from '@/components/Icon'
import { useState } from 'react'
import { StyledMenu } from '@/components/Menu.tsx'

export const ChainDropDownMenu = ({
  chainId,
  setChainId,
  className = '',
}: {
  chainId?: number | ChainId
  setChainId: (chainId?: number | ChainId) => void
  className?: string
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }
  const handleClose = () => {
    setAnchorEl(null)
  }
  return (
    <Box>
      <Button
        id="basic-button"
        aria-controls={open ? 'basic-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onClick={handleClick}
        className={'text-secondary !text-secondary p-[0] text-[12px]'}
      >
        {!chainId ? <Trans>All Chain</Trans> : CHAIN_INFO[chainId].chainSymbol}
        <ArrowDown size={16} className={'ml-[2px]'} />
      </Button>
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
        {getSupportedChainIdsByEnv().map((_chainId) => {
          const { logoUrl, label, chainSymbol } = CHAIN_INFO[_chainId]
          return (
            <MenuItem
              disableRipple
              key={_chainId}
              className={`flex shrink-0 snap-start items-center gap-[2px] rounded-[4px] px-[8px] py-[6px] ${chainId === _chainId ? 'bg-base text-white' : 'text-secondary'}`}
              onClick={() => {
                setChainId(_chainId)
                handleClose()
              }}
            >
              <Box className={'flex items-center gap-[8px] text-[12px] leading-[1] font-[500]'}>
                <Box className={''}>
                  <img src={logoUrl} alt="Logo" width={16} height={16} />
                </Box>
                <span>{chainSymbol}</span>
              </Box>
            </MenuItem>
          )
        })}
      </StyledMenu>
    </Box>
  )
}
