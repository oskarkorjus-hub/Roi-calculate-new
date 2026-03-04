import { formatCurrency } from '../../../utils/numberParsing';
import type { YearlyTaxProjection } from '../index';

interface Props {
  projections: YearlyTaxProjection[];
  symbol: string;
  currency: 'IDR' | 'USD' | 'AUD' | 'EUR' | 'GBP';
}

export function TaxProjectionTable({ projections, symbol, currency }: Props) {
  if (projections.length === 0) return null;

  const totalTaxPaid = projections[projections.length - 1]?.cumulativeTaxPaid || 0;
  const totalNetIncome = projections.reduce((sum, p) => sum + p.netIncome, 0);

  return (
    <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
      <div className="mb-6 flex items-center justify-between border-b border-zinc-800 pb-4">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-red-400">calendar_month</span>
          <h3 className="text-xl font-bold text-white">Year-by-Year Tax Projection</h3>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-red-500/50"></span>
            <span className="text-zinc-400">Tax Liability</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-emerald-500/50"></span>
            <span className="text-zinc-400">Net Income</span>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="bg-zinc-800 border-b border-zinc-700">
            <tr>
              <th className="px-3 py-3 text-left font-semibold text-zinc-300 whitespace-nowrap">Year</th>
              <th className="px-3 py-3 text-right font-semibold text-zinc-300 whitespace-nowrap">Property Value</th>
              <th className="px-3 py-3 text-right font-semibold text-zinc-300 whitespace-nowrap">Acc. Depreciation</th>
              <th className="px-3 py-3 text-right font-semibold text-zinc-300 whitespace-nowrap">Adjusted Basis</th>
              <th className="px-3 py-3 text-right font-semibold text-zinc-300 whitespace-nowrap">Gross Income</th>
              <th className="px-3 py-3 text-right font-semibold text-zinc-300 whitespace-nowrap">Deductions</th>
              <th className="px-3 py-3 text-right font-semibold text-zinc-300 whitespace-nowrap">Taxable Income</th>
              <th className="px-3 py-3 text-right font-semibold text-zinc-300 whitespace-nowrap">Annual Tax</th>
              <th className="px-3 py-3 text-right font-semibold text-zinc-300 whitespace-nowrap">Net Income</th>
              <th className="px-3 py-3 text-right font-semibold text-zinc-300 whitespace-nowrap">Cumulative Tax</th>
            </tr>
          </thead>
          <tbody>
            {projections.map((projection, index) => (
              <tr
                key={projection.year}
                className={`border-b border-zinc-800 hover:bg-zinc-800/50 transition-colors ${
                  index === projections.length - 1 ? 'bg-zinc-800/30' : ''
                }`}
              >
                <td className="px-3 py-3 font-medium text-white">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-zinc-700 flex items-center justify-center text-[10px] font-bold">
                      {projection.year}
                    </span>
                    Year {projection.year}
                  </div>
                </td>
                <td className="px-3 py-3 text-right text-zinc-400 tabular-nums">
                  {symbol} {formatCurrency(projection.propertyValue, currency)}
                </td>
                <td className="px-3 py-3 text-right text-cyan-400 tabular-nums">
                  {symbol} {formatCurrency(projection.accumulatedDepreciation, currency)}
                </td>
                <td className="px-3 py-3 text-right text-zinc-300 tabular-nums">
                  {symbol} {formatCurrency(projection.adjustedBasis, currency)}
                </td>
                <td className="px-3 py-3 text-right text-emerald-400 tabular-nums">
                  {symbol} {formatCurrency(projection.grossIncome, currency)}
                </td>
                <td className="px-3 py-3 text-right text-blue-400 tabular-nums">
                  {symbol} {formatCurrency(projection.totalDeductions, currency)}
                </td>
                <td className="px-3 py-3 text-right text-yellow-400 tabular-nums">
                  {symbol} {formatCurrency(projection.taxableIncome, currency)}
                </td>
                <td className="px-3 py-3 text-right text-red-400 font-medium tabular-nums">
                  {symbol} {formatCurrency(projection.annualTaxLiability, currency)}
                </td>
                <td className="px-3 py-3 text-right text-emerald-400 font-medium tabular-nums">
                  {symbol} {formatCurrency(projection.netIncome, currency)}
                </td>
                <td className="px-3 py-3 text-right text-red-400 tabular-nums">
                  {symbol} {formatCurrency(projection.cumulativeTaxPaid, currency)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-zinc-800 border-t-2 border-zinc-600">
            <tr>
              <td colSpan={7} className="px-3 py-3 font-bold text-white">
                Total Over {projections.length} Years
              </td>
              <td className="px-3 py-3 text-right text-red-400 font-bold tabular-nums">
                {symbol} {formatCurrency(totalTaxPaid, currency)}
              </td>
              <td className="px-3 py-3 text-right text-emerald-400 font-bold tabular-nums">
                {symbol} {formatCurrency(totalNetIncome, currency)}
              </td>
              <td className="px-3 py-3"></td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-zinc-800">
        <div className="bg-zinc-800 rounded-lg p-4">
          <p className="text-xs text-zinc-400 uppercase tracking-wider mb-1">Total Tax Paid</p>
          <p className="text-lg font-bold text-red-400">
            {symbol} {formatCurrency(totalTaxPaid, currency)}
          </p>
        </div>
        <div className="bg-zinc-800 rounded-lg p-4">
          <p className="text-xs text-zinc-400 uppercase tracking-wider mb-1">Total Net Income</p>
          <p className="text-lg font-bold text-emerald-400">
            {symbol} {formatCurrency(totalNetIncome, currency)}
          </p>
        </div>
        <div className="bg-zinc-800 rounded-lg p-4">
          <p className="text-xs text-zinc-400 uppercase tracking-wider mb-1">Avg Annual Tax</p>
          <p className="text-lg font-bold text-red-400">
            {symbol} {formatCurrency(totalTaxPaid / projections.length, currency)}
          </p>
        </div>
        <div className="bg-zinc-800 rounded-lg p-4">
          <p className="text-xs text-zinc-400 uppercase tracking-wider mb-1">Avg Net Income</p>
          <p className="text-lg font-bold text-emerald-400">
            {symbol} {formatCurrency(totalNetIncome / projections.length, currency)}
          </p>
        </div>
      </div>
    </div>
  );
}

export default TaxProjectionTable;
