import { lazy } from 'react';

const MortgageCalculatorComp = lazy(() =>
  import('./MortgageCalculator/index').then(m => ({ default: m.MortgageCalculator }))
);

const RentalROIComp = lazy(() =>
  import('./RentalROI/index').then(m => ({ default: m.RentalROICalculator }))
);

const XIRRCalculatorComp = lazy(() =>
  import('./XIRRCalculator/index').then(m => ({ default: m.XIRRCalculator }))
);

const CashFlowProjectorComp = lazy(() =>
  import('./CashFlowProjector/index').then(m => ({ default: m.CashFlowProjector }))
);

const CapRateCalculatorComp = lazy(() =>
  import('./CapRateCalculator/index').then(m => ({ default: m.CapRateCalculator }))
);

const IRRCalculatorComp = lazy(() =>
  import('./IRRCalculator/index').then(m => ({ default: m.IRRCalculator }))
);

const NPVCalculatorComp = lazy(() =>
  import('./NPVCalculator/index').then(m => ({ default: m.NPVCalculator }))
);

const DevFeasibilityComp = lazy(() =>
  import('./DevFeasibility/index').then(m => ({ default: m.DevFeasibilityCalculator }))
);

const IndonesiaTaxOptimizerComp = lazy(() =>
  import('./IndonesiaTaxOptimizer/index').then(m => ({ default: m.IndonesiaTaxOptimizer }))
);

const RentalIncomeProjectionComp = lazy(() =>
  import('./RentalIncomeProjection/index').then(m => ({ default: m.RentalIncomeProjection }))
);

const FinancingComparisonComp = lazy(() =>
  import('./FinancingComparison/index').then(m => ({ default: m.FinancingComparison }))
);

const DevBudgetTrackerComp = lazy(() =>
  import('./DevBudgetTracker/index').then(m => ({ default: m.DevBudgetTracker }))
);

const RiskAssessmentComp = lazy(() =>
  import('./RiskAssessment/index').then(m => ({ default: m.RiskAssessment }))
);

export interface Calculator {
  id: string;
  name: string;
  shortName: string;
  icon: string;
  description: string;
  useCases: string[];
  tags: string[];
  component: any;
}

