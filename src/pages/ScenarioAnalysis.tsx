import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { PortfolioProject, ProjectScenario } from '../types/portfolio';
import { usePortfolio } from '../lib/portfolio-context';
import { useScenarios } from '../hooks/useScenarios';
import { ScenarioComparatorTable } from '../components/ScenarioComparatorTable';
import { ScenarioComparisonCharts } from '../components/ScenarioComparisonCharts';
import { Toast } from '../components/ui/Toast';

// Custom easing for premium animations
const premiumEase: [number, number, number, number] = [0.16, 1, 0.3, 1];

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: premiumEase,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: premiumEase,
    },
  },
};

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

      let riskScore = 50;
      if (dscr >= 1.5) riskScore -= 15;
      else if (dscr >= 1.25) riskScore -= 10;
      else if (dscr < 1.0) riskScore += 20;
      if (leverageRatio > 0.8) riskScore += 15;
      else if (leverageRatio < 0.5) riskScore -= 10;
      if (averageOccupancy >= 80) riskScore -= 10;
      else if (averageOccupancy < 60) riskScore += 15;
      if (projectROI > 15) riskScore -= 10;
      else if (projectROI < 5) riskScore += 10;

      const riskFreeRate = 3;
      const volatility = 15 + (leverageRatio * 10);
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

