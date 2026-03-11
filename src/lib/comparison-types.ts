// Comparison Feature Types

export type CalculatorType =
  | 'rental-roi'
  | 'xirr'
  | 'mortgage'
  | 'cashflow'
  | 'dev-feasibility'
  | 'cap-rate'
  | 'irr'
  | 'npv'
  | 'financing'
  | 'rental-projection'
  | 'indonesia-tax'
  | 'dev-budget'
  | 'risk-assessment'
  | 'brrrr';

export interface ComparisonMetrics {
  label: string;
  timestamp: number;
  calculatorType: CalculatorType;
  currency: string;
  investmentRating?: { grade: string; label: string };
}

export interface RentalROIComparisonData extends ComparisonMetrics {
  calculatorType: 'rental-roi';
  initialInvestment: number;
  y1ADR: number;
  y1Occupancy: number;
  keys: number;
  adrGrowth: number;
  incentiveFeePct: number;
  purchaseDate: string;
  propertyReadyDate: string;
  isPropertyReady: boolean;
  avgROI: number;
  totalRevenue: number;
  totalProfit: number;
  paybackYears: number;
  avgGopMargin: number;
  avgAnnualCashFlow: number;
  totalManagementFees: number;
  investmentRating: { grade: string; label: string };
}

export interface XIRRComparisonData extends ComparisonMetrics {
  calculatorType: 'xirr';
  totalPrice: number;
  projectedSalesPrice: number;
  location: string;
  xirr: number;
  totalInvested: number;
  netProfit: number;
  holdPeriodMonths: number;
  investmentRating: { grade: string; label: string };
}

export interface MortgageComparisonData extends ComparisonMetrics {
  calculatorType: 'mortgage';
  loanAmount: number;
  interestRate: number;
  loanTerm: number;
  monthlyPayment: number;
  totalPayment: number;
  totalInterest: number;
  totalMonthlyPayment: number;
  investmentRating: { grade: string; label: string };
}

export interface CashFlowComparisonData extends ComparisonMetrics {
  calculatorType: 'cashflow';
  monthlyRentalIncome: number;
  vacancyRate: number;
  projectionYears: number;
  y1NetCashFlow: number;
  totalCashFlow: number;
  avgAnnualCashFlow: number;
  investmentRating: { grade: string; label: string };
}

export interface DevFeasibilityComparisonData extends ComparisonMetrics {
  calculatorType: 'dev-feasibility';
  landCost: number;
  numVillas: number;
  totalProjectCost: number;
  revenueFromSale: number;
  flipProfit: number;
  flipROI: number;
  holdROI: number;
  investmentRating: { grade: string; label: string };
}

export interface CapRateComparisonData extends ComparisonMetrics {
  calculatorType: 'cap-rate';
  propertyValue: number;
  annualNOI: number;
  capRate: number;
  monthlyNOI: number;
  investmentRating: { grade: string; label: string };
}

export interface IRRComparisonData extends ComparisonMetrics {
  calculatorType: 'irr';
  totalInvested: number;
  irr: number;
  npv: number;
  paybackPeriod: number;
  investmentRating: { grade: string; label: string };
}

export interface NPVComparisonData extends ComparisonMetrics {
  calculatorType: 'npv';
  discountRate: number;
  npv: number;
  profitabilityIndex: number;
  totalInflows: number;
  totalOutflows: number;
  investmentRating: { grade: string; label: string };
}

export interface FinancingComparisonData extends ComparisonMetrics {
  calculatorType: 'financing';
  propertyValue: number;
  numberOfLoans: number;
  bestLoanName: string;
  bestLoanRate: number;
  totalSavings: number;
  investmentRating: { grade: string; label: string };
}

export interface RentalProjectionComparisonData extends ComparisonMetrics {
  calculatorType: 'rental-projection';
  nightlyRate: number;
  occupancyRate: number;
  annualRevenue: number;
  annualNetIncome: number;
  totalProjectedCashFlow: number;
  investmentRating: { grade: string; label: string };
}

