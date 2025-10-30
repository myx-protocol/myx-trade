import { useContext, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { pool } from "@myx-trade/sdk";
import { PoolContext } from "@components/PoolContext.ts";
import { Button } from "@components/Button.tsx";

export const PoolOpenOrders = () => {
  const {chainId}= useContext(PoolContext);
  const {data = null, refetch} = useQuery({
    queryKey: [{key: 'PoolOpenOrders'}, chainId],
    queryFn: async () => {
      const result = await pool.getOpenOrders(chainId);
      console.log(result)
      return result
    }
  })
  
  return <div className={'w-full'}>
    <Button label={'refresh'} onClick={() => refetch()}/>
    <table className={'w-full'}>
      <thead>
        <th>
          <td>OrderId</td>
        </th>
      </thead>
      <tbody>
      {
        (data || []).map((order,index) => {
          return <tr key={index}>
            <td>{order.id}</td>
          </tr>
        })
      }
      </tbody>
    </table>
  </div>
}
