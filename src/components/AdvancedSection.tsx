import React from 'react';

interface AdvancedSectionProps {
  title: string;
  icon?: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  description?: string;
}

export const AdvancedSection: React.FC<AdvancedSectionProps> = ({
  title,
  icon = '⚙️',
  isOpen,
  onToggle,
  children,
  description,
}) => (
  <div className="border border-zinc-700 rounded-lg overflow-hidden">
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between px-4 py-3 bg-zinc-800 hover:bg-zinc-700 transition"
    >
      <div className="flex items-center gap-2">
        <span className="text-lg">{icon}</span>
        <h3 className="font-semibold text-white">{title}</h3>
        {description && <span className="text-xs text-zinc-400">({description})</span>}
      </div>
      <span className={`text-xl text-zinc-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}>▼</span>
    </button>
    {isOpen && <div className="p-4 space-y-3 bg-zinc-800/50 border-t border-zinc-700">{children}</div>}
  </div>
);

export default AdvancedSection;
