import { EXPRESS_MENU_LIST } from './const'

export const ExpressMenu = () => {
  return (
    <div className="mt-[24px] px-[16px]">
      <div className="flex w-full flex-wrap justify-between gap-[12px]">
        {EXPRESS_MENU_LIST.map((item, index) => (
          <div key={index} className="flex w-[48px] flex-shrink-0 flex-col items-center gap-[8px]">
            <img src={item.icon} className="w-full" />
            <p className="linca-clamp-2 text-[10px]">{item.title()}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
