import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import type { ProjectScenario } from '../types/portfolio';

interface ChartConfig {
  title: string;
  metrics: {
    key: string;
    label: string;
    color: string;
    format?: (v: number) => string;
  }[];
}

interface WinnerConfig {
  title: string;
  key: string;
  higher: boolean; // true = higher is better
  format: (v: number) => string;
  color: 'emerald' | 'cyan' | 'amber' | 'purple';
}

// Calculator-specific chart configurations
const CALCULATOR_CHARTS: Record<string, { charts: ChartConfig[]; winners: WinnerConfig[] }> = {
  'mortgage': {
    charts: [
      {
        title: 'Payment Comparison',
        metrics: [
          { key: 'monthlyPayment', label: 'Monthly Payment', color: '#a855f7' },
          { key: 'totalInterest', label: 'Total Interest', color: '#f59e0b' },
        ],
      },
    ],
    winners: [
      { title: 'Lowest Payment', key: 'monthlyPayment', higher: false, format: (v) => formatCurrency(v), color: 'emerald' },
      { title: 'Lowest Interest', key: 'totalInterest', higher: false, format: (v) => formatCurrency(v), color: 'cyan' },
      { title: 'Lowest Rate', key: 'roi', higher: false, format: (v) => `${v.toFixed(2)}%`, color: 'amber' },
    ],
  },
  'rental-roi': {
    charts: [
      {
        title: 'ROI & Profit Comparison',
        metrics: [
          { key: 'roi', label: 'Annual ROI %', color: '#a855f7' },
          { key: 'avgCashFlow', label: 'Annual Profit', color: '#10b981' },
        ],
      },
    ],
    winners: [
      { title: 'Best ROI', key: 'roi', higher: true, format: (v) => `${v.toFixed(1)}%`, color: 'emerald' },
      { title: 'Best Profit', key: 'avgCashFlow', higher: true, format: (v) => formatCurrency(v), color: 'cyan' },
      { title: 'Most Revenue', key: 'totalRevenue', higher: true, format: (v) => formatCurrency(v), color: 'amber' },
    ],
  },
  'xirr': {
    charts: [
      {
        title: 'Return Comparison',
        metrics: [
          { key: 'roi', label: 'XIRR %', color: '#a855f7' },
          { key: 'netProfit', label: 'Net Profit', color: '#10b981' },
        ],
      },
    ],
    winners: [
      { title: 'Best XIRR', key: 'roi', higher: true, format: (v) => `${v.toFixed(2)}%`, color: 'emerald' },
      { title: 'Highest Return', key: 'totalReturn', higher: true, format: (v) => formatCurrency(v), color: 'cyan' },
      { title: 'Best Profit', key: 'netProfit', higher: true, format: (v) => formatCurrency(v), color: 'amber' },
    ],
  },
  'cashflow': {
    charts: [
      {
        title: 'Cash Flow Comparison',
        metrics: [
          { key: 'avgCashFlow', label: 'Monthly Cash Flow', color: '#10b981' },
          { key: 'annualCashFlow', label: 'Annual Cash Flow', color: '#06b6d4' },
        ],
      },
    ],
    winners: [
      { title: 'Best Monthly', key: 'avgCashFlow', higher: true, format: (v) => formatCurrency(v), color: 'emerald' },
      { title: 'Best Occupancy', key: 'occupancyRate', higher: true, format: (v) => `${v.toFixed(1)}%`, color: 'cyan' },
      { title: 'Lowest Expense', key: 'expenseRatio', higher: false, format: (v) => `${v.toFixed(1)}%`, color: 'amber' },
    ],
  },
  'cap-rate': {
    charts: [
      {
        title: 'Cap Rate & NOI Comparison',
        metrics: [
          { key: 'capRate', label: 'Cap Rate %', color: '#a855f7' },
          { key: 'noi', label: 'NOI', color: '#10b981' },
        ],
      },
    ],
    winners: [
      { title: 'Best Cap Rate', key: 'capRate', higher: true, format: (v) => `${v.toFixed(2)}%`, color: 'emerald' },
      { title: 'Best NOI', key: 'noi', higher: true, format: (v) => formatCurrency(v), color: 'cyan' },
      { title: 'Best GRM', key: 'grm', higher: false, format: (v) => v.toFixed(1), color: 'amber' },
    ],
  },
  'irr': {
    charts: [
      {
        title: 'IRR & NPV Comparison',
        metrics: [
          { key: 'irr', label: 'IRR %', color: '#a855f7' },
          { key: 'npv', label: 'NPV', color: '#10b981' },
        ],
      },
    ],
    winners: [
      { title: 'Best IRR', key: 'irr', higher: true, format: (v) => `${v.toFixed(2)}%`, color: 'emerald' },
      { title: 'Best NPV', key: 'npv', higher: true, format: (v) => formatCurrency(v), color: 'cyan' },
      { title: 'Fastest Payback', key: 'paybackPeriod', higher: false, format: (v) => `${v.toFixed(1)} yrs`, color: 'amber' },
    ],
  },
  'npv': {
    charts: [
      {
        title: 'NPV Comparison',
        metrics: [
          { key: 'npv', label: 'Net Present Value', color: '#10b981' },
          { key: 'profitabilityIndex', label: 'Profitability Index', color: '#a855f7' },
        ],
      },
    ],
    winners: [
      { title: 'Best NPV', key: 'npv', higher: true, format: (v) => formatCurrency(v), color: 'emerald' },
      { title: 'Best Index', key: 'profitabilityIndex', higher: true, format: (v) => v.toFixed(2), color: 'cyan' },
      { title: 'Lowest Risk', key: 'discountRate', higher: false, format: (v) => `${v.toFixed(1)}%`, color: 'amber' },
    ],
  },
  'dev-feasibility': {
    charts: [
      {
        title: 'Development ROI & Value',
        metrics: [
          { key: 'roi', label: 'Project ROI %', color: '#a855f7' },
          { key: 'projectedValue', label: 'Projected Value', color: '#10b981' },
        ],
      },
    ],
    winners: [
      { title: 'Best ROI', key: 'roi', higher: true, format: (v) => `${v.toFixed(1)}%`, color: 'emerald' },
      { title: 'Best Value', key: 'projectedValue', higher: true, format: (v) => formatCurrency(v), color: 'cyan' },
      { title: 'Best Margin', key: 'profitMargin', higher: true, format: (v) => `${v.toFixed(1)}%`, color: 'amber' },
    ],
  },
  'indonesia-tax': {
    charts: [
      {
        title: 'Tax Comparison',
        metrics: [
          { key: 'totalTax', label: 'Total Tax', color: '#ef4444' },
          { key: 'taxSavings', label: 'Tax Savings', color: '#10b981' },
        ],
      },
    ],
    winners: [
      { title: 'Lowest Tax', key: 'totalTax', higher: false, format: (v) => formatCurrency(v), color: 'emerald' },
      { title: 'Most Savings', key: 'taxSavings', higher: true, format: (v) => formatCurrency(v), color: 'cyan' },
      { title: 'Best Rate', key: 'effectiveTaxRate', higher: false, format: (v) => `${v.toFixed(2)}%`, color: 'amber' },
    ],
  },
  'rental-projection': {
    charts: [
      {
        title: 'Revenue & Income Comparison',
        metrics: [
          { key: 'annualRevenue', label: 'Annual Revenue', color: '#a855f7' },
          { key: 'avgCashFlow', label: 'Net Income', color: '#10b981' },
        ],
      },
    ],
    winners: [
      { title: 'Best Revenue', key: 'annualRevenue', higher: true, format: (v) => formatCurrency(v), color: 'emerald' },
      { title: 'Best Income', key: 'avgCashFlow', higher: true, format: (v) => formatCurrency(v), color: 'cyan' },
      { title: 'Best Occupancy', key: 'occupancyRate', higher: true, format: (v) => `${v.toFixed(1)}%`, color: 'amber' },
    ],
  },
  'financing': {
    charts: [
      {
        title: 'Financing Comparison',
        metrics: [
          { key: 'monthlyPayment', label: 'Monthly Payment', color: '#a855f7' },
          { key: 'totalInterest', label: 'Total Interest', color: '#f59e0b' },
        ],
      },
    ],
    winners: [
      { title: 'Lowest Payment', key: 'monthlyPayment', higher: false, format: (v) => formatCurrency(v), color: 'emerald' },
      { title: 'Lowest Interest', key: 'totalInterest', higher: false, format: (v) => formatCurrency(v), color: 'cyan' },
      { title: 'Best Rate', key: 'effectiveRate', higher: false, format: (v) => `${v.toFixed(2)}%`, color: 'amber' },
    ],
  },
  'dev-budget': {
    charts: [
      {
        title: 'Budget Comparison',
        metrics: [
          { key: 'totalBudget', label: 'Total Budget', color: '#a855f7' },
          { key: 'actualSpent', label: 'Actual Spent', color: '#f59e0b' },
        ],
      },
    ],
    winners: [
      { title: 'Best Variance', key: 'variance', higher: false, format: (v) => `${v.toFixed(1)}%`, color: 'emerald' },
      { title: 'Most Complete', key: 'completionPct', higher: true, format: (v) => `${v.toFixed(0)}%`, color: 'cyan' },
      { title: 'Lowest Spend', key: 'actualSpent', higher: false, format: (v) => formatCurrency(v), color: 'amber' },
    ],
  },
  'risk-assessment': {
    charts: [
      {
        title: 'Risk & Return Comparison',
        metrics: [
          { key: 'riskScore', label: 'Risk Score', color: '#ef4444' },
          { key: 'roi', label: 'Expected ROI %', color: '#10b981' },
        ],
      },
    ],
    winners: [
      { title: 'Lowest Risk', key: 'riskScore', higher: false, format: (v) => `${v.toFixed(0)}/100`, color: 'emerald' },
      { title: 'Best ROI', key: 'roi', higher: true, format: (v) => `${v.toFixed(1)}%`, color: 'cyan' },
      { title: 'Best Sharpe', key: 'sharpeRatio', higher: true, format: (v) => v.toFixed(2), color: 'amber' },
    ],
  },
};

