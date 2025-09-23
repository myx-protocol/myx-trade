import React, { useEffect, useState } from "react";
import { getOraclePrice } from "../api";
import { useAccount, useWalletClient, useChainId } from "wagmi";
import { BrowserProvider, ethers } from "ethers";
import CryptoJS from "crypto-js";
import {
  Direction,
  OperationType,
  OrderType,
  TimeInForce,
  TriggerType,
} from "../config/con";
import { ChainId } from "../config/chain";
import { BigNumber } from "bignumber.js";
import { MyxClient } from "@myx-trade/sdk";

import useSWR from "swr";
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
  Input,
} from "antd";

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

const getAccessToken = async (appId: string, timestamp: number, expireTime: number, allowAccount: string, signature: string) => {
  try {
    const rs = await fetch(`https://api-test.myx.cash/openapi/auth/api_key/create_token?appId=${appId}&timestamp=${timestamp}&expireTime=${expireTime}&allowAccount=${allowAccount}&signature=${signature}`)
    const res = await rs.json();
  
    return {
      code: 0,
      data: {
        accessToken: res.data.accessToken,
        expireAt: res.data.expireAt,
      },
    };
  } catch (error) {
    console.error("getAccessToken error-->", error);
    return {
      code: -1,
      message: "getAccessToken error",
    };
  }
   
}

