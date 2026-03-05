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
    <div className="flex items-center gap-2 flex-wrap">
      {/* Usage Badge */}
      <UsageBadge />

      {/* Divider */}
      <div className="hidden sm:block h-8 w-px bg-zinc-800" />

      {/* Currency Selector */}
      <div className="flex items-center bg-zinc-800/50 rounded-lg border border-zinc-700/50 overflow-hidden">
        <span className="px-3 py-2 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider bg-zinc-800/50">
          Currency
        </span>
        <select
          value={currency}
          onChange={(e) => onCurrencyChange(e.target.value as CurrencyType)}
          className="px-3 py-2 bg-transparent text-white text-sm font-medium focus:outline-none cursor-pointer border-l border-zinc-700/50 min-w-[90px]"
        >
          <option value="IDR" className="bg-zinc-900">Rp IDR</option>
          <option value="USD" className="bg-zinc-900">$ USD</option>
          <option value="EUR" className="bg-zinc-900">€ EUR</option>
          <option value="AUD" className="bg-zinc-900">A$ AUD</option>
          <option value="GBP" className="bg-zinc-900">£ GBP</option>
          <option value="INR" className="bg-zinc-900">₹ INR</option>
          <option value="CNY" className="bg-zinc-900">¥ CNY</option>
          <option value="AED" className="bg-zinc-900">د.إ AED</option>
          <option value="RUB" className="bg-zinc-900">₽ RUB</option>
        </select>
      </div>

      {/* Divider */}
      <div className="hidden sm:block h-8 w-px bg-zinc-800" />

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        {/* Reset */}
        <button
          onClick={onReset}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            showResetConfirm
              ? 'bg-red-500/20 text-red-400 border border-red-500/30'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-800 border border-transparent'
          }`}
        >
          {showResetConfirm ? 'Confirm' : 'Reset'}
        </button>

        {/* PDF Report */}
        <button
          onClick={onOpenReport}
          className="px-4 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-cyan-600 to-blue-600 text-white hover:from-cyan-500 hover:to-blue-500 transition-all flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span className="hidden sm:inline">Export PDF</span>
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
