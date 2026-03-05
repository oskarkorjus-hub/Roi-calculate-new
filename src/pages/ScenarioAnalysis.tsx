import { useState, useMemo } from 'react';
import type { PortfolioProject, ProjectScenario } from '../types/portfolio';
import { usePortfolio } from '../lib/portfolio-context';
import { useScenarios } from '../hooks/useScenarios';
import { ScenarioComparatorTable } from '../components/ScenarioComparatorTable';
import { ScenarioComparisonCharts } from '../components/ScenarioComparisonCharts';
import { Toast } from '../components/ui/Toast';

// Calculator-specific preview metrics for scenario cards
const CALCULATOR_PREVIEW_METRICS: Record<string, Array<{
  key: string;
  label: string;
  format: (v: any) => string;
}>> = {
  'mortgage': [
    { key: 'monthlyPayment', label: 'Payment', format: (v) => `$${formatNum(v)}/mo` },
    { key: 'totalInterest', label: 'Interest', format: (v) => `$${formatNum(v)}` },
    { key: 'totalInvestment', label: 'Loan', format: (v) => `$${formatNum(v)}` },
  ],
  'financing': [
    { key: 'monthlyPayment', label: 'Payment', format: (v) => `$${formatNum(v)}/mo` },
    { key: 'totalInterest', label: 'Interest', format: (v) => `$${formatNum(v)}` },
    { key: 'effectiveRate', label: 'Rate', format: (v) => `${(v || 0).toFixed(2)}%` },
  ],
  'rental-roi': [
    { key: 'roi', label: 'ROI', format: (v) => `${(v || 0).toFixed(1)}%` },
    { key: 'avgCashFlow', label: 'Profit', format: (v) => `$${formatNum(v)}/yr` },
    { key: 'totalRevenue', label: '10-Yr Rev', format: (v) => `$${formatNum(v)}` },
  ],
  'rental-projection': [
    { key: 'avgCashFlow', label: 'Net Income', format: (v) => `$${formatNum(v)}/yr` },
    { key: 'annualRevenue', label: 'Revenue', format: (v) => `$${formatNum(v)}/yr` },
    { key: 'occupancyRate', label: 'Occupancy', format: (v) => `${(v || 0).toFixed(0)}%` },
  ],
  'cashflow': [
    { key: 'avgCashFlow', label: 'Cash Flow', format: (v) => `$${formatNum(v)}/mo` },
    { key: 'annualCashFlow', label: 'Annual', format: (v) => `$${formatNum(v)}` },
    { key: 'expenseRatio', label: 'Expenses', format: (v) => `${(v || 0).toFixed(1)}%` },
  ],
  'cap-rate': [
    { key: 'capRate', label: 'Cap Rate', format: (v) => `${(v || 0).toFixed(2)}%` },
    { key: 'noi', label: 'NOI', format: (v) => `$${formatNum(v)}` },
    { key: 'grm', label: 'GRM', format: (v) => (v || 0).toFixed(1) },
  ],
  'xirr': [
    { key: 'roi', label: 'XIRR', format: (v) => `${(v || 0).toFixed(2)}%` },
    { key: 'netProfit', label: 'Profit', format: (v) => `$${formatNum(v)}` },
    { key: 'totalReturn', label: 'Return', format: (v) => `$${formatNum(v)}` },
  ],
  'irr': [
    { key: 'irr', label: 'IRR', format: (v) => `${(v || 0).toFixed(2)}%` },
    { key: 'npv', label: 'NPV', format: (v) => `$${formatNum(v)}` },
    { key: 'paybackPeriod', label: 'Payback', format: (v) => `${(v || 0).toFixed(1)} yrs` },
  ],
  'npv': [
    { key: 'npv', label: 'NPV', format: (v) => `$${formatNum(v)}` },
    { key: 'profitabilityIndex', label: 'PI', format: (v) => (v || 0).toFixed(2) },
    { key: 'discountRate', label: 'Discount', format: (v) => `${(v || 0).toFixed(1)}%` },
  ],
  'dev-feasibility': [
    { key: 'roi', label: 'ROI', format: (v) => `${(v || 0).toFixed(1)}%` },
    { key: 'profitMargin', label: 'Margin', format: (v) => `${(v || 0).toFixed(1)}%` },
    { key: 'projectedValue', label: 'Value', format: (v) => `$${formatNum(v)}` },
  ],
  'indonesia-tax': [
    { key: 'effectiveTaxRate', label: 'Tax Rate', format: (v) => `${(v || 0).toFixed(2)}%` },
    { key: 'totalTax', label: 'Tax', format: (v) => `$${formatNum(v)}` },
    { key: 'netIncome', label: 'Net', format: (v) => `$${formatNum(v)}` },
  ],
  'dev-budget': [
    { key: 'variance', label: 'Variance', format: (v) => `${(v || 0).toFixed(1)}%` },
    { key: 'completionPct', label: 'Complete', format: (v) => `${(v || 0).toFixed(0)}%` },
    { key: 'actualSpent', label: 'Spent', format: (v) => `$${formatNum(v)}` },
  ],
  'risk-assessment': [
    { key: 'riskScore', label: 'Risk', format: (v) => `${(v || 0).toFixed(0)}/100` },
    { key: 'roi', label: 'ROI', format: (v) => `${(v || 0).toFixed(1)}%` },
    { key: 'sharpeRatio', label: 'Sharpe', format: (v) => (v || 0).toFixed(2) },
  ],
};

