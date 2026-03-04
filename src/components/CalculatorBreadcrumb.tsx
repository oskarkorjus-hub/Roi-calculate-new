interface CalculatorBreadcrumbProps {
  calculatorName?: string;
  onNavigateHome: () => void;
}

export function CalculatorBreadcrumb({
  calculatorName,
  onNavigateHome,
}: CalculatorBreadcrumbProps) {
  return (
    <div className="flex items-center gap-2 text-sm text-zinc-500 mb-6">
      <button
        onClick={onNavigateHome}
        className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
      >
        Calculators
      </button>
      {calculatorName && (
        <>
          <span className="text-zinc-600">›</span>
          <span className="text-white font-medium">{calculatorName}</span>
        </>
      )}
    </div>
  );
}
