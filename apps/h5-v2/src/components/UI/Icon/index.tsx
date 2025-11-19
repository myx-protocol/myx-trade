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
}: Omit<IconProps, 'children'>) => (
  <Icon className={className} w={w} h={h} width={width} height={height}>
    <svg viewBox="0 0 16 16" fill="currentColor" className="h-full w-full animate-spin">
      <path d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z" />
      <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z" />
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

export { default as EditIcon } from './EditIcon'

export { default as ArrowRightIcon } from './ArrowRightIcon'
