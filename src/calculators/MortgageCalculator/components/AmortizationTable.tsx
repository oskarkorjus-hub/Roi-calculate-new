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
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
      <h3 className="text-xl font-bold text-gray-900 mb-6">Amortization Schedule (Yearly)</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="bg-gray-100 border-b border-gray-300">
            <tr>
              <th className="px-3 py-2 text-left text-gray-700 font-semibold">Year</th>
              <th className="px-3 py-2 text-right text-gray-700 font-semibold">P&I Payment</th>
              <th className="px-3 py-2 text-right text-gray-700 font-semibold">Principal</th>
              <th className="px-3 py-2 text-right text-gray-700 font-semibold">Interest</th>
              {showAdvanced && (
                <>
                  <th className="px-3 py-2 text-right text-gray-700 font-semibold">Property Tax</th>
                  <th className="px-3 py-2 text-right text-gray-700 font-semibold">Insurance</th>
                  {pmiRequired && <th className="px-3 py-2 text-right text-gray-700 font-semibold">PMI</th>}
                  {hoaFeesMonthly > 0 && <th className="px-3 py-2 text-right text-gray-700 font-semibold">HOA</th>}
                  <th className="px-3 py-2 text-right text-gray-700 font-semibold">Total Monthly</th>
                </>
              )}
              <th className="px-3 py-2 text-right text-gray-700 font-semibold">Balance</th>
            </tr>
          </thead>
          <tbody>
            {schedule.map(row => (
              <tr key={row.month} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="px-3 py-2 text-gray-700 font-medium">{row.month / 12}</td>
                <td className="px-3 py-2 text-right text-gray-700">
                  {symbol} {formatCurrency(row.payment * 12, currency)}
                </td>
                <td className="px-3 py-2 text-right text-green-600 font-medium">
                  {symbol} {formatCurrency(row.principal * 12, currency)}
                </td>
                <td className="px-3 py-2 text-right text-red-600 font-medium">
                  {symbol} {formatCurrency(row.interest * 12, currency)}
                </td>
                {showAdvanced && (
                  <>
                    <td className="px-3 py-2 text-right text-gray-700">
                      {symbol} {formatCurrency(row.propertyTax * 12, currency)}
                    </td>
                    <td className="px-3 py-2 text-right text-gray-700">
                      {symbol} {formatCurrency(row.insurance * 12, currency)}
                    </td>
                    {pmiRequired && (
                      <td className="px-3 py-2 text-right text-gray-700">
                        {symbol} {formatCurrency(row.pmi * 12, currency)}
                      </td>
                    )}
                    {hoaFeesMonthly > 0 && (
                      <td className="px-3 py-2 text-right text-gray-700">
                        {symbol} {formatCurrency(row.hoa * 12, currency)}
                      </td>
                    )}
                    <td className="px-3 py-2 text-right font-bold text-purple-600">
                      {symbol} {formatCurrency(row.totalPayment * 12, currency)}
                    </td>
                  </>
                )}
                <td className="px-3 py-2 text-right font-medium text-gray-900">
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
