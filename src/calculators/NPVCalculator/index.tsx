import { useState, useCallback, useMemo } from 'react';
import { Toast } from '../../components/ui/Toast';
import { UsageBadge } from '../../components/ui/UsageBadge';
import { SaveToPortfolioButton } from '../../components/SaveToPortfolioButton';
import { ReportPreviewModal } from '../../components/ui/ReportPreviewModal';
import { generateNPVReport } from '../../hooks/useReportGenerator';
import { formatCurrency, parseDecimalInput } from '../../utils/numberParsing';

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

type CurrencyType = 'IDR' | 'USD' | 'AUD' | 'EUR' | 'GBP' | 'INR' | 'CNY' | 'AED' | 'RUB';

const symbols: Record<CurrencyType, string> = { IDR: 'Rp', USD: '$', AUD: 'A$', EUR: '€', GBP: '£', INR: '₹', CNY: '¥', AED: 'د.إ', RUB: '₽' };

const INITIAL_CASH_FLOWS: CashFlow[] = [
  { year: 0, amount: 0, discountedValue: 0 },
  { year: 1, amount: 0, discountedValue: 0 },
  { year: 2, amount: 0, discountedValue: 0 },
  { year: 3, amount: 0, discountedValue: 0 },
  { year: 4, amount: 0, discountedValue: 0 },
  { year: 5, amount: 0, discountedValue: 0 },
];

