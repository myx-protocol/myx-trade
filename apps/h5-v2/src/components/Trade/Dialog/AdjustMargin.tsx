import { DialogBase } from '@/components/UI/DialogBase'
import { Trans } from '@lingui/react/macro'
import { useMemo, useState } from 'react'
import { MenuItem, Select as MuiSelect } from '@mui/material'
import { NumberInputPrimitive } from '@/components/UI/NumberInput/NumberInputPrimitive'
import { Tooltips } from '@/components/UI/Tooltips'
import Up from '@/components/Icon/set/Up'
import { PrimaryButton } from '@/components/UI/Button'
import { t } from '@lingui/core/macro'
import EditIcon from '@/components/UI/Icon/EditIcon'
import { DirectionEnum, OracleType } from '@myx-trade/sdk'
import clsx from 'clsx'
import { parseBigNumber } from '@/utils/bn'
import { useTotalAvailableBalance } from '@/hooks/balance/use-total-available-balance'
import { ethers } from 'ethers'
import usdcIcon from '@/assets/icon/chainIcon/usdc.svg'
import usdtIcon from '@/assets/icon/chainIcon/usdt.svg'
import { displayAmount } from '@/utils/number'
import { useMyxSdkClient } from '@/providers/MyxSdkProvider'
import { toast } from '@/components/UI/Toast'
import { useGetPoolList } from '../hooks/use-get-pool-list'

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

export const AdjustMarginDialog = ({ position }: { position: any }) => {
  const [open, setOpen] = useState(false)
  const totalBalanceString = useTotalAvailableBalance()
  const totalBalance = ethers.formatUnits(totalBalanceString, position?.quoteDecimals ?? 6)
  const [adjustMargin, setAdjustMargin] = useState('')
  const { client } = useMyxSdkClient()
  const { poolList } = useGetPoolList()

  const pool = useMemo(() => {
    return poolList.find((item: any) => item.poolId === position?.poolId)
  }, [poolList, position?.poolId])

  return (
    <>
      <div className="ml-[4px] cursor-pointer" role="button" onClick={() => setOpen(true)}>
        <EditIcon onClick={() => setOpen(true)} />
      </div>
      {open && (
        <DialogBase title={t`Adjust Margin`} open={open} onClose={() => setOpen(false)}>
          {/* pair level info */}
          <p
            className={clsx(
              'mt-[6px] text-[14px] leading-[1] font-bold',
              position?.direction === DirectionEnum.Long ? 'text-rise' : 'text-fall',
            )}
          >
            <span>
              {position?.baseSymbol}/{position?.quoteSymbol}
            </span>
            <span className="ml-[4px] text-[14px]">{position?.userLeverage}x</span>
          </p>

          {/* margin */}
          <div className="border-b border-[#31333D] py-[20px] leading-[1]">
            <div className="flex items-center justify-between text-[12px] font-medium text-[#9397A3]">
              <p>
                <Trans>Margin</Trans>
              </p>
              <p className="text-[#CED1D9]">
                {displayAmount(position?.collateralAmount)} {position?.quoteSymbol}
              </p>
            </div>

            {/* liquidation price */}
            <div className="mt-[8px] flex items-center justify-between text-[12px] font-medium text-[#9397A3]">
              <p>
                <Trans>Liq. Price</Trans>
              </p>
              <p>--</p>
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
                <span className="ml-[4px] text-[#CED1D9]">
                  {displayAmount(totalBalance).toString()} {position?.quoteSymbol}
                </span>
              </div>
            </div>

            {/* form items */}
            <div className="mt-[12px] flex h-[44px] items-center gap-[8px]">
              <AdjustMarginSelect />
              <div className="relative flex h-[44px] flex-[1_1_0%] rounded-[8px] bg-[#202129] px-[12px]">
                <NumberInputPrimitive
                  placeholder={t`Please enter the amount.`}
                  value={adjustMargin}
                  onValueChange={(e) => setAdjustMargin(e.value)}
                />
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
                <img
                  src={position?.quoteSymbol === 'USDT' ? usdtIcon : usdcIcon}
                  alt=""
                  className="h-[16px] w-[16px]"
                />
                <Tooltips title="1.00005 AVAX ($ 14.10)">
                  <p className="cursor-help border-b-[1px] border-dashed border-[#fff] text-[#CED1D9]">
                    1.0000 {position?.quoteSymbol}
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
                <span className="text-[#CED1D9]">
                  {parseBigNumber(adjustMargin).toString()} {position?.quoteSymbol}
                </span>
                {!parseBigNumber(adjustMargin).eq(0) && (
                  <>
                    {parseBigNumber(adjustMargin).gt(0) ? (
                      <Up size={16} color="#00E3A5" />
                    ) : (
                      <Up size={16} color="#EC605A" className="rotate-180" />
                    )}
                  </>
                )}
              </div>
            </div>
            {/* liquidation price */}
            <div className="mt-[8px] flex items-center justify-between text-[12px] font-medium text-[#9397A3]">
              <p>
                <Trans>Liq. Price</Trans>
              </p>
              <div className="flex">
                <span className="text-[#CED1D9]">--</span>
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
              onClick={async () => {
                const data = {
                  poolId: position.poolId,
                  positionId: position.positionId,
                  adjustAmount: ethers
                    .parseUnits(adjustMargin, pool?.quoteDecimals ?? 6)
                    .toString(),
                  quoteToken: pool?.quotePoolToken ?? '',
                  poolOracleType: OracleType.Chainlink,
                }

                const rs = await client?.position.adjustCollateral(data)
                if (rs?.code === 0) {
                  toast.success({ title: t`Adjust margin success` })
                } else {
                  toast.error({ title: t`Adjust margin failed` })
                }
              }}
            >
              <Trans>Confirm</Trans>
            </PrimaryButton>
          </div>
        </DialogBase>
      )}
    </>
  )
}
