// 定义源类型枚举
export enum NumberInputSourceType {
  EVENT = 'event',
  PROPS = 'prop',
}

// 定义值格式接口
export interface NumberFormatValues {
  floatValue: number | undefined
  value: string
  formattedValue: string
}

// 定义源信息接口
export interface NumberInputSourceInfo {
  source: NumberInputSourceType
}

// 定义值变化回调类型
export type OnValueChange = (values: NumberFormatValues, sourceInfo: NumberInputSourceInfo) => void
