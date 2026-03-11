import { formatCurrency } from '../../../utils/numberParsing';

interface IRRResult {
  irr: number;
  npv: number;
  paybackPeriod: number;
  totalCashFlow: number;
  totalInvested: number;
  mirr?: number;
  profitabilityIndex?: number;
}

interface IRRResultsProps {
  result: IRRResult;
  discountRate: number;
  alternativeDiscountRate?: number;
  npvAlt?: number;
  showAdvanced: boolean;
  reinvestmentRate: number;
}

export function IRRResults({
  result,
  discountRate,
  alternativeDiscountRate,
  npvAlt,
  showAdvanced,
  reinvestmentRate,
}: IRRResultsProps) {
  return (
    <div className="space-y-4">
      {/* IRR */}
      <ResultCard
        title="IRR"
        value={`${result.irr.toFixed(2)}%`}
        label="Annualized return"
        color={result.irr >= 15 ? 'emerald' : result.irr >= 10 ? 'cyan' : 'orange'}
        icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>}
      />

      {/* NPV */}
      <ResultCard
        title={`NPV @ ${discountRate}%`}
        value={formatCurrency(result.npv)}
        label="Present value"
        color={result.npv >= 0 ? 'cyan' : 'red'}
        icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
      />

      {/* Payback Period */}
      <ResultCard
        title="Payback Period"
        value={`${result.paybackPeriod.toFixed(1)}y`}
        label="Years to break even"
        color="purple"
        icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
      />

      {/* Total Return */}
      <ResultCard
        title="Total Return"
        value={formatCurrency(result.totalCashFlow)}
        label="Sum of all flows"
        color="zinc"
        icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
      />

      {/* Advanced Results - only show when user has entered non-zero rates */}
      {showAdvanced && result.mirr !== undefined && (reinvestmentRate > 0 || (alternativeDiscountRate ?? 0) > 0) && (
        <>
          <div className="border-t border-zinc-700 pt-4 mt-4">
            <h4 className="font-bold text-white text-sm mb-3">Advanced Analysis</h4>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {reinvestmentRate > 0 && (
              <MiniCard
                title={`MIRR @ ${reinvestmentRate}%`}
                value={`${result.mirr.toFixed(2)}%`}
                color={result.mirr >= 15 ? 'emerald' : result.mirr >= 10 ? 'cyan' : 'orange'}
              />
            )}

            {(alternativeDiscountRate ?? 0) > 0 && (
              <MiniCard
                title={`NPV @ ${alternativeDiscountRate}%`}
                value={formatCurrency(npvAlt!)}
                color={npvAlt! >= 0 ? 'emerald' : 'red'}
              />
            )}

            {(reinvestmentRate > 0 || (alternativeDiscountRate ?? 0) > 0) && (
              <MiniCard
                title="Profitability Index"
                value={`${result.profitabilityIndex!.toFixed(2)}x`}
                color={result.profitabilityIndex! >= 1 ? 'emerald' : 'red'}
              />
            )}
          </div>
        </>
      )}

      {/* Interpretation */}
      <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 mt-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="material-symbols-outlined text-emerald-400 text-lg">insights</span>
          <h4 className="font-bold text-emerald-400 text-sm">Analysis</h4>
        </div>
        <ul className="space-y-1.5 text-xs text-zinc-300">
          <li className="flex items-start gap-2">
            <span className="text-emerald-400 mt-0.5">•</span>
            <span>IRR {result.irr.toFixed(1)}%: {
              result.irr >= 20 ? 'Excellent returns' :
              result.irr >= 15 ? 'Strong returns' :
              result.irr >= 10 ? 'Acceptable returns' :
              'Below average'
            }</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-400 mt-0.5">•</span>
            <span>{result.npv > 0 ? 'Project adds value' : 'Project destroys value'}</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-400 mt-0.5">•</span>
            <span>Payback in {result.paybackPeriod.toFixed(1)} years</span>
          </li>
        </ul>
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
