import { Box } from '@mui/material'
import { Trans } from '@lingui/react/macro'
import { type ReactNode, useContext } from 'react'
import { PoolContext } from '@/pages/Earn/context.ts'

const Content = ({ title, children }: { title: ReactNode; children?: ReactNode }) => {
  return (
    <Box
      className={
        'item text-secondary border-dark-border flex flex-col gap-[8px] py-[20px] text-[12px] leading-[1.5] font-[500] [&+_.item]:border-t-1 [&:first-child]:pt-[0px]'
      }
    >
      <span className={'text-[12px] leading-[1.3] font-[500] text-white'}>{title}</span>
      {children}
    </Box>
  )
}
export const Introduction = ({ className = '' }: { className?: string }) => {
  const { quoteLpDetail, pool } = useContext(PoolContext)
  return (
    <Box className={`flex w-full flex-col py-[12px] ${className}`}>
      <Content title={<Trans>What is the {quoteLpDetail?.mQuoteBaseSymbol || '--'} Vault?</Trans>}>
        <p className={'leading-[1.5]'}>
          <Trans>
            {quoteLpDetail?.mQuoteBaseSymbol || '--'} Vault is an automated market-making strategy
            vault. By depositing assets (such as USDC) into this vault, you can become a Liquidity
            Provider (LP) for the {pool?.baseSymbol || '-'}
            {quoteLpDetail?.quoteSymbol || '-'} perpetual contract market and easily earn returns.
            In exchange, you will receive LP tokens that represent your share of the assets, and
            their value will continuously grow with the vault's earnings.
          </Trans>
        </p>
      </Content>
      <Content
        title={
          <Trans>
            How does the {quoteLpDetail?.mQuoteBaseSymbol || '--'} Vault earn returns for you?
          </Trans>
        }
      >
        <p className={'leading-[1.5]'}>
          <Trans>
            Once you become a Liquidity Provider (LP) for the vault, your returns primarily come
            from two sources: Trading Fee Dividends: You will continuously share in the trading fees
            generated from all trades in this market.
          </Trans>
        </p>
        <p className={'leading-[1.5]'}>
          <Trans>
            Counterparty PnL: As the counterparty to traders, when the trader community incurs a net
            loss in this market, those funds become the profit for the LP pool.
          </Trans>
        </p>
      </Content>
      <Content title={<Trans>What are the risks?</Trans>}>
        <p className={'leading-[1.5]'}>
          <Trans>
            Providing liquidity to the {quoteLpDetail?.mQuoteBaseSymbol || '--'} Vault does not have
            the "impermanent loss" risk associated with traditional liquidity mining. Its main risk
            is that, as the counterparty, the LP pool will bear corresponding losses when the trader
            community is consistently profitable in the market. However, based on overall market
            statistics, the long-term expected return for the LP pool is positive.
          </Trans>
        </p>
      </Content>

      <Content title={<Trans>How are your rights protected?</Trans>}>
        <p className={'leading-[1.5]'}>
          <Trans>
            To protect your LP assets from potential price manipulation or malicious trading, we
            have established an LP Appeal Mechanism. If you suspect a specific trade has caused you
            an unfair loss, you can initiate an appeal during that profit's "settlement period" to
            trigger the platform's dispute arbitration process.
          </Trans>
        </p>
      </Content>
    </Box>
  )
}
