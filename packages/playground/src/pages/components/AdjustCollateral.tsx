import type { MyxClient } from "@myx-trade/sdk";
import { Button, Input, Modal, Space, Tag, Form, Typography, message } from "antd";
import { ethers } from "ethers";
import { useState } from "react";

const { Text } = Typography;

export const AdjustCollateral = ({ record, myxClient, poolList }: { record: any, myxClient: MyxClient, poolList: any[] }) => {
  const [adjustModalVisible, setAdjustModalVisible] = useState(false);
  const [amount, setAmount] = useState('');
  const [adjustLoading, setAdjustLoading] = useState(false);

  const handleAdjustCollateral = async () => {
    setAdjustLoading(true);
    try {
      if (myxClient) {
        const pool = poolList.find((pool) => pool.poolId === record.poolId);
        const adjustAmount = ethers.parseUnits(amount, pool?.quoteDecimals).toString();
        console.log("adjustAmount", adjustAmount);
        console.log("record.positionId", record.positionId);
        const result = await myxClient.position.adjustCollateral({
          poolId: record.poolId,
          positionId: record.positionId,
          adjustAmount: adjustAmount,
        });
        if (result?.code === 0) {
          message.success('保证金调整成功 / Collateral adjusted successfully');
          setAdjustModalVisible(false);
          setAmount('');
        } else {
          message.error(`保证金调整失败 / Collateral adjustment failed: ${result?.message}`);
        }
      }
    } catch (error) {
      console.error("Adjust collateral error:", error);
      message.error('保证金调整失败 / Collateral adjustment failed');
    } finally {
      setAdjustLoading(false);
    }
  };


  return <>
    <Button
      type="default"
      size="small"
      onClick={() => {
        setAdjustModalVisible(true);
      }}
      style={{ fontSize: '10px', padding: '2px 6px' }}
    >
      调整
    </Button>
    {adjustModalVisible && <Modal
      title="调整保证金 / Adjust Collateral"
      open={adjustModalVisible}
      onOk={async () => {
        handleAdjustCollateral();
      }}
      onCancel={() => {
        setAdjustModalVisible(false);
        setAmount('');
      }}
      confirmLoading={adjustLoading}
      okText="确认调整 / Confirm"
      cancelText="取消 / Cancel"
    >
      <div>
        <Space direction="vertical" style={{ width: '100%' }}>
          <div>
            <p>仓位信息 / Position Info:</p>
          </div>
          <div>
            <p>仓位ID / Position ID: </p>
            <Tag color="blue">{record.positionId}</Tag>
          </div>
          <div>
            <p>方向 / Direction: </p>
            <Tag color={record.direction === 0 ? 'green' : 'red'}>
              {record.direction === 0 ? '做多 / LONG' : '做空 / SHORT'}
            </Tag>
          </div>
          <div>
            <p>当前保证金 / Current Collateral: </p>
            <p >{record.collateralAmount}</p>
          </div>
          <div>
            <p>数量 / Size: </p>
            <p>{record.size}</p>
          </div>

          <Form.Item
            label="调整金额 / Adjustment Amount"
            style={{ marginBottom: 0, marginTop: 16 }}
          >
            <Input
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="输入正数增加，负数减少保证金 / Enter positive to add, negative to reduce"
              suffix="USDT"
            />
          </Form.Item>

          <div style={{ marginTop: 8 }}>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              提示：输入正数增加保证金，输入负数减少保证金 /
              Tip: Enter positive number to increase, negative to decrease collateral
            </Text>
          </div>
        </Space>
      </div>
    </Modal>}
  </>
};