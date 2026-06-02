import type { ReactNode } from 'react'

interface IconProps {
  children: ReactNode
  className?: string
  w?: string | number
  h?: string | number
  width?: string | number
  height?: string | number
}

export const Icon = ({ children, className = '', w, h, width = w, height = h }: IconProps) => {
  return (
    <div
      className={`flex items-center justify-center ${className}`}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
      }}
    >
      {children}
    </div>
  )
}

// 成功图标
export const SuccessIcon = ({
  className = '',
  w,
  h,
  width,
  height,
}: Omit<IconProps, 'children'>) => (
  <Icon className={className} w={w} h={h} width={width} height={height}>
    <svg viewBox="0 0 16 16" fill="currentColor" className="h-full w-full">
      <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z" />
    </svg>
  </Icon>
)

// 等待图标
export const PendingIcon = ({
  className = '',
  w,
  h,
  width,
  height,
  color,
}: Omit<IconProps, 'children'> & { color?: string }) => (
  <Icon className={className} w={w} h={h} width={width} height={height}>
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="h-full w-full animate-spin"
    >
      <path
        d="M11.7751 1.67082L10.953 2.29863C9.7771 0.838504 8.00205 -0.00812123 6.12679 5.87343e-05C2.74234 5.87343e-05 0.00409455 2.67082 4.56558e-06 5.97552C-0.00408541 9.28227 2.74029 11.9653 6.12679 11.9653C8.77097 11.9653 11.0266 10.3273 11.8855 8.03278C11.8957 8.00415 11.8937 7.97143 11.8814 7.94484C11.8671 7.91621 11.8446 7.89576 11.8139 7.88554L10.9877 7.60742C10.9284 7.58697 10.863 7.6156 10.8385 7.67491C10.5869 8.34362 10.1902 8.94689 9.6769 9.44587C8.73007 10.3722 7.45604 10.8876 6.13088 10.8814C5.46013 10.8835 4.79755 10.7526 4.17792 10.497C2.98364 10.0062 2.02659 9.06959 1.50921 7.88758C1.24745 7.28636 1.11248 6.6381 1.11248 5.98165C1.11248 5.31908 1.2454 4.67695 1.50716 4.07368C1.76074 3.48881 2.12475 2.95916 2.58078 2.5154C3.52966 1.58902 4.80573 1.07163 6.13088 1.07981C6.7996 1.07777 7.46422 1.20865 8.08181 1.46427C8.86504 1.78533 9.5542 2.30067 10.0818 2.96325L9.2045 3.63401C9.16974 3.66059 9.15338 3.70558 9.16156 3.74852C9.16974 3.79147 9.2045 3.82623 9.24745 3.83441L11.8098 4.44587C11.8814 4.46427 11.953 4.40906 11.953 4.33748L11.9652 1.76079C11.9652 1.66468 11.8528 1.61356 11.7751 1.67082Z"
        fill={color ?? '#F29D39'}
      />
    </svg>
  </Icon>
)

// 错误图标
export const WrongIcon = ({ className = '', w, h, width, height }: Omit<IconProps, 'children'>) => (
  <Icon className={className} w={w} h={h} width={width} height={height}>
    <svg viewBox="0 0 16 16" fill="currentColor" className="h-full w-full">
      <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854Z" />
    </svg>
  </Icon>
)

// 无数据图标
export const NoData = ({ className = '', w, h, width, height }: Omit<IconProps, 'children'>) => (
  <Icon className={className} w={w} h={h} width={width} height={height}>
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-full w-full opacity-50">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
    </svg>
  </Icon>
)

export const CloseIcon = ({ className = '', w, h, width, height }: Omit<IconProps, 'children'>) => (
  <Icon className={className} w={w} h={h} width={width} height={height}>
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="none">
      <g clipPath="url(#a)">
        <path
          fill="currentColor"
          d="M2.42 2.519a.75.75 0 0 1 1.06 0l4.42 4.42 4.419-4.42a.75.75 0 0 1 1.06 1.06L8.96 8l4.42 4.42a.75.75 0 0 1-1.061 1.06l-4.42-4.42-4.419 4.42a.75.75 0 0 1-1.06-1.06l4.419-4.42-4.42-4.42a.75.75 0 0 1 0-1.06Z"
        />
      </g>
      <defs>
        <clipPath id="a">
          <path fill="currentColor" d="M0 0h16v16H0z" />
        </clipPath>
      </defs>
    </svg>
  </Icon>
)