const TradePage: React.FC = () => {
  const { address, isConnected } = useAccount();
  const currentChainId = useChainId();
  const { data: walletClient } = useWalletClient();
  const [loading, setLoading] = useState(false);
  const [approving, setApproving] = useState(false);
  const [orderId, setOrderId] = useState<string>("");
  const [orderIds, setOrderIds] = useState<string>("");
  const [form] = Form.useForm<TradeFormValues>();
  const [myxClient, setMyxClient] = useState<MyxClient | null>(null);
  const [closePositionId, setClosePositionId] = useState<string>('');
  const [adjustCollateralPositionId, setAdjustCollateralPositionId] = useState<string>('');
  const [adjustCollateralAmount, setAdjustCollateralAmount] = useState<string>('');

  const initClient = async () => {
    if (walletClient?.transport) {
      const provider = new BrowserProvider(walletClient.transport);
      const signer = await provider.getSigner();

      const client = new MyxClient({
        signer: signer,
        chainId: ChainId.ARB_TESTNET,
        brokerAddress: "0xa70245309631Ce97425532466F24ef86FE630311",
        isTestnet: true,
      });

      setMyxClient(client);
    }
  };

  useEffect(() => {
    if (walletClient?.transport) {
      initClient();
    }
  }, [walletClient]);

  const { data: poolList } = useSWR("getPoolList", async () => {
    const poolList = await myxClient?.markets.listPools() ?? []
    // console.log("poolList-->", poolList);

    const poolsWithLevel = await Promise.all(
      poolList?.map(async (pool: any) => {
        try {
          const levelRes = await myxClient?.markets.getPoolLevelConfig(pool.poolId);
          // console.log("levelRes-->", levelRes);
          return { ...pool, levelData: levelRes };
        } catch (error) {
          console.error(
            `Failed to get level data for pool ${pool.poolId}:`,
            error
          );
          return { ...pool, levelData: null };
        }
      })
    );

    return poolsWithLevel;
  });

  const [selectedPoolId, setSelectedPoolId] = useState<string>("");
  const selectedPool = poolList?.find(
    (item: any) => item.poolId === selectedPoolId
  );

  // get pool level config
  const { data: poolLevelData } = useSWR(
    selectedPool ? `poolLevel-${selectedPool.poolId}` : null,
    async () => {
      if (!selectedPool) return null;
      const res = await myxClient?.markets.getPoolLevelConfig(selectedPool.poolId);
      return res;
    }
  );

  // when the selected pool changes, get the price information
  useEffect(() => {
    if (selectedPool) {
      getOraclePrice(selectedPool.poolId, ChainId.ARB_TESTNET)
        .then((oraclePriceRes) => {
          const _price = oraclePriceRes.data[0].price;
          form.setFieldsValue({
            orderPrice: _price,
          });
        })
        .catch(console.error);

      // getPoolLevel(selectedPool.poolId, ChainId.ARB_TESTNET).then((getPoolLevelRes) => {
      //   console.log('getPoolLevelRes-->', getPoolLevelRes?.data)
      // }).catch(console.error);
    }
  }, [selectedPool, form]);

  // set the form default value
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

  // USDC approval function
  const handleApproval = async () => {
    if (!selectedPool) {
      console.error("Pool data not available");
      return;
    }

    if (!walletClient) {
      console.error("WalletClient is null or undefined");
      return;
    }

    setApproving(true);
    try {
      const rs = await myxClient?.trading.approveAuthorization({
        quoteAddress: selectedPool.quoteToken,
      });
      console.log("rs-->", rs);
    } catch (error) {
      console.error("Approval error:", error);
    } finally {
      setApproving(false);
    }
  };

  const onFinish = async (values: TradeFormValues) => {
    if (!selectedPool || !address || !isConnected) {
      console.log("Missing required data:", {
        selectedPool: !!selectedPool,
        address: !!address,
        isConnected,
      });
      return;
    }

    if (!walletClient || !myxClient) {
      console.error("WalletClient is null or undefined");
      return;
    }

    setLoading(true);
    try {
      const orderData = {
        chainId: ChainId.ARB_TESTNET,
        address: address as `0x${string}`,
        poolId: selectedPool.poolId,
        positionId: 0,
        orderType: values.orderType as OrderType,
        triggerType: values.triggerType as TriggerType,
        operation: values.operation as OperationType,
        direction: values.direction as Direction,
        collateralAmount: new BigNumber(values.collateralAmount)
          .multipliedBy(10 ** selectedPool.quoteDecimals)
          .toString(),
        size: new BigNumber(values.size)
          .multipliedBy(10 ** selectedPool.baseDecimals)
          .toString(),
        orderPrice: values.orderPrice
          ? ethers.parseUnits(values.orderPrice.toString(), 30).toString()
          : "0",
        triggerPrice: values.orderPrice
          ? ethers.parseUnits(values.orderPrice.toString(), 30).toString()
          : "0", //values.orderPrice ? ethers.parseUnits(values.orderPrice.toString(), 30).toString() : '0',
        timeInForce: values.timeInForce as TimeInForce,
        postOnly: values.postOnly,
        slippagePct: new BigNumber(values.slippagePct)
          .multipliedBy(10 ** 4)
          .toString(), // 转换为精度4位
        executionFeeToken: selectedPool.quoteToken,
        leverage: values.leverage,
        tpSize: values.tpSize
          ? new BigNumber(values.tpSize)
            .multipliedBy(10 ** selectedPool.baseDecimals)
            .toString()
          : "0",
        tpPrice: values.tpPrice
          ? new BigNumber(values.tpPrice)
            .multipliedBy(10 ** selectedPool.quoteDecimals)
            .toString()
          : "0",
        slSize: values.slSize
          ? new BigNumber(values.slSize)
            .multipliedBy(10 ** selectedPool.baseDecimals)
            .toString()
          : "0",
        slPrice: values.slPrice
          ? new BigNumber(values.slPrice)
            .multipliedBy(10 ** selectedPool.quoteDecimals)
            .toString()
          : "0",
      };

      console.log("orderData");

      const rs = await myxClient.trading.placeOrder(orderData);

      console.log("Order placed:", rs);
    } catch (error) {
      console.error("Error placing order:", error);
    } finally {
      setLoading(false);
    }
  };

  const isNetworkCorrect = currentChainId === ChainId.ARB_TESTNET;

  const canTrade = selectedPool && address && isConnected && isNetworkCorrect;

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px" }}>
      <Row gutter={[24, 24]}>
        <Col span={24}>
          <Card title="钱包状态 / Wallet Status" size="small">
            <Row gutter={[16, 8]}>
              <Col span={6}>
                <Text type="secondary">钱包地址 / Wallet Address:</Text>
                <br />
                <Text code>
                  {address
                    ? `${address.slice(0, 6)}...${address.slice(-4)}`
                    : "未连接 / Not Connected"}
                </Text>
              </Col>
              <Col span={6}>
                <Text type="secondary">钱包客户端 / Wallet Client:</Text>
                <br />
                <Tag color={walletClient ? "green" : "red"}>
                  {walletClient
                    ? "已连接 / Connected"
                    : "未连接 / Disconnected"}
                </Tag>
              </Col>
              <Col span={6}>
                <Text type="secondary">当前网络 / Current Network:</Text>
                <br />
                <Text>Chain ID: {currentChainId}</Text>
              </Col>
              <Col span={6}>
                <Text type="secondary">网络状态 / Network Status:</Text>
                <br />
                <Tag color={isNetworkCorrect ? "green" : "red"}>
                  {isNetworkCorrect
                    ? "✅ Arbitrum Sepolia"
                    : "❌ 错误网络 / Wrong Network"}
                </Tag>
              </Col>
            </Row>
            {selectedPool && (
              <>
                <Divider />
                <Row gutter={[16, 8]}>
                  <Col span={6}>
                    <Text type="secondary">交易对 / Trading Pair:</Text>
                    <br />
                    <Text strong style={{ fontSize: "16px" }}>
                      {selectedPool.baseSymbol}/{selectedPool.quoteSymbol}
                    </Text>
                  </Col>
                  <Col span={6}>
                    <Text type="secondary">Pool ID:</Text>
                    <br />
                    <Text
                      code
                      style={{ fontSize: "10px", wordBreak: "break-all" }}
                    >
                      {selectedPool.poolId}
                    </Text>
                  </Col>
                  <Col span={6}>
                    <Text type="secondary">精度 / Decimals:</Text>
                    <br />
                    <Text>
                      Base: {selectedPool.baseDecimals}, Quote:{" "}
                      {selectedPool.quoteDecimals}
                    </Text>
                  </Col>
                  <Col span={6}>
                    <Text type="secondary">状态 / Status:</Text>
                    <br />
                    <Tag color={selectedPool.state === 2 ? "green" : "red"}>
                      {selectedPool.state === 2
                        ? "可交易 / Tradable"
                        : "不可交易 / Not Tradable"}
                    </Tag>
                  </Col>
                </Row>
                <Divider />
                <Row gutter={[16, 8]}>
                  <Col span={8}>
                    <Text type="secondary">
                      基础代币合约 / Base Token Contract:
                    </Text>
                    <br />
                    <Text
                      code
                      style={{ fontSize: "12px", wordBreak: "break-all" }}
                    >
                      {selectedPool.baseToken}
                    </Text>
                  </Col>
                  <Col span={8}>
                    <Text type="secondary">
                      计价代币合约 / Quote Token Contract:
                    </Text>
                    <br />
                    <Text
                      code
                      style={{ fontSize: "12px", wordBreak: "break-all" }}
                    >
                      {selectedPool.quoteToken}
                    </Text>
                  </Col>
                </Row>
                {selectedPool.maxLeverage && (
                  <>
                    <Divider />
                    <Row gutter={[16, 8]}>
                      <Col span={8}>
                        <Text type="secondary">最大杠杆 / Max Leverage:</Text>
                        <br />
                        <Text
                          strong
                          style={{ color: "#ff7300", fontSize: "16px" }}
                        >
                          {selectedPool.maxLeverage}x
                        </Text>
                      </Col>
                      <Col span={8}>
                        <Text type="secondary">
                          基础资产符号 / Base Asset Symbol:
                        </Text>
                        <br />
                        <Text strong>{selectedPool.baseSymbol}</Text>
                      </Col>
                      <Col span={8}>
                        <Text type="secondary">
                          计价资产符号 / Quote Asset Symbol:
                        </Text>
                        <br />
                        <Text strong>{selectedPool.quoteSymbol}</Text>
                      </Col>
                    </Row>
                  </>
                )}
                {poolLevelData && poolLevelData.levelConfig && (
                  <>
                    <Divider />
                    <div style={{ marginBottom: "16px" }}>
                      <Text strong style={{ fontSize: "14px" }}>
                        池子配置 / Pool Configuration -{" "}
                        {poolLevelData.levelName} (Level {poolLevelData.level})
                      </Text>
                    </div>
                    <Row gutter={[16, 8]}>
                      <Col span={6}>
                        <Text type="secondary">杠杆倍数 / Leverage:</Text>
                        <br />
                        <Text strong style={{ color: "#1890ff" }}>
                          {poolLevelData.levelConfig.leverage}x
                        </Text>
                      </Col>
                      <Col span={6}>
                        <Text type="secondary">
                          维持保证金率 / Maintenance Margin Rate:
                        </Text>
                        <br />
                        <Text strong>
                          {(
                            poolLevelData.levelConfig.maintainCollateralRate *
                            100
                          ).toFixed(2)}
                          %
                        </Text>
                      </Col>
                      <Col span={6}>
                        <Text type="secondary">
                          最小订单(USD) / Min Order Size(USD):
                        </Text>
                        <br />
                        <Text strong>
                          ${poolLevelData.levelConfig.minOrderSizeInUsd}
                        </Text>
                      </Col>
                      <Col span={6}>
                        <Text type="secondary">滑点 / Slippage:</Text>
                        <br />
                        <Text strong>
                          {(poolLevelData.levelConfig.slip * 100).toFixed(3)}%
                        </Text>
                      </Col>
                    </Row>
                    <Row gutter={[16, 8]} style={{ marginTop: "12px" }}>
                      <Col span={6}>
                        <Text type="secondary">
                          资金费率1 / Funding Fee Rate 1:
                        </Text>
                        <br />
                        <Text>
                          {(
                            poolLevelData.levelConfig.fundingFeeRate1 * 100
                          ).toFixed(4)}
                          %
                        </Text>
                      </Col>
                      <Col span={6}>
                        <Text type="secondary">
                          资金费率1最大 / Max Funding Fee Rate 1:
                        </Text>
                        <br />
                        <Text>
                          {(
                            poolLevelData.levelConfig.fundingFeeRate1Max * 100
                          ).toFixed(3)}
                          %
                        </Text>
                      </Col>
                      <Col span={6}>
                        <Text type="secondary">
                          资金费率2 / Funding Fee Rate 2:
                        </Text>
                        <br />
                        <Text>
                          {(
                            poolLevelData.levelConfig.fundingFeeRate2 * 100
                          ).toFixed(3)}
                          %
                        </Text>
                      </Col>
                      <Col span={6}>
                        <Text type="secondary">
                          资金费用周期 / Funding Fee Period:
                        </Text>
                        <br />
                        <Text>
                          {poolLevelData.levelConfig.fundingFeeSeconds / 3600}
                          小时 / hours
                        </Text>
                      </Col>
                    </Row>
                    <Row gutter={[16, 8]} style={{ marginTop: "12px" }}>
                      <Col span={6}>
                        <Text type="secondary">
                          锁定流动性 / Lock Liquidity:
                        </Text>
                        <br />
                        <Text>
                          $
                          {poolLevelData.levelConfig.lockLiquidity.toLocaleString()}
                        </Text>
                      </Col>
                      <Col span={6}>
                        <Text type="secondary">
                          锁定价格比率 / Lock Price Rate:
                        </Text>
                        <br />
                        <Text>
                          {(
                            poolLevelData.levelConfig.lockPriceRate * 100
                          ).toFixed(2)}
                          %
                        </Text>
                      </Col>
                      <Col span={6}>
                        <Text type="secondary">锁定时间 / Lock Time:</Text>
                        <br />
                        <Text>
                          {poolLevelData.levelConfig.lockSeconds / 3600}小时 /
                          hours
                        </Text>
                      </Col>
                      <Col span={6}>
                        <Text type="secondary">配置名称 / Config Name:</Text>
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
          <Card title="选择交易池 / Select Trading Pool" loading={!poolList}>
            <Row gutter={[16, 16]}>
              {poolList?.map((pool: any) => (
                <Col span={12} key={pool.poolId}>
                  <Card
                    hoverable
                    className={
                      selectedPoolId === pool.poolId
                        ? "border-blue-500 bg-blue-50"
                        : ""
                    }
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
                          {selectedPoolId === pool.poolId && (
                            <span className="text-blue-600">✓ 已选择</span>
                          )}
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
                          <div className="font-mono">
                            {pool.quoteDecimals}位
                          </div>
                        </div>
                      </div>

                      {/* 合约地址 */}
                      <div className="space-y-1 text-xs">
                        <div>
                          <span className="text-gray-500">基础代币:</span>
                          <div className="font-mono text-blue-600 break-all">
                            {pool.baseToken}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-500">计价代币:</span>
                          <div className="font-mono text-blue-600 break-all">
                            {pool.quoteToken}
                          </div>
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
                            配置 {pool.levelData.levelName} (Level{" "}
                            {pool.levelData.level})
                          </div>
                          <div className="grid grid-cols-2 gap-1">
                            <div>
                              <span className="text-gray-500">杠杆:</span>
                              <span className="font-bold text-blue-600">
                                {" "}
                                {pool.levelData.levelConfig.leverage}x
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-500">最小订单:</span>
                              <span className="font-semibold">
                                {" "}
                                ${pool.levelData.levelConfig.minOrderSizeInUsd}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-500">维持保证金:</span>
                              <span className="font-semibold">
                                {" "}
                                {(
                                  pool.levelData.levelConfig
                                    .maintainCollateralRate * 100
                                ).toFixed(1)}
                                %
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-500">滑点:</span>
                              <span className="font-semibold">
                                {" "}
                                {(
                                  pool.levelData.levelConfig.slip * 100
                                ).toFixed(2)}
                                %
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* 其他参数 */}
                      {pool.maxLeverage && (
                        <div className="text-xs">
                          <span className="text-gray-500">最大杠杆:</span>
                          <span className="font-bold text-orange-600">
                            {" "}
                            {pool.maxLeverage}x
                          </span>
                        </div>
                      )}

                      {pool.state !== undefined && (
                        <div className="text-xs">
                          <span className="text-gray-500">状态:</span>
                          <span
                            className={`ml-1 px-2 py-1 rounded text-white text-xs ${pool.state === 2 ? "bg-green-500" : "bg-red-500"
                              }`}
                          >
                            {pool.state === 2 ? "可交易" : "不可交易"}
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
          <Card title="交易参数 / Trading Parameters" loading={!selectedPool}>
            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
              disabled={!canTrade}
            >
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Card
                    title="订单基础信息 / Order Basic Info"
                    size="small"
                    style={{ height: "100%" }}
                  >
                    <Form.Item label="订单类型 / Order Type" name="orderType">
                      <Select>
                        <Option value={OrderType.MARKET}>
                          市价单 / Market Order
                        </Option>
                        <Option value={OrderType.LIMIT}>
                          限价单 / Limit Order
                        </Option>
                        <Option value={OrderType.STOP}>
                          止损单 / Stop Order
                        </Option>
                        <Option value={OrderType.CONDITIONAL}>
                          条件单 / Conditional Order
                        </Option>
                      </Select>
                    </Form.Item>

                    <Form.Item
                      label="触发类型 / Trigger Type"
                      name="triggerType"
                    >
                      <Select>
                        <Option value={TriggerType.NONE}>无 / None</Option>
                        <Option value={TriggerType.GTE}>
                          大于等于 / Greater Than or Equal
                        </Option>
                        <Option value={TriggerType.LTE}>
                          小于等于 / Less Than or Equal
                        </Option>
                      </Select>
                    </Form.Item>

                    <Form.Item
                      label="操作类型 / Operation Type"
                      name="operation"
                    >
                      <Select>
                        <Option value={OperationType.INCREASE}>
                          增加 / Increase
                        </Option>
                        <Option value={OperationType.DECREASE}>
                          减少 / Decrease
                        </Option>
                      </Select>
                    </Form.Item>

                    <Form.Item label="方向 / Direction" name="direction">
                      <Select>
                        <Option value={Direction.LONG}>做多 / Long</Option>
                        <Option value={Direction.SHORT}>做空 / Short</Option>
                      </Select>
                    </Form.Item>
                  </Card>
                </Col>

                <Col span={12}>
                  <Card
                    title="数量和价格 / Quantity and Price"
                    size="small"
                    style={{ height: "100%" }}
                  >
                    <Form.Item
                      label={`保证金数量 / Collateral Amount (${selectedPool?.quoteSymbol || "USDT"
                        })`}
                      name="collateralAmount"
                    >
                      <InputNumber style={{ width: "100%" }} min={0} />
                    </Form.Item>

                    <Form.Item
                      label={`交易数量 / Trade Size (${selectedPool?.baseSymbol || "Token"
                        })`}
                      name="size"
                    >
                      <InputNumber style={{ width: "100%" }} min={0} />
                    </Form.Item>

                    <Form.Item
                      label={`订单价格 / Order Price (${selectedPool?.quoteSymbol || "USDT"
                        })`}
                      name="orderPrice"
                    >
                      <InputNumber style={{ width: "100%" }} min={0} />
                    </Form.Item>

                    <Form.Item
                      label={`触发价格 / Trigger Price (${selectedPool?.quoteSymbol || "USDT"
                        })`}
                      name="triggerPrice"
                    >
                      <InputNumber style={{ width: "100%" }} min={0} />
                    </Form.Item>
                  </Card>
                </Col>

                <Col span={12}>
                  <Card
                    title="高级设置 / Advanced Settings"
                    size="small"
                    style={{ height: "100%" }}
                  >
                    <Form.Item
                      label="时间有效性 / Time In Force"
                      name="timeInForce"
                    >
                      <Select>
                        <Option value={TimeInForce.IOC}>IOC</Option>
                      </Select>
                    </Form.Item>

                    <Form.Item
                      label="仅挂单 / Post Only"
                      name="postOnly"
                      valuePropName="checked"
                    >
                      <Switch />
                    </Form.Item>

                    <Form.Item label="滑点 / Slippage" name="slippagePct">
                      <InputNumber
                        style={{ width: "100%" }}
                        min={0}
                        max={100}
                        step={0.1}
                      />
                    </Form.Item>

                    <Form.Item label="杠杆倍数 / Leverage" name="leverage">
                      <InputNumber
                        style={{ width: "100%" }}
                        min={1}
                        max={100}
                      />
                    </Form.Item>
                  </Card>
                </Col>

                <Col span={12}>
                  <Card
                    title="止盈止损 / Take Profit & Stop Loss"
                    size="small"
                    style={{ height: "100%" }}
                  >
                    <Form.Item
                      label={`止盈数量 / TP Size (${selectedPool?.baseSymbol || "Token"
                        })`}
                      name="tpSize"
                    >
                      <InputNumber style={{ width: "100%" }} min={0} />
                    </Form.Item>

                    <Form.Item
                      label={`止盈价格 / TP Price (${selectedPool?.quoteSymbol || "USDT"
                        })`}
                      name="tpPrice"
                    >
                      <InputNumber style={{ width: "100%" }} min={0} />
                    </Form.Item>

                    <Form.Item
                      label={`止损数量 / SL Size (${selectedPool?.baseSymbol || "Token"
                        })`}
                      name="slSize"
                    >
                      <InputNumber style={{ width: "100%" }} min={0} />
                    </Form.Item>

                    <Form.Item
                      label={`止损价格 / SL Price (${selectedPool?.quoteSymbol || "USDT"
                        })`}
                      name="slPrice"
                    >
                      <InputNumber style={{ width: "100%" }} min={0} />
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
                    disabled={
                      !selectedPool || !walletClient || !isNetworkCorrect
                    }
                    size="large"
                  >
                    授权 USDC / Approve USDC
                  </Button>

                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    disabled={!canTrade}
                    size="large"
                  >
                    提交订单 / Submit Order
                  </Button>

                  <Button size="large" onClick={() => form.resetFields()}>
                    重置表单 / Reset Form
                  </Button>

                  {!isNetworkCorrect && (
                    <Text type="danger">
                      请切换到 Arbitrum Sepolia 测试网 / Please switch to
                      Arbitrum Sepolia testnet
                    </Text>
                  )}
                </Space>
              </Form.Item>
            </Form>
          </Card>
        </Col>

        <Col span={24}>
          <Card title="仓位管理 / Position Management" size="default">
            {/* 仓位管理内容区域 - 您可以在这里添加具体内容 */}
            <div className="py-[20px]" style={{ minHeight: '200px' }}>
              <Col>
                <Button type="primary" onClick={async () => {

                  const appId = "test1";
                  const timestamp = Math.floor(Date.now() / 1000); // 转换为秒
                  const expireTime = 3600; // 1小时后过期（秒）
                  const allowAccount = address;
                  const secret = "69v9kHey9b746PseJ0TP";

                  const payload = `${appId}&${timestamp}&${expireTime}&${allowAccount}&${secret}`;
                  const signature = CryptoJS.SHA256(payload).toString(CryptoJS.enc.Hex);
                 
                  if (myxClient) {
                    const configManager = myxClient.getConfigManager();

                    // 将 getAccessToken 方法和参数传递给 SDK
                    const args = [appId, timestamp, expireTime, address!, signature];

                    // 调用 callGetAccessToken，传递函数和参数
                    const configResponse = await configManager.callGetAccessToken(getAccessToken, args);

                    console.log("configResponse-->", configResponse);
                    if (configResponse) {
                      console.log('✅ AccessToken 已成功获取并存储到 SDK 中');
                      console.log('存储的 Token:', configResponse);
                    } else {
                      console.error('❌ AccessToken 获取或存储失败');
                    }
                  }
                  // }
                }}>
                  配置accessToken
                </Button>
              </Col>
              <Col className="mt-2">
                <Form.Item label="仓位ID / Position ID" name="positionId">
                  <Input placeholder="请输入仓位ID / Enter Position ID" value={closePositionId} onChange={(e) => setClosePositionId(e.target.value)} />
                </Form.Item>
                <Button type="primary" onClick={async () => {
                  if (myxClient) {
                    const rs = await myxClient.position.closePosition(closePositionId);
                    console.log("rs-->", rs);
                  }
                }}>
                  平仓
                </Button>
              </Col>
              <Col className="mt-2">
                <Form.Item label="仓位ID / Position ID" name="positionId">
                  <Input placeholder="请输入仓位ID / Enter Position ID" value={adjustCollateralPositionId} onChange={(e) => setAdjustCollateralPositionId(e.target.value)} />
                </Form.Item>
                <Form.Item label="调整保证金 / Adjust Collateral" name="adjustCollateralAmount">
                  <Input placeholder="请输入调整保证金 / Enter Adjust Collateral" value={adjustCollateralAmount} onChange={(e) => setAdjustCollateralAmount(e.target.value)} />
                </Form.Item>
                <Button type="primary" onClick={async () => {
                  if (myxClient) {
                    const rs = await myxClient.position.adjustCollateral(adjustCollateralPositionId, adjustCollateralAmount);
                    console.log("rs-->", rs);
                  }
                }}>
                  调整保证金
                </Button>
              </Col>
            </div>
          </Card>
        </Col>
      </Row>

      <Divider />

      <Row gutter={[24, 24]}>
        <Col span={24}>
          <Card title="订单管理 / Order Management" size="default">
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Card title="取消单个订单 / Cancel Single Order" size="small">
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Form.Item label={`订单ID / Order ID`} style={{ marginBottom: 0 }}>
                      <Input
                        placeholder="请输入订单ID / Enter Order ID"
                        value={orderId}
                        onChange={(e) => setOrderId(e.target.value)}
                      />
                    </Form.Item>
                    <Button
                      type="primary"
                      block
                      onClick={async () => {
                        console.log(orderId);
                        const rs = await myxClient?.trading.cancelOrder(orderId);
                        console.log("rs--->", rs);
                      }}
                      disabled={!orderId.trim()}
                    >
                      取消订单 / Cancel Order
                    </Button>
                  </Space>
                </Card>
              </Col>

              <Col span={12}>
                <Card title="批量取消订单 / Batch Cancel Orders" size="small">
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Form.Item label={`订单ID(逗号隔开) / Order IDs (comma separated)`} style={{ marginBottom: 0 }}>
                      <Input
                        placeholder="请输入多个订单ID，用逗号隔开 / Enter multiple Order IDs, separated by commas"
                        value={orderIds}
                        onChange={(e) => setOrderIds(e.target.value)}
                      />
                    </Form.Item>
                    <Button
                      type="primary"
                      block
                      onClick={async () => {
                        const ids = orderIds.split(",").map(id => id.trim()).filter(id => id);

                        if (!myxClient || !ids.length) return;
                        const rs = await myxClient?.trading.cancelOrders(ids);

                        console.log("rs--->", rs);
                      }}
                      disabled={!orderIds.trim()}
                    >
                      批量取消订单 / Batch Cancel Orders
                    </Button>
                  </Space>
                </Card>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default TradePage;
