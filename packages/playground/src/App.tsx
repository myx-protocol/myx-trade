import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { WalletProvider } from './providers/WagmiProvider';
import Navigation from './components/Navigation';
import HomePage from './pages/HomePage';
import TradePage from './pages/TradePage';
import LPPage from './pages/LPPage';
import PoolPage from './pages/PoolPage';

const App: React.FC = () => {
  return (
    <WalletProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Navigation />
          <main>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/trade" element={<TradePage />} />
              <Route path="/lp" element={<LPPage />} />
              <Route path="/pool" element={<PoolPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </Router>
    </WalletProvider>
  );
};

export default App;
