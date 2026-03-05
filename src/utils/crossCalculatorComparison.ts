// Cross-Calculator Comparison Utility
// Maps different calculator metrics to universal comparison categories

import type { PortfolioProject } from '../types/portfolio';

export interface UniversalMetrics {
  // Universal metrics that apply to all calculators
  capitalRequired: number;
  capitalLabel: string;

  // Primary return metric (calculator-specific)
  primaryReturn: number | null;
  primaryReturnLabel: string;
  primaryReturnFormat: 'percent' | 'currency' | 'ratio';

  // Cash flow indicator
  cashFlowIndicator: number | null;
  cashFlowLabel: string;
  cashFlowPeriod: 'monthly' | 'annual' | 'total';

  // Time-based metric
  timeMetric: number | null;
  timeMetricLabel: string;
  timeMetricUnit: 'months' | 'years' | null;

  // Calculator category for grouping
  category: 'return-analysis' | 'income-analysis' | 'financing-tool' | 'risk-tool';
  categoryLabel: string;

  // What this calculator measures (for tooltips)
  calculatorPurpose: string;
}

export interface ComparisonInsight {
  type: 'warning' | 'info' | 'comparison';
  message: string;
}

const CALCULATOR_LABELS: Record<string, string> = {
  'xirr': 'XIRR Analysis',
  'irr': 'IRR Analysis',
  'npv': 'NPV Analysis',
  'rental-roi': 'Rental ROI',
  'rental-projection': 'Rental Projection',
  'cap-rate': 'Cap Rate',
  'cashflow': 'Cash Flow',
  'dev-feasibility': 'Development',
  'mortgage': 'Mortgage',
  'financing': 'Financing',
  'indonesia-tax': 'Tax Calculator',
  'dev-budget': 'Dev Budget',
  'risk-assessment': 'Risk Assessment',
};

export function getCalculatorLabel(calculatorId: string): string {
  return CALCULATOR_LABELS[calculatorId] || calculatorId;
}

