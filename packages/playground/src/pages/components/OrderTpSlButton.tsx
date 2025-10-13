import type { MyxClient } from "@myx-trade/sdk";
import { Button, message, Modal, Form, Row, Col, Tag, Card, InputNumber } from "antd"
import { ethers } from "ethers";
import { useState } from "react";

export const OrderTpSlButton = ({ record, myxClient, poolList }: { record: any, myxClient: MyxClient, poolList: any[] }) => {
  const [tpSlLoading, setTpSlLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();

  const executeTpSlOrder = async (values: any) => {
    console.log("executeTpSlOrder values", values)
    setTpSlLoading(true);
    try {
      if (myxClient) {
        const pool = poolList.find((pool) => pool.poolId === record.poolId)
        const tpSize = values.tpSize ? ethers.parseUnits(values.tpSize.toString(), pool?.baseDecimals).toString() : '0'
        const slSize = values.slSize ? ethers.parseUnits(values.slSize.toString(), pool?.baseDecimals).toString() : '0'
        const tpPrice = values.tpPrice ? ethers.parseUnits(values.tpPrice.toString(), 30).toString() : '0'
        const slPrice = values.slPrice ? ethers.parseUnits(values.slPrice.toString(), 30).toString() : '0'

        const result = await myxClient.order.updateOrderTpSl({
          orderId: record.orderId,
          tpSize: tpSize,
          tpPrice: tpPrice,
          slSize: slSize,
          slPrice: slPrice,
          executionFeeToken: record.executionFeeToken,
          useOrderCollateral: false,
        })

        console.log("executeTpSlOrder result", result)
        // setOpen(false);
        // form.resetFields();
      }
    } catch (error) {
      console.error("Set TP/SL error:", error);
      message.error('止盈止损设置失败 / TP/SL setting failed');
    } finally {
      setTpSlLoading(false);
    }
  };
  return (
    <>
      <Button
        loading={tpSlLoading}
        type="default"
        size="small"
        onClick={() => setOpen(true)}
        title="设置止盈止损"
        style={{ fontSize: '10px', padding: '2px 6px' }}
      >
        止盈止损
      </Button>
      {/* 止盈止损设置弹窗 / TP/SL Setting Modal */}
      <Modal
        title="设置止盈止损 / Set Take Profit & Stop Loss"
        open={open}
        onOk={() => form.submit()}
        onCancel={() => {
          setOpen(false);
          form.resetFields();
        }}
        confirmLoading={tpSlLoading}
        okText="确认设置 / Confirm"
        cancelText="取消 / Cancel"
        width={600}
      >
        {record && (
          <div>
            <div style={{ marginBottom: 16 }}>
              <p>订单信息 / Order Info:</p>
            </div>
            <Row gutter={[16, 8]} style={{ marginBottom: 16 }}>
              <Col span={12}>
                <p>订单ID / Order ID: </p>
                <Tag color="blue">{record.orderId}</Tag>
              </Col>
              <Col span={12}>
                <p>方向 / Direction: </p>
                <Tag color={record.direction === 0 ? 'green' : 'red'}>
                  {record.direction === 0 ? '做多 / LONG' : '做空 / SHORT'}
                </Tag>
              </Col>
              <Col span={12}>
                <p>数量 / Size: </p>
                <p>{record.size}</p>
              </Col>
              <Col span={12}>
                <p>价格 / Price: </p>
                <p>{record.price}</p>
              </Col>
            </Row>

            <Form
              form={form}
              layout="vertical"
              onFinish={async (values) => await executeTpSlOrder(values)}
            >
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Card title="止盈设置 / Take Profit" size="small">
                    <Form.Item
                      label="止盈价格 / TP Price"
                      name="tpPrice"
                      help="止盈触发价格 / Take profit trigger price"
                    >
                      <InputNumber
                        style={{ width: '100%' }}
                        min={0}
                        step={0.01}
                        placeholder="输入止盈价格 / Enter TP price"
                      />
                    </Form.Item>
                    <Form.Item
                      label="止盈数量 / TP Size"
                      name="tpSize"
                      help="止盈平仓数量 / Take profit close size"
                    >
                      <InputNumber
                        style={{ width: '100%' }}
                        min={0}
                        step={0.01}
                        placeholder="输入止盈数量 / Enter TP size"
                      />
                    </Form.Item>
                  </Card>
                </Col>

                <Col span={12}>
                  <Card title="止损设置 / Stop Loss" size="small">
                    <Form.Item
                      label="止损价格 / SL Price"
                      name="slPrice"
                      help="止损触发价格 / Stop loss trigger price"
                    >
                      <InputNumber
                        style={{ width: '100%' }}
                        min={0}
                        step={0.01}
                        placeholder="输入止损价格 / Enter SL price"
                      />
                    </Form.Item>
                    <Form.Item
                      label="止损数量 / SL Size"
                      name="slSize"
                      help="止损平仓数量 / Stop loss close size"
                    >
                      <InputNumber
                        style={{ width: '100%' }}
                        min={0}
                        step={0.01}
                        placeholder="输入止损数量 / Enter SL size"
                      />
                    </Form.Item>
                  </Card>
                </Col>
              </Row>
            </Form>
          </div>
        )}
      </Modal>
    </>
  )
}