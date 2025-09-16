import {type SvgIconProps} from './types'
import React, {  forwardRef } from "react";

// 参数是一个组件。
// withIconColor的作用是处理外层传递进来的props，转化成一定内容后还给原组件
// 同时给原组件加上固定特性
function withIconColor(WrappedIcon: React.ComponentType<any>) {
  const Component = forwardRef<SVGSVGElement, SvgIconProps>(
    ({ type, size = 24, className, color, ...others }, ref) => {
      
      return (
        <WrappedIcon
          ref={ref}
          {...others}
          className={className}
          size={size}
          color={color}
        />
      );
    }
  );
  
  Component.displayName = `withIconColor(${WrappedIcon.displayName || WrappedIcon.name || "Icon"})`;
  
  return Component;
}



export default withIconColor;
