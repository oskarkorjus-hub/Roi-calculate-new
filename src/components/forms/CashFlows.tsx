import type { CashFlowEntry } from '../../types/investment';
import { useState } from 'react';

interface Props {
  entries: CashFlowEntry[];
  symbol: string;
  formatDisplay: (idr: number) => string;
  onAdd: (entry: Omit<CashFlowEntry, 'id'>) => void;
  onRemove: (id: string) => void;
  onUpdate: (id: string, updates: Partial<CashFlowEntry>) => void;
}

const EXAMPLE_CASH_FLOWS = [
  { description: 'Furniture & Fit-out', type: 'outflow' as const, icon: 'chair' },
  { description: 'Annual Rental Income', type: 'inflow' as const, icon: 'payments' },
  { description: 'Property Management', type: 'outflow' as const, icon: 'support_agent' },
  { description: 'Maintenance & Repairs', type: 'outflow' as const, icon: 'build' },
];

export function CashFlows({ entries, symbol, formatDisplay, onAdd, onRemove, onUpdate: _onUpdate }: Props) {
  const [newEntry, setNewEntry] = useState({
    date: '',
    description: '',
    type: 'outflow' as 'inflow' | 'outflow',
    amount: 0
  });
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Reserved for future inline editing
  void _onUpdate;

  const parseInput = (value: string): number => {
    const digits = value.replace(/\D/g, '');
    return parseInt(digits, 10) || 0;
  };

  const formatNumber = (num: number): string => {
    return num.toLocaleString('en-US');
  };

  const handleAdd = () => {
    if (newEntry.date && newEntry.description && newEntry.amount > 0) {
      onAdd(newEntry);
      setNewEntry({ date: '', description: '', type: 'outflow', amount: 0 });
      setIsFormOpen(false);
    }
  };

  const handleQuickAdd = (example: typeof EXAMPLE_CASH_FLOWS[0]) => {
    setNewEntry({
      ...newEntry,
      description: example.description,
      type: example.type,
    });
    setIsFormOpen(true);
  };

  const hasEntries = entries.length > 0;

  return (
    <section className="rounded-xl border border-border-dark bg-background-dark p-6 shadow-sm">
      <div className="mb-6 flex items-center gap-2 border-b border-border-dark pb-4">
        <span className="material-symbols-outlined text-primary">calendar_month</span>
        <h2 className="text-xl font-bold text-white">Additional Cash Flows</h2>
        <span className="text-xs text-text-secondary ml-auto">Optional</span>
      </div>

      {/* Empty State */}
      {!hasEntries && !isFormOpen && (
        <div className="text-center py-6">
          <p className="text-sm text-text-secondary mb-4">
            Track operational costs or rental income during your investment period.
          </p>
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            {EXAMPLE_CASH_FLOWS.map((example) => (
              <button
                key={example.description}
                onClick={() => handleQuickAdd(example)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors text-sm ${
                  example.type === 'inflow'
                    ? 'border-green-500/30 text-green-400 hover:bg-green-500/10'
                    : 'border-border-dark text-text-secondary hover:bg-surface-dark hover:text-white'
                }`}
              >
                <span className="material-symbols-outlined text-base">{example.icon}</span>
                {example.description}
              </button>
            ))}
          </div>
          <button
            onClick={() => setIsFormOpen(true)}
            className="text-primary text-sm hover:underline"
          >
            or add custom entry
          </button>
        </div>
      )}

      {/* Entries List */}
      {hasEntries && (
        <>
          {/* Header */}
          <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-2 text-xs font-semibold text-text-secondary uppercase border-b border-border-dark mb-2">
            <div className="col-span-3">Date</div>
            <div className="col-span-4">Description</div>
            <div className="col-span-2">Type</div>
            <div className="col-span-3 text-right">Amount</div>
          </div>

          <div className="flex flex-col gap-2 mb-4">
            {entries.map((entry) => (
              <div key={entry.id} className="group grid grid-cols-12 gap-3 items-center rounded-lg bg-surface-dark/50 p-3 hover:bg-surface-dark transition-colors">
                <div className="col-span-3 text-sm text-white">{entry.date}</div>
                <div className="col-span-4 text-sm text-white">{entry.description}</div>
                <div className="col-span-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    entry.type === 'inflow' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                  }`}>
                    {entry.type === 'inflow' ? '+' : '-'}
                  </span>
                </div>
                <div className="col-span-3 flex items-center justify-end gap-2">
                  <span className="font-mono text-white text-sm">
                    {symbol} {formatDisplay(entry.amount)}
                  </span>
                  <button
                    onClick={() => onRemove(entry.id)}
                    className="text-text-secondary hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <span className="material-symbols-outlined text-lg">delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* New Entry Form */}
      {(isFormOpen || hasEntries) && (
        <div className="border-t border-border-dark pt-4">
          <div className="grid grid-cols-12 gap-3 items-end">
            <div className="col-span-12 md:col-span-3">
              <label className="block text-xs text-text-secondary mb-1">Date</label>
              <input
                type="date"
                value={newEntry.date}
                onChange={(e) => setNewEntry({ ...newEntry, date: e.target.value })}
                className="w-full rounded-lg bg-surface-dark border border-border-dark px-3 py-2 text-white text-sm focus:border-primary focus:outline-none"
              />
            </div>
            <div className="col-span-12 md:col-span-4">
              <label className="block text-xs text-text-secondary mb-1">Description</label>
              <input
                type="text"
                placeholder="e.g., Furniture, Rental Income"
                value={newEntry.description}
                onChange={(e) => setNewEntry({ ...newEntry, description: e.target.value })}
                className="w-full rounded-lg bg-surface-dark border border-border-dark px-3 py-2 text-white text-sm focus:border-primary focus:outline-none"
              />
            </div>
            <div className="col-span-6 md:col-span-2">
              <label className="block text-xs text-text-secondary mb-1">Type</label>
              <select
                value={newEntry.type}
                onChange={(e) => setNewEntry({ ...newEntry, type: e.target.value as 'inflow' | 'outflow' })}
                className="w-full rounded-lg bg-surface-dark border border-border-dark px-3 py-2 text-white text-sm focus:border-primary focus:outline-none"
              >
                <option value="outflow">Expense (-)</option>
                <option value="inflow">Income (+)</option>
              </select>
            </div>
            <div className="col-span-6 md:col-span-3">
              <label className="block text-xs text-text-secondary mb-1">Amount ({symbol})</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="0"
                  value={newEntry.amount > 0 ? formatNumber(newEntry.amount) : ''}
                  onChange={(e) => setNewEntry({ ...newEntry, amount: parseInput(e.target.value) })}
                  className="flex-1 rounded-lg bg-surface-dark border border-border-dark px-3 py-2 text-white text-sm text-right font-mono focus:border-primary focus:outline-none"
                />
                <button
                  onClick={handleAdd}
                  disabled={!newEntry.date || !newEntry.description || newEntry.amount <= 0}
                  className="px-3 py-2 rounded-lg bg-primary text-background-dark font-bold text-sm hover:bg-[#10d652] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <span className="material-symbols-outlined text-lg">add</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
