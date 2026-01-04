import { Box, Table, TableBody, TableHead, TableRow, TableCell } from '@mui/material'
import { Trans } from '@lingui/react/macro'
import { formatNumberPercent, formatNumberPrecision } from '@/utils/formatNumber.ts'
import { Link } from 'react-router-dom'
import { LevelRelation, type LevelRule } from '@/request/vip/type.d'
import { CaretRight } from '@/components/Icon'
import { FEE_RATE_PERCENT_DISPLAY_DECIMALS } from '@/constant/decimals'
import { MYX_VIP_RULES_LINK } from '@/config/link'
import { useVipContext } from '@/pages/VIP/context.ts'
import { Skeleton } from '@/components/UI/Skeleton'

const VipList = () => {
  return (
    <Box className={'mr-[-16px] ml-[-16px] overflow-hidden'}>
      <Box className={'&:befeor overflow-x-auto'}>
        <Box className={'mx-[16px] w-[min-content]'}>
          <Box className={'table-container mb-[30px]'}>
            <MTable />
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

const RiskList = () => {
  const { riskList, setRiskTier, riskTier } = useVipContext()
  return (
    <ul
      className={
        'risk-list no-scrollbar flex h-[24px] w-full snap-x snap-mandatory gap-[12px] overflow-x-scroll'
      }
    >
      {(riskList || []).map((item, _index) => {
        return (
          <li
            key={item.name}
            className={`risk-item flex cursor-pointer items-center justify-center rounded-[6px] px-[12px] py-[8px] text-[14px] leading-[1] transition-all ${item.levelId === riskTier ? 'text-deep bg-white font-[700]' : 'text-secondary bg-transparent'} `}
            onClick={() => setRiskTier(item.levelId)}
          >
            {item.name}
          </li>
        )
      })}
    </ul>
  )
}

export const VIPLevel = () => {
  return (
    <Box className={'mt-[24px] flex flex-col gap-[24px]'}>
      <Box className={'flex items-center justify-between'}>
        <span className={'text-basic-white text-[20px] leading-[1] font-[700]'}>
          <Trans>VIP Level</Trans>
        </span>
        <Link
          to={MYX_VIP_RULES_LINK}
          target={'_blank'}
          className={'text-secondary text-[12px] font-[500]'}
        >
          <Trans>VIP Rules</Trans>
        </Link>
      </Box>
      <RiskList />
      <VipList />
    </Box>
  )
}

function LoadingTable() {
  return Array.from({ length: 3 }).map((_, index) => {
    return (
      <TableRow key={index} className={'pointer-events-none'}>
        <TableCell align={'center'} className={`!border-dark-border relative border-r-1`}>
          <Skeleton />
        </TableCell>
        <TableCell align={'center'} className={'!border-dark-border border-r-1'}>
          <Skeleton />
        </TableCell>
        <TableCell align={'center'} className={'!border-dark-border border-r-1'}>
          <Skeleton />
        </TableCell>
        <TableCell align={'center'} className={'!border-dark-border border-r-1'}>
          <Skeleton />
        </TableCell>
        <TableCell align={'center'} className={'!border-dark-border border-r-1'}>
          <Skeleton />
        </TableCell>
        <TableCell align={'center'} className={'!border-dark-border !border-r-0'}>
          <Skeleton />
        </TableCell>
      </TableRow>
    )
  })
}

function MTable() {
  const { levelList, userVipInfo: vipInfo, feeMap, isFeeLoading } = useVipContext()
  return (
    <Table className={''}>
      <TableHead>
        <TableRow>
          <TableCell
            className={
              '!text-secondary sticky-col !border-dark-border min-w-[98px] rounded-tl-[12px] border-r-1 border-b-1 !pl-[40px]'
            }
          >
            <Trans>Level</Trans>
          </TableCell>
          <TableCell
            align={'center'}
            className="!text-secondary !border-dark-border min-w-[160px] border-r-1 border-b-1"
          >
            <Trans>Trade</Trans>
          </TableCell>
          <TableCell
            align={'center'}
            className="!text-secondary !border-dark-border min-w-[62px] border-r-1 border-b-1"
          >
            <Trans>Or</Trans>
          </TableCell>
          <TableCell
            align={'center'}
            className="!text-secondary !border-dark-border min-w-[157px] border-r-1 border-b-1"
          >
            <Trans>Hold</Trans>
          </TableCell>
          <TableCell
            align={'center'}
            className="!text-secondary !border-dark-border min-w-[157px] border-r-1 border-b-1"
          >
            <Trans>Taker</Trans>
          </TableCell>
          <TableCell
            align={'center'}
            className="!text-secondary !border-dark-border min-w-[157px] rounded-tr-[12px] !border-r-0 border-b-1"
          >
            <Trans>Maker</Trans>
          </TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {!levelList?.length ? (
          <LoadingTable />
        ) : (
          (levelList || []).map((item, index) => {
            return (
              <TableRow key={index} className={item.vipTier === vipInfo?.level ? 'active' : ''}>
                <TableCell
                  className={`sticky-col !border-dark-border border-r-1 !pl-[40px] ${index + 1 === levelList?.length ? 'rounded-bl-[12px] !border-b-0' : ''}`}
                >
                  {`VIP${item.vipTier}`}
                  {item.vipTier === vipInfo?.level && (
                    <CaretRight
                      size={16}
                      className={'text-green absolute top-[50%] left-[18px] translate-y-[-50%]'}
                    />
                  )}
                </TableCell>
                <TableCell
                  align={'center'}
                  className={`!border-dark-border border-r-1 ${index + 1 === levelList?.length ? '!border-b-0' : ''}`}
                >
                  {item.rule?.trade30Vol
                    ? `≥ $${formatNumberPrecision(item.rule?.trade30Vol, 0)}`
                    : '--'}
                </TableCell>
                <TableCell
                  align={'center'}
                  className={`!border-dark-border border-r-1 ${index + 1 === levelList?.length ? '!border-b-0' : ''}`}
                >
                  {(item?.rule as LevelRule)?.myxDaily ? (
                    (item?.rule as LevelRule)?.relation === LevelRelation.OR ? (
                      <Trans>or</Trans>
                    ) : (
                      <Trans>and</Trans>
                    )
                  ) : (
                    '/'
                  )}
                </TableCell>
                <TableCell
                  align={'center'}
                  className={`!border-dark-border border-r-1 ${index + 1 === levelList?.length ? '!border-b-0' : ''}`}
                >
                  {(item?.rule as LevelRule)?.myxDaily
                    ? `≥ ${formatNumberPrecision((item?.rule as LevelRule).myxDaily, 0)} MYX`
                    : '/'}
                </TableCell>
                <TableCell
                  align={'center'}
                  className={`!border-dark-border border-r-1 text-center ${index + 1 === levelList?.length ? '!border-b-0' : ''}`}
                >
                  {isFeeLoading ? (
                    <Skeleton />
                  ) : (
                    formatNumberPercent(
                      feeMap?.[item.vipTier.toString()]?.takerFee,
                      FEE_RATE_PERCENT_DISPLAY_DECIMALS,
                      false,
                    )
                  )}
                </TableCell>
                <TableCell
                  align={'center'}
                  className={`!border-dark-border !border-r-0 text-center ${index + 1 === levelList?.length ? 'rounded-br-[12px] !border-b-0' : ''}`}
                >
                  {isFeeLoading ? (
                    <Skeleton />
                  ) : (
                    formatNumberPercent(
                      feeMap?.[item.vipTier.toString()]?.makerFee,
                      FEE_RATE_PERCENT_DISPLAY_DECIMALS,
                      false,
                    )
                  )}
                </TableCell>
              </TableRow>
            )
          })
        )}
      </TableBody>
    </Table>
  )
}
