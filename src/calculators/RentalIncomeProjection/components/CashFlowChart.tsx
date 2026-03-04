import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart, Bar, Line } from 'recharts';
import { formatCurrency } from '../../../utils/numberParsing';
import type { YearlyProjection } from '../index';

interface Props {
  yearlyProjections: YearlyProjection[];
  symbol: string;
  currency: 'IDR' | 'USD' | 'AUD' | 'EUR' | 'GBP';
  projectionYears: number;
}

export function CashFlowChart({ yearlyProjections, symbol, currency, projectionYears }: Props) {
  const chartData = useMemo(() => {
    return yearlyProjections.map(y => ({
      year: `Year ${y.year}`,
      revenue: y.totalRevenue,
      expenses: y.totalExpenses,
      netIncome: y.netIncome,
      cumulative: y.cumulativeCashFlow,
      occupancy: y.occupancyRate,
      avgRate: y.averageNightlyRate,
    }));
  }, [yearlyProjections]);

  const totalRevenue = yearlyProjections.reduce((sum, y) => sum + y.totalRevenue, 0);
  const totalExpenses = yearlyProjections.reduce((sum, y) => sum + y.totalExpenses, 0);
  const totalNet = yearlyProjections.reduce((sum, y) => sum + y.netIncome, 0);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-3 shadow-xl">
          <p className="font-bold text-white mb-2">{label}</p>
          <div className="space-y-1 text-sm">
            <p className="text-emerald-400">
              Revenue: {symbol} {formatCurrency(data.revenue, currency)}
            </p>
            <p className="text-red-400">
              Expenses: {symbol} {formatCurrency(data.expenses, currency)}
            </p>
            <p className={data.netIncome >= 0 ? 'text-cyan-400' : 'text-red-400'}>
              Net Income: {symbol} {formatCurrency(data.netIncome, currency)}
            </p>
            <p className="text-purple-400 pt-1 border-t border-zinc-700 mt-1">
              Cumulative: {symbol} {formatCurrency(data.cumulative, currency)}
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
      <div className="mb-6 flex items-center justify-between border-b border-zinc-800 pb-4">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-purple-400">trending_up</span>
          <h3 className="text-xl font-bold text-white">{projectionYears}-Year Cash Flow Projection</h3>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-emerald-500"></div>
            <span className="text-zinc-400">Revenue</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-red-500"></div>
            <span className="text-zinc-400">Expenses</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-purple-500"></div>
            <span className="text-zinc-400">Cumulative</span>
          </div>
        </div>
      </div>

      {/* Revenue vs Expenses Chart */}
      <div className="h-72 mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="year" stroke="#9ca3af" fontSize={12} />
            <YAxis
              yAxisId="left"
              stroke="#9ca3af"
              fontSize={12}
              tickFormatter={(value) => `${(value / 1000000000).toFixed(1)}B`}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke="#9ca3af"
              fontSize={12}
              tickFormatter={(value) => `${(value / 1000000000).toFixed(1)}B`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar
              yAxisId="left"
              dataKey="revenue"
              name="Revenue"
              fill="#10b981"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              yAxisId="left"
              dataKey="expenses"
              name="Expenses"
              fill="#ef4444"
              radius={[4, 4, 0, 0]}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="cumulative"
              name="Cumulative Cash Flow"
              stroke="#a855f7"
              strokeWidth={3}
              dot={{ fill: '#a855f7', strokeWidth: 2, r: 4 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Cumulative Cash Flow Area Chart */}
      <div className="bg-zinc-800 rounded-xl p-4 border border-zinc-700 mb-6">
        <h4 className="text-sm font-bold text-white mb-4">Cumulative Cash Flow Growth</h4>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="year" stroke="#9ca3af" fontSize={12} />
              <YAxis
                stroke="#9ca3af"
                fontSize={12}
                tickFormatter={(value) => `${(value / 1000000000).toFixed(1)}B`}
              />
              <Tooltip content={<CustomTooltip />} />
              <defs>
                <linearGradient id="cumulativeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="cumulative"
                stroke="#a855f7"
                strokeWidth={2}
                fill="url(#cumulativeGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-zinc-800 rounded-lg p-4">
          <p className="text-xs text-zinc-400 uppercase tracking-wider mb-1">{projectionYears}Y Total Revenue</p>
          <p className="text-lg font-bold text-emerald-400">
            {symbol} {formatCurrency(totalRevenue, currency)}
          </p>
        </div>
        <div className="bg-zinc-800 rounded-lg p-4">
          <p className="text-xs text-zinc-400 uppercase tracking-wider mb-1">{projectionYears}Y Total Expenses</p>
          <p className="text-lg font-bold text-red-400">
            {symbol} {formatCurrency(totalExpenses, currency)}
          </p>
        </div>
        <div className="bg-zinc-800 rounded-lg p-4">
          <p className="text-xs text-zinc-400 uppercase tracking-wider mb-1">{projectionYears}Y Net Income</p>
          <p className={`text-lg font-bold ${totalNet >= 0 ? 'text-cyan-400' : 'text-red-400'}`}>
            {symbol} {formatCurrency(totalNet, currency)}
          </p>
        </div>
        <div className="bg-zinc-800 rounded-lg p-4">
          <p className="text-xs text-zinc-400 uppercase tracking-wider mb-1">Avg Annual Net</p>
          <p className={`text-lg font-bold ${totalNet >= 0 ? 'text-purple-400' : 'text-red-400'}`}>
            {symbol} {formatCurrency(totalNet / projectionYears, currency)}
          </p>
        </div>
      </div>

      {/* Year-by-Year Table */}
      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="bg-zinc-800">
            <tr>
              <th className="px-3 py-2 text-left text-zinc-300">Year</th>
              <th className="px-3 py-2 text-right text-zinc-300">Revenue</th>
              <th className="px-3 py-2 text-right text-zinc-300">Expenses</th>
              <th className="px-3 py-2 text-right text-zinc-300">Net Income</th>
              <th className="px-3 py-2 text-right text-zinc-300">Occupancy</th>
              <th className="px-3 py-2 text-right text-zinc-300">Avg Rate</th>
              <th className="px-3 py-2 text-right text-zinc-300">Cumulative</th>
            </tr>
          </thead>
          <tbody>
            {yearlyProjections.map((y, i) => (
              <tr key={y.year} className={`border-b border-zinc-700 ${i % 2 === 0 ? 'bg-zinc-800/30' : ''}`}>
                <td className="px-3 py-2 font-medium text-white">Year {y.year}</td>
                <td className="px-3 py-2 text-right text-emerald-400">
                  {symbol} {formatCurrency(y.totalRevenue, currency)}
                </td>
                <td className="px-3 py-2 text-right text-red-400">
                  {symbol} {formatCurrency(y.totalExpenses, currency)}
                </td>
                <td className={`px-3 py-2 text-right font-medium ${y.netIncome >= 0 ? 'text-cyan-400' : 'text-red-400'}`}>
                  {symbol} {formatCurrency(y.netIncome, currency)}
                </td>
                <td className="px-3 py-2 text-right text-zinc-400">{y.occupancyRate.toFixed(1)}%</td>
                <td className="px-3 py-2 text-right text-purple-400">
                  {symbol} {formatCurrency(y.averageNightlyRate, currency)}
                </td>
                <td className={`px-3 py-2 text-right font-bold ${y.cumulativeCashFlow >= 0 ? 'text-purple-400' : 'text-red-400'}`}>
                  {symbol} {formatCurrency(y.cumulativeCashFlow, currency)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default CashFlowChart;
