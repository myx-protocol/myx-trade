import { Trans } from '@lingui/react/macro'
import { Items } from './Introduction.tsx'
import Container from '@/components/Container.tsx'

export const Create = ({ children }: { children?: React.ReactNode }) => {
  return (
    <Container className={'p-[40px]'}>
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
              <div className={'mt-[24px]'}>{item.title}</div>
              <div className={'mt-[12px]'}>{item.content}</div>
            </li>
          )
        })}
      </ul>
      {/*<button className={'gradient primary long mx-auto mt-[48px] w-[376px] rounded'}>
        <Trans>Connect wallet</Trans>
      </button>*/}
      {children}
    </Container>
  )
}
