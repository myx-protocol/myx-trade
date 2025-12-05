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
      className={`text-secondary border-dark-border mx-[16px] rounded-[16px] border-1 p-[24px] ${className}`}
    >
      <ul className={'Step-wrapper'}>
        {steps.map((_step, index) => {
          return (
            <li key={index} className={'flex flex-col'}>
              <Box className={'flex items-center gap-[12px]'}>
                <Box
                  className={`flex aspect-square h-[24px] w-[24px] items-center justify-center rounded-full ${index + 1 === step ? 'text-darker bg-white' : 'bg-dark-border text-scondary'} `}
                >
                  {step > index + 1 ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="11"
                      height="8"
                      viewBox="0 0 11 8"
                      fill="none"
                    >
                      <path
                        d="M0.697163 3.53892L3.35255 5.6579C3.35255 5.6579 3.49903 5.73357 3.682 5.6579L10.2198 0.0168709C10.2198 0.0168709 11.1515 -0.188444 10.9786 0.83342C10.348 1.49563 3.92011 7.89066 3.92011 7.89066C3.92011 7.89066 3.49889 8.13667 3.09592 7.89066C2.69337 7.47432 0.00191258 4.42815 0.00191258 4.42815C0.00191258 4.42815 -0.0718827 3.69027 0.697301 3.53878L0.697163 3.53892Z"
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
                    className={`text-[12px] ${index + 1 === step ? 'text-white' : 'text-secondary'} `}
                  >
                    {_step.description}
                  </span>
                </Box>
              </Box>
              {index < steps.length - 1 ? (
                <Box className={'relative h-[24px]'}>
                  <Box
                    className={'bg-placeholder absolute top-[4px] left-[12px] h-[16px] w-[2px]'}
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