// Default preview metrics
const DEFAULT_PREVIEW_METRICS = [
  { key: 'roi', label: 'ROI', format: (v: any) => `${(v || 0).toFixed(1)}%` },
  { key: 'avgCashFlow', label: 'Cash Flow', format: (v: any) => `$${formatNum(v)}` },
  { key: 'totalInvestment', label: 'Investment', format: (v: any) => `$${formatNum(v)}` },
];

// Calculator-specific summary metrics
const CALCULATOR_SUMMARY_METRICS: Record<string, Array<{
  key: string;
  label: string;
  format: (v: any) => string;
  showRange?: boolean;
}>> = {
  'mortgage': [
    { key: 'monthlyPayment', label: 'Payment Range', format: (v) => `$${formatNum(v)}/mo`, showRange: true },
    { key: 'totalInterest', label: 'Interest Range', format: (v) => `$${formatNum(v)}`, showRange: true },
  ],
  'financing': [
    { key: 'monthlyPayment', label: 'Payment Range', format: (v) => `$${formatNum(v)}/mo`, showRange: true },
    { key: 'effectiveRate', label: 'Rate Range', format: (v) => `${(v || 0).toFixed(2)}%`, showRange: true },
  ],
  'rental-roi': [
    { key: 'roi', label: 'ROI Range', format: (v) => `${(v || 0).toFixed(1)}%`, showRange: true },
    { key: 'avgCashFlow', label: 'Profit Range', format: (v) => `$${formatNum(v)}/yr`, showRange: true },
  ],
  'rental-projection': [
    { key: 'avgCashFlow', label: 'Income Range', format: (v) => `$${formatNum(v)}/yr`, showRange: true },
    { key: 'occupancyRate', label: 'Occupancy Range', format: (v) => `${(v || 0).toFixed(0)}%`, showRange: true },
  ],
};

function formatNum(value: any): string {
  const num = Number(value) || 0;
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + 'M';
  if (num >= 1_000) return (num / 1_000).toFixed(0) + 'K';
  return num.toFixed(0);
}

