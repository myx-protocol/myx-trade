import { useContext, useMemo } from "react";
import { PoolContext } from "./PoolProvider";
import { BaseTokens } from "../config/BaseTokens.ts";

export const BaseTokenList = () => {
  const {pools} = useContext(PoolContext);
  const tokens = useMemo(() => (pools || []).map((pool) => pool.baseToken), [pools]);
  return <ul className={'flex flex-col'}>
    {
      Object.entries(BaseTokens).map(([key, value]) => {
        return <li key={key} className={`flex gap-[10px] ${tokens.includes(value) ? 'line-through' : ''} `}>
          <span>{key}</span>
          <span>{value}</span>
          <span></span>
        </li>
      })
    }
  </ul>
}
