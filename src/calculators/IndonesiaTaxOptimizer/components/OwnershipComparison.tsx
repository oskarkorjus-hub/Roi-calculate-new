import { formatCurrency } from '../../../utils/numberParsing';
import type { TaxCalculationResult } from '../index';

type OwnershipType = 'pt' | 'freehold' | 'leasehold';

interface Props {
  result: TaxCalculationResult;
  symbol: string;
  currency: 'IDR' | 'USD' | 'AUD' | 'EUR' | 'GBP';
  currentStructure: OwnershipType;
}

const ownershipInfo = {
  pt: {
    label: 'PT (Company)',
    icon: '🏢',
    pros: ['Deductible expenses', 'Depreciation benefits', 'Business income treatment'],
    cons: ['Corporate tax on gains', 'Administrative overhead', 'PT setup costs'],
  },
  freehold: {
    label: 'Freehold (Individual)',
    icon: '🏠',
    pros: ['Simple ownership', 'No corporate overhead', 'Personal asset protection'],
    cons: ['Higher capital gains rate', 'No expense deductions', 'No depreciation benefit'],
  },
  leasehold: {
    label: 'Leasehold',
    icon: '📋',
    pros: ['Lowest transfer tax (10%)', 'Simple structure', 'Lower entry barriers'],
    cons: ['Limited rights', 'Time-limited ownership', 'Lease renewal risk'],
  },
};

export function OwnershipComparison({ result, symbol, currency, currentStructure }: Props) {
  const structures: { type: OwnershipType; tax: number }[] = [
    { type: 'pt', tax: result.ptTaxLiability },
    { type: 'freehold', tax: result.freeholdTaxLiability },
    { type: 'leasehold', tax: result.leaseholdTaxLiability },
  ];

  const maxTax = Math.max(...structures.map(s => s.tax));
  const minTax = Math.min(...structures.map(s => s.tax));

  return (
    <div className="mt-4 space-y-4">
      {/* Comparison Chart */}
      <div className="bg-zinc-800 rounded-xl p-4">
        <h4 className="text-sm font-bold text-white mb-4">Tax Liability by Ownership Structure</h4>
        <div className="space-y-4">
          {structures.map(({ type, tax }) => {
            const info = ownershipInfo[type];
            const isOptimal = tax === minTax;
            const isCurrent = type === currentStructure;
            const percentage = maxTax > 0 ? (tax / maxTax) * 100 : 0;

            return (
              <div key={type} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{info.icon}</span>
                    <span className="text-sm font-medium text-white">{info.label}</span>
                    {isOptimal && (
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-500/20 text-emerald-400 rounded-full">
                        OPTIMAL
                      </span>
                    )}
                    {isCurrent && !isOptimal && (
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-cyan-500/20 text-cyan-400 rounded-full">
                        CURRENT
                      </span>
                    )}
                    {isCurrent && isOptimal && (
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-500/20 text-emerald-400 rounded-full ml-1">
                        CURRENT
                      </span>
                    )}
                  </div>
                  <span className={`text-sm font-bold tabular-nums ${
                    isOptimal ? 'text-emerald-400' : 'text-zinc-300'
                  }`}>
                    {symbol} {formatCurrency(tax, currency)}
                  </span>
                </div>
                <div className="relative h-3 bg-zinc-700 rounded-full overflow-hidden">
                  <div
                    className={`absolute left-0 top-0 h-full rounded-full transition-all duration-500 ${
                      isOptimal ? 'bg-emerald-500' : isCurrent ? 'bg-cyan-500' : 'bg-zinc-500'
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                {!isOptimal && minTax > 0 && (
                  <p className="text-[10px] text-red-400">
                    +{symbol} {formatCurrency(tax - minTax, currency)} more than optimal
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Detailed Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {structures.map(({ type, tax }) => {
          const info = ownershipInfo[type];
          const isOptimal = tax === minTax;
          const isCurrent = type === currentStructure;

          return (
            <div
              key={type}
              className={`rounded-xl p-4 border transition-all ${
                isOptimal
                  ? 'bg-emerald-500/10 border-emerald-500/30'
                  : isCurrent
                  ? 'bg-cyan-500/10 border-cyan-500/30'
                  : 'bg-zinc-800 border-zinc-700'
              }`}
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">{info.icon}</span>
                <div>
                  <h5 className="font-bold text-white text-sm">{info.label}</h5>
                  <p className={`text-lg font-bold ${isOptimal ? 'text-emerald-400' : 'text-zinc-300'}`}>
                    {symbol} {formatCurrency(tax, currency)}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider mb-1">Advantages</p>
                  <ul className="space-y-1">
                    {info.pros.map((pro, i) => (
                      <li key={i} className="text-[10px] text-zinc-400 flex items-start gap-1.5">
                        <span className="text-emerald-400 mt-0.5">+</span>
                        {pro}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <p className="text-[10px] font-bold text-red-400 uppercase tracking-wider mb-1">Considerations</p>
                  <ul className="space-y-1">
                    {info.cons.map((con, i) => (
                      <li key={i} className="text-[10px] text-zinc-400 flex items-start gap-1.5">
                        <span className="text-red-400 mt-0.5">-</span>
                        {con}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Savings Summary */}
      {currentStructure !== result.optimalStructure && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center">
              <span className="text-2xl">💡</span>
            </div>
            <div>
              <h4 className="font-bold text-amber-400">Potential Tax Savings</h4>
              <p className="text-sm text-zinc-300">
                By switching from <strong>{ownershipInfo[currentStructure].label}</strong> to{' '}
                <strong>{ownershipInfo[result.optimalStructure].label}</strong>, you could save:
              </p>
              <p className="text-2xl font-bold text-amber-400 mt-1">
                {symbol} {formatCurrency(result.taxSavingsFromOptimal, currency)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default OwnershipComparison;
