import { formatCurrency } from '../../../utils/numberParsing';

interface CashFlowYear {
  year: number;
  grossIncome: number;
  vacancyLoss: number;
  effectiveIncome: number;
  totalExpenses: number;
  netCashFlow: number;
  cumulativeCashFlow: number;
}

interface ProjectionVisualizationProps {
  schedule: CashFlowYear[];
  currency: string;
  symbol: string;
  showAdvanced: boolean;
}

export function ProjectionVisualization({ schedule, currency, symbol, showAdvanced }: ProjectionVisualizationProps) {
  if (!schedule.length) return null;

  const lastYear = schedule[schedule.length - 1];
  const avgCashFlow = lastYear.cumulativeCashFlow / schedule.length;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ResultCard
          title="Total Net Cash Flow"
          value={`${symbol} ${formatCurrency(lastYear.cumulativeCashFlow, currency)}`}
          label={`Over ${schedule.length} years`}
          color="emerald"
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
        />

        <ResultCard
          title="Average Annual Cash Flow"
          value={`${symbol} ${formatCurrency(avgCashFlow, currency)}`}
          label="Per year"
          color="cyan"
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>}
        />
      </div>

      {/* Yearly Projection Table */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
        <div className="mb-6 flex items-center border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-emerald-400">calendar_month</span>
            <h2 className="text-xl font-bold text-white">Year-by-Year Projection</h2>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm border-separate border-spacing-0">
            <thead>
              <tr className="border-b border-zinc-700 bg-zinc-800">
                <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-300 uppercase tracking-wide rounded-tl-lg">Year</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-zinc-300 uppercase tracking-wide">Gross Income</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-zinc-300 uppercase tracking-wide">Vacancy Loss</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-zinc-300 uppercase tracking-wide">Eff. Income</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-zinc-300 uppercase tracking-wide">Expenses</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-zinc-300 uppercase tracking-wide">Net Cash Flow</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-zinc-300 uppercase tracking-wide rounded-tr-lg">Cumulative</th>
              </tr>
            </thead>
            <tbody>
              {schedule.map((row, idx) => (
                <tr key={idx} className="group hover:bg-zinc-800/50 transition-colors border-b border-zinc-800/50">
                  <td className="px-4 py-3">
                    <span className="font-bold text-white tabular-nums">Y{row.year}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-zinc-300 tabular-nums">{formatCurrency(row.grossIncome, currency)}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-red-400 font-medium tabular-nums">-{formatCurrency(row.vacancyLoss, currency)}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-zinc-300 tabular-nums">{formatCurrency(row.effectiveIncome, currency)}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-red-400 tabular-nums">-{formatCurrency(row.totalExpenses, currency)}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={`font-bold tabular-nums ${row.netCashFlow >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {symbol} {formatCurrency(row.netCashFlow, currency)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="font-bold text-cyan-400 tabular-nums">
                      {symbol} {formatCurrency(row.cumulativeCashFlow, currency)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Insights */}
      <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="material-symbols-outlined text-cyan-400">insights</span>
          <h3 className="font-bold text-cyan-400">Projection Insights</h3>
        </div>
        <ul className="space-y-2 text-sm text-zinc-300">
          <li className="flex items-start gap-2">
            <span className="text-cyan-400 mt-0.5">•</span>
            <span><strong className="text-white">Final Year Cash Flow</strong>: {symbol} {formatCurrency(schedule[schedule.length - 1].netCashFlow, currency)}</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-cyan-400 mt-0.5">•</span>
            <span><strong className="text-white">Total Cumulative</strong>: {symbol} {formatCurrency(lastYear.cumulativeCashFlow, currency)}</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-cyan-400 mt-0.5">•</span>
            <span><strong className="text-white">Average Annual</strong>: {symbol} {formatCurrency(avgCashFlow, currency)}</span>
          </li>
          {lastYear.cumulativeCashFlow > 0 && (
            <li className="flex items-start gap-2">
              <span className="text-cyan-400 mt-0.5">•</span>
              <span><strong className="text-white">ROI</strong>: {((lastYear.cumulativeCashFlow / (schedule[0].effectiveIncome * 12)) * 100).toFixed(1)}% over {schedule.length} years</span>
            </li>
          )}
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
    <div className={`bg-zinc-900 p-5 rounded-2xl border ${colors.border} transition-all duration-300 hover:border-zinc-600 group cursor-default`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <span className="text-zinc-400 text-[10px] font-semibold uppercase tracking-wide">{title}</span>
          <div className={`text-2xl font-bold ${colors.text} tracking-tight leading-none mt-1`}>{value}</div>
        </div>
        <div className={`w-10 h-10 ${colors.bg} rounded-xl flex items-center justify-center ${colors.text} transition-transform group-hover:scale-110 duration-300`}>
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
