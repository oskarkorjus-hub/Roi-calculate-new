import { useState, useMemo } from 'react';
import type { PortfolioProject } from '../types/portfolio';
import { generateProjectPDF } from '../utils/pdfExport';
import { generateEnterpriseReport, generatePitchDeck } from '../utils/enterprisePdfGenerator';
import { getScoreColor, recalculateProjectScore } from '../utils/investmentScoring';

interface ProjectDetailsModalProps {
  project: PortfolioProject;
  onClose: () => void;
  onDelete: (projectId: string) => void;
}

// Calculator category types
type CalculatorCategory = 'investment' | 'financing' | 'budget' | 'tax' | 'risk' | 'npv';

interface MetricConfig {
  label: string;
  getValue: (project: PortfolioProject) => string | number;
  getColor?: (project: PortfolioProject) => string;
}

interface CategoryConfig {
  category: CalculatorCategory;
  showScore: boolean;
  showScoreBreakdown: boolean;
  accentColor: string;
  metrics: MetricConfig[];
}

// Get calculator category
const getCalculatorCategory = (calculatorId: string): CalculatorCategory => {
  switch (calculatorId) {
    case 'mortgage':
    case 'financing':
      return 'financing';
    case 'dev-budget':
      return 'budget';
    case 'indonesia-tax':
      return 'tax';
    case 'risk-assessment':
      return 'risk';
    case 'npv':
      return 'npv';
    default:
      return 'investment';
  }
};

// Format currency helper
const formatCurrency = (value: number | undefined, short = true) => {
  if (!value || value === 0) return '$0';
  if (short) {
    if (Math.abs(value) >= 1_000_000) return '$' + (value / 1_000_000).toFixed(1) + 'M';
    if (Math.abs(value) >= 1_000) return '$' + (value / 1_000).toFixed(0) + 'K';
  }
  return '$' + value.toLocaleString();
};

// Get friendly calculator name
const getCalculatorDisplayName = (calculatorId: string): string => {
  const names: Record<string, string> = {
    'rental-roi': 'Rental ROI',
    'xirr': 'XIRR',
    'mortgage': 'Mortgage',
    'cashflow': 'Cash Flow',
    'dev-feasibility': 'Dev Feasibility',
    'cap-rate': 'Cap Rate',
    'irr': 'IRR',
    'npv': 'NPV',
    'indonesia-tax': 'Tax Optimizer',
    'rental-projection': 'Rental Projection',
    'financing': 'Financing',
    'dev-budget': 'Budget Tracker',
    'risk-assessment': 'Risk Assessment',
  };
  return names[calculatorId] || calculatorId?.replace('-', ' ') || 'Calculator';
};

