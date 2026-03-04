import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';

export interface TimelineDataPoint {
  month: number;
  monthLabel: string;
  cumulativeCashFlow: number;
  isBreakEven: boolean;
}

interface TimelineAnalysisProps {
  data: TimelineDataPoint[];
  title?: string;
  showBreakEvenLine?: boolean;
}

export function TimelineAnalysis({
  data,
  title = 'Cumulative Cash Flow Timeline',
  showBreakEvenLine = true,
}: TimelineAnalysisProps) {
  const breakEvenMonth = useMemo(() => {
    for (let i = 0; i < data.length; i++) {
      if (data[i].cumulativeCashFlow >= 0) {
        return data[i].month;
      }
    }
    return null;
  }, [data]);

  const formatValue = (value: number) => {
    if (Math.abs(value) >= 1_000_000) {
      return (value / 1_000_000).toFixed(1) + 'M';
    }
    if (Math.abs(value) >= 1_000) {
      return (value / 1_000).toFixed(0) + 'K';
    }
    return value.toFixed(0);
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-bold text-gray-900">{title}</h3>
        {breakEvenMonth !== null && (
          <p className="text-sm text-green-600 font-medium">
            ✓ Break-even at month {breakEvenMonth}
          </p>
        )}
        {breakEvenMonth === null && (
          <p className="text-sm text-orange-600 font-medium">
            ⚠ Does not reach break-even within projection period
          </p>
        )}
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="monthLabel"
              stroke="#9ca3af"
              style={{ fontSize: '0.75rem' }}
            />
            <YAxis
              stroke="#9ca3af"
              style={{ fontSize: '0.75rem' }}
              tickFormatter={formatValue}
            />
            <Tooltip
              formatter={(value) => formatValue(value as number)}
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '0.5rem',
              }}
            />
            <Legend />

            {/* Break-even reference line */}
            {showBreakEvenLine && (
              <ReferenceLine
                y={0}
                stroke="#d1d5db"
                strokeDasharray="3 3"
                label={{ value: 'Break-even', fill: '#9ca3af', fontSize: 12 }}
              />
            )}

            <Line
              type="monotone"
              dataKey="cumulativeCashFlow"
              stroke="#4f46e5"
              strokeWidth={2}
              dot={false}
              name="Cumulative Cash Flow"
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-200">
          <div className="text-xs font-medium text-indigo-700 mb-1">Maximum Negative</div>
          <div className="text-2xl font-bold text-indigo-900">
            {formatValue(Math.min(...data.map(d => d.cumulativeCashFlow)))}
          </div>
        </div>

        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <div className="text-xs font-medium text-green-700 mb-1">Final Cash Flow</div>
          <div className="text-2xl font-bold text-green-900">
            {formatValue(data[data.length - 1].cumulativeCashFlow)}
          </div>
        </div>
      </div>
    </div>
  );
}
