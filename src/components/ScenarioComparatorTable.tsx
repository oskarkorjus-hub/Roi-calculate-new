import type { ProjectScenario } from '../types/portfolio';

interface MetricConfig {
  key: string;
  label: string;
  format: (v: any) => string;
  higher: boolean; // true = higher is better
}

// Calculator-specific metrics configurations
const CALCULATOR_METRICS: Record<string, MetricConfig[]> = {
  'mortgage': [
    { key: 'totalInvestment', label: 'Loan Amount', format: (v) => formatCurrency(v || 0), higher: false },
    { key: 'monthlyPayment', label: 'Monthly Payment', format: (v) => formatCurrency(v || 0), higher: false },
    { key: 'totalInterest', label: 'Total Interest', format: (v) => formatCurrency(v || 0), higher: false },
    { key: 'roi', label: 'Effective Rate', format: (v) => `${(v || 0).toFixed(2)}%`, higher: false },
  ],
  'rental-roi': [
    { key: 'roi', label: 'Annual ROI', format: (v) => `${(v || 0).toFixed(1)}%`, higher: true },
    { key: 'avgCashFlow', label: 'Avg Annual Profit', format: (v) => formatCurrency(v || 0), higher: true },
    { key: 'totalRevenue', label: '10-Year Revenue', format: (v) => formatCurrency(v || 0), higher: true },
    { key: 'totalInvestment', label: 'Initial Investment', format: (v) => formatCurrency(v || 0), higher: false },
  ],
  'xirr': [
    { key: 'roi', label: 'XIRR', format: (v) => `${(v || 0).toFixed(2)}%`, higher: true },
    { key: 'totalInvestment', label: 'Total Investment', format: (v) => formatCurrency(v || 0), higher: false },
    { key: 'totalReturn', label: 'Total Return', format: (v) => formatCurrency(v || 0), higher: true },
    { key: 'netProfit', label: 'Net Profit', format: (v) => formatCurrency(v || 0), higher: true },
  ],
  'cashflow': [
    { key: 'avgCashFlow', label: 'Monthly Cash Flow', format: (v) => formatCurrency(v || 0), higher: true },
    { key: 'annualCashFlow', label: 'Annual Cash Flow', format: (v) => formatCurrency(v || 0), higher: true },
    { key: 'occupancyRate', label: 'Occupancy Rate', format: (v) => `${(v || 0).toFixed(1)}%`, higher: true },
    { key: 'expenseRatio', label: 'Expense Ratio', format: (v) => `${(v || 0).toFixed(1)}%`, higher: false },
  ],
  'cap-rate': [
    { key: 'capRate', label: 'Cap Rate', format: (v) => `${(v || 0).toFixed(2)}%`, higher: true },
    { key: 'noi', label: 'Net Operating Income', format: (v) => formatCurrency(v || 0), higher: true },
    { key: 'totalInvestment', label: 'Property Value', format: (v) => formatCurrency(v || 0), higher: false },
    { key: 'grm', label: 'Gross Rent Multiplier', format: (v) => (v || 0).toFixed(1), higher: false },
  ],
  'irr': [
    { key: 'irr', label: 'IRR', format: (v) => `${(v || 0).toFixed(2)}%`, higher: true },
    { key: 'npv', label: 'NPV', format: (v) => formatCurrency(v || 0), higher: true },
    { key: 'totalInvestment', label: 'Total Investment', format: (v) => formatCurrency(v || 0), higher: false },
    { key: 'paybackPeriod', label: 'Payback Period', format: (v) => `${(v || 0).toFixed(1)} yrs`, higher: false },
  ],
  'npv': [
    { key: 'npv', label: 'Net Present Value', format: (v) => formatCurrency(v || 0), higher: true },
    { key: 'totalInvestment', label: 'Initial Investment', format: (v) => formatCurrency(v || 0), higher: false },
    { key: 'discountRate', label: 'Discount Rate', format: (v) => `${(v || 0).toFixed(1)}%`, higher: false },
    { key: 'profitabilityIndex', label: 'Profitability Index', format: (v) => (v || 0).toFixed(2), higher: true },
  ],
  'dev-feasibility': [
    { key: 'roi', label: 'Project ROI', format: (v) => `${(v || 0).toFixed(1)}%`, higher: true },
    { key: 'totalInvestment', label: 'Development Cost', format: (v) => formatCurrency(v || 0), higher: false },
    { key: 'projectedValue', label: 'Projected Value', format: (v) => formatCurrency(v || 0), higher: true },
    { key: 'profitMargin', label: 'Profit Margin', format: (v) => `${(v || 0).toFixed(1)}%`, higher: true },
  ],
  'indonesia-tax': [
    { key: 'effectiveTaxRate', label: 'Effective Tax Rate', format: (v) => `${(v || 0).toFixed(2)}%`, higher: false },
    { key: 'totalTax', label: 'Total Tax', format: (v) => formatCurrency(v || 0), higher: false },
    { key: 'taxSavings', label: 'Tax Savings', format: (v) => formatCurrency(v || 0), higher: true },
    { key: 'netIncome', label: 'Net Income', format: (v) => formatCurrency(v || 0), higher: true },
  ],
  'rental-projection': [
    { key: 'avgCashFlow', label: 'Annual Net Income', format: (v) => formatCurrency(v || 0), higher: true },
    { key: 'annualRevenue', label: 'Annual Revenue', format: (v) => formatCurrency(v || 0), higher: true },
    { key: 'occupancyRate', label: 'Avg Occupancy', format: (v) => `${(v || 0).toFixed(1)}%`, higher: true },
    { key: 'averageNightlyRate', label: 'Avg Nightly Rate', format: (v) => formatCurrency(v || 0), higher: true },
  ],
  'financing': [
    { key: 'monthlyPayment', label: 'Monthly Payment', format: (v) => formatCurrency(v || 0), higher: false },
    { key: 'totalInterest', label: 'Total Interest', format: (v) => formatCurrency(v || 0), higher: false },
    { key: 'effectiveRate', label: 'Effective Rate', format: (v) => `${(v || 0).toFixed(2)}%`, higher: false },
    { key: 'totalCost', label: 'Total Loan Cost', format: (v) => formatCurrency(v || 0), higher: false },
  ],
  'dev-budget': [
    { key: 'totalBudget', label: 'Total Budget', format: (v) => formatCurrency(v || 0), higher: false },
    { key: 'actualSpent', label: 'Actual Spent', format: (v) => formatCurrency(v || 0), higher: false },
    { key: 'variance', label: 'Budget Variance', format: (v) => `${(v || 0).toFixed(1)}%`, higher: false },
    { key: 'completionPct', label: 'Completion', format: (v) => `${(v || 0).toFixed(0)}%`, higher: true },
  ],
  'risk-assessment': [
    { key: 'riskScore', label: 'Risk Score', format: (v) => `${(v || 0).toFixed(0)}/100`, higher: false },
    { key: 'roi', label: 'Expected ROI', format: (v) => `${(v || 0).toFixed(1)}%`, higher: true },
    { key: 'volatility', label: 'Volatility', format: (v) => `${(v || 0).toFixed(1)}%`, higher: false },
    { key: 'sharpeRatio', label: 'Sharpe Ratio', format: (v) => (v || 0).toFixed(2), higher: true },
  ],
};

