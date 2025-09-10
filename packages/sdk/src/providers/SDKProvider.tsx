import React, { createContext, useContext, useState, useMemo, ReactNode } from 'react';
import { ConfigManager } from '../config/manager';
import { SDKConfig, SDKContextType } from '../config/types';

const configManager = new ConfigManager();

const SDKContext = createContext<SDKContextType | undefined>(undefined);

interface SDKProviderProps {
  children: ReactNode;
  config?: Partial<SDKConfig>;
}

export const SDKProvider: React.FC<SDKProviderProps> = ({ children, config: initialConfig }) => {
  const [currentChainId, setCurrentChainId] = useState<number>(configManager.getConfig().currentChainId);

  useMemo(() => {
    configManager.init(initialConfig);
    setCurrentChainId(configManager.getConfig().currentChainId);
  }, [initialConfig]);

  const sdkContextValue = useMemo<SDKContextType>(() => {
    const { config, getChainConfig } = configManager.getConfig();
    return {
      config,
      currentChainId,
      setChainId: (chainId: number) => {
        configManager.setChainId(chainId);
        setCurrentChainId(chainId);
      },
      getChainConfig,
    };
  }, [currentChainId]);

  return (
    <SDKContext.Provider value={sdkContextValue}>
      {children}
    </SDKContext.Provider>
  );
};

export const useSDK = () => {
  const context = useContext(SDKContext);
  if (context === undefined) {
    throw new Error('useSDK must be used within an SDKProvider');
  }
  return context;
};
