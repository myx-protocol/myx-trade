import { Trans } from '@lingui/react/macro'
import { Box } from '@mui/material'

const steps = [
  {
    title: <Trans>Step 1</Trans>,
    description: <Trans>Select token</Trans>,
  },
  {
    title: <Trans>Step 2</Trans>,
    description: <Trans>Confirm token info</Trans>,
  },
]

export const Step = ({ step, className }: { step: number; className?: string }) => {
  return (
    <Box
      className={`text-secondary border-dark-border rounded-[16px] border-1 p-[24px] ${className}`}
    >
      <ul className={'Step-wrapper'}>
        {steps.map((_step, index) => {
          return (
            <li key={index} className={'flex flex-col'}>
              <Box className={'flex items-center gap-[12px]'}>
                <Box
                  className={`flex aspect-square h-[32px] w-[32px] items-center justify-center rounded-full ${index + 1 === step ? 'text-darker bg-white' : 'bg-dark-border text-scondary'} `}
                >
                  {step > index + 1 ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="12"
                      height="8"
                      viewBox="0 0 12 8"
                      fill="none"
                    >
                      <path
                        d="M1.19716 3.53892L3.85255 5.6579C3.85255 5.6579 3.99903 5.73357 4.182 5.6579L10.7198 0.0168709C10.7198 0.0168709 11.6515 -0.188444 11.4786 0.83342C10.848 1.49563 4.42011 7.89066 4.42011 7.89066C4.42011 7.89066 3.99889 8.13667 3.59592 7.89066C3.19337 7.47432 0.501913 4.42815 0.501913 4.42815C0.501913 4.42815 0.428117 3.69027 1.1973 3.53878L1.19716 3.53892Z"
                        fill="#848E9C"
                      />
                    </svg>
                  ) : (
                    <>{index + 1}</>
                  )}
                </Box>

                <Box className={'flex flex-1 flex-col gap-[6px] leading-[1] font-[500]'}>
                  <span className={`${index + 1 === step ? 'text-regular' : 'text-third'} `}>
                    {_step.title}
                  </span>
                  <span
                    className={`text-[16px] ${index + 1 === step ? 'text-white' : 'text-secondary'} `}
                  >
                    {_step.description}
                  </span>
                </Box>
              </Box>
              {index < steps.length - 1 ? (
                <Box className={'relative h-[48px]'}>
                  <Box
                    className={'bg-placeholder absolute top-[10px] left-[15px] h-[32px] w-[2px]'}
                  ></Box>
                </Box>
              ) : (
                <></>
              )}
            </li>
          )
        })}
      </ul>
    </Box>
  )
}
