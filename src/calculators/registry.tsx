import { lazy } from 'react';
import type { CalculatorConfig } from './types';

// Lazy load calculators for better performance
const XIRRCalculator = lazy(() => import('./XIRRCalculator'));
const RentalROICalculator = lazy(() => import('./RentalROI'));
const MortgageCalculator = lazy(() => import('./MortgageCalculator'));
const CashFlowProjector = lazy(() => import('./CashFlowProjector'));
const DevFeasibilityCalculator = lazy(() => import('./DevFeasibility'));
const CapRateCalculator = lazy(() => import('./CapRateCalculator'));
const IRRCalculator = lazy(() => import('./IRRCalculator'));
const NPVCalculator = lazy(() => import('./NPVCalculator'));

export const CALCULATORS: CalculatorConfig[] = [
  {
    id: 'xirr',
    name: 'XIRR Calculator',
    shortName: 'XIRR',
    description: 'Calculate internal rate of return for villa flip investments with irregular cash flows',
    icon: 'trending_up',
    color: 'indigo',
    component: XIRRCalculator,
    tags: ['flip', 'irr', 'investment', 'returns'],
  },
  {
    id: 'rental-roi',
    name: '10 Year Annualized ROI',
    shortName: 'Annualized ROI',
    description: 'Project rental income and ROI over a 10-year investment horizon',
    icon: 'home_work',
    color: 'indigo',
    component: RentalROICalculator,
    tags: ['rental', 'income', 'long-term', 'projections', 'annualized'],
  },
  {
    id: 'mortgage',
    name: 'Mortgage Calculator',
    shortName: 'Mortgage',
    description: 'Calculate monthly payments, amortization schedules, and loan analysis',
    icon: 'account_balance',
    color: 'cyan',
    component: MortgageCalculator,
    tags: ['mortgage', 'loan', 'payments', 'financing', 'interest'],
  },
  {
    id: 'cashflow',
    name: 'Cash Flow Projector',
    shortName: 'Cash Flow',
    description: 'Project rental income, expenses, and cash flow over multiple years with vacancy rates',
    icon: 'payments',
    color: 'green',
    component: CashFlowProjector,
    tags: ['cashflow', 'income', 'expenses', 'rental', 'projections'],
  },
  {
    id: 'dev-feasibility',
    name: 'Development Feasibility',
    shortName: 'Dev Feasibility',
    description: 'Analyze villa development projects: land costs, construction, ROI for flip vs hold strategies',
    icon: 'construction',
    color: 'orange',
    component: DevFeasibilityCalculator,
    tags: ['development', 'feasibility', 'construction', 'project', 'multi-unit'],
  },
  {
    id: 'cap-rate',
    name: 'Cap Rate Analysis',
    shortName: 'Cap Rate',
    description: 'Calculate capitalization rate (Cap Rate): annual NOI divided by property value',
    icon: 'trending_up',
    color: 'purple',
    component: CapRateCalculator,
    tags: ['caprate', 'real-estate', 'yield', 'investment', 'analysis'],
  },
  {
    id: 'irr',
    name: 'IRR Calculator',
    shortName: 'IRR',
    description: 'Internal Rate of Return: the annualized return rate across variable cash flows',
    icon: 'show_chart',
    color: 'rose',
    component: IRRCalculator,
    tags: ['irr', 'return', 'investment', 'analysis', 'discount-rate'],
  },
  {
    id: 'npv',
    name: 'NPV Calculator',
    shortName: 'NPV',
    description: 'Net Present Value: present value of future cash flows at a discount rate',
    icon: 'calculate',
    color: 'cyan',
    component: NPVCalculator,
    tags: ['npv', 'present-value', 'discount', 'investment', 'analysis'],
  },
];

export function getCalculatorById(id: string): CalculatorConfig | undefined {
  return CALCULATORS.find(calc => calc.id === id);
}

export function getCalculatorsByTag(tag: string): CalculatorConfig[] {
  return CALCULATORS.filter(calc => calc.tags.includes(tag.toLowerCase()));
}
