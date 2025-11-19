import { Box } from '@mui/material'
import { Trans } from '@lingui/react/macro'
import type { ReactNode } from 'react'
const Title = () => {
  return (
    <Box className={'flex flex-col'}>
      <h2 className={'py-[8px] text-[28px] leading-[1] font-[700] text-white'}>
        <Trans>Introduction</Trans>
      </h2>
    </Box>
  )
}
const Content = ({ title, children }: { title: ReactNode; children?: ReactNode }) => {
  return (
    <Box
      className={
        'item text-secondary border-dark-border flex flex-col gap-[12px] py-[32px] text-[14px] leading-[1.1] font-[500] [&+_.item]:border-t-1'
      }
    >
      <span className={'text-[16px] leading-[1] font-[500] text-white'}>{title}</span>
      {children}
    </Box>
  )
}
export const Introduction = () => {
  return (
    <Box className={'flex w-full flex-col pt-[40px]'}>
      <Title />
      <Content title={<Trans>What is the BTC.USDC Vault?</Trans>}>
        <p>
          BTC.USDC Vault is an automated market-making strategy vault. By depositing assets (such as
          USDC) into this vault, you can become a Liquidity Provider (LP) for the BTC/USDC perpetual
          contract market and easily earn returns. In exchange, you will receive LP tokens that
          represent your share of the assets, and their value will continuously grow with the
          vault's earnings.
        </p>
      </Content>
      <Content title={<Trans>What is the BTC.USDC Vault?</Trans>}>
        <p>
          BTC.USDC Vault is an automated market-making strategy vault. By depositing assets (such as
          USDC) into this vault, you can become a Liquidity Provider (LP) for the BTC/USDC perpetual
          contract market and easily earn returns. In exchange, you will receive LP tokens that
          represent your share of the assets, and their value will continuously grow with the
          vault's earnings.
        </p>
      </Content>
      <Content title={<Trans>What is the BTC.USDC Vault?</Trans>}>
        <p>
          BTC.USDC Vault is an automated market-making strategy vault. By depositing assets (such as
          USDC) into this vault, you can become a Liquidity Provider (LP) for the BTC/USDC perpetual
          contract market and easily earn returns. In exchange, you will receive LP tokens that
          represent your share of the assets, and their value will continuously grow with the
          vault's earnings.
        </p>
      </Content>
    </Box>
  )
}
