import { Create } from './components/create'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Box, Button } from '@mui/material'
import { Step } from '@/pages/Market/components/steps.tsx'
import { Trans } from '@lingui/react/macro'
import Container from '@/components/Container.tsx'
import { TokenSelect } from '@/pages/Market/components/TokenSelect.tsx'
import { ConfirmToken } from '@/pages/Market/components/confirmToken.tsx'
import { useNavigate, useParams } from 'react-router-dom'
import { isAddress, zeroAddress } from 'viem'
import { TokenContext } from './context'
import { useQuery } from '@tanstack/react-query'
import { getTokenInfo, MarketPoolState, pool } from '@myx-trade/sdk'
import { useWalletConnection } from '@/hooks/wallet/useWalletConnection.ts'
import { useMyxSdkClient } from '@/providers/MyxSdkProvider.tsx'
import { toast } from '@/components/UI/Toast'
import { t } from '@lingui/core/macro'
import { useWalletActions } from '@/hooks/useWalletActions.ts'
import { getTokenDetails } from '@/request'
import { isProdMode } from '@/utils/env.ts'
import { isProdChainId, isSupportedChainId } from '@/pages/Market/untils'
import type { Asset } from '@/hooks/useWalletPortfolio.ts'
import { CHAIN_INFO } from '@/config/chainInfo.ts'
import { showErrorToast } from '@/config/error'
import { TitleBar } from '@/components/TitleBar.tsx'

