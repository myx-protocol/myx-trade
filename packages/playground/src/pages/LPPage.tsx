import React from 'react';
import { PoolProvider } from "../components/PoolProvider.tsx";
import { PoolInfo } from "../components/PoolInfo.tsx";
import { PoolList } from "../components/PoolList.tsx";
import { BaseTokenList } from "../components/BaseTokenList.tsx";
import { Deploy } from "../components/Deploy.tsx";

const LPPage: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto p-6">
      <PoolProvider>
        <PoolInfo/>
        <div className={'flex gap-[10px]'}>
          <PoolList/>
          <BaseTokenList/>
        </div>
        <Deploy/>
      </PoolProvider>
    </div>
  );
};

export default LPPage;
