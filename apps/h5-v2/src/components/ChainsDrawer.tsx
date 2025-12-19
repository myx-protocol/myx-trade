import { type ChainId, getSupportedChainIdsByEnv } from '@/config/chain'
import { Drawer } from '@/components/Drawer.tsx'
import { CHAIN_INFO } from '@/config/chainInfo.ts'
import { Box, type BoxProps } from '@mui/material'
import type { ReactNode } from 'react'
import { GlobalLine, SuccessFill } from '@/components/Icon'
import { chain } from 'lodash-es'
import { Trans } from '@lingui/react/macro'

export interface ChainsDrawerProps {
  open: boolean
  onClose: () => void
  chainId?: ChainId
  onChainChange: (chainId?: ChainId) => void
  onOpen?: () => void
  showAllChain?: boolean
}

const ChainItem = ({
  selected,
  className,
  children,
  ...props
}: { selected: boolean; children: ReactNode } & BoxProps) => {
  return (
    <Box
      className={`flex items-center justify-between gap-[12px] p-[16px] ${className}`}
      {...props}
    >
      <Box className={'flex flex-1 items-center gap-[12px]'}>{children}</Box>
      {selected && <SuccessFill size={20} className={'flex-shrink-0'} />}
    </Box>
  )
}
export const ChainsDrawer = ({
  open,
  chainId,
  onChainChange,
  onClose,
  onOpen = () => {},
  showAllChain = true,
}: ChainsDrawerProps) => {
  return (
    <Drawer open={open} onClose={onClose} onOpen={onOpen} anchor={'bottom'}>
      {showAllChain && (
        <ChainItem selected={!chainId} key={'all'} onClick={() => onChainChange(undefined)}>
          <Box className={'flex-shrink-0 text-white'}>
            <GlobalLine size={24} />
          </Box>
          <span className={'text-[16px] leading-[1] font-[500] text-white'}>
            <Trans>All Chain</Trans>
          </span>
        </ChainItem>
      )}
      {getSupportedChainIdsByEnv().map((_chainId) => {
        const { logoUrl, label } = CHAIN_INFO[_chainId]
        return (
          <ChainItem
            key={_chainId}
            onClick={() => onChainChange(_chainId)}
            selected={chainId === _chainId}
          >
            <Box className={'flex-shrink-0'}>
              <img src={logoUrl} alt="Logo" width={24} height={24} />
            </Box>
            <span className={'text-[16px] leading-[1] font-[500] text-white'}>{label}</span>
          </ChainItem>
        )
      })}
    </Drawer>
  )
}
