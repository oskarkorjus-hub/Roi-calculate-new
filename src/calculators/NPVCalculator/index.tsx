import { useState, useCallback } from 'react';
import { Toast } from '../../components/ui/Toast';
import { SaveToPortfolioButton } from '../../components/SaveToPortfolioButton';
import { formatCurrency } from '../../utils/numberParsing';

interface CashFlow {
  year: number;
  amount: number;
  discountedValue: number;
}

interface NPVResult {
  npv: number;
  totalCashInflows: number;
  totalCashOutflows: number;
  netCashFlow: number;
  profitabilityIndex: number;
}

const INITIAL_CASH_FLOWS: CashFlow[] = [
  { year: 0, amount: -1_000_000, discountedValue: -1_000_000 },
  { year: 1, amount: 300_000, discountedValue: 272_727 },
  { year: 2, amount: 300_000, discountedValue: 247_933 },
  { year: 3, amount: 300_000, discountedValue: 225_394 },
  { year: 4, amount: 300_000, discountedValue: 204_904 },
  { year: 5, amount: 300_000, discountedValue: 186_276 },
];

export function NPVCalculator() {
  const [currency] = useState<'IDR' | 'USD' | 'AUD' | 'EUR'>('USD');
  const [discountRate, setDiscountRate] = useState(10);
  const [cashFlows, setCashFlows] = useState<CashFlow[]>(INITIAL_CASH_FLOWS);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const calculateDiscountedValue = (amount: number, year: number, rate: number) => {
    return amount / Math.pow(1 + rate / 100, year);
  };

  const npv = cashFlows.reduce((sum, cf) => sum + cf.discountedValue, 0);
  const totalInflows = cashFlows.filter(cf => cf.amount > 0).reduce((sum, cf) => sum + cf.amount, 0);
  const totalOutflows = Math.abs(cashFlows.filter(cf => cf.amount < 0).reduce((sum, cf) => sum + cf.amount, 0));
  const netCashFlow = cashFlows.reduce((sum, cf) => sum + cf.amount, 0);
  const profitabilityIndex = totalOutflows > 0 ? totalInflows / totalOutflows : 0;

  const result: NPVResult = {
    npv,
    totalCashInflows: totalInflows,
    totalCashOutflows: totalOutflows,
    netCashFlow,
    profitabilityIndex,
  };

  const handleCashFlowChange = (index: number, amount: string) => {
    const numAmount = parseFloat(amount) || 0;
    const year = cashFlows[index].year;
    const discountedValue = calculateDiscountedValue(numAmount, year, discountRate);

    const newFlows = [...cashFlows];
    newFlows[index] = { year, amount: numAmount, discountedValue };
    setCashFlows(newFlows);
  };

  const handleDiscountRateChange = (newRate: number) => {
    setDiscountRate(newRate);
    const newFlows = cashFlows.map(cf => ({
      ...cf,
      discountedValue: calculateDiscountedValue(cf.amount, cf.year, newRate),
    }));
    setCashFlows(newFlows);
  };

  const handleAddCashFlow = useCallback(() => {
    const lastYear = Math.max(...cashFlows.map(cf => cf.year));
    const newYear = lastYear + 1;
    setCashFlows([...cashFlows, {
      year: newYear,
      amount: 0,
      discountedValue: 0,
    }]);
  }, [cashFlows]);

  const handleRemoveCashFlow = useCallback((index: number) => {
    if (cashFlows.length > 1 && cashFlows[index].year !== 0) {
      setCashFlows(cashFlows.filter((_, i) => i !== index));
    }
  }, [cashFlows]);

  const handleReset = useCallback(() => {
    setCashFlows(INITIAL_CASH_FLOWS);
    setToast({ message: 'Cash flows reset', type: 'success' });
  }, []);

  return (
    <div className="min-h-screen bg-background text-text-primary selection:bg-primary-light selection:text-primary -mx-4 md:-mx-10 lg:-mx-20 -my-8 px-6 py-8">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="max-w-[100%] mx-auto">
        {/* Header */}
        <header className="mb-8 flex flex-col xl:flex-row xl:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="bg-primary p-2.5 rounded-lg shadow-sm">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-text-primary tracking-tight">NPV Calculator</h1>
              <p className="text-text-muted text-xs mt-1 max-w-md">
                Calculate Net Present Value of your investment project
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            <button
              onClick={handleReset}
              className="px-5 py-2 rounded-lg text-xs font-bold shadow-sm bg-red-500 text-white hover:bg-red-600 transition-all active:scale-95"
            >
              Reset
            </button>

            <SaveToPortfolioButton
              calculatorType="npv"
              projectData={{
                projectName: "NPV Analysis",
                totalInvestment: result.totalCashOutflows,
                roi: (result.npv / result.totalCashOutflows) * 100,
                currency: currency,
              }}
              defaultProjectName="NPV Analysis"
            />
          </div>
        </header>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-9 space-y-6">
            {/* Description */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">NPV (Net Present Value)</h2>
              <p className="text-sm text-gray-600 mb-3">
                NPV is the present value of all future cash flows minus the initial investment. If NPV is positive, the investment is profitable.
              </p>
              <p className="text-sm text-gray-600">
                Formula: NPV = Σ (CF_t / (1 + r)^t) where CF_t is cash flow in year t and r is discount rate
              </p>
            </div>

            {/* Discount Rate */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Discount Rate (%) - Required Rate of Return
              </label>
              <input
                type="number"
                step={0.1}
                value={discountRate}
                onChange={(e) => handleDiscountRateChange(parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-2">
                Typically 8-12% for real estate. This is your minimum required return.
              </p>
            </div>

            {/* Cash Flows Table */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Cash Flows</h3>
                <button
                  onClick={handleAddCashFlow}
                  className="px-3 py-1.5 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700 transition"
                >
                  + Add Year
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="px-4 py-2 text-left text-gray-700 font-medium">Year</th>
                      <th className="px-4 py-2 text-left text-gray-700 font-medium">Cash Flow</th>
                      <th className="px-4 py-2 text-left text-gray-700 font-medium">Discount Factor</th>
                      <th className="px-4 py-2 text-left text-gray-700 font-medium">Discounted Value</th>
                      <th className="px-4 py-2 text-center text-gray-700 font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cashFlows.map((cf, idx) => {
                      const discountFactor = 1 / Math.pow(1 + discountRate / 100, cf.year);
                      return (
                        <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50">
                          <td className="px-4 py-2 font-medium">{cf.year}</td>
                          <td className="px-4 py-2">
                            <input
                              type="number"
                              value={cf.amount}
                              onChange={(e) => handleCashFlowChange(idx, e.target.value)}
                              className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500"
                            />
                          </td>
                          <td className="px-4 py-2 text-xs text-gray-600">
                            {discountFactor.toFixed(4)}
                          </td>
                          <td className={`px-4 py-2 font-semibold ${cf.discountedValue >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatCurrency(cf.discountedValue)}
                          </td>
                          <td className="px-4 py-2 text-center">
                            {cashFlows.length > 1 && cf.year !== 0 && (
                              <button
                                onClick={() => handleRemoveCashFlow(idx)}
                                className="px-2 py-1 text-red-600 hover:bg-red-50 rounded text-xs"
                              >
                                Delete
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="bg-indigo-50 rounded-lg shadow-sm p-6 border border-indigo-200 sticky top-24 space-y-4">
              <h3 className="text-xl font-bold text-gray-900">Results</h3>

              {/* NPV */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="text-sm text-gray-600 font-medium">NPV @ {discountRate}%</div>
                <div className={`text-4xl font-bold ${result.npv >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(result.npv)}
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  {result.npv > 0 ? '✓ Investment is profitable' : '✗ Investment is not profitable'}
                </div>
              </div>

              {/* Summary */}
              <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Inflows:</span>
                  <span className="font-semibold text-green-600">{formatCurrency(result.totalCashInflows)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Outflows:</span>
                  <span className="font-semibold text-red-600">-{formatCurrency(result.totalCashOutflows)}</span>
                </div>
                <div className="border-t pt-2 flex justify-between">
                  <span className="text-gray-600">Net Cash Flow:</span>
                  <span className={`font-semibold ${result.netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(result.netCashFlow)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Profitability Index:</span>
                  <span className={`font-semibold ${result.profitabilityIndex >= 1 ? 'text-green-600' : 'text-orange-600'}`}>
                    {result.profitabilityIndex.toFixed(2)}x
                  </span>
                </div>
              </div>

              {/* Interpretation */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-xs text-blue-800 space-y-1">
                <p className="font-semibold mb-2">Decision:</p>
                {result.npv > 0 ? (
                  <>
                    <p>✓ NPV is positive</p>
                    <p>✓ Accept this investment</p>
                  </>
                ) : (
                  <>
                    <p>✗ NPV is negative</p>
                    <p>✗ Reject this investment</p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NPVCalculator;
