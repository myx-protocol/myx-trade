import { tradeHello } from '@myx-trade/sdk';

function App() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <section className="bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 pb-4 border-b-2 border-blue-500">
          SDK 测试
        </h2>
        <div className="text-center p-8 bg-blue-50 rounded-lg">
          <p className="text-lg text-gray-700">
            Trade 模块:
            <span className="font-bold text-blue-600 ml-2">
              {tradeHello()}
            </span>
          </p>
        </div>
      </section>
    </div>
  );
}

export default App;
