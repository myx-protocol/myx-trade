import { useCallback, useState } from 'react'
import { Box } from '@mui/material'
import { Trans } from '@lingui/react/macro'
import { t } from '@lingui/core/macro'
import { Select } from '@/components/UI/Select'
import { CheckBox } from '@/components/UI/CheckBox'
import { FormControlLabel } from '@/components/UI/FormControlLabel'
import { getChainInfo, type BaseChainInfo } from '@/config/chainInfo'
import { getSupportedChainIdsByEnv } from '@/config/chain'
import allChainIcon from '@/assets/icon/allChain.svg'
import { Empty } from '@/components/Empty'
import { InfiniteScrollView } from '@/components/InfiniteScrollView'
import { FinanceItem } from '@/components/Record/Items/Finance'
import { useInfiniteScrollData, type InfiniteScrollGetData } from '@/hooks/useInfiniteScrollData'
import { useWalletConnection } from '@/hooks/wallet/useWalletConnection'
import { useMyxSdkClient } from '@/providers/MyxSdkProvider'
import type { TradeFlowItem } from '@myx-trade/sdk'
import { useUpdateEffect } from 'ahooks'
import { SuspenseLoading } from '@/components/Loading'

const CHAIN_LIST: Array<BaseChainInfo & { chainId: number }> = getSupportedChainIdsByEnv().map(
  (chainId) => ({
    ...getChainInfo(chainId),
    chainId,
  }),
)

interface CookOrderRecordsSectionProps {
  poolId: string
  chainId: number
}

export const CookOrderRecordsSection = ({ poolId, chainId }: CookOrderRecordsSectionProps) => {
  const [hideOtherSymbols, setHideOtherSymbols] = useState(false)
  const [selectChainId, setSelectChainId] = useState(String(chainId))
  const { client } = useMyxSdkClient()
  const { address } = useWalletConnection()

  const getDataFunc: InfiniteScrollGetData<TradeFlowItem> = useCallback(
    async (pageParams) => {
      if (!client) return null
      const res = await client.account.getTradeFlow(
        {
          chainId: selectChainId === '0' ? 0 : parseInt(selectChainId),
          poolId: hideOtherSymbols ? poolId : undefined,
          ...pageParams,
        },
        address ?? '',
      )
      return res.data
    },
    [client, selectChainId, address, hideOtherSymbols, poolId],
  )

  const { data, isLoading, hasMore, getData, reset } = useInfiniteScrollData({
    getData: getDataFunc,
  })

  useUpdateEffect(() => {
    reset()
  }, [selectChainId, hideOtherSymbols])

  return (
    <Box className="mt-[8px] flex flex-col">
      <Box className="flex items-center justify-between border-b border-[#202129] px-[16px] pb-[12px]">
        <span className="text-[14px] leading-none font-[500] text-white">
          <Trans>订单记录</Trans>
        </span>
        <Select
          isSingle
          value={selectChainId || '0'}
          onChange={(e) => setSelectChainId(e.target.value as string)}
          options={[
            {
              label: <span className="text-[12px] text-[#848E9C]">{t`All Chains`}</span>,
              value: '0',
              icon: <img src={allChainIcon} alt="allChain" className="h-[14px] w-[14px]" />,
            },
            ...CHAIN_LIST.map((chain) => ({
              label: <span className="text-[12px] text-[#848E9C]">{chain.label}</span>,
              value: chain.chainId.toString(),
              icon: <img src={chain.logoUrl} alt={chain.label} className="h-[14px] w-[14px]" />,
            })),
          ]}
        />
      </Box>
      <Box className="flex items-center gap-[4px] px-[16px] pt-[16px] pb-[10px]">
        <FormControlLabel
          control={
            <CheckBox
              checked={hideOtherSymbols}
              onChange={() => setHideOtherSymbols(!hideOtherSymbols)}
            />
          }
          label={
            <span className="text-[12px] leading-none text-[#CED1D9]">
              <Trans>Hide other symbols</Trans>
            </span>
          }
        />
      </Box>
      {!isLoading && !data?.length && !hasMore ? (
        <Empty />
      ) : (
        <InfiniteScrollView
          dataLength={data?.length}
          hasMore={hasMore}
          loadMore={getData}
          scrollableTarget={null}
        >
          {data?.map((item, index) => (
            <FinanceItem key={index} item={item} />
          ))}
        </InfiniteScrollView>
      )}
      {Boolean(isLoading && !data?.length) && <SuspenseLoading block />}
    </Box>
  )
}
