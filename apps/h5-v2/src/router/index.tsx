import Layout from '../components/Layout'
import Trade from '../pages/Trade'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import Market from '@/pages/Market'
import Cook from '@/pages/Cook'
import { CookDetail } from '@/pages/Cook/detail/index'
import EarnList from '@/pages/Earn/List.tsx'
import EarnDetail from '@/pages/Earn/detail/index'
import { Home } from '@/pages/Home'
import { DEFAULT_PRICE_PATH, DEFAULT_PAIR_PATH } from '@/config/trade'
import ErrorPage from '@/ErrorPage'
import NotFound from '@/404'
import { MarketList } from '@/pages/MarketList'
import { Rank } from '@/pages/rank'
import { lazy } from 'react'
import Referrals from '@/pages/Referrals'
import SelectReferral from '@/pages/Referrals/SelectReferral'
import VIP from '@/pages/VIP'

const Record = lazy(() => import('@/pages/record'))
const Price = lazy(() => import('@/pages/Price'))

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: 'market-list',
        element: <MarketList />,
      },
      {
        path: 'rank',
        element: <Rank />,
      },
      {
        path: 'price',
        element: <Navigate to={DEFAULT_PRICE_PATH} />,
      },
      {
        path: 'price/:chainId/:poolId',
        element: <Price />,
      },
      {
        path: 'trade',
        element: <Navigate to={DEFAULT_PAIR_PATH} />,
      },
      {
        path: 'trade/:chainId/:poolId',
        element: <Trade />,
      },
      {
        path: 'market',
        element: <Market />,
      },
      {
        path: 'market/:chainId',
        element: <Market />,
      },
      {
        path: 'market/:chainId/:address',
        element: <Market />,
      },
      {
        path: 'cook',
        element: <Cook />,
      },
      {
        path: 'cook/:chainId/:poolId',
        element: <CookDetail />,
      },
      {
        path: 'earn',
        element: <EarnList />,
      },
      {
        path: 'earn/:chainId',
        element: <Navigate to="/earn" replace />,
      },
      {
        path: 'earn/:chainId/:poolId',
        element: <EarnDetail />,
      },
      {
        path: 'record',
        element: <Record />,
      },
      {
        path: 'referrals',
        element: <Referrals />,
      },
      {
        path: '/referrals/select-referral',
        element: <SelectReferral />,
      },
      {
        path: 'vip',
        element: <VIP />,
      },
      {
        path: '*',
        element: <NotFound />,
      },
    ],
  },
])

export default router
