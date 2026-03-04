import type { Calculator } from '../calculators/registry';

interface CalculatorCardProps {
  calculator: Calculator;
  onSelect: (id: string) => void;
  isRecent?: boolean;
}

export function CalculatorCard({
  calculator,
  onSelect,
  isRecent = false,
}: CalculatorCardProps) {
  return (
    <button
      onClick={() => onSelect(calculator.id)}
      className="group relative overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 text-left transition-all duration-200 hover:border-emerald-500/40 hover:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:ring-offset-2 focus:ring-offset-[#0a0a0a]"
    >
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center text-xl shrink-0 group-hover:bg-zinc-700 transition-colors">
          {calculator.icon}
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
