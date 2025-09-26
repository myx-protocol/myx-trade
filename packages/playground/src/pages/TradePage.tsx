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
  Tooltip,
  Table,
  Modal,
  message,
} from "antd";
import { OrderTpSlButton } from './components/OrderTpSlButton';
import { AdjustCollateral } from "./components/AdjustCollateral";
import { CreateDecreaseOrderButton } from "./components/CreateDecreaseOrder";

const { Text } = Typography;
const { Option } = Select;

interface TradeFormValues {
  orderType: number;
  triggerType: number;
  operation: number;
  direction: number;
  collateralAmount: number;
  size: number;
  price: number;
  timeInForce: number;
  postOnly: boolean;
  slippagePct: number;
  leverage: number;
  tpSize: number;
  tpPrice: number;
  slSize: number;
  slPrice: number;
  positionId?: string; // 仓位ID，仅在操作类型为DECREASE时使用
}

const getAccessToken = async (appId: string, timestamp: number, expireTime: number, allowAccount: string, signature: string) => {
  try {
    const rs = await fetch(`https://api-test.myx.cash/openapi/gateway/auth/api_key/create_token?appId=${appId}&timestamp=${timestamp}&expireTime=${expireTime}&allowAccount=${allowAccount}&signature=${signature}`)
    const res = await rs.json();

    return {
      code: 0,
      msg: null,
      data: {
        accessToken: res.data.accessToken,
        expireAt: res.data.expireAt,
        allowAccount: res.data.allowAccount,
        appId: appId,
      },
    };
  } catch (error) {
    console.error("getAccessToken error-->", error);
    return {
      code: -1,
      msg: "getAccessToken error",
      data: {
        accessToken: "",
        expireAt: 0,
        allowAccount: "",
        appId: "",
      },
    };
  }
}

