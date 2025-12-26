import { DialogTheme, DialogTitleTheme } from '@/components/DialogBase'
import { TpSlTypeEnum } from '../../type'
import { Trans } from '@lingui/react/macro'
import { useMemo, type ReactNode } from 'react'
import clsx from 'clsx'
import useGlobalStore from '@/store/globalStore'
import { DialogBase } from '@/components/UI/DialogBase'

interface TPSLTypeSelectDialogProps {
  open: boolean
  onClose: () => void
  value: TpSlTypeEnum
  onChange: (value: TpSlTypeEnum) => void
  quoteToken: string
}

interface TPSLTypeSelectItemProps {
  value: TpSlTypeEnum
  title: ReactNode
  description: ReactNode
}

export const TPSLTypeSelectDialog = ({
  open,
  onClose,
  value,
  quoteToken,
  onChange,
}: TPSLTypeSelectDialogProps) => {
  const { symbolInfo } = useGlobalStore()
  const tpslTypeList = useMemo<Array<TPSLTypeSelectItemProps>>(() => {
    return [
      {
        value: TpSlTypeEnum.PRICE,
        title: (
          <>
            <Trans>Price</Trans>
            <span className="ml-[2px]">({quoteToken})</span>
          </>
        ),
        description: <Trans>Set TP/SL trigger prices based on the coin price.</Trans>,
      },
      {
        value: TpSlTypeEnum.ROI,
        title: (
          <>
            <Trans>ROI</Trans>
            <span className="ml-[2px]">(%)</span>
          </>
        ),
        description: <Trans>Set TP/SL trigger prices based on the estimated ROl.</Trans>,
      },
      {
        value: TpSlTypeEnum.Change,
        title: (
          <>
            <Trans>Change</Trans>
            <span className="ml-[2px]">(%)</span>
          </>
        ),
        description: (
          <Trans>Set TP/SL trigger prices based on the percentage change in order price</Trans>
        ),
      },
      {
        value: TpSlTypeEnum.Pnl,
        title: (
          <>
            <Trans>PnL</Trans>
            <span className="ml-[2px]">({quoteToken})</span>
          </>
        ),
        description: <Trans>Set TP/SL trigger prices based on the estimated pnl</Trans>,
      },
    ]
  }, [quoteToken])

  const handleChange = (value: TpSlTypeEnum) => {
    onChange?.(value)
    onClose()
  }
  return (
    <DialogBase open={open} onClose={onClose}>
      <DialogTitleTheme className="pb-[20px]! text-[20px]! font-bold">
        <Trans>TP/SL Settings</Trans>
      </DialogTitleTheme>
      <div className="mt-[4px] flex flex-col gap-[10px] px-[16px] pb-[32px]">
        {tpslTypeList.map((item) => (
          <div
            key={item.value}
            className={clsx('rounded-[8px] border-[1px] px-[12px] py-[16px]', {
              'border-[#31333D]': value !== item.value,
              'border-[#ffffff]': value === item.value,
            })}
            role="button"
            onClick={() => handleChange?.(item.value)}
          >
            <div className="text-[14px] leading-[1.2] font-bold text-white">{item.title}</div>
            <div className="mt-[6px] text-[12px] leading-[1.2] font-medium text-[#848E9C]">
              {item.description}
            </div>
          </div>
        ))}
      </div>
    </DialogBase>
    // <DialogTheme open={open} onClose={onClose}>
    //   <DialogTitleTheme onClose={onClose} className="pb-[20px]! text-[20px]! font-bold">
    //     <Trans>TP/SL Settings</Trans>
    //   </DialogTitleTheme>
    //   <div className="mt-[4px] flex flex-col gap-[10px] px-[16px] pb-[32px]">
    //     {tpslTypeList.map((item) => (
    //       <div
    //         key={item.value}
    //         className={clsx('rounded-[8px] border-[1px] px-[12px] py-[16px]', {
    //           'border-[#31333D]': value !== item.value,
    //           'border-[#ffffff]': value === item.value,
    //         })}
    //         role="button"
    //         onClick={() => handleChange?.(item.value)}
    //       >
    //         <div className="text-[14px] leading-[1.2] font-bold text-white">{item.title}</div>
    //         <div className="mt-[6px] text-[12px] leading-[1.2] font-medium text-[#848E9C]">
    //           {item.description}
    //         </div>
    //       </div>
    //     ))}
    //   </div>
    // </DialogTheme>
  )
}
