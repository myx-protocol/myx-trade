// 图标颜色类型

import React from "react";

export type TIconType = 'primary' | 'disabled' | 'white' | 'danger'

// 图标组件属性
export interface IconProps extends React.SVGProps<SVGSVGElement>{
  type?: TIconType;
  size?: number;
  badge?: boolean; // 扩展的，给图标右上角加红点，它跟svg无关
  className?: string;
  color?: string;
  onClick?: () => void;
  onTouchStart?: (e: React.TouchEvent<SVGSVGElement>) => void;
}

export interface SvgIconProps extends React.SVGProps<SVGSVGElement> {
  fontSize?: 'inherit' | 'small' | 'medium' | 'large';
  htmlColor?: string;
  color?: string;
  size: number;
  onClick?: () => void;
  className?: string;
  active?: boolean;
  onTouchStart?: (e: React.TouchEvent<SVGSVGElement>) => void;
}



export type IconKey = "chart"
