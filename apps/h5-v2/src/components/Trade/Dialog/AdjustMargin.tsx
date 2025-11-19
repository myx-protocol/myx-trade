import { DialogBase } from '@/components/UI/DialogBase'
import { Trans } from '@lingui/react/macro'
import { useState } from 'react'
import { MenuItem, Select as MuiSelect } from '@mui/material'
import { NumberInputPrimitive } from '@/components/UI/NumberInput/NumberInputPrimitive'
import { CoinIcon } from '@/components/UI/CoinIcon'
import { Tooltips } from '@/components/UI/Tooltips'
import Up from '@/components/Icon/set/Up'
import { PrimaryButton } from '@/components/UI/Button'
import { t } from '@lingui/core/macro'

function AdjustMarginSelect() {
  return (
    <MuiSelect
      value={'increase'}
      sx={{
        outline: 'none',
        color: 'white',
        fontSize: '12px',
        lineHeight: 1,
        fontWeight: 500,
        '& .MuiOutlinedInput-notchedOutline': {
          outline: 'none',
          border: 'none',
        },
        '& .MuiOutlinedInput-input': {
          paddingRight: '24px',
          paddingLeft: '12px',
          paddingTop: '16px',
          paddingBottom: '16px',
          minHeight: '12px',
          borderRadius: '8px',
          background: '#202129',
        },
        '& .MuiSvgIcon-root': {
          color: 'white',
          right: '12px',
        },
      }}
      MenuProps={{
        sx: {
          '& .MuiPaper-root': {
            backgroundColor: '#202129',
            color: 'white',
          },
          '& .MuiMenuItem-root': {
            fontSize: '14px',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            backgroundColor: '#202129 !important',
            '&:hover': {
              backgroundColor: '#18191F !important',
            },
            '&.Mui-selected': {
              backgroundColor: '#18191F !important',
            },
          },
        },
      }}
      onChange={(e) => {
        console.log(e.target.value)
      }}
    >
      <MenuItem value="increase" className="text-[12px]">
        <Trans>Increase</Trans>
      </MenuItem>
      <MenuItem value="decrease">
        <Trans>Decrease</Trans>
      </MenuItem>
    </MuiSelect>
  )
}

export const AdjustMarginDialog = () => {
  const [open, setOpen] = useState(false)
  return (
    <DialogBase title={t`Adjust Margin`} open={open} onClose={() => setOpen(false)}>
      {/* pair level info */}
      <p className="text-rise mt-[6px] text-[14px] leading-[1] font-bold">
        <span>BTCUSDT</span>
        <span className="ml-[4px] text-[14px]">15x</span>
      </p>

      {/* margin */}
      <div className="border-b border-[#31333D] py-[20px] leading-[1]">
        <div className="flex items-center justify-between text-[12px] font-medium text-[#9397A3]">
          <p>
            <Trans>Margin</Trans>
          </p>
          <p className="text-[#CED1D9]">123123 USDC</p>
        </div>

        {/* liquidation price */}
        <div className="mt-[8px] flex items-center justify-between text-[12px] font-medium text-[#9397A3]">
          <p>
            <Trans>Liq. Price</Trans>
          </p>
          <p>123123 USDC</p>
        </div>
      </div>

      {/* form */}

      <div className="mt-[20px] leading-[1]">
        {/* title */}
        <div className="flex items-center justify-between">
          <p className="text-[14px] font-medium text-[#fff]">
            <Trans>Adjust Margin</Trans>
          </p>
          <div className="text-[12px] font-medium">
            <span className="text-[#848E9C]">
              <Trans>Max</Trans>
            </span>
            <span className="ml-[4px] text-[#CED1D9]">123123 USDC</span>
          </div>
        </div>

        {/* form items */}
        <div className="mt-[12px] flex h-[44px] items-center gap-[8px]">
          <AdjustMarginSelect />
          <div className="relative flex h-[44px] flex-[1_1_0%] rounded-[8px] bg-[#202129] px-[12px]">
            <NumberInputPrimitive placeholder="123123" />
            <div className="absolute top-[50%] right-[12px] translate-y-[-50%] text-[12px] text-[#00E3A5]">
              <Trans>Max</Trans>
            </div>
          </div>
        </div>

        {/* pay */}
        <div className="mt-[16px] flex items-center justify-between text-[12px] font-medium">
          <p className="text-[#9397A3]">
            <Trans>Pay</Trans>
          </p>
          <div className="flex gap-[4px]">
            <CoinIcon
              size={16}
              icon="https://assets.coingecko.com/coins/images/1/standard/bitcoin.png?1696501400"
            />
            <Tooltips title="1.00005 AVAX ($ 14.10)">
              <p className="cursor-help border-b-[1px] border-dashed border-[#fff] text-[#CED1D9]">
                1.00005 AVAX ($ 14.10)
              </p>
            </Tooltips>
          </div>
        </div>
      </div>

      {/* tips */}
      <div className="mt-[24px] border-t-[1px] border-t-[#31333D] py-[20px]">
        {/* adjusted margin */}
        <div className="flex items-center justify-between text-[12px] font-medium text-[#9397A3]">
          <p>
            <Trans>Adjusted Margin</Trans>
          </p>
          <div className="flex">
            <span className="text-[#CED1D9]">1,2323 USDC</span>
            <span>
              <Up size={16} color="#00E3A5" />
            </span>
          </div>
        </div>
        {/* liquidation price */}
        <div className="mt-[8px] flex items-center justify-between text-[12px] font-medium text-[#9397A3]">
          <p>
            <Trans>Liq. Price</Trans>
          </p>
          <div className="flex">
            <span className="text-[#CED1D9]">1,2323 USDC</span>
            <span>
              <Up size={16} color="#EC605A" className="rotate-180" />
            </span>
          </div>
        </div>
      </div>

      {/* buttons */}
      <div className="pt-[20px]">
        <PrimaryButton
          style={{
            borderRadius: '44px',
            height: '44px',
            width: '100%',
            fontSize: '14px',
            fontWeight: 500,
          }}
        >
          <Trans>Confirm</Trans>
        </PrimaryButton>
      </div>
    </DialogBase>
  )
}
