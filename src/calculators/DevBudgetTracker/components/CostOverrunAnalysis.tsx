import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { formatCurrency } from '../../../utils/numberParsing';

interface Props {
  inputs: {
    landCost: number;
    landActual: number;
    constructionHard: number;
    constructionHardActual: number;
    softCosts: number;
    softCostsActual: number;
    contingency: number;
    contingencyActual: number;
    financing: number;
    financingActual: number;
    marketing: number;
    marketingActual: number;
    currentMonth: number;
    totalProjectDuration: number;
    phases: Array<{
      id: string;
      name: string;
      status: string;
      completionPercent: number;
      budgetPercent: number;
    }>;
  };
  calculations: {
    totalBudgeted: number;
    totalActual: number;
    variance: number;
    variancePercent: number;
    expectedSpend: number;
    spendVariance: number;
    healthScore: number;
    contingencyRemaining: number;
    contingencyUsedPercent: number;
    overallCompletion: number;
    timelineProgress: number;
  };
  symbol: string;
  currency: 'IDR' | 'USD' | 'AUD' | 'EUR' | 'GBP';
}

const COLORS = ['#10b981', '#06b6d4', '#a855f7', '#f59e0b', '#3b82f6', '#ec4899'];

export function CostOverrunAnalysis({ inputs, calculations, symbol, currency }: Props) {
  // Budget distribution data
  const budgetDistribution = [
    { name: 'Land', value: inputs.landCost, actual: inputs.landActual },
    { name: 'Construction', value: inputs.constructionHard, actual: inputs.constructionHardActual },
    { name: 'Soft Costs', value: inputs.softCosts, actual: inputs.softCostsActual },
    { name: 'Contingency', value: inputs.contingency, actual: inputs.contingencyActual },
    { name: 'Financing', value: inputs.financing, actual: inputs.financingActual },
    { name: 'Marketing', value: inputs.marketing, actual: inputs.marketingActual },
  ];

  // Calculate overrun categories
  const overruns = budgetDistribution
    .map(item => ({
      name: item.name,
      budgeted: item.value,
      actual: item.actual,
      variance: item.actual - item.value,
      variancePercent: item.value > 0 ? ((item.actual - item.value) / item.value) * 100 : 0,
    }))
    .filter(item => item.variance > 0)
    .sort((a, b) => b.variance - a.variance);

  const underruns = budgetDistribution
    .map(item => ({
      name: item.name,
      budgeted: item.value,
      actual: item.actual,
      variance: item.actual - item.value,
      variancePercent: item.value > 0 ? ((item.actual - item.value) / item.value) * 100 : 0,
    }))
    .filter(item => item.variance < 0)
    .sort((a, b) => a.variance - b.variance);

  // Risk factors
  const riskFactors = [];

  if (calculations.variancePercent > 10) {
    riskFactors.push({
      level: 'high',
      title: 'Significant Budget Overrun',
      description: `Project is ${calculations.variancePercent.toFixed(1)}% over budget. Review all major cost categories.`,
    });
  } else if (calculations.variancePercent > 5) {
    riskFactors.push({
      level: 'medium',
      title: 'Moderate Budget Variance',
      description: `Project is ${calculations.variancePercent.toFixed(1)}% over budget. Monitor closely.`,
    });
  }

  if (calculations.contingencyUsedPercent > 75) {
    riskFactors.push({
      level: 'high',
      title: 'Contingency Nearly Exhausted',
      description: `${calculations.contingencyUsedPercent.toFixed(0)}% of contingency has been used with ${(100 - calculations.timelineProgress).toFixed(0)}% of project remaining.`,
    });
  } else if (calculations.contingencyUsedPercent > 50) {
    riskFactors.push({
      level: 'medium',
      title: 'Contingency Usage High',
      description: `${calculations.contingencyUsedPercent.toFixed(0)}% of contingency used. Consider increasing reserve.`,
    });
  }

  const delayedPhases = inputs.phases.filter(p => p.status === 'delayed');
  if (delayedPhases.length > 0) {
    riskFactors.push({
      level: 'high',
      title: 'Schedule Delays Detected',
      description: `${delayedPhases.length} phase(s) are delayed: ${delayedPhases.map(p => p.name).join(', ')}.`,
    });
  }

  if (calculations.overallCompletion < calculations.timelineProgress - 10) {
    riskFactors.push({
      level: 'medium',
      title: 'Behind Schedule',
      description: `Project is ${(calculations.timelineProgress - calculations.overallCompletion).toFixed(0)}% behind expected progress.`,
    });
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-3 shadow-lg">
          <p className="text-white font-medium">{data.name}</p>
          <p className="text-sm text-zinc-400">
            {symbol} {formatCurrency(data.value, currency)}
          </p>
          <p className="text-xs text-zinc-500">
            {((data.value / calculations.totalBudgeted) * 100).toFixed(1)}% of budget
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Risk Summary */}
      {riskFactors.length > 0 && (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
          <h3 className="text-lg font-bold text-white mb-4">Risk Assessment</h3>
          <div className="space-y-3">
            {riskFactors.map((risk, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border ${
                  risk.level === 'high'
                    ? 'bg-red-500/10 border-red-500/30'
                    : 'bg-amber-500/10 border-amber-500/30'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  {risk.level === 'high' ? (
                    <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  )}
                  <h4 className={`font-bold text-sm ${risk.level === 'high' ? 'text-red-400' : 'text-amber-400'}`}>
                    {risk.title}
                  </h4>
                </div>
                <p className="text-xs text-zinc-300">{risk.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Budget Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
          <h3 className="text-lg font-bold text-white mb-4">Budget Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={budgetDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {budgetDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  formatter={(value) => <span className="text-zinc-300 text-xs">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
          <h3 className="text-lg font-bold text-white mb-4">Spend Analysis</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg">
              <span className="text-zinc-400">Expected Spend (by timeline)</span>
              <span className="text-white font-bold">
                {symbol} {formatCurrency(calculations.expectedSpend, currency)}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg">
              <span className="text-zinc-400">Actual Spend</span>
              <span className="text-white font-bold">
                {symbol} {formatCurrency(calculations.totalActual, currency)}
              </span>
            </div>
            <div className={`flex items-center justify-between p-3 rounded-lg ${
              calculations.spendVariance > 0 ? 'bg-red-500/10' : 'bg-emerald-500/10'
            }`}>
              <span className="text-zinc-400">Spend Variance</span>
              <span className={`font-bold ${calculations.spendVariance > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                {calculations.spendVariance > 0 ? '+' : ''}{symbol} {formatCurrency(calculations.spendVariance, currency)}
              </span>
            </div>
            <div className="pt-2 border-t border-zinc-700">
              <p className="text-xs text-zinc-500">
                {calculations.spendVariance > 0
                  ? `Spending ahead of schedule by ${symbol} ${formatCurrency(calculations.spendVariance, currency)}. This could indicate scope creep or accelerated work.`
                  : `Spending below expected by ${symbol} ${formatCurrency(Math.abs(calculations.spendVariance), currency)}. Verify that work is progressing on schedule.`
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Cost Overruns and Savings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Overruns */}
        <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-6">
          <h3 className="text-lg font-bold text-red-400 mb-4">Cost Overruns</h3>
          {overruns.length > 0 ? (
            <div className="space-y-3">
              {overruns.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg">
                  <div>
                    <p className="text-white font-medium">{item.name}</p>
                    <p className="text-xs text-zinc-500">
                      Budget: {symbol} {formatCurrency(item.budgeted, currency)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-red-400 font-bold">
                      +{symbol} {formatCurrency(item.variance, currency)}
                    </p>
                    <p className="text-xs text-red-400/70">+{item.variancePercent.toFixed(1)}%</p>
                  </div>
                </div>
              ))}
              <div className="pt-3 border-t border-zinc-700">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Total Overruns</span>
                  <span className="text-red-400 font-bold">
                    +{symbol} {formatCurrency(overruns.reduce((sum, o) => sum + o.variance, 0), currency)}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-zinc-500 text-center py-4">No cost overruns detected</p>
          )}
        </div>

        {/* Savings */}
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-6">
          <h3 className="text-lg font-bold text-emerald-400 mb-4">Cost Savings</h3>
          {underruns.length > 0 ? (
            <div className="space-y-3">
              {underruns.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg">
                  <div>
                    <p className="text-white font-medium">{item.name}</p>
                    <p className="text-xs text-zinc-500">
                      Budget: {symbol} {formatCurrency(item.budgeted, currency)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-emerald-400 font-bold">
                      {symbol} {formatCurrency(Math.abs(item.variance), currency)}
                    </p>
                    <p className="text-xs text-emerald-400/70">{item.variancePercent.toFixed(1)}%</p>
                  </div>
                </div>
              ))}
              <div className="pt-3 border-t border-zinc-700">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Total Savings</span>
                  <span className="text-emerald-400 font-bold">
                    {symbol} {formatCurrency(Math.abs(underruns.reduce((sum, u) => sum + u.variance, 0)), currency)}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-zinc-500 text-center py-4">No savings detected</p>
          )}
        </div>
      </div>

      {/* Recommendations */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
        <h3 className="text-lg font-bold text-white mb-4">Recommendations</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {calculations.variancePercent > 5 && (
            <div className="p-4 bg-zinc-800/50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <h4 className="font-medium text-white">Review Major Costs</h4>
              </div>
              <p className="text-xs text-zinc-400">
                Analyze the largest overrun categories and identify cost-saving opportunities or scope adjustments.
              </p>
            </div>
          )}

          {calculations.contingencyUsedPercent > 50 && (
            <div className="p-4 bg-zinc-800/50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <h4 className="font-medium text-white">Replenish Contingency</h4>
              </div>
              <p className="text-xs text-zinc-400">
                Consider increasing the contingency reserve to cover potential future overruns.
              </p>
            </div>
          )}

          {delayedPhases.length > 0 && (
            <div className="p-4 bg-zinc-800/50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <h4 className="font-medium text-white">Address Delays</h4>
              </div>
              <p className="text-xs text-zinc-400">
                Identify root causes for delays and develop mitigation strategies to prevent further schedule slippage.
              </p>
            </div>
          )}

          <div className="p-4 bg-zinc-800/50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h4 className="font-medium text-white">Regular Updates</h4>
            </div>
            <p className="text-xs text-zinc-400">
              Update actuals weekly to maintain accurate project tracking and enable early issue detection.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CostOverrunAnalysis;
