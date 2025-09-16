import React from 'react';
import { PoolProvider } from "../components/PoolProvider.tsx";
import { PoolInfo } from "../components/PoolInfo.tsx";
import { PoolList } from "../components/PoolList.tsx";
import { BaseTokenList } from "../components/BaseTokenList.tsx";
import { Deploy } from "../components/Deploy.tsx";
import { DepositQuote } from "@components/DepositQuote.tsx";
import { DepositBase } from "@components/DepositBase.tsx";

const LPPage: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto p-6 flex flex-col gap-[10px]">
      <PoolProvider>
        <PoolInfo/>
        <div className={'flex gap-[10px]'}>
          <PoolList/>
          <BaseTokenList/>
        </div>
        <Deploy/>
        <DepositQuote/>
        <DepositBase/>
      </PoolProvider>
    </div>
  );
};

export default LPPage;
