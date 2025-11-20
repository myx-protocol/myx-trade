import MLogo from '@/assets/home/m-logo.png'
import MenuSimple from '@/assets/home/simple-menu.png'
import MenuIcon from '@/components/Icon/set/Menu'
import { Link } from 'react-router-dom'

interface HeaderProps {
  isConnected?: boolean
}

export const Header = ({ isConnected }: HeaderProps) => {
  if (isConnected) {
    return (
      <div className="sticky top-0 left-0 z-20 w-full bg-[#101114] px-[16px] py-[15px]">
        <div className="flex items-center justify-start">
          {/* menu */}
          <img src={MenuSimple} role="button" className="w-[20px]" />
          <Link to="/">
            <img src={MLogo} role="button" className="ml-[6px] w-[70px]" />
          </Link>
          {/*  */}
        </div>
      </div>
    )
  }
  return (
    <div className="left-0w-full sticky top-0 z-20 bg-[#101114] px-[16px] pt-[10px] pb-[5px]">
      <div role="button">
        <MenuIcon size={22} color="#fff" />
      </div>
    </div>
  )
}
