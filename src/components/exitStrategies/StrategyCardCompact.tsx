import type { ExitStrategyOption } from '../../types/exitStrategies';
import type { ExitStrategyType } from '../../types/investment';

const ICONS: Record<ExitStrategyOption['color'], string> = {
  cyan: 'construction',
  purple: 'published_with_changes',
  amber: 'savings',
};

const COLOR_CLASSES = {
  cyan: {
    icon: 'bg-cyan-950/40 border-cyan-800/50 text-cyan-400',
    subtitle: 'text-cyan-400',
    selected: 'border-cyan-400 bg-cyan-950/20',
    hover: 'hover:border-cyan-500/50',
    check: 'bg-cyan-400 border-cyan-400',
    checkHover: 'group-hover:border-cyan-400/50',
  },
  purple: {
    icon: 'bg-purple-950/40 border-purple-800/50 text-purple-400',
    subtitle: 'text-purple-400',
    selected: 'border-purple-400 bg-purple-950/20',
    hover: 'hover:border-purple-500/50',
    check: 'bg-purple-400 border-purple-400',
    checkHover: 'group-hover:border-purple-400/50',
  },
  amber: {
    icon: 'bg-amber-950/40 border-amber-800/50 text-amber-400',
    subtitle: 'text-amber-400',
    selected: 'border-amber-400 bg-amber-950/20',
    hover: 'hover:border-amber-500/50',
    check: 'bg-amber-400 border-amber-400',
    checkHover: 'group-hover:border-amber-400/50',
  },
};

interface Props {
  strategy: ExitStrategyOption;
  isSelected: boolean;
  onSelect: (id: ExitStrategyType) => void;
}

export function StrategyCardCompact({ strategy, isSelected, onSelect }: Props) {
  const colors = COLOR_CLASSES[strategy.color];
  const icon = ICONS[strategy.color];

  return (
    <label className="relative group cursor-pointer">
      <input
        type="radio"
        name="exit_strategy"
        value={strategy.id}
        checked={isSelected}
        onChange={() => onSelect(strategy.id)}
        className="peer sr-only"
      />
      <div
        className={`
          rounded-xl border border-border-dark bg-[#0f281e]
          ${isSelected ? colors.selected : ''}
          ${colors.hover}
          transition-all p-4 flex flex-col h-full
        `}
      >
        {/* Header row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg border ${colors.icon}`}>
              <span className="material-symbols-outlined text-xl">{icon}</span>
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">{strategy.name}</h4>
              <div className={`text-[10px] font-bold uppercase tracking-wider ${colors.subtitle}`}>
                {strategy.subtitle}
              </div>
            </div>
          </div>
          <div
            className={`
              w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all shrink-0
              ${isSelected ? colors.check : `border-border-dark ${colors.checkHover}`}
            `}
          >
            <span
              className={`material-symbols-outlined text-xs font-bold text-background-dark ${
                isSelected ? 'opacity-100' : 'opacity-0'
              }`}
            >
              check
            </span>
          </div>
        </div>

        {/* Stats row */}
        <div className="flex gap-2 mb-3">
          <div className="flex-1 bg-surface-dark/50 rounded px-2 py-1.5">
            <div className="text-[9px] uppercase text-text-secondary">{strategy.roiLabel}</div>
            <div className="text-sm font-bold text-white">{strategy.roi}</div>
          </div>
          <div className="flex-1 bg-surface-dark/50 rounded px-2 py-1.5">
            <div className="text-[9px] uppercase text-text-secondary">{strategy.durationLabel}</div>
            <div className="text-sm font-bold text-white">{strategy.duration}</div>
          </div>
        </div>

        {/* Description */}
        <p className="text-text-secondary text-xs leading-relaxed">
          {strategy.description}
        </p>
      </div>
    </label>
  );
}
