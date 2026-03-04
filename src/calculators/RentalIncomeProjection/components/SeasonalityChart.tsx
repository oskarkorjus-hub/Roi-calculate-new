import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, ComposedChart } from 'recharts';
import { formatCurrency } from '../../../utils/numberParsing';
import type { MonthlyProjection } from '../index';

interface Props {
  monthlyProjections: MonthlyProjection[];
  symbol: string;
  currency: 'IDR' | 'USD' | 'AUD' | 'EUR' | 'GBP';
}

export function SeasonalityChart({ monthlyProjections, symbol, currency }: Props) {
  const chartData = useMemo(() => {
    return monthlyProjections.map(m => ({
      month: m.month,
      revenue: m.grossRevenue,
      rate: m.nightlyRate,
      occupancy: m.occupancyRate,
      netIncome: m.netIncome,
      seasonType: m.seasonType,
    }));
  }, [monthlyProjections]);

  const getSeasonColor = (season: string) => {
    switch (season) {
      case 'peak': return '#10b981'; // emerald
      case 'low': return '#f59e0b'; // amber
      default: return '#6366f1'; // indigo
    }
  };

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
            <p className="text-purple-400">
              Rate: {symbol} {formatCurrency(data.rate, currency)}/night
            </p>
            <p className="text-cyan-400">
              Occupancy: {data.occupancy.toFixed(1)}%
            </p>
            <p className={data.netIncome >= 0 ? 'text-emerald-400' : 'text-red-400'}>
              Net: {symbol} {formatCurrency(data.netIncome, currency)}
            </p>
            <p className="text-zinc-400 text-xs mt-1">
              Season: <span className="capitalize">{data.seasonType}</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="mt-6 space-y-6">
      {/* Revenue by Month */}
      <div className="bg-zinc-800 rounded-xl p-4 border border-zinc-700">
        <h4 className="text-sm font-bold text-white mb-4">Monthly Revenue & Rate</h4>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} />
              <YAxis
                yAxisId="left"
                stroke="#9ca3af"
                fontSize={12}
                tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke="#9ca3af"
                fontSize={12}
                tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
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
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="rate"
                name="Nightly Rate"
                stroke="#a855f7"
                strokeWidth={2}
                dot={{ fill: '#a855f7', strokeWidth: 2 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Occupancy by Month */}
      <div className="bg-zinc-800 rounded-xl p-4 border border-zinc-700">
        <h4 className="text-sm font-bold text-white mb-4">Monthly Occupancy Rate</h4>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} />
              <YAxis stroke="#9ca3af" fontSize={12} tickFormatter={(value) => `${value}%`} domain={[0, 100]} />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="occupancy"
                name="Occupancy"
                fill="#06b6d4"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Season Legend */}
      <div className="flex items-center justify-center gap-6 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-emerald-500"></div>
          <span className="text-zinc-400">Peak Season</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-indigo-500"></div>
          <span className="text-zinc-400">Shoulder Season</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-amber-500"></div>
          <span className="text-zinc-400">Low Season</span>
        </div>
      </div>

      {/* Monthly Data Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="bg-zinc-700">
            <tr>
              <th className="px-3 py-2 text-left text-zinc-300">Month</th>
              <th className="px-3 py-2 text-center text-zinc-300">Season</th>
              <th className="px-3 py-2 text-right text-zinc-300">Rate</th>
              <th className="px-3 py-2 text-right text-zinc-300">Occupancy</th>
              <th className="px-3 py-2 text-right text-zinc-300">Revenue</th>
              <th className="px-3 py-2 text-right text-zinc-300">Net Income</th>
            </tr>
          </thead>
          <tbody>
            {monthlyProjections.map((m, i) => (
              <tr key={m.month} className={`border-b border-zinc-700 ${i % 2 === 0 ? 'bg-zinc-800/30' : ''}`}>
                <td className="px-3 py-2 font-medium text-white">{m.month}</td>
                <td className="px-3 py-2 text-center">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    m.seasonType === 'peak' ? 'bg-emerald-500/20 text-emerald-400' :
                    m.seasonType === 'low' ? 'bg-amber-500/20 text-amber-400' :
                    'bg-indigo-500/20 text-indigo-400'
                  }`}>
                    {m.seasonType}
                  </span>
                </td>
                <td className="px-3 py-2 text-right text-purple-400">{symbol} {formatCurrency(m.nightlyRate, currency)}</td>
                <td className="px-3 py-2 text-right text-cyan-400">{m.occupancyRate.toFixed(1)}%</td>
                <td className="px-3 py-2 text-right text-zinc-300">{symbol} {formatCurrency(m.grossRevenue, currency)}</td>
                <td className={`px-3 py-2 text-right font-medium ${m.netIncome >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {symbol} {formatCurrency(m.netIncome, currency)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default SeasonalityChart;
