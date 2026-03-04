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
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
      <div className="mb-6 flex items-center justify-between border-b border-zinc-800 pb-4">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-emerald-400">account_balance</span>
          <h2 className="text-xl font-bold text-white">Cash Flows</h2>
        </div>
        <button
          onClick={onAddCashFlow}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl text-sm font-bold hover:bg-emerald-500/20 transition-all"
        >
          <span className="material-symbols-outlined text-lg">add</span>
          Add Year
        </button>
      </div>

      <p className="text-sm text-zinc-400 mb-4">
        Enter cash flows for each year ({currency})
      </p>

      <div className="overflow-x-auto">
        <table className="w-full text-sm border-separate border-spacing-0">
          <thead>
            <tr className="border-b border-zinc-700 bg-zinc-800">
              <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-300 uppercase tracking-wide rounded-tl-lg">Year</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-300 uppercase tracking-wide">Cash Flow ({symbol})</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-zinc-300 uppercase tracking-wide">Cumulative</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-zinc-300 uppercase tracking-wide rounded-tr-lg">Action</th>
            </tr>
          </thead>
          <tbody>
            {cashFlows.map((cf, idx) => {
              const cumulative = cashFlows.slice(0, idx + 1).reduce((sum, c) => sum + c.amount, 0);
              return (
                <tr key={idx} className="group hover:bg-zinc-800/50 transition-colors border-b border-zinc-800/50">
                  <td className="px-4 py-3">
                    <span className="font-bold text-white tabular-nums">{cf.year}</span>
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      value={cf.amount}
                      onChange={(e) => onCashFlowChange(idx, 'amount', e.target.value)}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl px-4 py-3 text-[15px] font-bold text-white placeholder:text-zinc-500 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all tabular-nums"
                      placeholder="0"
                    />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={`font-bold tabular-nums ${cumulative >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {symbol} {cumulative.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {cashFlows.length > 1 && (
                      <button
                        onClick={() => onRemoveCashFlow(idx)}
                        className="px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-xl transition-colors font-bold"
                      >
                        <span className="material-symbols-outlined text-lg">delete</span>
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-4 p-4 bg-zinc-800/50 rounded-xl border border-zinc-700/50">
        <div className="flex items-start gap-2">
          <span className="material-symbols-outlined text-zinc-500 text-lg">lightbulb</span>
          <p className="text-xs text-zinc-500">
            <span className="font-bold text-zinc-400">Tip:</span> Negative cash flows are outflows (investments), positive are inflows (returns).
          </p>
        </div>
      </div>
    </div>
  );
}
