import { Suspense } from 'react'

import { SuspenseLoading, SuspenseLogo } from './SuspenseLoading'
import type { SuspenseLoadingProps } from './SuspenseLoading'

type CommonSuspenseProps = React.PropsWithChildren<SuspenseLoadingProps> & {
  block?: boolean
  className?: string
}

export const CommonSuspense = ({ children, ...props }: CommonSuspenseProps) => {
  return <Suspense fallback={<SuspenseLoading {...props} />}>{children}</Suspense>
}

export const DialogSuspense = ({ children, ...props }: CommonSuspenseProps) => {
  return (
    <CommonSuspense className={'min-h-[200px]'} {...props}>
      {children}
    </CommonSuspense>
  )
}

export const PageSuspense = ({
  children,
  ...props
}: React.PropsWithChildren<{ className?: string }>) => {
  return <Suspense fallback={<SuspenseLogo {...props} />}>{children}</Suspense>
}
