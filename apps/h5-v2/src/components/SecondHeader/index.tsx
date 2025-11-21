import { ArrowRight } from '../Icon'
import { useNavigate } from 'react-router-dom'
interface SecondHeaderProps {
  title?: string
  onBack?: () => void
  left?: React.ReactNode
  right?: React.ReactNode
}

export const SecondHeader = ({ title, onBack, left, right }: SecondHeaderProps) => {
  const navigate = useNavigate()
  const handleBack = () => {
    if (onBack) {
      onBack()
    } else {
      navigate(-1)
    }
  }
  return (
    <div className="bg-deep sticky top-0 left-0 z-20 flex h-[52px] items-center justify-center px-[12px]">
      <div className="absolute top-0 left-[12px] flex h-full items-center" role="button">
        {left || (
          <div role="button" onClick={handleBack} className="flex items-center justify-center">
            <ArrowRight size={20} color="#fff" className="rotate-180" />
          </div>
        )}
      </div>
      <p className="max-w-[50%] text-[16px] font-bold text-white">{title}</p>
      {right && (
        <div className="absolute top-0 right-[12px] flex h-full items-center justify-center">
          {right}
        </div>
      )}
    </div>
  )
}
