import { formatCurrency } from '../../../utils/numberParsing';

interface MortgageResult {
  monthlyPayment: number;
  totalPayment: number;
  totalInterest: number;
  principal: number;
  originationFeeAmount: number;
  monthlyPropertyTax: number;
  monthlyInsurance: number;
  monthlyPMI: number;
  monthlyHOA: number;
  totalMonthlyPayment: number;
  totalMonthlyPaymentWithTax: number;
  totalCostOfBorrowing: number;
  amortizationSchedule: any[];
}

interface MortgageResultsProps {
  result: MortgageResult;
  currency: string;
  symbol: string;
  loanTerm: number;
  showAdvanced: boolean;
  pmiRequired: boolean;
  hoaFeesMonthly: number;
}

export function MortgageResults({
  result,
  currency,
  symbol,
  loanTerm,
  showAdvanced,
  pmiRequired,
  hoaFeesMonthly,
}: MortgageResultsProps) {
  return (
    <div className="space-y-4">
      {/* Basic Results */}
      <ResultCard
        title="Monthly Payment (P+I)"
        value={`${symbol} ${formatCurrency(result.monthlyPayment, currency)}`}
        label="Principal + Interest"
        color="emerald"
        icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
      />

      {/* Total Payment */}
      <ResultCard
        title={`Total Payment (${loanTerm}Y)`}
        value={`${symbol} ${formatCurrency(result.totalPayment, currency)}`}
        label={`Over ${loanTerm} years`}
        color="cyan"
        icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
      />

      {/* Total Interest */}
      <ResultCard
        title="Total Interest Paid"
        value={`${symbol} ${formatCurrency(result.totalInterest, currency)}`}
        label={`${((result.totalInterest / result.totalPayment) * 100).toFixed(1)}% of total`}
        color="red"
        icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>}
      />

      {/* Principal */}
      <ResultCard
        title="Principal Borrowed"
        value={`${symbol} ${formatCurrency(result.principal, currency)}`}
        label="Total loan amount"
        color="zinc"
        icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>}
      />

      {/* Advanced Results */}
      {showAdvanced && (
        <>
          <div className="border-t border-zinc-700 pt-4 mt-4">
            <h4 className="font-bold text-white text-sm mb-3">Advanced Breakdown</h4>
          </div>

          <ResultCard
            title="Total Monthly Payment"
            value={`${symbol} ${formatCurrency(result.totalMonthlyPayment, currency)}`}
            label={`P&I + Tax + Ins${pmiRequired ? ' + PMI' : ''}${hoaFeesMonthly > 0 ? ' + HOA' : ''}`}
            color="purple"
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>}
          />

          <div className="grid grid-cols-2 gap-2">
            <MiniCard
              title="Monthly Property Tax"
              value={`${symbol} ${formatCurrency(result.monthlyPropertyTax, currency)}`}
              color="zinc"
            />
            <MiniCard
              title="Monthly Insurance"
              value={`${symbol} ${formatCurrency(result.monthlyInsurance, currency)}`}
              color="zinc"
            />
            {pmiRequired && (
              <MiniCard
                title="Monthly PMI"
                value={`${symbol} ${formatCurrency(result.monthlyPMI, currency)}`}
                color="zinc"
              />
            )}
            {hoaFeesMonthly > 0 && (
              <MiniCard
                title="Monthly HOA"
                value={`${symbol} ${formatCurrency(result.monthlyHOA, currency)}`}
                color="zinc"
              />
            )}
          </div>

          <MiniCard
            title="Origination Fee"
            value={`${symbol} ${formatCurrency(result.originationFeeAmount, currency)}`}
            color="orange"
          />

          <MiniCard
            title="Total Cost of Borrowing"
            value={`${symbol} ${formatCurrency(result.totalCostOfBorrowing, currency)}`}
            color="red"
          />
        </>
      )}
    </div>
  );
}

const colorMap = {
  emerald: { text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  cyan: { text: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20' },
  purple: { text: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
  orange: { text: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
  red: { text: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' },
  zinc: { text: 'text-zinc-300', bg: 'bg-zinc-800', border: 'border-zinc-700' },
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
          <div className={`text-lg font-bold ${colors.text} tracking-tight leading-none mt-1`}>{value}</div>
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

function MiniCard({ title, value, color }: { title: string; value: string; color: keyof typeof colorMap }) {
  const colors = colorMap[color];

  return (
    <div className="bg-zinc-800 rounded-xl p-3 border border-zinc-700">
      <p className="text-xs text-zinc-400 mb-1">{title}</p>
      <p className={`font-bold ${colors.text} text-sm tabular-nums`}>{value}</p>
    </div>
  );
}
