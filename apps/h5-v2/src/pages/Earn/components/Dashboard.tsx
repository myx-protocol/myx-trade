import {
  Box,
  styled,
  Table,
  TableBody,
  TableCell,
  tableCellClasses,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material'
import { Card } from '@/pages/Earn/components/Card.tsx'
import { Flower, Hot, New } from '@/components/Icon'
import { Trans } from '@lingui/react/macro'
import { useQuery } from '@tanstack/react-query'
import { getQuoteTokenTop } from '@/request'
import { useNavigate } from 'react-router-dom'
import { formatNumberPercent } from '@/utils/formatNumber.ts'
import { Skeleton } from '@/components/UI/Skeleton'
import { useContext } from 'react'
import { SearchContext } from '@/pages/Earn/context.ts'
import { Change } from '@/components/Change.tsx'
import { decimalToPercent } from '@/utils/number.ts'
import { isSafeNumber } from '@/utils'

interface Column<T> {
  key: keyof T
  label: string | React.ReactNode
  render?: (row: T) => string | React.ReactNode
  align?: 'left' | 'right' | 'center'
  width?: number
}

interface TableProps<T> {
  columns: Column<T>[]
  data: T[]
  isLoading: boolean
}
const StyledTableContainer = styled(TableContainer)(() => ({
  backgroundColor: 'var(--deep-bg)',
  // borderRadius: '12px',
  border: 'none',
}))

const StyledTableCell = styled(TableCell)(() => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: 'var(--deep-bg)',
    color: 'var(--color-third)',
    fontSize: 12,
    fontWeight: 400,
    lineHeight: 1.2,
    border: 'none',
    // borderBottom: '1px solid var(--color-base)',
    padding: '12px 0 4px',
    whiteSpace: 'nowrap',
    '&:nth-of-type(1)': {
      paddingLeft: '12px',
    },
    '&:nth-last-of-type(1)': {
      paddingRight: '12px',
    },
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 1,
    color: 'var(--basic-white)',
    border: 'none',
    padding: '12px 0',
    '&:nth-of-type(1)': {
      paddingLeft: '12px',
    },
    '&:nth-last-of-type(1)': {
      paddingRight: '12px',
    },
  },
}))

const StyledTableRow = styled(TableRow)(() => ({
  '&:hover': {
    backgroundColor: 'var(--base-bg)',
  },
}))

const DashboardTable = <T,>({ columns, data, isLoading }: TableProps<T>) => {
  const navigate = useNavigate()
  return (
    <StyledTableContainer className={''}>
      <Table>
        <TableHead>
          <TableRow>
            {columns.map((c) => (
              <StyledTableCell
                key={String(c.key)}
                align={c.align || 'left'}
                width={c.width || '33.3333%'}
              >
                {c.label}
              </StyledTableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {(isLoading ? (Array.from({ length: 3 }) as T[]) : data).map((row, index) => (
            <StyledTableRow
              key={index}
              onClick={() => navigate(`/earn/${(row as Vault).chainId}/${(row as Vault).poolId}`)}
            >
              {columns.map((c) => (
                <StyledTableCell
                  key={String(c.key)}
                  align={c.align || 'left'}
                  className={
                    '[&:nth-child(1)]:rounded-l-[6px] [&:nth-last-child(1)]:rounded-r-[6px]'
                  }
                >
                  {isLoading ? <Skeleton /> : c.render ? c.render(row) : String(row[c.key])}
                </StyledTableCell>
              ))}
            </StyledTableRow>
          ))}
        </TableBody>
      </Table>
    </StyledTableContainer>
  )
}
interface Vault {
  name: string
  icon: string
  rating: string
  apr: string
  chainId: number
  poolId: string
}

export const Dashboard = () => {
  const { chainId, interval } = useContext(SearchContext)

  const columns: Column<Vault>[] = [
    {
      key: 'name',
      label: <Trans>Vault</Trans>,
      align: 'left',
      render: (row: Vault) => {
        return (
          <Box className={'flex items-center gap-[4px]'}>
            <Box className={'h-[20px] w-[20px] min-w-[20px] overflow-hidden rounded-full'}>
              <img src={row.icon} alt={row.name} className={'h-[20px] w-[20px]'} />
            </Box>
            <span>{row.name}</span>
          </Box>
        )
      },
    },
    {
      key: 'rating',
      label: <Trans>Volatility Rating</Trans>,
      align: 'right',
    },
    {
      key: 'apr',
      label: <Trans>APR</Trans>,
      align: 'right',
      render: (row: Vault) => {
        return (
          <Change change={row?.apr}>
            {isSafeNumber(row?.apr) ? decimalToPercent(row?.apr) : '--%'}
          </Change>
        )
      },
    },
  ]

  const { data: NewTop = [], isLoading: isNewLoading } = useQuery({
    queryKey: [{ key: 'quotePoolHotTop3' }, chainId, interval],
    queryFn: async () => {
      const result = await getQuoteTokenTop({
        timeInterval: interval,
        chainId: chainId,
        sortField: 'tokenCreateTime',
      })
      return (result.data || []).map((quote) => {
        return {
          name: quote.mQuoteBaseSymbol,
          icon: quote?.tokenIcon,
          rating: quote.rating,
          apr: quote.apr,
          chainId: quote.chainId,
          poolId: quote.poolId,
        } as Vault
      })
    },
  })

  const { data: HotTop = [], isLoading: isHotLoading } = useQuery({
    queryKey: [{ key: 'quotePoolAPrNew3' }, chainId, interval],
    queryFn: async () => {
      const result = await getQuoteTokenTop({
        timeInterval: interval,
        chainId: chainId,
        sortField: 'quoteTvl',
      })
      return (result.data || []).map((quote) => {
        return {
          name: quote.mQuoteBaseSymbol,
          icon: quote?.tokenIcon,
          rating: quote.rating,
          apr: quote.apr,
          chainId: quote.chainId,
          poolId: quote.poolId,
        } as Vault
      })
    },
  })

  const { data: AprTop = [], isLoading: isAprLoading } = useQuery({
    queryKey: [{ key: 'quotePoolTopNew3' }, chainId, interval],
    queryFn: async () => {
      const result = await getQuoteTokenTop({
        timeInterval: interval,
        chainId: chainId,
        sortField: 'quoteApr',
      })
      return (result.data || []).map((quote) => {
        return {
          name: quote.mQuoteBaseSymbol,
          icon: quote?.tokenIcon,
          rating: quote.rating,
          apr: quote.apr,
          chainId: quote.chainId,
          poolId: quote.poolId,
        } as Vault
      })
    },
  })

  return (
    <Box className={'flex h-[226px] w-full gap-[16px]'}>
      <Card icon={<New size={16} />} title={<Trans>New</Trans>}>
        <DashboardTable<Vault> columns={columns} data={NewTop} isLoading={isNewLoading} />
      </Card>
      <Card icon={<Hot size={16} />} title={<Trans>Hot</Trans>}>
        <DashboardTable<Vault> columns={columns} data={HotTop} isLoading={isHotLoading} />
      </Card>
      <Card icon={<Flower size={16} />} title={<Trans>Top APR</Trans>}>
        <DashboardTable<Vault> columns={columns} data={AprTop} isLoading={isAprLoading} />
      </Card>
    </Box>
  )
}
