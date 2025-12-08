import { Trans } from '@lingui/react/macro'
import { Items } from './Introduction.tsx'
import Container from '@/components/Container.tsx'
import { useWalletConnection } from '@/hooks/wallet/useWalletConnection.ts'
import { Button } from '@mui/material'
import { useWalletStore } from '@/store/wallet/createStore.ts'

export const Create = ({ children }: { children?: React.ReactNode }) => {
  const { isWalletConnected } = useWalletConnection()
  const { setLoginModalOpen } = useWalletStore()
  return (
    <div className={'mt-[12px] flex w-full items-center px-[16px]'}>
      <div className={'w-full'}>
        <p className={'text-[14px] leading-[1.2]'}>
          <Trans>Create your own derivatives market to enjoy LP rewards and fee sharing.</Trans>
        </p>

        <ul className={'mt-[24px] flex w-full flex-col gap-[12px]'}>
          {Items.map((item, index) => {
            return (
              <li
                key={index}
                className={
                  'border-dark-border flex flex-1 gap-[16px] rounded-[16px] border-1 p-[24px]'
                }
              >
                <div className={'w-[36px] flex-shrink-0'}>{item.icon}</div>
                <div className={'flex flex-col gap-[4px]'}>
                  <div className={'text-[16px] font-[700] whitespace-nowrap text-white'}>
                    {item.title}
                  </div>
                  <div className={'text-secondary text-[12px] leading-[1.5]'}>{item.content}</div>
                </div>
              </li>
            )
          })}
        </ul>

        <div className={'mt-[24px] w-full'}>
          {isWalletConnected ? (
            children
          ) : (
            <Button
              className={'gradient primary long !mx-auto w-[376px] rounded'}
              onClick={() => setLoginModalOpen(true)}
            >
              <Trans>Connect wallet</Trans>
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
