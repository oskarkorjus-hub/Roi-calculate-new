import { formatCurrency } from '../../../utils/numberParsing';
import { Tooltip } from '../../../components/ui/Tooltip';
import type { LoanConfig, LoanResult } from '../index';

type LenderType = 'bank' | 'developer' | 'private' | 'hard-money';

interface Props {
  loan: LoanConfig;
  result?: LoanResult;
  symbol: string;
  currency: 'IDR' | 'USD' | 'AUD' | 'EUR' | 'GBP';
  onLoanChange: (loanId: number, field: keyof LoanConfig, value: string | number | boolean) => void;
  lenderLabels: Record<LenderType, string>;
  lenderDescriptions: Record<LenderType, string>;
}

const lenderColors: Record<LenderType, { bg: string; border: string; text: string }> = {
  'bank': { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400' },
  'developer': { bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', text: 'text-cyan-400' },
  'private': { bg: 'bg-purple-500/10', border: 'border-purple-500/30', text: 'text-purple-400' },
  'hard-money': { bg: 'bg-orange-500/10', border: 'border-orange-500/30', text: 'text-orange-400' },
};

export function LoanCard({ loan, result, symbol, currency, onLoanChange, lenderLabels, lenderDescriptions }: Props) {
  const colors = lenderColors[loan.lenderType];

  return (
    <div className={`rounded-xl border ${loan.enabled ? colors.border : 'border-zinc-800'} ${loan.enabled ? colors.bg : 'bg-zinc-900/50'} overflow-hidden transition-all`}>
      {/* Header */}
      <div className={`px-4 py-3 flex items-center justify-between ${loan.enabled ? '' : 'opacity-50'}`}>
        <div className="flex items-center gap-3">
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={loan.enabled}
              onChange={(e) => onLoanChange(loan.id, 'enabled', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
          </label>
          <input
            type="text"
            value={loan.name}
            onChange={(e) => onLoanChange(loan.id, 'name', e.target.value)}
            className="bg-transparent text-lg font-bold text-white focus:outline-none border-b border-transparent focus:border-zinc-600"
            disabled={!loan.enabled}
          />
        </div>
        {result?.isWinner && loan.enabled && (
          <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold rounded-full uppercase tracking-wider">
            Winner
          </span>
        )}
      </div>

      {/* Content */}
      <div className={`p-4 ${!loan.enabled ? 'opacity-40 pointer-events-none' : ''}`}>
        {/* Lender Type Selector */}
        <div className="mb-4">
          <label className="text-xs text-zinc-400 uppercase tracking-wider mb-2 block">Lender Type</label>
          <select
            value={loan.lenderType}
            onChange={(e) => onLoanChange(loan.id, 'lenderType', e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white"
          >
            <option value="bank">Bank</option>
            <option value="developer">Developer</option>
            <option value="private">Private Lender</option>
            <option value="hard-money">Hard Money</option>
          </select>
          <p className="text-[10px] text-zinc-500 mt-1">{lenderDescriptions[loan.lenderType]}</p>
        </div>

        {/* Basic Terms */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label className="flex items-center gap-1 text-xs text-zinc-400 mb-1">
              Custom Amount
              <Tooltip text="Leave at 0 to use calculated loan amount from property value" />
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-zinc-500">{symbol}</span>
              <input
                type="number"
                value={loan.amount}
                onChange={(e) => onLoanChange(loan.id, 'amount', e.target.value)}
                placeholder="Auto"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg pl-10 pr-3 py-2 text-sm text-white"
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-zinc-400 mb-1 block">Interest Rate</label>
            <div className="relative">
              <input
                type="number"
                value={loan.interestRate}
                onChange={(e) => onLoanChange(loan.id, 'interestRate', e.target.value)}
                step="0.1"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg pl-3 pr-8 py-2 text-sm text-white"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-500">%</span>
            </div>
          </div>
          <div>
            <label className="text-xs text-zinc-400 mb-1 block">Term</label>
            <div className="relative">
              <input
                type="number"
                value={loan.term}
                onChange={(e) => onLoanChange(loan.id, 'term', e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg pl-3 pr-12 py-2 text-sm text-white"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-500">years</span>
            </div>
          </div>
          <div>
            <label className="flex items-center gap-1 text-xs text-zinc-400 mb-1">
              Origination Fee
              <Tooltip text="Upfront fee charged by lender (1-3% typical)" />
            </label>
            <div className="relative">
              <input
                type="number"
                value={loan.originationFeePercent}
                onChange={(e) => onLoanChange(loan.id, 'originationFeePercent', e.target.value)}
                step="0.1"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg pl-3 pr-8 py-2 text-sm text-white"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-500">%</span>
            </div>
          </div>
        </div>

        {/* Advanced Options */}
        <div className="border-t border-zinc-700 pt-4 mt-4">
          <p className="text-xs text-zinc-400 uppercase tracking-wider mb-3">Advanced Options</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="flex items-center gap-1 text-xs text-zinc-400 mb-1">
                Interest-Only
                <Tooltip text="Months of interest-only payments before amortization" />
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={loan.interestOnlyPeriod}
                  onChange={(e) => onLoanChange(loan.id, 'interestOnlyPeriod', e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg pl-3 pr-14 py-2 text-sm text-white"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-500">months</span>
              </div>
            </div>
            <div>
              <label className="flex items-center gap-1 text-xs text-zinc-400 mb-1">
                Prepay Penalty
                <Tooltip text="Penalty for early payoff (% of remaining balance)" />
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={loan.prepaymentPenaltyPercent}
                  onChange={(e) => onLoanChange(loan.id, 'prepaymentPenaltyPercent', e.target.value)}
                  step="0.1"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg pl-3 pr-8 py-2 text-sm text-white"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-500">%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Results Summary */}
        {result && (
          <div className="border-t border-zinc-700 pt-4 mt-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-zinc-800/50 rounded-lg p-3">
                <p className="text-[10px] text-zinc-400 uppercase mb-1">Monthly Payment</p>
                <p className={`text-lg font-bold ${colors.text}`}>
                  {symbol} {formatCurrency(result.monthlyPayment, currency)}
                </p>
              </div>
              <div className="bg-zinc-800/50 rounded-lg p-3">
                <p className="text-[10px] text-zinc-400 uppercase mb-1">Total Interest</p>
                <p className="text-lg font-bold text-red-400">
                  {symbol} {formatCurrency(result.totalInterest, currency)}
                </p>
              </div>
              <div className="bg-zinc-800/50 rounded-lg p-3">
                <p className="text-[10px] text-zinc-400 uppercase mb-1">Origination Fee</p>
                <p className="text-lg font-bold text-zinc-300">
                  {symbol} {formatCurrency(result.originationFee, currency)}
                </p>
              </div>
              <div className="bg-zinc-800/50 rounded-lg p-3">
                <p className="text-[10px] text-zinc-400 uppercase mb-1">Total Cost</p>
                <p className={`text-lg font-bold ${result.isWinner ? 'text-emerald-400' : 'text-white'}`}>
                  {symbol} {formatCurrency(result.totalCostOfBorrowing, currency)}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default LoanCard;
