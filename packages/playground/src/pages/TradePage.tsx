import React, { useEffect, useState } from 'react';
import { getPools, getPoolLevel, getOraclePrice } from '../api';
import { placeOrder } from '@myx-trade/sdk';
import { useAccount, useWalletClient, useChainId } from 'wagmi';
import { BrowserProvider, ethers } from 'ethers';
import { Direction, OperationType, OrderType, TimeInForce, TriggerType } from '../config/con';
import { ChainId } from '../config/chain';
import { BigNumber } from 'bignumber.js';
import {
  Form,
  Select,
  Button,
  Card,
  Row,
  Col,
  Switch,
  InputNumber,
  Space,
  Tag,
  Typography,
  Divider
} from 'antd';

const { Text } = Typography;
const { Option } = Select;


interface TradeFormValues {
  orderType: number;
  triggerType: number;
  operation: number;
  direction: number;
  collateralAmount: number;
  size: number;
  orderPrice?: number;
  triggerPrice?: number;
  timeInForce: number;
  postOnly: boolean;
  slippagePct: number;
  leverage: number;
  tpSize: number;
  tpPrice: number;
  slSize: number;
  slPrice: number;
}

const TradePage: React.FC = () => {
  const { address } = useAccount();
  const currentChainId = useChainId();
  const { data: walletClient } = useWalletClient();
  const [pool, setPool] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [approving, setApproving] = useState(false);
  const [form] = Form.useForm<TradeFormValues>();

  

  useEffect(() => {
    getPools().then((rs) => {
      console.log('poolData--->', rs.data)
      const pool = rs.data.find((item: any) => item.poolId === '0x68115810b63fcf5e2c4ce8b7947075760814bc7ae8d54a018bf73685388cd312');
      setPool(pool);
      getOraclePrice(pool.poolId, ChainId.ARB_TESTNET).then((rs: any) => {
        const _price = rs.data[0].price;
        form.setFieldsValue({
          orderPrice: _price,
        })
      })
      getPoolLevel(pool.poolId, ChainId.ARB_TESTNET).then((rs) => {
        console.log('poolLevel--->', rs.data)
      })
    })
  }, []);

  // 设置表单默认值
  useEffect(() => {
    if (pool) {
      form.setFieldsValue({
        orderType: OrderType.MARKET,
        triggerType: TriggerType.NONE,
        operation: OperationType.INCREASE,
        direction: Direction.LONG,
        collateralAmount: 10000000,
        size: 10,
        orderPrice: 0,
        triggerPrice: 0,
        timeInForce: TimeInForce.IOC,
        postOnly: false,
        slippagePct: 0.3, // 0.5%
        leverage: 2,
        tpSize: 0,
        tpPrice: 0,
        slSize: 0,
        slPrice: 0,
      });
    }
  }, [pool, form]);

  // USDC 授权功能
  const handleApproval = async () => {
    if (!walletClient || !pool) return;
    
    setApproving(true);
    try {
      const provider = new BrowserProvider(walletClient.transport);
      const signer = await provider.getSigner();
      
      // USDC 合约地址（你提到的地址）
      const usdcAddress = pool.quoteToken; // USDC 合约地址
      const spenderAddress = '0x598B5C8243E477616fAD4d4838b26ceE3330EEdf'; // 要授权的合约地址
      
      // ERC20 ABI 中的 approve 函数
      const erc20Abi = [
        "function approve(address spender, uint256 amount) external returns (bool)"
      ];
      
      // 创建合约实例
      const usdcContract = new ethers.Contract(usdcAddress, erc20Abi, signer);
      
      // 授权最大金额（或者你可以设置具体金额）
      const maxAmount = ethers.MaxUint256;
      
      console.log('Approving USDC...', {
        usdcAddress,
        spenderAddress,
        amount: maxAmount.toString()
      });
      
      const tx = await usdcContract.approve(spenderAddress, maxAmount);
      console.log('Approval transaction:', tx.hash);
      
      // 等待交易确认
      const receipt = await tx.wait();
      console.log('Approval confirmed:', receipt);
      
      alert('USDC 授权成功！');
    } catch (error) {
      console.error('Approval error:', error);
      alert('授权失败: ' + (error as any).message);
    } finally {
      setApproving(false);
    }
  };

  const onFinish = async (values: TradeFormValues) => {
    if (!pool || !address || !walletClient) return;

    setLoading(true);
    try {
      console.log('Form values:', values);

      // 将 wagmi walletClient 转换为 ethers.js 兼容的 signer
      const provider = new BrowserProvider(walletClient.transport);
      const signer = await provider.getSigner();

      console.log(values.orderPrice)

      const rs = await placeOrder({
        chainId: ChainId.ARB_TESTNET,
        address: address as `0x${string}`,
        poolId: pool.poolId,
        positionId: 0,
        orderType: values.orderType as OrderType,
        triggerType: values.triggerType as TriggerType,
        operation: values.operation as OperationType,
        direction: values.direction as Direction,
        collateralAmount: new BigNumber(values.collateralAmount).multipliedBy(10 ** pool.quoteDecimals).toString(),
        size: new BigNumber(values.size).multipliedBy(10 ** pool.baseDecimals).toString(),
        orderPrice: values.orderPrice ? ethers.parseUnits(values.orderPrice.toString(), 30).toString() : '0',
        triggerPrice: values.orderPrice ? ethers.parseUnits(values.orderPrice.toString(), 30).toString() : '0',//values.orderPrice ? ethers.parseUnits(values.orderPrice.toString(), 30).toString() : '0',
        timeInForce: values.timeInForce as TimeInForce,
        postOnly: values.postOnly,
        slippagePct: new BigNumber(values.slippagePct).multipliedBy(10 ** 4).toString(), // 转换为精度4位
        executionFeeToken: pool.quoteToken,
        leverage: values.leverage,
        tpSize: '0',//new BigNumber(values.tpSize).multipliedBy(10 ** pool.baseDecimals).toString(),
        tpPrice:  '0',//values.tpPrice ? new BigNumber(values.tpPrice).multipliedBy(10 ** pool.quoteDecimals).toString() : '0',
        slSize: '0',//new BigNumber(values.slSize).multipliedBy(10 ** pool.baseDecimals).toString(),
        slPrice: '0',//values.slPrice ? new BigNumber(values.slPrice).multipliedBy(10 ** pool.quoteDecimals).toString() : '0',
      }, signer);

      console.log('rs--->', rs)

      console.log('Order placed:', rs);
    } catch (error) {
      console.error('Error placing order:', error);
    } finally {
      setLoading(false);
    }
  };

  const isNetworkCorrect = currentChainId === ChainId.ARB_TESTNET;
  const canTrade = pool && address && walletClient && isNetworkCorrect;

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px' }}>
      <Row gutter={[24, 24]}>
        <Col span={24}>
          <Card title="钱包状态" size="small">
            <Row gutter={[16, 8]}>
              <Col span={6}>
                <Text type="secondary">钱包地址:</Text>
                <br />
                <Text code>{address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '未连接'}</Text>
              </Col>
              <Col span={6}>
                <Text type="secondary">钱包客户端:</Text>
                <br />
                <Tag color={walletClient ? 'green' : 'red'}>
                  {walletClient ? '已连接' : '未连接'}
                </Tag>
              </Col>
              <Col span={6}>
                <Text type="secondary">当前网络:</Text>
                <br />
                <Text>Chain ID: {currentChainId}</Text>
              </Col>
              <Col span={6}>
                <Text type="secondary">网络状态:</Text>
                <br />
                <Tag color={isNetworkCorrect ? 'green' : 'red'}>
                  {isNetworkCorrect ? '✅ Arbitrum Sepolia' : '❌ 错误网络'}
                </Tag>
              </Col>
            </Row>
            {pool && (
              <>
                <Divider />
                <Row gutter={[16, 8]}>
                  <Col span={8}>
                    <Text type="secondary">交易对:</Text>
                    <br />
                    <Text strong>{pool.baseSymbol}/{pool.quoteSymbol}</Text>
                  </Col>
                  <Col span={8}>
                    <Text type="secondary">Pool ID:</Text>
                    <br />
                    <Text code>{pool.poolId.slice(0, 10)}...</Text>
                  </Col>
                  <Col span={8}>
                    <Text type="secondary">精度:</Text>
                    <br />
                    <Text>Base: {pool.baseDecimals}, Quote: {pool.quoteDecimals}</Text>
                  </Col>
                </Row>
                <Divider />
                <Row gutter={[16, 8]}>
                  <Col span={12}>
                    <Text type="secondary">USDC 合约:</Text>
                    <br />
                    <Text code>{pool.quoteToken}</Text>
                  </Col>
                  <Col span={12}>
                    <Text type="secondary">授权给合约:</Text>
                    <br />
                    <Text code>0x598B5C8243E477616fAD4d4838b26ceE3330EEdf</Text>
                  </Col>
                </Row>
              </>
            )}
          </Card>
        </Col>

        <Col span={24}>
          <Card title="交易参数" loading={!pool}>
            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
              disabled={!canTrade}
            >
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Card title="订单基础信息" size="small" style={{ height: '100%' }}>
                    <Form.Item label="订单类型" name="orderType">
                      <Select>
                        <Option value={OrderType.MARKET}>市价单</Option>
                        <Option value={OrderType.LIMIT}>限价单</Option>
                        <Option value={OrderType.STOP}>止损单</Option>
                        <Option value={OrderType.CONDITIONAL}>条件单</Option>
                      </Select>
                    </Form.Item>

                    <Form.Item label="触发类型" name="triggerType">
                      <Select>
                        <Option value={TriggerType.NONE}>无</Option>
                        <Option value={TriggerType.GTE}>大于等于</Option>
                        <Option value={TriggerType.LTE}>小于等于</Option>
                      </Select>
                    </Form.Item>

                    <Form.Item label="操作类型" name="operation">
                      <Select>
                        <Option value={OperationType.INCREASE}>增加</Option>
                        <Option value={OperationType.DECREASE}>减少</Option>
                      </Select>
                    </Form.Item>

                    <Form.Item label="方向" name="direction">
                      <Select>
                        <Option value={Direction.LONG}>做多</Option>
                        <Option value={Direction.SHORT}>做空</Option>
                      </Select>
                    </Form.Item>
                  </Card>
                </Col>

                <Col span={12}>
                  <Card title="数量和价格" size="small" style={{ height: '100%' }}>
                    <Form.Item label={`保证金数量 (${pool?.quoteSymbol || 'USDT'})`} name="collateralAmount">
                      <InputNumber style={{ width: '100%' }} min={0} />
                    </Form.Item>

                    <Form.Item label={`交易数量 (${pool?.baseSymbol || 'Token'})`} name="size">
                      <InputNumber style={{ width: '100%' }} min={0} />
                    </Form.Item>

                    <Form.Item label={`订单价格 (${pool?.quoteSymbol || 'USDT'})`} name="orderPrice">
                      <InputNumber style={{ width: '100%' }} min={0} />
                    </Form.Item>

                    <Form.Item label={`触发价格 (${pool?.quoteSymbol || 'USDT'})`} name="triggerPrice">
                      <InputNumber style={{ width: '100%' }} min={0} />
                    </Form.Item>
                  </Card>
                </Col>

                <Col span={12}>
                  <Card title="高级设置" size="small" style={{ height: '100%' }}>
                    <Form.Item label="时间有效性" name="timeInForce">
                      <Select>
                        <Option value={TimeInForce.IOC}>IOC</Option>
                      </Select>
                    </Form.Item>

                    <Form.Item label="仅挂单" name="postOnly" valuePropName="checked">
                      <Switch />
                    </Form.Item>

                    <Form.Item label="滑点 (%)" name="slippagePct">
                      <InputNumber style={{ width: '100%' }} min={0} max={100} step={0.1} />
                    </Form.Item>

                    <Form.Item label="杠杆倍数" name="leverage">
                      <InputNumber style={{ width: '100%' }} min={1} max={100} />
                    </Form.Item>
                  </Card>
                </Col>

                <Col span={12}>
                  <Card title="止盈止损" size="small" style={{ height: '100%' }}>
                    <Form.Item label={`止盈数量 (${pool?.baseSymbol || 'Token'})`} name="tpSize">
                      <InputNumber style={{ width: '100%' }} min={0} />
                    </Form.Item>

                    <Form.Item label={`止盈价格 (${pool?.quoteSymbol || 'USDT'})`} name="tpPrice">
                      <InputNumber style={{ width: '100%' }} min={0} />
                    </Form.Item>

                    <Form.Item label={`止损数量 (${pool?.baseSymbol || 'Token'})`} name="slSize">
                      <InputNumber style={{ width: '100%' }} min={0} />
                    </Form.Item>

                    <Form.Item label={`止损价格 (${pool?.quoteSymbol || 'USDT'})`} name="slPrice">
                      <InputNumber style={{ width: '100%' }} min={0} />
                    </Form.Item>
                  </Card>
                </Col>
              </Row>

              <Divider />

              <Form.Item>
                <Space>
                  <Button
                    type="default"
                    onClick={handleApproval}
                    loading={approving}
                    disabled={!pool || !walletClient || !isNetworkCorrect}
                    size="large"
                  >
                    授权 USDC
                  </Button>

                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    disabled={!canTrade}
                    size="large"
                  >
                    提交订单
                  </Button>

                  <Button onClick={() => form.resetFields()}>
                    重置表单
                  </Button>

                  {!isNetworkCorrect && (
                    <Text type="danger">
                      请切换到 Arbitrum Sepolia 测试网
                    </Text>
                  )}
                </Space>
              </Form.Item>
            </Form>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default TradePage;
