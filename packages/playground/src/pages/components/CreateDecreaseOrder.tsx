import { getOraclePrice } from "@/api";
import { ChainId } from "@/config/chain";
import { OrderType, TIME_IN_FORCE, TriggerType } from "@/config/con";
import type { MyxClient } from "@myx-trade/sdk";
import { Button, message, Modal, Form, Input, Space } from "antd"
import { ethers } from "ethers";
import { useEffect, useState } from "react";

export const CreateDecreaseOrderButton = ({ record, myxClient, poolList, address }: { record: any, myxClient: MyxClient, poolList: any[], address: string }) => {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState<string>('')
  const [price, setPrice] = useState<string>('')

  useEffect(() => {
    getOraclePrice(record.poolId, ChainId.ARB_TESTNET).then((oraclePriceRes) => {
      const _price = oraclePriceRes.data[0].price;
      setPrice(_price)
    })
  }, [record.poolId])

  const executeDecreaseOrder = async (isAll: boolean = false) => {
    const pool = poolList.find((pool) => pool.poolId === record.poolId)
    setLoading(true);

    try {
      if (myxClient) {
        const result = await myxClient.order.createDecreaseOrder({
          chainId: ChainId.ARB_TESTNET,
          address: address as `0x${string}`,
          poolId: pool.poolId,
          positionId: record.positionId,
          orderType: OrderType.MARKET,
          triggerType: TriggerType.NONE,
          direction: record.direction,
          collateralAmount: '0',
          size: isAll ? ethers.parseUnits(record.size.toString(), pool?.baseDecimals).toString() : amount,
          price: ethers.parseUnits(price.toString(), 30).toString(),
          timeInForce: TIME_IN_FORCE,
          postOnly: false,
          slippagePct: '0', // 转换为精度4位
          executionFeeToken: pool.quoteToken,
          leverage: 0
        })

        console.log("executeDecreaseOrder result", result)
        // setOpen(false);
        // form.resetFields();
      }
    } catch (error) {
      console.error("Close position error:", error);
      message.error('平仓失败 / Close position failed');
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      <Button
        loading={loading}
        type="default"
        size="small"
        onClick={() => setOpen(true)}
        title="平仓"
        style={{ fontSize: '10px', padding: '2px 6px' }}
      >
        平仓
      </Button>
      {/* 平仓弹窗 / Close Position Modal */}
      {open && <Modal
        title="平仓 / Close Position"
        open={open}
        onCancel={() => {
          setOpen(false);
        }}

        confirmLoading={loading}
        footer={null}
        width={600}
      >
        <Form.Item label="平仓数量 / Close Size" name="closeSize">
          <Input value={amount} onChange={(e) => setAmount(e.target.value)} style={{ width: '100%' }} min={0} step={0.01} placeholder="输入平仓数量 / Enter close size" />
        </Form.Item>
        <Space direction="horizontal" style={{ width: '100%' }} className="flex justify-end">
          <Button type="primary" onClick={async () => await executeDecreaseOrder(true)}>全部平仓</Button>
          <Button type="primary" onClick={async () => await executeDecreaseOrder()}>部分平仓</Button>
          <Button type="primary" onClick={() => setOpen(false)} danger>取消</Button>
        </Space>
      </Modal>}
    </>
  )
}