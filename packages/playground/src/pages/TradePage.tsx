import React, { useEffect, useState } from 'react';
import { getPools, getPoolLevel, getOraclePrice } from '../api';
import { placeOrder, cancelOrder, cancelOrders } from '@myx-trade/sdk';
import { useAccount, useWalletClient, useChainId } from 'wagmi';
import { BrowserProvider, ethers } from 'ethers';
import { Direction, OperationType, OrderType, TimeInForce, TriggerType } from '../config/con';
import { ChainId } from '../config/chain';
import { BigNumber } from 'bignumber.js';
import { MyxClient } from '@myx-trade/sdk';

import useSWR from 'swr'
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
  Divider,
  Input
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
  const { address, isConnected } = useAccount();
  const currentChainId = useChainId();
  const { data: walletClient } = useWalletClient();
  const [loading, setLoading] = useState(false);
  const [approving, setApproving] = useState(false);
  const [orderId, setOrderId] = useState<string>('');
  const [orderIds, setOrderIds] = useState<string>('');
  const [form] = Form.useForm<TradeFormValues>();
  const [myxClient, setMyxClient] = useState<MyxClient | null>(null);

  const initClient = async () => {
    if (walletClient?.transport) {
      const provider = new BrowserProvider(walletClient.transport);
      const signer = await provider.getSigner();
      console.log(selectedPool)
      const client = new MyxClient({ signer: signer, chainId: ChainId.ARB_TESTNET, brokerAddress: '0xa70245309631Ce97425532466F24ef86FE630311' });
      
      setMyxClient(client);
      console.log('client->', client)
    }
  }

  useEffect(() => {
    if (walletClient?.transport) {
      initClient()
    }
  }, [walletClient]);
  const { data: poolList } = useSWR('getPoolList', async () => {
    const rs = await getPools()
    const poolList = rs?.data ?? []
    console.log('poolList-->', poolList)

    // 为每个池子获取 level 配置
    const poolsWithLevel = await Promise.all(
      poolList.map(async (pool: any) => {
        try {
          const levelRes = await getPoolLevel(pool.poolId, ChainId.ARB_TESTNET);
          return { ...pool, levelData: levelRes.data };
        } catch (error) {
          console.error(`Failed to get level data for pool ${pool.poolId}:`, error);
          return { ...pool, levelData: null };
        }
      })
    );

    return poolsWithLevel;
  })

  const [selectedPoolId, setSelectedPoolId] = useState<string>("0x5cd0bc68073c63064c9820d395a8c4c1225bc43eca47e39903b5193f9585a2ec");
  const selectedPool = poolList?.find((item: any) => item.poolId === selectedPoolId);

  // 获取选中池子的 level 配置
  const { data: poolLevelData } = useSWR(
    selectedPool ? `poolLevel-${selectedPool.poolId}` : null,
    async () => {
      if (!selectedPool) return null;
      const res = await getPoolLevel(selectedPool.poolId, ChainId.ARB_TESTNET);
      console.log('poolLevelData-->', res.data);
      return res.data;
    }
  );

  // 当选择的池子变化时，获取价格信息
  useEffect(() => {
    if (selectedPool) {
      getOraclePrice(selectedPool.poolId, ChainId.ARB_TESTNET).then((oraclePriceRes) => {
        const _price = oraclePriceRes.data[0].price;
        form.setFieldsValue({
          orderPrice: _price,
        })
      }).catch(console.error);

      getPoolLevel(selectedPool.poolId, ChainId.ARB_TESTNET).then((getPoolLevelRes) => {
        console.log('getPoolLevelRes-->', getPoolLevelRes?.data)
      }).catch(console.error);
    }
  }, [selectedPool, form]);

  // 设置表单默认值
  useEffect(() => {
    if (selectedPool) {
      form.setFieldsValue({
        orderType: OrderType.MARKET,
        triggerType: TriggerType.NONE,
        operation: OperationType.INCREASE,
        direction: Direction.LONG,
        collateralAmount: 1000,
        size: 10,
        orderPrice: 0,
        triggerPrice: 0,
        timeInForce: TimeInForce.IOC,
        postOnly: false,
        slippagePct: 0.001, // 0.5%
        leverage: 10,
        tpSize: 0,
        tpPrice: 0,
        slSize: 0,
        slPrice: 0,
      });
    }
  }, [selectedPool, form]);

  // USDC 授权功能
  const handleApproval = async () => {
    if (!selectedPool) {
      console.error('Pool data not available');
      return;
    }

    if (!walletClient) {
      console.error('WalletClient is null or undefined');
      alert('钱包客户端未准备好，请重新连接钱包');
      return;
    }

    setApproving(true);
    try {
      const provider = new BrowserProvider(walletClient.transport);
      const signer = await provider.getSigner();

      // USDC 合约地址（你提到的地址）
      const usdcAddress = selectedPool.quoteToken; // USDC 合约地址
      const spenderAddress = '0x17b72e6713233EA5C16c952AFA7742F71B20ea8c'; // 要授权的合约地址

      // ERC20 ABI 中的 approve 函数
      const erc20Abi = [
        "function approve(address spender, uint256 amount) external returns (bool)"
      ];

      const usdcContract = new ethers.Contract(usdcAddress, erc20Abi, signer);
      const maxAmount = ethers.MaxUint256;
      const tx = await usdcContract.approve(spenderAddress, maxAmount);
      const receipt = await tx.wait();

      console.log('Approval confirmed:', receipt);
      console.log('USDC 授权成功！');
    } catch (error) {
      console.error('Approval error:', error);
      alert('授权失败: ' + (error as any).message);
    } finally {
      setApproving(false);
    }
  };

  const onFinish = async (values: TradeFormValues) => {
    if (!selectedPool || !address || !isConnected) {
      console.log('Missing required data:', { selectedPool: !!selectedPool, address: !!address, isConnected });
      return;
    }

    if (!walletClient || !myxClient) {
      console.error('WalletClient is null or undefined');
      alert('钱包客户端未准备好，请重新连接钱包');
      return;
    }

    setLoading(true);
    try {
      console.log('address-->', address)
      console.log('walletClient-->', walletClient)
      // 将 wagmi walletClient 转换为 ethers.js 兼容的 signer
      const provider = new BrowserProvider(walletClient.transport);
      const signer = await provider.getSigner();

      console.log(selectedPool.baseDecimals)
      const orderData = {
        chainId: ChainId.ARB_TESTNET,
        address: address as `0x${string}`,
        poolId: selectedPool.poolId,
        positionId: 0,
        orderType: values.orderType as OrderType,
        triggerType: values.triggerType as TriggerType,
        operation: values.operation as OperationType,
        direction: values.direction as Direction,
        collateralAmount: new BigNumber(values.collateralAmount).multipliedBy(10 ** selectedPool.quoteDecimals).toString(),
        size: new BigNumber(values.size).multipliedBy(10 ** selectedPool.baseDecimals).toString(),
        orderPrice: values.orderPrice ? ethers.parseUnits(values.orderPrice.toString(), 30).toString() : '0',
        triggerPrice: values.orderPrice ? ethers.parseUnits(values.orderPrice.toString(), 30).toString() : '0',//values.orderPrice ? ethers.parseUnits(values.orderPrice.toString(), 30).toString() : '0',
        timeInForce: values.timeInForce as TimeInForce,
        postOnly: values.postOnly,
        slippagePct: new BigNumber(values.slippagePct).multipliedBy(10 ** 4).toString(), // 转换为精度4位
        executionFeeToken: selectedPool.quoteToken,
        leverage: values.leverage,
        tpSize: values.tpSize ? new BigNumber(values.tpSize).multipliedBy(10 ** selectedPool.baseDecimals).toString() : '0',
        tpPrice: values.tpPrice ? new BigNumber(values.tpPrice).multipliedBy(10 ** selectedPool.quoteDecimals).toString() : '0',
        slSize: values.slSize ? new BigNumber(values.slSize).multipliedBy(10 ** selectedPool.baseDecimals).toString() : '0' ,
        slPrice: values.slPrice ? new BigNumber(values.slPrice).multipliedBy(10 ** selectedPool.quoteDecimals).toString() : '0',
      }

      console.log('orderData')

      const rs = await myxClient.placeOrder(orderData);


      console.log('Order placed:', rs);
    } catch (error) {
      console.error('Error placing order:', error);
    } finally {
      setLoading(false);
    }
  };

  // orderId: 1 2 

  const isNetworkCorrect = currentChainId === ChainId.ARB_TESTNET;

  const canTrade = selectedPool && address && isConnected && isNetworkCorrect;

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
            {selectedPool && (
              <>
                <Divider />
                <Row gutter={[16, 8]}>
                  <Col span={6}>
                    <Text type="secondary">交易对:</Text>
                    <br />
                    <Text strong style={{ fontSize: '16px' }}>{selectedPool.baseSymbol}/{selectedPool.quoteSymbol}</Text>
                  </Col>
                  <Col span={6}>
                    <Text type="secondary">Pool ID:</Text>
                    <br />
                    <Text code style={{ fontSize: '10px', wordBreak: 'break-all' }}>{selectedPool.poolId}</Text>
                  </Col>
                  <Col span={6}>
                    <Text type="secondary">精度:</Text>
                    <br />
                    <Text>Base: {selectedPool.baseDecimals}, Quote: {selectedPool.quoteDecimals}</Text>
                  </Col>
                  <Col span={6}>
                    <Text type="secondary">状态:</Text>
                    <br />
                    <Tag color={selectedPool.state === 2 ? 'green' : 'red'}>
                      {selectedPool.state === 2 ? '可交易' : '不可交易'}
                    </Tag>
                  </Col>
                </Row>
                <Divider />
                <Row gutter={[16, 8]}>
                  <Col span={8}>
                    <Text type="secondary">基础代币合约:</Text>
                    <br />
                    <Text code style={{ fontSize: '12px', wordBreak: 'break-all' }}>{selectedPool.baseToken}</Text>
                  </Col>
                  <Col span={8}>
                    <Text type="secondary">计价代币合约:</Text>
                    <br />
                    <Text code style={{ fontSize: '12px', wordBreak: 'break-all' }}>{selectedPool.quoteToken}</Text>
                  </Col>
                  <Col span={8}>
                    <Text type="secondary">授权给合约:</Text>
                    <br />
                    <Text code style={{ fontSize: '12px', wordBreak: 'break-all' }}>0x17b72e6713233EA5C16c952AFA7742F71B20ea8c</Text>
                  </Col>
                </Row>
                {selectedPool.maxLeverage && (
                  <>
                    <Divider />
                    <Row gutter={[16, 8]}>
                      <Col span={8}>
                        <Text type="secondary">最大杠杆:</Text>
                        <br />
                        <Text strong style={{ color: '#ff7300', fontSize: '16px' }}>{selectedPool.maxLeverage}x</Text>
                      </Col>
                      <Col span={8}>
                        <Text type="secondary">基础资产符号:</Text>
                        <br />
                        <Text strong>{selectedPool.baseSymbol}</Text>
                      </Col>
                      <Col span={8}>
                        <Text type="secondary">计价资产符号:</Text>
                        <br />
                        <Text strong>{selectedPool.quoteSymbol}</Text>
                      </Col>
                    </Row>
                  </>
                )}
                {poolLevelData && poolLevelData.levelConfig && (
                  <>
                    <Divider />
                    <div style={{ marginBottom: '16px' }}>
                      <Text strong style={{ fontSize: '14px' }}>
                        池子配置 - {poolLevelData.levelName} (Level {poolLevelData.level})
                      </Text>
                    </div>
                    <Row gutter={[16, 8]}>
                      <Col span={6}>
                        <Text type="secondary">杠杆倍数:</Text>
                        <br />
                        <Text strong style={{ color: '#1890ff' }}>{poolLevelData.levelConfig.leverage}x</Text>
                      </Col>
                      <Col span={6}>
                        <Text type="secondary">维持保证金率:</Text>
                        <br />
                        <Text strong>{(poolLevelData.levelConfig.maintainCollateralRate * 100).toFixed(2)}%</Text>
                      </Col>
                      <Col span={6}>
                        <Text type="secondary">最小订单(USD):</Text>
                        <br />
                        <Text strong>${poolLevelData.levelConfig.minOrderSizeInUsd}</Text>
                      </Col>
                      <Col span={6}>
                        <Text type="secondary">滑点:</Text>
                        <br />
                        <Text strong>{(poolLevelData.levelConfig.slip * 100).toFixed(3)}%</Text>
                      </Col>
                    </Row>
                    <Row gutter={[16, 8]} style={{ marginTop: '12px' }}>
                      <Col span={6}>
                        <Text type="secondary">资金费率1:</Text>
                        <br />
                        <Text>{(poolLevelData.levelConfig.fundingFeeRate1 * 100).toFixed(4)}%</Text>
                      </Col>
                      <Col span={6}>
                        <Text type="secondary">资金费率1最大:</Text>
                        <br />
                        <Text>{(poolLevelData.levelConfig.fundingFeeRate1Max * 100).toFixed(3)}%</Text>
                      </Col>
                      <Col span={6}>
                        <Text type="secondary">资金费率2:</Text>
                        <br />
                        <Text>{(poolLevelData.levelConfig.fundingFeeRate2 * 100).toFixed(3)}%</Text>
                      </Col>
                      <Col span={6}>
                        <Text type="secondary">资金费用周期:</Text>
                        <br />
                        <Text>{poolLevelData.levelConfig.fundingFeeSeconds / 3600}小时</Text>
                      </Col>
                    </Row>
                    <Row gutter={[16, 8]} style={{ marginTop: '12px' }}>
                      <Col span={6}>
                        <Text type="secondary">锁定流动性:</Text>
                        <br />
                        <Text>${poolLevelData.levelConfig.lockLiquidity.toLocaleString()}</Text>
                      </Col>
                      <Col span={6}>
                        <Text type="secondary">锁定价格比率:</Text>
                        <br />
                        <Text>{(poolLevelData.levelConfig.lockPriceRate * 100).toFixed(2)}%</Text>
                      </Col>
                      <Col span={6}>
                        <Text type="secondary">锁定时间:</Text>
                        <br />
                        <Text>{poolLevelData.levelConfig.lockSeconds / 3600}小时</Text>
                      </Col>
                      <Col span={6}>
                        <Text type="secondary">配置名称:</Text>
                        <br />
                        <Tag color="blue">{poolLevelData.levelName}</Tag>
                      </Col>
                    </Row>
                  </>
                )}
              </>
            )}
          </Card>
        </Col>

        <Col span={24}>
          <Card title="选择交易池" loading={!poolList}>
            <Row gutter={[16, 16]}>
              {poolList?.map((pool: any) => (
                <Col span={12} key={pool.poolId}>
                  <Card
                    hoverable
                    className={selectedPoolId === pool.poolId ? 'border-blue-500 bg-blue-50' : ''}
                    onClick={() => setSelectedPoolId(pool.poolId)}
                    size="small"
                  >
                    <div className="space-y-3">
                      {/* 交易对名称 */}
                      <div className="text-center">
                        <div className="text-xl font-bold text-gray-800 mb-1">
                          {pool.baseSymbol}/{pool.quoteSymbol}
                        </div>
                        <div className="text-sm text-gray-500">
                          {selectedPoolId === pool.poolId && <span className="text-blue-600">✓ 已选择</span>}
                        </div>
                      </div>

                      {/* 基本信息 */}
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-gray-500">基础资产:</span>
                          <div className="font-mono">{pool.baseSymbol}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">计价资产:</span>
                          <div className="font-mono">{pool.quoteSymbol}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">基础精度:</span>
                          <div className="font-mono">{pool.baseDecimals}位</div>
                        </div>
                        <div>
                          <span className="text-gray-500">计价精度:</span>
                          <div className="font-mono">{pool.quoteDecimals}位</div>
                        </div>
                      </div>

                      {/* 合约地址 */}
                      <div className="space-y-1 text-xs">
                        <div>
                          <span className="text-gray-500">基础代币:</span>
                          <div className="font-mono text-blue-600 break-all">{pool.baseToken}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">计价代币:</span>
                          <div className="font-mono text-blue-600 break-all">{pool.quoteToken}</div>
                        </div>
                      </div>

                      {/* Pool ID */}
                      <div className="text-xs">
                        <span className="text-gray-500">Pool ID:</span>
                        <div className="font-mono text-gray-600 break-all">
                          {pool.poolId}
                        </div>
                      </div>

                      {/* Level 配置信息 */}
                      {pool.levelData && pool.levelData.levelConfig && (
                        <div className="space-y-1 text-xs bg-gray-50 p-2 rounded">
                          <div className="font-semibold text-gray-700 mb-1">
                            配置 {pool.levelData.levelName} (Level {pool.levelData.level})
                          </div>
                          <div className="grid grid-cols-2 gap-1">
                            <div>
                              <span className="text-gray-500">杠杆:</span>
                              <span className="font-bold text-blue-600"> {pool.levelData.levelConfig.leverage}x</span>
                            </div>
                            <div>
                              <span className="text-gray-500">最小订单:</span>
                              <span className="font-semibold"> ${pool.levelData.levelConfig.minOrderSizeInUsd}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">维持保证金:</span>
                              <span className="font-semibold"> {(pool.levelData.levelConfig.maintainCollateralRate * 100).toFixed(1)}%</span>
                            </div>
                            <div>
                              <span className="text-gray-500">滑点:</span>
                              <span className="font-semibold"> {(pool.levelData.levelConfig.slip * 100).toFixed(2)}%</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* 其他参数 */}
                      {pool.maxLeverage && (
                        <div className="text-xs">
                          <span className="text-gray-500">最大杠杆:</span>
                          <span className="font-bold text-orange-600"> {pool.maxLeverage}x</span>
                        </div>
                      )}

                      {pool.state !== undefined && (
                        <div className="text-xs">
                          <span className="text-gray-500">状态:</span>
                          <span className={`ml-1 px-2 py-1 rounded text-white text-xs ${pool.state === 2 ? 'bg-green-500' : 'bg-red-500'}`}>
                            {pool.state === 2 ? '可交易' : '不可交易'}
                          </span>
                        </div>
                      )}
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          </Card>
        </Col>

        <Col span={24}>
          <Card title="交易参数" loading={!selectedPool}>
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
                    <Form.Item label={`保证金数量 (${selectedPool?.quoteSymbol || 'USDT'})`} name="collateralAmount">
                      <InputNumber style={{ width: '100%' }} min={0} />
                    </Form.Item>

                    <Form.Item label={`交易数量 (${selectedPool?.baseSymbol || 'Token'})`} name="size">
                      <InputNumber style={{ width: '100%' }} min={0} />
                    </Form.Item>

                    <Form.Item label={`订单价格 (${selectedPool?.quoteSymbol || 'USDT'})`} name="orderPrice">
                      <InputNumber style={{ width: '100%' }} min={0} />
                    </Form.Item>

                    <Form.Item label={`触发价格 (${selectedPool?.quoteSymbol || 'USDT'})`} name="triggerPrice">
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

                    <Form.Item label="滑点" name="slippagePct">
                      <InputNumber style={{ width: '100%' }} min={0} max={100} step={0.1} />
                    </Form.Item>

                    <Form.Item label="杠杆倍数" name="leverage">
                      <InputNumber style={{ width: '100%' }} min={1} max={100} />
                    </Form.Item>
                  </Card>
                </Col>

                <Col span={12}>
                  <Card title="止盈止损" size="small" style={{ height: '100%' }}>
                    <Form.Item label={`止盈数量 (${selectedPool?.baseSymbol || 'Token'})`} name="tpSize">
                      <InputNumber style={{ width: '100%' }} min={0} />
                    </Form.Item>

                    <Form.Item label={`止盈价格 (${selectedPool?.quoteSymbol || 'USDT'})`} name="tpPrice">
                      <InputNumber style={{ width: '100%' }} min={0} />
                    </Form.Item>

                    <Form.Item label={`止损数量 (${selectedPool?.baseSymbol || 'Token'})`} name="slSize">
                      <InputNumber style={{ width: '100%' }} min={0} />
                    </Form.Item>

                    <Form.Item label={`止损价格 (${selectedPool?.quoteSymbol || 'USDT'})`} name="slPrice">
                      <InputNumber style={{ width: '100%' }} min={0} />
                    </Form.Item>
                  </Card>
                </Col>
              </Row>

              <Divider />

              <Form.Item>
                <Space>
                  <Button
                    type="primary"
                    onClick={handleApproval}
                    loading={approving}
                    disabled={!selectedPool || !walletClient || !isNetworkCorrect}
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

                  <Button size="large" onClick={() => form.resetFields()}>
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

      <Divider />

      <Row gutter={[16, 8]}>
        <Col span={12} className='flex gap-[20px]'>
          <Form.Item label={`订单ID`}>
            <Input style={{ width: '100%' }} value={orderId} onChange={(e) => setOrderId(e.target.value)} />
          </Form.Item>
          <Button type="primary" onClick={async () => {
            console.log(orderId)
            if (!walletClient || !orderId) return;
            const provider = new BrowserProvider(walletClient.transport);
            const signer = await provider.getSigner();
            const rs = await cancelOrder(ChainId.ARB_TESTNET, orderId as string, signer);

            console.log('rs--->', rs);
          }}>取消订单</Button>
        </Col>
      </Row>

      <Row gutter={[16, 8]}>
        <Col span={12} className='flex gap-[20px]'>
          <Form.Item label={`订单ID(逗号隔开)`}>
            <Input style={{ width: '100%' }} value={orderIds} onChange={(e) => setOrderIds(e.target.value)} />
          </Form.Item>
          <Button type="primary" onClick={async () => {
            const ids = orderIds.split(',')

            if (!walletClient || !ids.length) return;
            const provider = new BrowserProvider(walletClient.transport);
            const signer = await provider.getSigner();
            const rs = await cancelOrders(ChainId.ARB_TESTNET, ids, signer);

            console.log('rs--->', rs);
          }}>批量取消订单</Button>
        </Col>
      </Row>
    </div>
  );
};




export default TradePage;