const TradePage: React.FC = () => {
  const { address, isConnected } = useAccount();
  const currentChainId = useChainId();
  const { data: walletClient } = useWalletClient();

  // 为 SDK 提供的 accessToken 获取方法
  const createGetAccessTokenMethod = () => {
    return async (): Promise<{ accessToken: string; expireAt: number }> => {
      const appId = "test1";
      const timestamp = Math.floor(Date.now() / 1000);
      const expireTime = 3600 * 24;
      const allowAccount = address!;
      const secret = "69v9kHey9b746PseJ0TP";

      const payload = `${appId}&${timestamp}&${expireTime}&${allowAccount}&${secret}`;
      const signature = CryptoJS.SHA256(payload).toString(CryptoJS.enc.Hex);

      const response = await getAccessToken(appId, timestamp, expireTime, allowAccount, signature);

      if (response.code === 0) {
        return {
          accessToken: response.data.accessToken,
          expireAt: response.data.expireAt // 到期时间戳（秒）
        };
      } else {
        throw new Error(response.msg || 'Failed to get access token');
      }
    };
  };

  // 仓位列表表格列配置
  const positionColumns = [
    {
      title: <span style={{ whiteSpace: 'nowrap', fontSize: '12px' }}>仓位ID</span>,
      dataIndex: 'positionId',
      key: 'positionId',
      render: (positionId: any) => <Tag color="blue" style={{ fontSize: '11px' }}>{positionId}</Tag>,
      width: 80,
    },
    {
      title: <span style={{ whiteSpace: 'nowrap', fontSize: '12px' }}>交易对</span>,
      dataIndex: 'poolId',
      key: 'poolId',
      render: (poolId: string) => (
        <Tooltip title={poolId}>
          <Text ellipsis style={{ maxWidth: '100px', display: 'inline-block', fontSize: '11px' }}>
            {poolId}
          </Text>
        </Tooltip>
      ),
      width: 120,
    },
    {
      title: <span style={{ whiteSpace: 'nowrap', fontSize: '12px' }}>方向</span>,
      dataIndex: 'direction',
      key: 'direction',
      render: (direction: number) => (
        <Tag color={direction === 0 ? 'green' : 'red'} style={{ fontSize: '10px' }}>
          {direction === 0 ? '多' : '空'}
        </Tag>
      ),
      width: 60,
    },
    {
      title: <span style={{ whiteSpace: 'nowrap', fontSize: '12px' }}>数量</span>,
      dataIndex: 'size',
      key: 'size',
      align: 'right' as const,
      render: (size: string) => <span style={{ fontSize: '11px' }}>{size}</span>,
      width: 80,
    },
    {
      title: <span style={{ whiteSpace: 'nowrap', fontSize: '12px' }}>保证金</span>,
      dataIndex: 'collateralAmount',
      key: 'collateralAmount',
      align: 'right' as const,
      render: (amount: string) => <span style={{ fontSize: '11px' }}>{parseFloat(amount).toFixed(2)}</span>,
      width: 90,
    },
    {
      title: <span style={{ whiteSpace: 'nowrap', fontSize: '12px' }}>开仓价</span>,
      dataIndex: 'entryPrice',
      key: 'entryPrice',
      align: 'right' as const,
      render: (price: string) => <span style={{ fontSize: '11px' }}>{parseFloat(price).toFixed(2)}</span>,
      width: 90,
    },
    {
      title: <span style={{ whiteSpace: 'nowrap', fontSize: '12px' }}>风险等级</span>,
      dataIndex: 'riskTier',
      key: 'riskTier',
      render: (riskTier: number) => <Tag style={{ fontSize: '10px' }}>{riskTier}</Tag>,
      width: 60,
    },
    {
      title: <span style={{ whiteSpace: 'nowrap', fontSize: '12px' }}>链</span>,
      dataIndex: 'chainId',
      key: 'chainId',
      render: (chainId: number) => <Tag color="purple" style={{ fontSize: '10px' }}>{chainId}</Tag>,
      width: 70,
    },
    {
      title: <span style={{ whiteSpace: 'nowrap', fontSize: '12px' }}>操作</span>,
      key: 'actions',
      fixed: 'right' as const,
      width: 160,
      render: (_: any, record: any) => (
        <Space size="small">
          <CreateDecreaseOrderButton record={record} myxClient={myxClient as MyxClient} poolList={poolList ?? []} address={address as string} />
          <AdjustCollateral record={record} myxClient={myxClient as MyxClient} poolList={poolList ?? []} />
        </Space>
      ),
    },
  ];

  // 订单列表表格列配置
  const orderColumns = [
    {
      title: <span style={{ whiteSpace: 'nowrap', fontSize: '12px' }}>订单ID</span>,
      dataIndex: 'orderId',
      key: 'orderId',
      render: (orderId: any) => <Tag color="blue" style={{ fontSize: '11px' }}>{orderId}</Tag>,
      width: 80,
    },
    {
      title: <span style={{ whiteSpace: 'nowrap', fontSize: '12px' }}>交易对</span>,
      dataIndex: 'poolId',
      key: 'poolId',
      render: (poolId: string) => (
        <Tooltip title={poolId}>
          <Text ellipsis style={{ maxWidth: '100px', display: 'inline-block', fontSize: '11px' }}>
            {poolId}
          </Text>
        </Tooltip>
      ),
      width: 120,
    },
    {
      title: <span style={{ whiteSpace: 'nowrap', fontSize: '12px' }}>类型</span>,
      dataIndex: 'orderType',
      key: 'orderType',
      render: (orderType: number) => {
        const types = {
          0: { text: '市价', color: 'green' },
          1: { text: '限价', color: 'blue' },
          2: { text: '止损', color: 'orange' },
          3: { text: '条件', color: 'purple' }
        };
        const type = types[orderType as keyof typeof types] || { text: `T${orderType}`, color: 'default' };
        return <Tag color={type.color} style={{ fontSize: '10px' }}>{type.text}</Tag>;
      },
      width: 60,
    },
    {
      title: <span style={{ whiteSpace: 'nowrap', fontSize: '12px' }}>方向</span>,
      dataIndex: 'direction',
      key: 'direction',
      render: (direction: number) => (
        <Tag color={direction === 0 ? 'green' : 'red'} style={{ fontSize: '10px' }}>
          {direction === 0 ? '多' : '空'}
        </Tag>
      ),
      width: 50,
    },
    {
      title: <span style={{ whiteSpace: 'nowrap', fontSize: '12px' }}>操作</span>,
      dataIndex: 'operation',
      key: 'operation',
      render: (operation: number) => (
        <Tag color={operation === 0 ? 'cyan' : 'magenta'} style={{ fontSize: '10px' }}>
          {operation === 0 ? '增' : '减'}
        </Tag>
      ),
      width: 50,
    },
    {
      title: <span style={{ whiteSpace: 'nowrap', fontSize: '12px' }}>数量</span>,
      dataIndex: 'size',
      key: 'size',
      align: 'right' as const,
      render: (size: string) => <span style={{ fontSize: '11px' }}>{size}</span>,
      width: 70,
    },
    {
      title: <span style={{ whiteSpace: 'nowrap', fontSize: '12px' }}>价格</span>,
      dataIndex: 'price',
      key: 'price',
      align: 'right' as const,
      render: (price: string) => <span style={{ fontSize: '11px' }}>{parseFloat(price).toFixed(2)}</span>,
      width: 80,
    },
    {
      title: <span style={{ whiteSpace: 'nowrap', fontSize: '12px' }}>保证金</span>,
      dataIndex: 'collateralAmount',
      key: 'collateralAmount',
      align: 'right' as const,
      render: (amount: string) => <span style={{ fontSize: '11px' }}>{parseFloat(amount).toFixed(2)}</span>,
      width: 90,
    },
    {
      title: <span style={{ whiteSpace: 'nowrap', fontSize: '12px' }}>杠杆</span>,
      dataIndex: 'userLeverage',
      key: 'userLeverage',
      render: (leverage: number) => <Tag style={{ fontSize: '10px' }}>{leverage}x</Tag>,
      width: 60,
    },
    {
      title: <span style={{ whiteSpace: 'nowrap', fontSize: '12px' }}>已成交</span>,
      dataIndex: 'filledSize',
      key: 'filledSize',
      align: 'right' as const,
      render: (filledSize: string, record: any) => (
        <div style={{ fontSize: '11px' }}>
          <div>{filledSize}</div>
          <Text type="secondary" style={{ fontSize: '10px' }}>
            {parseFloat(record.filledAmount).toFixed(2)}
          </Text>
        </div>
      ),
      width: 80,
    },
    {
      title: <span style={{ whiteSpace: 'nowrap', fontSize: '12px' }}>状态</span>,
      key: 'status',
      render: (record: any) => {
        const isPartiallyFilled = parseFloat(record.filledSize) > 0;
        const isFullyFilled = parseFloat(record.filledSize) === parseFloat(record.size);

        if (isFullyFilled) {
          return <Tag color="green" style={{ fontSize: '10px' }}>完全成交</Tag>;
        } else if (isPartiallyFilled) {
          return <Tag color="orange" style={{ fontSize: '10px' }}>部分成交</Tag>;
        } else {
          return <Tag color="blue" style={{ fontSize: '10px' }}>待成交</Tag>;
        }
      },
      width: 60,
    },
    {
      title: <span style={{ whiteSpace: 'nowrap', fontSize: '12px' }}>止盈止损</span>,
      key: 'tpsl',
      render: (record: any) => (
        <div style={{ fontSize: '10px' }}>
          {record.tpPrice && parseFloat(record.tpPrice) > 0 ? (
            <div style={{ color: 'green' }}>
              TP: {parseFloat(record.tpPrice).toFixed(2)} ({record.tpSize})
            </div>
          ) : null}
          {record.slPrice && parseFloat(record.slPrice) > 0 ? (
            <div style={{ color: 'red' }}>
              SL: {parseFloat(record.slPrice).toFixed(2)} ({record.slSize})
            </div>
          ) : null}
          {(!record.tpPrice || parseFloat(record.tpPrice) <= 0) &&
            (!record.slPrice || parseFloat(record.slPrice) <= 0) ? (
            <Text type="secondary" style={{ fontSize: '10px' }}>未设置</Text>
          ) : null}
        </div>
      ),
      width: 80,
    },
    {
      title: <span style={{ whiteSpace: 'nowrap', fontSize: '12px' }}>链</span>,
      dataIndex: 'chainId',
      key: 'chainId',
      render: (chainId: number) => <Tag color="purple" style={{ fontSize: '10px' }}>{chainId}</Tag>,
      width: 60,
    },
    {
      title: <span style={{ whiteSpace: 'nowrap', fontSize: '12px' }}>操作</span>,
      key: 'actions',
      fixed: 'right' as const,
      width: 150,
      render: (_: any, record: any) => {
        const isFullyFilled = parseFloat(record.filledSize) === parseFloat(record.size);
        const hasPartialFill = parseFloat(record.filledSize) > 0;

        return (
          <Space size="small" direction="vertical">
            <Space size="small">
              <Button
                type="primary"
                size="small"
                danger
                onClick={() => handleCancelOrder(record.orderId)}
                disabled={isFullyFilled}
                title={isFullyFilled ? '订单已完成，无法取消' : '取消订单'}
                style={{ fontSize: '10px', padding: '2px 6px' }}
              >
                {hasPartialFill && !isFullyFilled ? '强制' : '取消'}
              </Button>
              <OrderTpSlButton record={record} myxClient={myxClient as MyxClient} poolList={poolList ?? []} />
            </Space>
          </Space>
        );
      },
    },
  ];

  const [loading, setLoading] = useState(false);
  const [approving, setApproving] = useState(false);
  const [form] = Form.useForm<TradeFormValues>();
  const [myxClient, setMyxClient] = useState<MyxClient | null>(null);
  const [positionsList, setPositionsList] = useState<any[]>([]);
  const [ordersList, setOrdersList] = useState<any[]>([]);

  // 调整保证金弹窗相关状态
  const [cancelAllLoading, setCancelAllLoading] = useState(false);

  // // 处理平仓操作
  // const handleClosePosition = async (positionId: string) => {
  //   Modal.confirm({
  //     title: '确认平仓 / Confirm Close Position',
  //     content: `确定要平仓 ID 为 ${positionId} 的仓位吗？/ Are you sure you want to close position ${positionId}?`,
  //     okText: '确认 / Confirm',
  //     cancelText: '取消 / Cancel',
  //     onOk: async () => {
  //       // try {
  //       //   if (myxClient) {
  //       //     const result = await myxClient.position.createDecreaseOrder(positionId);
  //       //     if (result.code === 0) {
  //       //       message.success('平仓成功 / Position closed successfully');
  //       //     } else {
  //       //       message.error(`平仓失败 / Close failed: ${result.message}`);
  //       //     }
  //       //     console.log("Close position result:", result);
  //       //   }
  //       // } catch (error) {
  //       //   console.error("Close position error:", error);
  //       //   message.error('平仓失败 / Close position failed');
  //       // }
  //     }
  //   });
  // };

  // 处理取消订单操作
  const handleCancelOrder = async (orderId: string) => {
    Modal.confirm({
      title: '确认取消订单 / Confirm Cancel Order',
      content: `确定要取消订单 ID 为 ${orderId} 的订单吗？/ Are you sure you want to cancel order ${orderId}?`,
      okText: '确认 / Confirm',
      cancelText: '取消 / Cancel',
      onOk: async () => {
        try {
          if (myxClient) {
            const result = await myxClient.order.cancelOrder(orderId);
            if (result.code === 0) {
              message.success('订单取消成功 / Order cancelled successfully');
            } else {
              message.error(`取消失败 / Cancel failed: ${result.message}`);
            }
            console.log("Cancel order result:", result);
          }
        } catch (error) {
          console.error("Cancel order error:", error);
          message.error('订单取消失败 / Cancel order failed');
        }
      }
    });
  };

  // 执行调整保证金
  // const executeAdjustCollateral = async () => {
  //   if (!selectedPosition || !adjustAmount) {
  //     message.warning('请输入调整金额 / Please enter adjustment amount');
  //     return;
  //   }

  //   setAdjustLoading(true);
  //   try {
  //     if (myxClient) {
  //       const result = await myxClient.position.adjustCollateral(
  //         selectedPosition.positionId,
  //         adjustAmount
  //       );
  //       if (result.code === 0) {
  //         message.success('保证金调整成功 / Collateral adjusted successfully');
  //         setAdjustModalVisible(false);
  //         setAdjustAmount('');
  //       } else {
  //         message.error(`调整失败 / Adjustment failed: ${result.message}`);
  //       }
  //       console.log("Adjust collateral result:", result);
  //     }
  //   } catch (error) {
  //     console.error("Adjust collateral error:", error);
  //     message.error('保证金调整失败 / Collateral adjustment failed');
  //   } finally {
  //     setAdjustLoading(false);
  //   }
  // };

  const initClient = async () => {
    if (walletClient?.transport && address) {
      const provider = new BrowserProvider(walletClient.transport);
      const signer = await provider.getSigner();

      const client = new MyxClient({
        signer: signer,
        chainId: ChainId.ARB_TESTNET,
        brokerAddress: "0xa70245309631Ce97425532466F24ef86FE630311",
        isTestnet: true,
        getAccessToken: createGetAccessTokenMethod(), // 传入 accessToken 获取方法
      });

      setMyxClient(client);
      console.log('✅ MYX Client initialized with auto token management');
    }
  };

  useEffect(() => {
    if (walletClient?.transport) {
      initClient();
    }
  }, [walletClient]);

  const { data: poolList } = useSWR("getPoolList", async () => {
    if (!myxClient) return [];
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
  }, {
    refreshInterval: 5000,
  });

  const [selectedPoolId, setSelectedPoolId] = useState<string>("");
  const selectedPool = poolList?.find(
    (item: any) => item.poolId === selectedPoolId
  );


  useSWR("getPositionList", async () => {
    if (!myxClient) return;

    const res = await myxClient.position.listPositions();

    if (res?.code === 0) {
      const positions: any[] = res?.data ?? [];
      console.log('positions-->', positions);
      setPositionsList(positions);
    } else {
      console.error('Failed to fetch positions:', res?.message);
    }

    return res;
  }, {
    refreshInterval: 5000,
  });

  useSWR('getOrderList', async () => {
    if (!myxClient) return;

    const res = await myxClient.order.getOrders();

    if (res?.code === 0) {
      const orders: any[] = res?.data ?? [];
      console.log('orders-->', orders);
      setOrdersList(orders);
    } else {
      console.error('Failed to fetch orders:', res?.message);
    }

    return res;
  }, {
    refreshInterval: 5000,
  })


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
            price: _price,
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
        price: 0,
        timeInForce: TimeInForce.IOC,
        postOnly: false,
        slippagePct: 0.001, // 0.5%
        leverage: 10,
        tpSize: 0,
        tpPrice: 0,
        slSize: 0,
        slPrice: 0,
        positionId: '0',
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
      const rs = await myxClient?.utils.approveAuthorization({
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
      if (values.operation === OperationType.INCREASE) {
        const orderData = {
          chainId: ChainId.ARB_TESTNET,
          address: address as `0x${string}`,
          poolId: selectedPool.poolId,
          positionId: values.positionId ? parseInt(values.positionId) : 0,
          orderType: values.orderType as OrderType,
          triggerType: values.triggerType as TriggerType,
          direction: values.direction as Direction,
          collateralAmount: new BigNumber(values.collateralAmount)
            .multipliedBy(10 ** selectedPool.quoteDecimals)
            .toString(),
          size: new BigNumber(values.size)
            .multipliedBy(10 ** selectedPool.baseDecimals)
            .toString(),
          price: values.price
            ? ethers.parseUnits(values.price.toString(), 30).toString()
            : "0",  //values.orderPrice ? ethers.parseUnits(values.orderPrice.toString(), 30).toString() : '0',
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

        console.log("orderData-->", orderData);

        const rs = await myxClient.order.createIncreaseOrder(orderData);

        console.log("Order placed:", rs);
      } else {
        // 平仓操作
        const orderData = {
          chainId: ChainId.ARB_TESTNET,
          address: address as `0x${string}`,
          poolId: selectedPool.poolId,
          positionId: values.positionId ? parseInt(values.positionId) : 0,
          orderType: values.orderType as OrderType,
          triggerType: values.triggerType as TriggerType,
          direction: values.direction as Direction,
          collateralAmount: new BigNumber(values.collateralAmount)
            .multipliedBy(10 ** selectedPool.quoteDecimals)
            .toString(),
          size: new BigNumber(values.size)
            .multipliedBy(10 ** selectedPool.baseDecimals)
            .toString(),
          price: values.price
            ? ethers.parseUnits(values.price.toString(), 30).toString()
            : "0",
          timeInForce: values.timeInForce as TimeInForce,
          postOnly: values.postOnly,
          slippagePct: new BigNumber(values.slippagePct)
            .multipliedBy(10 ** 4)
            .toString(), // 转换为精度4位
          executionFeeToken: selectedPool.quoteToken,
          leverage: values.leverage,
        };

        console.log("orderData-->", orderData);

        const rs = await myxClient.order.createDecreaseOrder(orderData);

        console.log("Order placed:", rs);
      }
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
          <Card title="开仓 / 平仓 Open & Close" loading={!selectedPool}>
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
                          止盈止损 / TPSL
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
                          开仓 / Increase
                        </Option>
                        <Option value={OperationType.DECREASE}>
                          平仓 / Decrease
                        </Option>
                      </Select>
                    </Form.Item>
                    <Form.Item
                      label="仓位ID / Position ID"
                      name="positionId"
                    >
                      <Input placeholder="请输入仓位ID / Enter Position ID" />
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
                      label={`价格 / Price (${selectedPool?.quoteSymbol || "USDT"
                        })`}
                      name="price"
                    >
                      <InputNumber style={{ width: "100%" }} min={0} />
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
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <Card title="当前仓位列表 / Current Positions" size="small">
                  <Table
                    columns={positionColumns}
                    dataSource={positionsList}
                    rowKey="positionId"
                    scroll={{ x: 'max-content' }}
                    locale={{
                      emptyText: '暂无仓位数据 / No position data available'
                    }}

                    size="small"
                    style={{
                      fontSize: '12px',
                    }}
                    className="compact-table"
                  />
                </Card>
              </Col>
            </Row>

          </Card>
        </Col>
      </Row>

      <Divider />

      <Row gutter={[24, 24]}>
        <Col span={24}>
          <Card
            title="订单管理 / Order Management"
            size="default"
            extra={
              <Button
                type="primary"
                danger
                size="small"
                onClick={async () => {
                  try {
                    setCancelAllLoading(true)
                    const result = await myxClient?.order.cancelOrders(ordersList.map((order) => order.orderId));
                    if (result?.code === 0) {
                      message.success('订单取消成功 / Order cancelled successfully');
                    } else {
                      message.error(`取消失败 / Cancel failed: ${result?.message}`);
                    }
                    console.log("Cancel orders result:", result);

                  } catch (error) {
                    message.error(`取消失败 / Cancel error`);
                    console.error(error)
                  } finally {
                    setCancelAllLoading(false)
                  }

                }}
                disabled={!ordersList || ordersList.length === 0}
                loading={cancelAllLoading}
                style={{ fontSize: '12px' }}
              >
                取消全部订单 / Cancel All Orders
              </Button>
            }
          >
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <Card title="当前订单列表 / Current Orders" size="small">
                  <Table
                    columns={orderColumns}
                    dataSource={ordersList}
                    rowKey="orderId"
                    scroll={{ x: 'max-content' }}
                    locale={{
                      emptyText: '暂无订单数据 / No order data available'
                    }}
                    size="small"
                    style={{
                      fontSize: '12px',
                    }}
                    className="compact-table"
                  />
                </Card>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      {/* 调整保证金弹窗 / Adjust Collateral Modal */}

    </div>
  );
};

export default TradePage;
