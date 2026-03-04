import { useMemo } from 'react';
import type { ReportData, ReportSection, ReportMetric, ReportTableRow } from '../components/ui/ReportPreviewModal';

// Helper to format currency
const formatCurrency = (value: number, symbol: string): string => {
  if (value >= 1_000_000_000) return `${symbol}${(value / 1_000_000_000).toFixed(2)}B`;
  if (value >= 1_000_000) return `${symbol}${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `${symbol}${(value / 1_000).toFixed(1)}K`;
  return `${symbol}${value.toLocaleString()}`;
};

const formatPercent = (value: number): string => `${value.toFixed(2)}%`;

const getDate = (): string => {
  return new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Mortgage Calculator Report
export function generateMortgageReport(
  inputs: {
    loanAmount: number;
    interestRate: number;
    loanTerm: number;
    showAdvanced: boolean;
    originationFeePercent: number;
    propertyTaxRate: number;
    homeInsuranceAnnual: number;
    pmiRequired: boolean;
    pmiRate: number;
    hoaFeesMonthly: number;
  },
  result: {
    monthlyPayment: number;
    totalPayment: number;
    totalInterest: number;
    totalCostOfBorrowing: number;
    monthlyPropertyTax: number;
    monthlyInsurance: number;
    monthlyPMI: number;
    totalMonthlyPayment: number;
    originationFeeAmount: number;
    amortizationSchedule: Array<{
      month: number;
      balance: number;
      payment: number;
      principal: number;
      interest: number;
    }>;
  },
  symbol: string
): ReportData {
  const sections: ReportSection[] = [
    {
      title: 'Loan Summary',
      color: 'emerald',
      type: 'metrics',
      data: [
        { label: 'Loan Amount', value: formatCurrency(inputs.loanAmount, symbol) },
        { label: 'Interest Rate', value: formatPercent(inputs.interestRate) },
        { label: 'Loan Term', value: `${inputs.loanTerm} years` },
        { label: 'Monthly Payment', value: formatCurrency(result.monthlyPayment, symbol), highlight: true },
      ] as ReportMetric[],
    },
    {
      title: 'Total Costs',
      color: 'cyan',
      type: 'metrics',
      data: [
        { label: 'Total Payment', value: formatCurrency(result.totalPayment, symbol) },
        { label: 'Total Interest', value: formatCurrency(result.totalInterest, symbol), negative: true },
        { label: 'Interest Ratio', value: formatPercent((result.totalInterest / inputs.loanAmount) * 100) },
        { label: 'Total Cost', value: formatCurrency(result.totalCostOfBorrowing, symbol), negative: true },
      ] as ReportMetric[],
    },
  ];

  if (inputs.showAdvanced) {
    sections.push({
      title: 'Monthly Breakdown',
      color: 'orange',
      type: 'metrics',
      data: [
        { label: 'Base Payment', value: formatCurrency(result.monthlyPayment, symbol) },
        { label: 'Property Tax', value: formatCurrency(result.monthlyPropertyTax, symbol) },
        { label: 'Insurance', value: formatCurrency(result.monthlyInsurance, symbol) },
        { label: 'Total Monthly', value: formatCurrency(result.totalMonthlyPayment, symbol), highlight: true },
      ] as ReportMetric[],
    });
  }

  // Amortization table
  const tableRows: ReportTableRow[] = [
    { cells: ['Year', 'Balance', 'Principal', 'Interest', 'Payment'] },
    ...result.amortizationSchedule.map(row => ({
      cells: [
        `Year ${row.month / 12}`,
        formatCurrency(row.balance, symbol),
        formatCurrency(row.principal * 12, symbol),
        formatCurrency(row.interest * 12, symbol),
        formatCurrency(row.payment * 12, symbol),
      ],
    })),
  ];

  sections.push({
    title: 'Amortization Schedule (Yearly)',
    color: 'blue',
    type: 'table',
    data: tableRows,
  });

  return {
    calculatorType: 'mortgage',
    title: 'Mortgage Analysis Report',
    subtitle: `${inputs.loanTerm}-Year Loan at ${inputs.interestRate}%`,
    currency: symbol,
    symbol,
    generatedDate: getDate(),
    rating: {
      grade: result.totalInterest / inputs.loanAmount < 0.5 ? 'A' : result.totalInterest / inputs.loanAmount < 1 ? 'B' : 'C',
      label: result.totalInterest / inputs.loanAmount < 0.5 ? 'Favorable Terms' : result.totalInterest / inputs.loanAmount < 1 ? 'Standard Terms' : 'High Interest',
      value: formatCurrency(result.monthlyPayment, symbol),
      description: 'Monthly Payment',
    },
    sections,
  };
}

// IRR Calculator Report
export function generateIRRReport(
  inputs: {
    initialInvestment: number;
    cashFlows: Array<{ year: number; amount: number }>;
    discountRate: number;
  },
  result: {
    irr: number;
    npv: number;
    mirr?: number;
    paybackPeriod: number;
    profitabilityIndex: number;
  },
  symbol: string
): ReportData {
  const sections: ReportSection[] = [
    {
      title: 'Investment Overview',
      color: 'emerald',
      type: 'metrics',
      data: [
        { label: 'Initial Investment', value: formatCurrency(inputs.initialInvestment, symbol), negative: true },
        { label: 'Discount Rate', value: formatPercent(inputs.discountRate) },
        { label: 'Total Cash Flows', value: `${inputs.cashFlows.length} years` },
        { label: 'IRR', value: formatPercent(result.irr), positive: result.irr > inputs.discountRate },
      ] as ReportMetric[],
    },
    {
      title: 'Return Analysis',
      color: 'cyan',
      type: 'metrics',
      data: [
        { label: 'Net Present Value', value: formatCurrency(result.npv, symbol), positive: result.npv > 0, negative: result.npv < 0 },
        { label: 'Profitability Index', value: result.profitabilityIndex.toFixed(2), positive: result.profitabilityIndex > 1 },
        { label: 'Payback Period', value: `${result.paybackPeriod.toFixed(1)} years` },
        ...(result.mirr ? [{ label: 'Modified IRR', value: formatPercent(result.mirr) }] : []),
      ] as ReportMetric[],
    },
  ];

  // Cash flow table
  const tableRows: ReportTableRow[] = [
    { cells: ['Year', 'Cash Flow', 'Cumulative'] },
    { cells: ['0', formatCurrency(-inputs.initialInvestment, symbol), formatCurrency(-inputs.initialInvestment, symbol)] },
  ];

  let cumulative = -inputs.initialInvestment;
  inputs.cashFlows.forEach(cf => {
    cumulative += cf.amount;
    tableRows.push({
      cells: [cf.year.toString(), formatCurrency(cf.amount, symbol), formatCurrency(cumulative, symbol)],
    });
  });

  sections.push({
    title: 'Cash Flow Timeline',
    color: 'blue',
    type: 'table',
    data: tableRows,
  });

  const irrGrade = result.irr >= 25 ? 'A+' : result.irr >= 18 ? 'A' : result.irr >= 12 ? 'B+' : result.irr >= 8 ? 'B' : 'C';
  const irrLabel = result.irr >= 25 ? 'Excellent' : result.irr >= 18 ? 'Very Good' : result.irr >= 12 ? 'Good' : result.irr >= 8 ? 'Fair' : 'Marginal';

  return {
    calculatorType: 'irr',
    title: 'IRR Analysis Report',
    subtitle: `Internal Rate of Return Analysis`,
    currency: symbol,
    symbol,
    generatedDate: getDate(),
    rating: {
      grade: irrGrade,
      label: irrLabel,
      value: formatPercent(result.irr),
      description: 'Internal Rate of Return',
    },
    sections,
  };
}

// NPV Calculator Report
export function generateNPVReport(
  inputs: {
    initialInvestment: number;
    discountRate: number;
    cashFlows: Array<{ year: number; inflow: number; outflow: number }>;
  },
  result: {
    npv: number;
    totalInflows: number;
    totalOutflows: number;
    profitabilityIndex: number;
  },
  symbol: string
): ReportData {
  const sections: ReportSection[] = [
    {
      title: 'Investment Summary',
      color: 'emerald',
      type: 'metrics',
      data: [
        { label: 'Initial Investment', value: formatCurrency(inputs.initialInvestment, symbol), negative: true },
        { label: 'Discount Rate', value: formatPercent(inputs.discountRate) },
        { label: 'Net Present Value', value: formatCurrency(result.npv, symbol), positive: result.npv > 0, negative: result.npv < 0 },
        { label: 'Profitability Index', value: result.profitabilityIndex.toFixed(2), positive: result.profitabilityIndex > 1 },
      ] as ReportMetric[],
    },
    {
      title: 'Cash Flow Totals',
      color: 'cyan',
      type: 'metrics',
      data: [
        { label: 'Total Inflows', value: formatCurrency(result.totalInflows, symbol), positive: true },
        { label: 'Total Outflows', value: formatCurrency(result.totalOutflows, symbol), negative: true },
        { label: 'Net Cash Flow', value: formatCurrency(result.totalInflows - result.totalOutflows, symbol) },
      ] as ReportMetric[],
    },
  ];

  // Cash flow table
  const tableRows: ReportTableRow[] = [
    { cells: ['Year', 'Inflows', 'Outflows', 'Net'] },
    ...inputs.cashFlows.map(cf => ({
      cells: [
        cf.year.toString(),
        formatCurrency(cf.inflow, symbol),
        formatCurrency(cf.outflow, symbol),
        formatCurrency(cf.inflow - cf.outflow, symbol),
      ],
    })),
  ];

  sections.push({
    title: 'Annual Cash Flows',
    color: 'blue',
    type: 'table',
    data: tableRows,
  });

  return {
    calculatorType: 'npv',
    title: 'NPV Analysis Report',
    subtitle: `Net Present Value at ${inputs.discountRate}% Discount Rate`,
    currency: symbol,
    symbol,
    generatedDate: getDate(),
    rating: {
      grade: result.npv > 0 ? (result.profitabilityIndex > 1.5 ? 'A' : 'B') : 'C',
      label: result.npv > 0 ? 'Viable Investment' : 'Not Recommended',
      value: formatCurrency(result.npv, symbol),
      description: 'Net Present Value',
    },
    sections,
  };
}

// Cap Rate Calculator Report
export function generateCapRateReport(
  inputs: {
    propertyValue: number;
    grossRentalIncome: number;
    vacancyRate: number;
    operatingExpenses: number;
    propertyTaxes: number;
    insurance: number;
    maintenance: number;
    utilities: number;
  },
  result: {
    noi: number;
    capRate: number;
    effectiveGrossIncome: number;
    totalExpenses: number;
    cashOnCash?: number;
  },
  symbol: string
): ReportData {
  const sections: ReportSection[] = [
    {
      title: 'Property Overview',
      color: 'emerald',
      type: 'metrics',
      data: [
        { label: 'Property Value', value: formatCurrency(inputs.propertyValue, symbol) },
        { label: 'Gross Income', value: formatCurrency(inputs.grossRentalIncome, symbol) },
        { label: 'Cap Rate', value: formatPercent(result.capRate), positive: result.capRate >= 6, negative: result.capRate < 4 },
        { label: 'NOI', value: formatCurrency(result.noi, symbol), positive: true },
      ] as ReportMetric[],
    },
    {
      title: 'Income Analysis',
      color: 'cyan',
      type: 'metrics',
      data: [
        { label: 'Gross Rental Income', value: formatCurrency(inputs.grossRentalIncome, symbol) },
        { label: 'Vacancy Loss', value: `-${formatCurrency(inputs.grossRentalIncome * (inputs.vacancyRate / 100), symbol)}`, negative: true },
        { label: 'Effective Income', value: formatCurrency(result.effectiveGrossIncome, symbol) },
      ] as ReportMetric[],
    },
    {
      title: 'Operating Expenses',
      color: 'orange',
      type: 'metrics',
      data: [
        { label: 'Operating Expenses', value: formatCurrency(inputs.operatingExpenses, symbol) },
        { label: 'Property Taxes', value: formatCurrency(inputs.propertyTaxes, symbol) },
        { label: 'Insurance', value: formatCurrency(inputs.insurance, symbol) },
        { label: 'Total Expenses', value: formatCurrency(result.totalExpenses, symbol), negative: true },
      ] as ReportMetric[],
    },
  ];

  const capRateGrade = result.capRate >= 8 ? 'A' : result.capRate >= 6 ? 'B+' : result.capRate >= 4 ? 'B' : 'C';
  const capRateLabel = result.capRate >= 8 ? 'Excellent Return' : result.capRate >= 6 ? 'Good Return' : result.capRate >= 4 ? 'Fair Return' : 'Low Return';

  return {
    calculatorType: 'cap-rate',
    title: 'Cap Rate Analysis Report',
    subtitle: `Property Investment Analysis`,
    currency: symbol,
    symbol,
    generatedDate: getDate(),
    rating: {
      grade: capRateGrade,
      label: capRateLabel,
      value: formatPercent(result.capRate),
      description: 'Capitalization Rate',
    },
    sections,
  };
}

// Cash Flow Projector Report
export function generateCashFlowReport(
  inputs: {
    propertyValue: number;
    monthlyRent: number;
    vacancyRate: number;
    annualExpenses: number;
    projectionYears: number;
    rentGrowthRate: number;
    expenseGrowthRate: number;
  },
  result: {
    yearlyProjections: Array<{
      year: number;
      grossIncome: number;
      expenses: number;
      netCashFlow: number;
      cumulativeCashFlow: number;
    }>;
    totalNetCashFlow: number;
    averageAnnualCashFlow: number;
    cashOnCashReturn: number;
  },
  symbol: string
): ReportData {
  const sections: ReportSection[] = [
    {
      title: 'Investment Summary',
      color: 'emerald',
      type: 'metrics',
      data: [
        { label: 'Property Value', value: formatCurrency(inputs.propertyValue, symbol) },
        { label: 'Monthly Rent', value: formatCurrency(inputs.monthlyRent, symbol) },
        { label: 'Projection Period', value: `${inputs.projectionYears} years` },
        { label: 'Cash on Cash', value: formatPercent(result.cashOnCashReturn), positive: result.cashOnCashReturn > 8 },
      ] as ReportMetric[],
    },
    {
      title: 'Projected Returns',
      color: 'cyan',
      type: 'metrics',
      data: [
        { label: 'Total Net Cash Flow', value: formatCurrency(result.totalNetCashFlow, symbol), positive: result.totalNetCashFlow > 0 },
        { label: 'Avg Annual Cash Flow', value: formatCurrency(result.averageAnnualCashFlow, symbol) },
        { label: 'Rent Growth', value: formatPercent(inputs.rentGrowthRate) },
        { label: 'Expense Growth', value: formatPercent(inputs.expenseGrowthRate) },
      ] as ReportMetric[],
    },
  ];

  // Projection table
  const tableRows: ReportTableRow[] = [
    { cells: ['Year', 'Gross Income', 'Expenses', 'Net Cash Flow', 'Cumulative'] },
    ...result.yearlyProjections.map(row => ({
      cells: [
        `Year ${row.year}`,
        formatCurrency(row.grossIncome, symbol),
        formatCurrency(row.expenses, symbol),
        formatCurrency(row.netCashFlow, symbol),
        formatCurrency(row.cumulativeCashFlow, symbol),
      ],
    })),
  ];

  sections.push({
    title: 'Year-by-Year Projection',
    color: 'blue',
    type: 'table',
    data: tableRows,
  });

  return {
    calculatorType: 'cashflow',
    title: 'Cash Flow Projection Report',
    subtitle: `${inputs.projectionYears}-Year Investment Analysis`,
    currency: symbol,
    symbol,
    generatedDate: getDate(),
    rating: {
      grade: result.cashOnCashReturn >= 12 ? 'A' : result.cashOnCashReturn >= 8 ? 'B+' : result.cashOnCashReturn >= 5 ? 'B' : 'C',
      label: result.cashOnCashReturn >= 12 ? 'Excellent Cash Flow' : result.cashOnCashReturn >= 8 ? 'Good Cash Flow' : 'Moderate Cash Flow',
      value: formatCurrency(result.averageAnnualCashFlow, symbol),
      description: 'Average Annual Cash Flow',
    },
    sections,
  };
}

// Dev Feasibility Report
export function generateDevFeasibilityReport(
  inputs: {
    landSizeM2: number;
    landCost: number;
    costPerM2: number;
    avgVillaSize: number;
    avgSalePrice: number;
    avgAnnualRentalIncome: number;
    holdingPeriod: number;
    numVillas: number;
  },
  bestFlipScenario: {
    numVillas: number;
    totalProjectCost: number;
    constructionCost: number;
    softCosts: number;
    permitsCosts: number;
    financeCharges: number;
    revenueFromSale: number;
    exitCosts: number;
    grossProfit: number;
    roiFlip: number;
  },
  bestHoldScenario: {
    numVillas: number;
    roiHold: number;
    rentalIncome10Year: number;
    rentalPlusResidual: number;
    totalProjectCost: number;
  },
  scenarios: Array<{
    numVillas: number;
    totalProjectCost: number;
    revenueFromSale: number;
    grossProfit: number;
    roiFlip: number;
    roiHold: number;
  }>,
  symbol: string
): ReportData {
  const sections: ReportSection[] = [
    {
      title: 'Land & Construction',
      color: 'emerald',
      type: 'metrics',
      data: [
        { label: 'Land Size', value: `${inputs.landSizeM2.toLocaleString()} m²` },
        { label: 'Land Cost', value: formatCurrency(inputs.landCost, symbol) },
        { label: 'Construction Cost', value: `${formatCurrency(inputs.costPerM2, symbol)}/m²` },
        { label: 'Villa Size', value: `${inputs.avgVillaSize} m²` },
      ] as ReportMetric[],
    },
    {
      title: 'Best Flip Strategy',
      color: 'purple',
      type: 'metrics',
      data: [
        { label: 'Optimal Villas', value: bestFlipScenario.numVillas.toString(), highlight: true },
        { label: 'Total Cost', value: formatCurrency(bestFlipScenario.totalProjectCost, symbol) },
        { label: 'Sale Revenue', value: formatCurrency(bestFlipScenario.revenueFromSale, symbol), positive: true },
        { label: 'Gross Profit', value: formatCurrency(bestFlipScenario.grossProfit, symbol), positive: bestFlipScenario.grossProfit > 0 },
        { label: 'Flip ROI', value: formatPercent(bestFlipScenario.roiFlip), positive: bestFlipScenario.roiFlip > 20 },
      ] as ReportMetric[],
    },
    {
      title: `Best Hold Strategy (${inputs.holdingPeriod}yr)`,
      color: 'cyan',
      type: 'metrics',
      data: [
        { label: 'Optimal Villas', value: bestHoldScenario.numVillas.toString(), highlight: true },
        { label: 'Total Cost', value: formatCurrency(bestHoldScenario.totalProjectCost, symbol) },
        { label: 'Rental Income', value: formatCurrency(bestHoldScenario.rentalIncome10Year, symbol), positive: true },
        { label: 'Total Return', value: formatCurrency(bestHoldScenario.rentalPlusResidual - bestHoldScenario.totalProjectCost, symbol), positive: true },
        { label: 'Hold ROI', value: formatPercent(bestHoldScenario.roiHold), positive: bestHoldScenario.roiHold > 50 },
      ] as ReportMetric[],
    },
    {
      title: 'Cost Breakdown',
      color: 'orange',
      type: 'metrics',
      data: [
        { label: 'Land', value: formatCurrency(inputs.landCost, symbol) },
        { label: 'Construction', value: formatCurrency(bestFlipScenario.constructionCost, symbol) },
        { label: 'Soft Costs', value: formatCurrency(bestFlipScenario.softCosts, symbol) },
        { label: 'Permits & Infra', value: formatCurrency(bestFlipScenario.permitsCosts, symbol) },
        { label: 'Finance Charges', value: formatCurrency(bestFlipScenario.financeCharges, symbol) },
        { label: 'Exit Costs', value: formatCurrency(bestFlipScenario.exitCosts, symbol), negative: bestFlipScenario.exitCosts > 0 },
      ] as ReportMetric[],
    },
  ];

  // Scenarios comparison table
  const tableRows: ReportTableRow[] = [
    { cells: ['Villas', 'Total Cost', 'Revenue', 'Profit', 'Flip ROI', 'Hold ROI'] },
    ...scenarios.map(s => ({
      cells: [
        s.numVillas.toString(),
        formatCurrency(s.totalProjectCost, symbol),
        formatCurrency(s.revenueFromSale, symbol),
        formatCurrency(s.grossProfit, symbol),
        formatPercent(s.roiFlip),
        formatPercent(s.roiHold),
      ],
    })),
  ];

  sections.push({
    title: 'Scenario Comparison',
    color: 'blue',
    type: 'table',
    data: tableRows,
  });

  const bestROI = Math.max(bestFlipScenario.roiFlip, bestHoldScenario.roiHold);

  return {
    calculatorType: 'dev-feasibility',
    title: 'Development Feasibility Report',
    subtitle: `${bestFlipScenario.numVillas}-Villa Development Analysis`,
    currency: symbol,
    symbol,
    generatedDate: getDate(),
    rating: {
      grade: bestROI >= 50 ? 'A+' : bestROI >= 30 ? 'A' : bestROI >= 20 ? 'B' : 'C',
      label: bestROI >= 50 ? 'Excellent Project' : bestROI >= 30 ? 'Viable Project' : bestROI >= 20 ? 'Marginal' : 'High Risk',
      value: formatPercent(bestFlipScenario.roiFlip),
      description: 'Best Flip ROI',
    },
    sections,
  };
}

// Indonesia Tax Optimizer Report
export function generateIndonesiaTaxReport(
  inputs: {
    purchasePrice: number;
    holdingPeriod: number;
    projectedSalePrice: number;
    ownershipStructure: 'pt' | 'freehold' | 'leasehold';
    showDepreciation: boolean;
    showDeductions: boolean;
    buildingValue: number;
    buildingDepreciationRate: number;
  },
  result: {
    grossROI: number;
    netROI: number;
    totalTaxLiability: number;
    effectiveTaxRate: number;
    capitalGain: number;
    capitalGainsTax: number;
    totalDepreciation: number;
    depreciationTaxSavings: number;
    totalDeductions: number;
    deductionTaxSavings: number;
    netProceeds: number;
    netProfit: number;
    optimalStructure: 'pt' | 'freehold' | 'leasehold';
    taxSavingsFromOptimal: number;
    ptTaxLiability: number;
    freeholdTaxLiability: number;
    leaseholdTaxLiability: number;
    yearlyProjections: Array<{
      year: number;
      propertyValue: number;
      annualTaxLiability: number;
      netIncome: number;
    }>;
  },
  symbol: string
): ReportData {
  const ownershipLabels: Record<string, string> = {
    pt: 'PT (Company)',
    freehold: 'Freehold (Individual)',
    leasehold: 'Leasehold',
  };

  const sections: ReportSection[] = [
    {
      title: 'Investment Overview',
      color: 'emerald',
      type: 'metrics',
      data: [
        { label: 'Purchase Price', value: formatCurrency(inputs.purchasePrice, symbol) },
        { label: 'Projected Sale', value: formatCurrency(inputs.projectedSalePrice, symbol) },
        { label: 'Holding Period', value: `${inputs.holdingPeriod} years` },
        { label: 'Ownership', value: ownershipLabels[inputs.ownershipStructure] },
      ] as ReportMetric[],
    },
    {
      title: 'ROI Analysis',
      color: 'cyan',
      type: 'metrics',
      data: [
        { label: 'Gross ROI', value: formatPercent(result.grossROI), positive: result.grossROI > 0 },
        { label: 'Net ROI (After Tax)', value: formatPercent(result.netROI), positive: result.netROI > 0, highlight: true },
        { label: 'Net Profit', value: formatCurrency(result.netProfit, symbol), positive: result.netProfit > 0 },
        { label: 'Effective Tax Rate', value: formatPercent(result.effectiveTaxRate), negative: result.effectiveTaxRate > 25 },
      ] as ReportMetric[],
    },
    {
      title: 'Tax Breakdown',
      color: 'red',
      type: 'metrics',
      data: [
        { label: 'Capital Gain', value: formatCurrency(result.capitalGain, symbol), positive: result.capitalGain > 0 },
        { label: 'Capital Gains Tax', value: formatCurrency(result.capitalGainsTax, symbol), negative: true },
        { label: 'Total Tax Liability', value: formatCurrency(result.totalTaxLiability, symbol), negative: true, highlight: true },
        { label: 'Net Proceeds', value: formatCurrency(result.netProceeds, symbol) },
      ] as ReportMetric[],
    },
  ];

  // Add depreciation section if enabled
  if (inputs.showDepreciation) {
    sections.push({
      title: 'Depreciation Benefits',
      color: 'purple',
      type: 'metrics',
      data: [
        { label: 'Building Value', value: formatCurrency(inputs.buildingValue, symbol) },
        { label: 'Depreciation Rate', value: formatPercent(inputs.buildingDepreciationRate) },
        { label: 'Total Depreciation', value: formatCurrency(result.totalDepreciation, symbol) },
        { label: 'Tax Savings', value: formatCurrency(result.depreciationTaxSavings, symbol), positive: true },
      ] as ReportMetric[],
    });
  }

  // Add deductions section if enabled
  if (inputs.showDeductions) {
    sections.push({
      title: 'Deduction Benefits',
      color: 'blue',
      type: 'metrics',
      data: [
        { label: 'Total Deductions', value: formatCurrency(result.totalDeductions, symbol) },
        { label: 'Tax Savings', value: formatCurrency(result.deductionTaxSavings, symbol), positive: true },
      ] as ReportMetric[],
    });
  }

  // Ownership comparison
  sections.push({
    title: 'Ownership Structure Comparison',
    color: 'orange',
    type: 'metrics',
    data: [
      { label: 'PT (Company)', value: formatCurrency(result.ptTaxLiability, symbol), highlight: inputs.ownershipStructure === 'pt' },
      { label: 'Freehold (Individual)', value: formatCurrency(result.freeholdTaxLiability, symbol), highlight: inputs.ownershipStructure === 'freehold' },
      { label: 'Leasehold', value: formatCurrency(result.leaseholdTaxLiability, symbol), highlight: inputs.ownershipStructure === 'leasehold' },
      { label: 'Optimal Structure', value: ownershipLabels[result.optimalStructure], positive: true },
    ] as ReportMetric[],
  });

  // Year-by-year projections table
  const tableRows: ReportTableRow[] = [
    { cells: ['Year', 'Property Value', 'Annual Tax', 'Net Income'] },
    ...result.yearlyProjections.map(p => ({
      cells: [
        `Year ${p.year}`,
        formatCurrency(p.propertyValue, symbol),
        formatCurrency(p.annualTaxLiability, symbol),
        formatCurrency(p.netIncome, symbol),
      ],
    })),
  ];

  sections.push({
    title: 'Year-by-Year Tax Projection',
    color: 'blue',
    type: 'table',
    data: tableRows,
  });

  // Tax efficiency grade
  const taxGrade = result.effectiveTaxRate <= 15 ? 'A' : result.effectiveTaxRate <= 20 ? 'B' : result.effectiveTaxRate <= 25 ? 'C' : 'D';
  const taxLabel = result.effectiveTaxRate <= 15 ? 'Excellent' : result.effectiveTaxRate <= 20 ? 'Good' : result.effectiveTaxRate <= 25 ? 'Fair' : 'High';

  return {
    calculatorType: 'indonesia-tax',
    title: 'Indonesia Tax Optimization Report',
    subtitle: `${inputs.holdingPeriod}-Year ${ownershipLabels[inputs.ownershipStructure]} Analysis`,
    currency: symbol,
    symbol,
    generatedDate: getDate(),
    rating: {
      grade: taxGrade,
      label: taxLabel + ' Tax Efficiency',
      value: formatPercent(result.effectiveTaxRate),
      description: 'Effective Tax Rate',
    },
    sections,
  };
}

// Rental Income Projection Report
export function generateRentalProjectionReport(
  inputs: {
    projectionYears: number;
    nightlyRate: number;
    baseOccupancyRate: number;
    location: string;
    currency: string;
  },
  result: {
    annualRevenue: number;
    annualExpenses: number;
    annualNetIncome: number;
    averageOccupancy: number;
    averageNightlyRate: number;
    peakSeasonRevenue: number;
    lowSeasonRevenue: number;
    totalProjectedCashFlow: number;
    optimalRate: number;
    optimalRateRevenue: number;
    monthlyProjections: Array<{
      month: string;
      grossRevenue: number;
      netIncome: number;
      occupancyRate: number;
    }>;
    yearlyProjections: Array<{
      year: number;
      totalRevenue: number;
      totalExpenses: number;
      netIncome: number;
      cumulativeCashFlow: number;
    }>;
  },
  symbol: string
): ReportData {
  const locationLabels: Record<string, string> = {
    'ubud': 'Ubud',
    'seminyak': 'Seminyak',
    'canggu': 'Canggu',
    'other-bali': 'Other Bali',
    'off-island': 'Off-island',
  };

  const sections: ReportSection[] = [
    {
      title: 'Annual Summary',
      color: 'emerald',
      type: 'metrics',
      data: [
        { label: 'Annual Revenue', value: formatCurrency(result.annualRevenue, symbol), positive: true },
        { label: 'Annual Expenses', value: formatCurrency(result.annualExpenses, symbol), negative: true },
        { label: 'Annual Net Income', value: formatCurrency(result.annualNetIncome, symbol), positive: result.annualNetIncome > 0 },
        { label: 'Average Occupancy', value: formatPercent(result.averageOccupancy), positive: result.averageOccupancy > 70 },
      ] as ReportMetric[],
    },
    {
      title: 'Seasonality Analysis',
      color: 'purple',
      type: 'metrics',
      data: [
        { label: 'Peak Season Revenue', value: formatCurrency(result.peakSeasonRevenue, symbol), positive: true },
        { label: 'Low Season Revenue', value: formatCurrency(result.lowSeasonRevenue, symbol) },
        { label: 'Average Nightly Rate', value: formatCurrency(result.averageNightlyRate, symbol) },
        { label: 'Optimal Rate', value: formatCurrency(result.optimalRate, symbol), highlight: true },
      ] as ReportMetric[],
    },
    {
      title: `${inputs.projectionYears}-Year Projection`,
      color: 'cyan',
      type: 'metrics',
      data: [
        { label: 'Total Cash Flow', value: formatCurrency(result.totalProjectedCashFlow, symbol), positive: result.totalProjectedCashFlow > 0, highlight: true },
        { label: 'Avg Annual Net', value: formatCurrency(result.totalProjectedCashFlow / inputs.projectionYears, symbol) },
        { label: 'Location', value: locationLabels[inputs.location] || inputs.location },
      ] as ReportMetric[],
    },
  ];

  // Monthly projections table
  const monthlyRows: ReportTableRow[] = [
    { cells: ['Month', 'Revenue', 'Net Income', 'Occupancy'] },
    ...result.monthlyProjections.map(m => ({
      cells: [
        m.month,
        formatCurrency(m.grossRevenue, symbol),
        formatCurrency(m.netIncome, symbol),
        formatPercent(m.occupancyRate),
      ],
    })),
  ];

  sections.push({
    title: 'Monthly Breakdown (Year 1)',
    color: 'blue',
    type: 'table',
    data: monthlyRows,
  });

  // Yearly projections table
  const yearlyRows: ReportTableRow[] = [
    { cells: ['Year', 'Revenue', 'Expenses', 'Net', 'Cumulative'] },
    ...result.yearlyProjections.map(y => ({
      cells: [
        `Year ${y.year}`,
        formatCurrency(y.totalRevenue, symbol),
        formatCurrency(y.totalExpenses, symbol),
        formatCurrency(y.netIncome, symbol),
        formatCurrency(y.cumulativeCashFlow, symbol),
      ],
    })),
  ];

  sections.push({
    title: 'Yearly Cash Flow Projection',
    color: 'orange',
    type: 'table',
    data: yearlyRows,
  });

  const annualYield = (result.annualNetIncome / (inputs.nightlyRate * 365)) * 100;
  const grade = annualYield >= 15 ? 'A+' : annualYield >= 12 ? 'A' : annualYield >= 8 ? 'B' : annualYield >= 5 ? 'C' : 'D';
  const label = annualYield >= 15 ? 'Excellent' : annualYield >= 12 ? 'Very Good' : annualYield >= 8 ? 'Good' : annualYield >= 5 ? 'Fair' : 'Poor';

  return {
    calculatorType: 'rental-projection',
    title: 'Rental Income Projection Report',
    subtitle: `${inputs.projectionYears}-Year Analysis for ${locationLabels[inputs.location] || inputs.location}`,
    currency: symbol,
    symbol,
    generatedDate: getDate(),
    rating: {
      grade,
      label: label + ' Performance',
      value: formatCurrency(result.annualNetIncome, symbol),
      description: 'Annual Net Income',
    },
    sections,
  };
}

// Financing Comparison Report
export function generateFinancingReport(
  inputs: {
    propertyValue: number;
    numberOfLoans: number;
  },
  loans: Array<{
    name: string;
    lenderType: string;
    amount: number;
    rate: number;
    term: number;
    monthlyPayment: number;
    totalInterest: number;
    totalCost: number;
  }>,
  winner: {
    name: string;
    savings: number;
  },
  symbol: string
): ReportData {
  const sections: ReportSection[] = [
    {
      title: 'Property Overview',
      color: 'emerald',
      type: 'metrics',
      data: [
        { label: 'Property Value', value: formatCurrency(inputs.propertyValue, symbol) },
        { label: 'Loans Compared', value: inputs.numberOfLoans.toString() },
        { label: 'Best Option', value: winner.name, highlight: true },
        { label: 'Potential Savings', value: formatCurrency(winner.savings, symbol), positive: true },
      ] as ReportMetric[],
    },
  ];

  // Add each loan as a section
  loans.forEach((loan, index) => {
    sections.push({
      title: `${loan.name} (${loan.lenderType})`,
      color: index === 0 ? 'cyan' : index === 1 ? 'purple' : index === 2 ? 'orange' : 'blue',
      type: 'metrics',
      data: [
        { label: 'Loan Amount', value: formatCurrency(loan.amount, symbol) },
        { label: 'Interest Rate', value: formatPercent(loan.rate) },
        { label: 'Term', value: `${loan.term} years` },
        { label: 'Monthly Payment', value: formatCurrency(loan.monthlyPayment, symbol), highlight: true },
        { label: 'Total Interest', value: formatCurrency(loan.totalInterest, symbol), negative: true },
        { label: 'Total Cost', value: formatCurrency(loan.totalCost, symbol) },
      ] as ReportMetric[],
    });
  });

  // Comparison table
  const comparisonRows: ReportTableRow[] = [
    { cells: ['Loan', 'Rate', 'Monthly', 'Total Interest', 'Total Cost'] },
    ...loans.map(loan => ({
      cells: [
        loan.name,
        formatPercent(loan.rate),
        formatCurrency(loan.monthlyPayment, symbol),
        formatCurrency(loan.totalInterest, symbol),
        formatCurrency(loan.totalCost, symbol),
      ],
    })),
  ];

  sections.push({
    title: 'Side-by-Side Comparison',
    color: 'blue',
    type: 'table',
    data: comparisonRows,
  });

  return {
    calculatorType: 'financing',
    title: 'Financing Comparison Report',
    subtitle: `Comparing ${inputs.numberOfLoans} Loan Options`,
    currency: symbol,
    symbol,
    generatedDate: getDate(),
    rating: {
      grade: 'A',
      label: 'Best Option',
      value: winner.name,
      description: `Saves ${formatCurrency(winner.savings, symbol)}`,
    },
    sections,
  };
}

// Development Budget Tracker Report
export function generateDevBudgetReport(
  summary: {
    projectName: string;
    totalBudget: number;
    totalActual: number;
    variance: number;
    variancePercent: number;
  },
  categories: Array<{
    name: string;
    budgeted: number;
    actual: number;
  }>,
  timeline: {
    currentMonth: number;
    totalDuration: number;
    completionPercent: number;
    healthScore: number;
  },
  symbol: string
): ReportData {
  const isOverBudget = summary.variance > 0;
  const healthGrade = timeline.healthScore >= 80 ? 'A' : timeline.healthScore >= 60 ? 'B' : 'C';
  const healthLabel = timeline.healthScore >= 80 ? 'Healthy' : timeline.healthScore >= 60 ? 'At Risk' : 'Critical';

  const sections: ReportSection[] = [
    {
      title: 'Project Summary',
      color: 'emerald',
      type: 'metrics',
      data: [
        { label: 'Project Name', value: summary.projectName },
        { label: 'Total Budget', value: formatCurrency(summary.totalBudget, symbol) },
        { label: 'Total Actual', value: formatCurrency(summary.totalActual, symbol), highlight: true },
        { label: 'Variance', value: `${isOverBudget ? '+' : ''}${formatCurrency(summary.variance, symbol)}`, negative: isOverBudget, positive: !isOverBudget },
      ] as ReportMetric[],
    },
    {
      title: 'Timeline Status',
      color: 'cyan',
      type: 'metrics',
      data: [
        { label: 'Current Month', value: `${timeline.currentMonth} of ${timeline.totalDuration}` },
        { label: 'Progress', value: formatPercent(timeline.completionPercent) },
        { label: 'Health Score', value: `${timeline.healthScore.toFixed(0)}%`, highlight: true },
        { label: 'Status', value: healthLabel },
      ] as ReportMetric[],
    },
  ];

  // Budget breakdown table
  const budgetRows: ReportTableRow[] = [
    { cells: ['Category', 'Budgeted', 'Actual', 'Variance', '%'] },
    ...categories.map(cat => {
      const variance = cat.actual - cat.budgeted;
      const variancePct = cat.budgeted > 0 ? (variance / cat.budgeted) * 100 : 0;
      return {
        cells: [
          cat.name,
          formatCurrency(cat.budgeted, symbol),
          formatCurrency(cat.actual, symbol),
          `${variance > 0 ? '+' : ''}${formatCurrency(variance, symbol)}`,
          `${variance > 0 ? '+' : ''}${variancePct.toFixed(1)}%`,
        ],
      };
    }),
  ];

  sections.push({
    title: 'Budget Breakdown',
    color: 'purple',
    type: 'table',
    data: budgetRows,
  });

  // Overruns section
  const overruns = categories.filter(c => c.actual > c.budgeted);
  if (overruns.length > 0) {
    sections.push({
      title: 'Cost Overruns',
      color: 'orange',
      type: 'metrics',
      data: overruns.map(cat => ({
        label: cat.name,
        value: formatCurrency(cat.actual - cat.budgeted, symbol),
        negative: true,
      })) as ReportMetric[],
    });
  }

  return {
    calculatorType: 'dev-feasibility',
    title: 'Development Budget Report',
    subtitle: summary.projectName,
    currency: symbol,
    symbol,
    generatedDate: getDate(),
    rating: {
      grade: healthGrade,
      label: 'Project Health',
      value: `${timeline.healthScore.toFixed(0)}%`,
      description: healthLabel,
    },
    sections,
  };
}

// Risk Assessment Report
export function generateRiskAssessmentReport(
  investment: {
    investmentAmount: number;
    projectROI: number;
    propertyType: string;
    location: string;
  },
  riskScore: {
    overall: number;
    financial: number;
    market: number;
    regulatory: number;
    propertySpecific: number;
    factors: Array<{
      category: string;
      name: string;
      score: number;
      maxScore: number;
      impact: string;
      description: string;
    }>;
  },
  scenarios: Array<{
    name: string;
    roi: number;
    riskScore: number;
    cashFlow: number;
    description: string;
  }>,
  benchmark: number,
  symbol: string
): ReportData {
  const riskLevel = riskScore.overall <= 30 ? 'Low' : riskScore.overall <= 60 ? 'Moderate' : 'High';
  const riskGrade = riskScore.overall <= 30 ? 'A' : riskScore.overall <= 50 ? 'B' : riskScore.overall <= 70 ? 'C' : 'D';
  const riskDiff = riskScore.overall - benchmark;

  const sections: ReportSection[] = [
    {
      title: 'Investment Overview',
      color: 'emerald',
      type: 'metrics',
      data: [
        { label: 'Investment Amount', value: formatCurrency(investment.investmentAmount, symbol) },
        { label: 'Project ROI', value: formatPercent(investment.projectROI), highlight: true },
        { label: 'Property Type', value: investment.propertyType },
        { label: 'Location', value: investment.location },
      ] as ReportMetric[],
    },
    {
      title: 'Risk Score Summary',
      color: 'cyan',
      type: 'metrics',
      data: [
        { label: 'Overall Risk Score', value: `${riskScore.overall}/100`, highlight: true },
        { label: 'Risk Level', value: riskLevel },
        { label: 'vs Benchmark', value: `${riskDiff > 0 ? '+' : ''}${riskDiff} pts` },
        { label: 'Investor Profile', value: riskScore.overall <= 30 ? 'Conservative' : riskScore.overall <= 60 ? 'Moderate' : 'Aggressive' },
      ] as ReportMetric[],
    },
    {
      title: 'Risk by Category',
      color: 'purple',
      type: 'metrics',
      data: [
        { label: 'Financial Risk (40%)', value: `${riskScore.financial}/100`, negative: riskScore.financial > 60 },
        { label: 'Market Risk (30%)', value: `${riskScore.market}/100`, negative: riskScore.market > 60 },
        { label: 'Regulatory Risk (15%)', value: `${riskScore.regulatory}/100`, negative: riskScore.regulatory > 60 },
        { label: 'Property Risk (15%)', value: `${riskScore.propertySpecific}/100`, negative: riskScore.propertySpecific > 60 },
      ] as ReportMetric[],
    },
  ];

  // Top risks table
  const topRisks = [...riskScore.factors]
    .sort((a, b) => (b.score / b.maxScore) - (a.score / a.maxScore))
    .slice(0, 5);

  const riskRows: ReportTableRow[] = [
    { cells: ['Factor', 'Category', 'Score', 'Impact'] },
    ...topRisks.map(factor => ({
      cells: [
        factor.name,
        factor.category,
        `${factor.score}/${factor.maxScore}`,
        factor.impact.toUpperCase(),
      ],
    })),
  ];

  sections.push({
    title: 'Top Risk Factors',
    color: 'orange',
    type: 'table',
    data: riskRows,
  });

  // Scenario comparison
  const scenarioRows: ReportTableRow[] = [
    { cells: ['Scenario', 'ROI', 'Risk Score', 'Description'] },
    ...scenarios.map(s => ({
      cells: [
        s.name,
        formatPercent(s.roi),
        s.riskScore.toString(),
        s.description,
      ],
    })),
  ];

  sections.push({
    title: 'Scenario Analysis',
    color: 'blue',
    type: 'table',
    data: scenarioRows,
  });

  return {
    calculatorType: 'cap-rate',
    title: 'Risk Assessment Report',
    subtitle: `${investment.propertyType} in ${investment.location}`,
    currency: symbol,
    symbol,
    generatedDate: getDate(),
    rating: {
      grade: riskGrade,
      label: 'Risk Level',
      value: `${riskScore.overall}/100`,
      description: riskLevel + ' Risk',
    },
    sections,
  };
}

export { formatCurrency, formatPercent, getDate };
