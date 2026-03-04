export interface SectionHeaderProps {
  title: string;
  icon?: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary';
  };
}

export function SectionHeader({
  title,
  icon,
  description,
  action,
}: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <h3 className="flex items-center gap-2 text-lg font-bold text-white">
          {icon && <span className="text-2xl">{icon}</span>}
          {title}
        </h3>
        {description && (
          <p className="text-sm text-zinc-400 mt-1">{description}</p>
        )}
      </div>

      {action && (
        <button
          onClick={action.onClick}
          className={`
            px-4 py-2 rounded-lg font-semibold text-sm transition-colors whitespace-nowrap
            ${
              action.variant === 'primary'
                ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 border border-zinc-700'
            }
          `}
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
