import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from 'recharts';
import { formatCurrency } from '../../../utils/numberParsing';

interface BudgetData {
  name: string;
  budgeted: number;
  actual: number;
}

interface Props {
  data: BudgetData[];
  symbol: string;
  currency: 'IDR' | 'USD' | 'AUD' | 'EUR' | 'GBP';
}

export function BudgetChart({ data, symbol, currency }: Props) {
  const chartData = data.map(item => ({
    ...item,
    variance: item.actual - item.budgeted,
    variancePercent: item.budgeted > 0 ? ((item.actual - item.budgeted) / item.budgeted) * 100 : 0,
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const budgeted = payload.find((p: any) => p.dataKey === 'budgeted')?.value || 0;
      const actual = payload.find((p: any) => p.dataKey === 'actual')?.value || 0;
      const variance = actual - budgeted;
      const variancePercent = budgeted > 0 ? (variance / budgeted) * 100 : 0;

      return (
        <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-3 shadow-lg">
          <p className="text-white font-medium mb-2">{label}</p>
          <div className="space-y-1 text-sm">
            <p className="text-zinc-400">
              Budgeted: <span className="text-white">{symbol} {formatCurrency(budgeted, currency)}</span>
            </p>
            <p className="text-zinc-400">
              Actual: <span className="text-white">{symbol} {formatCurrency(actual, currency)}</span>
            </p>
            <p className={variance > 0 ? 'text-red-400' : 'text-emerald-400'}>
              Variance: {variance > 0 ? '+' : ''}{symbol} {formatCurrency(variance, currency)} ({variancePercent.toFixed(1)}%)
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
      <h3 className="text-lg font-bold text-white mb-6">Budget vs Actual by Category</h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fill: '#9ca3af', fontSize: 11 }}
              axisLine={{ stroke: '#374151' }}
            />
            <YAxis
              tick={{ fill: '#9ca3af', fontSize: 11 }}
              tickFormatter={(value) => `${symbol}${(value / 1000000000).toFixed(1)}B`}
              axisLine={{ stroke: '#374151' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ paddingTop: '10px' }}
              formatter={(value) => <span className="text-zinc-300 text-xs">{value}</span>}
            />
            <Bar dataKey="budgeted" name="Budgeted" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            <Bar dataKey="actual" name="Actual" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.variance > 0 ? '#ef4444' : '#10b981'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Variance Summary */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {chartData.map((item, index) => (
          <div key={index} className="bg-zinc-800/50 rounded-lg p-3">
            <p className="text-[10px] text-zinc-500 uppercase mb-1">{item.name}</p>
            <p className={`text-sm font-bold ${item.variance > 0 ? 'text-red-400' : item.variance < 0 ? 'text-emerald-400' : 'text-zinc-400'}`}>
              {item.variance > 0 ? '+' : ''}{item.variancePercent.toFixed(1)}%
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default BudgetChart;
