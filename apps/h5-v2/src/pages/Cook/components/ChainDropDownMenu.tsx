import { Box, Button, MenuItem } from '@mui/material'
import { ChainId, getSupportedChainIdsByEnv } from '@/config/chain.ts'
import { Trans } from '@lingui/react/macro'
import { CHAIN_INFO } from '@/config/chainInfo.ts'
import { ArrowDown } from '@/components/Icon'
import { useState } from 'react'
import { StyledMenu } from '@/components/Menu.tsx'
import { ChainsDrawer } from '@/components/ChainsDrawer.tsx'

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
  const [open, setOpen] = useState<boolean>(false)
  // const open = Boolean(anchorEl)
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    // setAnchorEl(event.currentTarget)
    setOpen(true)
  }
  const handleClose = () => {
    // setAnchorEl(null)
    setOpen(false)
  }

  const handleChainChange = (chainId?: ChainId) => {
    setChainId(chainId)
    handleClose()
  }
  return (
    <>
      <Button
        id="basic-button"
        aria-controls={open ? 'basic-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onClick={handleClick}
        className={'text-secondary !text-secondary p-[0] !pr-[0] !text-[12px]'}
      >
        {!chainId ? <Trans>All Chain</Trans> : CHAIN_INFO[chainId].chainSymbol}
        <ArrowDown size={16} className={'ml-[2px]'} />
      </Button>

      <ChainsDrawer
        chainId={chainId}
        open={open}
        onClose={handleClose}
        onChainChange={(chainId) => handleChainChange(chainId)}
      />
    </>
  )
}
