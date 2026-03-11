import { formatCurrency } from '../../../utils/numberParsing';
import type { LoanResult, AmortizationEntry } from '../index';

interface Props {
  result?: LoanResult;
  symbol: string;
  currency: 'IDR' | 'USD' | 'AUD' | 'EUR' | 'GBP';
}

const lenderColors: Record<string, { bg: string; border: string; text: string }> = {
  'bank': { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400' },
  'developer': { bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', text: 'text-cyan-400' },
  'private': { bg: 'bg-purple-500/10', border: 'border-purple-500/30', text: 'text-purple-400' },
  'hard-money': { bg: 'bg-orange-500/10', border: 'border-orange-500/30', text: 'text-orange-400' },
};

export function AmortizationTable({ result, symbol, currency }: Props) {
  if (!result) {
    return (
      <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 p-6">
        <p className="text-zinc-500 text-center">Select a loan to see amortization schedule</p>
      </div>
    );
  }

  const colors = lenderColors[result.lenderType];
  const schedule = result.amortizationSchedule;

  return (
    <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 overflow-hidden">
      {/* Header */}
      <div className={`p-4 border-b border-zinc-800 ${colors.bg}`}>
        <div className="flex items-center justify-between">
          <div>
            <h4 className={`text-sm font-medium ${colors.text}`}>{result.name}</h4>
            <p className="text-xs text-zinc-400 mt-1">{result.term} year term at {result.interestRate}%</p>
          </div>
          {result.isWinner && (
            <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold rounded-full uppercase">
              Winner
            </span>
          )}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="p-4 border-b border-zinc-800 bg-zinc-800/30">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <p className="text-[10px] text-zinc-500 uppercase">Principal</p>
            <p className="text-sm font-bold text-white">
              {symbol} {formatCurrency(result.amount, currency)}
            </p>
          </div>
          <div>
            <p className="text-[10px] text-zinc-500 uppercase">Total Interest</p>
            <p className="text-sm font-bold text-red-400">
              {symbol} {formatCurrency(result.totalInterest, currency)}
            </p>
          </div>
          <div>
            <p className="text-[10px] text-zinc-500 uppercase">Monthly Payment</p>
            <p className="text-sm font-bold text-zinc-300">
              {symbol} {formatCurrency(result.monthlyPayment, currency)}
            </p>
          </div>
          <div>
            <p className="text-[10px] text-zinc-500 uppercase">Total Cost</p>
            <p className="text-sm font-bold text-zinc-300">
              {symbol} {formatCurrency(result.totalCostOfBorrowing, currency)}
            </p>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto max-h-96">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-zinc-800">
            <tr>
              <th className="text-left p-3 text-xs text-zinc-400 font-medium">Year</th>
              <th className="text-right p-3 text-xs text-zinc-400 font-medium">Payment</th>
              <th className="text-right p-3 text-xs text-zinc-400 font-medium">Principal</th>
              <th className="text-right p-3 text-xs text-zinc-400 font-medium">Interest</th>
              <th className="text-right p-3 text-xs text-zinc-400 font-medium">Balance</th>
              <th className="text-right p-3 text-xs text-zinc-400 font-medium">Cumulative Interest</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {schedule.map((row, index) => {
              const isInterestOnly = row.principal === 0 && row.interest > 0;
              const progressPercent = ((result.amount - row.balance) / result.amount) * 100;

              return (
                <tr
                  key={index}
                  className={`hover:bg-zinc-800/50 ${isInterestOnly ? 'bg-orange-500/5' : ''}`}
                >
                  <td className="p-3 text-zinc-300">
                    <div className="flex items-center gap-2">
                      <span>Year {row.year}</span>
                      {isInterestOnly && (
                        <span className="text-[10px] text-orange-400 uppercase px-1.5 py-0.5 bg-orange-500/10 rounded">I/O</span>
                      )}
                    </div>
                  </td>
                  <td className="p-3 text-right text-zinc-300">
                    {symbol} {formatCurrency(row.payment, currency)}
                  </td>
                  <td className="p-3 text-right text-emerald-400">
                    {symbol} {formatCurrency(row.principal, currency)}
                  </td>
                  <td className="p-3 text-right text-red-400">
                    {symbol} {formatCurrency(row.interest, currency)}
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <span className="text-zinc-300 font-medium">
                        {symbol} {formatCurrency(row.balance, currency)}
                      </span>
                      <div className="w-16 h-1.5 bg-zinc-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 transition-all"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="p-3 text-right text-zinc-400">
                    {symbol} {formatCurrency(row.cumulativeInterest, currency)}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot className="bg-zinc-900 sticky bottom-0 border-t border-zinc-700">
            <tr>
              <td className="p-3 text-zinc-300 font-bold">Total</td>
              <td className="p-3 text-right text-zinc-300 font-bold">
                {symbol} {formatCurrency(result.totalPayment, currency)}
              </td>
              <td className="p-3 text-right text-emerald-400 font-bold">
                {symbol} {formatCurrency(result.amount, currency)}
              </td>
              <td className="p-3 text-right text-red-400 font-bold">
                {symbol} {formatCurrency(result.totalInterest, currency)}
              </td>
              <td className="p-3 text-right text-zinc-300 font-bold">
                {symbol} 0
              </td>
              <td className="p-3 text-right text-zinc-400 font-bold">
                {symbol} {formatCurrency(result.totalInterest, currency)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Interest vs Principal Progress */}
      <div className="p-4 border-t border-zinc-800">
        <p className="text-xs text-zinc-400 mb-2">Interest to Principal Ratio</p>
        <div className="flex items-center gap-3">
          <div className="flex-1 h-4 bg-zinc-800 rounded-full overflow-hidden flex">
            <div
              className="h-full bg-emerald-500 transition-all"
              style={{
                width: `${(result.amount / (result.amount + result.totalInterest)) * 100}%`
              }}
            />
            <div
              className="h-full bg-red-500 transition-all"
              style={{
                width: `${(result.totalInterest / (result.amount + result.totalInterest)) * 100}%`
              }}
            />
          </div>
          <div className="text-xs text-zinc-400 whitespace-nowrap">
            {((result.totalInterest / result.amount) * 100).toFixed(1)}% interest
          </div>
        </div>
        <div className="flex justify-between text-[10px] mt-1">
          <span className="text-emerald-400">Principal: {symbol} {formatCurrency(result.amount, currency)}</span>
          <span className="text-red-400">Interest: {symbol} {formatCurrency(result.totalInterest, currency)}</span>
        </div>
      </div>
    </div>
  );
}

export default AmortizationTable;
