import { formatCurrency } from '../../../utils/numberParsing';

interface ScheduleEntry {
  month: number;
  payment: number;
  principal: number;
  interest: number;
  originationFee: number;
  propertyTax: number;
  insurance: number;
  pmi: number;
  hoa: number;
  totalPayment: number;
  balance: number;
}

interface AmortizationTableProps {
  schedule: ScheduleEntry[];
  currency: string;
  symbol: string;
  showAdvanced: boolean;
  pmiRequired: boolean;
  hoaFeesMonthly: number;
}

export function AmortizationTable({
  schedule,
  currency,
  symbol,
  showAdvanced,
  pmiRequired,
  hoaFeesMonthly,
}: AmortizationTableProps) {
  return (
    <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
      <div className="mb-6 flex items-center border-b border-zinc-800 pb-4">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-emerald-400">table_chart</span>
          <h3 className="text-xl font-bold text-white">Amortization Schedule (Yearly)</h3>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="bg-zinc-800 border-b border-zinc-700">
            <tr>
              <th className="px-3 py-2 text-left text-zinc-300 font-semibold">Year</th>
              <th className="px-3 py-2 text-right text-zinc-300 font-semibold">P&I Payment</th>
              <th className="px-3 py-2 text-right text-zinc-300 font-semibold">Principal</th>
              <th className="px-3 py-2 text-right text-zinc-300 font-semibold">Interest</th>
              {showAdvanced && (
                <>
                  <th className="px-3 py-2 text-right text-zinc-300 font-semibold">Property Tax</th>
                  <th className="px-3 py-2 text-right text-zinc-300 font-semibold">Insurance</th>
                  {pmiRequired && <th className="px-3 py-2 text-right text-zinc-300 font-semibold">PMI</th>}
                  {hoaFeesMonthly > 0 && <th className="px-3 py-2 text-right text-zinc-300 font-semibold">HOA</th>}
                  <th className="px-3 py-2 text-right text-zinc-300 font-semibold">Total Monthly</th>
                </>
              )}
              <th className="px-3 py-2 text-right text-zinc-300 font-semibold">Balance</th>
            </tr>
          </thead>
          <tbody>
            {schedule.map(row => (
              <tr key={row.month} className="border-b border-zinc-800 hover:bg-zinc-800/50">
                <td className="px-3 py-2 text-zinc-300 font-medium">{row.month / 12}</td>
                <td className="px-3 py-2 text-right text-zinc-300">
                  {symbol} {formatCurrency(row.payment * 12, currency)}
                </td>
                <td className="px-3 py-2 text-right text-emerald-400 font-medium">
                  {symbol} {formatCurrency(row.principal * 12, currency)}
                </td>
                <td className="px-3 py-2 text-right text-red-400 font-medium">
                  {symbol} {formatCurrency(row.interest * 12, currency)}
                </td>
                {showAdvanced && (
                  <>
                    <td className="px-3 py-2 text-right text-zinc-300">
                      {symbol} {formatCurrency(row.propertyTax * 12, currency)}
                    </td>
                    <td className="px-3 py-2 text-right text-zinc-300">
                      {symbol} {formatCurrency(row.insurance * 12, currency)}
                    </td>
                    {pmiRequired && (
                      <td className="px-3 py-2 text-right text-zinc-300">
                        {symbol} {formatCurrency(row.pmi * 12, currency)}
                      </td>
                    )}
                    {hoaFeesMonthly > 0 && (
                      <td className="px-3 py-2 text-right text-zinc-300">
                        {symbol} {formatCurrency(row.hoa * 12, currency)}
                      </td>
                    )}
                    <td className="px-3 py-2 text-right font-bold text-purple-400">
                      {symbol} {formatCurrency(row.totalPayment * 12, currency)}
                    </td>
                  </>
                )}
                <td className="px-3 py-2 text-right font-medium text-white">
                  {symbol} {formatCurrency(row.balance, currency)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
