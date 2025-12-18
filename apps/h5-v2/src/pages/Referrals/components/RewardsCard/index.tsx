import { Trans } from '@lingui/react/macro'
import { ModuleTitle } from '../ModuleTitle'
import { IncomeCard, InviteCard, RebateCard } from './Card'

export function RewardsCard() {
  return (
    <>
      <div className="lg:hidden">
        <RewardsCardMobile />
      </div>
      <div className="hidden lg:block">
        <RewardsCardDesktop />
      </div>
    </>
  )
}

function RewardsCardMobile() {
  return (
    <div className="mx-auto flex w-full max-w-[500px] flex-col gap-5">
      <ModuleTitle>
        <Trans>One Invitation for Multiple Rewards</Trans>
      </ModuleTitle>

      <div className="flex flex-col gap-3">
        <RebateCard />
        <InviteCard />
        <IncomeCard />
      </div>
    </div>
  )
}

function RewardsCardDesktop() {
  return (
    <div className="flex flex-col gap-8">
      <ModuleTitle>
        <Trans>One Invitation for Multiple Rewards</Trans>
      </ModuleTitle>

      <div className="flex gap-[30px]">
        <div className="flex-1">
          <RebateCard />
        </div>
        <div className="flex flex-1 flex-col gap-5">
          <InviteCard className="flex-1" />
          <IncomeCard className="flex-1" />
        </div>
      </div>
    </div>
  )
}
