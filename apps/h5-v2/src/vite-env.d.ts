/// <reference types="vite/client" />
/// <reference types="vite-plugin-svgr/client" />
interface ImportMetaEnv {
  readonly VITE_GLOB_API_URL: string
  // 这里可以继续定义其他变量...
}

import type { IChartingLibraryWidget, TradingView } from 'public/charting_library/charting_library'
import { Buffer } from 'buffer'

interface ImportMeta {
  readonly env: ImportMetaEnv
}
declare module '*.svg' {
  import React from 'react'
  const SVG: React.VFC<React.SVGProps<SVGSVGElement>>
  export default SVG
}

declare module '*.svg?react' {
  import React from 'react'
  const SVG: React.VFC<React.SVGProps<SVGSVGElement>>
  export default SVG
}

// 全局类型声明
declare global {
  // setTimeout 和 setInterval 的返回值类型
  type Timeout = ReturnType<typeof setTimeout>
  type Interval = ReturnType<typeof setInterval>
  type Prettify<T> = {
    [K in keyof T]: T[K]
  } & {}

  interface ImportMetaEnv {
    readonly VITE_APP_APP_ENV:
      | 'production'
      | 'development'
      | 'test'
      | 'dev'
      | 'dev_2'
      | 'beta'
      | 'stg'
    readonly VITE_GOOGLE_AG_ID?: string
    readonly VITE_GLOB_API_URL_PREFIX?: string
    readonly VITE_GLOB_API_URL: string
    readonly VITE_GLOB_CHAIN_ID: number
    readonly VITE_GLOB_PROXY?: [string, string][]
    readonly VITE_QUESTION_TRADE_ID: number
    readonly VITE_QUESTION_VIP_ID: number
    readonly VITE_WS_URL: string
  }

  interface Window {
    tvWidget?: IChartingLibraryWidget
    TradingView?: TradingView
    Buffer?: typeof Buffer
  }
}

export {}
