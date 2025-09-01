import React from 'react';
import { Link } from 'react-router-dom';

const HomePage: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <Link
          to="/trade"
          className="group bg-white rounded-lg shadow-md p-8 hover:shadow-lg transition-shadow border-2 border-transparent hover:border-blue-200"
        > 交易
        </Link>

        {/* LP Card */}
        <Link
          to="/lp"
          className="group bg-white rounded-lg shadow-md p-8 hover:shadow-lg transition-shadow border-2 border-transparent hover:border-purple-200"
        >
          lp
        </Link>
        <Link
          to="/pool"
          className="group bg-white rounded-lg shadow-md p-8 hover:shadow-lg transition-shadow border-2 border-transparent hover:border-purple-200"
        >
          pool
        </Link>
      </div>
    </div>
  );
};

export default HomePage;