const Market = () => {
  const { markets: Markets } = useMyxSdkClient()
  const { chainId: curChainId } = useWalletConnection()
  const [loading, setLoading] = useState(false)
  // const { address: account } = useWalletConnection()
  const navigate = useNavigate()
  const { chainId, address } = useParams()
  const [step, setStep] = useState<number>(-1)
  const [token, setToken] = useState<Asset>()
  const [poolId, setPoolId] = useState<string>()
  const onAction = useWalletActions()

  // const [quote, setQuote] = useState<Token>()

  const markets = useMemo(() => {
    if (!chainId || !Markets?.length) return Markets

    return Markets.filter((_market) => _market.chainId === +chainId)
  }, [chainId, Markets])

  const marketInfo = useMemo(() => {
    const _market = markets?.[0]
    return _market
  }, [markets])

  // todo test
  const quoteToken = useMemo(() => {
    return (
      marketInfo?.quoteToken ||
      (!isProdMode() && chainId ? CHAIN_INFO?.[+chainId]?.usdAddress : undefined)
    )
  }, [marketInfo, chainId])

  useEffect(() => {
    if (chainId && address && Markets?.length && !marketInfo) {
      toast.error({ title: t`Invalid Market` })
    }
  }, [marketInfo, chainId, address, Markets?.length])

  useQuery({
    queryKey: [{ key: 'getContractTokenInfo' }, chainId, address],
    enabled: !!chainId && !!address,

    queryFn: async () => {
      if (
        !chainId ||
        !isSupportedChainId(chainId) ||
        !address ||
        address === zeroAddress ||
        !isAddress(address)
      )
        return {}

      const _token = await formatTokenData(chainId, address)
      setToken(_token)
    },
  })

  // const { data: marketInfo } = useQuery({
  //   queryKey: [{ key: 'getContractMarketInfo' }, chainId, markets],
  //   enabled: !!chainId && !!markets?.length,
  //   queryFn: async () => {
  //     if (!chainId) return undefined
  //     const market = markets?.filter((_market) => _market.chainId === +chainId)?.[0]
  //
  //     const marketId = market?.marketId
  //     if (!marketId) return undefined
  //     // const result = await market.getMarket(+chainId, marketId)
  //     // return result as unknown as MarketInfo
  //     return market
  //   },
  // })

  const { data: quote } = useQuery({
    queryKey: [{ key: 'getContractQutoteTokenInfo' }, chainId, quoteToken],
    enabled: !!chainId && !!quoteToken,
    queryFn: async () => {
      if (!chainId || !quoteToken) return

      const result = await getTokenInfo(Number(chainId), quoteToken)
      return {
        name: result.name,
        symbol: result.symbol,
        address: result.address,
        chainId: +chainId,
        decimals: Number(result.decimals),
        logo: '',
      } as Asset

      // const _token = await formatTokenData(chainId, quoteToken)
      // return _token

      /* if (!isProdMode()) {
        const result = await getTokenInfo(Number(chainId), marketInfo?.quoteToken)
        return {
          name: result.name,
          symbol: result.symbol,
          address: result.address,
          chainId: +chainId,
          decimals: Number(result.decimals),
          logo: ''
        } as Asset
      } else {
        const result  = await getMarketData({
          asset: quoteToken,
          chainId: +chainId,
        })
        return {
        
        } as Asset
      }*/
    },
  })

  const onNext = useCallback(async () => {
    try {
      setStep(2)
      return
      /* if (!chainId || !marketInfo) return
      const checked = await onAction()
      if (!checked) return
      // check marketId.
      if (token?.address) {
        // const marketId = marketInfo.marketId
        if (token.address === quoteToken) {
          toast.error({ title: t`Invalid token address` })
          return
        }

        const poolId = await pool.getMarketPoolId({
          chainId: +chainId,
          baseToken: token.address,
          marketId: marketInfo?.marketId,
        })

        if (poolId) {
          setPoolId(poolId)
          // check pool status
          const _pool = await pool.getPoolDetail(+chainId, poolId)
          if (_pool?.state === MarketPoolState.Bench || _pool?.state === MarketPoolState.Cook) {
            setStep(2)
            return
          }
          if (_pool) {
            toast.success({ title: t`market is created` })
            navigate(`/cook/${_pool.chainId}/${_pool.poolId}`)
            // todo error pool yi created
          }
        } else {
          const poolId = await pool.createPool({
            chainId: +chainId,
            baseToken: token.address,
            marketId: marketInfo?.marketId,
          })
          if (poolId) {
            setPoolId(poolId)
            setStep(2)
          }
        }
      }*/
    } catch (e) {
      console.error(e)
      if (e) {
        showErrorToast(e)
      }
    }
  }, [token, chainId, marketInfo, onAction])

  useEffect(() => {
    /*console.info(
      chainId,
      address,
      isSupportedChainFn(chainId as unknown as number),
      isAddress(address),
    )*/
    if (
      !chainId ||
      !isSupportedChainId(Number(chainId as unknown as number)) ||
      !address ||
      address === zeroAddress ||
      !isAddress(address)
    ) {
      setStep(0)

      return
    }

    if (isAddress(address)) {
      setStep(1)
      return
    }

    setStep(0)
  }, [chainId, address, curChainId])

  return (
    <div className="bg-deep fixed top-[0] z-30 flex h-[100vh] min-h-[100vh] w-full flex-col overflow-y-auto pb-[50px]">
      <Box className={'bg-deep sticky top-[0] z-[3]'}>
        <TitleBar title={<Trans>Create a Contract Market</Trans>} />
      </Box>
      {step > 0 && <Step step={step} className={'mt-[12px]'} />}
      {step === -1 && <></>}
      {step === 0 && (
        <Create>
          <Box className={'flex w-full items-center'}>
            <Button
              className={'gradient primary long !mx-auto mx-auto w-[488px] rounded'}
              onClick={() => setStep(step + 1)}
            >
              <Trans>立即创建我的合约交易市场</Trans>
            </Button>
          </Box>
        </Create>
      )}
      {step > 0 && (
        <TokenContext.Provider
          value={{ quote, token, setToken, market: marketInfo, poolId, setPoolId }}
        >
          <div className={'flex w-full gap-[48px] px-[16px] pt-[24px]'}>
            {/*<Box className={'w-[360px] min-w-[360px]'}>*/}
            {/*  <Step step={step} />*/}
            {/*</Box>*/}

            {step === 1 && <TokenSelect onNext={onNext} />}

            {step === 2 && <ConfirmToken onNext={() => navigate('/cook')} />}
          </div>
        </TokenContext.Provider>
      )}
    </div>
  )
}

export default Market

