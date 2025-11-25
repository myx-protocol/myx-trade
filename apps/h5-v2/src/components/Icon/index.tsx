import React from 'react'
import type { IconKey, SvgIconProps } from './types'

import TipsOutLine from './set/TipsOutLine.tsx'
import TipsFill from './set/TipsFill.tsx'
import ArrowDown from './set/ArrowDown.tsx'
import ArrowRight from './set/ArrowRight.tsx'
import CopyIcon from './set/CopyIcon.tsx'
import WalletLine from './set/WalletLine.tsx'
import CloseIcon from './set/CloseIcon.tsx'
import SearchIcon from './set/SearchIcon.tsx'
import ClearFill from './set/ClearFill.tsx'
import FilterLine from './set/FilterLine.tsx'
import UsersLine from './set/UsersLine.tsx'
import User from './set/User.tsx'
import ChartArea from './set/ChartArea.tsx'
import ChartLineFill from './set/ChartLineFill.tsx'
import ChartLine from './set/ChartLine.tsx'
import Seedling from './set/Seedling.tsx'
import SortIcon from './set/SortIcon.tsx'
import Prev from './set/Prev.tsx'
import Next from './set/Next.tsx'
import Hot from './set/Hot.tsx'
import New from './set/New.tsx'
import Flower from './set/Flower.tsx'
import FilterFill from './set/FilterFill.tsx'
import NoticeFill from './set/NoticeFill.tsx'
import Refresh from './set/Refresh.tsx'
import CheckBoxIcon from './set/CheckBoxIcon.tsx'
import CheckBoxOutline from './set/CheckBoxOutline.tsx'
import Pause from './set/Pause.tsx'
import ChartBar from './set/ChartBar.tsx'
import Record from './set/Record.tsx'
import Share from './set/Share.tsx'
import ArrowLeftLong from './set/ArrowLeftLong.tsx'
import SortDown from './set/SortDown.tsx'
import Star from './set/Star.tsx'

const Components: Record<string, React.FC<SvgIconProps>> = {}
const modules = import.meta.glob('./set/**/*', { eager: true })
for (const path in modules) {
  const mod = modules[path as string] as any
  // 提取组件名：去掉路径前缀和后缀，并转换成 PascalCase
  const fileName = path
    ?.split('/')
    ?.pop()
    ?.replace(/\.\w+$/, '')
  if (fileName) {
    const componentName = fileName
      .split(/[-_]/g)
      .map((w) => w[0]?.toUpperCase() + w.slice(1))
      .join('')
    Components[componentName] = mod.default ?? mod
  }
}

// eslint-disable-next-line react-refresh/only-export-components
export const ICON_KEYS = Object.keys(Components) as Array<keyof typeof Components>

export {
  ArrowDown,
  ArrowRight,
  TipsFill,
  TipsOutLine,
  CopyIcon,
  WalletLine,
  CloseIcon,
  SearchIcon,
  ClearFill,
  FilterLine,
  UsersLine,
  User,
  ChartArea,
  ChartLineFill,
  Seedling,
  SortIcon,
  Prev,
  Next,
  Hot,
  New,
  Flower,
  FilterFill,
  NoticeFill,
  Refresh,
  CheckBoxIcon,
  CheckBoxOutline,
  ChartLine,
  Pause,
  ChartBar,
  Record,
  Share,
  ArrowLeftLong,
  SortDown,
  Star,
}

// eslint-disable-next-line react-refresh/only-export-components
export const getIcon = (key: IconKey, props: SvgIconProps) => {
  const Icon = Components[key]
  return <Icon {...props} />
}