// Calculate scenario results from inputs based on calculator type
function calculateScenarioResults(inputs: Record<string, any>, calculatorId: string, project: PortfolioProject): Record<string, any> {
  const data = inputs || {};
  const baseResults: Record<string, any> = {
    roi: project.roi,
    avgCashFlow: project.avgCashFlow,
    breakEvenMonths: project.breakEvenMonths,
    totalInvestment: project.totalInvestment,
  };

  switch (calculatorId) {
    case 'mortgage':
    case 'financing': {
      const principal = data.loanAmount || project.totalInvestment || 0;
      const annualRate = (data.interestRate || 0) / 100;
      const monthlyRate = annualRate / 12;
      // Support both loanTerm (mortgage) and loanTermYears (financing)
      const termYears = data.loanTerm || data.loanTermYears || 0;
      const termMonths = termYears * 12;

      let monthlyPayment = 0;
      let totalInterest = 0;

      if (monthlyRate > 0 && termMonths > 0 && principal > 0) {
        monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, termMonths)) /
                        (Math.pow(1 + monthlyRate, termMonths) - 1);
        totalInterest = (monthlyPayment * termMonths) - principal;
      } else if (termMonths > 0 && principal > 0) {
        monthlyPayment = principal / termMonths;
      }

      return {
        ...baseResults,
        totalInvestment: principal,
        monthlyPayment: Math.round(monthlyPayment),
        totalInterest: Math.round(totalInterest),
        totalCost: Math.round(principal + totalInterest),
        effectiveRate: annualRate * 100,
        roi: annualRate * 100,
      };
    }

    case 'rental-roi': {
      const investment = data.initialInvestment || project.totalInvestment || 0;
      const dailyRate = data.y1ADR || 0;
      const occupancy = (data.y1Occupancy || 0) / 100;
      const annualRevenue = dailyRate * 365 * occupancy;
      const incentiveFee = (data.incentiveFeePct || 0) / 100;
      const netIncome = annualRevenue * (1 - incentiveFee);
      const roi = investment > 0 ? (netIncome / investment) * 100 : 0;

      return {
        ...baseResults,
        totalInvestment: investment,
        roi: roi,
        avgCashFlow: Math.round(netIncome),
        annualRevenue: Math.round(annualRevenue),
        totalRevenue: Math.round(annualRevenue * 10),
        occupancyRate: data.y1Occupancy || 0,
      };
    }

    case 'rental-projection': {
      const nightlyRate = data.nightlyRate || 0;
      const occupancy = (data.baseOccupancyRate || 0) / 100;
      const monthlyExpenses = data.monthlyExpenses || 0;
      const platformFee = (data.platformFeePercent || 0) / 100;
      const annualRevenue = nightlyRate * 365 * occupancy * (1 - platformFee);
      const annualExpenses = monthlyExpenses * 12;

      return {
        ...baseResults,
        annualRevenue: Math.round(annualRevenue),
        avgCashFlow: Math.round(annualRevenue - annualExpenses),
        occupancyRate: data.baseOccupancyRate || 0,
        averageNightlyRate: nightlyRate,
      };
    }

    case 'cap-rate': {
      const propertyValue = data.propertyValue || project.totalInvestment || 0;
      const noi = data.annualNOI || 0;
      const capRate = propertyValue > 0 ? (noi / propertyValue) * 100 : 0;

      return {
        ...baseResults,
        totalInvestment: propertyValue,
        capRate: capRate,
        noi: noi,
        grm: noi > 0 ? propertyValue / noi : 0,
        roi: capRate,
      };
    }

    case 'cashflow': {
      const monthlyIncome = data.monthlyRentalIncome || 0;
      const totalExpenses = (data.monthlyMortgage || 0) + (data.monthlyMaintenance || 0) +
                           (data.monthlyPropertyTax || 0) + (data.monthlyInsurance || 0);
      const monthlyCashFlow = monthlyIncome - totalExpenses;

      return {
        ...baseResults,
        avgCashFlow: Math.round(monthlyCashFlow),
        annualCashFlow: Math.round(monthlyCashFlow * 12),
        expenseRatio: monthlyIncome > 0 ? (totalExpenses / monthlyIncome) * 100 : 0,
      };
    }

    case 'xirr': {
      const totalPrice = data.property?.totalPrice || data.totalInvestment || project.totalInvestment || 0;
      const exitPrice = data.exit?.exitPrice || 0;
      const monthlyRental = data.rental?.monthlyRate || 0;
      const occupancy = (data.rental?.occupancyRate || 100) / 100;
      const netProfit = exitPrice - totalPrice + (monthlyRental * 12 * occupancy);
      const roi = totalPrice > 0 ? (netProfit / totalPrice) * 100 : 0;

      return {
        ...baseResults,
        totalInvestment: totalPrice,
        roi: roi,
        totalReturn: exitPrice,
        netProfit: Math.round(netProfit),
        avgCashFlow: Math.round(monthlyRental * occupancy),
      };
    }

    case 'irr': {
      const investment = data.initialInvestment || project.totalInvestment || 0;
      const irr = data.irr || data.roi || 0;
      const npv = data.npv || 0;

      return {
        ...baseResults,
        totalInvestment: investment,
        irr: irr,
        npv: npv,
        roi: irr,
        paybackPeriod: data.paybackPeriod || data.holdingPeriodYears || 0,
      };
    }

    case 'npv': {
      const investment = data.initialInvestment || project.totalInvestment || 0;
      const npv = data.npv || 0;
      const pi = investment > 0 ? (npv + investment) / investment : 0;

      return {
        ...baseResults,
        totalInvestment: investment,
        npv: npv,
        discountRate: data.discountRate || 0,
        profitabilityIndex: pi,
        roi: investment > 0 ? (npv / investment) * 100 : 0,
      };
    }

    case 'dev-feasibility': {
      const landCost = data.landCost || 0;
      const constructionCost = data.constructionCost || 0;
      const softCosts = data.softCosts || 0;
      const contingency = (data.contingencyPercent || 0) / 100;
      const totalCost = (landCost + constructionCost + softCosts) * (1 + contingency);
      const salePrice = data.expectedSalePrice || 0;
      const profit = salePrice - totalCost;
      const roi = totalCost > 0 ? (profit / totalCost) * 100 : 0;

      return {
        ...baseResults,
        totalInvestment: Math.round(totalCost),
        roi: roi,
        projectedValue: salePrice,
        profitMargin: salePrice > 0 ? (profit / salePrice) * 100 : 0,
        avgCashFlow: Math.round(profit),
      };
    }

    case 'indonesia-tax': {
      const purchasePrice = data.purchasePrice || project.totalInvestment || 0;
      const salePrice = data.projectedSalePrice || data.salePrice || 0;
      const holdingYears = data.holdingPeriod || data.holdingPeriodYears || 1;
      const buildingValue = data.buildingValue || 0;
      const depreciationRate = (data.buildingDepreciationRate || 0) / 100;
      const corporateTaxRate = (data.corporateTaxRate || 22) / 100;
      const capGainRate = (data.individualCapGainRate || 20) / 100;
      const acquisitionCosts = data.acquisitionCosts || 0;
      const sellingCosts = data.sellingCosts || 0;

      const totalDepreciation = buildingValue * depreciationRate * holdingYears;
      const adjustedBasis = purchasePrice + acquisitionCosts - totalDepreciation;
      const netProceeds = salePrice - sellingCosts;
      const capitalGain = Math.max(0, netProceeds - adjustedBasis);
      const capitalGainsTax = capitalGain * capGainRate;
      const depreciationTaxSavings = totalDepreciation * corporateTaxRate;
      const netTax = capitalGainsTax - depreciationTaxSavings;
      const netProfit = netProceeds - purchasePrice - acquisitionCosts - Math.max(0, netTax);

      return {
        ...baseResults,
        totalInvestment: purchasePrice,
        effectiveTaxRate: capitalGain > 0 ? (capitalGainsTax / capitalGain) * 100 : 0,
        totalTax: Math.round(Math.max(0, netTax)),
        capitalGainsTax: Math.round(capitalGainsTax),
        taxSavings: Math.round(depreciationTaxSavings),
        netIncome: Math.round(netProfit),
        netProfit: Math.round(netProfit),
        totalDepreciation: Math.round(totalDepreciation),
        roi: purchasePrice > 0 ? (netProfit / purchasePrice) * 100 : 0,
      };
    }

    case 'dev-budget': {
      const landCost = data.landCost || 0;
      const constructionHard = data.constructionHard || 0;
      const softCosts = data.softCosts || 0;
      const contingency = data.contingency || 0;
      const financing = data.financing || 0;
      const marketing = data.marketing || 0;

      // Actual costs
      const landCostActual = data.landCostActual || 0;
      const constructionHardActual = data.constructionHardActual || 0;
      const softCostsActual = data.softCostsActual || 0;
      const contingencyUsed = data.contingencyUsed || 0;
      const financingActual = data.financingActual || 0;
      const marketingActual = data.marketingActual || 0;

      const totalBudget = landCost + constructionHard + softCosts + contingency + financing + marketing;
      const actualSpent = landCostActual + constructionHardActual + softCostsActual + contingencyUsed + financingActual + marketingActual;
      const variance = totalBudget > 0 ? ((actualSpent - totalBudget) / totalBudget) * 100 : 0;
      const completionPct = data.completionPct || 0;
      const contingencyRemaining = contingency - contingencyUsed;

      return {
        ...baseResults,
        totalBudget: Math.round(totalBudget),
        totalInvestment: Math.round(totalBudget),
        actualSpent: Math.round(actualSpent),
        variance: variance,
        completionPct: completionPct,
        contingencyRemaining: Math.round(contingencyRemaining),
        contingencyUsed: Math.round(contingencyUsed),
        landCost: Math.round(landCost),
        constructionCost: Math.round(constructionHard),
        softCosts: Math.round(softCosts),
      };
    }

    case 'risk-assessment': {
      const investmentAmount = data.investmentAmount || project.totalInvestment || 0;
      const projectROI = data.projectROI || data.roi || 0;
      const annualCashFlow = data.annualCashFlow || 0;
      const breakEvenMonths = data.breakEvenMonths || 0;
      const averageOccupancy = data.averageOccupancy || 0;
      const dscr = data.debtServiceCoverageRatio || 0;
      const leverageRatio = data.leverageRatio || 0;
      const equityAmount = data.equityAmount || 0;
      const debtAmount = data.debtAmount || 0;

      // Calculate risk score (lower is better)
      let riskScore = 50; // baseline
      if (dscr >= 1.5) riskScore -= 15;
      else if (dscr >= 1.25) riskScore -= 10;
      else if (dscr < 1.0) riskScore += 20;
      if (leverageRatio > 0.8) riskScore += 15;
      else if (leverageRatio < 0.5) riskScore -= 10;
      if (averageOccupancy >= 80) riskScore -= 10;
      else if (averageOccupancy < 60) riskScore += 15;
      if (projectROI > 15) riskScore -= 10;
      else if (projectROI < 5) riskScore += 10;

      // Calculate Sharpe ratio approximation (assuming 3% risk-free rate, 15% volatility)
      const riskFreeRate = 3;
      const volatility = 15 + (leverageRatio * 10); // Higher leverage = higher volatility
      const sharpeRatio = volatility > 0 ? (projectROI - riskFreeRate) / volatility : 0;

      return {
        ...baseResults,
        totalInvestment: investmentAmount,
        riskScore: Math.max(0, Math.min(100, riskScore)),
        roi: projectROI,
        avgCashFlow: annualCashFlow,
        annualCashFlow: annualCashFlow,
        breakEvenMonths: breakEvenMonths,
        occupancyRate: averageOccupancy,
        dscr: dscr,
        leverageRatio: leverageRatio,
        volatility: volatility,
        sharpeRatio: sharpeRatio,
        equityAmount: equityAmount,
        debtAmount: debtAmount,
      };
    }

    default:
      return baseResults;
  }
}

