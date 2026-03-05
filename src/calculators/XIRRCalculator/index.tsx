import { useState, useCallback, useRef, useEffect } from 'react';
import { useInvestment } from '../../hooks/useInvestment';
import { useArchivedDrafts, type ArchivedDraft } from '../../hooks/useArchivedDrafts';
import {
  PropertyDetails,
  PaymentTerms,
  ExitStrategySection,
  ProjectForecast,
} from '../../components';
import { Toast } from '../../components/ui/Toast';
import { DraftSelector } from '../../components/ui/DraftSelector';
import { ComparisonView } from '../../components/ui/ComparisonView';
import { CalculatorToolbar } from '../../components/ui/CalculatorToolbar';
import { useAuth } from '../../lib/auth-context';
import { useComparison } from '../../lib/comparison-context';
import { ReportView } from './components/ReportView';
import type { InvestmentData } from '../../types/investment';

export function XIRRCalculator() {
  const {
    data,
    result,
    currency,
    symbol,
    rate,
    ratesLoading,
    ratesError,
    ratesSource,
    refreshRates,
    formatDisplay,
    formatAbbrev,
    idrToDisplay,
    displayToIdr,
    updateProperty,
    updatePriceFromDisplay,
    updateExitPriceFromDisplay,
    updatePayment,
    regenerateSchedule,
    updateScheduleEntry,
    updateExit,
    reset,
    saveDraft,
    loadDraft,
  } = useInvestment();

  const [currentDraftName, setCurrentDraftName] = useState<string | undefined>();
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const { user } = useAuth();
  const { getCount } = useComparison();
  const [showReportView, setShowReportView] = useState(false);
  const [showComparison, setShowComparison] = useState(false);

  // Pass user ID to isolate drafts per user
  const { drafts, saveDraft: saveArchivedDraft, deleteDraft } = useArchivedDrafts<InvestmentData>('xirr', user?.id);

  const handleReset = useCallback(() => {
    if (showResetConfirm) {
      reset();
      setCurrentDraftName(undefined);
      setShowResetConfirm(false);
      setToast({ message: 'All values reset', type: 'success' });
    } else {
      setShowResetConfirm(true);
      setTimeout(() => setShowResetConfirm(false), 3000);
    }
  }, [showResetConfirm, reset]);

  const handleSelectDraft = useCallback((draft: ArchivedDraft<InvestmentData>) => {
    loadDraft(draft.data);
    setCurrentDraftName(draft.name);
    setToast({ message: `Loaded "${draft.name}"`, type: 'success' });
  }, [loadDraft]);

  const handleSaveArchive = useCallback((name: string) => {
    saveArchivedDraft(name, data);
    setCurrentDraftName(name);
    setToast({ message: `Saved "${name}"`, type: 'success' });
  }, [saveArchivedDraft, data]);

  const handleDeleteDraft = useCallback((id: string) => {
    deleteDraft(id);
    setToast({ message: 'Draft deleted', type: 'success' });
  }, [deleteDraft]);

  const dataRef = useRef(data);
  const resultRef = useRef(result);
  const currencyRef = useRef(currency);
  const symbolRef = useRef(symbol);
  const rateRef = useRef(rate);
  const formatDisplayRef = useRef(formatDisplay);
  const formatAbbrevRef = useRef(formatAbbrev);

  useEffect(() => {
    dataRef.current = data;
    resultRef.current = result;
    currencyRef.current = currency;
    symbolRef.current = symbol;
    rateRef.current = rate;
    formatDisplayRef.current = formatDisplay;
    formatAbbrevRef.current = formatAbbrev;
  }, [data, result, currency, symbol, rate, formatDisplay, formatAbbrev]);

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const handleExportPDF = useCallback(() => {
    setShowReportView(true);
  }, []);

  const handleLoginFromReport = useCallback(() => {
    // Auth context auto-updates on login
  }, []);

  const displayPrice = idrToDisplay(data.property.totalPrice);
  const displayExitPrice = idrToDisplay(data.exit.projectedSalesPrice);

  // Validate that down payment + scheduled payments = total price
  const downPaymentIDR = data.property.totalPrice * (data.payment.downPaymentPercent / 100);
  const scheduleTotalIDR = data.payment.schedule.reduce((sum, entry) => sum + entry.amount, 0);
  const totalPaymentsIDR = downPaymentIDR + scheduleTotalIDR;
  const isPaymentValid = data.property.totalPrice === 0 || Math.abs(totalPaymentsIDR - data.property.totalPrice) < 1;

  // Show Report View
  if (showReportView) {
    return (
      <ReportView
        data={data}
        result={result}
        currency={currency}
        symbol={symbol}
        rate={rate}
        formatDisplay={formatDisplay}
        formatAbbrev={formatAbbrev}
        user={user}
        onLogin={handleLoginFromReport}
        onBack={() => setShowReportView(false)}
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
        <header className="mb-6 sm:mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-600 to-violet-800 flex items-center justify-center shadow-lg shadow-violet-900/30">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">XIRR Calculator</h1>
                <p className="text-zinc-500 text-sm mt-1">
                  Calculate your real estate investment returns based on purchase price, payment schedule, and projected sale price
                </p>
              </div>
            </div>

          <div className="flex items-center gap-3 flex-wrap">
            {currency !== 'IDR' && (
              <div className="flex items-center gap-3 bg-zinc-800 px-4 py-2 rounded-lg border border-zinc-700">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                  1 {currency} = {rate.toLocaleString()} IDR
                </span>
                {ratesLoading ? (
                  <span className="text-yellow-500 text-xs">(loading...)</span>
                ) : ratesError ? (
                  <span className="text-red-400 text-xs" title={ratesError}>!</span>
                ) : (
                  <span className="text-emerald-400 text-xs" title={`Source: ${ratesSource}`}>✓</span>
                )}
                <button
                  onClick={refreshRates}
                  className="text-emerald-400 hover:text-emerald-300 text-xs underline"
                  disabled={ratesLoading}
                >
                  Refresh
                </button>
              </div>
            )}

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
              currency={currency}
              onCurrencyChange={(c) => updateProperty('currency', c as 'IDR' | 'USD' | 'AUD' | 'EUR' | 'GBP' | 'INR' | 'CNY' | 'AED' | 'RUB')}
              onReset={handleReset}
              onOpenReport={() => setShowReportView(true)}
              calculatorType="xirr"
              projectData={{ ...data, result }}
              projectName={data.property.projectName || 'XIRR Project'}
              showResetConfirm={showResetConfirm}
            />
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-9 space-y-6">
            <PropertyDetails
              data={data.property}
              symbol={symbol}
              displayPrice={displayPrice}
              onUpdate={updateProperty}
              onPriceChange={updatePriceFromDisplay}
            />

            <PaymentTerms
              data={data.payment}
              totalPriceIDR={data.property.totalPrice}
              symbol={symbol}
              formatDisplay={formatDisplay}
              displayToIdr={displayToIdr}
              idrToDisplay={idrToDisplay}
              onUpdate={updatePayment}
              onRegenerateSchedule={regenerateSchedule}
              onUpdateScheduleEntry={updateScheduleEntry}
              isPaymentValid={isPaymentValid}
            />

            <ExitStrategySection
              data={data.exit}
              totalPriceIDR={data.property.totalPrice}
              displayExitPrice={displayExitPrice}
              symbol={symbol}
              handoverDate={data.property.handoverDate}
              propertySize={data.property.propertySize}
              displayToIdr={displayToIdr}
              idrToDisplay={idrToDisplay}
              onUpdate={updateExit}
              onExitPriceChange={updateExitPriceFromDisplay}
            />
          </div>

          <div className="lg:col-span-3">
            <ProjectForecast
              result={result}
              symbol={symbol}
              currency={currency}
              data={data}
              formatDisplay={formatDisplay}
              onExportPDF={handleExportPDF}
              onComparisonSaved={() => setToast({ message: 'Saved to comparison!', type: 'success' })}
              isPaymentValid={isPaymentValid}
            />

            {/* View Comparisons Button */}
            {getCount('xirr') > 0 && (
              <button
                onClick={() => setShowComparison(true)}
                className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-3 bg-zinc-800 rounded-xl text-sm font-bold text-zinc-300 hover:bg-zinc-700 border border-zinc-700 transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>View Comparisons ({getCount('xirr')})</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Comparison Modal */}
      <ComparisonView
        isOpen={showComparison}
        onClose={() => setShowComparison(false)}
        calculatorType="xirr"
      />
    </div>
  );
}

export default XIRRCalculator;