export function extractUniversalMetrics(project: PortfolioProject): UniversalMetrics {
  const data = project.data || {};
  const result = data.result || {};

  switch (project.calculatorId) {
    case 'xirr':
      return {
        capitalRequired: result.totalInvested || project.totalInvestment,
        capitalLabel: 'Total Invested',
        primaryReturn: project.roi, // Already stored as percentage
        primaryReturnLabel: 'XIRR',
        primaryReturnFormat: 'percent',
        cashFlowIndicator: result.netProfit || null,
        cashFlowLabel: 'Net Profit',
        cashFlowPeriod: 'total',
        timeMetric: result.holdPeriodMonths || null,
        timeMetricLabel: 'Hold Period',
        timeMetricUnit: 'months',
        category: 'return-analysis',
        categoryLabel: 'Exit Return',
        calculatorPurpose: 'Measures annualized return including timing of all cash flows',
      };

    case 'irr':
      return {
        capitalRequired: result.totalInvested || project.totalInvestment,
        capitalLabel: 'Initial Investment',
        primaryReturn: project.roi || result.irr,
        primaryReturnLabel: 'IRR',
        primaryReturnFormat: 'percent',
        cashFlowIndicator: result.totalCashFlow || null,
        cashFlowLabel: 'Total Cash Flow',
        cashFlowPeriod: 'total',
        timeMetric: result.paybackPeriod ? result.paybackPeriod * 12 : project.breakEvenMonths,
        timeMetricLabel: 'Payback',
        timeMetricUnit: 'months',
        category: 'return-analysis',
        categoryLabel: 'Investment Return',
        calculatorPurpose: 'Measures internal rate of return over investment period',
      };

    case 'npv':
      return {
        capitalRequired: result.totalCashOutflows || project.totalInvestment,
        capitalLabel: 'Total Outflows',
        primaryReturn: result.npv ?? null,
        primaryReturnLabel: 'NPV',
        primaryReturnFormat: 'currency',
        cashFlowIndicator: result.netCashFlow || null,
        cashFlowLabel: 'Net Cash Flow',
        cashFlowPeriod: 'total',
        timeMetric: data.projectLength ? data.projectLength * 12 : null,
        timeMetricLabel: 'Project Length',
        timeMetricUnit: 'months',
        category: 'return-analysis',
        categoryLabel: 'Value Analysis',
        calculatorPurpose: 'Measures net present value at given discount rate',
      };

    case 'rental-roi':
      return {
        capitalRequired: data.initialInvestment || project.totalInvestment,
        capitalLabel: 'Initial Investment',
        primaryReturn: data.averages?.roiAfterManagement || project.roi,
        primaryReturnLabel: 'Annual ROI',
        primaryReturnFormat: 'percent',
        cashFlowIndicator: data.averages?.takeHomeProfit || project.avgCashFlow * 12,
        cashFlowLabel: 'Annual Profit',
        cashFlowPeriod: 'annual',
        timeMetric: project.breakEvenMonths,
        timeMetricLabel: 'Break-even',
        timeMetricUnit: 'months',
        category: 'income-analysis',
        categoryLabel: 'Rental Income',
        calculatorPurpose: 'Measures rental property ROI with management costs',
      };

    case 'rental-projection':
      return {
        capitalRequired: project.totalInvestment,
        capitalLabel: 'Est. Property Value',
        primaryReturn: result.annualNetIncome && project.totalInvestment
          ? (result.annualNetIncome / project.totalInvestment) * 100
          : project.roi,
        primaryReturnLabel: 'Net Yield',
        primaryReturnFormat: 'percent',
        cashFlowIndicator: result.annualNetIncome || project.avgCashFlow * 12,
        cashFlowLabel: 'Annual Net Income',
        cashFlowPeriod: 'annual',
        timeMetric: result.breakEvenMonths || project.breakEvenMonths,
        timeMetricLabel: 'Break-even',
        timeMetricUnit: 'months',
        category: 'income-analysis',
        categoryLabel: 'Rental Projection',
        calculatorPurpose: 'Projects rental income based on occupancy and rates',
      };

    case 'cap-rate':
      return {
        capitalRequired: data.propertyValue || project.totalInvestment,
        capitalLabel: 'Property Value',
        primaryReturn: result.adjustedCapRate || result.capRate || project.roi,
        primaryReturnLabel: 'Cap Rate',
        primaryReturnFormat: 'percent',
        cashFlowIndicator: result.yearlyNOI || (result.monthlyNOI ? result.monthlyNOI * 12 : null),
        cashFlowLabel: 'Annual NOI',
        cashFlowPeriod: 'annual',
        timeMetric: null,
        timeMetricLabel: '',
        timeMetricUnit: null,
        category: 'income-analysis',
        categoryLabel: 'Valuation',
        calculatorPurpose: 'Measures property value relative to net operating income',
      };

    case 'cashflow':
      return {
        capitalRequired: project.totalInvestment,
        capitalLabel: 'Property Value',
        primaryReturn: project.roi,
        primaryReturnLabel: 'Cash-on-Cash',
        primaryReturnFormat: 'percent',
        cashFlowIndicator: project.avgCashFlow,
        cashFlowLabel: 'Monthly Net',
        cashFlowPeriod: 'monthly',
        timeMetric: project.breakEvenMonths,
        timeMetricLabel: 'Break-even',
        timeMetricUnit: 'months',
        category: 'income-analysis',
        categoryLabel: 'Cash Flow',
        calculatorPurpose: 'Analyzes monthly rental cash flow after all expenses',
      };

    case 'dev-feasibility':
      const scenario = data.scenarios?.[0] || {};
      return {
        capitalRequired: scenario.totalProjectCost || project.totalInvestment,
        capitalLabel: 'Total Project Cost',
        primaryReturn: scenario.roiFlip || scenario.roiHold || project.roi,
        primaryReturnLabel: 'Dev Margin',
        primaryReturnFormat: 'percent',
        cashFlowIndicator: scenario.grossProfit || null,
        cashFlowLabel: 'Gross Profit',
        cashFlowPeriod: 'total',
        timeMetric: scenario.constructionMonths || null,
        timeMetricLabel: 'Construction',
        timeMetricUnit: 'months',
        category: 'return-analysis',
        categoryLabel: 'Development',
        calculatorPurpose: 'Analyzes development project profitability',
      };

    case 'mortgage':
    case 'financing':
      return {
        capitalRequired: data.loanAmount || project.totalInvestment,
        capitalLabel: 'Loan Amount',
        primaryReturn: data.interestRate || result.effectiveRate || null,
        primaryReturnLabel: 'Interest Rate',
        primaryReturnFormat: 'percent',
        cashFlowIndicator: result.monthlyPayment ? -result.monthlyPayment : project.avgCashFlow,
        cashFlowLabel: 'Monthly Payment',
        cashFlowPeriod: 'monthly',
        timeMetric: (data.loanTerm || data.loanTermYears || 0) * 12,
        timeMetricLabel: 'Loan Term',
        timeMetricUnit: 'months',
        category: 'financing-tool',
        categoryLabel: 'Financing',
        calculatorPurpose: 'Calculates loan payments and total interest costs',
      };

    case 'risk-assessment':
      return {
        capitalRequired: data.propertyValue || data.investmentAmount || project.totalInvestment,
        capitalLabel: 'Investment',
        primaryReturn: data.riskScore || null,
        primaryReturnLabel: 'Risk Score',
        primaryReturnFormat: 'ratio',
        cashFlowIndicator: null,
        cashFlowLabel: '',
        cashFlowPeriod: 'monthly',
        timeMetric: null,
        timeMetricLabel: '',
        timeMetricUnit: null,
        category: 'risk-tool',
        categoryLabel: 'Risk Analysis',
        calculatorPurpose: 'Assesses investment risk factors',
      };

    default:
      return {
        capitalRequired: project.totalInvestment,
        capitalLabel: 'Investment',
        primaryReturn: project.roi || null,
        primaryReturnLabel: 'ROI',
        primaryReturnFormat: 'percent',
        cashFlowIndicator: project.avgCashFlow || null,
        cashFlowLabel: 'Avg Cash Flow',
        cashFlowPeriod: 'monthly',
        timeMetric: project.breakEvenMonths || null,
        timeMetricLabel: 'Break-even',
        timeMetricUnit: 'months',
        category: 'return-analysis',
        categoryLabel: 'Analysis',
        calculatorPurpose: 'Investment analysis',
      };
  }
}

