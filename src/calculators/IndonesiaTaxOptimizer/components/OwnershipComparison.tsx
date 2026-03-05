import { formatCurrency } from '../../../utils/numberParsing';
import type { TaxCalculationResult } from '../index';

type OwnershipType = 'pt' | 'freehold' | 'leasehold';

interface Props {
  result: TaxCalculationResult;
  symbol: string;
  currency: 'IDR' | 'USD' | 'AUD' | 'EUR' | 'GBP';
  currentStructure: OwnershipType;
}

function OwnershipIcon({ type, className }: { type: OwnershipType; className?: string }) {
  const iconClass = className || 'w-5 h-5';
  switch (type) {
    case 'pt':
      return (
        <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      );
    case 'freehold':
      return (
        <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      );
    case 'leasehold':
      return (
        <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      );
    default:
      return null;
  }
}

const ownershipInfo = {
  pt: {
    label: 'PT (Company)',
    pros: ['Deductible expenses', 'Depreciation benefits', 'Business income treatment'],
    cons: ['Corporate tax on gains', 'Administrative overhead', 'PT setup costs'],
  },
  freehold: {
    label: 'Freehold (Individual)',
    pros: ['Simple ownership', 'No corporate overhead', 'Personal asset protection'],
    cons: ['Higher capital gains rate', 'No expense deductions', 'No depreciation benefit'],
  },
  leasehold: {
    label: 'Leasehold',
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
                    <OwnershipIcon type={type} className="w-5 h-5 text-zinc-400" />
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
