import type { Calculator } from '../calculators/registry';

interface CalculatorCardProps {
  calculator: Calculator;
  onSelect: (id: string) => void;
  isRecent?: boolean;}

export function CalculatorCard({
  calculator,
  onSelect,
  isRecent = false,
}: CalculatorCardProps) {
  return (
    <button
      onClick={() => onSelect(calculator.id)}
      className="group relative overflow-hidden rounded-lg border border-gray-200 bg-white p-6 text-left transition-all duration-300 hover:border-indigo-300 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(calculator.id);
        }
      }}
    >
      {/* Background gradient on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      {/* Content */}
      <div className="relative z-10">
        {/* Badge */}
        {isRecent && (
          <div className="mb-3 inline-block rounded-full bg-indigo-100 px-3 py-1">
            <span className="text-xs font-semibold text-indigo-700">Recently Used</span>
          </div>
        )}

        {/* Icon */}
        <div className="mb-4 text-4xl">{calculator.icon}</div>

        {/* Name */}
        <h3 className="mb-2 text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
          {calculator.name}
        </h3>

        {/* Description */}
        <p className="mb-4 text-sm text-gray-600 line-clamp-2">
          {calculator.description}
        </p>

        {/* Tags */}
        <div className="mb-4 flex flex-wrap gap-2">
          {calculator.tags.map((tag) => (
            <span
              key={tag}
              className="inline-block rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* CTA */}
        <div className="flex items-center gap-2 text-indigo-600 font-semibold group-hover:gap-3 transition-all">
          <span>Open Calculator</span>
          <span className="group-hover:translate-x-1 transition-transform">→</span>
        </div>
      </div>
    </button>
  );
}