export interface IndonesiaTaxComparisonData extends ComparisonMetrics {
  calculatorType: 'indonesia-tax';
  purchasePrice: number;
  projectedSalePrice: number;
  ownershipStructure: string;
  totalTaxLiability: number;
  effectiveTaxRate: number;
  netProfit: number;
  optimalStructure: string;
  investmentRating: { grade: string; label: string };
}

export interface DevBudgetComparisonData extends ComparisonMetrics {
  calculatorType: 'dev-budget';
  totalBudget: number;
  totalActual: number;
  variance: number;
  variancePercent: number;
  healthScore: number;
  contingencyUsedPercent: number;
  investmentRating: { grade: string; label: string };
}

export interface RiskAssessmentComparisonData extends ComparisonMetrics {
  calculatorType: 'risk-assessment';
  investmentAmount: number;
  projectROI: number;
  propertyType: string;
  overallRiskScore: number;
  financialRiskScore: number;
  marketRiskScore: number;
  regulatoryRiskScore: number;
  propertyRiskScore: number;
  investmentRating: { grade: string; label: string };
}

export interface BRRRRComparisonData extends ComparisonMetrics {
  calculatorType: 'brrrr';
  purchasePrice: number;
  rehabCost: number;
  holdingCosts: number;
  afterRepairValue: number;
  refinanceLTV: number;
  refinanceRate: number;
  monthlyRent: number;
  totalInvestment: number;
  cashLeftInDeal: number;
  monthlyCashFlow: number;
  annualCashFlow: number;
  cashOnCashROI: number;
  equity: number;
  investmentRating: { grade: string; label: string };
}

export type ComparisonData =
  | RentalROIComparisonData
  | XIRRComparisonData
  | MortgageComparisonData
  | CashFlowComparisonData
  | DevFeasibilityComparisonData
  | CapRateComparisonData
  | IRRComparisonData
  | NPVComparisonData
  | FinancingComparisonData
  | RentalProjectionComparisonData
  | IndonesiaTaxComparisonData
  | DevBudgetComparisonData
  | RiskAssessmentComparisonData
  | BRRRRComparisonData;

export interface ComparisonState {
  rentalROI: RentalROIComparisonData[];
  xirr: XIRRComparisonData[];
  mortgage: MortgageComparisonData[];
  cashflow: CashFlowComparisonData[];
  devFeasibility: DevFeasibilityComparisonData[];
  capRate: CapRateComparisonData[];
  irr: IRRComparisonData[];
  npv: NPVComparisonData[];
  financing: FinancingComparisonData[];
  rentalProjection: RentalProjectionComparisonData[];
  indonesiaTax: IndonesiaTaxComparisonData[];
  devBudget: DevBudgetComparisonData[];
  riskAssessment: RiskAssessmentComparisonData[];
  brrrr: BRRRRComparisonData[];
}

export const MAX_COMPARISONS = 5;

// Calculator type to state key mapping
export const calculatorTypeToStateKey: Record<CalculatorType, keyof ComparisonState> = {
  'rental-roi': 'rentalROI',
  'xirr': 'xirr',
  'mortgage': 'mortgage',
  'cashflow': 'cashflow',
  'dev-feasibility': 'devFeasibility',
  'cap-rate': 'capRate',
  'irr': 'irr',
  'npv': 'npv',
  'financing': 'financing',
  'rental-projection': 'rentalProjection',
  'indonesia-tax': 'indonesiaTax',
  'dev-budget': 'devBudget',
  'risk-assessment': 'riskAssessment',
  'brrrr': 'brrrr',
};

// Calculator display names
export const calculatorDisplayNames: Record<CalculatorType, string> = {
  'rental-roi': 'Rental ROI',
  'xirr': 'XIRR',
  'mortgage': 'Mortgage',
  'cashflow': 'Cash Flow',
  'dev-feasibility': 'Dev Feasibility',
  'cap-rate': 'Cap Rate',
  'irr': 'IRR',
  'npv': 'NPV',
  'financing': 'Financing',
  'rental-projection': 'Rental Projection',
  'indonesia-tax': 'Indonesia Tax',
  'dev-budget': 'Dev Budget',
  'risk-assessment': 'Risk Assessment',
  'brrrr': 'BRRRR',
};