export function formatMetricValue(
  value: number | null,
  format: 'percent' | 'currency' | 'ratio',
  currency: string = 'IDR'
): string {
  if (value === null || value === undefined) return 'N/A';

  switch (format) {
    case 'percent':
      return `${value.toFixed(1)}%`;
    case 'currency':
      if (Math.abs(value) >= 1_000_000_000) {
        return `${(value / 1_000_000_000).toFixed(1)}B`;
      }
      if (Math.abs(value) >= 1_000_000) {
        return `${(value / 1_000_000).toFixed(1)}M`;
      }
      if (Math.abs(value) >= 1_000) {
        return `${(value / 1_000).toFixed(0)}K`;
      }
      return value.toLocaleString();
    case 'ratio':
      return value.toFixed(0);
    default:
      return String(value);
  }
}

export function formatCashFlow(
  value: number | null,
  period: 'monthly' | 'annual' | 'total'
): string {
  if (value === null || value === undefined) return 'N/A';

  const absValue = Math.abs(value);
  let formatted: string;

  if (absValue >= 1_000_000_000) {
    formatted = `${(value / 1_000_000_000).toFixed(1)}B`;
  } else if (absValue >= 1_000_000) {
    formatted = `${(value / 1_000_000).toFixed(1)}M`;
  } else if (absValue >= 1_000) {
    formatted = `${(value / 1_000).toFixed(0)}K`;
  } else {
    formatted = value.toLocaleString();
  }

  const suffix = period === 'monthly' ? '/mo' : period === 'annual' ? '/yr' : '';
  return formatted + suffix;
}