// Default metrics for unknown calculator types
const DEFAULT_METRICS: MetricConfig[] = [
  { key: 'roi', label: 'ROI', format: (v) => `${(v || 0).toFixed(1)}%`, higher: true },
  { key: 'avgCashFlow', label: 'Cash Flow', format: (v) => formatCurrency(v || 0), higher: true },
  { key: 'breakEvenMonths', label: 'Break-Even', format: (v) => `${v || 0}m`, higher: false },
  { key: 'totalInvestment', label: 'Investment', format: (v) => formatCurrency(v || 0), higher: false },
];

function formatCurrency(value: number): string {
  if (value >= 1_000_000) return (value / 1_000_000).toFixed(1) + 'M';
  if (value >= 1_000) return (value / 1_000).toFixed(0) + 'K';
  return value.toFixed(0);
}

interface ScenarioComparatorTableProps {
  scenarios: ProjectScenario[];
  baselineScenario: ProjectScenario;
  calculatorId?: string;
}

export function ScenarioComparatorTable({
  scenarios,
  baselineScenario,
  calculatorId,
}: ScenarioComparatorTableProps) {
  const allScenarios = [baselineScenario, ...scenarios];

  // Get calculator-specific metrics or fall back to defaults
  const metrics = calculatorId && CALCULATOR_METRICS[calculatorId]
    ? CALCULATOR_METRICS[calculatorId]
    : DEFAULT_METRICS;

  const getBestValue = (values: any[], higherIsBetter: boolean) => {
    const numericValues = values.filter(v => typeof v === 'number' && !isNaN(v));
    if (numericValues.length === 0) return null;
    return higherIsBetter ? Math.max(...numericValues) : Math.min(...numericValues);
  };

  const getDelta = (value: any, baseline: any, higherIsBetter: boolean): string => {
    if (value === undefined || value === null || baseline === undefined || baseline === null) return '';
    const numValue = Number(value);
    const numBaseline = Number(baseline);
    if (isNaN(numValue) || isNaN(numBaseline)) return '';

    const delta = numValue - numBaseline;
    if (delta === 0) return 'No change';
    const sign = delta > 0 ? '+' : '';
    if (Math.abs(numValue) < 100) {
      return `${sign}${delta.toFixed(1)}`;
    }
    return `${sign}${formatCurrency(delta)}`;
  };

  return (
    <div className="overflow-x-auto border border-zinc-700 rounded-xl">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-zinc-800/50 border-b border-zinc-700">
            <th className="px-4 py-3 text-left font-semibold text-zinc-300 w-32">Metric</th>
            {allScenarios.map((scenario, idx) => (
              <th
                key={scenario.id}
                className={`px-4 py-3 text-right font-semibold ${
                  idx === 0 ? 'bg-purple-500/10 text-purple-400' : 'text-white'
                }`}
              >
                <div className="text-sm font-semibold">{scenario.name}</div>
                {idx === 0 && (
                  <div className="text-xs text-purple-400/70 font-normal">
                    (Baseline)
                  </div>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {metrics.map((metric, metricIdx) => {
            const metricValues = allScenarios.map(s => s.results[metric.key]);
            const bestValue = getBestValue(metricValues, metric.higher);

            return (
              <tr
                key={metric.key}
                className={`border-b border-zinc-800 ${metricIdx % 2 === 0 ? 'bg-zinc-900' : 'bg-zinc-800/30'}`}
              >
                <td className="px-4 py-3 font-medium text-zinc-300">{metric.label}</td>
                {allScenarios.map((scenario, idx) => {
                  const value = scenario.results[metric.key];
                  const numValue = Number(value);
                  const isBest = !isNaN(numValue) && numValue === bestValue && bestValue !== null && metricValues.filter(v => v === bestValue).length === 1;
                  const isBaseline = idx === 0;

                  return (
                    <td
                      key={`${scenario.id}-${metric.key}`}
                      className={`px-4 py-3 text-right font-semibold transition ${
                        isBest && !isBaseline
                          ? 'bg-emerald-500/15 text-emerald-400'
                          : isBaseline
                            ? 'bg-purple-500/10 text-purple-300'
                            : 'text-white'
                      }`}
                    >
                      <div>{metric.format(value)}</div>
                      {idx > 0 && (
                        <div
                          className={`text-xs font-normal ${
                            isBest ? 'text-emerald-400/80' : 'text-zinc-500'
                          }`}
                        >
                          {getDelta(value, allScenarios[0].results[metric.key], metric.higher)}
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
