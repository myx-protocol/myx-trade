import {
  Table as MuiTable,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  type TableProps,
} from '@mui/material'
import type { ReactNode } from 'react'

export interface Column<T = any> {
  key: string
  title: string | ReactNode
  dataIndex?: string
  render?: (value: any, record: T, index: number) => ReactNode
  width?: string | number
  minWidth?: string | number
  align?: 'left' | 'center' | 'right'
  sortable?: boolean
  fixed?: 'left' | 'right'
}

export interface TableComponentProps<T = any> extends Omit<TableProps, 'children'> {
  columns: Column<T>[]
  dataSource: T[]
  rowKey?: string | ((record: T) => string)
  loading?: boolean
  // pagination?: boolean
  onRowClick?: (record: T, index: number) => void
  emptyText?: string | ReactNode
  height?: string | number
  // bordered?: boolean
}

export const Table = <T extends Record<string, any>>({
  columns,
  dataSource,
  rowKey = 'id',
  loading = false,
  // pagination = false,
  onRowClick,
  emptyText = '暂无数据',
  sx,
  height,
  ...props
}: TableComponentProps<T>) => {
  // 获取行的唯一key
  const getRowKey = (record: T, index: number): string => {
    if (typeof rowKey === 'function') {
      return rowKey(record)
    }
    return record[rowKey] || index.toString()
  }

  // 渲染单元格内容
  const renderCell = (column: Column<T>, record: T, index: number) => {
    if (column.render) {
      return column.render(record[column.dataIndex || column.key], record, index)
    }
    return record[column.dataIndex || column.key]
  }

  // 计算固定列的偏移量
  const getFixedOffset = (columnIndex: number, direction: 'left' | 'right') => {
    let offset = 0
    if (direction === 'left') {
      for (let i = 0; i < columnIndex; i++) {
        if (columns[i].fixed === 'left') {
          offset += Number(columns[i].width) || 120
        }
      }
    } else {
      for (let i = columns.length - 1; i > columnIndex; i--) {
        if (columns[i].fixed === 'right') {
          offset += Number(columns[i].width) || 120
        }
      }
    }
    return offset
  }

  // 获取单元格样式
  const getCellStyle = (column: Column<T>, columnIndex: number) => {
    const baseStyle: any = {
      width: column.width,
      minWidth: column.minWidth,
    }

    if (column.fixed) {
      const offset = getFixedOffset(columnIndex, column.fixed)
      baseStyle.position = 'sticky'
      baseStyle.zIndex = 1
      baseStyle.backgroundColor = '#101114'
      baseStyle[column.fixed] = `${offset}px`

      if (column.fixed === 'left') {
        baseStyle.boxShadow = '2px 0 5px rgba(0,0,0,0.1)'
      } else {
        baseStyle.boxShadow = '-2px 0 5px rgba(0,0,0,0.1)'
      }
    }

    return baseStyle
  }

  return (
    <TableContainer
      component={Paper}
      sx={{
        backgroundColor: 'transparent',
        boxShadow: 'none',
        overflowX: 'auto',
        maxHeight: height,
        '& .MuiPaper-root': {
          backgroundColor: 'transparent',
        },
      }}
    >
      <MuiTable
        {...props}
        stickyHeader={Boolean(height)}
        sx={{
          backgroundColor: '#101114',
          width: 'max-content',
          minWidth: '100%',
          tableLayout: 'auto',
          '& .MuiTableCell-root': {
            color: '#FFFFFF',
            padding: '12px 20px',
            fontSize: '12px',
            borderBottom: '1px solid #202129',
          },
          '& .MuiTableHead-root .MuiTableCell-root': {
            backgroundColor: '#101114',
            color: '#848E9C',
            fontWeight: '500',
            borderBottom: '1px solid #202129',
            whiteSpace: 'nowrap',
          },
          '& .MuiTableBody-root .MuiTableRow-root': {
            backgroundColor: 'transparent',
            '&:hover': {
              backgroundColor: '#101114',
              cursor: onRowClick ? 'pointer' : 'default',
            },
          },
          ...sx,
        }}
      >
        {/* 表头 */}
        <TableHead>
          <TableRow>
            {columns.map((column, index) => (
              <TableCell
                key={column.key}
                align={column.align || 'left'}
                style={getCellStyle(column, index)}
              >
                {column.title}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>

        {/* 表体 */}
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={columns.length} align="center">
                加载中...
              </TableCell>
            </TableRow>
          ) : dataSource.length === 0 ? (
            <TableRow>
              <TableCell
                sx={{
                  borderBottom: 'none !important',
                }}
                colSpan={columns.length}
                align="center"
              >
                {emptyText}
              </TableCell>
            </TableRow>
          ) : (
            dataSource.map((record, index) => (
              <TableRow key={getRowKey(record, index)} onClick={() => onRowClick?.(record, index)}>
                {columns.map((column, columnIndex) => (
                  <TableCell
                    key={column.key}
                    align={column.align || 'left'}
                    style={getCellStyle(column, columnIndex)}
                  >
                    {renderCell(column, record, index)}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </MuiTable>
    </TableContainer>
  )
}
