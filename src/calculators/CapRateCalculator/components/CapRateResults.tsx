import { formatCurrency } from '../../../utils/numberParsing';

interface CapRateResult {
  capRate: number;
  monthlyNOI: number;
  yearlyNOI: number;
  pricePerNOI: number;
  grossAnnualIncome: number;
  vacancyLoss: number;
  effectiveGrossIncome: number;
  annualExpenses: number;
  adjustedAnnualNOI: number;
  adjustedCapRate: number;
  adjustedMonthlyNOI: number;
}

interface CapRateResultsProps {
  result: CapRateResult;
  showAdvanced: boolean;
}

export function CapRateResults({ result, showAdvanced }: CapRateResultsProps) {
  return (
    <div className="space-y-4">
      {/* Cap Rate */}
      <ResultCard
        title="Cap Rate"
        value={`${result.capRate.toFixed(2)}%`}
        label={
          result.capRate >= 8 ? 'Excellent yield' :
          result.capRate >= 5 ? 'Good yield' :
          result.capRate >= 3 ? 'Moderate yield' : 'Low yield'
        }
        color={result.capRate >= 5 ? 'emerald' : 'orange'}
        icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>}
      />

      {/* Monthly NOI */}
      <ResultCard
        title="Monthly NOI"
        value={formatCurrency(result.monthlyNOI)}
        label="Recurring monthly income"
        color="cyan"
        icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
      />

      {/* Yearly NOI */}
      <ResultCard
        title="Yearly NOI"
        value={formatCurrency(result.yearlyNOI)}
        label="Annual net income"
        color="purple"
        icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
      />

      {/* Price per NOI */}
      <ResultCard
        title="Price / NOI Ratio"
        value={`${result.pricePerNOI.toFixed(1)}x`}
        label="Lower is better (5-10x typical)"
        color="zinc"
        icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>}
      />

      {/* Advanced Results */}
      {showAdvanced && (
        <>
          <div className="border-t border-zinc-700 pt-4 mt-4">
            <h4 className="font-bold text-white text-sm mb-3">Adjusted Results</h4>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <MiniCard
              title="Gross Annual Income"
              value={formatCurrency(result.grossAnnualIncome)}
              color="zinc"
            />

            <MiniCard
              title="Vacancy Loss"
              value={`-${formatCurrency(result.vacancyLoss)}`}
              color="red"
            />

            <MiniCard
              title="Annual Expenses"
              value={`-${formatCurrency(result.annualExpenses)}`}
              color="red"
            />

            <MiniCard
              title="Adjusted Annual NOI"
              value={formatCurrency(result.adjustedAnnualNOI)}
              color="emerald"
            />

            <MiniCard
              title="Adjusted Cap Rate"
              value={`${result.adjustedCapRate.toFixed(2)}%`}
              color={result.adjustedCapRate >= 5 ? 'emerald' : 'orange'}
            />

            <MiniCard
              title="Adjusted Monthly NOI"
              value={formatCurrency(result.adjustedMonthlyNOI)}
              color="cyan"
            />
          </div>
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

function MiniCard({ title, value, color }: { title: string; value: string; color: keyof typeof colorMap }) {
  const colors = colorMap[color];

  return (
    <div className="bg-zinc-800 rounded-xl p-3 border border-zinc-700">
      <p className="text-xs text-zinc-400 mb-1">{title}</p>
      <p className={`font-bold ${colors.text} text-sm`}>{value}</p>
    </div>
  );
}