export function formatTimeMetric(months: number | null, unit: 'months' | 'years' | null): string {
  if (months === null || months === undefined || unit === null) return 'N/A';

  if (months >= 24) {
    return `${(months / 12).toFixed(1)}y`;
  }
  return `${Math.round(months)}m`;
}

export function generateComparisonInsights(projects: PortfolioProject[]): ComparisonInsight[] {
  const insights: ComparisonInsight[] = [];
  const metrics = projects.map(p => ({
    project: p,
    metrics: extractUniversalMetrics(p),
  }));

  // Check if comparing different calculator categories
  const categories = new Set(metrics.map(m => m.metrics.category));
  if (categories.size > 1) {
    const categoryLabels = metrics.map(m => m.metrics.categoryLabel);
    insights.push({
      type: 'warning',
      message: `Comparing different analysis types: ${[...new Set(categoryLabels)].join(', ')}. Metrics may not be directly comparable.`,
    });
  }

  // Find best performers in each category
  const returnProjects = metrics.filter(m =>
    m.metrics.category === 'return-analysis' || m.metrics.category === 'income-analysis'
  );

  if (returnProjects.length >= 2) {
    const sorted = [...returnProjects].sort((a, b) =>
      (b.metrics.primaryReturn || 0) - (a.metrics.primaryReturn || 0)
    );

    if (sorted[0].metrics.primaryReturn && sorted[0].metrics.primaryReturn > 0) {
      insights.push({
        type: 'comparison',
        message: `Highest return: "${sorted[0].project.projectName}" with ${sorted[0].metrics.primaryReturnLabel} of ${formatMetricValue(sorted[0].metrics.primaryReturn, sorted[0].metrics.primaryReturnFormat)}`,
      });
    }
  }

  // Compare capital requirements
  const capitalSorted = [...metrics].sort((a, b) =>
    a.metrics.capitalRequired - b.metrics.capitalRequired
  );

  if (metrics.length >= 2 && capitalSorted[0].metrics.capitalRequired > 0) {
    const ratio = capitalSorted[capitalSorted.length - 1].metrics.capitalRequired / capitalSorted[0].metrics.capitalRequired;
    if (ratio > 2) {
      insights.push({
        type: 'info',
        message: `Capital range: ${formatMetricValue(capitalSorted[0].metrics.capitalRequired, 'currency')} to ${formatMetricValue(capitalSorted[capitalSorted.length - 1].metrics.capitalRequired, 'currency')}`,
      });
    }
  }

  // Check for financing vs investment comparison
  const hasFinancing = metrics.some(m => m.metrics.category === 'financing-tool');
  const hasInvestment = metrics.some(m => m.metrics.category !== 'financing-tool' && m.metrics.category !== 'risk-tool');

  if (hasFinancing && hasInvestment) {
    insights.push({
      type: 'info',
      message: 'Financing tools show costs (interest/payments), while investment tools show returns.',
    });
  }

  return insights;
}

// Get category color for visual grouping
export function getCategoryColor(category: string): string {
  switch (category) {
    case 'return-analysis':
      return 'emerald';
    case 'income-analysis':
      return 'cyan';
    case 'financing-tool':
      return 'amber';
    case 'risk-tool':
      return 'purple';
    default:
      return 'zinc';
  }
}

export function getCategoryBadgeClasses(category: string): string {
  const color = getCategoryColor(category);
  return `bg-${color}-500/20 text-${color}-400 border-${color}-500/30`;
}
