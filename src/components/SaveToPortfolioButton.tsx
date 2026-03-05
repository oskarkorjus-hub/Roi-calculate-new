import { useState, useMemo } from 'react';
import { usePortfolio } from '../lib/portfolio-context';
import { useTier } from '../lib/tier-context';
import { calculateInvestmentScore } from '../utils/investmentScoring';
import { Toast } from './ui/Toast';
import { UpgradeModal } from './ui/UpgradeModal';
import type { UpgradeReason } from '../types/tier';

interface SaveToPortfolioButtonProps {
  calculatorType: 'xirr' | 'rental-roi' | 'mortgage' | 'cashflow' | 'dev-feasibility' | 'cap-rate' | 'irr' | 'npv' | 'indonesia-tax' | 'rental-projection' | 'financing';
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
  const scorableCalculators = ['cap-rate', 'dev-feasibility', 'cashflow', 'irr', 'rental-projection', 'rental-roi'];
  const showScore = scorableCalculators.includes(calculatorType);

  // Extract financial metrics based on calculator type
  const financialMetrics = useMemo(() => {
    const location = projectData.property?.location || projectData.location || 'Bali';
    let totalInvestment = 0;
    let roi = 0;
    let avgCashFlow = 0;
    let breakEvenMonths = 0;

    switch (calculatorType) {
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
        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
      >
        💾 Save to Portfolio
      </button>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-white mb-4">Save to Portfolio</h3>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  Project Name *
                </label>
                <input
                  type="text"
                  value={projectName}
                  onChange={e => setProjectName(e.target.value)}
                  placeholder="My Project Name"
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder:text-zinc-500 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  Investment Strategy (Optional)
                </label>
                <select
                  value={selectedStrategy}
                  onChange={e => setSelectedStrategy(e.target.value as any)}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                >
                  <option value="" className="bg-zinc-800">Select strategy...</option>
                  <option value="flip" className="bg-zinc-800">Flip (Short-term buy & sell)</option>
                  <option value="hold" className="bg-zinc-800">Hold (Long-term appreciation)</option>
                  <option value="rental" className="bg-zinc-800">Rental (Cash flow focus)</option>
                  <option value="development" className="bg-zinc-800">Development (Renovation/Build)</option>
                </select>
              </div>

              {/* Score Preview - only for investment-focused calculators */}
              {showScore && scoreComponents.investmentScore > 0 && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3">
                  <div className="text-xs text-zinc-400 font-medium mb-2">Investment Score</div>
                  <div className="flex items-center gap-2">
                    <div className="text-2xl font-bold text-emerald-400">
                      {scoreComponents.investmentScore}
                    </div>
                    <div className="text-xs text-zinc-300">
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
                      <div>/100</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                disabled={isSaving}
                className="flex-1 px-4 py-2 border border-zinc-700 text-zinc-300 rounded-lg hover:bg-zinc-800 transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
