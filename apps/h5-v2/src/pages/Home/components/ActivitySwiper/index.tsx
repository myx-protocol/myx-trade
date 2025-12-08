import { Swiper, SwiperSlide } from 'swiper/react'
import CreateMarketPng from '@/assets/home/create-market.png'

import { SwiperItem } from './SwiperItem'
import { Autoplay } from 'swiper/modules'

const ACTIVITY_LIST = [
  {
    image: CreateMarketPng,
    title: 'Create Market',
    description: 'Create your own derivatives market to enjoy LP rewards and fee sharing.',
    href: '/market/create',
  },
]

export const ActivitySwiper = () => {
  return (
    <div className="mt-[24px] w-full px-[16px]">
      <Swiper
        spaceBetween={16}
        slidesPerView={1}
        loop={true}
        direction="horizontal"
        className="w-full"
        modules={[Autoplay]}
        autoplay={{
          delay: 2500,
          disableOnInteraction: false,
        }}
      >
        {ACTIVITY_LIST.map((item, index) => (
          <SwiperSlide key={index}>
            <SwiperItem image={item.image} title={item.title} description={item.description} />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  )
}
