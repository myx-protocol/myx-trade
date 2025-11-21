import Layout from '../components/Layout'
import Trade from '../pages/Trade'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import Market from '@/pages/Market'
import Cook from '@/pages/Cook'
import { CookDetail } from '@/pages/Cook/detail/index'
import EarnList from '@/pages/Earn/List.tsx'
import EarnDetail from '@/pages/Earn/Detail.tsx'
import { Home } from '@/pages/Home'
import { DEFAULT_PAIR_PATH } from '@/config/trade'
import ErrorPage from '@/ErrorPage'
import NotFound from '@/404'
import { MarketList } from '@/pages/MarketList'
import { Rank } from '@/pages/rank'

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
        path: '*',
        element: <NotFound />,
      },
    ],
  },
])

export default router
