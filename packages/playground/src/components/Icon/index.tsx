import React from "react";
import type { IconKey, SvgIconProps } from "./types";

import CheckBoxIcon from "./set/CheckBoxIcon";
import CheckBoxOutline from "./set/CheckBoxOutline";
import Radio from "./set/Radio";
import RadioChecked from "./set/RadioChecked";
import CheckIcon from "./set/CheckBoxIcon";
import CopyIcon from "./set/CopyIcon";

import RefreshRight from "./set/RefreshRight";


export const Components:Record<string, React.FC<SvgIconProps>> = {}
const modules = import.meta.glob('./set/**/*', { eager: true });
for (const path in modules) {
  const mod = modules[path as string] as any;
// 提取组件名：去掉路径前缀和后缀，并转换成 PascalCase
  const fileName = path?.split('/')?.pop()?.replace(/\.\w+$/, '');
  if (fileName) {
    const componentName = fileName
      .split(/[-_]/g)
      .map(w => w[0]?.toUpperCase() + w.slice(1))
      .join('');
    Components[componentName] = mod.default ?? mod;
  }
}



export const ICON_KEYS = Object.keys(Components)  as Array<keyof typeof Components>


export {
  
  CheckBoxIcon,
  CheckBoxOutline,
  CopyIcon,
  RadioChecked,
  Radio,
 
  RefreshRight,
 
  CheckIcon
}


export const getIcon = (key: IconKey, props: SvgIconProps) => {
  const Icon = Components[key];
  return <Icon {...props} />;
};
