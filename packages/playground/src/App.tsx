import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { WalletProvider } from '@providers/WagmiProvider';
import Navigation from '@components/Navigation';
import TradePage from '@pages/TradePage';
import LPPage from '@pages/LPPage';
import PoolPage from '@pages/PoolPage';
import SubscriptionPage from './pages/subscription/Subscription';
import Layout from "@pages/layout.tsx";
import { MyxClientProvider } from "@providers/MyxClientProvider.tsx";

const App: React.FC = () => {
  return (
    <WalletProvider>
      <MyxClientProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Navigation />
            <main>
              <Routes>
                <Route element={<Layout />} >
                  <Route path="/" element={<TradePage />} />
                  <Route path="/lp" element={<LPPage />} />
                  <Route path="/pool" element={<PoolPage />} />
                  <Route path="/subscription" element={<SubscriptionPage />} />
                </Route>
                <Route path="*" element={<Navigate to="/" replace />} />
                
              </Routes>
            </main>
          </div>
        </Router>
      </MyxClientProvider>
    </WalletProvider>
  );
};

export default App;
