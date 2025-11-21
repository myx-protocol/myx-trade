import { Trans } from '@lingui/react/macro'
import { Box, Button } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import img_m_404 from '@/assets/error/m_404.png'
import { openUrl } from './utils'

interface IBtnProps {
  title: React.ReactNode
  url: string
  isExternal: boolean
}
const NOT_FOUND_BTNS: IBtnProps[] = [
  { title: <Trans>Homepage</Trans>, url: '/', isExternal: false },
  { title: <Trans>Trade Now</Trans>, url: '/trade', isExternal: false },
]

function NotFound() {
  const navigator = useNavigate()
  return (
    <Box className={'flex flex-1 items-start justify-center'}>
      <Box
        className={
          'text-basic-white relative mt-[107px] flex h-[270px] w-[440px] items-center justify-center text-center'
        }
      >
        <Box className={'px-[20px] text-center'}>
          <img
            src={img_m_404}
            alt={'404'}
            className={
              'absolute top-[50%] left-[50%] z-[-1] h-[125px] w-[360px] translate-x-[-180px] translate-y-[-62px] transform'
            }
          />
          <p className={'mt-[68px] text-[48px] leading-[65px] font-[800]'}>404</p>
          <p className={'my-[4px] text-[16px] leading-[19px] font-[400]'}>
            <Trans>Sorry, the page you are trying to access does not exist</Trans>
          </p>
          <p className={'text-secondary text-[12px] leading-[14px] font-[400]'}>
            <Trans>
              The page you are trying to view is temporarily unavailable. Please try again later
            </Trans>
          </p>
          <Box className={'mt-[25px] flex justify-center gap-[14px]'}>
            {NOT_FOUND_BTNS.map((item, idx) => {
              const isLast = NOT_FOUND_BTNS.length === idx + 1
              return (
                <Box key={idx} className={'w-[120px]'}>
                  <Button
                    className={`gradient ${isLast ? 'primary' : 'default'}`}
                    onClick={() => {
                      if (item.isExternal) {
                        openUrl(item.url)
                      } else {
                        navigator(item.url)
                      }
                    }}
                  >
                    {item.title}
                  </Button>
                </Box>
              )
            })}
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

export default NotFound
