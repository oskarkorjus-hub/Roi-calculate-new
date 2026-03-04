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
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="text-sm text-gray-600 font-medium">Total Net Cash Flow</div>
          <div className="text-3xl font-bold text-green-600">
            {symbol} {formatCurrency(lastYear.cumulativeCashFlow, currency)}
          </div>
          <div className="text-xs text-gray-500 mt-2">Over {schedule.length} years</div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="text-sm text-gray-600 font-medium">Average Annual Cash Flow</div>
          <div className="text-3xl font-bold text-blue-600">
            {symbol} {formatCurrency(avgCashFlow, currency)}
          </div>
          <div className="text-xs text-gray-500 mt-2">Per year</div>
        </div>
      </div>

      {/* Yearly Projection Table */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Year-by-Year Projection</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-gray-100 border-b border-gray-300">
              <tr>
                <th className="px-3 py-2 text-left text-gray-700 font-semibold">Year</th>
                <th className="px-3 py-2 text-right text-gray-700 font-semibold">Gross Income</th>
                <th className="px-3 py-2 text-right text-gray-700 font-semibold">Vacancy Loss</th>
                <th className="px-3 py-2 text-right text-gray-700 font-semibold">Eff. Income</th>
                <th className="px-3 py-2 text-right text-gray-700 font-semibold">Expenses</th>
                <th className="px-3 py-2 text-right text-gray-700 font-semibold">Net Cash Flow</th>
                <th className="px-3 py-2 text-right text-gray-700 font-semibold">Cumulative</th>
              </tr>
            </thead>
            <tbody>
              {schedule.map((row, idx) => (
                <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="px-3 py-2 text-gray-700 font-medium">Y{row.year}</td>
                  <td className="px-3 py-2 text-right text-gray-700">
                    {formatCurrency(row.grossIncome, currency)}
                  </td>
                  <td className="px-3 py-2 text-right text-red-600 font-medium">
                    -{formatCurrency(row.vacancyLoss, currency)}
                  </td>
                  <td className="px-3 py-2 text-right text-gray-700">
                    {formatCurrency(row.effectiveIncome, currency)}
                  </td>
                  <td className="px-3 py-2 text-right text-red-600">
                    -{formatCurrency(row.totalExpenses, currency)}
                  </td>
                  <td className={`px-3 py-2 text-right font-bold ${row.netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {symbol} {formatCurrency(row.netCashFlow, currency)}
                  </td>
                  <td className="px-3 py-2 text-right font-bold text-blue-600">
                    {symbol} {formatCurrency(row.cumulativeCashFlow, currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Insights */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold text-blue-900 mb-3">Projection Insights</h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li>✓ <strong>Final Year Cash Flow</strong>: {symbol} {formatCurrency(schedule[schedule.length - 1].netCashFlow, currency)}</li>
          <li>✓ <strong>Total Cumulative</strong>: {symbol} {formatCurrency(lastYear.cumulativeCashFlow, currency)}</li>
          <li>✓ <strong>Average Annual</strong>: {symbol} {formatCurrency(avgCashFlow, currency)}</li>
          {lastYear.cumulativeCashFlow > 0 && (
            <li>✓ <strong>ROI</strong>: {((lastYear.cumulativeCashFlow / (schedule[0].effectiveIncome * 12)) * 100).toFixed(1)}% over {schedule.length} years</li>
          )}
        </ul>
      </div>
    </div>
  );
}
