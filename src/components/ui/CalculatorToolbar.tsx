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
  return (
    <div className="flex items-center gap-3 flex-wrap">
      {/* Usage Badge */}
      <UsageBadge />

      {/* Divider */}
      <div className="hidden sm:block h-8 w-px bg-gradient-to-b from-transparent via-zinc-700/60 to-transparent" />

      {/* Currency Selector - Enterprise Design */}
      <div className="group relative flex items-center bg-zinc-800/60 backdrop-blur-sm rounded-xl border border-zinc-700/50 overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.1)] hover:shadow-[0_2px_8px_rgba(0,0,0,0.15)] hover:border-zinc-600/60 transition-all duration-200">
        <span className="px-3 py-2.5 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider bg-zinc-800/80 border-r border-zinc-700/50">
          Currency
        </span>
        <div className="relative">
          <select
            value={currency}
            onChange={(e) => onCurrencyChange(e.target.value as CurrencyType)}
            className="appearance-none px-4 py-2.5 pr-9 bg-transparent text-white text-sm font-semibold focus:outline-none cursor-pointer min-w-[100px] hover:bg-zinc-700/30 transition-colors duration-150"
          >
            <option value="IDR" className="bg-zinc-900 text-white">Rp IDR</option>
            <option value="USD" className="bg-zinc-900 text-white">$ USD</option>
            <option value="EUR" className="bg-zinc-900 text-white">€ EUR</option>
            <option value="AUD" className="bg-zinc-900 text-white">A$ AUD</option>
            <option value="GBP" className="bg-zinc-900 text-white">£ GBP</option>
            <option value="INR" className="bg-zinc-900 text-white">₹ INR</option>
            <option value="CNY" className="bg-zinc-900 text-white">¥ CNY</option>
            <option value="AED" className="bg-zinc-900 text-white">د.إ AED</option>
            <option value="RUB" className="bg-zinc-900 text-white">₽ RUB</option>
          </select>
          {/* Custom dropdown arrow */}
          <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Divider */}
      <div className="hidden sm:block h-8 w-px bg-gradient-to-b from-transparent via-zinc-700/60 to-transparent" />

      {/* Action Buttons */}
      <div className="flex items-center gap-2.5">
        {/* Reset Button - Enterprise Design */}
        <button
          onClick={onReset}
          className={`
            group relative px-4 py-2.5 rounded-xl text-sm font-semibold
            transition-all duration-200 overflow-hidden
            ${showResetConfirm
              ? 'bg-gradient-to-b from-red-500/20 to-red-600/15 text-red-400 border border-red-500/40 shadow-[0_0_0_1px_rgba(239,68,68,0.1),0_1px_2px_rgba(239,68,68,0.1)]'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-800/80 border border-zinc-700/50 hover:border-zinc-600/60 shadow-[0_1px_2px_rgba(0,0,0,0.1)]'
            }
            hover:shadow-lg active:scale-[0.98]
          `}
        >
          {/* Subtle glow on confirm state */}
          {showResetConfirm && (
            <div className="absolute inset-0 bg-red-500/10 animate-pulse" />
          )}
          <span className="relative flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {showResetConfirm ? 'Confirm' : 'Reset'}
          </span>
        </button>

        {/* PDF Report Button - Enterprise Design */}
        <button
          onClick={onOpenReport}
          className="
            group relative px-5 py-2.5 rounded-xl text-sm font-semibold text-white
            bg-gradient-to-b from-cyan-500 to-blue-600
            border border-cyan-400/30
            shadow-[0_1px_2px_rgba(0,0,0,0.1),0_2px_8px_rgba(6,182,212,0.25)]
            hover:from-cyan-400 hover:to-blue-500
            hover:shadow-[0_2px_4px_rgba(0,0,0,0.1),0_4px_16px_rgba(6,182,212,0.35)]
            hover:border-cyan-300/40
            active:scale-[0.98]
            transition-all duration-200
            overflow-hidden
          "
        >
          {/* Shimmer effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />

          <span className="relative flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="hidden sm:inline">Export PDF</span>
          </span>
        </button>

        {/* Save to Portfolio */}
        <SaveToPortfolioButton
          calculatorType={calculatorType}
          projectData={projectData}
          defaultProjectName={projectName}
        />
      </div>
    </div>
  );
}
