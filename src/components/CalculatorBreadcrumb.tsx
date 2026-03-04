interface CalculatorBreadcrumbProps {
  calculatorName?: string;
  onNavigateHome: () => void;
}

export function CalculatorBreadcrumb({
  calculatorName,
  onNavigateHome,
}: CalculatorBreadcrumbProps) {
  return (
    <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
      <button
        onClick={onNavigateHome}
        className="text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
      >
        Calculators
      </button>
      {calculatorName && (
        <>
          <span className="text-gray-400">›</span>
          <span className="text-gray-900 font-medium">{calculatorName}</span>
        </>
      )}
    </div>
  );
}
