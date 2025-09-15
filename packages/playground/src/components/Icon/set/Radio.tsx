import withIconColor from '../withIconColor';
import type { SvgIconProps } from '../types';

const Radio = (props: SvgIconProps ) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" {...props} width={props.size} height={ props.size } viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="7.5" stroke="currentColor"/>
    </svg>
  );
};

export default withIconColor(Radio); // 在这里用！
