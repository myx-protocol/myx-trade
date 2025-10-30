import React from 'react';
import { PoolProvider } from "../components/PoolProvider.tsx";
import { PoolInfo } from "../components/PoolInfo.tsx";
import { PoolList } from "../components/PoolList.tsx";
import { BaseTokenList } from "../components/BaseTokenList.tsx";
import { Deploy } from "../components/Deploy.tsx";
import { DepositQuote } from "@components/DepositQuote.tsx";
import { DepositBase } from "@components/DepositBase.tsx";
import { BaseRewards } from "@components/BaseRewards.tsx";
import { Transfer } from "@components/Transfer.tsx";
import { WithdrawBase } from "@components/WithdrawBase.tsx";
import { QuoteRewards } from "@components/QuoteRewards.tsx";
import { TpSL } from "@components/TpSL.tsx";
import { CancelOrder } from "@components/CancelOrder.tsx";
import { PoolOpenOrders } from "@components/OpenOrders.tsx";

const LPPage: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto p-6 flex flex-col gap-[30px]">
      <PoolProvider>
        <PoolInfo/>
        <div className={'flex gap-[10px] mt-[-20px]'}>
          <PoolList/>
          <BaseTokenList/>
        </div>
        <Deploy className={''}/>
        <DepositQuote/>
        <DepositBase/>
        <TpSL className={''}/>
        <WithdrawBase/>

        <BaseRewards/>
        <QuoteRewards/>
        <Transfer/>

        <CancelOrder/>
        <PoolOpenOrders/>
      </PoolProvider>
    </div>
  );
};

export default LPPage;