export function NPVCalculator() {
  const [currency, setCurrency] = useState<CurrencyType>('USD');
  const [discountRate, setDiscountRate] = useState(0);
  const [cashFlows, setCashFlows] = useState<CashFlow[]>(INITIAL_CASH_FLOWS);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);

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

  const symbol = symbols[currency] || 'Rp';

  // Generate report data
  const reportData = useMemo(() => {
    return generateNPVReport(
      {
        initialInvestment: totalOutflows,
        discountRate,
        cashFlows: cashFlows.map(cf => ({
          year: cf.year,
          inflow: cf.amount > 0 ? cf.amount : 0,
          outflow: cf.amount < 0 ? Math.abs(cf.amount) : 0,
        })),
      },
      {
        npv: result.npv,
        totalInflows,
        totalOutflows,
        profitabilityIndex: result.profitabilityIndex,
      },
      symbol
    );
  }, [cashFlows, discountRate, result, symbol, totalInflows, totalOutflows]);

  const handleCashFlowChange = (index: number, amount: string) => {
    const numAmount = parseDecimalInput(amount) || 0;
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
    <div className="min-h-screen bg-[#0a0a0a] text-white -mx-4 md:-mx-10 lg:-mx-20 -my-8 px-6 py-8">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <ReportPreviewModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        reportData={reportData}
      />

      <div className="max-w-[100%] mx-auto">
        {/* Header */}
        <header className="mb-6 sm:mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center shadow-lg shadow-purple-900/30">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">NPV Calculator</h1>
              <p className="text-zinc-500 text-sm mt-1">
                Calculate Net Present Value of your investment project
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <UsageBadge />

            <div className="flex items-center bg-zinc-800 px-4 py-2 rounded-lg border border-zinc-700">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mr-3">Currency</span>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as CurrencyType)}
                className="bg-transparent text-white text-xs font-bold focus:outline-none cursor-pointer"
              >
                <option value="IDR" className="bg-zinc-800 text-white">Rp IDR</option>
                <option value="USD" className="bg-zinc-800 text-white">$ USD</option>
                <option value="EUR" className="bg-zinc-800 text-white">€ EUR</option>
                <option value="AUD" className="bg-zinc-800 text-white">A$ AUD</option>
                <option value="GBP" className="bg-zinc-800 text-white">£ GBP</option>
                <option value="INR" className="bg-zinc-800 text-white">₹ INR</option>
                <option value="CNY" className="bg-zinc-800 text-white">¥ CNY</option>
                <option value="AED" className="bg-zinc-800 text-white">د.إ AED</option>
                <option value="RUB" className="bg-zinc-800 text-white">₽ RUB</option>
              </select>
            </div>

            <button
              onClick={handleReset}
              className="px-3 sm:px-4 py-3 min-h-[44px] rounded-lg text-xs sm:text-sm font-medium bg-zinc-800 text-zinc-300 border border-zinc-700 hover:bg-zinc-700 transition-all"
            >
              Reset
            </button>

            <button
              onClick={() => setShowReportModal(true)}
              className="px-3 sm:px-4 py-3 min-h-[44px] rounded-lg text-xs sm:text-sm font-medium bg-cyan-600 text-white hover:bg-cyan-700 transition-all flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              PDF Report
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
            <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
              <div className="mb-6 flex items-center border-b border-zinc-800 pb-4">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-emerald-400">info</span>
                  <h2 className="text-xl font-bold text-white">NPV (Net Present Value)</h2>
                </div>
              </div>
              <p className="text-sm text-zinc-400 mb-3">
                NPV is the present value of all future cash flows minus the initial investment. If NPV is positive, the investment is profitable.
              </p>
              <p className="text-sm text-zinc-400">
                Formula: NPV = Σ (CF_t / (1 + r)^t) where CF_t is cash flow in year t and r is discount rate
              </p>
            </div>

            {/* Discount Rate */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
              <div className="mb-6 flex items-center border-b border-zinc-800 pb-4">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-emerald-400">tune</span>
                  <h2 className="text-xl font-bold text-white">Settings</h2>
                </div>
              </div>
              <div className="space-y-3">
                <label className="flex items-center gap-1.5 text-sm font-medium text-zinc-400">
                  Discount Rate (%) - Required Rate of Return
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={discountRate === 0 ? '' : discountRate}
                  onChange={(e) => handleDiscountRateChange(parseDecimalInput(e.target.value) || 0)}
                  placeholder="0"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl px-6 py-4 text-[16px] font-bold text-white placeholder:text-zinc-500 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all tabular-nums"
                />
                <p className="text-xs text-zinc-500">
                  Typically 8-12% for real estate. This is your minimum required return.
                </p>
              </div>
            </div>

            {/* Cash Flows Table */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
              <div className="mb-6 flex items-center justify-between border-b border-zinc-800 pb-4">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-emerald-400">account_balance</span>
                  <h2 className="text-xl font-bold text-white">Cash Flows</h2>
                </div>
                <button
                  onClick={handleAddCashFlow}
                  className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl text-sm font-bold hover:bg-emerald-500/20 transition-all"
                >
                  <span className="material-symbols-outlined text-lg">add</span>
                  Add Year
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm border-separate border-spacing-0">
                  <thead>
                    <tr className="border-b border-zinc-700 bg-zinc-800">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-300 uppercase tracking-wide rounded-tl-lg">Year</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-300 uppercase tracking-wide">Cash Flow</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-zinc-300 uppercase tracking-wide">Discount Factor</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-zinc-300 uppercase tracking-wide">Discounted Value</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-zinc-300 uppercase tracking-wide rounded-tr-lg">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cashFlows.map((cf, idx) => {
                      const discountFactor = 1 / Math.pow(1 + discountRate / 100, cf.year);
                      return (
                        <tr key={idx} className="group hover:bg-zinc-800/50 transition-colors border-b border-zinc-800/50">
                          <td className="px-4 py-3">
                            <span className="font-bold text-white tabular-nums">{cf.year}</span>
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="text"
                              inputMode="decimal"
                              value={cf.amount === 0 ? '' : cf.amount}
                              onChange={(e) => handleCashFlowChange(idx, e.target.value)}
                              placeholder="0"
                              className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl px-4 py-3 text-[15px] font-bold text-white placeholder:text-zinc-500 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all tabular-nums"
                            />
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="text-xs text-zinc-400 tabular-nums">{discountFactor.toFixed(4)}</span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span className={`font-bold tabular-nums ${cf.discountedValue >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                              {formatCurrency(cf.discountedValue)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            {cashFlows.length > 1 && cf.year !== 0 && (
                              <button
                                onClick={() => handleRemoveCashFlow(idx)}
                                className="px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-xl transition-colors font-bold"
                              >
                                <span className="material-symbols-outlined text-lg">delete</span>
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 p-4 bg-zinc-800/50 rounded-xl border border-zinc-700/50">
                <div className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-zinc-500 text-lg">lightbulb</span>
                  <p className="text-xs text-zinc-500">
                    <span className="font-bold text-zinc-400">Tip:</span> Negative cash flows are outflows (investments), positive are inflows (returns).
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="sticky top-24 flex flex-col gap-4">
              <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
                <div className="mb-4 flex items-center border-b border-zinc-800 pb-4">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-emerald-400">analytics</span>
                    <h3 className="text-lg font-bold text-white">Results</h3>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* NPV */}
                  <ResultCard
                    title={`NPV @ ${discountRate}%`}
                    value={formatCurrency(result.npv)}
                    label={result.npv > 0 ? 'Investment is profitable' : 'Investment is not profitable'}
                    color={result.npv >= 0 ? 'emerald' : 'red'}
                    icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                  />

                  {/* Profitability Index */}
                  <ResultCard
                    title="Profitability Index"
                    value={`${result.profitabilityIndex.toFixed(2)}x`}
                    label="Return per dollar invested"
                    color={result.profitabilityIndex >= 1 ? 'cyan' : 'orange'}
                    icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>}
                  />

                  {/* Summary */}
                  <div className="bg-zinc-800 rounded-xl p-4 space-y-3 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-400">Total Inflows</span>
                      <span className="font-bold text-emerald-400 tabular-nums">{formatCurrency(result.totalCashInflows)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-400">Total Outflows</span>
                      <span className="font-bold text-red-400 tabular-nums">-{formatCurrency(result.totalCashOutflows)}</span>
                    </div>
                    <div className="border-t border-zinc-700 pt-3 flex justify-between items-center">
                      <span className="text-zinc-400">Net Cash Flow</span>
                      <span className={`font-bold tabular-nums ${result.netCashFlow >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {formatCurrency(result.netCashFlow)}
                      </span>
                    </div>
                  </div>

                  {/* Decision */}
                  <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="material-symbols-outlined text-cyan-400 text-lg">gavel</span>
                      <p className="font-bold text-cyan-400 text-sm">Decision</p>
                    </div>
                    {result.npv > 0 ? (
                      <ul className="space-y-1.5 text-xs text-zinc-300">
                        <li className="flex items-center gap-2">
                          <span className="text-emerald-400">✓</span> NPV is positive
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="text-emerald-400">✓</span> Accept this investment
                        </li>
                      </ul>
                    ) : (
                      <ul className="space-y-1.5 text-xs text-zinc-300">
                        <li className="flex items-center gap-2">
                          <span className="text-red-400">✗</span> NPV is negative
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="text-red-400">✗</span> Reject this investment
                        </li>
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const colorMap = {
  emerald: { text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  cyan: { text: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20' },
  purple: { text: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
  orange: { text: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
  red: { text: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' },
};

function ResultCard({ title, value, label, color, icon }: {
  title: string;
  value: string;
  label: string;
  color: keyof typeof colorMap;
  icon: React.ReactNode;
}) {
  const colors = colorMap[color];

  return (
    <div className={`bg-zinc-900 p-4 rounded-2xl border ${colors.border} transition-all duration-300 hover:border-zinc-600 group cursor-default`}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <span className="text-zinc-400 text-[10px] font-semibold uppercase tracking-wide">{title}</span>
          <div className={`text-xl font-bold ${colors.text} tracking-tight leading-none mt-1`}>{value}</div>
        </div>
        <div className={`w-9 h-9 ${colors.bg} rounded-xl flex items-center justify-center ${colors.text} transition-transform group-hover:scale-110 duration-300`}>
          {icon}
        </div>
      </div>
      <div className="flex items-center gap-1.5">
        <div className={`w-1.5 h-1.5 rounded-full ${colors.text.replace('text', 'bg')} opacity-60 animate-pulse`}></div>
        <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-wide">{label}</span>
      </div>
    </div>
  );
}

export default NPVCalculator;
