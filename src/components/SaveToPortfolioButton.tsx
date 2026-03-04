import { useState, useMemo } from 'react';
import { usePortfolio } from '../hooks/usePortfolio';
import { calculateInvestmentScore } from '../utils/investmentScoring';
import { Toast } from './ui/Toast';

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
  const { addProject } = usePortfolio();
  const [showModal, setShowModal] = useState(false);
  const [projectName, setProjectName] = useState(defaultProjectName);
  const [selectedStrategy, setSelectedStrategy] = useState<'flip' | 'hold' | 'rental' | 'development' | ''>(
    strategy || ''
  );
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Extract financial metrics
  const financialMetrics = useMemo(() => {
    const location = projectData.property?.location || projectData.location || 'Bali';
    const totalInvestment =
      projectData.totalProjectCost || projectData.loanAmount || projectData.monthlyRentalIncome || 0;
    const roi = projectData.result?.rate || projectData.roiFlip || projectData.roiHold || 0;
    const avgCashFlow = projectData.netCashFlow || projectData.monthlyPayment || 0;
    const breakEvenMonths = projectData.breakEvenMonths || 0;

    return { location, totalInvestment, roi, avgCashFlow, breakEvenMonths };
  }, [projectData]);

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

    setIsSaving(true);
    try {
      addProject({
        projectName: projectName,
        calculatorId: calculatorType,
        strategy: (selectedStrategy as 'flip' | 'hold' | 'rental' | 'development') || undefined,
        data: projectData,
        location: financialMetrics.location,
        totalInvestment: financialMetrics.totalInvestment,
        roi: financialMetrics.roi,
        avgCashFlow: financialMetrics.avgCashFlow,
        breakEvenMonths: financialMetrics.breakEvenMonths,
        investmentScore: scoreComponents.investmentScore,
        roi_score: scoreComponents.roi_score,
        cashflow_score: scoreComponents.cashflow_score,
        stability_score: scoreComponents.stability_score,
        location_score: scoreComponents.location_score,
        currency: projectData.currency || 'IDR',
        status: 'active',
      });

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

              {/* Score Preview */}
              {scoreComponents.investmentScore > 0 && (
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
