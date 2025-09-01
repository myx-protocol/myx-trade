import React, { useState } from 'react';
import { useAccount, useConnect, useDisconnect, useBalance } from 'wagmi';
import { formatEther, formatUnits } from 'viem';

export const ConnectWallet: React.FC = () => {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const [showConnectors, setShowConnectors] = useState(false);

  // USDC地址 0x7E248Ec1721639413A280d9E82e2862Cae2E6E28
  const USDC_ADDRESS = '0x7E248Ec1721639413A280d9E82e2862Cae2E6E28';
  
  // 获取ETH余额
  const { data: ethBalance } = useBalance({
    address: address,
  });

  // 获取USDC余额
  const { data: usdcBalance } = useBalance({
    address: address,
    token: USDC_ADDRESS as `0x${string}`,
  });



  // 格式化地址显示
  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  // 如果已连接，显示钱包信息
  if (isConnected && address) {
    return (
      <div className="relative">
        <div className="flex items-center space-x-4">
          {/* 余额显示 */}
          <div className="hidden md:flex items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <span>💰</span>
              <span>
                {ethBalance ? `${parseFloat(formatEther(ethBalance.value)).toFixed(4)} ETH` : '0.0000 ETH'}
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <span>💵</span>
              <span>
                {usdcBalance ? `${parseFloat(formatUnits(usdcBalance.value, 6)).toFixed(2)} USDC` : '0.00 USDC'}
              </span>
            </div>
          </div>

          {/* 网络显示 */}
          <div className="hidden md:flex items-center space-x-2 text-sm text-gray-600">
            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
            <span>Arbitrum Sepolia</span>
          </div>

          {/* 地址按钮 */}
          <button
            onClick={() => setShowConnectors(!showConnectors)}
            className="flex items-center space-x-2 bg-green-100 text-green-800 px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors"
          >
            <span>🔗</span>
            <span>{formatAddress(address)}</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        {/* 下拉菜单 */}
        {showConnectors && (
          <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg border z-50">
            <div className="p-4">
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-gray-800 mb-2">钱包信息</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">地址:</span>
                    <span className="font-mono">{formatAddress(address)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">网络:</span>
                    <span>Arbitrum Sepolia</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">ETH 余额:</span>
                    <span>
                      {ethBalance ? `${parseFloat(formatEther(ethBalance.value)).toFixed(6)} ETH` : '0.000000 ETH'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">USDC 余额:</span>
                    <span>
                      {usdcBalance ? `${parseFloat(formatUnits(usdcBalance.value, 6)).toFixed(2)} USDC` : '0.00 USDC'}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  disconnect();
                  setShowConnectors(false);
                }}
                className="w-full bg-red-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
              >
                断开连接
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // 如果未连接，显示连接按钮
  return (
    <button
      onClick={() => {
        const metaMaskConnector = connectors.find(c => c.name === 'MetaMask');
        if (metaMaskConnector) {
          connect({ connector: metaMaskConnector });
        }
      }}
      disabled={isPending}
      className="bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
    >
      <span>🦊</span>
      <span>{isPending ? '连接中...' : '连接 MetaMask'}</span>
    </button>
  );
};
