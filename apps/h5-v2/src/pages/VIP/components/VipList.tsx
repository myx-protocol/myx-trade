import { Box, Table, TableBody, TableHead, TableRow, TableCell } from '@mui/material'
import { Trans } from '@lingui/react/macro'
import { formatNumberPrecision } from '@/utils/formatNumber.ts'
import { Link } from 'react-router-dom'
import type { VipProps } from '@/pages/VIP/type.ts'
import { LevelRelation, type VipRateType } from '@/request/vip/type.d'
import { CaretRight } from '@/components/Icon'
import { FEE_RATE_PERCENT_DISPLAY_DECIMALS } from '@/constant/decimals'
import { MYX_VIP_RULES_LINK } from '@/config/link'
import { useQuery } from '@tanstack/react-query'
import { getRiskLevelConfig } from '@/request/vip'
import { useEffect, useState } from 'react'

const VipList = ({ rateList, levelList, vipInfo }: VipProps) => {
  return (
    <Box className={'mr-[-16px] ml-[-16px] overflow-hidden'}>
      <Box className={'&:befeor overflow-x-auto'}>
        <Box className={'mx-[16px] w-[min-content]'}>
          <Box className={'table-container mb-[30px]'}>
            <MTable vipInfo={vipInfo} levelList={levelList} rateList={rateList} />
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

const RiskList = ({
  riskTier,
  onChange,
}: {
  riskTier: number
  onChange: (riskTier: number) => void
}) => {
  const { data } = useQuery({
    queryKey: ['api.getRiskList'],
    queryFn: async () => {
      const rs = await getRiskLevelConfig()
      const riskList = rs?.data || []
      return riskList
    },
  })

  useEffect(() => {
    if (data?.length) {
      const risk = data.find((risk) => risk.levelId === riskTier)
      if (!risk) {
        onChange(data?.[0].levelId)
      }
    }
  }, [riskTier, onChange, data])
  return (
    <ul className={'risk-list mt-[24px] flex h-[28px] w-full gap-[12px]'}>
      {(data || []).map((item, _index) => {
        return (
          <li
            key={item.name}
            className={`risk-item flex cursor-pointer items-center justify-center rounded-[6px] px-[16px] py-[8px] text-[14px] leading-[1] transition-all ${item.levelId === riskTier ? 'bg-base font-[700] text-white' : 'text-secondary bg-transparent'} `}
            onClick={() => onChange(item.levelId)}
          >
            {item.name}
          </li>
        )
      })}
    </ul>
  )
}

export const VIPLevel = ({ levelList, rateList, vipInfo }: VipProps) => {
  const [riskTier, setRiskTier] = useState<number>(0)
  return (
    <Box className={'mt-[80px] flex flex-col gap-[24px]'}>
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
      <RiskList riskTier={riskTier} onChange={setRiskTier} />
      <VipList levelList={levelList} rateList={rateList} vipInfo={vipInfo} />
    </Box>
  )
}

function MTable({ levelList, rateList, vipInfo }: VipProps) {
  return (
    <Table className={'text-basic-white'}>
      <TableHead>
        <TableRow>
          <TableCell
            className={
              '!text-secondary sticky-col !border-dark-border min-w-[98px] rounded-tl-[12px] border-r-1 border-b-1 !pl-[40px]'
            }
          >
            <Trans>Level</Trans>
          </TableCell>
          <TableCell className="!text-secondary !border-dark-border min-w-[160px] border-r-1 border-b-1">
            <Trans>Trade</Trans>
          </TableCell>
          <TableCell className="!text-secondary !border-dark-border min-w-[62px] border-r-1 border-b-1">
            <Trans>Or</Trans>
          </TableCell>
          <TableCell className="!text-secondary !border-dark-border min-w-[157px] border-r-1 border-b-1">
            <Trans>Hold</Trans>
          </TableCell>
          <TableCell className="!text-secondary !border-dark-border min-w-[157px] border-r-1 border-b-1">
            <Trans>Taker</Trans>
          </TableCell>
          <TableCell className="!text-secondary !border-dark-border min-w-[157px] rounded-tr-[12px] border-b-1">
            <Trans>Maker</Trans>
          </TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {(levelList || []).map((item, index) => {
          const rate =
            rateList?.find((configInfo) => configInfo.level === item.level) ?? ({} as VipRateType)
          return (
            <TableRow key={index} className={item.level === vipInfo?.level ? 'active' : ''}>
              <TableCell
                className={`sticky-col !text-basic-white !border-dark-border border-r-1 !pl-[40px] ${index + 1 === levelList?.length ? 'rounded-bl-[12px] !border-b-0' : ''}`}
              >
                {`VIP${item.level}`}
                {item.level === vipInfo?.level && (
                  <CaretRight
                    size={20}
                    className={
                      'buy absolute top-[50%] left-[18px] translate-y-[-50%] rotate-270 transform'
                    }
                  />
                )}
              </TableCell>
              <TableCell className={'!text-basic-white !border-dark-border border-r-1'}>
                {item.rule?.trade30Vol
                  ? `≥ $${formatNumberPrecision(item.rule?.trade30Vol, 0)}`
                  : '--'}
              </TableCell>
              <TableCell className={'!text-basic-white !border-dark-border border-r-1 text-center'}>
                {item.rule.myxDaily ? (
                  item.rule?.relation === LevelRelation.OR ? (
                    <Trans>or</Trans>
                  ) : (
                    <Trans>and</Trans>
                  )
                ) : (
                  '/'
                )}
              </TableCell>
              <TableCell className={'!text-basic-white !border-dark-border border-r-1'}>
                {item.rule?.myxDaily
                  ? `≥ ${formatNumberPrecision(item.rule.myxDaily, 0)} MYX`
                  : '/'}
              </TableCell>
              <TableCell className={'!text-basic-white !border-dark-border border-r-1 text-center'}>
                {rate.takerFeeRate
                  ? `${(Number(rate.takerFeeRate) * 100).toFixed(FEE_RATE_PERCENT_DISPLAY_DECIMALS)}%`
                  : '-'}
              </TableCell>
              <TableCell
                className={`!text-basic-white !border-dark-border text-center ${index + 1 === levelList?.length ? 'rounded-br-[12px] !border-b-0' : ''}`}
              >
                {rate.makerFeeRate
                  ? `${(Number(rate.makerFeeRate) * 100).toFixed(FEE_RATE_PERCENT_DISPLAY_DECIMALS)}%`
                  : '-'}
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}
