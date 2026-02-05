import { Trans } from '@lingui/react/macro'
import Box from '@mui/material/Box'
import { ArrowDown, TipsOutLine } from '@/components/Icon'
import React, { useCallback, useContext, useState } from 'react'
import { TokenInfo } from '@/pages/Market/components/TokenInfo.tsx'
import { TokenContext } from '@/pages/Market/context.ts'
import { DialogTokenSelect } from '@/components/Dialog/DialogTokenSelect.tsx'
import { Button, MenuItem } from '@mui/material'
import { useNavigate, useParams } from 'react-router-dom'
import { Tooltips } from '@/components/UI/Tooltips'
import { t } from '@lingui/core/macro'
import { StyledMenu } from '@/components/Menu.tsx'

export const TokenSelect = ({ onNext }: { onNext: () => void }) => {
  const navigate = useNavigate()
  const { token, quote, market, setMarketIndex, markets } = useContext(TokenContext)
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const quoteOpen = Boolean(anchorEl)

  const onHandleClick = useCallback(async () => {
    try {
      setLoading(true)
      await onNext?.()
    } finally {
      setLoading(false)
    }
  }, [onNext])

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!token) {
      event.preventDefault()
      event.stopPropagation()
      setAnchorEl(null)
    } else {
      setAnchorEl(event.currentTarget)
    }
  }
  const handleClose = () => {
    setAnchorEl(null)
  }
  const handleChange = (_value?: number) => {
    if (Number(_value) >= 0) {
      setMarketIndex(_value as number)
    }

    handleClose()
  }

  return (
    <>
      <Box className={'flex flex-1 flex-col'}>
        <h2 className={'text-[18px] leading-[1] font-[700] text-white'}>
          <Trans>Select token</Trans>
        </h2>
        <div className={'text-secondary mt-[8px] text-[12px] leading-[1]'}>
          <Trans>Enter the token address for the new perpetuals market.</Trans>
        </div>

        <Box className={'mt-[24px] flex flex-col gap-[10px]'}>
          <label
            className={
              'text-secondary flex items-center gap-[4px] text-[14px] leading-[1.2] font-[500]'
            }
          >
            <Trans>选择您的资产</Trans>
            <Tooltips
              title={t`Select the asset that will be the subject of the contract (e.g., a Meme token).`}
            >
              <TipsOutLine size={16} className={'cursor-pointer'} />
            </Tooltips>
          </label>
          <Box
            className={
              'bg-base-bg flex min-h-[56px] cursor-pointer items-center justify-between rounded-[10px] px-[16px] py-[20px]'
            }
            onClick={() => setOpen(true)}
          >
            {token ? (
              <TokenInfo />
            ) : (
              <span className={'text-[14px] leading-[1] font-[500] text-white'}>
                <Trans>Select a token</Trans>
              </span>
            )}

            <ArrowDown size={20} className={'text-regular'} />
          </Box>
        </Box>

        <Box className={'mt-[24px] flex flex-col gap-[10px]'}>
          <label
            className={
              'text-secondary flex items-center gap-[4px] text-[14px] leading-[1.2] font-[500]'
            }
          >
            <Trans>选择合约计价资产</Trans>
            <Tooltips title={t`Select the currency used for pricing and settling contract PnL`}>
              <TipsOutLine size={16} className={'cursor-pointer'} />
            </Tooltips>
          </label>
          <Box
            className={
              'bg-base-bg flex min-h-[62px] cursor-pointer items-center justify-between rounded-[10px] px-[16px] py-[20px]'
            }
            id="basic-button"
            aria-controls={quoteOpen ? 'basic-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={quoteOpen ? 'true' : undefined}
            onClick={handleClick}
          >
            <span className={'text-[14px] leading-[1] font-[500] text-white'}>
              {quote?.symbol || 'USDC'}
            </span>
            {!!token && <ArrowDown size={20} className={'text-regular'} />}
          </Box>
          <StyledMenu
            id="basic-mode-menu"
            anchorEl={anchorEl}
            open={quoteOpen}
            onClose={handleClose}
            slotProps={{
              list: {
                'aria-labelledby': 'basic-button',
              },
              paper: {
                sx: {
                  width: anchorEl?.clientWidth,
                },
              },
            }}
          >
            {(markets || []).map((option, index) => {
              return (
                <MenuItem
                  className={'!hover:bg-base-bg'}
                  key={index}
                  onClick={() => handleChange(index)}
                  disableRipple
                >
                  <span>{option.quoteSymbol}</span>
                </MenuItem>
              )
            })}
          </StyledMenu>
        </Box>

        <Box className={'mx-auto mt-[24px] w-full'}>
          <Button
            loading={loading}
            className={'gradient primary long w-full rounded'}
            disabled={!token || !market}
            onClick={onHandleClick}
            loadingPosition="start"
          >
            <Trans>Next</Trans>
          </Button>
        </Box>
      </Box>
      <DialogTokenSelect
        open={open}
        onClose={(_, asset) => {
          setOpen(false)
          if (asset) {
            navigate(`/market/${asset?.chainId}/${asset.address}`, { replace: true })
          }
        }}
      />
    </>
  )
}
