import { Fragment, useMemo, useState } from 'react'
import { TabType } from '../../types'
import { Trans } from '@lingui/react/macro'
import { CheckBox } from '@/components/UI/CheckBox'
import { InfoButton } from '@/components/UI/Button'
import { usePositionStore } from '@/store/position/createStore'
import { Select } from '@/components/UI/Select'
import { t } from '@lingui/core/macro'
import { Position } from './Position'
import { Entrusts } from './Entrust'
import { PositionHistory } from './PositionHistory'
import { OrderHistory } from './OrderHistory'
import { Finance } from './Finance'
import { getSupportedChainIdsByEnv } from '@/config/chain'
import { getChainInfo, type BaseChainInfo } from '@/config/chainInfo'
import { useMyxSdkClient } from '@/providers/MyxSdkProvider'
import { useGetOrderList } from '@/hooks/order/use-get-order-list'
import { toast } from 'react-hot-toast'

const TabButton = ({
  activeTab,
  onClick,
  tabType,
  children,
}: {
  activeTab: TabType
  onClick: () => void
  tabType: TabType
  children: React.ReactNode
}) => {
  const isActive = activeTab === tabType
  return (
    <div
      className="cursor-pointer text-[14px]"
      style={{
        color: isActive ? '#FFFFFF' : '#848E9C',
        fontWeight: '500',
        textShadow: isActive ? '0.3px 0 0 currentColor, -0.3px 0 0 currentColor' : 'none',
      }}
      onClick={onClick}
    >
      {children}
    </div>
  )
}

const CHAIN_LIST: Array<
  BaseChainInfo & {
    chainId: number
  }
> = getSupportedChainIdsByEnv().map((chainId) => {
  return {
    ...getChainInfo(chainId),
    chainId,
  }
})

export const Tables = () => {
  const [activeTab, setActiveTab] = useState<TabType>(TabType.POSITION)
  const {
    hideOthersSymbols,
    setHideOthersSymbols,
    selectChainId,
    setSelectChainId,
    setCloseAllPositionDialogOpen,
  } = usePositionStore()
  const orders = useGetOrderList()
  const { client } = useMyxSdkClient()

  return (
    <div className="mt-[4px] h-[100%] min-h-[503px] flex-[1_1_0%] bg-[#101114]">
      <div className="overflow-x-auto">
        <div className="flex h-[50px] min-w-max items-center justify-between gap-[150px] bg-[#101114] px-[16px] py-[19px] whitespace-nowrap">
          <div className="flex items-center gap-[24px]">
            <TabButton
              tabType={TabType.POSITION}
              activeTab={activeTab}
              onClick={() => setActiveTab(TabType.POSITION)}
            >
              <Trans>Positions</Trans>
            </TabButton>
            <TabButton
              tabType={TabType.ENTRUSTS}
              activeTab={activeTab}
              onClick={() => setActiveTab(TabType.ENTRUSTS)}
            >
              <Trans>Open Orders</Trans>
            </TabButton>
            <TabButton
              tabType={TabType.POSITION_HISTORY}
              activeTab={activeTab}
              onClick={() => setActiveTab(TabType.POSITION_HISTORY)}
            >
              <Trans>Position History</Trans>
            </TabButton>
            <TabButton
              tabType={TabType.ORDER_HISTORY}
              activeTab={activeTab}
              onClick={() => setActiveTab(TabType.ORDER_HISTORY)}
            >
              <Trans>Order History</Trans>
            </TabButton>
            <TabButton
              tabType={TabType.FINANCE}
              activeTab={activeTab}
              onClick={() => setActiveTab(TabType.FINANCE)}
            >
              <Trans>Finance</Trans>
            </TabButton>
          </div>
          <div className="flex items-center">
            <Select
              isSingle
              value={selectChainId || '0'}
              onChange={(e) => setSelectChainId(e.target.value as string)}
              options={[
                { label: t`All Chains`, value: '0' },
                ...CHAIN_LIST.map((chain) => ({
                  label: chain.label,
                  value: chain.chainId.toString(),
                  icon: chain.logoUrl as string,
                })),
                // { label: 'Arbitrum', value: ChainId, icon: ethIcon },
              ]}
            />
            <div className="mx-[12px] h-[12px] w-[1px] bg-[#31333d]"></div>
            <div className="flex items-center gap-x-[5px]">
              <CheckBox
                checked={hideOthersSymbols}
                onChange={() => setHideOthersSymbols(!hideOthersSymbols)}
              />
              <p className="text-[12px] text-[#CED1D9]">
                <Trans>Hide Others Symbols</Trans>
              </p>
            </div>
            {/* close all in position or open orders */}
            {(activeTab === TabType.POSITION || activeTab === TabType.ENTRUSTS) && (
              <Fragment>
                <div className="mx-[12px] h-[12px] w-[1px] bg-[#31333d]"></div>
                <InfoButton
                  className="h-[28px] px-[12px] py-[8px]"
                  onClick={async () => {
                    if (activeTab === TabType.POSITION) {
                      setCloseAllPositionDialogOpen(true)
                    } else if (activeTab === TabType.ENTRUSTS) {
                      if (orders.length === 0) {
                        return
                      }
                      const rs = await client?.order.cancelOrders(
                        orders.map((item: any) => item.orderId),
                      )
                      if (rs?.code === 0) {
                        toast.success('Close all orders success')
                      } else {
                        toast.error('Close all orders failed')
                      }
                    }
                  }}
                >
                  <Trans>Close All</Trans>
                </InfoButton>
              </Fragment>
            )}
          </div>
        </div>
      </div>
      {activeTab === TabType.POSITION && <Position />}
      {activeTab === TabType.ENTRUSTS && <Entrusts />}
      {activeTab === TabType.POSITION_HISTORY && <PositionHistory />}
      {activeTab === TabType.ORDER_HISTORY && <OrderHistory />}
      {activeTab === TabType.FINANCE && <Finance />}
    </div>
  )
}
