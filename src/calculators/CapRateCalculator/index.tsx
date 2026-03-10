import { useState, useCallback, useMemo } from 'react';
import { Toast } from '../../components/ui/Toast';
import { DraftSelector } from '../../components/ui/DraftSelector';
import { CalculatorToolbar } from '../../components/ui/CalculatorToolbar';
import { ReportPreviewModal } from '../../components/ui/ReportPreviewModal';
import { ComparisonButtons } from '../../components/ui/ComparisonButtons';
import { generateCapRateReport } from '../../hooks/useReportGenerator';
import { useArchivedDrafts, type ArchivedDraft } from '../../hooks/useArchivedDrafts';
import { useAuth } from '../../lib/auth-context';
import { formatCurrency, parseDecimalInput } from '../../utils/numberParsing';
import { PropertyInputs } from './components/PropertyInputs';
import { CapRateResults } from './components/CapRateResults';
import type { CapRateComparisonData } from '../../lib/comparison-types';

type CurrencyType = 'IDR' | 'USD' | 'AUD' | 'EUR' | 'GBP' | 'INR' | 'CNY' | 'AED' | 'RUB';

const symbols: Record<CurrencyType, string> = { IDR: 'Rp', USD: '$', AUD: 'A$', EUR: '€', GBP: '£', INR: '₹', CNY: '¥', AED: 'د.إ', RUB: '₽' };

interface CapRateInputs {
  propertyValue: number;
  annualNOI: number;
  currency: CurrencyType;
  showAdvanced: boolean;
  vacancyRatePercent: number;
  maintenanceReservePercent: number;
  annualPropertyTaxes: number;
  annualInsurance: number;
  annualUtilities: number;
}

interface CapRateResult {
  capRate: number;
  monthlyNOI: number;
  yearlyNOI: number;
  pricePerNOI: number;
  grossAnnualIncome: number;
  vacancyLoss: number;
  effectiveGrossIncome: number;
  annualExpenses: number;
  adjustedAnnualNOI: number;
  adjustedCapRate: number;
  adjustedMonthlyNOI: number;
}

const INITIAL_INPUTS: CapRateInputs = {
  propertyValue: 0,
  annualNOI: 0,
  currency: 'USD',
  showAdvanced: false,
  vacancyRatePercent: 0,
  maintenanceReservePercent: 0,
  annualPropertyTaxes: 0,
  annualInsurance: 0,
  annualUtilities: 0,
};

