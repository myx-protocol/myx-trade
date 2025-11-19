import { Trans } from '@lingui/react/macro'
import Box from '@mui/material/Box'
import { ArrowDown, TipsOutLine } from '@/components/Icon'
import { useCallback, useContext, useState } from 'react'
import { TokenInfo } from '@/pages/Market/components/TokenInfo.tsx'
import { TokenContext } from '@/pages/Market/context.ts'
import { DialogTokenSelect } from '@/components/Dialog/DialogTokenSelect.tsx'
import { Button } from '@mui/material'

export const TokenSelect = ({ onNext }: { onNext: () => void }) => {
  const { token, quote } = useContext(TokenContext)
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const onHandleClick = useCallback(async () => {
    try {
      setLoading(true)
      onNext?.()
    } finally {
      setLoading(false)
    }
  }, [onNext])

  return (
    <>
      <Box className={'flex flex-1 flex-col'}>
        <h2 className={'text-[24px] leading-[1] font-[700] text-white'}>
          <Trans>Select token</Trans>
        </h2>
        <div className={'mt-[8px] leading-[1]'}>
          <Trans>Enter the token address for the new perpetuals market.</Trans>
        </div>

        <Box className={'mt-[40px] flex flex-col gap-[10px]'}>
          <label className={'flex items-center gap-[4px]'}>
            <Trans>选择您的资产</Trans> <TipsOutLine size={16} />
          </label>
          <Box
            className={
              'bg-base-bg flex min-h-[62px] cursor-pointer items-center justify-between rounded-[10px] px-[16px] py-[20px]'
            }
            onClick={() => setOpen(true)}
          >
            {token ? (
              <TokenInfo />
            ) : (
              <span className={'text-[18px] leading-[1.2] font-[500] text-white'}>
                <Trans>Select a token</Trans>
              </span>
            )}

            <ArrowDown size={20} className={'text-regular'} />
          </Box>
        </Box>

        <Box className={'mt-[32px] flex flex-col gap-[10px]'}>
          <label className={'flex items-center gap-[4px]'}>
            <Trans>选择合约计价资产</Trans> <TipsOutLine size={16} />
          </label>
          <Box
            className={
              'bg-base-bg flex min-h-[62px] cursor-pointer items-center justify-between rounded-[10px] px-[16px] py-[20px]'
            }
          >
            <span className={'text-[18px] leading-[1.2] font-[500] text-white'}>
              {quote?.symbol || 'USD'}
            </span>
            <ArrowDown size={20} className={'text-regular'} />
          </Box>
        </Box>

        <Box className={'mx-auto mt-[40px] w-full'}>
          <Button
            loading={loading}
            className={'gradient primary long w-full rounded'}
            disabled={!token}
            onClick={onHandleClick}
          >
            <Trans>Next</Trans>
          </Button>
        </Box>
      </Box>
      <DialogTokenSelect open={open} onClose={() => setOpen(false)} />
    </>
  )
}
