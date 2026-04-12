import { Swiper, SwiperSlide } from 'swiper/react'
import CreateMarketPng from '@/assets/home/create-market.svg'

import { SwiperItem } from './SwiperItem'
import { Autoplay } from 'swiper/modules'
import { useNavigate } from 'react-router-dom'
import { t } from '@lingui/core/macro'

// const ACTIVITY_LIST = [
//   {
//     image: CreateMarketPng,
//     title: t`Create Market`,
//     description: t`Create your own derivatives market to enjoy LP rewards and fee sharing.`,
//     href: '/market',
//   },
// ]

export const ActivitySwiper = () => {
  const navigate = useNavigate()
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
        {/* {ACTIVITY_LIST.map((item, index) => ( */}
        <SwiperSlide
          onClick={() => {
            // if (item.href) {
            //   navigate(item.href)
            // }
            navigate('/market')
          }}
        >
          <SwiperItem
            image={CreateMarketPng}
            title={t`Create Market`}
            description={t`Create your own derivatives market to enjoy LP rewards and fee sharing.`}
          />
        </SwiperSlide>
        {/* ))} */}
      </Swiper>
    </div>
  )
}
