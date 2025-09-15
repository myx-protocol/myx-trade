import withIconColor from '../withIconColor';
import type { SvgIconProps } from '../types';

const CheckBoxOutline = (props: SvgIconProps ) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" {...props} width={props.size} height={ props.size } viewBox="0 0 12 12" fill="none">
      <rect xmlns="http://www.w3.org/2000/svg" x="0.5" y="0.5" width="11" height="11" rx="1.5" stroke="currentColor"/>
    </svg>
  );
};

export default withIconColor(CheckBoxOutline); // 在这里用！
