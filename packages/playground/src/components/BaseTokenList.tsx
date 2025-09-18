import { useContext, useMemo } from "react";
import { PoolContext } from "./PoolContext";
import { BaseTokens } from "../config/BaseTokens.ts";
import { Copy } from "@components/Copy.tsx";

export const BaseTokenList = () => {
  const {pools} = useContext(PoolContext);
  const tokens = useMemo(() => (pools || []).map((pool) => pool.baseToken.toLowerCase()), [pools]);
  return <ul className={'flex flex-col'}>
    {
      Object.entries(BaseTokens).map(([key, value]) => {
        return <li key={key} className={`flex items-center gap-[10px] ${tokens.includes(value.toLowerCase()) ? 'line-through' : ''} `}>
          <span>{key}</span>
          <span>{value}</span>
          <Copy content={value} />
        </li>
      })
    }
  </ul>
}
