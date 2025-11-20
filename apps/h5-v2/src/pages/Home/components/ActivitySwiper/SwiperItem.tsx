interface SwiperItemProps {
  image: string
  title: string
  description: string
}

export const SwiperItem = ({ image, title, description }: SwiperItemProps) => {
  return (
    <div className="flex w-full items-center rounded-[10px] border-[1px] border-[#202129] p-[16px]">
      <img src={image} className="w-[60px] flex-shrink-0" />
      <div className="ml-[24px] flex-[1_1_0%]">
        <p className="text-[16px] font-bold">{title}</p>
        <p className="mt-[8px] text-[12px] leading-[1.2] text-[#848E9C]">{description}</p>
      </div>
    </div>
  )
}
