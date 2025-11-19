import { useLocation, useNavigate } from 'react-router-dom'
import { Trans } from '@lingui/react/macro'
import { isUndefined } from 'lodash-es'
import { useState } from 'react'
import { HelperDialog } from '@/components/NoticeTeaching'
import Logo from '@/assets/svg/logo.svg?react'
import { ShareIcon } from '@/components/UI/Icon'

interface LinkItemProps {
  isRouter?: boolean
  href?: string
  text: string | React.ReactNode
  showIcon?: boolean
  mt?: string
  onClick?: () => void
  inSide?: boolean
}

const LinkItem = ({
  isRouter = false,
  href,
  text,
  showIcon = true,
  mt = '24px',
  onClick,
  inSide = false,
}: LinkItemProps) => {
  const { pathname } = useLocation()
  const navigate = useNavigate()

  const handleClick = () => {
    if (isRouter && href) {
      if (pathname === href) return false
      if (inSide) {
        navigate(href)
        return
      }
      window.open(href)
    } else if (!isUndefined(href)) {
      if (inSide) {
        navigate(href)
        return
      }
      window.open(href)
    } else {
      onClick?.()
    }
  }

  return (
    <div
      className="flex items-center text-[#CED1D9] hover:opacity-70 text-[14px] font-medium cursor-pointer transition-opacity"
      style={{ marginTop: mt }}
      onClick={handleClick}
    >
      <span>{text}</span>
      {showIcon && <ShareIcon className="w-4 h-4 ml-1" />}
    </div>
  )
}

export const Footer = () => {
  const navigate = useNavigate()
  const [showHelperDialog, setShowHelperDialog] = useState<boolean>(false)

  return (
    <div className="bg-[#101114] pt-[140px]">
      <div className=" max-w-[1200px] mx-auto leading-[1]">
        <div className="flex justify-between w-full border-b border-gray-600 pb-16">
          <div className="flex flex-col justify-between">
            <div>
              <div className="cursor-pointer" onClick={() => navigate('/')}>
                <Logo className="w-[116px] h-[22px]" />
              </div>
              <p className="text-[14px] font-medium mt-[16px] text-[#CED1D9]">
                <Trans>The New Species of Perpetual DEX</Trans>
              </p>
            </div>
            <div>
              <p className="text-[14px] font-normal text-[#848E9C] leading-[16px]">
                <Trans>Collaboration Application</Trans>
              </p>
              <p
                className="text-[14px] font-normal text-[#CED1D9] hover:opacity-70 cursor-pointer transition-opacity mt-[2px] leading-[16px]"
                onClick={() => {
                  window.open('mailto:support@myx.finance')
                }}
              >
                support@myx.finance
              </p>
            </div>
          </div>
          <div className="flex gap-[100px]">
            <div>
              <p className="text-[#80FF95] text-[16px] font-medium">
                <Trans>Community</Trans>
              </p>
              <LinkItem
                mt="32px"
                href="https://twitter.com/MYX_Finance"
                text={<Trans>Twitter</Trans>}
              />
              <LinkItem href="https://discord.com/invite/myx" text={<Trans>Discord</Trans>} />
              <LinkItem href="https://myxfinance.medium.com/" text={<Trans>Medium</Trans>} />
              <LinkItem href="mailto:marketing@myx.finance" text={<Trans>Email</Trans>} />
            </div>
            <div>
              <p className="text-[#80FF95] text-[16px] font-medium">
                <Trans>Ecosystem</Trans>
              </p>
              <LinkItem mt="32px" isRouter href="/trade" inSide text={<Trans>Trade</Trans>} />
              <LinkItem isRouter href="/buy" inSide text={<Trans>Earn</Trans>} />
              <LinkItem isRouter href="/integral" inSide text={<Trans>Airdrop</Trans>} />
            </div>
            <div>
              <p className="text-[#80FF95] text-[16px] font-medium">
                <Trans>Developers</Trans>
              </p>
              <LinkItem
                mt="32px"
                href="https://myxfinance.gitbook.io/myx"
                text={<Trans>Documentation</Trans>}
              />
              <LinkItem
                mt="32px"
                href="https://myxfinance.gitbook.io/myx/protocol/audit"
                text={<Trans>Audit Report</Trans>}
              />
            </div>
            <div>
              <p className="text-[#80FF95] text-[16px] font-medium">
                <Trans>Others</Trans>
              </p>
              <LinkItem
                mt="32px"
                showIcon={false}
                href="https://myxfinance.gitbook.io/myx/"
                text={<Trans>Helper Center</Trans>}
              />
              <LinkItem
                showIcon={false}
                onClick={() => setShowHelperDialog(true)}
                text={<Trans>Beginner's Guide</Trans>}
              />
              <LinkItem href="https://discord.com/invite/myx" text={<Trans>Feedback</Trans>} />
              <LinkItem
                showIcon={false}
                onClick={() => window.open('termsOfUse')}
                text={<Trans>Terms of Use</Trans>}
              />
            </div>
          </div>
        </div>
        <p className="text-[14px] text-[#848E9C] py-[24px] text-center leading-[19px]">
          Copyright © 2024 MYX
        </p>
        <HelperDialog isOpen={showHelperDialog} onClose={() => setShowHelperDialog(false)} />
      </div>
    </div>
  )
}
