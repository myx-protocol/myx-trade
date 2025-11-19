import IconLanguage from '@/assets/svg/header/language.svg?react'
import { HoverCard } from '../../UI/HoverCard'
import { AVAILABLE_LOCALES, LOCALE_OPTIONS } from '@/locales/locale'
import clsx from 'clsx'
import useGlobalStore from '@/store/globalStore'
import { useState } from 'react'

export const HeaderLanguage = () => {
  const { activeLocale, setActiveLocale } = useGlobalStore()
  const [isOpen, setIsOpen] = useState(false)

  const handleChangeLocale = (locale: AVAILABLE_LOCALES) => {
    setActiveLocale(locale)
    setIsOpen(false) // 点击后关闭弹出层
  }

  return (
    <HoverCard
      offset={23}
      open={isOpen}
      onOpenChange={setIsOpen}
      trigger={
        <div className="flex cursor-pointer items-center gap-[10px]">
          <IconLanguage className="h-[16px] w-[16px]" />
        </div>
      }
    >
      <div className="flex flex-col">
        {LOCALE_OPTIONS.map((option) => (
          <div
            className={clsx(
              'cursor-pointer rounded-[8px] p-[16px] text-[12px] leading-[12px] font-normal text-white select-none',
              {
                'hover:bg-[#26272D]': option.locale !== activeLocale,
                'bg-[#26272D]': option.locale === activeLocale,
              },
            )}
            key={option.locale}
            onClick={() => handleChangeLocale(option.locale)}
          >
            {option.label}
          </div>
        ))}
      </div>
    </HoverCard>
  )
}
