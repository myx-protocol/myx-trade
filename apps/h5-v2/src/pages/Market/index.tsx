import { Create } from './components/create'
import { useCallback, useEffect, useState } from 'react'
import { Box } from '@mui/material'
import { Step } from '@/pages/Market/components/steps.tsx'
import { Trans } from '@lingui/react/macro'
import Container from '@/components/Container.tsx'
import { TokenSelect } from '@/pages/Market/components/TokenSelect.tsx'
import { ConfirmToken } from '@/pages/Market/components/confirmToken.tsx'
import { useNavigate, useParams } from 'react-router-dom'
import { isSupportedChainFn } from '@/config/chain.ts'
import { isAddress, zeroAddress } from 'viem'
import { TokenContext } from './context'
import type { Token } from '@/pages/Market/type.ts'
import { useQuery } from '@tanstack/react-query'
import {
  getTokenInfo,
  market,
  Market as Markets,
  type MarketInfo,
  MarketPoolState,
  pool,
} from '@myx-trade/sdk'
import { useWalletConnection } from '@/hooks/wallet/useWalletConnection.ts'
import { getAccountHoldings } from '@/request'

const Market = () => {
  const { address: account } = useWalletConnection()
  const navigate = useNavigate()
  const { chainId, address } = useParams()
  const [step, setStep] = useState<number>(-1)
  const [token, setToken] = useState<Token>()
  const [poolId, setPoolId] = useState<string>()

  useQuery({
    queryKey: [{ key: 'getContractTokenInfo' }, chainId, address],
    enabled: !!chainId && !!address,

    queryFn: async () => {
      if (
        !chainId ||
        !isSupportedChainFn(Number(chainId as unknown as number)) ||
        !address ||
        address === zeroAddress ||
        !isAddress(address)
      )
        return {}
      const result = await getTokenInfo(Number(chainId), address)

      const _token = {
        name: result.name,
        symbol: result.symbol,
        address: result.address,
        chainId: +chainId,
        decimals: Number(result.decimals),
      } as Token

      setToken(_token)
      return _token
    },
  })

  const { data: marketInfo } = useQuery({
    queryKey: [{ key: 'getContractMarketInfo' }, chainId],
    enabled: !!chainId,
    queryFn: async () => {
      if (!chainId) return undefined
      const marketId = Markets?.[Number(chainId)]?.marketId
      if (!marketId) return undefined
      const result = await market.getMarket(+chainId, marketId)
      return result as unknown as MarketInfo
    },
  })

  const { data: quote } = useQuery({
    queryKey: [{ key: 'getContractQutoteTokenInfo' }, chainId, marketInfo?.quoteToken],
    queryFn: async () => {
      if (!chainId || !marketInfo?.quoteToken) return

      const result = await getTokenInfo(Number(chainId), marketInfo?.quoteToken)
      return {
        name: result.name,
        symbol: result.symbol,
        address: result.address,
        chainId: +chainId,
        decimals: Number(result.decimals),
      } as Token
    },
  })

  const onNext = useCallback(async () => {
    try {
      if (!chainId) return
      // check marketId.
      if (token?.address) {
        // const marketId = marketInfo.marketId
        const poolId = await pool.getMarketPoolId({ chainId: +chainId, baseToken: token.address })

        if (poolId) {
          setPoolId(poolId)
          // check pool status
          const _pool = await pool.getPoolDetail(+chainId, poolId)
          if (_pool?.state === MarketPoolState.Bench || _pool?.state === MarketPoolState.Cook) {
            setStep(2)
            return
          }
          // todo error pool yi created
        } else {
          const poolId = await pool.createPool({ chainId: +chainId, baseToken: token.address })
          if (poolId) {
            setPoolId(poolId)
            setStep(2)
          }
        }
      }
    } catch (e) {
      console.error(e)
    }
  }, [token, chainId])

  useEffect(() => {
    /*console.info(
      chainId,
      address,
      isSupportedChainFn(chainId as unknown as number),
      isAddress(address),
    )*/
    if (
      !chainId ||
      !isSupportedChainFn(Number(chainId as unknown as number)) ||
      !address ||
      address === zeroAddress ||
      !isAddress(address)
    ) {
      setStep(0)
      return
    }

    console.log(isAddress(address))

    if (isAddress(address)) {
      setStep(1)
      return
    }
    setStep(0)
  }, [chainId, address])

  return (
    <>
      {step === -1 && <></>}
      {step === 0 && (
        <Create>
          <button
            className={'gradient primary long mx-auto mt-[48px] w-[488px] rounded'}
            onClick={() => setStep(step + 1)}
          >
            <Trans>立即创建我的合约交易市场</Trans>
          </button>
        </Create>
      )}
      {step > 0 && (
        <TokenContext.Provider
          value={{ quote, token, setToken, market: marketInfo, poolId, setPoolId }}
        >
          <Container className={'flex !w-[1040px] !min-w-[1040px] gap-[48px] px-[40px] pt-[32px]'}>
            <Box className={'w-[360px] min-w-[360px]'}>
              <Step step={step} />
            </Box>

            {step === 1 && <TokenSelect onNext={onNext} />}

            {step === 2 && <ConfirmToken onNext={() => navigate('/cook')} />}
          </Container>
        </TokenContext.Provider>
      )}
    </>
  )
}

export default Market