export function CapRateCalculator() {
  const { user } = useAuth();
  const [inputs, setInputs] = useState<CapRateInputs>(INITIAL_INPUTS);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [currentDraftName, setCurrentDraftName] = useState<string | undefined>();

  const { drafts, saveDraft: saveArchivedDraft, deleteDraft } = useArchivedDrafts<CapRateInputs>('cap-rate', user?.id);

  const handleSelectDraft = useCallback((draft: ArchivedDraft<CapRateInputs>) => {
    setInputs(draft.data);
    setCurrentDraftName(draft.name);
    setToast({ message: `Loaded "${draft.name}"`, type: 'success' });
  }, []);

  const handleSaveArchive = useCallback((name: string) => {
    saveArchivedDraft(name, inputs);
    setCurrentDraftName(name);
    setToast({ message: `Saved "${name}"`, type: 'success' });
  }, [saveArchivedDraft, inputs]);

  const handleDeleteDraft = useCallback((id: string) => {
    deleteDraft(id);
    setToast({ message: 'Draft deleted', type: 'success' });
  }, [deleteDraft]);

  const calculateResults = useCallback((): CapRateResult => {
    const {
      propertyValue,
      annualNOI,
      vacancyRatePercent,
      maintenanceReservePercent,
      annualPropertyTaxes,
      annualInsurance,
      annualUtilities,
    } = inputs;

    // Basic calculations (NOI as provided)
    const basicCapRate = propertyValue > 0 ? (annualNOI / propertyValue) * 100 : 0;
    const basicMonthlyNOI = annualNOI / 12;
    const basicPricePerNOI = annualNOI > 0 ? propertyValue / annualNOI : 0;

    // Advanced calculations
    // Back-calculate gross income from NOI
    const grossAnnualIncome = annualNOI / (1 - (vacancyRatePercent + maintenanceReservePercent) / 100);
    const vacancyLoss = (grossAnnualIncome * vacancyRatePercent) / 100;
    const effectiveGrossIncome = grossAnnualIncome - vacancyLoss;
    const annualExpenses = annualPropertyTaxes + annualInsurance + annualUtilities +
      (grossAnnualIncome * maintenanceReservePercent) / 100;
    const adjustedAnnualNOI = effectiveGrossIncome - annualExpenses;
    const adjustedCapRate = propertyValue > 0 ? (adjustedAnnualNOI / propertyValue) * 100 : 0;
    const adjustedMonthlyNOI = adjustedAnnualNOI / 12;

    return {
      capRate: basicCapRate,
      monthlyNOI: basicMonthlyNOI,
      yearlyNOI: annualNOI,
      pricePerNOI: basicPricePerNOI,
      grossAnnualIncome,
      vacancyLoss,
      effectiveGrossIncome,
      annualExpenses,
      adjustedAnnualNOI,
      adjustedCapRate,
      adjustedMonthlyNOI,
    };
  }, [inputs]);

  const result = calculateResults();
  const symbol = symbols[inputs.currency] || 'Rp';

  // Generate report data
  const reportData = useMemo(() => {
    return generateCapRateReport(
      {
        propertyValue: inputs.propertyValue,
        grossRentalIncome: result.grossAnnualIncome,
        vacancyRate: inputs.vacancyRatePercent,
        operatingExpenses: result.annualExpenses,
        propertyTaxes: inputs.annualPropertyTaxes,
        insurance: inputs.annualInsurance,
        maintenance: inputs.propertyValue * (inputs.maintenanceReservePercent / 100),
        utilities: inputs.annualUtilities,
      },
      {
        noi: result.yearlyNOI,
        capRate: result.capRate,
        effectiveGrossIncome: result.effectiveGrossIncome,
        totalExpenses: result.annualExpenses,
      },
      symbol
    );
  }, [inputs, result, symbol]);

  const handleInputChange = (field: keyof CapRateInputs, value: string | number | boolean) => {
    setInputs(prev => ({
      ...prev,
      [field]: field === 'currency' ? value : (typeof value === 'string' ? parseDecimalInput(value) || 0 : value),
    }));
  };

  const handleReset = useCallback(() => {
    if (showResetConfirm) {
      setInputs(INITIAL_INPUTS);
      setCurrentDraftName(undefined);
      setShowResetConfirm(false);
      setToast({ message: 'All values reset', type: 'success' });
    } else {
      setShowResetConfirm(true);
      setTimeout(() => setShowResetConfirm(false), 3000);
    }
  }, [showResetConfirm]);

  return (
    <div className="text-white w-full overflow-hidden">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <ReportPreviewModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        reportData={reportData}
      />

      <div className="max-w-[100%] mx-auto">
        {/* Header */}
        <header className="mb-6 sm:mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-600 to-teal-800 flex items-center justify-center shadow-lg shadow-teal-900/30">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Cap Rate Calculator</h1>
              <p className="text-zinc-500 text-sm mt-1">
                Calculate capitalization rate to evaluate real estate investment returns
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
              currency={inputs.currency}
              onCurrencyChange={(c) => handleInputChange('currency', c)}
              onReset={handleReset}
              onOpenReport={() => setShowReportModal(true)}
              calculatorType="cap-rate"
              projectData={{ ...inputs, result }}
              projectName="Cap Rate Analysis"
              showResetConfirm={showResetConfirm}
            />
          </div>
        </header>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-9">
            <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
              <div className="mb-6 flex items-center border-b border-zinc-800 pb-4">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-emerald-400">info</span>
                  <h2 className="text-xl font-bold text-white">Cap Rate Calculator</h2>
                </div>
              </div>
              <p className="text-sm text-zinc-400 mb-6">
                Cap Rate = Annual NOI / Property Value. Measures annual return on real estate investment.
              </p>
              <PropertyInputs
                inputs={inputs}
                onInputChange={handleInputChange}
                symbol={symbol}
              />
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="sticky top-24 flex flex-col gap-4">
              <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
                <div className="mb-4 flex items-center border-b border-zinc-800 pb-4">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-emerald-400">analytics</span>
                    <h3 className="text-lg font-bold text-white">Results</h3>
                  </div>
                </div>
                <CapRateResults
                  result={result}
                  showAdvanced={inputs.showAdvanced}
                />
              </div>

              {/* Interpretation */}
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="material-symbols-outlined text-emerald-400 text-lg">insights</span>
                  <h3 className="font-bold text-emerald-400 text-sm">Analysis</h3>
                </div>
                <ul className="space-y-1.5 text-xs text-zinc-300">
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400 mt-0.5">•</span>
                    <span><strong className="text-white">Cap Rate</strong>: {result.capRate.toFixed(2)}% annual return</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400 mt-0.5">•</span>
                    <span><strong className="text-white">Monthly</strong>: {formatCurrency(result.monthlyNOI)}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400 mt-0.5">•</span>
                    <span><strong className="text-white">Payback</strong>: {(1 / (result.capRate / 100)).toFixed(1)} years</span>
                  </li>
                </ul>
              </div>

              {/* Comparison Buttons */}
              <ComparisonButtons
                calculatorType="cap-rate"
                getComparisonData={() => {
                  const rating = result.capRate >= 10
                    ? { grade: 'A+', label: 'Excellent' }
                    : result.capRate >= 8
                    ? { grade: 'A', label: 'Great' }
                    : result.capRate >= 6
                    ? { grade: 'B+', label: 'Good' }
                    : result.capRate >= 4
                    ? { grade: 'B', label: 'Fair' }
                    : { grade: 'C', label: 'Low' };

                  return {
                    calculatorType: 'cap-rate' as const,
                    label: 'Cap Rate Analysis',
                    currency: inputs.currency,
                    propertyValue: inputs.propertyValue,
                    annualNOI: inputs.annualNOI,
                    capRate: result.capRate,
                    monthlyNOI: result.monthlyNOI,
                    investmentRating: rating,
                  } as Omit<CapRateComparisonData, 'timestamp'>;
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CapRateCalculator;
