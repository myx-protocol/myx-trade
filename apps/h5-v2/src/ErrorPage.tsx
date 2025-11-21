import { useRouteError } from 'react-router-dom'
import ErrorBoundaryImage from '@/assets/error/errorBoundaries.png'
import { useCallback, useEffect } from 'react'
import { Box, Button } from '@mui/material'
import { Trans } from '@lingui/react/macro'
import { MYX_DISCORD_LINK } from '@/config/link'
// import { addLogs } from "@/api/activity";

export default function ErrorPage() {
  const error: any = useRouteError()
  // const { account: userAddress } = useAppStore()

  // const submitError = useCallback(async () => {
  const time = Date.now()
  // try {
  //   await addLogs({
  //     address: userAddress as string,
  //     errorMsg: error?.message,
  //     time: `${time}`,
  //   })
  // } catch (e) {
  //   console.log('e-->', e)
  // }
  // }, [userAddress, error])

  // useEffect(() => {
  //   submitError()
  // }, [error, submitError])

  return (
    <Box className={'flex h-[100vh] flex-col items-center justify-center px-[20px]'}>
      <img src={ErrorBoundaryImage} className={'h-[148px] w-[220px]'} />
      <p className={'text-basic-white mt-[24px] text-[28px] font-[600]'}>
        <Trans>Something went wrong</Trans>
      </p>
      <p className={'text-secondary mt-[12px] text-[18px]'}>
        <Trans>Try refreshing your browser</Trans>
      </p>
      <p className={'text-secondary mt-[4px] text-center text-[18px]'}>
        <Trans>
          If the issue persists, Join the{' '}
          <a className={'buy underline'} target="_blank" href={MYX_DISCORD_LINK}>
            MYX Discord
          </a>{' '}
          community for support
        </Trans>
      </p>
      <Box className={'mt-[40px] w-full'}>
        <Button
          className={'gradient h-[40px] min-h-[20px] w-full rounded-[36px]'}
          onClick={() => window.location.reload()}
        >
          <Trans>refresh now</Trans>
        </Button>
      </Box>
    </Box>
    // <div id="error-page">
    //   <h1>Oops!</h1>
    //   <p>Sorry, an unexpected error has occurred.</p>
    //   <p>
    //     <i>{error?.statusText || error?.message}</i>
    //   </p>
    // </div>
  )
}
