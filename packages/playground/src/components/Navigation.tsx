import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ConnectWallet } from './ConnectWallet';

const Navigation: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { path: '/trade', label: '交易' },
    { path: '/lp', label: 'lp' },
    { path: '/pool', label: '池子' },
  ];

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Navigation Links */}
          <div className="flex space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === item.path
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <span>{item.label}</span>
              </Link>
            ))}
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <ConnectWallet />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
