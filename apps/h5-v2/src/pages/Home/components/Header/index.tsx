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
      <div className="bg-plus sticky top-0 left-0 z-20 w-full px-[16px] pt-[15px]">
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
    <div className="bg-plus sticky top-0 left-0 z-20 w-full px-[16px] pt-[10px]">
      <div role="button">
        <MenuIcon size={22} color="#fff" />
      </div>
    </div>
  )
}