// Calculator-specific metric configurations
const getCategoryConfig = (calculatorId: string): CategoryConfig => {
  // First check for specific calculator configs
  switch (calculatorId) {
    // ===== RENTAL PROJECTION =====
    case 'rental-projection':
      return {
        category: 'investment',
        showScore: true,
        showScoreBreakdown: true,
        accentColor: '#10b981',
        metrics: [
          {
            label: 'Nightly Rate',
            getValue: (p) => formatCurrency(p.data?.nightlyRate || p.data?.result?.averageNightlyRate || 0),
          },
          {
            label: 'Occupancy Rate',
            getValue: (p) => `${(p.data?.baseOccupancyRate || p.data?.result?.averageOccupancy || 0).toFixed(0)}%`,
            getColor: (p) => (p.data?.baseOccupancyRate || p.data?.result?.averageOccupancy || 0) >= 70 ? 'text-emerald-400' : 'text-yellow-400',
          },
          {
            label: 'Annual Revenue',
            getValue: (p) => formatCurrency(p.data?.result?.annualRevenue || 0),
            getColor: () => 'text-emerald-400',
          },
          {
            label: 'Annual Net Income',
            getValue: (p) => formatCurrency(p.data?.result?.annualNetIncome || p.avgCashFlow || 0),
            getColor: (p) => (p.data?.result?.annualNetIncome || p.avgCashFlow || 0) > 0 ? 'text-emerald-400' : 'text-red-400',
          },
          {
            label: 'Break-Even',
            getValue: (p) => `${p.data?.result?.breakEvenMonths || p.breakEvenMonths || 0} months`,
            getColor: (p) => (p.data?.result?.breakEvenMonths || p.breakEvenMonths || 0) <= 36 ? 'text-emerald-400' : 'text-orange-400',
          },
          {
            label: 'Platform Fee',
            getValue: (p) => `${(p.data?.platformFeePercent || 0).toFixed(0)}%`,
          },
        ],
      };

    // ===== RENTAL ROI =====
    case 'rental-roi':
      return {
        category: 'investment',
        showScore: true,
        showScoreBreakdown: true,
        accentColor: '#10b981',
        metrics: [
          {
            label: 'Initial Investment',
            getValue: (p) => formatCurrency(p.data?.initialInvestment || p.totalInvestment || 0),
          },
          {
            label: 'ADR (Y1)',
            getValue: (p) => formatCurrency(p.data?.y1ADR || 0),
          },
          {
            label: 'Occupancy (Y1)',
            getValue: (p) => `${(p.data?.y1Occupancy || 0).toFixed(0)}%`,
            getColor: (p) => (p.data?.y1Occupancy || 0) >= 70 ? 'text-emerald-400' : 'text-yellow-400',
          },
          {
            label: 'ROI After Mgmt',
            getValue: (p) => `${(p.data?.averages?.roiAfterManagement || p.roi || 0).toFixed(1)}%`,
            getColor: (p) => (p.data?.averages?.roiAfterManagement || p.roi || 0) >= 10 ? 'text-emerald-400' : 'text-orange-400',
          },
          {
            label: 'Annual Profit',
            getValue: (p) => formatCurrency(p.data?.averages?.takeHomeProfit || p.avgCashFlow || 0),
            getColor: () => 'text-emerald-400',
          },
          {
            label: 'GOP Margin',
            getValue: (p) => `${(p.data?.averages?.gopMargin || 0).toFixed(1)}%`,
          },
        ],
      };

    // ===== XIRR =====
    case 'xirr':
      return {
        category: 'investment',
        showScore: true,
        showScoreBreakdown: true,
        accentColor: '#8b5cf6', // violet
        metrics: [
          {
            label: 'Total Investment',
            getValue: (p) => formatCurrency(p.data?.result?.totalInvested || p.data?.property?.totalPrice || p.totalInvestment || 0),
          },
          {
            label: 'XIRR',
            getValue: (p) => `${((p.data?.result?.rate || 0) * 100).toFixed(1)}%`,
            getColor: (p) => ((p.data?.result?.rate || 0) * 100) >= 12 ? 'text-emerald-400' : ((p.data?.result?.rate || 0) * 100) >= 8 ? 'text-yellow-400' : 'text-orange-400',
          },
          {
            label: 'Net Profit',
            getValue: (p) => formatCurrency(p.data?.result?.netProfit || 0),
            getColor: (p) => (p.data?.result?.netProfit || 0) > 0 ? 'text-emerald-400' : 'text-red-400',
          },
          {
            label: 'Exit Price',
            getValue: (p) => formatCurrency(p.data?.exit?.exitPrice || p.data?.result?.exitValue || 0),
          },
          {
            label: 'Hold Period',
            getValue: (p) => `${p.data?.result?.holdPeriodMonths || p.data?.exit?.holdPeriodYears * 12 || 0} months`,
          },
          {
            label: 'Total Return',
            getValue: (p) => formatCurrency(p.data?.result?.totalReturn || 0),
            getColor: () => 'text-emerald-400',
          },
        ],
      };

    // ===== CAP RATE =====
    case 'cap-rate':
      return {
        category: 'investment',
        showScore: true,
        showScoreBreakdown: true,
        accentColor: '#06b6d4', // cyan
        metrics: [
          {
            label: 'Property Value',
            getValue: (p) => formatCurrency(p.data?.propertyValue || p.totalInvestment || 0),
          },
          {
            label: 'Cap Rate',
            getValue: (p) => `${(p.data?.result?.capRate || p.data?.result?.adjustedCapRate || p.roi || 0).toFixed(2)}%`,
            getColor: (p) => (p.data?.result?.capRate || p.roi || 0) >= 6 ? 'text-emerald-400' : 'text-orange-400',
          },
          {
            label: 'Yearly NOI',
            getValue: (p) => formatCurrency(p.data?.result?.yearlyNOI || 0),
            getColor: () => 'text-emerald-400',
          },
          {
            label: 'Monthly NOI',
            getValue: (p) => formatCurrency(p.data?.result?.monthlyNOI || p.data?.result?.adjustedMonthlyNOI || 0),
          },
          {
            label: 'Gross Revenue',
            getValue: (p) => formatCurrency(p.data?.monthlyRent * 12 || p.data?.result?.grossRevenue || 0),
          },
          {
            label: 'Expense Ratio',
            getValue: (p) => `${(p.data?.result?.expenseRatio || 0).toFixed(1)}%`,
          },
        ],
      };

    // ===== IRR =====
    case 'irr':
      return {
        category: 'investment',
        showScore: true,
        showScoreBreakdown: true,
        accentColor: '#f59e0b', // amber
        metrics: [
          {
            label: 'Total Investment',
            getValue: (p) => formatCurrency(p.data?.result?.totalInvested || p.totalInvestment || 0),
          },
          {
            label: 'IRR',
            getValue: (p) => `${(p.data?.result?.irr || p.roi || 0).toFixed(1)}%`,
            getColor: (p) => (p.data?.result?.irr || p.roi || 0) >= 15 ? 'text-emerald-400' : (p.data?.result?.irr || p.roi || 0) >= 10 ? 'text-yellow-400' : 'text-orange-400',
          },
          {
            label: 'Total Cash Flow',
            getValue: (p) => formatCurrency(p.data?.result?.totalCashFlow || 0),
            getColor: (p) => (p.data?.result?.totalCashFlow || 0) > 0 ? 'text-emerald-400' : 'text-red-400',
          },
          {
            label: 'Payback Period',
            getValue: (p) => `${(p.data?.result?.paybackPeriod || 0).toFixed(1)} years`,
          },
          {
            label: 'Total Return',
            getValue: (p) => formatCurrency(p.data?.result?.totalReturn || 0),
          },
          {
            label: 'ROI Multiple',
            getValue: (p) => `${(p.data?.result?.roiMultiple || 0).toFixed(2)}x`,
            getColor: (p) => (p.data?.result?.roiMultiple || 0) >= 1.5 ? 'text-emerald-400' : 'text-yellow-400',
          },
        ],
      };

    // ===== DEV FEASIBILITY =====
    case 'dev-feasibility':
      return {
        category: 'investment',
        showScore: true,
        showScoreBreakdown: true,
        accentColor: '#ec4899', // pink
        metrics: [
          {
            label: 'Total Project Cost',
            getValue: (p) => formatCurrency(p.data?.scenarios?.[0]?.totalProjectCost || p.data?.totalProjectCost || p.totalInvestment || 0),
          },
          {
            label: 'ROI (Flip)',
            getValue: (p) => `${(p.data?.scenarios?.[0]?.roiFlip || p.roi || 0).toFixed(1)}%`,
            getColor: (p) => (p.data?.scenarios?.[0]?.roiFlip || p.roi || 0) >= 20 ? 'text-emerald-400' : 'text-orange-400',
          },
          {
            label: 'Gross Profit',
            getValue: (p) => formatCurrency(p.data?.scenarios?.[0]?.grossProfit || 0),
            getColor: (p) => (p.data?.scenarios?.[0]?.grossProfit || 0) > 0 ? 'text-emerald-400' : 'text-red-400',
          },
          {
            label: 'Sale Price',
            getValue: (p) => formatCurrency(p.data?.scenarios?.[0]?.projectedSalePrice || p.data?.salePrice || 0),
          },
          {
            label: 'Profit Margin',
            getValue: (p) => `${(p.data?.scenarios?.[0]?.profitMargin || 0).toFixed(1)}%`,
          },
          {
            label: 'Land Cost',
            getValue: (p) => formatCurrency(p.data?.landCost || p.data?.scenarios?.[0]?.landCost || 0),
          },
        ],
      };

    // ===== CASHFLOW =====
    case 'cashflow':
      return {
        category: 'investment',
        showScore: true,
        showScoreBreakdown: true,
        accentColor: '#22c55e', // green
        metrics: [
          {
            label: 'Monthly Rental',
            getValue: (p) => formatCurrency(p.data?.monthlyRentalIncome || 0),
          },
          {
            label: 'Monthly Mortgage',
            getValue: (p) => formatCurrency(p.data?.monthlyMortgage || 0),
            getColor: () => 'text-orange-400',
          },
          {
            label: 'Net Monthly',
            getValue: (p) => {
              const income = p.data?.monthlyRentalIncome || 0;
              const expenses = (p.data?.monthlyMortgage || 0) + (p.data?.monthlyMaintenance || 0) + (p.data?.monthlyPropertyTax || 0) + (p.data?.monthlyInsurance || 0);
              return formatCurrency(income - expenses);
            },
            getColor: (p) => {
              const income = p.data?.monthlyRentalIncome || 0;
              const expenses = (p.data?.monthlyMortgage || 0) + (p.data?.monthlyMaintenance || 0) + (p.data?.monthlyPropertyTax || 0) + (p.data?.monthlyInsurance || 0);
              return (income - expenses) > 0 ? 'text-emerald-400' : 'text-red-400';
            },
          },
          {
            label: 'Annual Cash Flow',
            getValue: (p) => formatCurrency(p.avgCashFlow * 12 || 0),
            getColor: (p) => (p.avgCashFlow || 0) > 0 ? 'text-emerald-400' : 'text-red-400',
          },
          {
            label: 'Maintenance',
            getValue: (p) => formatCurrency(p.data?.monthlyMaintenance || 0),
          },
          {
            label: 'Cash on Cash',
            getValue: (p) => `${(p.roi || 0).toFixed(1)}%`,
            getColor: (p) => (p.roi || 0) >= 8 ? 'text-emerald-400' : 'text-orange-400',
          },
        ],
      };

    // ===== MORTGAGE =====
    case 'mortgage':
      return {
        category: 'financing',
        showScore: false,
        showScoreBreakdown: false,
        accentColor: '#3b82f6',
        metrics: [
          {
            label: 'Loan Amount',
            getValue: (p) => formatCurrency(p.data?.loanAmount || p.totalInvestment),
          },
          {
            label: 'Monthly Payment',
            getValue: (p) => formatCurrency(p.data?.result?.monthlyPayment || 0),
          },
          {
            label: 'Interest Rate',
            getValue: (p) => `${(p.data?.interestRate || 0).toFixed(2)}%`,
            getColor: (p) => (p.data?.interestRate || 0) <= 5 ? 'text-emerald-400' : (p.data?.interestRate || 0) <= 8 ? 'text-yellow-400' : 'text-orange-400',
          },
          {
            label: 'Total Interest',
            getValue: (p) => formatCurrency(p.data?.result?.totalInterest || 0),
            getColor: () => 'text-orange-400',
          },
          {
            label: 'Loan Term',
            getValue: (p) => `${p.data?.loanTermYears || p.data?.loanTerm || 0} years`,
          },
          {
            label: 'Total Payment',
            getValue: (p) => formatCurrency(p.data?.result?.totalPayment || (p.data?.loanAmount || 0) + (p.data?.result?.totalInterest || 0)),
          },
        ],
      };

    // ===== FINANCING =====
    case 'financing':
      return {
        category: 'financing',
        showScore: false,
        showScoreBreakdown: false,
        accentColor: '#3b82f6',
        metrics: [
          {
            label: 'Loan Amount',
            getValue: (p) => formatCurrency(p.data?.loanAmount || p.totalInvestment),
          },
          {
            label: 'Monthly Payment',
            getValue: (p) => formatCurrency(p.data?.results?.[0]?.monthlyPayment || p.data?.result?.monthlyPayment || 0),
          },
          {
            label: 'Interest Rate',
            getValue: (p) => `${(p.data?.results?.[0]?.interestRate || p.data?.interestRate || 0).toFixed(2)}%`,
            getColor: (p) => (p.data?.results?.[0]?.interestRate || p.data?.interestRate || 0) <= 5 ? 'text-emerald-400' : 'text-yellow-400',
          },
          {
            label: 'Total Interest',
            getValue: (p) => formatCurrency(p.data?.results?.[0]?.totalInterest || p.data?.result?.totalInterest || 0),
            getColor: () => 'text-orange-400',
          },
          {
            label: 'Loan Term',
            getValue: (p) => `${p.data?.loanTermYears || 0} years`,
          },
          {
            label: 'Options Compared',
            getValue: (p) => `${p.data?.results?.length || 1} loans`,
          },
        ],
      };

    // ===== DEV BUDGET =====
    case 'dev-budget':
      return {
        category: 'budget',
        showScore: false,
        showScoreBreakdown: false,
        accentColor: '#eab308',
        metrics: [
          {
            label: 'Total Budget',
            getValue: (p) => formatCurrency(p.data?.calculations?.totalBudgeted || p.totalInvestment),
          },
          {
            label: 'Spent to Date',
            getValue: (p) => formatCurrency(p.data?.calculations?.totalActual || 0),
          },
          {
            label: 'Remaining',
            getValue: (p) => formatCurrency((p.data?.calculations?.totalBudgeted || 0) - (p.data?.calculations?.totalActual || 0)),
            getColor: (p) => ((p.data?.calculations?.totalBudgeted || 0) - (p.data?.calculations?.totalActual || 0)) >= 0 ? 'text-emerald-400' : 'text-red-400',
          },
          {
            label: 'Variance',
            getValue: (p) => {
              const variance = p.data?.calculations?.variancePercent || 0;
              return `${variance > 0 ? '+' : ''}${variance.toFixed(1)}%`;
            },
            getColor: (p) => (p.data?.calculations?.variancePercent || 0) > 0 ? 'text-red-400' : 'text-emerald-400',
          },
          {
            label: 'Project Health',
            getValue: (p) => `${(p.data?.calculations?.healthScore || 0).toFixed(0)}%`,
            getColor: (p) => {
              const score = p.data?.calculations?.healthScore || 0;
              return score >= 80 ? 'text-emerald-400' : score >= 60 ? 'text-yellow-400' : 'text-red-400';
            },
          },
          {
            label: 'Progress',
            getValue: (p) => `${(p.data?.calculations?.overallCompletion || 0).toFixed(0)}%`,
          },
        ],
      };

    // ===== INDONESIA TAX =====
    case 'indonesia-tax':
      return {
        category: 'tax',
        showScore: false,
        showScoreBreakdown: false,
        accentColor: '#f97316',
        metrics: [
          {
            label: 'Property Value',
            getValue: (p) => formatCurrency(p.data?.purchasePrice || p.totalInvestment),
          },
          {
            label: 'Total Tax',
            getValue: (p) => formatCurrency(p.data?.result?.totalTaxLiability || 0),
            getColor: () => 'text-orange-400',
          },
          {
            label: 'Effective Rate',
            getValue: (p) => `${(p.data?.result?.effectiveTaxRate || 0).toFixed(1)}%`,
          },
          {
            label: 'Capital Gains Tax',
            getValue: (p) => formatCurrency(p.data?.result?.capitalGainsTax || 0),
            getColor: () => 'text-orange-400',
          },
          {
            label: 'Net Proceeds',
            getValue: (p) => formatCurrency(p.data?.result?.netProceeds || 0),
            getColor: (p) => (p.data?.result?.netProceeds || 0) >= 0 ? 'text-emerald-400' : 'text-red-400',
          },
          {
            label: 'Net Profit',
            getValue: (p) => formatCurrency(p.data?.result?.netProfit || 0),
            getColor: (p) => (p.data?.result?.netProfit || 0) >= 0 ? 'text-emerald-400' : 'text-red-400',
          },
        ],
      };

    // ===== RISK ASSESSMENT =====
    case 'risk-assessment':
      return {
        category: 'risk',
        showScore: false,
        showScoreBreakdown: false,
        accentColor: '#f43f5e',
        metrics: [
          {
            label: 'Investment Amount',
            getValue: (p) => formatCurrency(p.data?.propertyValue || p.data?.investmentAmount || p.totalInvestment),
          },
          {
            label: 'Risk Score',
            getValue: (p) => `${p.data?.result?.riskScore || p.investmentScore || 0}/100`,
            getColor: (p) => {
              const score = p.data?.result?.riskScore || p.investmentScore || 0;
              return score >= 70 ? 'text-emerald-400' : score >= 50 ? 'text-yellow-400' : 'text-red-400';
            },
          },
          {
            label: 'Risk Level',
            getValue: (p) => p.data?.result?.riskLevel || 'Unknown',
            getColor: (p) => {
              const level = p.data?.result?.riskLevel?.toLowerCase() || '';
              if (level.includes('low') || level.includes('excellent')) return 'text-emerald-400';
              if (level.includes('medium') || level.includes('moderate')) return 'text-yellow-400';
              return 'text-red-400';
            },
          },
          {
            label: 'Expected Return',
            getValue: (p) => `${(p.data?.expectedReturn || p.roi || 0).toFixed(1)}%`,
            getColor: (p) => (p.data?.expectedReturn || p.roi || 0) >= 15 ? 'text-emerald-400' : 'text-yellow-400',
          },
          {
            label: 'Risk Tolerance',
            getValue: (p) => p.data?.riskTolerance || 'N/A',
          },
          {
            label: 'Status',
            getValue: (p) => (p.status || 'Active').charAt(0).toUpperCase() + (p.status || 'active').slice(1),
          },
        ],
      };

    // ===== NPV =====
    case 'npv':
      return {
        category: 'npv',
        showScore: true,
        showScoreBreakdown: false,
        accentColor: '#14b8a6',
        metrics: [
          {
            label: 'Initial Investment',
            getValue: (p) => formatCurrency(p.data?.result?.totalCashOutflows || p.totalInvestment),
          },
          {
            label: 'Net Present Value',
            getValue: (p) => formatCurrency(p.data?.result?.npv || 0),
            getColor: (p) => (p.data?.result?.npv || 0) >= 0 ? 'text-emerald-400' : 'text-red-400',
          },
          {
            label: 'Discount Rate',
            getValue: (p) => `${(p.data?.discountRate || 0).toFixed(1)}%`,
          },
          {
            label: 'Profitability Index',
            getValue: (p) => `${(p.data?.result?.profitabilityIndex || 0).toFixed(2)}x`,
            getColor: (p) => (p.data?.result?.profitabilityIndex || 0) >= 1 ? 'text-emerald-400' : 'text-red-400',
          },
          {
            label: 'Project Length',
            getValue: (p) => `${p.data?.projectLength || 0} years`,
          },
          {
            label: 'Status',
            getValue: (p) => (p.status || 'Active').charAt(0).toUpperCase() + (p.status || 'active').slice(1),
          },
        ],
      };

    // ===== DEFAULT FALLBACK =====
    default:
      return {
        category: 'investment',
        showScore: true,
        showScoreBreakdown: true,
        accentColor: '#10b981',
        metrics: [
          {
            label: 'Total Investment',
            getValue: (p) => formatCurrency(p.totalInvestment),
          },
          {
            label: 'ROI',
            getValue: (p) => `${(p.roi || 0).toFixed(1)}%`,
            getColor: (p) => (p.roi || 0) >= 15 ? 'text-emerald-400' : (p.roi || 0) >= 8 ? 'text-yellow-400' : 'text-orange-400',
          },
          {
            label: 'Annual Cash Flow',
            getValue: (p) => formatCurrency(p.avgCashFlow),
          },
          {
            label: 'Break-Even',
            getValue: (p) => `${p.breakEvenMonths || 0} months`,
            getColor: (p) => (p.breakEvenMonths || 0) <= 24 ? 'text-emerald-400' : 'text-orange-400',
          },
          {
            label: 'Investment Score',
            getValue: (p) => `${Math.round(p.investmentScore || 0)}/100`,
            getColor: (p) => {
              const score = p.investmentScore || 0;
              return score >= 70 ? 'text-emerald-400' : score >= 50 ? 'text-yellow-400' : 'text-orange-400';
            },
          },
          {
            label: 'Status',
            getValue: (p) => (p.status || 'Active').charAt(0).toUpperCase() + (p.status || 'active').slice(1),
          },
        ],
      };
  }
};