export const CALCULATORS: Calculator[] = [
  {
    id: 'mortgage',
    name: 'Mortgage Calculator',
    shortName: 'Mortgage',
    icon: '💰',
    description: 'Analyze loan terms, monthly payments, and full amortization schedules',
    useCases: ['Financing', 'Payment Planning', 'Loan Comparison'],
    tags: ['financing', 'mortgage', 'loan'],
    component: MortgageCalculatorComp,
  },
  {
    id: 'rental-roi',
    name: 'Annualized ROI',
    shortName: 'Rental ROI',
    icon: '🏠',
    description: 'Project 10-year rental income and calculate annual returns with precision',
    useCases: ['Long-term Rentals', 'Income Projections', 'Hold Strategies'],
    tags: ['rental', 'roi', 'income'],
    component: RentalROIComp,
  },
  {
    id: 'xirr',
    name: 'XIRR Calculator',
    shortName: 'XIRR',
    icon: '📈',
    description: 'Calculate exact internal rate of return on villa flips and property investments',
    useCases: ['Villa Flips', 'Property Sales', 'Irregular Cash Flows'],
    tags: ['flip', 'xirr', 'returns'],
    component: XIRRCalculatorComp,
  },
  {
    id: 'cashflow',
    name: 'Cash Flow Projector',
    shortName: 'Cash Flow',
    icon: '💸',
    description: 'Model rental income, expenses, and net cash flow over multiple years',
    useCases: ['Expense Planning', 'Vacancy Analysis', 'Monthly Cash Flow'],
    tags: ['cashflow', 'rental', 'expenses'],
    component: CashFlowProjectorComp,
  },
  {
    id: 'cap-rate',
    name: 'Cap Rate Analysis',
    shortName: 'Cap Rate',
    icon: '📊',
    description: 'Calculate capitalization rate to compare investment property yields',
    useCases: ['Property Comparison', 'Yield Analysis', 'Valuation'],
    tags: ['caprate', 'yield', 'comparison'],
    component: CapRateCalculatorComp,
  },
  {
    id: 'irr',
    name: 'IRR Calculator',
    shortName: 'IRR',
    icon: '🎯',
    description: 'Determine annualized return across any investment cash flow stream',
    useCases: ['Complex Investments', 'Benchmarking', 'Discount Rate Analysis'],
    tags: ['irr', 'returns', 'analysis'],
    component: IRRCalculatorComp,
  },
  {
    id: 'npv',
    name: 'NPV Calculator',
    shortName: 'NPV',
    icon: '🔢',
    description: 'Calculate net present value of future cash flows at any discount rate',
    useCases: ['Project Valuation', 'Investment Decisions', 'Scenario Testing'],
    tags: ['npv', 'valuation', 'analysis'],
    component: NPVCalculatorComp,
  },
  {
    id: 'dev-feasibility',
    name: 'Development Feasibility',
    shortName: 'Dev Feasibility',
    icon: '🏗️',
    description: 'Evaluate land development projects: construction costs, timelines, ROI',
    useCases: ['New Projects', 'Construction Feasibility', 'Multi-unit Analysis'],
    tags: ['development', 'construction', 'feasibility'],
    component: DevFeasibilityComp,
  },
  {
    id: 'indonesia-tax',
    name: 'Indonesia Tax Optimizer',
    shortName: 'Tax Optimizer',
    icon: '🇮🇩',
    description: 'Optimize Indonesian real estate taxes with depreciation, deductions, and ownership analysis',
    useCases: ['Tax Planning', 'Ownership Structure', 'Bali Investments'],
    tags: ['tax', 'indonesia', 'depreciation', 'deductions', 'bali'],
    component: IndonesiaTaxOptimizerComp,
  },
  {
    id: 'rental-projection',
    name: 'Rental Income Projection',
    shortName: 'Rental Projection',
    icon: '📊',
    description: 'Advanced vacation rental projections with seasonality, occupancy curves, and dynamic pricing',
    useCases: ['Vacation Rentals', 'Airbnb Analysis', 'Seasonal Planning'],
    tags: ['rental', 'airbnb', 'seasonality', 'occupancy', 'vacation'],
    component: RentalIncomeProjectionComp,
  },
  {
    id: 'financing',
    name: 'Financing Comparison',
    shortName: 'Financing',
    icon: '🏦',
    description: 'Compare up to 4 loan options side-by-side with amortization and prepayment analysis',
    useCases: ['Loan Comparison', 'Refinancing', 'Development Financing'],
    tags: ['financing', 'loan', 'mortgage', 'comparison', 'bank'],
    component: FinancingComparisonComp,
  },
  {
    id: 'dev-budget',
    name: 'Development Budget Tracker',
    shortName: 'Budget Tracker',
    icon: '📋',
    description: 'Track construction budgets, timelines, cost overruns, and project health in real-time',
    useCases: ['Budget Tracking', 'Construction Management', 'Cost Control'],
    tags: ['budget', 'construction', 'tracking', 'timeline', 'development'],
    component: DevBudgetTrackerComp,
  },
  {
    id: 'risk-assessment',
    name: 'Risk Assessment & Rating',
    shortName: 'Risk Assessment',
    icon: '🎯',
    description: 'Comprehensive risk scoring with scenario analysis, sensitivity charts, and mitigation strategies',
    useCases: ['Risk Analysis', 'Investment Rating', 'Due Diligence'],
    tags: ['risk', 'assessment', 'rating', 'scenarios', 'sensitivity', 'mitigation'],
    component: RiskAssessmentComp,
  },
];

export function getCalculatorById(id: string): Calculator | undefined {
  return CALCULATORS.find(calc => calc.id === id);
}

export function searchCalculators(query: string): Calculator[] {
  const lowerQuery = query.toLowerCase();
  return CALCULATORS.filter(
    calc =>
      calc.name.toLowerCase().includes(lowerQuery) ||
      calc.shortName.toLowerCase().includes(lowerQuery) ||
      calc.description.toLowerCase().includes(lowerQuery) ||
      calc.tags.some(tag => tag.includes(lowerQuery))
  );
}