// Default config for unknown calculators
const DEFAULT_CONFIG = {
  charts: [
    {
      title: 'ROI & Cash Flow Comparison',
      metrics: [
        { key: 'roi', label: 'ROI %', color: '#a855f7' },
        { key: 'avgCashFlow', label: 'Cash Flow', color: '#10b981' },
      ],
    },
  ],
  winners: [
    { title: 'Best ROI', key: 'roi', higher: true, format: (v: number) => `${v.toFixed(1)}%`, color: 'emerald' as const },
    { title: 'Best Cash Flow', key: 'avgCashFlow', higher: true, format: (v: number) => formatCurrency(v), color: 'cyan' as const },
    { title: 'Fastest Break-Even', key: 'breakEvenMonths', higher: false, format: (v: number) => `${v} months`, color: 'amber' as const },
  ],
};

interface ScenarioComparisonChartsProps {
  scenarios: ProjectScenario[];
  baselineScenario: ProjectScenario;
  calculatorId?: string;
}

export function ScenarioComparisonCharts({
  scenarios,
  baselineScenario,
  calculatorId,
}: ScenarioComparisonChartsProps) {
  const allScenarios = [baselineScenario, ...scenarios];

  // Get calculator-specific config or default
  const config = calculatorId && CALCULATOR_CHARTS[calculatorId]
    ? CALCULATOR_CHARTS[calculatorId]
    : DEFAULT_CONFIG;

  // Dark theme colors for bars
  const colors = ['#a855f7', '#10b981', '#06b6d4', '#f59e0b', '#f43f5e'];

  // Custom tooltip styles for dark theme
  const tooltipStyle = {
    backgroundColor: '#18181b',
    border: '1px solid #3f3f46',
    borderRadius: '8px',
  };

  // Custom tooltip formatter to display clean values
  const formatTooltipValue = (value: number, name: string) => {
    // Format based on metric type
    if (name.toLowerCase().includes('%') || name.toLowerCase().includes('roi') || name.toLowerCase().includes('rate') || name.toLowerCase().includes('irr') || name.toLowerCase().includes('cap')) {
      return `${value.toFixed(1)}%`;
    }
    if (name.toLowerCase().includes('score') || name.toLowerCase().includes('index')) {
      return value.toFixed(0);
    }
    // Currency values
    if (value >= 1_000_000) return '$' + (value / 1_000_000).toFixed(1) + 'M';
    if (value >= 1_000) return '$' + (value / 1_000).toFixed(0) + 'K';
    if (Number.isInteger(value)) return value.toString();
    return value.toFixed(1);
  };

  // Check if any chart has data
  const hasChartData = config.charts.some(chart =>
    chart.metrics.some(metric =>
      allScenarios.some(s => {
        const val = s.results[metric.key];
        return val !== undefined && val !== null && val !== 0 && !isNaN(Number(val));
      })
    )
  );

  // Filter winners to only show those with data
  const validWinners = config.winners.filter(winner =>
    allScenarios.some(s => {
      const val = s.results[winner.key];
      return val !== undefined && val !== null && val !== 0 && !isNaN(Number(val));
    })
  );

  if (!hasChartData && validWinners.length === 0) {
    return null; // Don't render if no data
  }

  return (
    <div className="space-y-6">
      {/* Calculator-specific charts */}
      {config.charts.map((chart, chartIdx) => {
        // Check if this specific chart has data
        const chartHasData = chart.metrics.some(metric =>
          allScenarios.some(s => {
            const val = s.results[metric.key];
            return val !== undefined && val !== null && val !== 0 && !isNaN(Number(val));
          })
        );

        if (!chartHasData) return null;

        const chartData = allScenarios.map(s => ({
          name: s.name,
          ...chart.metrics.reduce((acc, metric) => {
            acc[metric.key] = Number(s.results[metric.key]) || 0;
            return acc;
          }, {} as Record<string, number>),
        }));

        return (
          <div key={chartIdx} className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">{chart.title}</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
                <XAxis
                  dataKey="name"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  tick={{ fill: '#a1a1aa', fontSize: 12 }}
                />
                {chart.metrics.length === 1 ? (
                  <YAxis
                    tick={{ fill: '#a1a1aa' }}
                    label={{ value: chart.metrics[0].label, angle: -90, position: 'insideLeft', fill: '#a1a1aa' }}
                  />
                ) : (
                  <>
                    <YAxis
                      yAxisId="left"
                      tick={{ fill: '#a1a1aa' }}
                      label={{ value: chart.metrics[0].label, angle: -90, position: 'insideLeft', fill: '#a1a1aa' }}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      tick={{ fill: '#a1a1aa' }}
                      label={{ value: chart.metrics[1]?.label || '', angle: 90, position: 'insideRight', fill: '#a1a1aa' }}
                    />
                  </>
                )}
                <Tooltip
                  contentStyle={tooltipStyle}
                  labelStyle={{ color: '#a1a1aa' }}
                  itemStyle={{ color: '#fff' }}
                  formatter={(value: number, name: string) => [formatTooltipValue(value, name), name]}
                />
                <Legend wrapperStyle={{ color: '#a1a1aa' }} />
                {chart.metrics.map((metric, idx) => (
                  <Bar
                    key={metric.key}
                    yAxisId={chart.metrics.length === 1 ? undefined : (idx === 0 ? 'left' : 'right')}
                    dataKey={metric.key}
                    fill={metric.color}
                    name={metric.label}
                    radius={[4, 4, 0, 0]}
                  >
                    {chartData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={idx === 0 ? colors[index % colors.length] : metric.color} />
                    ))}
                  </Bar>
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        );
      })}

      {/* Scenario Winners - only show if we have valid winners */}
      {validWinners.length > 0 && (
        <div className={`grid grid-cols-1 ${validWinners.length === 2 ? 'md:grid-cols-2' : 'md:grid-cols-3'} gap-4`}>
          {validWinners.map((winnerConfig, idx) => {
            const scenariosWithData = allScenarios.filter(s => {
              const val = s.results[winnerConfig.key];
              return val !== undefined && val !== null && !isNaN(Number(val));
            });

            if (scenariosWithData.length === 0) return null;

            const winner = scenariosWithData.reduce((a, b) => {
              const aVal = Number(a.results[winnerConfig.key]) || (winnerConfig.higher ? -Infinity : Infinity);
              const bVal = Number(b.results[winnerConfig.key]) || (winnerConfig.higher ? -Infinity : Infinity);
              return winnerConfig.higher ? (aVal > bVal ? a : b) : (aVal < bVal ? a : b);
            });

            return (
              <ScenarioWinnerCard
                key={idx}
                title={winnerConfig.title}
                winner={winner}
                metric={(s) => winnerConfig.format(Number(s.results[winnerConfig.key]) || 0)}
                color={winnerConfig.color}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

function ScenarioWinnerCard({
  title,
  winner,
  metric,
  color,
}: {
  title: string;
  winner: ProjectScenario;
  metric: (s: ProjectScenario) => string;
  color: 'emerald' | 'cyan' | 'amber' | 'purple';
}) {
  const colorClasses = {
    emerald: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
    cyan: 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400',
    amber: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
    purple: 'bg-purple-500/10 border-purple-500/20 text-purple-400',
  };

  const iconColors = {
    emerald: 'text-emerald-400',
    cyan: 'text-cyan-400',
    amber: 'text-amber-400',
    purple: 'text-purple-400',
  };

  return (
    <div className={`rounded-xl border p-4 ${colorClasses[color]}`}>
      <h4 className="text-sm font-semibold text-zinc-300 mb-2">{title}</h4>
      <div className="space-y-1">
        <svg className={`w-7 h-7 ${iconColors[color]}`} fill="currentColor" viewBox="0 0 24 24">
          <path d="M5 3h14v2h-1v1.07A7.997 7.997 0 0 1 20 13v1h1v2h-4v3h2v2H5v-2h2v-3H3v-2h1v-1a7.997 7.997 0 0 1 2-6.93V5H5V3zm4 2v1.07c.322-.045.652-.07.988-.07H14c.336 0 .666.025.988.07V5H9zm3 3a5 5 0 0 0-5 5v1h10v-1a5 5 0 0 0-5-5z"/>
        </svg>
        <div className="text-sm font-semibold text-white">{winner.name}</div>
        <div className={`text-xs ${colorClasses[color].split(' ').pop()}`}>{metric(winner)}</div>
      </div>
    </div>
  );
}

function formatCurrency(value: number): string {
  if (value >= 1_000_000) return '$' + (value / 1_000_000).toFixed(1) + 'M';
  if (value >= 1_000) return '$' + (value / 1_000).toFixed(0) + 'K';
  return '$' + value.toFixed(0);
}
