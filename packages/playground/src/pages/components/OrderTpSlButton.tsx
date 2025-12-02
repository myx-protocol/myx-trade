/*
import type { MyxClient } from "@myx-trade/sdk";
import { Button, message, Modal, Form, Row, Col, Tag, Card, InputNumber } from "antd"
import { ethers } from "ethers";
import { useState } from "react";

export const OrderSettingsButton = ({ record, myxClient, poolList }: { record: any, myxClient: MyxClient, poolList: any[] }) => {
  const [tpSlLoading, setTpSlLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();

  const executeTpSlOrder = async (values: any) => {
    
    setTpSlLoading(true);
    try {
      if (myxClient) {
        const pool = poolList.find((pool) => pool.poolId === record.poolId)
        
        // 处理止盈止损参数
        const tpSize = values.tpSize ? ethers.parseUnits(values.tpSize.toString(), pool?.baseDecimals).toString() : '0'
        const slSize = values.slSize ? ethers.parseUnits(values.slSize.toString(), pool?.baseDecimals).toString() : '0'
        const tpPrice = values.tpPrice ? ethers.parseUnits(values.tpPrice.toString(), 30).toString() : '0'
        const slPrice = values.slPrice ? ethers.parseUnits(values.slPrice.toString(), 30).toString() : '0'

        // 处理基础订单参数（需要格式化）
        const formattedPrice = values.price ? ethers.parseUnits(values.price.toString(), 30).toString() : undefined
        const formattedSize = values.size ? ethers.parseUnits(values.size.toString(), pool?.baseDecimals).toString() : undefined

        // 构造更新参数
        const updateParams: any = {
          orderId: record.orderId,
          tpSize: tpSize,
          tpPrice: tpPrice,
          slSize: slSize,
          slPrice: slPrice,
          executionFeeToken: record.executionFeeToken,
          useOrderCollateral: true,
        }

        // 只有当用户输入了价格或数量时才添加到参数中
        if (formattedPrice !== undefined) {
          updateParams.price = formattedPrice;
        }
        if (formattedSize !== undefined) {
          updateParams.size = formattedSize;
        }

        const result = await myxClient.order.updateOrderTpSl(updateParams)

        console.log("executeTpSlOrder result", result)
        message.success('订单更新成功 / Order updated successfully');
        setOpen(false);
        form.resetFields();
      }
    } catch (error) {
      console.error("Update order error:", error);
      message.error('订单更新失败 / Order update failed');
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
        title="修改订单和设置止盈止损"
        style={{ fontSize: '10px', padding: '2px 6px' }}
      >
        订单设置
      </Button>
      {/!* 订单修改和止盈止损设置弹窗 / Order Modification & TP/SL Setting Modal *!/}
      <Modal
        title="修改订单和设置止盈止损 / Modify Order & Set TP/SL"
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
              {/!* 基础订单信息设置 / Basic Order Settings *!/}
              <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                <Col span={12}>
                  <Card title="订单基础设置 / Basic Order Settings" size="small">
                    <Form.Item
                      label="订单价格 / Order Price"
                      name="price"
                      help="修改订单价格 / Modify order price"
                    >
                      <InputNumber
                        style={{ width: '100%' }}
                        min={0}
                        step={0.01}
                        placeholder={`当前价格: ${record.price} / Current: ${record.price}`}
                      />
                    </Form.Item>
                    <Form.Item
                      label="订单数量 / Order Size"
                      name="size"
                      help="修改订单数量 / Modify order size"
                    >
                      <InputNumber
                        style={{ width: '100%' }}
                        min={0}
                        step={0.01}
                        placeholder={`当前数量: ${record.size} / Current: ${record.size}`}
                      />
                    </Form.Item>
                  </Card>
                </Col>
              </Row>

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
}*/

export const OrderSettingsButton = () => {

}
