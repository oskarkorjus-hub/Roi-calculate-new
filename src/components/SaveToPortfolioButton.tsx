import { useState, useMemo } from 'react';
import { usePortfolio } from '../lib/portfolio-context';
import { useTier } from '../lib/tier-context';
import { calculateInvestmentScore } from '../utils/investmentScoring';
import { Toast } from './ui/Toast';
import { UpgradeModal } from './ui/UpgradeModal';
import type { UpgradeReason } from '../types/tier';

interface SaveToPortfolioButtonProps {
  calculatorType: 'xirr' | 'rental-roi' | 'mortgage' | 'cashflow' | 'dev-feasibility' | 'cap-rate' | 'irr' | 'npv' | 'indonesia-tax' | 'rental-projection' | 'financing' | 'dev-budget' | 'risk-assessment';
  projectData: Record<string, any>;
  defaultProjectName?: string;
  strategy?: 'flip' | 'hold' | 'rental' | 'development';
}

export function SaveToPortfolioButton({
  calculatorType,
  projectData,
  defaultProjectName = `${calculatorType} Project`,
  strategy,
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

  // Extract financial metrics based on calculator type
  const financialMetrics = useMemo(() => {
    const location = projectData.property?.location || projectData.location || projectData.projectLocation || 'Bali';
    let totalInvestment = 0;
    let roi = 0;
    let avgCashFlow = 0;
    let breakEvenMonths = 0;

    switch (calculatorType) {
      case 'xirr':
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
        totalInvestment = projectData.propertyValue || 0;
        roi = projectData.result?.capRate || projectData.result?.adjustedCapRate || 0;
        avgCashFlow = (projectData.result?.yearlyNOI || projectData.annualNOI || 0) / 12;
        breakEvenMonths = roi > 0 ? Math.round(100 / roi * 12) : 0;
        break;

      case 'dev-feasibility':
        totalInvestment = projectData.result?.totalProjectCost || projectData.totalProjectCost || 0;
        roi = projectData.result?.roiFlip || projectData.result?.roiHold || projectData.roiFlip || projectData.roiHold || 0;
        avgCashFlow = (projectData.result?.grossProfit || 0) / 12;
        breakEvenMonths = roi > 0 ? Math.round(100 / roi * 12) : 24;
        break;

      case 'cashflow':
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
        totalInvestment = projectData.result?.totalInvested || 0;
        roi = projectData.result?.irr || 0;
        avgCashFlow = (projectData.result?.totalCashFlow || 0) / 5;
        breakEvenMonths = (projectData.result?.paybackPeriod || 0) * 12;
        break;

      case 'rental-projection':
        totalInvestment = projectData.purchasePrice || 0;
        roi = projectData.result?.netYield || projectData.result?.projectedYield || 0;
        avgCashFlow = projectData.result?.monthlyNetIncome || 0;
        breakEvenMonths = roi > 0 ? Math.round(100 / roi * 12) : 0;
        break;

      case 'rental-roi':
        totalInvestment = projectData.purchasePrice || projectData.propertyValue || 0;
        roi = projectData.result?.roi || projectData.result?.cashOnCashReturn || 0;
        avgCashFlow = projectData.result?.monthlyCashFlow || 0;
        breakEvenMonths = projectData.result?.breakEvenMonths || 0;
        break;

      case 'npv':
        totalInvestment = projectData.result?.totalCashOutflows || 0;
        roi = projectData.result?.profitabilityIndex ? (projectData.result.profitabilityIndex - 1) * 100 : 0;
        avgCashFlow = (projectData.result?.netCashFlow || 0) / 5;
        breakEvenMonths = 24;
        break;

      case 'mortgage':
      case 'financing':
      case 'indonesia-tax':
      case 'dev-budget':
      case 'risk-assessment':
      default:
        // These calculators don't have meaningful investment scores
        totalInvestment = projectData.loanAmount || projectData.propertyValue || 0;
        roi = 0;
        avgCashFlow = 0;
        breakEvenMonths = 0;
        break;
    }

    return { location, totalInvestment, roi, avgCashFlow, breakEvenMonths };
  }, [projectData, calculatorType]);

  // Calculate investment score
  const scoreComponents = useMemo(() => {
    return calculateInvestmentScore(
      financialMetrics.roi,
      financialMetrics.avgCashFlow,
      financialMetrics.totalInvestment,
      financialMetrics.breakEvenMonths,
      financialMetrics.location
    );
  }, [financialMetrics]);

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
        className="
          group relative px-5 py-2.5 rounded-xl text-sm font-semibold text-white
          bg-gradient-to-b from-emerald-500 to-emerald-600
          border border-emerald-400/30
          shadow-[0_1px_2px_rgba(0,0,0,0.1),0_2px_8px_rgba(16,185,129,0.25)]
          hover:from-emerald-400 hover:to-emerald-500
          hover:shadow-[0_2px_4px_rgba(0,0,0,0.1),0_4px_16px_rgba(16,185,129,0.35)]
          hover:border-emerald-300/40
          active:scale-[0.98]
          transition-all duration-200
          overflow-hidden
        "
      >
        {/* Shimmer effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />

        <span className="relative flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
          Save to Portfolio
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
                    <option value="flip" className="bg-zinc-900">Flip (Short-term buy & sell)</option>
                    <option value="hold" className="bg-zinc-900">Hold (Long-term appreciation)</option>
                    <option value="rental" className="bg-zinc-900">Rental (Cash flow focus)</option>
                    <option value="development" className="bg-zinc-900">Development (Renovation/Build)</option>
                  </select>
                  <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

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
