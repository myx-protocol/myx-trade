import { useCallback, useContext, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { pool as Pool, type PoolOpenOrder, } from "@myx-trade/sdk";
import { PoolContext } from "@components/PoolContext.ts";
import { Button } from "@components/Button.tsx";
import { message } from "antd";
import { encryptionAddress } from "@/utils";

export const PoolOpenOrders = () => {
  const { chainId, account } = useContext(PoolContext);
  const { pools } = useContext(PoolContext);
  const [orderId, setOrderId] = useState<PoolOpenOrder["orderId"] | null>(null)
  const { data = null, refetch } = useQuery({
    queryKey: [{ key: 'PoolOpenOrders' }, chainId],
    queryFn: async () => {
      const result = await Pool.getOpenOrders(account, chainId);
      console.log(result)
      return result
    }
  })

  const onHandleCancel = useCallback(async () => {

    try {
      console.log(orderId);
      if (!orderId) return
      await Pool.cancelTpSl({ orderId: orderId.toString(), chainId })
      message.success("Cancel Order successfully")
    } catch (e) {
      message.error(JSON.stringify(e))
    } finally {
      setOrderId(null)
      await refetch();
    }

  }, [orderId])

  useEffect(() => {
    if (orderId) {
      onHandleCancel().then();
    }
  }, [orderId])


  return <div className={'w-full'}>
    <Button label={'refresh'} onClick={() => refetch()} />
    <table className={'w-full'}>
      <thead>
        <tr>
          <th align={'left'}>OrderId</th>
          <th align={'left'}>poolId</th>
          <th align={'left'}>PoolType</th>
          <th align={'left'}>TriggerPrice</th>
          <th align={'left'}>TriggerType</th>
          <th align={'left'}>txTime</th>
          <th align={'left'}>account</th>
          <th align={'left'}>Actions</th>
        </tr>
      </thead>
      <tbody>
        {
          (data || []).map((order: PoolOpenOrder, index: number) => {
            return <tr key={index}>
              <td>{order.orderId}</td>
              <td>{pools?.find((_pool) => _pool.poolId.toLowerCase() === order.poolId.toLowerCase())?.baseSymbol}</td>
              <td>{Pool.PoolType[order.poolType]}</td>
              <td>{order.triggerPrice}</td>
              <td>{Pool.TriggerType[order.triggerType]}</td>
              <td>{order.txTime}</td>
              <td>{encryptionAddress(order.user)}</td>
              <td>
                <Button label={'cancel'} isLoading={orderId === order.orderId} onClick={async () => {
                  setOrderId(order.orderId);
                  // setTimeout(async () => await onHandleCancel(), 1000);
                }} />
              </td>
            </tr>
          })
        }
      </tbody>
    </table>
  </div>
}
