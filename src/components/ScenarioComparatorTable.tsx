import type { ProjectScenario } from '../types/portfolio';

interface ScenarioComparatorTableProps {
  scenarios: ProjectScenario[];
  baselineScenario: ProjectScenario;
}

export function ScenarioComparatorTable({
  scenarios,
  baselineScenario,
}: ScenarioComparatorTableProps) {
  const allScenarios = [baselineScenario, ...scenarios];

  const metrics = [
    { key: 'roi', label: 'ROI %', format: (v: any) => `${(v || 0).toFixed(1)}%`, higher: true },
    { key: 'avgCashFlow', label: 'Monthly Cash Flow', format: (v: any) => `${formatCurrency(v || 0)}`, higher: true },
    { key: 'breakEvenMonths', label: 'Break-Even', format: (v: any) => `${v || 0}m`, higher: false },
    { key: 'totalInvestment', label: 'Investment', format: (v: any) => formatCurrency(v || 0), higher: false },
  ];

  const getBestValue = (values: any[], higherIsBetter: boolean) => {
    if (values.length === 0) return null;
    return higherIsBetter ? Math.max(...values) : Math.min(...values);
  };

  const formatCurrency = (value: number) => {
    if (value >= 1_000_000) return (value / 1_000_000).toFixed(1) + 'M';
    if (value >= 1_000) return (value / 1_000).toFixed(0) + 'K';
    return value.toFixed(0);
  };

  const getDelta = (value: any, baseline: any, higherIsBetter: boolean): string => {
    if (!value || !baseline) return '';
    const delta = value - baseline;
    if (delta === 0) return 'No change';
    const sign = delta > 0 ? '+' : '';
    if (typeof value === 'number' && value < 100) {
      return `${sign}${delta.toFixed(1)}`;
    }
    return `${sign}${formatCurrency(delta)}`;
  };

  return (
    <div className="overflow-x-auto border border-gray-200 rounded-lg">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
            <th className="px-4 py-3 text-left font-semibold text-gray-900 w-32">Metric</th>
            {allScenarios.map((scenario, idx) => (
              <th
                key={scenario.id}
                className={`px-4 py-3 text-right font-semibold ${
                  idx === 0 ? 'bg-indigo-50 text-indigo-900' : 'text-gray-900'
                }`}
              >
                <div className="text-sm font-semibold">{scenario.name}</div>
                <div className="text-xs text-gray-600">
                  {idx === 0 ? '(Baseline)' : ''}
                </div>
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
                className={`border-b border-gray-200 ${metricIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
              >
                <td className="px-4 py-3 font-medium text-gray-900">{metric.label}</td>
                {allScenarios.map((scenario, idx) => {
                  const value = scenario.results[metric.key];
                  const isBest = value === bestValue && bestValue !== null;
                  const isBaseline = idx === 0;

                  return (
                    <td
                      key={`${scenario.id}-${metric.key}`}
                      className={`px-4 py-3 text-right font-semibold ${
                        isBest && !isBaseline
                          ? 'bg-green-100 text-green-900'
                          : isBaseline
                            ? 'bg-indigo-50 text-indigo-900'
                            : 'text-gray-900'
                      }`}
                    >
                      <div>{metric.format(value)}</div>
                      {idx > 0 && (
                        <div
                          className={`text-xs font-normal ${
                            isBest ? 'text-green-700' : 'text-gray-600'
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
