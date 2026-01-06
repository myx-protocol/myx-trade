import { Dialog } from '@mui/material'
import { CloseIcon } from '../Icon'
import { Share } from '@/components/Icon'
import type { HTMLAttributeAnchorTarget } from 'react'
import { useRef, useState } from 'react'
import myx_logo from '@/assets/home/myx-logo.svg'
import { Trans } from '@lingui/react/macro'
import { PrimaryButton } from '@/components/UI/Button'
import share_qrcode from '@/assets/home/share_qrcode.png'
import share_position_profit from '@/assets/home/share_profit.png'
import share_position_loss from '@/assets/home/share_loss.png'
import * as htmlToImage from 'html-to-image'
import { toast } from '@/components/UI/Toast'
import { t } from '@lingui/core/macro'
import { Direction } from '@myx-trade/sdk'
import { parseBigNumber } from '@/utils/bn'
import { displayAmount } from '@/utils/number'

type ALinkProps = {
  href: string
  target?: HTMLAttributeAnchorTarget
  fileName?: string
}
const aLink = ({ href, target = '_blank', fileName = 'download' }: ALinkProps) => {
  const aLink = document.createElement('a')
  aLink.href = href
  aLink.target = target
  aLink.download = fileName
  document.body.append(aLink)
  aLink.click()
  aLink.remove()
}

const exportImage = async (root: HTMLElement, fileName?: string): Promise<void> => {
  aLink({
    href: await htmlToImage.toJpeg(root),
    fileName,
  })
}

export const SharePositionDialog = ({
  position,
  roe,
  price,
}: {
  position?: any
  roe: string
  price: string
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)

  const [saveLoading, setSaveLoading] = useState(false)

  return (
    <>
      <Share size={16} onClick={() => setOpen(true)} />
      <Dialog
        ref={containerRef}
        open={open}
        onClose={() => setOpen(false)}
        sx={{
          zIndex: 999,
          '& .MuiDialog-container': {
            alignItems: 'center',
          },
        }}
        slotProps={{
          paper: {
            sx: {
              padding: '16px',
              backgroundColor: '#18191F',
              borderTopRightRadius: '16px',
              borderTopLeftRadius: '16px',
              borderBottomRightRadius: '0px',
              borderBottomLeftRadius: '0px',
              border: '1px solid #2C2D33',
              minHeight: 451,
              boxShadow: '0px 8px 32px 0px #00000052',
              paddingBottom: '24px',
              width: '100%',
              mx: 'auto',
              margin: '0px 12px',
            },
          },
        }}
      >
        <div className="flex w-full items-center justify-end">
          <CloseIcon size={16} onClick={() => setOpen(false)} color="#464852" />
        </div>
        <div className="flex w-full items-center">
          <img src={myx_logo} alt="" />
          <div className="mx-[12px] h-[24px] w-[1px] bg-[#848e9c]" />
          <p className="text-[12px] text-[#ced1d9]">
            <Trans>The Most Scalable Derivatives Protocol</Trans>
          </p>
        </div>
        <div className="mt-[20px] flex w-full items-center">
          <span className="text-[16px] font-[700] text-[white]">
            {position?.baseSymbol}/{position?.quoteSymbol}
          </span>
          <span
            className="ml-[12px] text-[12px]"
            style={{ color: position?.direction === Direction.LONG ? '#00E3A5' : '#ec605a' }}
          >
            {position?.direction === Direction.LONG ? (
              <Trans>Open Long</Trans>
            ) : (
              <Trans>Open Short</Trans>
            )}
          </span>
          <div className="mx-[12px] h-[24px] w-[1px] bg-[#464852]" />
          <span className="text-[12px] text-[#848e9c]">{position?.userLeverage}x</span>
        </div>
        <div className="mt-[20px] flex w-full items-center">
          <span className="text-[12px] text-[white]">
            <Trans>ROE</Trans>
          </span>
        </div>
        <div
          className="w-full text-[20px] font-[700]"
          style={{ color: parseBigNumber(roe ?? '0').gt(0) ? '#00E3A5' : '#ec605a' }}
        >
          {parseBigNumber(roe ?? '0').toFixed(2)}%
        </div>
        <div className="mt-[20px] flex w-full items-center">
          <p className="w-[100px] text-[12px] text-[#848e9c]">
            <Trans>Entry Price</Trans>
          </p>
          <span className="ml-[12px] text-[14px] text-[white]">
            {displayAmount(position?.entryPrice ?? '0')}
          </span>
        </div>
        <div className="mt-[6px] flex w-full items-center">
          <p className="w-[100px] text-[12px] text-[#848e9c]">
            <Trans>Latest Price</Trans>
          </p>
          <span className="ml-[14px] text-[12px] text-[white]">{displayAmount(price ?? '0')}</span>
        </div>
        <div className="mt-[20px] rounded-[12px]">
          <img src={share_qrcode} alt="" className="h-[104px] w-[104px]" />
          <span className="text-[12px] text-[#848e9c]">
            <Trans>Scan to Visit MYX</Trans>
          </span>
        </div>
        <div className="mt-[100px] flex items-center gap-[12px]">
          <PrimaryButton
            className="w-full rounded-[8px]"
            onClick={() => {
              const url = `https://app.myx.finance/trade`
              const shareText = t`Join MYX Trading now to enjoy ultra-low fees and earn generous airdrop rewards! `
              window.open(
                `https://twitter.com/intent/tweet?text=${shareText}&url=${encodeURIComponent(url)}`,
              )
            }}
          >
            <Trans>Share Twitter</Trans>
          </PrimaryButton>
          <PrimaryButton
            loading={saveLoading}
            className="w-full rounded-[8px]"
            style={{ background: '#4d515c', color: '#fff' }}
            onClick={() => {
              setSaveLoading(true)
              exportImage(containerRef.current as HTMLElement, 'share')
                .catch((err) => {
                  toast.error({
                    title: t`save failed`,
                  })
                  console.error(err)
                })
                .finally(() => {
                  setSaveLoading(false)
                })
            }}
          >
            <Trans>Save as Picture</Trans>
          </PrimaryButton>
        </div>
        <img
          src={parseBigNumber(roe ?? '0').gt(0) ? share_position_profit : share_position_loss}
          alt=""
          className="absolute right-[20px] bottom-[100px] h-[202px] w-[auto]"
        />
      </Dialog>
    </>
  )
}
