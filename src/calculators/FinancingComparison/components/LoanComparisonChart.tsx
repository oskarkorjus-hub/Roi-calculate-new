import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts';
import { formatCurrency } from '../../../utils/numberParsing';
import type { LoanResult } from '../index';

interface Props {
  loanResults: LoanResult[];
  symbol: string;
  currency: 'IDR' | 'USD' | 'AUD' | 'EUR' | 'GBP';
}

const lenderColors: Record<string, string> = {
  'bank': '#10b981',
  'developer': '#06b6d4',
  'private': '#a855f7',
  'hard-money': '#f97316',
};

export function LoanComparisonChart({ loanResults, symbol, currency }: Props) {
  if (loanResults.length === 0) {
    return (
      <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 p-6">
        <p className="text-zinc-500 text-center">Enable at least one loan to see comparison</p>
      </div>
    );
  }

  // Monthly Payment Comparison Data
  const monthlyPaymentData = loanResults.map(result => ({
    name: result.name,
    value: result.monthlyPayment,
    lenderType: result.lenderType,
    isWinner: result.isWinner,
  }));

  // Total Cost Comparison Data
  const totalCostData = loanResults.map(result => ({
    name: result.name,
    principal: result.amount,
    interest: result.totalInterest,
    fees: result.originationFee,
    lenderType: result.lenderType,
    isWinner: result.isWinner,
  }));

  // Interest Rate Comparison
  const interestData = loanResults.map(result => ({
    name: result.name,
    value: result.totalInterest,
    lenderType: result.lenderType,
    isWinner: result.isWinner,
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-3 shadow-lg">
          <p className="text-white font-medium mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {symbol} {formatCurrency(entry.value, currency)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Monthly Payment Comparison */}
      <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 p-4">
        <h4 className="text-sm font-medium text-zinc-300 mb-4">Monthly Payment Comparison</h4>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyPaymentData} layout="vertical" margin={{ left: 20, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" horizontal={true} vertical={false} />
              <XAxis
                type="number"
                tick={{ fill: '#9ca3af', fontSize: 11 }}
                tickFormatter={(value) => `${symbol}${formatCurrency(value, currency)}`}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fill: '#9ca3af', fontSize: 11 }}
                width={100}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {monthlyPaymentData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={lenderColors[entry.lenderType]}
                    stroke={entry.isWinner ? '#10b981' : 'transparent'}
                    strokeWidth={entry.isWinner ? 2 : 0}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Total Interest Paid */}
      <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 p-4">
        <h4 className="text-sm font-medium text-zinc-300 mb-4">Total Interest Paid Over Loan Term</h4>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={interestData} layout="vertical" margin={{ left: 20, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" horizontal={true} vertical={false} />
              <XAxis
                type="number"
                tick={{ fill: '#9ca3af', fontSize: 11 }}
                tickFormatter={(value) => `${symbol}${formatCurrency(value, currency)}`}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fill: '#9ca3af', fontSize: 11 }}
                width={100}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" fill="#ef4444" radius={[0, 4, 4, 0]}>
                {interestData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill="#ef4444"
                    opacity={entry.isWinner ? 1 : 0.6}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Total Cost Breakdown (Stacked) */}
      <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 p-4">
        <h4 className="text-sm font-medium text-zinc-300 mb-4">Total Cost Breakdown</h4>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={totalCostData} margin={{ left: 20, right: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fill: '#9ca3af', fontSize: 11 }}
              />
              <YAxis
                tick={{ fill: '#9ca3af', fontSize: 11 }}
                tickFormatter={(value) => `${symbol}${formatCurrency(value, currency)}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ paddingTop: '10px' }}
                formatter={(value) => <span className="text-zinc-300 text-xs">{value}</span>}
              />
              <Bar dataKey="principal" stackId="a" fill="#3b82f6" name="Principal" radius={[0, 0, 0, 0]} />
              <Bar dataKey="interest" stackId="a" fill="#ef4444" name="Interest" radius={[0, 0, 0, 0]} />
              <Bar dataKey="fees" stackId="a" fill="#f59e0b" name="Fees" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Winner Summary */}
      {loanResults.some(r => r.isWinner) && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🏆</span>
            <div>
              <p className="text-emerald-400 font-bold">
                {loanResults.find(r => r.isWinner)?.name} is the Winner!
              </p>
              <p className="text-sm text-zinc-400">
                Lowest total cost of borrowing at {symbol} {formatCurrency(
                  loanResults.find(r => r.isWinner)?.totalCostOfBorrowing || 0,
                  currency
                )}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LoanComparisonChart;
