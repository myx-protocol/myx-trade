import { useGlobalContractSearchStore } from './store'
import { t } from '@lingui/core/macro'
import DeleteIcon from '@/assets/svg/delete.svg?react'

export const SearchHistory = () => {
  const { searchHistory, setSearchValue, clearSearchHistory } = useGlobalContractSearchStore()

  if (!searchHistory.length) return null

  // 只显示最近10条记录
  const recentHistory = searchHistory.slice(0, 10)

  const handleDelete = () => {
    clearSearchHistory()
  }

  const handleItemClick = (item: string) => {
    // 点击历史记录项，将其填充到搜索框
    setSearchValue(item)
  }

  return (
    <div className="mb-[24px] px-[28px]">
      {/* 标题 */}
      <h3 className="mb-[16px] text-[14px] leading-[1] font-medium text-white">
        {t`Search History`}
      </h3>

      {/* 历史列表 - 第一行包含删除按钮 */}
      <div className="flex flex-wrap gap-[12px]">
        {/* 历史记录项 */}
        {recentHistory.map((item, index) => (
          <div
            key={`${item}-${index}`}
            className="cursor-pointer rounded-[5px] bg-[#202129] px-[12px] py-[10px] text-[12px] font-medium text-white"
            onClick={() => handleItemClick(item)}
          >
            {item}
          </div>
        ))}

        {/* 删除按钮 - 固定在第一行右侧 */}
        <div className="ml-auto">
          <div
            className="cursor-pointer rounded-[5px] bg-[#202129] px-[12px] py-[9px] select-none"
            onClick={handleDelete}
          >
            <DeleteIcon className="h-[16px] w-[16px]" />
          </div>
        </div>
      </div>
    </div>
  )
}
