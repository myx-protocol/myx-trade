import { ChainId, getSupportedChainIdsByEnv } from '@/config/chain.ts'
import { CHAIN_INFO } from '@/config/chainInfo.ts'
import { Box } from '@mui/material'
import { Trans } from '@lingui/react/macro'
import { GlobalLine } from '@/components/Icon'
import { useRef } from 'react'

export const ChainsBar = ({
  chainId,
  setChainId,
  className = '',
}: {
  chainId?: number | ChainId
  setChainId: (chainId?: number | ChainId) => void
  className?: string
}) => {
  const containerRef = useRef<HTMLUListElement>(null)

  const scrollToItem = (index: number) => {
    const container = containerRef.current
    if (!container) return

    const child = container.children[index] as HTMLElement
    if (!child) return

    // 计算左侧 padding 的偏移
    const offset = child.offsetLeft - 16
    container.scrollTo({
      left: offset,
      behavior: 'smooth',
    })
  }
  return (
    <ul
      ref={containerRef}
      className={`no-scrollbar flex w-full snap-x snap-mandatory items-center gap-[12px] overflow-x-auto py-[8px] text-[12px] ${className}`}
      style={{
        paddingLeft: 16, // 左边空白
        paddingRight: 16, // 右边空白
        scrollPaddingLeft: 16, // snap 左边参考
        scrollPaddingRight: 16, // snap 右边参考
      }}
    >
      <li
        key="all"
        className={`flex shrink-0 snap-start items-center gap-[2px] rounded-[4px] px-[8px] py-[6px] transition-all ${chainId === undefined ? 'bg-base text-white' : 'text-secondary'}`}
        onClick={() => {
          setChainId(undefined)
          scrollToItem(0)
        }}
      >
        <Box className={'h-[16px] w-[16px]'}>
          <GlobalLine size={16} />
        </Box>
        <span>
          <Trans>All</Trans>
        </span>
      </li>
      {getSupportedChainIdsByEnv().map((_chainId, index) => {
        const { logoUrl, label } = CHAIN_INFO[_chainId]
        return (
          <li
            key={_chainId}
            className={`flex shrink-0 snap-start items-center gap-[2px] rounded-[4px] px-[8px] py-[6px] ${chainId === _chainId ? 'bg-base text-white' : 'text-secondary'}`}
            onClick={() => {
              setChainId(_chainId)
              scrollToItem(index + 1)
            }}
          >
            <Box className={''}>
              <img
                src={logoUrl}
                alt="Logo"
                width={16}
                height={16}
                className={'border-light-border rounded-full border-1'}
              />
            </Box>
            <span>{label}</span>
          </li>
        )
      })}
    </ul>
  )
}