// Calculate baseline results from project data based on calculator type
function calculateBaselineResults(project: PortfolioProject): Record<string, any> {
  const data = project.data || {};
  const baseResults: Record<string, any> = {
    roi: project.roi,
    avgCashFlow: project.avgCashFlow,
    breakEvenMonths: project.breakEvenMonths,
    totalInvestment: project.totalInvestment,
  };

  switch (project.calculatorId) {
    case 'mortgage':
    case 'financing': {
      const principal = data.loanAmount || project.totalInvestment || 0;
      const annualRate = (data.interestRate || 0) / 100;
      const monthlyRate = annualRate / 12;
      // Support both loanTerm (mortgage) and loanTermYears (financing)
      const termYears = data.loanTerm || data.loanTermYears || 0;
      const termMonths = termYears * 12;

      let monthlyPayment = 0;
      let totalInterest = 0;

      if (monthlyRate > 0 && termMonths > 0 && principal > 0) {
        monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, termMonths)) /
                        (Math.pow(1 + monthlyRate, termMonths) - 1);
        totalInterest = (monthlyPayment * termMonths) - principal;
      } else if (termMonths > 0 && principal > 0) {
        monthlyPayment = principal / termMonths;
      }

      return {
        ...baseResults,
        totalInvestment: principal,
        monthlyPayment: Math.round(monthlyPayment),
        totalInterest: Math.round(totalInterest),
        totalCost: Math.round(principal + totalInterest),
        effectiveRate: annualRate * 100,
        // Also set roi field for the table (uses 'roi' for 'Effective Rate')
        roi: annualRate * 100,
      };
    }

    case 'rental-roi': {
      const investment = data.initialInvestment || project.totalInvestment || 0;
      const dailyRate = data.y1ADR || 0;
      const occupancy = (data.y1Occupancy || 0) / 100;
      const annualRevenue = dailyRate * 365 * occupancy;
      const incentiveFee = (data.incentiveFeePct || 0) / 100;
      const netIncome = annualRevenue * (1 - incentiveFee);

      return {
        ...baseResults,
        totalInvestment: investment,
        avgCashFlow: Math.round(netIncome),
        annualRevenue: Math.round(annualRevenue),
        totalRevenue: Math.round(annualRevenue * 10),
        occupancyRate: data.y1Occupancy || 0,
      };
    }

    case 'rental-projection': {
      const nightlyRate = data.nightlyRate || 0;
      const occupancy = (data.baseOccupancyRate || 0) / 100;
      const monthlyExpenses = data.monthlyExpenses || 0;
      const platformFee = (data.platformFeePercent || 0) / 100;
      const annualRevenue = nightlyRate * 365 * occupancy * (1 - platformFee);
      const annualExpenses = monthlyExpenses * 12;

      return {
        ...baseResults,
        annualRevenue: Math.round(annualRevenue),
        avgCashFlow: Math.round(annualRevenue - annualExpenses),
        occupancyRate: data.baseOccupancyRate || 0,
        averageNightlyRate: nightlyRate,
      };
    }

    case 'cap-rate': {
      const propertyValue = data.propertyValue || project.totalInvestment || 0;
      const noi = data.annualNOI || 0;
      const capRate = propertyValue > 0 ? (noi / propertyValue) * 100 : 0;

      return {
        ...baseResults,
        totalInvestment: propertyValue,
        capRate: capRate,
        noi: noi,
        grm: noi > 0 ? propertyValue / noi : 0,
      };
    }

    case 'cashflow': {
      const monthlyIncome = data.monthlyRentalIncome || 0;
      const totalExpenses = (data.monthlyMortgage || 0) + (data.monthlyMaintenance || 0) +
                           (data.monthlyPropertyTax || 0) + (data.monthlyInsurance || 0);
      const monthlyCashFlow = monthlyIncome - totalExpenses;

      return {
        ...baseResults,
        avgCashFlow: Math.round(monthlyCashFlow),
        annualCashFlow: Math.round(monthlyCashFlow * 12),
        expenseRatio: monthlyIncome > 0 ? (totalExpenses / monthlyIncome) * 100 : 0,
      };
    }

    case 'indonesia-tax': {
      const purchasePrice = data.purchasePrice || project.totalInvestment || 0;
      const salePrice = data.projectedSalePrice || 0;
      const holdingYears = data.holdingPeriod || 1;
      const buildingValue = data.buildingValue || 0;
      const depreciationRate = (data.buildingDepreciationRate || 0) / 100;
      const corporateTaxRate = (data.corporateTaxRate || 22) / 100;
      const capGainRate = (data.individualCapGainRate || 20) / 100;

      const totalDepreciation = buildingValue * depreciationRate * holdingYears;
      const capitalGain = Math.max(0, salePrice - purchasePrice - totalDepreciation);
      const capitalGainsTax = capitalGain * capGainRate;
      const depreciationTaxSavings = totalDepreciation * corporateTaxRate;
      const netProfit = salePrice - purchasePrice - capitalGainsTax + depreciationTaxSavings;

      return {
        ...baseResults,
        totalInvestment: purchasePrice,
        effectiveTaxRate: capitalGain > 0 ? (capitalGainsTax / capitalGain) * 100 : 0,
        totalTax: Math.round(capitalGainsTax),
        capitalGainsTax: Math.round(capitalGainsTax),
        taxSavings: Math.round(depreciationTaxSavings),
        netIncome: Math.round(netProfit),
        netProfit: Math.round(netProfit),
        roi: purchasePrice > 0 ? (netProfit / purchasePrice) * 100 : 0,
      };
    }

    case 'dev-budget': {
      const landCost = data.landCost || 0;
      const constructionHard = data.constructionHard || 0;
      const softCosts = data.softCosts || 0;
      const contingency = data.contingency || 0;
      const financing = data.financing || 0;
      const marketing = data.marketing || 0;

      // Actual costs
      const landCostActual = data.landCostActual || 0;
      const constructionHardActual = data.constructionHardActual || 0;
      const softCostsActual = data.softCostsActual || 0;
      const contingencyUsed = data.contingencyUsed || 0;
      const financingActual = data.financingActual || 0;
      const marketingActual = data.marketingActual || 0;

      const totalBudget = landCost + constructionHard + softCosts + contingency + financing + marketing;
      const actualSpent = landCostActual + constructionHardActual + softCostsActual + contingencyUsed + financingActual + marketingActual;
      const variance = totalBudget > 0 ? ((actualSpent - totalBudget) / totalBudget) * 100 : 0;
      const completionPct = data.completionPct || 0;
      const contingencyRemaining = contingency - contingencyUsed;

      return {
        ...baseResults,
        totalBudget: Math.round(totalBudget),
        totalInvestment: Math.round(totalBudget),
        actualSpent: Math.round(actualSpent),
        variance: variance,
        completionPct: completionPct,
        contingencyRemaining: Math.round(contingencyRemaining),
        landCost: Math.round(landCost),
        constructionCost: Math.round(constructionHard),
        softCosts: Math.round(softCosts),
      };
    }

    case 'risk-assessment': {
      const investmentAmount = data.investmentAmount || project.totalInvestment || 0;
      const projectROI = data.projectROI || 0;
      const annualCashFlow = data.annualCashFlow || 0;
      const dscr = data.debtServiceCoverageRatio || 0;
      const leverageRatio = data.leverageRatio || 0;
      const averageOccupancy = data.averageOccupancy || 0;

      let riskScore = 50;
      if (dscr >= 1.5) riskScore -= 15;
      else if (dscr >= 1.25) riskScore -= 10;
      else if (dscr < 1.0) riskScore += 20;
      if (leverageRatio > 0.8) riskScore += 15;
      else if (leverageRatio < 0.5) riskScore -= 10;
      if (averageOccupancy >= 80) riskScore -= 10;
      else if (averageOccupancy < 60) riskScore += 15;

      const riskFreeRate = 3;
      const volatility = 15 + (leverageRatio * 10);
      const sharpeRatio = volatility > 0 ? (projectROI - riskFreeRate) / volatility : 0;

      return {
        ...baseResults,
        totalInvestment: investmentAmount,
        riskScore: Math.max(0, Math.min(100, riskScore)),
        roi: projectROI,
        avgCashFlow: annualCashFlow,
        dscr: dscr,
        leverageRatio: leverageRatio,
        volatility: volatility,
        sharpeRatio: sharpeRatio,
      };
    }

    default:
      return baseResults;
  }
}

