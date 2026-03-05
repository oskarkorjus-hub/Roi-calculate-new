import { useState } from 'react';
import { UsageBadge } from './UsageBadge';
import { SaveToPortfolioButton } from '../SaveToPortfolioButton';

type CurrencyType = 'IDR' | 'USD' | 'AUD' | 'EUR' | 'GBP' | 'INR' | 'CNY' | 'AED' | 'RUB';

type CalculatorType = 'xirr' | 'rental-roi' | 'mortgage' | 'cashflow' | 'dev-feasibility' | 'cap-rate' | 'irr' | 'npv' | 'indonesia-tax' | 'rental-projection' | 'financing' | 'dev-budget' | 'risk-assessment';

interface CalculatorToolbarProps {
  currency: CurrencyType;
  onCurrencyChange: (currency: CurrencyType) => void;
  onReset: () => void;
  onOpenReport: () => void;
  calculatorType: CalculatorType;
  projectData: Record<string, unknown>;
  projectName: string;
  showResetConfirm?: boolean;
}

const currencySymbols: Record<CurrencyType, string> = {
  IDR: 'Rp',
  USD: '$',
  EUR: '€',
  AUD: 'A$',
  GBP: '£',
  INR: '₹',
  CNY: '¥',
  AED: 'د.إ',
  RUB: '₽',
};

export function CalculatorToolbar({
  currency,
  onCurrencyChange,
  onReset,
  onOpenReport,
  calculatorType,
  projectData,
  projectName,
  showResetConfirm = false,
}: CalculatorToolbarProps) {
  const [showCurrencyMenu, setShowCurrencyMenu] = useState(false);

  return (
    <div className="flex items-center gap-2">
      {/* Usage Badge - Compact */}
      <UsageBadge />

      {/* Currency Selector - Compact */}
      <div className="relative">
        <button
          onClick={() => setShowCurrencyMenu(!showCurrencyMenu)}
          onBlur={() => setTimeout(() => setShowCurrencyMenu(false), 150)}
          className="flex items-center gap-1.5 px-3 py-2 bg-zinc-800/80 border border-zinc-700/60 rounded-lg text-sm font-semibold text-white hover:bg-zinc-700/80 hover:border-zinc-600 transition-all"
          title="Change currency"
        >
          <span className="text-emerald-400">{currencySymbols[currency]}</span>
          <span>{currency}</span>
          <svg className={`w-3.5 h-3.5 text-zinc-400 transition-transform ${showCurrencyMenu ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {showCurrencyMenu && (
          <div className="absolute top-full right-0 mt-1 py-1 bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl z-50 min-w-[120px]">
            {(Object.keys(currencySymbols) as CurrencyType[]).map((curr) => (
              <button
                key={curr}
                onClick={() => {
                  onCurrencyChange(curr);
                  setShowCurrencyMenu(false);
                }}
                className={`w-full px-3 py-2 text-left text-sm flex items-center gap-2 hover:bg-zinc-800 transition-colors ${currency === curr ? 'text-emerald-400' : 'text-white'}`}
              >
                <span className="w-6 text-zinc-400">{currencySymbols[curr]}</span>
                <span>{curr}</span>
                {currency === curr && (
                  <svg className="w-4 h-4 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="h-6 w-px bg-zinc-700/50" />

      {/* Action Buttons - Icon Only */}
      <div className="flex items-center gap-1.5">
        {/* Reset Button */}
        <button
          onClick={onReset}
          className={`
            group relative p-2 rounded-lg transition-all duration-200
            ${showResetConfirm
              ? 'bg-red-500/20 text-red-400 border border-red-500/40'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-800/80 border border-transparent hover:border-zinc-700/60'
            }
          `}
          title={showResetConfirm ? 'Click again to confirm reset' : 'Reset all values'}
        >
          {showResetConfirm && (
            <div className="absolute inset-0 bg-red-500/10 animate-pulse rounded-lg" />
          )}
          <svg className="w-4.5 h-4.5 relative" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>

        {/* Export PDF Button */}
        <button
          onClick={onOpenReport}
          className="group relative p-2 rounded-lg text-cyan-400 hover:text-white bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 hover:border-cyan-400/50 transition-all duration-200"
          title="Export PDF report"
        >
          <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </button>

        {/* Save to Portfolio - Compact Version */}
        <SaveToPortfolioButton
          calculatorType={calculatorType}
          projectData={projectData}
          defaultProjectName={projectName}
          compact
        />
      </div>
    </div>
  );
}
