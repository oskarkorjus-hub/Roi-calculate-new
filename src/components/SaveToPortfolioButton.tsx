import { useState, useMemo } from 'react';
import { usePortfolio } from '../lib/portfolio-context';
import { useTier } from '../lib/tier-context';
import { calculateInvestmentScore } from '../utils/investmentScoring';
import { Toast } from './ui/Toast';
import { UpgradeModal } from './ui/UpgradeModal';
import type { UpgradeReason } from '../types/tier';

interface SaveToPortfolioButtonProps {
  calculatorType: 'xirr' | 'rental-roi' | 'mortgage' | 'cashflow' | 'dev-feasibility' | 'cap-rate' | 'irr' | 'npv' | 'indonesia-tax' | 'rental-projection' | 'financing' | 'dev-budget' | 'risk-assessment' | 'brrrr';
  projectData: Record<string, any>;
  defaultProjectName?: string;
  strategy?: 'flip' | 'hold' | 'rental' | 'development';
  compact?: boolean;
}

export function SaveToPortfolioButton({
  calculatorType,
  projectData,
  defaultProjectName = `${calculatorType} Project`,
  strategy,
  compact = false,
}: SaveToPortfolioButtonProps) {
  const { addProject, canAddProject } = usePortfolio();
  const { limits, canUseCalculator, incrementUsage } = useTier();
  const [showModal, setShowModal] = useState(false);
  const [projectName, setProjectName] = useState(defaultProjectName);
  const [selectedStrategy, setSelectedStrategy] = useState<'flip' | 'hold' | 'rental' | 'development' | ''>(
    strategy || ''
  );
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeReason, setUpgradeReason] = useState<UpgradeReason>('calculation_limit');

  // Calculator types where investment score is meaningful
  const scorableCalculators = ['cap-rate', 'dev-feasibility', 'cashflow', 'irr', 'rental-projection', 'rental-roi', 'xirr'];
  const showScore = scorableCalculators.includes(calculatorType);

  // Calculator-specific strategy options
  const getStrategyOptions = (calcType: string): { value: string; label: string }[] => {
    switch (calcType) {
      case 'xirr':
        return [
          { value: 'flip', label: 'Flip (Buy & Sell)' },
          { value: 'hold', label: 'Hold (Capital Appreciation)' },
        ];
      case 'rental-roi':
      case 'rental-projection':
      case 'cashflow':
        return [
          { value: 'rental', label: 'Rental (Cash Flow)' },
          { value: 'hold', label: 'Hold (Long-term)' },
        ];
      case 'cap-rate':
        return [
          { value: 'rental', label: 'Rental Income' },
          { value: 'hold', label: 'Value Appreciation' },
        ];
      case 'dev-feasibility':
        return [
          { value: 'development', label: 'Build & Sell' },
          { value: 'flip', label: 'Renovate & Flip' },
          { value: 'hold', label: 'Build & Hold' },
        ];
      case 'irr':
      case 'npv':
        return [
          { value: 'flip', label: 'Short-term Exit' },
          { value: 'hold', label: 'Long-term Hold' },
          { value: 'rental', label: 'Income Generating' },
        ];
      // No strategy for these tools
      case 'mortgage':
      case 'financing':
      case 'indonesia-tax':
      case 'dev-budget':
      case 'risk-assessment':
      default:
        return [];
    }
  };

  const strategyOptions = getStrategyOptions(calculatorType);
  const showStrategy = strategyOptions.length > 0;

  // Extract financial metrics based on calculator type
  const financialMetrics = useMemo(() => {
    const location = projectData.property?.location || projectData.location || projectData.projectLocation || 'Bali';
    let totalInvestment = 0;
    let roi = 0;
    let avgCashFlow = 0;
    let breakEvenMonths = 0;

    switch (calculatorType) {
      case 'xirr':
        // XIRR passes: { ...data, result } where data has property.totalPrice, result has rate, netProfit, holdPeriodMonths
        totalInvestment = projectData.result?.totalInvested || projectData.property?.totalPrice || 0;
        // XIRR rate is stored as decimal (e.g., 0.15 for 15%), convert to percentage
        roi = (projectData.result?.rate || 0) * 100;
        // Net profit divided by hold period for average monthly cash flow equivalent
        avgCashFlow = projectData.result?.holdPeriodMonths > 0
          ? (projectData.result?.netProfit || 0) / projectData.result.holdPeriodMonths
          : 0;
        // Break-even approximation from hold period
        breakEvenMonths = projectData.result?.holdPeriodMonths || 0;
        break;

      case 'cap-rate':
        // Cap-rate passes: { ...inputs, result } where inputs has propertyValue, result has capRate, yearlyNOI, monthlyNOI
        totalInvestment = projectData.propertyValue || 0;
        roi = projectData.result?.adjustedCapRate || projectData.result?.capRate || 0;
        avgCashFlow = projectData.result?.adjustedMonthlyNOI || projectData.result?.monthlyNOI || (projectData.result?.yearlyNOI || 0) / 12;
        breakEvenMonths = roi > 0 ? Math.round(100 / roi * 12) : 0;
        break;

      case 'dev-feasibility':
        // Dev-feasibility passes: { ...inputs, scenarios } - scenarios is array with financial data
        const scenario = projectData.scenarios?.[0] || {};
        totalInvestment = scenario.totalProjectCost || projectData.totalProjectCost || 0;
        roi = scenario.roiFlip || scenario.roiHold || 0;
        avgCashFlow = (scenario.grossProfit || 0) / 12;
        breakEvenMonths = roi > 0 ? Math.round(100 / roi * 12) : 24;
        break;

      case 'cashflow':
        // Cashflow passes: { ...inputs, schedule } where inputs has monthlyRentalIncome, etc.
        totalInvestment = projectData.monthlyRentalIncome ? projectData.monthlyRentalIncome * 12 * 10 : 0;
        const netMonthly = (projectData.monthlyRentalIncome || 0) -
          (projectData.monthlyMaintenance || 0) -
          (projectData.monthlyPropertyTax || 0) -
          (projectData.monthlyInsurance || 0);
        avgCashFlow = netMonthly;
        roi = totalInvestment > 0 ? (netMonthly * 12 / totalInvestment) * 100 : 0;
        breakEvenMonths = netMonthly > 0 ? Math.round(totalInvestment / (netMonthly * 12) * 12) : 0;
        break;

      case 'irr':
        // IRR explicitly passes structured data: { projectName, totalInvestment, roi, breakEvenMonths, currency }
        totalInvestment = projectData.totalInvestment || projectData.result?.totalInvested || 0;
        roi = projectData.roi || projectData.result?.irr || 0;
        avgCashFlow = (projectData.result?.totalCashFlow || 0) / 5;
        breakEvenMonths = projectData.breakEvenMonths || (projectData.result?.paybackPeriod || 0) * 12;
        break;

      case 'rental-projection':
        // Rental-projection passes: { ...inputs, result }
        // inputs: nightlyRate, propertySize, location, baseOccupancyRate
        // result: annualNetIncome, averageOccupancy, breakEvenMonths, annualRevenue
        const annualRevenue = projectData.result?.annualRevenue || 0;
        const annualNetIncome = projectData.result?.annualNetIncome || 0;
        // Use annual revenue * 10 as rough property value proxy (10x gross multiplier)
        totalInvestment = annualRevenue > 0 ? annualRevenue * 10 : (projectData.nightlyRate || 0) * 365 * 10;
        // Net yield = annualNetIncome / totalInvestment * 100
        roi = totalInvestment > 0 ? (annualNetIncome / totalInvestment) * 100 : 0;
        avgCashFlow = annualNetIncome / 12;
        breakEvenMonths = projectData.result?.breakEvenMonths || (roi > 0 ? Math.round(100 / roi * 12) : 0);
        break;

      case 'rental-roi':
        // Rental-ROI passes: { ...assumptions, data, averages }
        // assumptions: initialInvestment, y1ADR, y1Occupancy
        // averages: roiAfterManagement, takeHomeProfit, gopMargin
        totalInvestment = projectData.initialInvestment || 0;
        roi = projectData.averages?.roiAfterManagement || 0;
        avgCashFlow = (projectData.averages?.takeHomeProfit || 0) / 12;
        // Calculate break-even from annual profit
        const annualProfit = projectData.averages?.takeHomeProfit || 0;
        breakEvenMonths = annualProfit > 0 ? Math.round((totalInvestment / annualProfit) * 12) : 0;
        break;

      case 'npv':
        // NPV passes: { discountRate, cashFlows, projectLength, result: { npv, totalCashOutflows, profitabilityIndex, netCashFlow } }
        totalInvestment = projectData.result?.totalCashOutflows || projectData.totalInvestment || 0;
        // ROI based on NPV relative to investment
        roi = totalInvestment > 0 && projectData.result?.npv !== undefined
          ? (projectData.result.npv / totalInvestment) * 100
          : (projectData.result?.profitabilityIndex ? (projectData.result.profitabilityIndex - 1) * 100 : 0);
        // Average cash flow over project length
        const npvProjectLength = projectData.projectLength || projectData.cashFlows?.length - 1 || 5;
        avgCashFlow = (projectData.result?.netCashFlow || 0) / Math.max(npvProjectLength, 1);
        // Break-even estimated from PI
        breakEvenMonths = projectData.result?.profitabilityIndex && projectData.result.profitabilityIndex > 0
          ? Math.round(12 / projectData.result.profitabilityIndex)
          : 24;
        break;

      case 'financing':
        // Financing passes: { ...inputs, results } where results is array of loan comparisons
        const bestLoan = projectData.results?.[0] || {};
        totalInvestment = projectData.loanAmount || bestLoan.loanAmount || 0;
        roi = 0; // Financing doesn't have ROI
        avgCashFlow = -(bestLoan.monthlyPayment || 0); // Negative as it's an expense
        breakEvenMonths = (projectData.loanTermYears || bestLoan.loanTermYears || 0) * 12;
        break;

      case 'mortgage':
        // Mortgage passes: { ...inputs, result } where result has monthlyPayment, totalInterest
        totalInvestment = projectData.loanAmount || projectData.propertyValue || 0;
        roi = 0;
        avgCashFlow = -(projectData.result?.monthlyPayment || 0);
        // Support both loanTerm (mortgage) and loanTermYears (financing)
        breakEvenMonths = (projectData.loanTerm || projectData.loanTermYears || 0) * 12;
        break;

      case 'indonesia-tax':
        // Indonesia Tax passes: { ...inputs, result }
        totalInvestment = projectData.purchasePrice || 0;
        roi = 0;
        avgCashFlow = 0;
        breakEvenMonths = 0;
        break;

      case 'dev-budget':
        // Dev Budget passes: { ...inputs, calculations }
        totalInvestment = projectData.calculations?.totalBudgeted || 0;
        roi = 0;
        avgCashFlow = 0;
        breakEvenMonths = 0;
        break;

      case 'risk-assessment':
        // Risk Assessment passes: { ...inputs, riskScore, scenarios }
        totalInvestment = projectData.propertyValue || projectData.investmentAmount || 0;
        roi = projectData.expectedReturn || 0;
        avgCashFlow = 0;
        breakEvenMonths = 0;
        break;

      case 'brrrr':
        // BRRRR passes: { ...inputs, result } where inputs has purchasePrice, rehabCost, etc.
        totalInvestment = projectData.result?.totalInvestment || ((projectData.purchasePrice || 0) + (projectData.rehabCost || 0) + (projectData.holdingCosts || 0));
        roi = projectData.result?.cashOnCashROI || 0;
        avgCashFlow = projectData.result?.monthlyCashFlow || 0;
        // Break-even: if cashLeftInDeal > 0 and monthlyCashFlow > 0, calculate months to recover
        const cashLeft = projectData.result?.cashLeftInDeal || 0;
        const monthlyFlow = projectData.result?.monthlyCashFlow || 0;
        breakEvenMonths = (cashLeft > 0 && monthlyFlow > 0) ? Math.ceil(cashLeft / monthlyFlow) : (cashLeft <= 0 ? 0 : 0);
        break;

      default:
        totalInvestment = projectData.loanAmount || projectData.propertyValue || projectData.totalInvestment || 0;
        roi = 0;
        avgCashFlow = 0;
        breakEvenMonths = 0;
        break;
    }

    return { location, totalInvestment, roi, avgCashFlow, breakEvenMonths };
  }, [projectData, calculatorType]);

  // Calculate investment score with calculator-specific algorithm
  const scoreComponents = useMemo(() => {
    return calculateInvestmentScore(
      financialMetrics.roi,
      financialMetrics.avgCashFlow,
      financialMetrics.totalInvestment,
      financialMetrics.breakEvenMonths,
      financialMetrics.location,
      calculatorType,
      projectData
    );
  }, [financialMetrics, calculatorType, projectData]);

  const handleSave = async () => {
    if (!projectName.trim()) {
      setToast({ message: 'Project name is required', type: 'error' });
      return;
    }

    // Check project limit
    if (!canAddProject(limits.maxSavedProjects)) {
      setUpgradeReason('project_limit');
      setShowUpgradeModal(true);
      return;
    }

    // Check calculation usage limit and increment
    if (!canUseCalculator()) {
      setUpgradeReason('calculation_limit');
      setShowUpgradeModal(true);
      return;
    }

    setIsSaving(true);
    try {
      // Increment usage before saving
      const usageIncremented = incrementUsage();
      if (!usageIncremented) {
        setUpgradeReason('calculation_limit');
        setShowUpgradeModal(true);
        setIsSaving(false);
        return;
      }

      const savedProject = await addProject({
        projectName: projectName,
        calculatorId: calculatorType,
        strategy: (selectedStrategy as 'flip' | 'hold' | 'rental' | 'development') || undefined,
        data: projectData,
        location: financialMetrics.location,
        totalInvestment: financialMetrics.totalInvestment,
        roi: financialMetrics.roi,
        avgCashFlow: financialMetrics.avgCashFlow,
        breakEvenMonths: financialMetrics.breakEvenMonths,
        investmentScore: showScore ? scoreComponents.investmentScore : 0,
        roi_score: showScore ? scoreComponents.roi_score : 0,
        cashflow_score: showScore ? scoreComponents.cashflow_score : 0,
        stability_score: showScore ? scoreComponents.stability_score : 0,
        location_score: showScore ? scoreComponents.location_score : 0,
        currency: projectData.currency || 'IDR',
        status: 'active',
      });

      if (!savedProject) {
        setToast({ message: 'Failed to save project', type: 'error' });
        return;
      }

      setToast({ message: `"${projectName}" saved to portfolio!`, type: 'success' });
      setShowModal(false);
      setProjectName(defaultProjectName);
      setSelectedStrategy('');
    } catch (error) {
      setToast({ message: 'Failed to save project', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        reason={upgradeReason}
      />

      <button
        onClick={() => setShowModal(true)}
        className={compact
          ? "group relative p-2 rounded-lg text-emerald-400 hover:text-white bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 hover:border-emerald-400/50 transition-all duration-200"
          : `group relative px-5 py-2.5 rounded-xl text-sm font-semibold text-white
            bg-gradient-to-b from-emerald-500 to-emerald-600
            border border-emerald-400/30
            shadow-[0_1px_2px_rgba(0,0,0,0.1),0_2px_8px_rgba(16,185,129,0.25)]
            hover:from-emerald-400 hover:to-emerald-500
            hover:shadow-[0_2px_4px_rgba(0,0,0,0.1),0_4px_16px_rgba(16,185,129,0.35)]
            hover:border-emerald-300/40
            active:scale-[0.98]
            transition-all duration-200
            overflow-hidden`
        }
        title="Save to Portfolio"
      >
        {!compact && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
        )}

        <span className="relative flex items-center gap-2">
          <svg className={compact ? "w-4.5 h-4.5" : "w-4 h-4"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
          {!compact && "Save to Portfolio"}
        </span>
      </button>

      {/* Modal - Enterprise Design */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50 animate-in fade-in duration-200">
          <div className="bg-zinc-900/95 backdrop-blur-xl rounded-2xl border border-zinc-700/60 shadow-[0_8px_40px_rgba(0,0,0,0.3),0_20px_80px_rgba(0,0,0,0.2)] max-w-md w-full mx-4 overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="px-6 py-5 border-b border-zinc-800/80 bg-gradient-to-b from-zinc-800/50 to-transparent">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border border-emerald-500/30">
                  <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white tracking-tight">Save to Portfolio</h3>
                  <p className="text-sm text-zinc-500">Track your investment analysis</p>
                </div>
              </div>
            </div>

            {/* Form Content */}
            <div className="px-6 py-5 space-y-5">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                  Project Name *
                </label>
                <input
                  type="text"
                  value={projectName}
                  onChange={e => setProjectName(e.target.value)}
                  placeholder="My Project Name"
                  className="w-full px-4 py-3 bg-zinc-800/80 border border-zinc-700/60 rounded-xl text-white placeholder:text-zinc-500 focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50 focus:bg-zinc-800 outline-none transition-all duration-200"
                  autoFocus
                />
              </div>

              {showStrategy && (
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                    Investment Strategy (Optional)
                  </label>
                  <div className="relative">
                    <select
                      value={selectedStrategy}
                      onChange={e => setSelectedStrategy(e.target.value as any)}
                      className="w-full appearance-none px-4 py-3 pr-10 bg-zinc-800/80 border border-zinc-700/60 rounded-xl text-white focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50 focus:bg-zinc-800 outline-none transition-all duration-200 cursor-pointer"
                    >
                      <option value="" className="bg-zinc-900">Select strategy...</option>
                      {strategyOptions.map(opt => (
                        <option key={opt.value} value={opt.value} className="bg-zinc-900">
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              )}

              {/* Score Preview - Enterprise Design */}
              {showScore && scoreComponents.investmentScore > 0 && (
                <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border border-emerald-500/20 rounded-xl p-4">
                  <div className="text-xs text-zinc-400 font-semibold uppercase tracking-wider mb-3">Investment Score</div>
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="text-3xl font-bold text-emerald-400 tabular-nums">
                        {scoreComponents.investmentScore}
                      </div>
                      {/* Score ring indicator */}
                      <div className="absolute -inset-2 rounded-full border-2 border-emerald-500/20" />
                    </div>
                    <div className="text-sm text-zinc-300">
                      <div className="font-semibold">
                        {scoreComponents.investmentScore >= 85
                          ? 'Excellent'
                          : scoreComponents.investmentScore >= 70
                            ? 'Very Good'
                            : scoreComponents.investmentScore >= 60
                              ? 'Good'
                              : scoreComponents.investmentScore >= 50
                                ? 'Moderate'
                                : 'High Risk'}
                      </div>
                      <div className="text-zinc-500 text-xs">/100 points</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-zinc-800/30 border-t border-zinc-800/80 flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                disabled={isSaving}
                className="flex-1 px-5 py-2.5 text-sm font-semibold text-zinc-300 border border-zinc-700/60 rounded-xl hover:bg-zinc-800 hover:border-zinc-600/60 transition-all duration-200 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="
                  flex-1 px-5 py-2.5 text-sm font-semibold text-white rounded-xl
                  bg-gradient-to-b from-emerald-500 to-emerald-600
                  border border-emerald-400/30
                  shadow-[0_1px_2px_rgba(0,0,0,0.1),0_2px_8px_rgba(16,185,129,0.2)]
                  hover:from-emerald-400 hover:to-emerald-500
                  hover:shadow-[0_2px_4px_rgba(0,0,0,0.1),0_4px_12px_rgba(16,185,129,0.3)]
                  disabled:opacity-50 disabled:hover:from-emerald-500 disabled:hover:to-emerald-600 disabled:hover:shadow-none
                  transition-all duration-200
                "
              >
                {isSaving ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </span>
                ) : 'Save Project'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
