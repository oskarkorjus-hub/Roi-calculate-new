import type { Calculator } from '../calculators/registry';

interface CalculatorCardProps {
  calculator: Calculator;
  onSelect: (id: string) => void;
  isRecent?: boolean;
}

// Color schemes for different calculator types
const ICON_COLORS: Record<string, { bg: string; text: string; hoverBg: string }> = {
  'mortgage': { bg: 'bg-emerald-500/20', text: 'text-emerald-400', hoverBg: 'group-hover:bg-emerald-500/30' },
  'rental-roi': { bg: 'bg-cyan-500/20', text: 'text-cyan-400', hoverBg: 'group-hover:bg-cyan-500/30' },
  'xirr': { bg: 'bg-purple-500/20', text: 'text-purple-400', hoverBg: 'group-hover:bg-purple-500/30' },
  'cashflow': { bg: 'bg-green-500/20', text: 'text-green-400', hoverBg: 'group-hover:bg-green-500/30' },
  'cap-rate': { bg: 'bg-amber-500/20', text: 'text-amber-400', hoverBg: 'group-hover:bg-amber-500/30' },
  'irr': { bg: 'bg-blue-500/20', text: 'text-blue-400', hoverBg: 'group-hover:bg-blue-500/30' },
  'npv': { bg: 'bg-teal-500/20', text: 'text-teal-400', hoverBg: 'group-hover:bg-teal-500/30' },
  'dev-feasibility': { bg: 'bg-orange-500/20', text: 'text-orange-400', hoverBg: 'group-hover:bg-orange-500/30' },
  'indonesia-tax': { bg: 'bg-red-500/20', text: 'text-red-400', hoverBg: 'group-hover:bg-red-500/30' },
  'rental-projection': { bg: 'bg-indigo-500/20', text: 'text-indigo-400', hoverBg: 'group-hover:bg-indigo-500/30' },
  'financing': { bg: 'bg-cyan-500/20', text: 'text-cyan-400', hoverBg: 'group-hover:bg-cyan-500/30' },
  'dev-budget': { bg: 'bg-yellow-500/20', text: 'text-yellow-400', hoverBg: 'group-hover:bg-yellow-500/30' },
  'risk-assessment': { bg: 'bg-rose-500/20', text: 'text-rose-400', hoverBg: 'group-hover:bg-rose-500/30' },
};

export function CalculatorCard({
  calculator,
  onSelect,
  isRecent = false,
}: CalculatorCardProps) {
  const colors = ICON_COLORS[calculator.id] || { bg: 'bg-zinc-800', text: 'text-zinc-400', hoverBg: 'group-hover:bg-zinc-700' };

  return (
    <button
      onClick={() => onSelect(calculator.id)}
      className="group relative overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 text-left transition-all duration-200 hover:border-emerald-500/40 hover:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:ring-offset-2 focus:ring-offset-[#0a0a0a]"
    >
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className={`w-10 h-10 rounded-lg ${colors.bg} ${colors.hoverBg} flex items-center justify-center shrink-0 transition-colors`}>
          <span className={`material-symbols-outlined text-xl ${colors.text}`}>
            {calculator.icon}
          </span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-white group-hover:text-emerald-400 transition-colors truncate">
              {calculator.name}
            </h3>
            {isRecent && (
              <span className="shrink-0 w-2 h-2 rounded-full bg-emerald-500" />
            )}
          </div>
          <p className="text-sm text-zinc-500 line-clamp-2">
            {calculator.description}
          </p>
        </div>

        {/* Arrow */}
        <svg
          className="w-5 h-5 text-zinc-600 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </button>
  );
}
