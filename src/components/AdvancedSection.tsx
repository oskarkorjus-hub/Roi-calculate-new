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
  <div className="border rounded-lg overflow-hidden">
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between px-4 py-3 bg-gray-100 hover:bg-gray-200 transition"
    >
      <div className="flex items-center gap-2">
        <span className="text-lg">{icon}</span>
        <h3 className="font-semibold text-gray-900">{title}</h3>
        {description && <span className="text-xs text-gray-600">({description})</span>}
      </div>
      <span className={`text-xl transition-transform ${isOpen ? 'rotate-180' : ''}`}>▼</span>
    </button>
    {isOpen && <div className="p-4 space-y-3 bg-gray-50 border-t">{children}</div>}
  </div>
);

export default AdvancedSection;
