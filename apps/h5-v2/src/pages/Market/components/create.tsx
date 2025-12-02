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
    <Container className={'flex min-h-[calc(100vh-66px-40px)] items-center p-[40px]'}>
      <div>
        <h1 className={'text-center text-[32px] leading-[1] font-[700] text-white'}>
          <Trans>Create a Market</Trans>
        </h1>
        <p className={'mt-[16px] text-center text-[20px] leading-[1]'}>
          <Trans>Create your own derivatives market to enjoy LP rewards and fee sharing.</Trans>
        </p>

        <ul className={'mt-[48px] flex w-full gap-[20px]'}>
          {Items.map((item, index) => {
            return (
              <li
                key={index}
                className={
                  'border-dark-border flex flex-1 flex-col rounded-[16px] border-1 px-[24px] py-[32px]'
                }
              >
                {item.icon}
                <div className={'mt-[24px] text-[24px] font-[700] whitespace-nowrap text-white'}>
                  {item.title}
                </div>
                <div className={'mt-[12px]'}>{item.content}</div>
              </li>
            )
          })}
        </ul>

        <div className={'mt-[48px] w-full'}>
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
    </Container>
  )
}
