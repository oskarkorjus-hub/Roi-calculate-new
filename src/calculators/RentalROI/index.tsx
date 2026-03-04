import { useState, useMemo, useEffect, useCallback } from 'react';
import { INITIAL_ASSUMPTIONS, EMPTY_ASSUMPTIONS, CURRENCIES } from './constants';
import type { CurrencyCode, Assumptions } from './types';
import { calculateProjections, calculateAverage } from './utils/calculations';
import DashboardHeader from './components/DashboardHeader';
import TopInputsPanel from './components/TopInputsPanel';
import AssumptionsPanel from './components/AssumptionsPanel';
import ProjectionsTable from './components/ProjectionsTable';
import ReportView from './components/ReportView';
import { Toast } from '../../components/ui/Toast';
import { DraftSelector } from '../../components/ui/DraftSelector';
import { ComparisonView } from '../../components/ui/ComparisonView';
import { useArchivedDrafts, type ArchivedDraft } from '../../hooks/useArchivedDrafts';
import { useAuth } from '../../lib/auth-context';

const DRAFT_STORAGE_KEY = 'rental_roi_draft';

export function RentalROICalculator() {
  const [view, setView] = useState<'dashboard' | 'report'>('dashboard');
  const { user } = useAuth();
  const [showComparison, setShowComparison] = useState(false);

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

  const [isSaving, setIsSaving] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [currentDraftName, setCurrentDraftName] = useState<string | undefined>();

  // Pass user ID to isolate drafts per user
  const { drafts, saveDraft: saveArchivedDraft, deleteDraft } = useArchivedDrafts<Assumptions>('rental-roi', user?.id);

  const handleSaveDraft = useCallback(() => {
    setIsSaving(true);
    try {
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(assumptions));
      setTimeout(() => {
        setIsSaving(false);
        setToast({ message: 'Draft saved successfully!', type: 'success' });
      }, 300);
    } catch (e) {
      console.error('Failed to save draft:', e);
      setIsSaving(false);
      setToast({ message: 'Failed to save draft', type: 'error' });
    }
  }, [assumptions]);

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

  if (view === 'report') {
    return (
      <ReportView
        data={data}
        averages={averages}
        assumptions={assumptions}
        currency={currency}
        user={user}
        onLogin={() => {}}
        onBack={() => setView('dashboard')}
      />
    );
  }

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
        <header className="mb-8 flex flex-col xl:flex-row xl:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center text-2xl">
              🏘️
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">10 Year Annualized ROI</h1>
              <p className="text-zinc-500 text-sm mt-1">
                Project your rental property returns with revenue streams, operating costs, and management fees over 10 years
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-3 bg-zinc-800 px-4 py-2 rounded-lg border border-zinc-700">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Currency</span>
              <select
                value={currencyCode}
                onChange={(e) => setCurrencyCode(e.target.value as CurrencyCode)}
                className="bg-transparent text-white text-xs font-bold focus:outline-none cursor-pointer appearance-none pr-4"
              >
                {Object.values(CURRENCIES).map(c => (
                  <option key={c.code} value={c.code} className="bg-zinc-800 text-white">{c.symbol} {c.code}</option>
                ))}
              </select>
            </div>

            {user && (
              <DraftSelector
                drafts={drafts}
                onSelect={handleSelectDraft}
                onSave={handleSaveArchive}
                onDelete={handleDeleteDraft}
                currentName={currentDraftName}
              />
            )}

            <button
              onClick={handleReset}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                showResetConfirm
                  ? 'bg-red-500 text-white'
                  : 'bg-zinc-800 text-zinc-300 border border-zinc-700 hover:bg-zinc-700'
              }`}
            >
              {showResetConfirm ? 'Click to Confirm' : 'Reset'}
            </button>

            <button
              onClick={handleSaveDraft}
              disabled={isSaving}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-zinc-800 text-zinc-300 border border-zinc-700 hover:bg-zinc-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSaving ? (
                <>
                  <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save Draft</span>
              )}
            </button>
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
                onClick={() => setView('report')}
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
    </div>
  );
}

export default RentalROICalculator;
