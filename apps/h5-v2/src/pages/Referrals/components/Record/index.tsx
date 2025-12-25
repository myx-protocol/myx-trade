import { Trans } from '@lingui/react/macro'
import { t } from '@lingui/core/macro'
import { useEffect, useState } from 'react'
import { useReferralStore } from '@/store/referrals'
import { useAccessParams } from '@/hooks/useAccessParams'
import {
  getUserReferralData,
  getRefereeReferralFlow,
  extractReferralFlow,
  type RefereeReferralFlowType,
  type ExtractReferralFlowType,
  type UserReferralDataType,
} from '@/api/referrals'
import { encryptionAddress } from '@/utils'
import { ModuleTitle } from '../ModuleTitle'
import { StatisticsDialog } from '../StatisticsDialog'
import { Copy } from '@/components/Copy'
import ArrowRight from '@/components/Icon/set/ArrowRight'
import Prev from '@/components/Icon/set/Prev'
import Next from '@/components/Icon/set/Next'
import dayjs from 'dayjs'
import { getChainInfo } from '@/config/chainInfo'
import { TransactionHash } from '@/components/TransactionHash'
import { Loading } from '../Loading'
import { ReferralsEmpty } from '../Empty'
import type { ApiResponse } from '@/api/type'
import { formatNumber } from '@/utils/number'

enum RecordTypeEnum {
  Invite = 0,
  Rebase = 1,
  Claim = 2,
}

const PAGE_SIZE = 10