async function formatTokenData(chainId: string | number, address: string): Promise<Asset> {
  const result = isProdChainId(chainId)
    ? (await getTokenDetails(address, Number(chainId)))?.data
    : await getTokenInfo(Number(chainId), address)

  /*  {
      "address": "0xd82544bf0dfe8385ef8fa34d67e6e4940cc63e16",
      "chainId": "evm:56",
      "symbol": "MYX",
      "name": "MYX",
      "decimals": 18,
      "id": 59313,
      "priceUSD": 2.487170258015929,
      "priceToken": 0.0027973366849761996,
      "priceTokenString": "0.00279733668497619955214950060451",
      "approximateReserveUSD": 2878026.045964725,
      "approximateReserveTokenRaw": "1157148786533250919038976",
      "approximateReserveToken": 1157148.786533251,
      "totalSupply": 1000000000,
      "circulatingSupply": 190774670,
      "marketCapUSD": 474489085.2068037,
      "marketCapDilutedUSD": 2487170258.0159287,
      "logo": "https://metadata.mobula.io/assets/logos/0xd82544bf0dfe8385ef8fa34d67e6e4940cc63e16.webp",
      "rank": null,
      "cexs": [
      "Kraken"
    ],
      "exchange": {
      "name": "PancakeSwap V3",
        "logo": "https://metadata.mobula.io/assets/logos/0x0bfbcf9fa4f9c56b0f40a671ad40e0805a091865.webp"
    },
      "factory": "0x0bfbcf9fa4f9c56b0f40a671ad40e0805a091865",
      "source": null,
      "liquidityUSD": 623057.6340160939,
      "liquidityMaxUSD": 3523092.916326563,
      "bonded": false,
      "bondingPercentage": 0,
      "poolAddress": "0x6ec31af1bb9a72aacec12e4ded508861b05f4503",
      "blockchain": "BNB Smart Chain (BEP20)",
      "type": "uniswap-v3",
      "deployer": "0x0e3e522fc3ae2ff35d66d68204c5942c7d1b4a5d",
      "bondedAt": null,
      "athUSD": 18.946680953357212,
      "atlUSD": 2.5699087840702743e-18,
      "athDate": "2025-09-11T09:55:42.000Z",
      "atlDate": "2025-11-12T23:21:46.000Z",
      "priceChange1minPercentage": -0.11589525713475203,
      "priceChange5minPercentage": -0.031117291267741064,
      "priceChange1hPercentage": -0.6831411404092187,
      "priceChange4hPercentage": -0.6383253583956356,
      "priceChange6hPercentage": -1.5663454678049826,
      "priceChange12hPercentage": -4.107774218149847,
      "priceChange24hPercentage": -5.197267026547918,
      "volume1minUSD": 1012.2306915208856,
      "volume5minUSD": 1012.2306915208856,
      "volume15minUSD": 2419.5406041734313,
      "volume1hUSD": 10869.015186001066,
      "volume4hUSD": 76274.77740601932,
      "volume6hUSD": 166461.01801040355,
      "volume12hUSD": 357808.77739684744,
      "volume24hUSD": 785552.5731714389,
      "volumeBuy1minUSD": 287.87946689278476,
      "volumeBuy5minUSD": 287.87946689278476,
      "volumeBuy15minUSD": 772.614717806203,
      "volumeBuy1hUSD": 5152.023407514195,
      "volumeBuy4hUSD": 38157.0322361705,
      "volumeBuy6hUSD": 81806.27054114212,
      "volumeBuy12hUSD": 173648.5890278648,
      "volumeBuy24hUSD": 385739.25326578174,
      "volumeSell1minUSD": 724.3512246281008,
      "volumeSell5minUSD": 724.3512246281008,
      "volumeSell15minUSD": 1646.9258863672283,
      "volumeSell1hUSD": 5716.991778486872,
      "volumeSell4hUSD": 38117.74516984882,
      "volumeSell6hUSD": 84654.74746926142,
      "volumeSell12hUSD": 184160.18836898264,
      "volumeSell24hUSD": 399813.3199056572,
      "trades1min": 14,
      "trades5min": 14,
      "trades15min": 31,
      "trades1h": 130,
      "trades4h": 848,
      "trades6h": 1760,
      "trades12h": 3682,
      "trades24h": 8690,
      "buys1min": 5,
      "buys5min": 5,
      "buys15min": 12,
      "buys1h": 60,
      "buys4h": 391,
      "buys6h": 829,
      "buys12h": 1742,
      "buys24h": 4165,
      "sells1min": 9,
      "sells5min": 9,
      "sells15min": 19,
      "sells1h": 70,
      "sells4h": 457,
      "sells6h": 931,
      "sells12h": 1940,
      "sells24h": 4525,
      "buyers1min": 5,
      "buyers5min": 5,
      "buyers15min": 12,
      "buyers1h": 60,
      "buyers4h": 341,
      "buyers6h": 708,
      "buyers12h": 1425,
      "buyers24h": 3370,
      "sellers1min": 7,
      "sellers5min": 7,
      "sellers15min": 15,
      "sellers1h": 57,
      "sellers4h": 365,
      "sellers6h": 716,
      "sellers12h": 1468,
      "sellers24h": 3450,
      "traders1min": 11,
      "traders5min": 11,
      "traders15min": 23,
      "traders1h": 99,
      "traders4h": 622,
      "traders6h": 1229,
      "traders12h": 2474,
      "traders24h": 5866,
      "feesPaid1minUSD": 0.16017116158228453,
      "feesPaid5minUSD": 0.16017116158228453,
      "feesPaid15minUSD": 0.3054997555400124,
      "feesPaid1hUSD": 1.4485988091213562,
      "feesPaid4hUSD": 9.090628265139125,
      "feesPaid6hUSD": 20.993072313354848,
      "feesPaid12hUSD": 56.78379455810805,
      "feesPaid24hUSD": 126.65860291632282,
      "totalFeesPaidUSD": 513620.67893773265,
      "totalFeesPaidNativeRaw": "634119462239638900000",
      "organicTrades1min": 14,
      "organicTrades5min": 14,
      "organicTrades15min": 31,
      "organicTrades1h": 130,
      "organicTrades4h": 848,
      "organicTrades6h": 1760,
      "organicTrades12h": 3682,
      "organicTrades24h": 8683,
      "organicTraders1min": 11,
      "organicTraders5min": 11,
      "organicTraders15min": 23,
      "organicTraders1h": 99,
      "organicTraders4h": 622,
      "organicTraders6h": 1229,
      "organicTraders12h": 2474,
      "organicTraders24h": 5862,
      "organicVolume1minUSD": 1012.2306915208854,
      "organicVolume5minUSD": 1012.2306915208854,
      "organicVolume15minUSD": 2419.5406041734313,
      "organicVolume1hUSD": 10869.015186001068,
      "organicVolume4hUSD": 76274.77740601932,
      "organicVolume6hUSD": 166461.01801040355,
      "organicVolume12hUSD": 357808.77739684744,
      "organicVolume24hUSD": 785201.9819934457,
      "organicVolumeBuy1minUSD": 287.87946689278476,
      "organicVolumeBuy5minUSD": 287.87946689278476,
      "organicVolumeBuy15minUSD": 772.614717806203,
      "organicVolumeBuy1hUSD": 5152.023407514195,
      "organicVolumeBuy4hUSD": 38157.0322361705,
      "organicVolumeBuy6hUSD": 81806.27054114212,
      "organicVolumeBuy12hUSD": 173648.5890278648,
      "organicVolumeBuy24hUSD": 385652.2155090014,
      "organicVolumeSell1minUSD": 724.3512246281008,
      "organicVolumeSell5minUSD": 724.3512246281008,
      "organicVolumeSell15minUSD": 1646.9258863672283,
      "organicVolumeSell1hUSD": 5716.991778486872,
      "organicVolumeSell4hUSD": 38117.74516984882,
      "organicVolumeSell6hUSD": 84654.74746926142,
      "organicVolumeSell12hUSD": 184160.18836898264,
      "organicVolumeSell24hUSD": 399549.76648444426,
      "organicBuys1min": 5,
      "organicBuys5min": 5,
      "organicBuys15min": 12,
      "organicBuys1h": 60,
      "organicBuys4h": 391,
      "organicBuys6h": 829,
      "organicBuys12h": 1742,
      "organicBuys24h": 4161,
      "organicSells1min": 9,
      "organicSells5min": 9,
      "organicSells15min": 19,
      "organicSells1h": 70,
      "organicSells4h": 457,
      "organicSells6h": 931,
      "organicSells12h": 1940,
      "organicSells24h": 4522,
      "organicBuyers1min": 5,
      "organicBuyers5min": 5,
      "organicBuyers15min": 12,
      "organicBuyers1h": 60,
      "organicBuyers4h": 341,
      "organicBuyers6h": 708,
      "organicBuyers12h": 1425,
      "organicBuyers24h": 3366,
      "organicSellers1min": 7,
      "organicSellers5min": 7,
      "organicSellers15min": 15,
      "organicSellers1h": 57,
      "organicSellers4h": 365,
      "organicSellers6h": 716,
      "organicSellers12h": 1468,
      "organicSellers24h": 3450,
      "createdAt": "2025-04-30T07:34:17.942Z",
      "latestTradeDate": "2025-11-28T07:10:23.000Z",
      "holdersCount": 56111,
      "description": null,
      "socials": {
      "twitter": "https://x.com/MYX_Finance",
        "website": "https://99gag.net/myxtoken",
        "telegram": "https://t.me/MYX_Finances",
        "others": {}
    },
      "security": {
      "buyTax": "0",
        "sellTax": "0",
        "transferPausable": false,
        "top10Holders": "0.9337",
        "isBlacklisted": false,
        "balanceMutable": false,
        "burnRate": "0.00000000",
        "isHoneypot": true,
        "isNotOpenSource": false,
        "renounced": true,
        "locked": "0.0000",
        "isWhitelisted": false,
        "isMintable": false,
        "modifyableTax": false,
        "selfDestruct": false
    },
      "twitterReusesCount": 0,
      "twitterRenameCount": 0,
      "twitterRenameHistory": [],
      "deployerMigrationsCount": 0,
      "deployerTokensCount": 0,
      "dexscreenerListed": true,
      "dexscreenerHeader": "https://dd.dexscreener.com/ds-data/tokens/bsc/0xd82544bf0dfe8385ef8fa34d67e6e4940cc63e16/header.png?key=1b61f6",
      "dexscreenerAdPaid": false,
      "dexscreenerAdPaidDate": null,
      "dexscreenerSocialPaid": false,
      "dexscreenerSocialPaidDate": null,
      "liveStatus": null,
      "liveThumbnail": null,
      "livestreamTitle": null,
      "liveReplyCount": null,
      "dexscreenerBoosted": false,
      "dexscreenerBoostedDate": null,
      "dexscreenerBoostedAmount": 0,
      "trendingScore1min": 0.027100000000000003,
      "trendingScore5min": 55.345099999999995,
      "trendingScore15min": 93.3704,
      "trendingScore1h": 393.90209999999996,
      "trendingScore4h": 2461.1494000000002,
      "trendingScore6h": 4775.9089,
      "trendingScore12h": 8506.383100000001,
      "trendingScore24h": 11247.4475,
      "top10HoldingsPercentage": 93.51833858146088,
      "top50HoldingsPercentage": 100,
      "top100HoldingsPercentage": 100,
      "top200HoldingsPercentage": 100,
      "devHoldingsPercentage": 0.004380235336841527,
      "insidersHoldingsPercentage": 11.710797067767162,
      "bundlersHoldingsPercentage": 13.584782213114,
      "snipersHoldingsPercentage": 0.745095935062849,
      "proTradersHoldingsPercentage": 0,
      "freshTradersHoldingsPercentage": 0,
      "smartTradersHoldingsPercentage": 0,
      "insidersCount": 71,
      "bundlersCount": 126,
      "snipersCount": 16,
      "freshTradersCount": 0,
      "proTradersCount": 0,
      "smartTradersCount": 0,
      "freshTradersBuys": 0,
      "proTradersBuys": 0,
      "smartTradersBuys": 0
    }*/
  const _token = {
    name: result.name,
    symbol: result.symbol,
    address: result.address,
    chainId: +chainId,
    decimals: Number(result.decimals),
    logo: result?.logo,
    price: result?.priceUSD,
    mca: result?.marketCapUSD,
    liq: result?.liquidityUSD,
    change: result?.priceChange24hPercentage,
  } as Asset

  console.log(_token)
  return _token
}
