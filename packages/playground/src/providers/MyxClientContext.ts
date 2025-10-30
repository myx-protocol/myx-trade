import { createContext } from "react";
import { MyxClient } from "@myx-trade/sdk";

export interface MyxClientContextValue {
  myxClient: MyxClient | null;
  setMyxClient: (myxClient: MyxClient | null) => void;
}
export const MyxClientContext = createContext<MyxClientContextValue>({} as MyxClientContextValue);