export const InfoIcon = ({ className = '', w, h, width, height }: Omit<IconProps, 'children'>) => (
  <Icon className={className} w={w} h={h} width={width} height={height}>
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 14" fill="none">
      <g clipPath="url(#clip0_3513_25942)">
        <path
          d="M6.99344 0C10.8641 0 13.9869 3.1359 13.9869 6.99344C13.9869 10.851 10.851 13.9869 6.99344 13.9869C3.1359 13.9869 0 10.8641 0 6.99344C0 3.1359 3.1359 0 6.99344 0ZM6.99344 1.04967C3.71321 1.04967 1.04967 3.71321 1.04967 6.99344C1.04967 10.2737 3.71321 12.9372 6.99344 12.9372C10.2737 12.9372 12.9372 10.2737 12.9372 6.99344C12.9372 3.71321 10.2868 1.04967 6.99344 1.04967Z"
          fill="#848E9C"
        />
        <path
          d="M6.99326 3.50391C7.37377 3.50391 7.68867 3.81881 7.68867 4.19931C7.68867 4.57982 7.37377 4.89472 6.99326 4.89472C6.59963 4.90784 6.29785 4.59294 6.29785 4.19931C6.29785 3.81881 6.59963 3.50391 6.99326 3.50391ZM7.5181 5.60325V10.4973H6.46842V5.60325H7.5181Z"
          fill="#848E9C"
        />
      </g>
      <defs>
        <clipPath id="clip0_3513_25942">
          <rect width="14" height="14" fill="white" />
        </clipPath>
      </defs>
    </svg>
  </Icon>
)

export const ShareIcon = ({ className = '', w, h, width, height }: Omit<IconProps, 'children'>) => (
  <Icon className={className} w={w} h={h} width={width} height={height}>
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="none">
      <path d="M4 4.99805H11V11.998" stroke="currentColor" strokeWidth="1.3" />
      <path d="M11 4.99805L4 11.998" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  </Icon>
)

export const ChainPriceSuccessIcon = ({
  className = '',
  w,
  h,
  width,
  height,
}: Omit<IconProps, 'children'>) => (
  <Icon className={className} w={w} h={h} width={width} height={height}>
    <svg
      width="10"
      height="10"
      viewBox="0 0 10 10"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="h-full w-full"
    >
      <path
        d="M3.9899 8.04062C3.81678 8.04062 3.64499 7.97403 3.51448 7.84352L0.82176 5.14015C0.559413 4.87647 0.559413 4.44766 0.82176 4.18398C1.08544 3.9203 1.51159 3.9203 1.77393 4.18398L3.99123 6.40927L8.22607 2.15579C8.48841 1.89078 8.91456 1.89078 9.17824 2.15579C9.44059 2.41947 9.44059 2.84695 9.17824 3.11062L4.46665 7.84219C4.33481 7.97403 4.16169 8.04062 3.9899 8.04062Z"
        fill="#00E3A5"
      />
    </svg>
  </Icon>
)

export const ChainPriceErrorIcon = ({
  className = '',
  w,
  h,
  width,
  height,
}: Omit<IconProps, 'children'>) => (
  <Icon className={className} w={w} h={h} width={width} height={height}>
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="h-full w-full"
    >
      <rect width="16" height="16" rx="8" fill="#EC605A" fillOpacity="0.1" />
      <path
        d="M5.03546 5.03456C5.24821 4.82181 5.59517 4.82181 5.80792 5.03456L8.00031 7.23867L10.1927 5.04824C10.4054 4.83557 10.7515 4.83551 10.9642 5.04824C11.1767 5.26097 11.1768 5.60701 10.9642 5.81972L8.76691 8.00917L10.9505 10.2055C11.1024 10.3608 11.1468 10.5905 11.0657 10.7914C10.9812 10.9905 10.7867 11.122 10.5706 11.1254C10.4272 11.1237 10.2923 11.0645 10.1927 10.9633L8.00128 8.77187L5.80695 10.9613C5.70239 11.0674 5.56099 11.1269 5.41437 11.1254C5.19842 11.122 5.00406 10.9901 4.9212 10.7894C4.83852 10.5887 4.88375 10.3588 5.03546 10.2035L7.2337 8.00429L5.03546 5.80605C4.82145 5.59159 4.8212 5.24718 5.03546 5.03456Z"
        fill="#EC605A"
      />
    </svg>
  </Icon>
)

export { default as EditIcon } from './EditIcon'

export { default as ArrowRightIcon } from './ArrowRightIcon'
