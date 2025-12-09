import IconYes from '@/components/Icon/set/Yes'
import { InfoButton, PrimaryButton } from '@/components/UI/Button'
import { Trans } from '@lingui/react/macro'
import clsx from 'clsx'
import { useState } from 'react'

const FavoriteTokenItem = () => {
  const [checked, setChecked] = useState(false)
  return (
    <div
      className="flex items-center justify-between rounded-[8px] bg-[#18191F] p-[16px]"
      role="button"
      onClick={() => {
        setChecked(!checked)
      }}
    >
      <div>
        <p className="flex items-center gap-[2px]">
          <span className="text-[16px] leading-[1.2] font-medium text-white">ETH</span>
          <span className="text-[14px] leading-[1.2] font-normal text-[#848E9C]">USDC</span>
        </p>
        <p className="mt-[6px] text-[14px] leading-[1.2] font-normal text-[#848E9C]">Ethereum</p>
      </div>
      {/* checkbox */}
      <div
        className={clsx(
          'flex h-[16px] w-[16px] items-center justify-center rounded-[999px] border-[1px]',
          {
            'border-[#white] bg-white': checked,
            'border-[#848E9C] bg-transparent': !checked,
          },
        )}
      >
        <IconYes size={10} color="#18191F" />
      </div>
    </div>
  )
}

export const SelectFavoritesToken = () => {
  return (
    <div className="mt-[12px] px-[16px] py-[12px]">
      <p className="text-[16px] leading-[1.2] font-medium text-[#848E9C]">
        <Trans>Select Token</Trans>
      </p>
      <div className="mt-[20px] grid grid-cols-2 gap-[12px]">
        {new Array(4).fill(0).map((_, index) => (
          <FavoriteTokenItem key={index} />
        ))}
      </div>
      <div className="mt-[20px]">
        <InfoButton
          style={{
            width: '100%',
            height: '40px',
            borderRadius: '999px',
            fontSize: '14px',
            lineHeight: '1',
            fontWeight: 500,
            padding: '14px',
            color: '#4D515C',
          }}
        >
          <Trans>Add to Favorites</Trans>
        </InfoButton>
      </div>
    </div>
  )
}