export const RecordCard = () => {
  const { fetchRefBonus, fetchRefBonusInfoByChain, fetchRefConfig } = useReferralStore()
  const accessParams = useAccessParams()
  const [recordType, setRecordType] = useState<RecordTypeEnum>(RecordTypeEnum.Invite)
  const [list, setList] = useState<
    Array<RefereeReferralFlowType | ExtractReferralFlowType | UserReferralDataType>
  >([])
  const [loading, setLoading] = useState(false)
  const [before, setBefore] = useState<number>(0)
  const [after, setAfter] = useState<number>(0)
  const [statisticsOpen, setStatisticsOpen] = useState(false)
  const [currentReferee, setCurrentReferee] = useState<string>('')

  const fetchData = async () => {
    if (!accessParams?.accessToken || !accessParams.account) return // Only check accessToken, 'account' is not used here
    setLoading(true)
    try {
      let res: ApiResponse<
        RefereeReferralFlowType[] | ExtractReferralFlowType[] | UserReferralDataType[]
      >
      // New APIs do not support pagination params in the interface definition
      // const params = { limit: PAGE_SIZE, before, after }

      if (recordType === RecordTypeEnum.Invite) {
        res = await getUserReferralData(
          {
            limit: PAGE_SIZE,
            before,
            after,
          },
          accessParams,
        )
        // Map to expected format
        const data = res.data || []
        setList(data)
      } else if (recordType === RecordTypeEnum.Rebase) {
        res = await getRefereeReferralFlow(
          {
            limit: PAGE_SIZE,
            before,
            after,
          },
          accessParams,
        )
        // Map to expected format
        const data = res.data || []
        setList(data)
      } else {
        res = await extractReferralFlow(
          {
            limit: PAGE_SIZE,
            before,
            after,
          },
          accessParams,
        )
        // Map to expected format
        const data = res.data || []
        setList(data)
      }
    } catch (e) {
      console.error(e)
      setList([])
    } finally {
      setLoading(false)
    }
  }

  const fetchInitialData = async () => {
    if (accessParams?.accessToken && accessParams.account) {
      await Promise.all([fetchRefBonus(), fetchRefBonusInfoByChain(), fetchRefConfig()])
    }
  }

  useEffect(() => {
    fetchInitialData()
  }, [accessParams?.accessToken, accessParams?.account])

  useEffect(() => {
    fetchData()
  }, [accessParams, recordType, before, after, accessParams?.accessToken, accessParams?.account]) // Added accessToken to dependencies

  const handlePrev = () => {
    if (list.length > 0) {
      setBefore(list[0].id)
      setAfter(0)
    }
  }

  const handleNext = () => {
    if (list.length > 0) {
      setAfter(list[list.length - 1].id)
      setBefore(0)
    }
  }

  const handleChangeType = (type: RecordTypeEnum) => {
    setRecordType(type)
    setBefore(0)
    setAfter(0)
    setList([])
  }

  return (
    <div className="mt-[40px] lg:mt-[68px]">
      <ModuleTitle>
        <Trans>My Records</Trans>
      </ModuleTitle>

      <div className="mt-5 flex gap-8 border-b border-[#31333D]">
        {[
          { label: t`Referral History`, value: RecordTypeEnum.Invite },
          { label: t`Rebate History`, value: RecordTypeEnum.Rebase },
          { label: t`Claim History`, value: RecordTypeEnum.Claim },
        ].map((item) => (
          <div
            key={item.value}
            className={`relative cursor-pointer pb-3 text-sm lg:text-lg ${recordType === item.value ? 'text-[#FFD873]' : 'text-[#CED1D9] hover:text-[#FFD873]'}`}
            onClick={() => handleChangeType(item.value)}
          >
            {item.label}
            {recordType === item.value && (
              <div className="absolute bottom-[-1px] left-0 h-[1px] w-full bg-[#FFD873]" />
            )}
          </div>
        ))}
      </div>

      <div className="mt-4 block lg:hidden">
        {/* Mobile View */}
        {loading ? (
          <></>
        ) : (
          <>
            {list.map((item) => (
              <MobileRecordItem
                key={item.id}
                type={recordType}
                item={item}
                onStatistics={(referee: string) => {
                  setCurrentReferee(referee)
                  setStatisticsOpen(true)
                }}
              />
            ))}
            {list.length === 0 && (
              <div className="h-[150px]">
                <ReferralsEmpty />
              </div>
            )}
          </>
        )}
      </div>

      {/* Desktop View */}
      <div className="hidden lg:block">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-[#31333D] text-[#CED1D9]">
              <th className="py-2 font-normal">
                <Trans>Time</Trans>
              </th>
              {recordType === RecordTypeEnum.Invite && (
                <>
                  <th className="py-2 font-normal">
                    <Trans>Friends</Trans>
                  </th>
                  <th className="py-2 font-normal">
                    <Trans>You Receive</Trans>
                  </th>
                  <th className="py-2 font-normal">
                    <Trans>Friends Receive</Trans>
                  </th>
                  <th className="py-2 font-normal">
                    <Trans>Rebate</Trans>
                  </th>
                  <th className="py-2 text-right font-normal">
                    <Trans>Action</Trans>
                  </th>
                </>
              )}
              {recordType === RecordTypeEnum.Rebase && (
                <>
                  <th className="py-2 font-normal">
                    <Trans>Address</Trans>
                  </th>
                  <th className="py-2 font-normal">
                    <Trans>Chain</Trans>
                  </th>
                  <th className="py-2 text-right font-normal">
                    <Trans>Amount</Trans>
                  </th>
                  <th className="py-2 text-right font-normal">
                    <Trans>Type</Trans>
                  </th>
                </>
              )}
              {recordType === RecordTypeEnum.Claim && (
                <>
                  <th className="py-2 font-normal">
                    <Trans>Chain</Trans>
                  </th>
                  <th className="py-2 font-normal">
                    <Trans>Hash</Trans>
                  </th>
                  <th className="py-2 text-right font-normal">
                    <Trans>Amount</Trans>
                  </th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="py-4">
                  <div className="h-[150px]">
                    <Loading />
                  </div>
                </td>
              </tr>
            ) : (
              <>
                {list.map((item) => (
                  <DesktopRecordItem
                    key={item.id}
                    type={recordType}
                    item={item}
                    onStatistics={(referee: string) => {
                      setCurrentReferee(referee)
                      setStatisticsOpen(true)
                    }}
                  />
                ))}
                {list.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-[#CED1D9]">
                      <div className="h-[150px]">
                        <ReferralsEmpty />
                      </div>
                    </td>
                  </tr>
                )}
              </>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {list.length > 0 && (
        <div className="mt-4 flex justify-end gap-4">
          <div
            className={`cursor-pointer ${!after && !before ? 'cursor-not-allowed text-[#31333D]' : 'text-white'}`}
            onClick={() => {
              if (after || before) handlePrev()
            }}
          >
            <Prev size={12} />
          </div>
          <div
            className={`cursor-pointer ${list.length < PAGE_SIZE ? 'cursor-not-allowed text-[#31333D]' : 'text-white'}`}
            onClick={() => {
              if (list.length === PAGE_SIZE) handleNext()
            }}
          >
            <Next size={12} />
          </div>
        </div>
      )}

      <StatisticsDialog
        open={statisticsOpen}
        onClose={() => setStatisticsOpen(false)}
        referee={currentReferee}
      />
    </div>
  )
}

const MobileRecordItem = ({ type, item, onStatistics }: any) => {
  return (
    <div className="flex flex-col gap-4 border-b border-[#31333D] p-4">
      <div className="flex justify-between">
        <div className="text-xs text-[#CED1D9]">
          <Trans>Time</Trans>
        </div>
        <div className="text-sm text-white">
          {dayjs(
            type === RecordTypeEnum.Rebase
              ? item.rebateTime * 1000
              : type === RecordTypeEnum.Claim
                ? item.txTime * 1000
                : item.createTime,
          ).format('YYYY-MM-DD HH:mm:ss')}
        </div>
      </div>

      {type === RecordTypeEnum.Invite && (
        <>
          <div className="flex justify-between">
            <div className="text-xs text-[#CED1D9]">
              <Trans>Referee</Trans>
            </div>
            <div className="flex items-center gap-1 text-sm text-white">
              {encryptionAddress(item.referee)}
              <Copy content={item.referee} />
            </div>
          </div>
          <div className="flex justify-between">
            <div className="text-xs text-[#CED1D9]">
              <Trans>ReferrerRatio</Trans>
            </div>
            <div className="text-sm text-white">{item.referrerRatio}%</div>
          </div>
          <div className="flex justify-between">
            <div className="text-xs text-[#CED1D9]">
              <Trans>RefereeRatio</Trans>
            </div>
            <div className="text-sm text-white">{item.refereeRatio}%</div>
          </div>
          <div className="flex justify-between">
            <div className="text-xs text-[#CED1D9]">
              <Trans>Rebate</Trans>
            </div>
            <div className="text-sm text-white">{formatNumber(item.contribute)}</div>
          </div>
          <div className="flex justify-between">
            <div className="text-xs text-[#CED1D9]">
              <Trans>Action</Trans>
            </div>
            <div
              className="flex cursor-pointer items-center gap-1 text-sm text-[#00E3A5]"
              onClick={() => onStatistics(item.referee)}
            >
              <Trans>Statistics</Trans>
              <ArrowRight size={14} />
            </div>
          </div>
        </>
      )}

      {type === RecordTypeEnum.Rebase && (
        <>
          <div className="flex justify-between">
            <div className="text-xs text-[#CED1D9]">
              <Trans>Address</Trans>
            </div>
            <div className="flex items-center gap-1 text-sm text-white">
              {encryptionAddress(item.account)}
              <Copy content={item.account} />
            </div>
          </div>
          <div className="flex justify-between">
            <div className="text-xs text-[#CED1D9]">
              <Trans>Chain</Trans>
            </div>
            <div className="text-sm text-white">{getChainInfo(item.chainId)?.label ?? '--'}</div>
          </div>
          <div className="flex justify-between">
            <div className="text-xs text-[#CED1D9]">
              <Trans>Amount</Trans>
            </div>
            <div className="text-sm text-white">
              {formatNumber(item.receiveAmount)} {item.tokenName}
            </div>
          </div>
          <div className="flex justify-between">
            <div className="text-xs text-[#CED1D9]">
              <Trans>Type</Trans>
            </div>
            <div className="text-sm text-white">
              {item.rebateType === 1 ? <Trans>Rebates</Trans> : <Trans>Refund</Trans>}
            </div>
          </div>
        </>
      )}

      {type === RecordTypeEnum.Claim && (
        <>
          <div className="flex justify-between">
            <div className="text-xs text-[#CED1D9]">
              <Trans>Chain</Trans>
            </div>
            <div className="text-sm text-white">{getChainInfo(item.chainId)?.label ?? '--'}</div>
          </div>
          <div className="flex justify-between">
            <div className="text-xs text-[#CED1D9]">
              <Trans>Hash</Trans>
            </div>
            <div className="text-sm text-white">
              <TransactionHash hash={item.txHash} />
            </div>
          </div>
          <div className="flex justify-between">
            <div className="text-xs text-[#CED1D9]">
              <Trans>Amount</Trans>
            </div>
            <div className="text-sm text-white">
              {formatNumber(item.claimAmount)} {item.tokenName}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

const DesktopRecordItem = ({ type, item, onStatistics }: any) => {
  return (
    <tr className="text-white hover:bg-[#31333D]">
      <td className="py-3">
        {dayjs(
          type === RecordTypeEnum.Rebase
            ? item.txTime * 1000
            : type === RecordTypeEnum.Claim
              ? item.txTime * 1000
              : item.createTime,
        ).format('YYYY-MM-DD HH:mm:ss')}
      </td>

      {type === RecordTypeEnum.Invite && (
        <>
          <td className="py-3">
            <div className="flex items-center gap-1">
              {encryptionAddress(item.referee)}
              <Copy content={item.referee} />
            </div>
          </td>
          <td className="py-3">{item.referrerRatio}%</td>
          <td className="py-3">{item.refereeRatio}%</td>
          <td className="py-3">{formatNumber(item.contribute)}</td>
          <td className="py-3 text-right">
            <div
              className="flex cursor-pointer items-center justify-end gap-1 text-[#00E3A5]"
              onClick={() => onStatistics(item.referee)}
            >
              <Trans>Statistics</Trans>
              <ArrowRight size={14} />
            </div>
          </td>
        </>
      )}

      {type === RecordTypeEnum.Rebase && (
        <>
          <td className="py-3">
            <div className="flex items-center gap-1">
              {encryptionAddress(item.account)}
              <Copy content={item.account} />
            </div>
          </td>
          <td className="py-3">{getChainInfo(item.chainId)?.label ?? '--'}</td>
          <td className="py-3 text-right">
            {formatNumber(item.receiveAmount)} {item.tokenName}
          </td>
          <td className="py-3 text-right">
            {item.rebateType === 1 ? <Trans>Rebates</Trans> : <Trans>Refund</Trans>}
          </td>
        </>
      )}

      {type === RecordTypeEnum.Claim && (
        <>
          <td className="py-3">{getChainInfo(item.chainId)?.label ?? '--'}</td>
          <td className="py-3">
            <TransactionHash hash={item.txHash} />
          </td>
          <td className="py-3 text-right">
            {formatNumber(item.claimAmount)} {item.tokenName}
          </td>
        </>
      )}
    </tr>
  )
}
