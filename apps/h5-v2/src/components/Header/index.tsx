import Logo from '@/assets/svg/logo.svg?react'
import { Menu } from './Menu'
import { MenuOperation } from './Operation'

export const Header = () => {
  return (
    <header className="flex justify-between items-center h-[66px] bg-deep px-[40px] sticky top-0 z-20">
      <div className="flex items-center">
        <h1 className=" w-[90px] h-[18px] mr-[40px]">
          <Logo />
        </h1>
        <Menu />
      </div>
      <MenuOperation />
    </header>
  )
}