interface ScenarioAnalysisPageProps {
  projectId: string;
  onBack?: () => void;
}

export function ScenarioAnalysisPage({ projectId, onBack }: ScenarioAnalysisPageProps) {
  const { getProjectById, updateProject } = usePortfolio();
  const { deleteScenario, calculateWinner } = useScenarios();

  const project = getProjectById(projectId);
  const [selectedScenarioIds, setSelectedScenarioIds] = useState<string[]>([]);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [deletingScenario, setDeletingScenario] = useState<{ id: string; name: string } | null>(null);

  if (!project) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Project Not Found</h2>
          <button
            onClick={onBack}
            className="px-4 py-2 text-emerald-400 hover:text-emerald-300 underline"
          >
            ← Back
          </button>
        </div>
      </div>
    );
  }

  const scenarios = project.scenarios || [];

  // Recalculate scenario results from inputs to ensure they're always up-to-date
  const scenariosWithRecalculatedResults = useMemo(() => {
    return scenarios.map(scenario => ({
      ...scenario,
      results: calculateScenarioResults(scenario.inputs, project.calculatorId, project),
    }));
  }, [scenarios, project]);

  const selectedScenarios = scenariosWithRecalculatedResults.filter(s => selectedScenarioIds.includes(s.id));

  // Get calculator-specific preview metrics
  const previewMetrics = CALCULATOR_PREVIEW_METRICS[project.calculatorId] || DEFAULT_PREVIEW_METRICS;

  // Calculate baseline results with calculator-specific metrics
  const baselineResults = useMemo(() => calculateBaselineResults(project), [project]);

  const baselineScenario: ProjectScenario = {
    id: project.id,
    name: 'Baseline (Original)',
    baseProjectId: project.id,
    inputs: project.data || {},
    results: baselineResults,
    createdAt: project.createdAt,
    isBaseline: true,
  };

  const winner = useMemo(
    () => calculateWinner([baselineScenario, ...selectedScenarios]),
    [selectedScenarios, baselineScenario, calculateWinner]
  );

  const handleDeleteScenario = (scenarioId: string) => {
    deleteScenario(projectId, scenarioId);
    setSelectedScenarioIds(prev => prev.filter(id => id !== scenarioId));
    setToast({ message: 'Scenario deleted', type: 'success' });
  };

  const handleRenameScenario = (scenarioId: string, newScenarioName: string) => {
    const updatedScenarios = (project.scenarios || []).map(s =>
      s.id === scenarioId ? { ...s, name: newScenarioName } : s
    );
    updateProject(projectId, { scenarios: updatedScenarios });
    setRenamingId(null);
    setNewName('');
    setToast({ message: 'Scenario renamed', type: 'success' });
  };

  const toggleScenarioSelection = (scenarioId: string) => {
    setSelectedScenarioIds(prev =>
      prev.includes(scenarioId)
        ? prev.filter(id => id !== scenarioId)
        : [...prev, scenarioId].slice(-4) // Max 4 scenarios selected
    );
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white -mx-4 md:-mx-10 lg:-mx-20 -my-8 px-6 py-8">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="max-w-[100%] mx-auto space-y-8">
        {/* Header */}
        <header className="mb-6 sm:mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center">
              <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{project.projectName}</h1>
              <p className="text-zinc-500 text-sm mt-1">{project.location}</p>
            </div>
          </div>
          {onBack && (
            <button
              onClick={onBack}
              className="px-3 sm:px-4 py-3 min-h-[44px] bg-zinc-800 text-zinc-300 border border-zinc-700 rounded-lg hover:bg-zinc-700 transition font-medium flex items-center gap-2 text-xs sm:text-sm"
            >
              ← Back to Portfolio
            </button>
          )}
        </header>

        {/* Scenario Selector */}
        {scenarios.length > 0 && (
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
            <div className="mb-6 flex items-center border-b border-zinc-800 pb-4">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
                <h2 className="text-xl font-bold text-white">Select Scenarios to Compare</h2>
              </div>
            </div>
            <p className="text-sm text-zinc-400 mb-4">
              Choose up to 4 scenarios. Selected: {selectedScenarios.length}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {scenarios.map(scenario => (
                <label
                  key={scenario.id}
                  className={`group relative p-4 rounded-xl border-2 cursor-pointer transition ${
                    selectedScenarioIds.includes(scenario.id)
                      ? 'border-emerald-500 bg-emerald-500/10'
                      : 'border-zinc-700 bg-zinc-800 hover:border-zinc-600'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedScenarioIds.includes(scenario.id)}
                    onChange={() => toggleScenarioSelection(scenario.id)}
                    disabled={
                      !selectedScenarioIds.includes(scenario.id) && selectedScenarioIds.length >= 4
                    }
                    className="absolute top-3 right-3 w-4 h-4 cursor-pointer accent-emerald-500"
                  />

                  <div className="pr-8">
                    <h3 className="font-semibold text-white">{scenario.name}</h3>
                    <div className="mt-2 space-y-1 text-sm text-zinc-400">
                      {previewMetrics.map((metric, idx) => {
                        const value = scenario.results[metric.key];
                        const hasValue = value !== undefined && value !== null && value !== 0;
                        return (
                          <div key={metric.key}>
                            {metric.label}: <span className={hasValue ? 'text-emerald-400' : 'text-zinc-500'}>
                              {metric.format(value)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Action Menu */}
                  <div className="absolute bottom-3 right-3 flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition">
                    <button
                      onClick={e => {
                        e.preventDefault();
                        setRenamingId(scenario.id);
                        setNewName(scenario.name);
                      }}
                      className="p-2 min-w-[36px] min-h-[36px] bg-zinc-700/80 text-zinc-300 rounded-lg hover:bg-zinc-600 flex items-center justify-center transition"
                      title="Rename scenario"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={e => {
                        e.preventDefault();
                        setDeletingScenario({ id: scenario.id, name: scenario.name });
                      }}
                      className="p-2 min-w-[36px] min-h-[36px] bg-zinc-700/80 text-zinc-300 rounded-lg hover:bg-red-500/30 hover:text-red-400 flex items-center justify-center transition"
                      title="Delete scenario"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Rename Modal */}
        {renamingId && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6 max-w-sm w-full">
              <h3 className="text-lg font-bold text-white mb-4">Rename Scenario</h3>
              <input
                type="text"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent mb-4 outline-none"
                autoFocus
              />
              <div className="flex gap-3">
                <button
                  onClick={() => setRenamingId(null)}
                  className="flex-1 px-4 py-2 border border-zinc-700 text-zinc-300 rounded-lg hover:bg-zinc-800"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleRenameScenario(renamingId, newName)}
                  className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deletingScenario && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6 max-w-md w-full shadow-2xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Delete Scenario</h3>
                  <p className="text-sm text-zinc-400">This action cannot be undone</p>
                </div>
              </div>
              <p className="text-zinc-300 mb-6">
                Are you sure you want to delete <span className="font-semibold text-white">"{deletingScenario.name}"</span>?
                All data associated with this scenario will be permanently removed.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeletingScenario(null)}
                  className="flex-1 px-4 py-3 text-zinc-300 border border-zinc-700 rounded-xl hover:bg-zinc-800 transition font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    handleDeleteScenario(deletingScenario.id);
                    setDeletingScenario(null);
                  }}
                  className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition font-medium flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Comparison Results */}
        {selectedScenarios.length > 0 && (
          <div className="space-y-8">
            {/* Winner Badge */}
            {winner && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                  <h3 className="text-lg font-bold text-emerald-400">Best Overall Scenario</h3>
                </div>
                <p className="text-zinc-300">
                  <span className="font-semibold text-white">{winner.name}</span> is the most profitable scenario with a
                  composite score of {winner.score?.toFixed(0)}.
                </p>
              </div>
            )}

            {/* Metrics Table */}
            <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
              <div className="mb-6 flex items-center border-b border-zinc-800 pb-4">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <h3 className="text-xl font-bold text-white">Detailed Comparison</h3>
                </div>
              </div>
              <ScenarioComparatorTable
                scenarios={selectedScenarios}
                baselineScenario={baselineScenario}
                calculatorId={project.calculatorId}
              />
            </div>

            {/* Charts */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Visual Analysis</h3>
              <ScenarioComparisonCharts
                scenarios={selectedScenarios}
                baselineScenario={baselineScenario}
                calculatorId={project.calculatorId}
              />
            </div>

            {/* Summary */}
            <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
              <div className="mb-6 flex items-center border-b border-zinc-800 pb-4">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className="text-xl font-bold text-white">Analysis Summary</h3>
                </div>
              </div>
              <div className="space-y-3 text-sm text-zinc-400">
                <p>
                  <strong className="text-white">Scenarios Compared:</strong> {selectedScenarios.length + 1} (including baseline)
                </p>
                {/* Calculator-specific summary metrics */}
                {(CALCULATOR_SUMMARY_METRICS[project.calculatorId] || [
                  { key: 'roi', label: 'ROI Range', format: (v: any) => `${(v || 0).toFixed(1)}%`, showRange: true },
                  { key: 'avgCashFlow', label: 'Cash Flow Range', format: (v: any) => `$${formatNum(v)}`, showRange: true },
                ]).map((metric) => {
                  const allValues = [baselineScenario, ...selectedScenarios]
                    .map(s => Number(s.results[metric.key]) || 0)
                    .filter(v => !isNaN(v));

                  if (allValues.length === 0 || allValues.every(v => v === 0)) return null;

                  const minVal = Math.min(...allValues);
                  const maxVal = Math.max(...allValues);

                  return (
                    <p key={metric.key}>
                      <strong className="text-white">{metric.label}:</strong>{' '}
                      <span className="text-emerald-400">{metric.format(minVal)}</span>
                      {minVal !== maxVal && (
                        <>
                          {' - '}
                          <span className="text-emerald-400">{metric.format(maxVal)}</span>
                        </>
                      )}
                    </p>
                  );
                })}
                <p className="pt-2 italic text-zinc-500">
                  All metrics are based on calculator inputs. Consider external factors when making investment decisions.
                </p>
              </div>
            </div>
          </div>
        )}

        {scenarios.length === 0 && (
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-12 text-center">
            <h3 className="text-lg font-semibold text-white mb-2">No Scenarios Yet</h3>
            <p className="text-zinc-400">
              Create a scenario variant to compare different investment parameters and strategies.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
