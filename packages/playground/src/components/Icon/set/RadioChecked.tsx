import withIconColor from '../withIconColor';
import type { SvgIconProps } from '../types';

const RadioChecked = (props: SvgIconProps ) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" {...props} width={props.size} height={ props.size } viewBox="0 0 16 16" fill="none">
      <path d="M8 0C12.4183 0 16 3.58172 16 8C16 12.4183 12.4183 16 8 16C3.58172 16 0 12.4183 0 8C0 3.58172 3.58172 0 8 0ZM11.752 5.72949C11.5148 5.49863 11.1355 5.50359 10.9043 5.74023L7.27637 9.46387L5.0332 7.7373L4.92969 7.67285C4.67906 7.55048 4.36833 7.61724 4.19141 7.84668C4.01472 8.07648 4.03028 8.39347 4.21289 8.60449L4.30078 8.6875L6.96777 10.7412C7.20896 10.9267 7.5513 10.9025 7.76367 10.6846L11.7637 6.57812C11.9946 6.34074 11.9892 5.96061 11.752 5.72949Z" fill="currentColor"/>
    </svg>
  );
};

export default withIconColor(RadioChecked); // 在这里用！
