import { SectionHeader } from '../../../components/ui/SectionHeader';

interface CashFlow {
  year: number;
  amount: number;
}

interface CashFlowInputsProps {
  cashFlows: CashFlow[];
  onCashFlowChange: (index: number, field: keyof CashFlow, value: string) => void;
  onAddCashFlow: () => void;
  onRemoveCashFlow: (index: number) => void;
  currency: string;
}

const currencySymbols = { IDR: 'Rp', USD: '$', AUD: 'A$', EUR: '€' };

export function CashFlowInputs({
  cashFlows,
  onCashFlowChange,
  onAddCashFlow,
  onRemoveCashFlow,
  currency,
}: CashFlowInputsProps) {
  const symbol = currencySymbols[currency as keyof typeof currencySymbols] || currency;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <SectionHeader
          title="Cash Flows"
          icon="💹"
          description={`Enter cash flows for each year (${currency})`}
        />
        <button
          onClick={onAddCashFlow}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors"
        >
          + Add Year
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-slate-200">
              <th className="px-4 py-3 text-left text-slate-700 font-semibold">Year</th>
              <th className="px-4 py-3 text-left text-slate-700 font-semibold">Cash Flow ({symbol})</th>
              <th className="px-4 py-3 text-left text-slate-700 font-semibold">Cumulative</th>
              <th className="px-4 py-3 text-center text-slate-700 font-semibold">Action</th>
            </tr>
          </thead>
          <tbody>
            {cashFlows.map((cf, idx) => {
              const cumulative = cashFlows.slice(0, idx + 1).reduce((sum, c) => sum + c.amount, 0);
              return (
                <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-semibold text-slate-900">{cf.year}</td>
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      value={cf.amount}
                      onChange={(e) => onCashFlowChange(idx, 'amount', e.target.value)}
                      className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-medium text-slate-900"
                      placeholder="0"
                    />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={`font-semibold ${cumulative >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {symbol} {cumulative.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {cashFlows.length > 1 && (
                      <button
                        onClick={() => onRemoveCashFlow(idx)}
                        className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
                      >
                        Remove
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-slate-600 mt-4">
        <span className="font-medium text-slate-700">💡 Tip:</span> Negative cash flows are outflows (investments), positive are inflows (returns).
      </p>
    </div>
  );
}