export function ProjectDetailsModal({ project, onClose, onDelete }: ProjectDetailsModalProps) {
  const categoryConfig = getCategoryConfig(project.calculatorId);
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Recalculate investment score using calculator-specific algorithm
  const recalculatedScore = useMemo(() => {
    if (!categoryConfig.showScore) return null;
    return recalculateProjectScore({
      calculatorId: project.calculatorId,
      roi: project.roi,
      avgCashFlow: project.avgCashFlow,
      totalInvestment: project.totalInvestment,
      breakEvenMonths: project.breakEvenMonths,
      location: project.location,
      data: project.data,
    });
  }, [project, categoryConfig.showScore]);

  // Use recalculated score if available
  const displayScore = recalculatedScore?.investmentScore ?? project.investmentScore ?? 0;
  const displayRoiScore = recalculatedScore?.roi_score ?? project.roi_score ?? 0;
  const displayCashflowScore = recalculatedScore?.cashflow_score ?? project.cashflow_score ?? 0;
  const displayStabilityScore = recalculatedScore?.stability_score ?? project.stability_score ?? 0;
  const displayLocationScore = recalculatedScore?.location_score ?? project.location_score ?? 0;

  const scoreColor = categoryConfig.showScore ? getScoreColor(displayScore) : categoryConfig.accentColor;

  const getRiskLabel = (score: number) => {
    if (score >= 85) return 'Excellent';
    if (score >= 70) return 'Very Good';
    if (score >= 60) return 'Good';
    if (score >= 50) return 'Moderate';
    return 'High Risk';
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 rounded-2xl border border-zinc-800 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-zinc-900 border-b border-zinc-800 p-6 flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-2xl font-bold text-white">{project.projectName}</h3>
              <span
                className="px-2 py-0.5 rounded text-xs font-medium"
                style={{ backgroundColor: `${categoryConfig.accentColor}20`, color: categoryConfig.accentColor }}
              >
                {getCalculatorDisplayName(project.calculatorId)}
              </span>
            </div>
            <p className="text-zinc-400">{project.location}</p>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-white text-2xl font-bold transition"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Key Metrics Grid - Calculator Specific */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {categoryConfig.metrics.map((metric, idx) => (
              <div key={idx} className="bg-zinc-800 p-4 rounded-xl border border-zinc-700">
                <div className="text-xs text-zinc-500 font-medium">{metric.label}</div>
                <div className={`text-2xl font-bold mt-1 ${metric.getColor?.(project) || 'text-white'}`}>
                  {metric.getValue(project)}
                </div>
              </div>
            ))}
          </div>

          {/* Score Breakdown - Only for investment calculators */}
          {categoryConfig.showScoreBreakdown && (
            <div
              className="rounded-xl p-4 border"
              style={{ backgroundColor: `${scoreColor}10`, borderColor: `${scoreColor}30` }}
            >
              <div className="text-xs text-zinc-400 font-medium mb-3">Score Breakdown</div>
              <div className="grid grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-lg font-bold text-white">
                    {Math.round((displayRoiScore / 5) * 100)}%
                  </div>
                  <div className="text-xs text-zinc-500">ROI</div>
                  <div className="h-1 bg-zinc-700 rounded-full mt-2 overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{ width: `${Math.min((displayRoiScore / 5) * 100, 100)}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="text-lg font-bold text-white">
                    {Math.round((displayCashflowScore / 3) * 100)}%
                  </div>
                  <div className="text-xs text-zinc-500">Cash Flow</div>
                  <div className="h-1 bg-zinc-700 rounded-full mt-2 overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${Math.min((displayCashflowScore / 3) * 100, 100)}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="text-lg font-bold text-white">
                    {Math.round((displayStabilityScore / 2) * 100)}%
                  </div>
                  <div className="text-xs text-zinc-500">Stability</div>
                  <div className="h-1 bg-zinc-700 rounded-full mt-2 overflow-hidden">
                    <div
                      className="h-full bg-yellow-500 rounded-full"
                      style={{ width: `${Math.min((displayStabilityScore / 2) * 100, 100)}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="text-lg font-bold text-white">
                    {Math.round(displayLocationScore * 100)}%
                  </div>
                  <div className="text-xs text-zinc-500">Location</div>
                  <div className="h-1 bg-zinc-700 rounded-full mt-2 overflow-hidden">
                    <div
                      className="h-full bg-purple-500 rounded-full"
                      style={{ width: `${Math.min(displayLocationScore * 100, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Budget Progress - Only for budget calculator */}
          {categoryConfig.category === 'budget' && (
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-zinc-400">Budget Progress</span>
                <span className="font-bold text-white">
                  {((project.data?.calculations?.totalActual || 0) / (project.data?.calculations?.totalBudgeted || 1) * 100).toFixed(0)}%
                </span>
              </div>
              <div className="h-3 bg-zinc-700 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    (project.data?.calculations?.variancePercent || 0) > 10 ? 'bg-red-500' :
                    (project.data?.calculations?.variancePercent || 0) > 0 ? 'bg-yellow-500' : 'bg-emerald-500'
                  }`}
                  style={{
                    width: `${Math.min(((project.data?.calculations?.totalActual || 0) / (project.data?.calculations?.totalBudgeted || 1) * 100), 100)}%`
                  }}
                />
              </div>
            </div>
          )}

          {/* Overall Score Badge - For scored calculators */}
          {categoryConfig.showScore && (
            <div
              className="flex items-center justify-between p-4 rounded-xl border"
              style={{ backgroundColor: `${scoreColor}10`, borderColor: `${scoreColor}30` }}
            >
              <div>
                <div className="text-sm text-zinc-400">Overall Investment Score</div>
                <div className="text-sm text-zinc-500 mt-1">{getRiskLabel(displayScore)}</div>
              </div>
              <div
                className="text-4xl font-bold"
                style={{ color: scoreColor }}
              >
                {Math.round(displayScore)}<span className="text-lg text-zinc-500">/100</span>
              </div>
            </div>
          )}

          <div className="text-xs text-zinc-500 border-t border-zinc-800 pt-4">
            Created: {new Date(project.createdAt).toLocaleDateString()}
            {project.strategy && (
              <span className="ml-4">Strategy: <span className="capitalize text-zinc-400">{project.strategy}</span></span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-4 border-t border-zinc-800 pt-4">
            {/* Export Options */}
            <div className="space-y-2">
              <div className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Export Options</div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  onClick={() => {
                    generateProjectPDF(project);
                  }}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-zinc-800 border border-zinc-700 text-white rounded-lg hover:bg-zinc-700 transition font-medium text-sm"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Summary PDF
                </button>
                <button
                  onClick={() => {
                    generateEnterpriseReport(project);
                  }}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-lg hover:from-violet-700 hover:to-purple-700 transition font-medium text-sm"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  Enterprise Report
                </button>
                <button
                  onClick={() => {
                    generatePitchDeck(project);
                  }}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg hover:from-amber-600 hover:to-orange-600 transition font-medium text-sm"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                  </svg>
                  Pitch Deck
                </button>
              </div>
            </div>

            {/* Main Actions */}
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-3 sm:px-4 py-3 min-h-[44px] text-zinc-300 border border-zinc-700 rounded-lg hover:bg-zinc-800 transition font-medium text-xs sm:text-sm"
              >
                Close
              </button>
              <button
                onClick={() => {
                  onDelete(project.id);
                  onClose();
                }}
                className="flex-1 px-3 sm:px-4 py-3 min-h-[44px] bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium text-xs sm:text-sm"
              >
                Delete Project
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