// Calculate baseline results from project data
function calculateBaselineResults(project: PortfolioProject): Record<string, any> {
  return calculateScenarioResults(project.data || {}, project.calculatorId, project);
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

  // Not found state
  if (!project) {
    return (
      <div className="min-h-screen bg-mesh-gradient flex items-center justify-center">
        <div className="fixed inset-0 bg-grid-pattern opacity-20 pointer-events-none" />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 card-premium rounded-2xl p-8 text-center max-w-sm"
        >
          <span className="material-symbols-outlined text-4xl text-zinc-500 mb-4">error</span>
          <h2 className="text-xl font-display font-bold text-white mb-2">Project Not Found</h2>
          <p className="text-zinc-400 font-body mb-4">The requested project could not be found.</p>
          <button onClick={onBack} className="btn-ghost px-6 py-2.5 text-sm">
            ← Back to Portfolio
          </button>
        </motion.div>
      </div>
    );
  }

  const scenarios = project.scenarios || [];

  // Recalculate scenario results from inputs
  const scenariosWithRecalculatedResults = useMemo(() => {
    return scenarios.map(scenario => ({
      ...scenario,
      results: calculateScenarioResults(scenario.inputs, project.calculatorId, project),
    }));
  }, [scenarios, project]);

  const selectedScenarios = scenariosWithRecalculatedResults.filter(s => selectedScenarioIds.includes(s.id));
  const previewMetrics = CALCULATOR_PREVIEW_METRICS[project.calculatorId] || DEFAULT_PREVIEW_METRICS;
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
        : [...prev, scenarioId].slice(-4)
    );
  };

  return (
    <div className="text-white">
      {/* Atmospheric effects */}
      <div className="fixed inset-0 bg-grid-pattern opacity-20 pointer-events-none" />
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-40 right-1/3 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 max-w-[100%] mx-auto space-y-8"
      >
        {/* Header */}
        <motion.header variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            {onBack && (
              <button
                onClick={onBack}
                className="group w-12 h-12 rounded-xl bg-zinc-800/50 border border-zinc-700/50 flex items-center justify-center hover:bg-zinc-800 hover:border-zinc-600 transition-all"
              >
                <svg className="w-5 h-5 text-zinc-400 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}

            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.6, ease: premiumEase, delay: 0.2 }}
            >
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 border border-amber-500/30 flex items-center justify-center shadow-lg">
                <span className="material-symbols-outlined text-2xl text-amber-400">analytics</span>
              </div>
            </motion.div>

            <div>
              <h1 className="text-3xl font-display font-bold text-white tracking-tight">{project.projectName}</h1>
              <p className="text-zinc-400 text-sm mt-1 font-body">
                {project.location} • Scenario Analysis
              </p>
            </div>
          </div>

          <motion.div variants={itemVariants} className="flex items-center gap-4">
            <div className="stat-card">
              <span className="stat-label">Scenarios</span>
              <span className="stat-value text-amber-400">{scenarios.length}</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Selected</span>
              <span className="stat-value text-cyan-400">{selectedScenarios.length}</span>
            </div>
          </motion.div>
        </motion.header>

        {/* Scenario Selector */}
        {scenarios.length > 0 && (
          <motion.div variants={itemVariants} className="card-premium rounded-2xl p-6">
            <div className="relative mb-6 flex items-center gap-3 pb-4 border-b border-zinc-800/50">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" style={{ top: '-1.5rem' }} />
              <div className="section-icon" style={{ background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(234, 179, 8, 0.1))', borderColor: 'rgba(245, 158, 11, 0.3)' }}>
                <span className="material-symbols-outlined text-amber-400">compare_arrows</span>
              </div>
              <div>
                <h2 className="section-title">Select Scenarios to Compare</h2>
                <p className="text-xs text-zinc-500 font-body mt-0.5">Choose up to 4 scenarios • {selectedScenarios.length} selected</p>
              </div>
            </div>

            <motion.div
              variants={containerVariants}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {scenarios.map((scenario, idx) => (
                <motion.label
                  key={scenario.id}
                  variants={cardVariants}
                  className={`group relative p-5 rounded-xl border-2 cursor-pointer transition-all card-highlight ${
                    selectedScenarioIds.includes(scenario.id)
                      ? 'border-emerald-500/50 bg-emerald-500/5 shadow-lg shadow-emerald-500/10'
                      : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700 hover:bg-zinc-900'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedScenarioIds.includes(scenario.id)}
                    onChange={() => toggleScenarioSelection(scenario.id)}
                    disabled={!selectedScenarioIds.includes(scenario.id) && selectedScenarioIds.length >= 4}
                    className="absolute top-4 right-4 w-5 h-5 rounded border-2 border-zinc-600 bg-zinc-800 cursor-pointer accent-emerald-500 checked:bg-emerald-500 checked:border-emerald-500"
                  />

                  <div className="pr-8">
                    <h3 className="font-display font-semibold text-white">{scenario.name}</h3>
                    <div className="mt-3 space-y-1.5">
                      {previewMetrics.map(metric => {
                        const value = scenario.results[metric.key];
                        const hasValue = value !== undefined && value !== null && value !== 0;
                        return (
                          <div key={metric.key} className="flex items-center justify-between text-sm">
                            <span className="text-zinc-500 font-body">{metric.label}</span>
                            <span className={`font-mono ${hasValue ? 'text-emerald-400' : 'text-zinc-600'}`}>
                              {metric.format(value)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="absolute bottom-4 right-4 flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition">
                    <button
                      onClick={e => {
                        e.preventDefault();
                        setRenamingId(scenario.id);
                        setNewName(scenario.name);
                      }}
                      className="p-2 bg-zinc-700/80 text-zinc-300 rounded-lg hover:bg-zinc-600 transition"
                      title="Rename"
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
                      className="p-2 bg-zinc-700/80 text-zinc-300 rounded-lg hover:bg-red-500/30 hover:text-red-400 transition"
                      title="Delete"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </motion.label>
              ))}
            </motion.div>
          </motion.div>
        )}

        {/* Rename Modal */}
        <AnimatePresence>
          {renamingId && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="card-premium rounded-2xl p-6 max-w-sm w-full"
              >
                <h3 className="text-lg font-display font-bold text-white mb-4">Rename Scenario</h3>
                <input
                  type="text"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700/50 rounded-xl text-white font-body focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 mb-4"
                  autoFocus
                />
                <div className="flex gap-3">
                  <button onClick={() => setRenamingId(null)} className="flex-1 btn-ghost py-3 text-sm">Cancel</button>
                  <button onClick={() => handleRenameScenario(renamingId, newName)} className="flex-1 btn-premium py-3 text-sm">Save</button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Delete Modal */}
        <AnimatePresence>
          {deletingScenario && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="card-premium rounded-2xl p-6 max-w-md w-full"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center">
                    <span className="material-symbols-outlined text-red-400">warning</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-display font-bold text-white">Delete Scenario</h3>
                    <p className="text-sm text-zinc-400 font-body">This action cannot be undone</p>
                  </div>
                </div>
                <p className="text-zinc-400 mb-6 font-body">
                  Are you sure you want to delete <span className="font-semibold text-white">"{deletingScenario.name}"</span>?
                </p>
                <div className="flex gap-3">
                  <button onClick={() => setDeletingScenario(null)} className="flex-1 btn-ghost py-3 text-sm">Cancel</button>
                  <button
                    onClick={() => { handleDeleteScenario(deletingScenario.id); setDeletingScenario(null); }}
                    className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition font-display font-medium text-sm"
                  >
                    Delete
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Comparison Results */}
        {selectedScenarios.length > 0 && (
          <motion.div variants={itemVariants} className="space-y-8">
            {/* Winner Badge */}
            {winner && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="card-premium rounded-2xl p-6 border-l-4 border-emerald-500"
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">🏆</span>
                  <h3 className="text-lg font-display font-bold text-emerald-400">Best Overall Scenario</h3>
                </div>
                <p className="text-zinc-300 font-body">
                  <span className="font-semibold text-white">{winner.name}</span> is the most profitable scenario with a composite score of{' '}
                  <span className="font-mono text-emerald-400">{winner.score?.toFixed(0)}</span>.
                </p>
              </motion.div>
            )}

            {/* Metrics Table */}
            <motion.div variants={itemVariants} className="card-premium rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-zinc-800/50">
                <div className="section-icon">
                  <span className="material-symbols-outlined text-emerald-400">table_chart</span>
                </div>
                <h3 className="section-title">Detailed Comparison</h3>
              </div>
              <ScenarioComparatorTable
                scenarios={selectedScenarios}
                baselineScenario={baselineScenario}
                calculatorId={project.calculatorId}
              />
            </motion.div>

            {/* Charts */}
            <motion.div variants={itemVariants}>
              <div className="flex items-center gap-3 mb-5">
                <div className="section-icon" style={{ background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(168, 85, 247, 0.1))', borderColor: 'rgba(139, 92, 246, 0.3)' }}>
                  <span className="material-symbols-outlined text-purple-400">bar_chart</span>
                </div>
                <h3 className="section-title">Visual Analysis</h3>
              </div>
              <ScenarioComparisonCharts
                scenarios={selectedScenarios}
                baselineScenario={baselineScenario}
                calculatorId={project.calculatorId}
              />
            </motion.div>

            {/* Summary */}
            <motion.div variants={itemVariants} className="card-premium rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-5 pb-4 border-b border-zinc-800/50">
                <div className="section-icon">
                  <span className="material-symbols-outlined text-cyan-400">summarize</span>
                </div>
                <h3 className="section-title">Analysis Summary</h3>
              </div>
              <div className="space-y-3 text-sm">
                <p className="text-zinc-400 font-body">
                  <span className="text-white font-display font-medium">Scenarios Compared:</span> {selectedScenarios.length + 1} (including baseline)
                </p>
                {(CALCULATOR_SUMMARY_METRICS[project.calculatorId] || [
                  { key: 'roi', label: 'ROI Range', format: (v: any) => `${(v || 0).toFixed(1)}%`, showRange: true },
                  { key: 'avgCashFlow', label: 'Cash Flow Range', format: (v: any) => `$${formatNum(v)}`, showRange: true },
                ]).map(metric => {
                  const allValues = [baselineScenario, ...selectedScenarios]
                    .map(s => Number(s.results[metric.key]) || 0)
                    .filter(v => !isNaN(v));
                  if (allValues.length === 0 || allValues.every(v => v === 0)) return null;
                  const minVal = Math.min(...allValues);
                  const maxVal = Math.max(...allValues);
                  return (
                    <p key={metric.key} className="text-zinc-400 font-body">
                      <span className="text-white font-display font-medium">{metric.label}:</span>{' '}
                      <span className="text-emerald-400 font-mono">{metric.format(minVal)}</span>
                      {minVal !== maxVal && (
                        <> – <span className="text-emerald-400 font-mono">{metric.format(maxVal)}</span></>
                      )}
                    </p>
                  );
                })}
                <p className="pt-3 text-xs text-zinc-500 italic font-body border-t border-zinc-800/50 mt-4">
                  All metrics are based on calculator inputs. Consider external factors when making investment decisions.
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Empty State */}
        {scenarios.length === 0 && (
          <motion.div variants={itemVariants} className="flex items-center justify-center py-16">
            <div className="text-center card-premium rounded-2xl p-10 max-w-md">
              <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
                <span className="material-symbols-outlined text-3xl text-amber-400">science</span>
              </div>
              <h3 className="text-2xl font-display font-bold text-white mb-3">No Scenarios Yet</h3>
              <p className="text-zinc-400 font-body mb-6">
                Create what-if scenarios from your project card to explore different investment outcomes.
              </p>
              <div className="stat-card text-left">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-emerald-400">lightbulb</span>
                  <p className="text-sm text-zinc-400 font-body">
                    <span className="text-zinc-300 font-medium">Tip:</span> Click "What-if Scenario" on your project card to get started!
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
