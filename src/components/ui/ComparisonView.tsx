import { useState } from 'react';
import { useComparison } from '../../lib/comparison-context';
import type {
  CalculatorType,
  ComparisonData,
  RentalROIComparisonData,
  XIRRComparisonData,
  MortgageComparisonData,
  CashFlowComparisonData,
  DevFeasibilityComparisonData,
  CapRateComparisonData,
  IRRComparisonData,
  NPVComparisonData,
  FinancingComparisonData,
  RentalProjectionComparisonData,
  IndonesiaTaxComparisonData,
  DevBudgetComparisonData,
  RiskAssessmentComparisonData,
} from '../../lib/comparison-types';
import { MAX_COMPARISONS, calculatorDisplayNames } from '../../lib/comparison-types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  calculatorType: CalculatorType;
}

const formatCurrency = (value: number, currency: string): string => {
  const symbols: Record<string, string> = {
    USD: '$', EUR: '€', AUD: 'A$', GBP: '£', INR: '₹', CNY: '¥', AED: 'د.إ', RUB: '₽', IDR: 'Rp',
  };
  const symbol = symbols[currency] || currency;
  if (value >= 1_000_000) {
    return `${symbol} ${(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= 1_000) {
    return `${symbol} ${(value / 1_000).toFixed(0)}K`;
  }
  return `${symbol} ${value.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
};

const formatDate = (timestamp: number): string => {
  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getRatingColor = (grade: string): string => {
  if (grade.startsWith('A')) return 'text-emerald-400 bg-emerald-500/20';
  if (grade.startsWith('B')) return 'text-cyan-400 bg-cyan-500/20';
  if (grade.startsWith('C')) return 'text-yellow-400 bg-yellow-500/20';
  return 'text-red-400 bg-red-500/20';
};

const getBestWorst = (values: number[], higherIsBetter: boolean): { best: number; worst: number } => {
  const filtered = values.filter(v => v !== undefined && v !== null && !isNaN(v));
  if (filtered.length === 0) return { best: 0, worst: 0 };
  const sorted = [...filtered].sort((a, b) => higherIsBetter ? b - a : a - b);
  return { best: sorted[0], worst: sorted[sorted.length - 1] };
};

const getValueClass = (value: number, best: number, worst: number): string => {
  if (value === best) return 'text-emerald-400 font-bold';
  if (value === worst && best !== worst) return 'text-red-400';
  return '';
};

// Metric configurations for each calculator type
interface MetricConfig {
  label: string;
  getValue: (item: ComparisonData) => string | number | React.ReactNode;
  getNumericValue?: (item: ComparisonData) => number;
  higherIsBetter?: boolean;
  isRating?: boolean;
}

const getMetricsConfig = (calculatorType: CalculatorType): MetricConfig[] => {
  switch (calculatorType) {
    case 'rental-roi':
      return [
        { label: 'Investment Rating', isRating: true, getValue: (i) => (i as RentalROIComparisonData).investmentRating?.grade || '-' },
        { label: 'Initial Investment', getValue: (i) => formatCurrency((i as RentalROIComparisonData).initialInvestment, i.currency) },
        { label: 'Keys/Units', getValue: (i) => (i as RentalROIComparisonData).keys || '-' },
        // Calculated: Investment per Key
        { label: 'Investment/Key', getValue: (i) => {
          const d = i as RentalROIComparisonData;
          return d.keys > 0 ? formatCurrency(d.initialInvestment / d.keys, i.currency) : '-';
        }, getNumericValue: (i) => {
          const d = i as RentalROIComparisonData;
          return d.keys > 0 ? d.initialInvestment / d.keys : 0;
        }, higherIsBetter: false },
        { label: 'Year 1 ADR', getValue: (i) => formatCurrency((i as RentalROIComparisonData).y1ADR, i.currency), getNumericValue: (i) => (i as RentalROIComparisonData).y1ADR, higherIsBetter: true },
        { label: 'Year 1 Occupancy', getValue: (i) => `${(i as RentalROIComparisonData).y1Occupancy}%`, getNumericValue: (i) => (i as RentalROIComparisonData).y1Occupancy, higherIsBetter: true },
        // Calculated: RevPAR (Revenue Per Available Room)
        { label: 'RevPAR (Y1)', getValue: (i) => {
          const d = i as RentalROIComparisonData;
          const revpar = d.y1ADR * (d.y1Occupancy / 100);
          return formatCurrency(revpar, i.currency);
        }, getNumericValue: (i) => {
          const d = i as RentalROIComparisonData;
          return d.y1ADR * (d.y1Occupancy / 100);
        }, higherIsBetter: true },
        { label: '10-Year Avg ROI', getValue: (i) => `${(i as RentalROIComparisonData).avgROI?.toFixed(1) || 0}%`, getNumericValue: (i) => (i as RentalROIComparisonData).avgROI, higherIsBetter: true },
        { label: 'Total Revenue (10Y)', getValue: (i) => formatCurrency((i as RentalROIComparisonData).totalRevenue, i.currency), getNumericValue: (i) => (i as RentalROIComparisonData).totalRevenue, higherIsBetter: true },
        { label: 'Total Profit (10Y)', getValue: (i) => formatCurrency((i as RentalROIComparisonData).totalProfit, i.currency), getNumericValue: (i) => (i as RentalROIComparisonData).totalProfit, higherIsBetter: true },
        // Calculated: Profit Margin
        { label: 'Profit Margin', getValue: (i) => {
          const d = i as RentalROIComparisonData;
          const margin = d.totalRevenue > 0 ? (d.totalProfit / d.totalRevenue) * 100 : 0;
          return `${margin.toFixed(1)}%`;
        }, getNumericValue: (i) => {
          const d = i as RentalROIComparisonData;
          return d.totalRevenue > 0 ? (d.totalProfit / d.totalRevenue) * 100 : 0;
        }, higherIsBetter: true },
        { label: 'Avg Annual Cash Flow', getValue: (i) => formatCurrency((i as RentalROIComparisonData).avgAnnualCashFlow || 0, i.currency), getNumericValue: (i) => (i as RentalROIComparisonData).avgAnnualCashFlow || 0, higherIsBetter: true },
        { label: 'Payback Period', getValue: (i) => `${(i as RentalROIComparisonData).paybackYears?.toFixed(1) || 0} yrs`, getNumericValue: (i) => (i as RentalROIComparisonData).paybackYears, higherIsBetter: false },
        { label: 'Avg GOP Margin', getValue: (i) => `${(i as RentalROIComparisonData).avgGopMargin?.toFixed(1) || 0}%`, getNumericValue: (i) => (i as RentalROIComparisonData).avgGopMargin, higherIsBetter: true },
        // Calculated: Money Multiple
        { label: 'Money Multiple', getValue: (i) => {
          const d = i as RentalROIComparisonData;
          const multiple = d.initialInvestment > 0 ? (d.initialInvestment + d.totalProfit) / d.initialInvestment : 0;
          return `${multiple.toFixed(2)}x`;
        }, getNumericValue: (i) => {
          const d = i as RentalROIComparisonData;
          return d.initialInvestment > 0 ? (d.initialInvestment + d.totalProfit) / d.initialInvestment : 0;
        }, higherIsBetter: true },
      ];

    case 'xirr':
      return [
        { label: 'Investment Rating', isRating: true, getValue: (i) => (i as XIRRComparisonData).investmentRating?.grade || '-' },
        { label: 'Location', getValue: (i) => (i as XIRRComparisonData).location || '-' },
        { label: 'Purchase Price', getValue: (i) => formatCurrency((i as XIRRComparisonData).totalPrice, i.currency) },
        { label: 'Projected Sale', getValue: (i) => formatCurrency((i as XIRRComparisonData).projectedSalesPrice, i.currency) },
        // Calculated: Appreciation %
        { label: 'Appreciation', getValue: (i) => {
          const d = i as XIRRComparisonData;
          const pct = d.totalPrice > 0 ? ((d.projectedSalesPrice - d.totalPrice) / d.totalPrice) * 100 : 0;
          return `${pct.toFixed(1)}%`;
        }, getNumericValue: (i) => {
          const d = i as XIRRComparisonData;
          return d.totalPrice > 0 ? ((d.projectedSalesPrice - d.totalPrice) / d.totalPrice) * 100 : 0;
        }, higherIsBetter: true },
        { label: 'XIRR', getValue: (i) => `${((i as XIRRComparisonData).xirr * 100).toFixed(1)}%`, getNumericValue: (i) => (i as XIRRComparisonData).xirr, higherIsBetter: true },
        { label: 'Total Invested', getValue: (i) => formatCurrency((i as XIRRComparisonData).totalInvested, i.currency) },
        { label: 'Net Profit', getValue: (i) => formatCurrency((i as XIRRComparisonData).netProfit, i.currency), getNumericValue: (i) => (i as XIRRComparisonData).netProfit, higherIsBetter: true },
        // Calculated: Profit on Investment %
        { label: 'Profit/Investment', getValue: (i) => {
          const d = i as XIRRComparisonData;
          const pct = d.totalInvested > 0 ? (d.netProfit / d.totalInvested) * 100 : 0;
          return `${pct.toFixed(1)}%`;
        }, getNumericValue: (i) => {
          const d = i as XIRRComparisonData;
          return d.totalInvested > 0 ? (d.netProfit / d.totalInvested) * 100 : 0;
        }, higherIsBetter: true },
        { label: 'Hold Period', getValue: (i) => `${(i as XIRRComparisonData).holdPeriodMonths} mo`, getNumericValue: (i) => (i as XIRRComparisonData).holdPeriodMonths, higherIsBetter: false },
        // Calculated: Monthly Return
        { label: 'Profit/Month', getValue: (i) => {
          const d = i as XIRRComparisonData;
          const monthly = d.holdPeriodMonths > 0 ? d.netProfit / d.holdPeriodMonths : 0;
          return formatCurrency(monthly, i.currency);
        }, getNumericValue: (i) => {
          const d = i as XIRRComparisonData;
          return d.holdPeriodMonths > 0 ? d.netProfit / d.holdPeriodMonths : 0;
        }, higherIsBetter: true },
      ];

    case 'mortgage':
      return [
        { label: 'Investment Rating', isRating: true, getValue: (i) => (i as MortgageComparisonData).investmentRating?.grade || '-' },
        { label: 'Loan Amount', getValue: (i) => formatCurrency((i as MortgageComparisonData).loanAmount, i.currency) },
        { label: 'Interest Rate', getValue: (i) => `${(i as MortgageComparisonData).interestRate?.toFixed(2) || 0}%`, getNumericValue: (i) => (i as MortgageComparisonData).interestRate, higherIsBetter: false },
        { label: 'Loan Term', getValue: (i) => `${(i as MortgageComparisonData).loanTerm} yrs` },
        { label: 'Monthly Payment', getValue: (i) => formatCurrency((i as MortgageComparisonData).monthlyPayment, i.currency), getNumericValue: (i) => (i as MortgageComparisonData).monthlyPayment, higherIsBetter: false },
        { label: 'Total Interest', getValue: (i) => formatCurrency((i as MortgageComparisonData).totalInterest, i.currency), getNumericValue: (i) => (i as MortgageComparisonData).totalInterest, higherIsBetter: false },
        // Calculated: Interest-to-Principal Ratio
        { label: 'Interest/Principal', getValue: (i) => {
          const d = i as MortgageComparisonData;
          const ratio = d.loanAmount > 0 ? (d.totalInterest / d.loanAmount) * 100 : 0;
          return `${ratio.toFixed(1)}%`;
        }, getNumericValue: (i) => {
          const d = i as MortgageComparisonData;
          return d.loanAmount > 0 ? (d.totalInterest / d.loanAmount) * 100 : 0;
        }, higherIsBetter: false },
        { label: 'Total Payment', getValue: (i) => formatCurrency((i as MortgageComparisonData).totalPayment, i.currency), getNumericValue: (i) => (i as MortgageComparisonData).totalPayment, higherIsBetter: false },
        // Calculated: Annual Payment
        { label: 'Annual Payment', getValue: (i) => formatCurrency((i as MortgageComparisonData).monthlyPayment * 12, i.currency), getNumericValue: (i) => (i as MortgageComparisonData).monthlyPayment * 12, higherIsBetter: false },
        // Calculated: Cost per $1000 borrowed
        { label: 'Cost per $1K', getValue: (i) => {
          const d = i as MortgageComparisonData;
          const cost = d.loanAmount > 0 ? (d.totalPayment / d.loanAmount) * 1000 : 0;
          return formatCurrency(cost, i.currency);
        }, getNumericValue: (i) => {
          const d = i as MortgageComparisonData;
          return d.loanAmount > 0 ? (d.totalPayment / d.loanAmount) * 1000 : 0;
        }, higherIsBetter: false },
      ];

    case 'cashflow':
      return [
        { label: 'Investment Rating', isRating: true, getValue: (i) => (i as CashFlowComparisonData).investmentRating?.grade || '-' },
        { label: 'Monthly Rental', getValue: (i) => formatCurrency((i as CashFlowComparisonData).monthlyRentalIncome, i.currency), getNumericValue: (i) => (i as CashFlowComparisonData).monthlyRentalIncome, higherIsBetter: true },
        { label: 'Vacancy Rate', getValue: (i) => `${(i as CashFlowComparisonData).vacancyRate}%`, getNumericValue: (i) => (i as CashFlowComparisonData).vacancyRate, higherIsBetter: false },
        // Calculated: Effective Gross Income
        { label: 'Effective Monthly', getValue: (i) => {
          const d = i as CashFlowComparisonData;
          const egi = d.monthlyRentalIncome * (1 - d.vacancyRate / 100);
          return formatCurrency(egi, i.currency);
        }, getNumericValue: (i) => {
          const d = i as CashFlowComparisonData;
          return d.monthlyRentalIncome * (1 - d.vacancyRate / 100);
        }, higherIsBetter: true },
        { label: 'Projection Years', getValue: (i) => `${(i as CashFlowComparisonData).projectionYears} yrs` },
        { label: 'Year 1 Net CF', getValue: (i) => formatCurrency((i as CashFlowComparisonData).y1NetCashFlow, i.currency), getNumericValue: (i) => (i as CashFlowComparisonData).y1NetCashFlow, higherIsBetter: true },
        { label: 'Total Cash Flow', getValue: (i) => formatCurrency((i as CashFlowComparisonData).totalCashFlow, i.currency), getNumericValue: (i) => (i as CashFlowComparisonData).totalCashFlow, higherIsBetter: true },
        { label: 'Avg Annual CF', getValue: (i) => formatCurrency((i as CashFlowComparisonData).avgAnnualCashFlow, i.currency), getNumericValue: (i) => (i as CashFlowComparisonData).avgAnnualCashFlow, higherIsBetter: true },
        // Calculated: Monthly Net CF
        { label: 'Monthly Net CF', getValue: (i) => formatCurrency((i as CashFlowComparisonData).avgAnnualCashFlow / 12, i.currency), getNumericValue: (i) => (i as CashFlowComparisonData).avgAnnualCashFlow / 12, higherIsBetter: true },
        // Calculated: Cash Flow Growth
        { label: 'CF Growth', getValue: (i) => {
          const d = i as CashFlowComparisonData;
          const growth = d.y1NetCashFlow !== 0 ? ((d.avgAnnualCashFlow - d.y1NetCashFlow) / Math.abs(d.y1NetCashFlow)) * 100 : 0;
          return `${growth.toFixed(1)}%`;
        }, getNumericValue: (i) => {
          const d = i as CashFlowComparisonData;
          return d.y1NetCashFlow !== 0 ? ((d.avgAnnualCashFlow - d.y1NetCashFlow) / Math.abs(d.y1NetCashFlow)) * 100 : 0;
        }, higherIsBetter: true },
      ];

    case 'dev-feasibility':
      return [
        { label: 'Investment Rating', isRating: true, getValue: (i) => (i as DevFeasibilityComparisonData).investmentRating?.grade || '-' },
        { label: 'Land Cost', getValue: (i) => formatCurrency((i as DevFeasibilityComparisonData).landCost, i.currency) },
        { label: 'Number of Villas', getValue: (i) => (i as DevFeasibilityComparisonData).numVillas },
        { label: 'Total Project Cost', getValue: (i) => formatCurrency((i as DevFeasibilityComparisonData).totalProjectCost, i.currency), getNumericValue: (i) => (i as DevFeasibilityComparisonData).totalProjectCost, higherIsBetter: false },
        // Calculated: Cost per Villa
        { label: 'Cost/Villa', getValue: (i) => {
          const d = i as DevFeasibilityComparisonData;
          return d.numVillas > 0 ? formatCurrency(d.totalProjectCost / d.numVillas, i.currency) : '-';
        }, getNumericValue: (i) => {
          const d = i as DevFeasibilityComparisonData;
          return d.numVillas > 0 ? d.totalProjectCost / d.numVillas : 0;
        }, higherIsBetter: false },
        { label: 'Revenue from Sale', getValue: (i) => formatCurrency((i as DevFeasibilityComparisonData).revenueFromSale, i.currency), getNumericValue: (i) => (i as DevFeasibilityComparisonData).revenueFromSale, higherIsBetter: true },
        // Calculated: Revenue per Villa
        { label: 'Revenue/Villa', getValue: (i) => {
          const d = i as DevFeasibilityComparisonData;
          return d.numVillas > 0 ? formatCurrency(d.revenueFromSale / d.numVillas, i.currency) : '-';
        }, getNumericValue: (i) => {
          const d = i as DevFeasibilityComparisonData;
          return d.numVillas > 0 ? d.revenueFromSale / d.numVillas : 0;
        }, higherIsBetter: true },
        { label: 'Flip Profit', getValue: (i) => formatCurrency((i as DevFeasibilityComparisonData).flipProfit, i.currency), getNumericValue: (i) => (i as DevFeasibilityComparisonData).flipProfit, higherIsBetter: true },
        // Calculated: Profit Margin
        { label: 'Profit Margin', getValue: (i) => {
          const d = i as DevFeasibilityComparisonData;
          const margin = d.revenueFromSale > 0 ? (d.flipProfit / d.revenueFromSale) * 100 : 0;
          return `${margin.toFixed(1)}%`;
        }, getNumericValue: (i) => {
          const d = i as DevFeasibilityComparisonData;
          return d.revenueFromSale > 0 ? (d.flipProfit / d.revenueFromSale) * 100 : 0;
        }, higherIsBetter: true },
        // Calculated: Profit per Villa
        { label: 'Profit/Villa', getValue: (i) => {
          const d = i as DevFeasibilityComparisonData;
          return d.numVillas > 0 ? formatCurrency(d.flipProfit / d.numVillas, i.currency) : '-';
        }, getNumericValue: (i) => {
          const d = i as DevFeasibilityComparisonData;
          return d.numVillas > 0 ? d.flipProfit / d.numVillas : 0;
        }, higherIsBetter: true },
        { label: 'Flip ROI', getValue: (i) => `${(i as DevFeasibilityComparisonData).flipROI?.toFixed(1) || 0}%`, getNumericValue: (i) => (i as DevFeasibilityComparisonData).flipROI, higherIsBetter: true },
        { label: 'Hold ROI', getValue: (i) => `${(i as DevFeasibilityComparisonData).holdROI?.toFixed(1) || 0}%`, getNumericValue: (i) => (i as DevFeasibilityComparisonData).holdROI, higherIsBetter: true },
      ];

    case 'cap-rate':
      return [
        { label: 'Investment Rating', isRating: true, getValue: (i) => (i as CapRateComparisonData).investmentRating?.grade || '-' },
        { label: 'Property Value', getValue: (i) => formatCurrency((i as CapRateComparisonData).propertyValue, i.currency) },
        { label: 'Annual NOI', getValue: (i) => formatCurrency((i as CapRateComparisonData).annualNOI, i.currency), getNumericValue: (i) => (i as CapRateComparisonData).annualNOI, higherIsBetter: true },
        { label: 'Cap Rate', getValue: (i) => `${(i as CapRateComparisonData).capRate?.toFixed(2) || 0}%`, getNumericValue: (i) => (i as CapRateComparisonData).capRate, higherIsBetter: true },
        { label: 'Monthly NOI', getValue: (i) => formatCurrency((i as CapRateComparisonData).monthlyNOI, i.currency), getNumericValue: (i) => (i as CapRateComparisonData).monthlyNOI, higherIsBetter: true },
        // Calculated: Gross Rent Multiplier (inverse approach)
        { label: 'Price/NOI Ratio', getValue: (i) => {
          const d = i as CapRateComparisonData;
          const grm = d.annualNOI > 0 ? d.propertyValue / d.annualNOI : 0;
          return `${grm.toFixed(1)}x`;
        }, getNumericValue: (i) => {
          const d = i as CapRateComparisonData;
          return d.annualNOI > 0 ? d.propertyValue / d.annualNOI : 0;
        }, higherIsBetter: false },
        // Calculated: Years to recoup investment
        { label: 'Payback (yrs)', getValue: (i) => {
          const d = i as CapRateComparisonData;
          const years = d.annualNOI > 0 ? d.propertyValue / d.annualNOI : 0;
          return `${years.toFixed(1)} yrs`;
        }, getNumericValue: (i) => {
          const d = i as CapRateComparisonData;
          return d.annualNOI > 0 ? d.propertyValue / d.annualNOI : 999;
        }, higherIsBetter: false },
        // Calculated: Daily NOI
        { label: 'Daily NOI', getValue: (i) => formatCurrency((i as CapRateComparisonData).annualNOI / 365, i.currency) },
      ];

    case 'irr':
      return [
        { label: 'Investment Rating', isRating: true, getValue: (i) => (i as IRRComparisonData).investmentRating?.grade || '-' },
        { label: 'Total Invested', getValue: (i) => formatCurrency((i as IRRComparisonData).totalInvested, i.currency) },
        { label: 'IRR', getValue: (i) => `${(i as IRRComparisonData).irr?.toFixed(2) || 0}%`, getNumericValue: (i) => (i as IRRComparisonData).irr, higherIsBetter: true },
        { label: 'NPV', getValue: (i) => formatCurrency((i as IRRComparisonData).npv, i.currency), getNumericValue: (i) => (i as IRRComparisonData).npv, higherIsBetter: true },
        // Calculated: NPV per dollar invested
        { label: 'NPV/Invested', getValue: (i) => {
          const d = i as IRRComparisonData;
          const ratio = d.totalInvested > 0 ? d.npv / d.totalInvested : 0;
          return `${(ratio * 100).toFixed(1)}%`;
        }, getNumericValue: (i) => {
          const d = i as IRRComparisonData;
          return d.totalInvested > 0 ? (d.npv / d.totalInvested) * 100 : 0;
        }, higherIsBetter: true },
        { label: 'Payback Period', getValue: (i) => `${(i as IRRComparisonData).paybackPeriod?.toFixed(1) || 0} yrs`, getNumericValue: (i) => (i as IRRComparisonData).paybackPeriod, higherIsBetter: false },
        // Calculated: Wealth created
        { label: 'Wealth Created', getValue: (i) => {
          const d = i as IRRComparisonData;
          return formatCurrency(d.npv, i.currency);
        }, getNumericValue: (i) => (i as IRRComparisonData).npv, higherIsBetter: true },
        // Calculated: Effective Annual Return
        { label: 'Annual Return', getValue: (i) => {
          const d = i as IRRComparisonData;
          return `${d.irr?.toFixed(1) || 0}%`;
        }, getNumericValue: (i) => (i as IRRComparisonData).irr, higherIsBetter: true },
      ];

    case 'npv':
      return [
        { label: 'Investment Rating', isRating: true, getValue: (i) => (i as NPVComparisonData).investmentRating?.grade || '-' },
        { label: 'Discount Rate', getValue: (i) => `${(i as NPVComparisonData).discountRate?.toFixed(1) || 0}%` },
        { label: 'NPV', getValue: (i) => formatCurrency((i as NPVComparisonData).npv, i.currency), getNumericValue: (i) => (i as NPVComparisonData).npv, higherIsBetter: true },
        { label: 'Profitability Index', getValue: (i) => `${(i as NPVComparisonData).profitabilityIndex?.toFixed(2) || 0}x`, getNumericValue: (i) => (i as NPVComparisonData).profitabilityIndex, higherIsBetter: true },
        { label: 'Total Inflows', getValue: (i) => formatCurrency((i as NPVComparisonData).totalInflows, i.currency), getNumericValue: (i) => (i as NPVComparisonData).totalInflows, higherIsBetter: true },
        { label: 'Total Outflows', getValue: (i) => formatCurrency((i as NPVComparisonData).totalOutflows, i.currency), getNumericValue: (i) => (i as NPVComparisonData).totalOutflows, higherIsBetter: false },
        // Calculated: Net Inflow
        { label: 'Net Inflow', getValue: (i) => {
          const d = i as NPVComparisonData;
          return formatCurrency(d.totalInflows - d.totalOutflows, i.currency);
        }, getNumericValue: (i) => {
          const d = i as NPVComparisonData;
          return d.totalInflows - d.totalOutflows;
        }, higherIsBetter: true },
        // Calculated: Benefit-Cost Ratio
        { label: 'Benefit-Cost', getValue: (i) => {
          const d = i as NPVComparisonData;
          const ratio = d.totalOutflows > 0 ? d.totalInflows / d.totalOutflows : 0;
          return `${ratio.toFixed(2)}x`;
        }, getNumericValue: (i) => {
          const d = i as NPVComparisonData;
          return d.totalOutflows > 0 ? d.totalInflows / d.totalOutflows : 0;
        }, higherIsBetter: true },
        // Investment Decision
        { label: 'Decision', getValue: (i) => {
          const d = i as NPVComparisonData;
          if (d.npv > 0 && d.profitabilityIndex > 1) return '✓ Accept';
          if (d.npv < 0) return '✗ Reject';
          return '⚖ Marginal';
        }},
      ];

    case 'financing':
      return [
        { label: 'Investment Rating', isRating: true, getValue: (i) => (i as FinancingComparisonData).investmentRating?.grade || '-' },
        { label: 'Property Value', getValue: (i) => formatCurrency((i as FinancingComparisonData).propertyValue, i.currency) },
        { label: 'Loans Compared', getValue: (i) => (i as FinancingComparisonData).numberOfLoans },
        { label: 'Best Loan', getValue: (i) => (i as FinancingComparisonData).bestLoanName || '-' },
        { label: 'Best Rate', getValue: (i) => `${(i as FinancingComparisonData).bestLoanRate?.toFixed(2) || 0}%`, getNumericValue: (i) => (i as FinancingComparisonData).bestLoanRate, higherIsBetter: false },
        { label: 'Total Savings', getValue: (i) => formatCurrency((i as FinancingComparisonData).totalSavings, i.currency), getNumericValue: (i) => (i as FinancingComparisonData).totalSavings, higherIsBetter: true },
        // Calculated: Savings as % of property
        { label: 'Savings %', getValue: (i) => {
          const d = i as FinancingComparisonData;
          const pct = d.propertyValue > 0 ? (d.totalSavings / d.propertyValue) * 100 : 0;
          return `${pct.toFixed(2)}%`;
        }, getNumericValue: (i) => {
          const d = i as FinancingComparisonData;
          return d.propertyValue > 0 ? (d.totalSavings / d.propertyValue) * 100 : 0;
        }, higherIsBetter: true },
        // Calculated: Monthly Savings estimate
        { label: 'Monthly Savings', getValue: (i) => {
          const d = i as FinancingComparisonData;
          // Rough estimate assuming 20yr loan
          const monthly = d.totalSavings / (20 * 12);
          return formatCurrency(monthly, i.currency);
        }, getNumericValue: (i) => (i as FinancingComparisonData).totalSavings / 240, higherIsBetter: true },
      ];

    case 'rental-projection':
      return [
        { label: 'Investment Rating', isRating: true, getValue: (i) => (i as RentalProjectionComparisonData).investmentRating?.grade || '-' },
        { label: 'Nightly Rate', getValue: (i) => formatCurrency((i as RentalProjectionComparisonData).nightlyRate, i.currency), getNumericValue: (i) => (i as RentalProjectionComparisonData).nightlyRate, higherIsBetter: true },
        { label: 'Occupancy Rate', getValue: (i) => `${(i as RentalProjectionComparisonData).occupancyRate?.toFixed(1) || 0}%`, getNumericValue: (i) => (i as RentalProjectionComparisonData).occupancyRate, higherIsBetter: true },
        // Calculated: Booked Nights per Year
        { label: 'Booked Nights/Yr', getValue: (i) => {
          const d = i as RentalProjectionComparisonData;
          return Math.round(365 * (d.occupancyRate / 100));
        }, getNumericValue: (i) => {
          const d = i as RentalProjectionComparisonData;
          return 365 * (d.occupancyRate / 100);
        }, higherIsBetter: true },
        { label: 'Annual Revenue', getValue: (i) => formatCurrency((i as RentalProjectionComparisonData).annualRevenue, i.currency), getNumericValue: (i) => (i as RentalProjectionComparisonData).annualRevenue, higherIsBetter: true },
        { label: 'Annual Net Income', getValue: (i) => formatCurrency((i as RentalProjectionComparisonData).annualNetIncome, i.currency), getNumericValue: (i) => (i as RentalProjectionComparisonData).annualNetIncome, higherIsBetter: true },
        // Calculated: Net Margin
        { label: 'Net Margin', getValue: (i) => {
          const d = i as RentalProjectionComparisonData;
          const margin = d.annualRevenue > 0 ? (d.annualNetIncome / d.annualRevenue) * 100 : 0;
          return `${margin.toFixed(1)}%`;
        }, getNumericValue: (i) => {
          const d = i as RentalProjectionComparisonData;
          return d.annualRevenue > 0 ? (d.annualNetIncome / d.annualRevenue) * 100 : 0;
        }, higherIsBetter: true },
        { label: 'Total Projected CF', getValue: (i) => formatCurrency((i as RentalProjectionComparisonData).totalProjectedCashFlow, i.currency), getNumericValue: (i) => (i as RentalProjectionComparisonData).totalProjectedCashFlow, higherIsBetter: true },
        // Calculated: Monthly Net Income
        { label: 'Monthly Net', getValue: (i) => formatCurrency((i as RentalProjectionComparisonData).annualNetIncome / 12, i.currency), getNumericValue: (i) => (i as RentalProjectionComparisonData).annualNetIncome / 12, higherIsBetter: true },
        // Calculated: Revenue per booked night
        { label: 'RevPAN', getValue: (i) => {
          const d = i as RentalProjectionComparisonData;
          const nights = 365 * (d.occupancyRate / 100);
          return nights > 0 ? formatCurrency(d.annualRevenue / nights, i.currency) : '-';
        }, getNumericValue: (i) => {
          const d = i as RentalProjectionComparisonData;
          const nights = 365 * (d.occupancyRate / 100);
          return nights > 0 ? d.annualRevenue / nights : 0;
        }, higherIsBetter: true },
      ];

    case 'indonesia-tax':
      return [
        { label: 'Investment Rating', isRating: true, getValue: (i) => (i as IndonesiaTaxComparisonData).investmentRating?.grade || '-' },
        { label: 'Purchase Price', getValue: (i) => formatCurrency((i as IndonesiaTaxComparisonData).purchasePrice, i.currency) },
        { label: 'Projected Sale', getValue: (i) => formatCurrency((i as IndonesiaTaxComparisonData).projectedSalePrice, i.currency) },
        // Calculated: Gross Gain
        { label: 'Gross Gain', getValue: (i) => {
          const d = i as IndonesiaTaxComparisonData;
          return formatCurrency(d.projectedSalePrice - d.purchasePrice, i.currency);
        }, getNumericValue: (i) => {
          const d = i as IndonesiaTaxComparisonData;
          return d.projectedSalePrice - d.purchasePrice;
        }, higherIsBetter: true },
        { label: 'Structure', getValue: (i) => (i as IndonesiaTaxComparisonData).ownershipStructure || '-' },
        { label: 'Tax Liability', getValue: (i) => formatCurrency((i as IndonesiaTaxComparisonData).totalTaxLiability, i.currency), getNumericValue: (i) => (i as IndonesiaTaxComparisonData).totalTaxLiability, higherIsBetter: false },
        { label: 'Effective Tax', getValue: (i) => `${(i as IndonesiaTaxComparisonData).effectiveTaxRate?.toFixed(1) || 0}%`, getNumericValue: (i) => (i as IndonesiaTaxComparisonData).effectiveTaxRate, higherIsBetter: false },
        { label: 'Net Profit', getValue: (i) => formatCurrency((i as IndonesiaTaxComparisonData).netProfit, i.currency), getNumericValue: (i) => (i as IndonesiaTaxComparisonData).netProfit, higherIsBetter: true },
        // Calculated: After-Tax ROI
        { label: 'After-Tax ROI', getValue: (i) => {
          const d = i as IndonesiaTaxComparisonData;
          const roi = d.purchasePrice > 0 ? (d.netProfit / d.purchasePrice) * 100 : 0;
          return `${roi.toFixed(1)}%`;
        }, getNumericValue: (i) => {
          const d = i as IndonesiaTaxComparisonData;
          return d.purchasePrice > 0 ? (d.netProfit / d.purchasePrice) * 100 : 0;
        }, higherIsBetter: true },
        { label: 'Optimal Structure', getValue: (i) => (i as IndonesiaTaxComparisonData).optimalStructure || '-' },
        // Calculated: Tax Efficiency
        { label: 'Tax Efficiency', getValue: (i) => {
          const d = i as IndonesiaTaxComparisonData;
          const gross = d.projectedSalePrice - d.purchasePrice;
          const efficiency = gross > 0 ? ((gross - d.totalTaxLiability) / gross) * 100 : 0;
          return `${efficiency.toFixed(1)}%`;
        }, getNumericValue: (i) => {
          const d = i as IndonesiaTaxComparisonData;
          const gross = d.projectedSalePrice - d.purchasePrice;
          return gross > 0 ? ((gross - d.totalTaxLiability) / gross) * 100 : 0;
        }, higherIsBetter: true },
      ];

    case 'dev-budget':
      return [
        { label: 'Investment Rating', isRating: true, getValue: (i) => (i as DevBudgetComparisonData).investmentRating?.grade || '-' },
        { label: 'Total Budget', getValue: (i) => formatCurrency((i as DevBudgetComparisonData).totalBudget, i.currency) },
        { label: 'Total Actual', getValue: (i) => formatCurrency((i as DevBudgetComparisonData).totalActual, i.currency) },
        { label: 'Variance', getValue: (i) => formatCurrency((i as DevBudgetComparisonData).variance, i.currency), getNumericValue: (i) => (i as DevBudgetComparisonData).variance, higherIsBetter: false },
        { label: 'Variance %', getValue: (i) => `${(i as DevBudgetComparisonData).variancePercent?.toFixed(1) || 0}%`, getNumericValue: (i) => Math.abs((i as DevBudgetComparisonData).variancePercent), higherIsBetter: false },
        // Calculated: Budget Status
        { label: 'Status', getValue: (i) => {
          const d = i as DevBudgetComparisonData;
          if (d.variancePercent <= 0) return '✓ Under';
          if (d.variancePercent <= 5) return '⚖ On Track';
          if (d.variancePercent <= 10) return '⚠ Over';
          return '✗ Critical';
        }},
        { label: 'Health Score', getValue: (i) => `${(i as DevBudgetComparisonData).healthScore?.toFixed(0) || 0}/100`, getNumericValue: (i) => (i as DevBudgetComparisonData).healthScore, higherIsBetter: true },
        { label: 'Contingency Used', getValue: (i) => `${(i as DevBudgetComparisonData).contingencyUsedPercent?.toFixed(0) || 0}%`, getNumericValue: (i) => (i as DevBudgetComparisonData).contingencyUsedPercent, higherIsBetter: false },
        // Calculated: Remaining Budget
        { label: 'Remaining', getValue: (i) => {
          const d = i as DevBudgetComparisonData;
          return formatCurrency(d.totalBudget - d.totalActual, i.currency);
        }, getNumericValue: (i) => {
          const d = i as DevBudgetComparisonData;
          return d.totalBudget - d.totalActual;
        }, higherIsBetter: true },
        // Calculated: Budget Efficiency
        { label: 'Efficiency', getValue: (i) => {
          const d = i as DevBudgetComparisonData;
          const eff = d.totalBudget > 0 ? (d.totalActual / d.totalBudget) * 100 : 0;
          return `${eff.toFixed(1)}%`;
        }, getNumericValue: (i) => {
          const d = i as DevBudgetComparisonData;
          return d.totalBudget > 0 ? 100 - ((d.totalActual / d.totalBudget) * 100 - 100) : 0;
        }, higherIsBetter: true },
      ];

    case 'risk-assessment':
      return [
        { label: 'Investment Rating', isRating: true, getValue: (i) => (i as RiskAssessmentComparisonData).investmentRating?.grade || '-' },
        { label: 'Investment', getValue: (i) => formatCurrency((i as RiskAssessmentComparisonData).investmentAmount, i.currency) },
        { label: 'Project ROI', getValue: (i) => `${(i as RiskAssessmentComparisonData).projectROI?.toFixed(1) || 0}%`, getNumericValue: (i) => (i as RiskAssessmentComparisonData).projectROI, higherIsBetter: true },
        { label: 'Property Type', getValue: (i) => (i as RiskAssessmentComparisonData).propertyType || '-' },
        { label: 'Overall Risk', getValue: (i) => `${(i as RiskAssessmentComparisonData).overallRiskScore}/100`, getNumericValue: (i) => (i as RiskAssessmentComparisonData).overallRiskScore, higherIsBetter: false },
        // Calculated: Risk Category
        { label: 'Risk Level', getValue: (i) => {
          const d = i as RiskAssessmentComparisonData;
          if (d.overallRiskScore <= 30) return '🟢 Low';
          if (d.overallRiskScore <= 50) return '🟡 Medium';
          if (d.overallRiskScore <= 70) return '🟠 High';
          return '🔴 Critical';
        }},
        { label: 'Financial Risk', getValue: (i) => `${(i as RiskAssessmentComparisonData).financialRiskScore}%`, getNumericValue: (i) => (i as RiskAssessmentComparisonData).financialRiskScore, higherIsBetter: false },
        { label: 'Market Risk', getValue: (i) => `${(i as RiskAssessmentComparisonData).marketRiskScore}%`, getNumericValue: (i) => (i as RiskAssessmentComparisonData).marketRiskScore, higherIsBetter: false },
        { label: 'Regulatory Risk', getValue: (i) => `${(i as RiskAssessmentComparisonData).regulatoryRiskScore}%`, getNumericValue: (i) => (i as RiskAssessmentComparisonData).regulatoryRiskScore, higherIsBetter: false },
        { label: 'Property Risk', getValue: (i) => `${(i as RiskAssessmentComparisonData).propertyRiskScore}%`, getNumericValue: (i) => (i as RiskAssessmentComparisonData).propertyRiskScore, higherIsBetter: false },
        // Calculated: Risk-Adjusted Return
        { label: 'Risk-Adj Return', getValue: (i) => {
          const d = i as RiskAssessmentComparisonData;
          const riskFactor = 1 - (d.overallRiskScore / 100);
          const adjusted = d.projectROI * riskFactor;
          return `${adjusted.toFixed(1)}%`;
        }, getNumericValue: (i) => {
          const d = i as RiskAssessmentComparisonData;
          const riskFactor = 1 - (d.overallRiskScore / 100);
          return d.projectROI * riskFactor;
        }, higherIsBetter: true },
        // Calculated: Return per Risk Point
        { label: 'Return/Risk', getValue: (i) => {
          const d = i as RiskAssessmentComparisonData;
          const ratio = d.overallRiskScore > 0 ? d.projectROI / d.overallRiskScore : 0;
          return `${ratio.toFixed(2)}`;
        }, getNumericValue: (i) => {
          const d = i as RiskAssessmentComparisonData;
          return d.overallRiskScore > 0 ? d.projectROI / d.overallRiskScore : 0;
        }, higherIsBetter: true },
      ];

    default:
      return [];
  }
};

export function ComparisonView({ isOpen, onClose, calculatorType }: Props) {
  const { getComparisons, removeComparison, updateLabel, clearAll } = useComparison();
  const [editingLabel, setEditingLabel] = useState<number | null>(null);
  const [labelValue, setLabelValue] = useState('');

  if (!isOpen) return null;

  const data = getComparisons(calculatorType);
  const metricsConfig = getMetricsConfig(calculatorType);

  const handleEditLabel = (timestamp: number, currentLabel: string) => {
    setEditingLabel(timestamp);
    setLabelValue(currentLabel);
  };

  const handleSaveLabel = (timestamp: number) => {
    updateLabel(calculatorType, timestamp, labelValue);
    setEditingLabel(null);
  };

  const renderComparison = () => {
    if (data.length === 0) {
      return (
        <div className="text-center py-16 text-zinc-500">
          <svg className="w-16 h-16 mx-auto mb-4 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="font-semibold mb-2 text-zinc-300">No calculations saved yet</p>
          <p className="text-sm">Use "Save to Compare" on your calculations to add them here</p>
        </div>
      );
    }

    // Calculate best/worst for metrics that have numeric values
    const bestWorstMap = new Map<number, { best: number; worst: number }>();
    metricsConfig.forEach((metric, idx) => {
      if (metric.getNumericValue) {
        const values = data.map(item => metric.getNumericValue!(item));
        bestWorstMap.set(idx, getBestWorst(values, metric.higherIsBetter ?? true));
      }
    });

    return (
      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead>
            <tr className="border-b-2 border-zinc-700">
              <th className="text-left py-3 px-4 font-bold text-zinc-400 uppercase text-xs tracking-wider w-48">Metric</th>
              {data.map((item) => (
                <th key={item.timestamp} className="text-center py-3 px-4 min-w-[150px]">
                  <div className="flex flex-col items-center gap-1">
                    {editingLabel === item.timestamp ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="text"
                          value={labelValue}
                          onChange={(e) => setLabelValue(e.target.value)}
                          className="w-24 px-2 py-1 text-xs border border-zinc-600 rounded bg-zinc-800 text-white"
                          autoFocus
                          onKeyDown={(e) => e.key === 'Enter' && handleSaveLabel(item.timestamp)}
                        />
                        <button
                          onClick={() => handleSaveLabel(item.timestamp)}
                          className="text-emerald-400 hover:text-emerald-300"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleEditLabel(item.timestamp, item.label)}
                        className="font-bold text-white hover:text-emerald-400 transition-colors"
                      >
                        {item.label}
                      </button>
                    )}
                    <span className="text-[10px] text-zinc-500">{formatDate(item.timestamp)}</span>
                    <button
                      onClick={() => removeComparison(calculatorType, item.timestamp)}
                      className="text-red-400 hover:text-red-300 transition-colors mt-1"
                      title="Remove"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {metricsConfig.map((metric, metricIdx) => {
              const bw = bestWorstMap.get(metricIdx);
              return (
                <tr key={metricIdx} className="hover:bg-zinc-800/50 transition-colors">
                  <td className="py-3 px-4 font-medium text-zinc-400 text-sm">{metric.label}</td>
                  {data.map((item, itemIdx) => {
                    const value = metric.getValue(item);
                    const numValue = metric.getNumericValue?.(item);

                    if (metric.isRating && typeof value === 'string') {
                      return (
                        <td key={itemIdx} className="py-3 px-4 text-center text-sm">
                          <span className={`px-3 py-1 rounded-full text-sm font-bold ${getRatingColor(value)}`}>
                            {value}
                          </span>
                        </td>
                      );
                    }

                    const valueClass = bw && numValue !== undefined
                      ? getValueClass(numValue, bw.best, bw.worst)
                      : '';

                    return (
                      <td key={itemIdx} className={`py-3 px-4 text-center text-sm text-white ${valueClass}`}>
                        {value}
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
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-zinc-900 rounded-2xl border border-zinc-800 shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
          <div>
            <h2 className="text-xl font-bold text-white">
              Compare {calculatorDisplayNames[calculatorType]} Calculations
            </h2>
            <p className="text-sm text-zinc-500 mt-0.5">
              {data.length} of {MAX_COMPARISONS} slots used
            </p>
          </div>
          <div className="flex items-center gap-3">
            {data.length > 0 && (
              <button
                onClick={() => clearAll(calculatorType)}
                className="text-sm text-red-400 hover:text-red-300 font-medium transition-colors"
              >
                Clear All
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6 bg-zinc-900">
          {renderComparison()}
        </div>

        {/* Legend */}
        {data.length > 1 && (
          <div className="px-6 py-3 border-t border-zinc-800 bg-zinc-800/50 flex items-center gap-6 text-xs">
            <span className="text-zinc-500 font-medium">Legend:</span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
              <span className="text-zinc-400">Best value</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-red-400"></span>
              <span className="text-zinc-400">Worst value</span>
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
