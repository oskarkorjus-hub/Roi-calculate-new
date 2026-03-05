import { useState, useMemo, useEffect, useCallback } from 'react';
import { INITIAL_ASSUMPTIONS, EMPTY_ASSUMPTIONS, CURRENCIES } from './constants';
import type { CurrencyCode, Assumptions } from './types';
import { calculateProjections, calculateAverage } from './utils/calculations';
import DashboardHeader from './components/DashboardHeader';
import TopInputsPanel from './components/TopInputsPanel';
import AssumptionsPanel from './components/AssumptionsPanel';
import ProjectionsTable from './components/ProjectionsTable';
import { Toast } from '../../components/ui/Toast';
import { DraftSelector } from '../../components/ui/DraftSelector';
import { ComparisonView } from '../../components/ui/ComparisonView';
import { CalculatorToolbar } from '../../components/ui/CalculatorToolbar';
import { ReportPreviewModal } from '../../components/ui/ReportPreviewModal';
import { generateRentalROIReport } from '../../hooks/useReportGenerator';
import { useArchivedDrafts, type ArchivedDraft } from '../../hooks/useArchivedDrafts';
import { useAuth } from '../../lib/auth-context';

const DRAFT_STORAGE_KEY = 'rental_roi_draft';

export function RentalROICalculator() {
  const { user } = useAuth();
  const [showComparison, setShowComparison] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  const [currencyCode, setCurrencyCode] = useState<CurrencyCode>(() => {
    const saved = localStorage.getItem('rental_roi_currency');
    return (saved as CurrencyCode) || 'IDR';
  });

  const currency = useMemo(() => CURRENCIES[currencyCode], [currencyCode]);

  useEffect(() => {
    localStorage.setItem('rental_roi_currency', currencyCode);
  }, [currencyCode]);

  const [assumptions, setAssumptions] = useState<Assumptions>(() => {
    try {
      const saved = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load draft:', e);
    }
    return INITIAL_ASSUMPTIONS;
  });

  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [currentDraftName, setCurrentDraftName] = useState<string | undefined>();

  // Pass user ID to isolate drafts per user
  const { drafts, saveDraft: saveArchivedDraft, deleteDraft } = useArchivedDrafts<Assumptions>('rental-roi', user?.id);

  const handleReset = useCallback(() => {
    if (showResetConfirm) {
      setAssumptions(EMPTY_ASSUMPTIONS);
      localStorage.removeItem(DRAFT_STORAGE_KEY);
      setResetKey(k => k + 1);
      setCurrentDraftName(undefined);
      setShowResetConfirm(false);
      setToast({ message: 'All values reset', type: 'success' });
    } else {
      setShowResetConfirm(true);
      setTimeout(() => setShowResetConfirm(false), 3000);
    }
  }, [showResetConfirm]);

  const handleSelectDraft = useCallback((draft: ArchivedDraft<Assumptions>) => {
    setAssumptions(draft.data);
    setCurrentDraftName(draft.name);
    setResetKey(k => k + 1);
    setToast({ message: `Loaded "${draft.name}"`, type: 'success' });
  }, []);

  const handleSaveArchive = useCallback((name: string) => {
    saveArchivedDraft(name, assumptions);
    setCurrentDraftName(name);
    setToast({ message: `Saved "${name}"`, type: 'success' });
  }, [saveArchivedDraft, assumptions]);

  const handleDeleteDraft = useCallback((id: string) => {
    deleteDraft(id);
    setToast({ message: 'Draft deleted', type: 'success' });
  }, [deleteDraft]);

  const data = useMemo(() => calculateProjections(assumptions), [assumptions]);
  const averages = useMemo(() => calculateAverage(data), [data]);

  // Generate report data for modal
  const reportData = useMemo(() => {
    return generateRentalROIReport(
      {
        initialInvestment: assumptions.initialInvestment,
        y1ADR: assumptions.y1ADR,
        y1Occupancy: assumptions.y1Occupancy,
        adrGrowth: assumptions.adrGrowth,
        incentiveFeePct: assumptions.incentiveFeePct,
        isPropertyReady: assumptions.isPropertyReady,
        propertyReadyDate: assumptions.propertyReadyDate,
      },
      data,
      {
        avgProfit: averages.takeHomeProfit,
        avgROI: averages.roiAfterManagement,
        totalRevenue: data.reduce((s, i) => s + i.totalRevenue, 0),
        totalProfit: data.reduce((s, i) => s + i.takeHomeProfit, 0),
        avgGopMargin: averages.gopMargin,
      },
      currency.symbol
    );
  }, [assumptions, data, averages, currency.symbol]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white -mx-4 md:-mx-10 lg:-mx-20 -my-8 px-6 py-8">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="max-w-[100%] mx-auto">
        <header className="mb-6 sm:mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-800 flex items-center justify-center shadow-lg shadow-indigo-900/30">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">10 Year Annualized ROI</h1>
              <p className="text-zinc-500 text-sm mt-1">
                Project your rental property returns with revenue streams, operating costs, and management fees over 10 years
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {user && (
              <DraftSelector
                drafts={drafts}
                onSelect={handleSelectDraft}
                onSave={handleSaveArchive}
                onDelete={handleDeleteDraft}
                currentName={currentDraftName}
              />
            )}

            <CalculatorToolbar
              currency={currencyCode as 'IDR' | 'USD' | 'AUD' | 'EUR' | 'GBP'}
              onCurrencyChange={(c) => setCurrencyCode(c as CurrencyCode)}
              onReset={handleReset}
              onOpenReport={() => setShowReportModal(true)}
              calculatorType="rental-roi"
              projectData={{ ...assumptions, data, averages }}
              projectName="10 Year Annualized ROI"
              showResetConfirm={showResetConfirm}
            />
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Content - Left Side */}
          <div className="lg:col-span-9 space-y-6">
            <TopInputsPanel key={resetKey} assumptions={assumptions} onChange={setAssumptions} currency={currency} />

            <AssumptionsPanel key={`assumptions-${resetKey}`} assumptions={assumptions} onChange={setAssumptions} currency={currency} />

            <ProjectionsTable data={data} avg={averages} currency={currency} />

            <div className="flex flex-col items-center justify-center pt-8 pb-20 border-t border-zinc-800 mt-12">
              <button
                className="bg-emerald-500 hover:bg-emerald-600 text-white px-10 py-5 rounded-2xl text-[13px] font-black uppercase tracking-[0.15em] shadow-xl transition-all active:scale-95 flex items-center gap-4"
                onClick={() => setShowReportModal(true)}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Preview Report</span>
              </button>
              <div className="mt-6 flex flex-col items-center gap-2.5">
                <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em] text-center max-w-md">
                  Full 10-Year Analysis with Key Metrics & Financial Projections
                </p>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                  <span className="text-[10px] text-emerald-400 font-black tracking-widest uppercase">Preview before export</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sticky Sidebar - Right Side */}
          <div className="lg:col-span-3">
            <div className="sticky top-8">
              <DashboardHeader
                data={data}
                currency={currency}
                assumptions={assumptions}
                onComparisonSaved={() => setToast({ message: 'Saved to comparison!', type: 'success' })}
                onViewComparisons={() => setShowComparison(true)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Comparison Modal */}
      <ComparisonView
        isOpen={showComparison}
        onClose={() => setShowComparison(false)}
        calculatorType="rental-roi"
      />

      {/* Report Preview Modal */}
      <ReportPreviewModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        reportData={reportData}
      />
    </div>
  );
}

export default RentalROICalculator;
