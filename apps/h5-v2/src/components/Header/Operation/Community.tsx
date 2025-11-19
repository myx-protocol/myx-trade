import IconCommunity from '@/assets/svg/header/community.svg?react'
import IconDiscord from '@/assets/svg/community/discord.svg?react'
import IconTelegram from '@/assets/svg/community/telegram.svg?react'
import IconTwitter from '@/assets/svg/community/twitter.svg?react'
import IconHelp from '@/assets/svg/community/help.svg?react'
import IconFeedBack from '@/assets/svg/community/feedback.svg?react'
import {
  MYX_DISCORD_LINK,
  MYX_TELEGRAM_LINK,
  MYX_TWITTER_LINK,
  MYX_GIT_BOOK_LINK,
  MYX_FEEDBACK_LINK,
} from '@/config'
import { Trans } from '@lingui/react/macro'
import { useState, type ReactNode } from 'react'
import { HoverCard } from '@/components/UI/HoverCard'
import clsx from 'clsx'

type CommunityItem = {
  icon: ReactNode
  url: string
  label: ReactNode
}

const COMMUNITY_LIST: Array<CommunityItem> = [
  {
    icon: <IconDiscord />,
    url: MYX_DISCORD_LINK,
    label: 'Discord',
  },
  {
    icon: <IconTelegram />,
    url: MYX_TELEGRAM_LINK,
    label: 'Telegram',
  },
  {
    icon: <IconTwitter />,
    url: MYX_TWITTER_LINK,
    label: 'Twitter',
  },
  {
    icon: <IconHelp />,
    url: MYX_GIT_BOOK_LINK,
    label: <Trans>Help</Trans>,
  },
  {
    icon: <IconFeedBack />,
    url: MYX_FEEDBACK_LINK,
    label: <Trans>Feedback</Trans>,
  },
]

export const HeaderCommunity = () => {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <HoverCard
      open={isOpen}
      onOpenChange={setIsOpen}
      trigger={
        <div className="flex items-center gap-[10px] cursor-pointer">
          <IconCommunity className="w-[16px] h-[16px]" />
        </div>
      }
    >
      <div className="flex flex-col">
        {COMMUNITY_LIST.map((item) => (
          <div
            key={item.label as string}
            className={clsx(
              'flex items-center gap-[8px] cursor-pointer p-[16px] rounded-[8px] hover:bg-[#26272D]',
            )}
            onClick={() => window.open(item.url, '_blank')}
          >
            <div className=" flex w-[16px] h-[16px]">{item.icon}</div>
            <span className=" text-[12px] font-normal text-white leading-[12px]">{item.label}</span>
          </div>
        ))}
      </div>
    </HoverCard>
  )
}
