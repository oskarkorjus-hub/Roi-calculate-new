import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { useInvestment } from '../../hooks/useInvestment';
import { useArchivedDrafts, type ArchivedDraft } from '../../hooks/useArchivedDrafts';
import { useAutoSave } from '../../hooks/useAutoSave';
import {
  PropertyDetails,
  PaymentTerms,
  ExitStrategySection,
  ProjectForecast,
} from '../../components';
import { Toast } from '../../components/ui/Toast';
import { DraftSelector } from '../../components/ui/DraftSelector';
import { ComparisonButtons } from '../../components/ui/ComparisonButtons';
import { CalculatorToolbar } from '../../components/ui/CalculatorToolbar';
import { ReportPreviewModal } from '../../components/ui/ReportPreviewModal';
import { useAuth } from '../../lib/auth-context';
import type { XIRRComparisonData } from '../../lib/comparison-types';
import { generateXIRRReport } from '../../hooks/useReportGenerator';
import { generatePaymentSchedule } from '../../utils/xirr';
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
  const [showReportModal, setShowReportModal] = useState(false);

  // Pass user ID to isolate drafts per user
  const { drafts, saveDraft: saveArchivedDraft, deleteDraft } = useArchivedDrafts<InvestmentData>('xirr', user?.id);

  // Auto-save for "Continue Where You Left Off"
  useAutoSave('xirr', data, (d) => ({
    propertyPrice: d.property?.totalPrice || 0,
    exitPrice: d.exit?.projectedSalesPrice || 0,
    currency: currency,
  }));

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

  // Generate cash flow rows for report
  const cashFlowRows = useMemo(() => {
    const schedule = generatePaymentSchedule(data);
    const outflows = schedule.filter(cf => cf.amount < 0);
    const inflows = schedule.filter(cf => cf.amount > 0);
    const bookingFeeIDR = data.payment.bookingFee;
    const bookingFeeDate = data.payment.bookingFeeDate ? new Date(data.payment.bookingFeeDate) : null;
    const closingCosts = data.exit.projectedSalesPrice * (data.exit.closingCostPercent / 100);
    let downPaymentFound = false;
    let installmentNum = 0;

    const rows: { date: Date; label: string; amount: number }[] = [];

    outflows.forEach((cf) => {
      const cfAmount = Math.abs(cf.amount);
      const isBookingFee = bookingFeeIDR > 0 &&
        Math.abs(cfAmount - bookingFeeIDR) < 1 &&
        (!bookingFeeDate || cf.date.toDateString() === bookingFeeDate.toDateString());

      let label: string;
      if (isBookingFee && !downPaymentFound) {
        label = 'Booking Fee';
      } else if (!downPaymentFound) {
        label = 'Down Payment';
        downPaymentFound = true;
      } else {
        installmentNum++;
        label = `Installment ${installmentNum}`;
      }
      rows.push({ date: cf.date, label, amount: cf.amount });
    });

    inflows.forEach((cf) => {
      rows.push({ date: cf.date, label: 'Sale Proceeds', amount: data.exit.projectedSalesPrice - closingCosts });
    });

    return rows;
  }, [data]);

  // Generate report data for modal
  const reportData = useMemo(() => {
    return generateXIRRReport(
      {
        projectName: data.property.projectName,
        location: data.property.location,
        totalPrice: data.property.totalPrice / rate,
        propertySize: data.property.propertySize,
        purchaseDate: data.property.purchaseDate,
        handoverDate: data.property.handoverDate,
        downPaymentPercent: data.payment.downPaymentPercent,
        installmentMonths: data.payment.installmentMonths,
        projectedSalesPrice: data.exit.projectedSalesPrice / rate,
        closingCostPercent: data.exit.closingCostPercent,
        saleDate: data.exit.saleDate,
      },
      {
        rate: result.rate,
        totalInvested: result.totalInvested / rate,
        netProfit: result.netProfit / rate,
        holdPeriodMonths: result.holdPeriodMonths,
      },
      cashFlowRows.map(row => ({
        ...row,
        amount: row.amount / rate,
      })),
      symbol
    );
  }, [data, result, cashFlowRows, rate, symbol]);

  const handleExportPDF = useCallback(() => {
    setShowReportModal(true);
  }, []);

  const displayPrice = idrToDisplay(data.property.totalPrice);
  const displayExitPrice = idrToDisplay(data.exit.projectedSalesPrice);

  // Validate that down payment + scheduled payments = total price
  const downPaymentIDR = data.property.totalPrice * (data.payment.downPaymentPercent / 100);
  const scheduleTotalIDR = data.payment.schedule.reduce((sum, entry) => sum + entry.amount, 0);
  const totalPaymentsIDR = downPaymentIDR + scheduleTotalIDR;
  const isPaymentValid = data.property.totalPrice === 0 || Math.abs(totalPaymentsIDR - data.property.totalPrice) < 1;


  return (
    <div className="text-white w-full overflow-hidden">
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
              onOpenReport={() => setShowReportModal(true)}
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
              formatDisplay={formatDisplay}
            />

            {/* Comparison Buttons */}
            <ComparisonButtons
              calculatorType="xirr"
              getComparisonData={() => {
                const xirrValue = result.rate >= -1 && result.rate <= 100 ? result.rate : 0;
                const rating = xirrValue >= 0.15 ? { grade: 'A+', label: 'Excellent' }
                  : xirrValue >= 0.12 ? { grade: 'A', label: 'Great' }
                  : xirrValue >= 0.08 ? { grade: 'B+', label: 'Good' }
                  : xirrValue >= 0.05 ? { grade: 'B', label: 'Fair' }
                  : { grade: 'C', label: 'Low' };

                return {
                  calculatorType: 'xirr' as const,
                  label: data.property.projectName || 'XIRR Calc',
                  currency,
                  totalPrice: data.property.totalPrice / rate,
                  projectedSalesPrice: data.exit.projectedSalesPrice / rate,
                  location: data.property.location,
                  xirr: xirrValue,
                  totalInvested: result.totalInvested / rate,
                  netProfit: result.netProfit / rate,
                  holdPeriodMonths: result.holdPeriodMonths,
                  investmentRating: rating,
                } as Omit<XIRRComparisonData, 'timestamp'>;
              }}
            />
          </div>
        </div>
      </div>

      {/* Report Preview Modal */}
      <ReportPreviewModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        reportData={reportData}
      />
    </div>
  );
}

export default XIRRCalculator;
