import { useState, useCallback, useMemo } from 'react';
import { Toast } from '../../components/ui/Toast';
import { DraftSelector } from '../../components/ui/DraftSelector';
import { CalculatorToolbar } from '../../components/ui/CalculatorToolbar';
import { ReportPreviewModal } from '../../components/ui/ReportPreviewModal';
import { ComparisonButtons } from '../../components/ui/ComparisonButtons';
import { generateMortgageReport } from '../../hooks/useReportGenerator';
import { useArchivedDrafts, type ArchivedDraft } from '../../hooks/useArchivedDrafts';
import { useAutoSave } from '../../hooks/useAutoSave';
import { useAuth } from '../../lib/auth-context';
import { parseDecimalInput } from '../../utils/numberParsing';
import { MortgageInputs } from './components/MortgageInputs';
import { MortgageResults } from './components/MortgageResults';
import { AmortizationTable } from './components/AmortizationTable';
import type { MortgageComparisonData } from '../../lib/comparison-types';

type CurrencyType = 'IDR' | 'USD' | 'AUD' | 'EUR' | 'GBP' | 'INR' | 'CNY' | 'AED' | 'RUB';

interface MortgageInputsType {
  loanAmount: number;
  interestRate: number;
  loanTerm: number;
  currency: CurrencyType;
  showAdvanced: boolean;
  originationFeePercent: number;
  propertyTaxRate: number;
  homeInsuranceAnnual: number;
  pmiRequired: boolean;
  pmiRate: number;
  hoaFeesMonthly: number;
}

interface MortgageResult {
  monthlyPayment: number;
  totalPayment: number;
  totalInterest: number;
  principal: number;
  originationFeeAmount: number;
  monthlyPropertyTax: number;
  monthlyInsurance: number;
  monthlyPMI: number;
  monthlyHOA: number;
  totalMonthlyPayment: number;
  totalMonthlyPaymentWithTax: number;
  totalCostOfBorrowing: number;
  amortizationSchedule: Array<{
    month: number;
    payment: number;
    principal: number;
    interest: number;
    originationFee: number;
    propertyTax: number;
    insurance: number;
    pmi: number;
    hoa: number;
    totalPayment: number;
    balance: number;
  }>;
}

const INITIAL_INPUTS: MortgageInputsType = {
  loanAmount: 0,
  interestRate: 0,
  loanTerm: 0,
  currency: 'IDR',
  showAdvanced: false,
  originationFeePercent: 0,
  propertyTaxRate: 0,
  homeInsuranceAnnual: 0,
  pmiRequired: false,
  pmiRate: 0,
  hoaFeesMonthly: 0,
};

const symbols: Record<CurrencyType, string> = { IDR: 'Rp', USD: '$', AUD: 'A$', EUR: '€', GBP: '£', INR: '₹', CNY: '¥', AED: 'د.إ', RUB: '₽' };

export function MortgageCalculator() {
  const { user } = useAuth();
  const [inputs, setInputs] = useState<MortgageInputsType>(INITIAL_INPUTS);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [currentDraftName, setCurrentDraftName] = useState<string | undefined>();

  const { drafts, saveDraft: saveArchivedDraft, deleteDraft } = useArchivedDrafts<MortgageInputsType>('mortgage', user?.id);

  // Auto-save for "Continue Where You Left Off"
  useAutoSave('mortgage', inputs, (data) => ({
    loanAmount: data.loanAmount,
    interestRate: data.interestRate,
    loanTerm: data.loanTerm,
    currency: data.currency,
  }));

  const handleSelectDraft = useCallback((draft: ArchivedDraft<MortgageInputsType>) => {
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

  const calculateMortgage = useCallback((): MortgageResult => {
    const {
      loanAmount,
      interestRate,
      loanTerm,
      originationFeePercent,
      propertyTaxRate,
      homeInsuranceAnnual,
      pmiRequired,
      pmiRate,
      hoaFeesMonthly,
    } = inputs;

    const monthlyRate = interestRate / 100 / 12;
    const numberOfPayments = loanTerm * 12;

    // Base mortgage calculation
    const monthlyPayment =
      (loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments))) /
      (Math.pow(1 + monthlyRate, numberOfPayments) - 1);

    const totalPayment = monthlyPayment * numberOfPayments;
    const totalInterest = totalPayment - loanAmount;

    // Advanced calculations
    const originationFeeAmount = (loanAmount * originationFeePercent) / 100;
    const monthlyPropertyTax = (loanAmount * propertyTaxRate / 100) / 12;
    const monthlyInsurance = homeInsuranceAnnual / 12;
    const monthlyPMI = pmiRequired ? (loanAmount * pmiRate / 100) / 12 : 0;
    const totalMonthlyPayment = monthlyPayment + monthlyPropertyTax + monthlyInsurance + monthlyPMI + hoaFeesMonthly;
    const totalMonthlyPaymentWithTax = totalMonthlyPayment;
    const totalCostOfBorrowing = totalInterest + originationFeeAmount + (monthlyPropertyTax * numberOfPayments) +
      (monthlyInsurance * numberOfPayments) + (monthlyPMI * numberOfPayments) + (hoaFeesMonthly * numberOfPayments);

    // Generate amortization schedule
    let balance = loanAmount;
    const schedule: MortgageResult['amortizationSchedule'] = [];

    for (let month = 1; month <= numberOfPayments; month++) {
      const interestPayment = balance * monthlyRate;
      const principalPayment = monthlyPayment - interestPayment;
      balance -= principalPayment;

      // Only store every 12th month for display (yearly summary)
      if (month % 12 === 0) {
        schedule.push({
          month,
          payment: monthlyPayment,
          principal: principalPayment,
          interest: interestPayment,
          originationFee: originationFeeAmount / numberOfPayments,
          propertyTax: monthlyPropertyTax,
          insurance: monthlyInsurance,
          pmi: monthlyPMI,
          hoa: hoaFeesMonthly,
          totalPayment: totalMonthlyPayment,
          balance: Math.max(0, balance),
        });
      }
    }

    return {
      monthlyPayment: isFinite(monthlyPayment) ? monthlyPayment : 0,
      totalPayment,
      totalInterest,
      principal: loanAmount,
      originationFeeAmount,
      monthlyPropertyTax,
      monthlyInsurance,
      monthlyPMI,
      monthlyHOA: hoaFeesMonthly,
      totalMonthlyPayment,
      totalMonthlyPaymentWithTax,
      totalCostOfBorrowing,
      amortizationSchedule: schedule,
    };
  }, [inputs]);

  const result = calculateMortgage();
  const symbol = symbols[inputs.currency] || 'Rp';

  // Generate report data for PDF export
  const reportData = useMemo(() => {
    return generateMortgageReport(inputs, result, symbol);
  }, [inputs, result, symbol]);

  const handleInputChange = (field: keyof MortgageInputsType, value: string | number | boolean) => {
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
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-800 flex items-center justify-center shadow-lg shadow-emerald-900/30">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Mortgage Calculator</h1>
              <p className="text-zinc-500 text-sm mt-1">
                Calculate monthly payments, total interest, and view your amortization schedule
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
              calculatorType="mortgage"
              projectData={{ ...inputs, result }}
              projectName="Mortgage Calculation"
              showResetConfirm={showResetConfirm}
            />
          </div>
        </header>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-9 space-y-6">
            <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
              <MortgageInputs
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
                <MortgageResults
                  result={result}
                  currency={inputs.currency}
                  symbol={symbol}
                  loanTerm={inputs.loanTerm}
                  showAdvanced={inputs.showAdvanced}
                  pmiRequired={inputs.pmiRequired}
                  hoaFeesMonthly={inputs.hoaFeesMonthly}
                />

                {/* Comparison Buttons */}
                <ComparisonButtons
                  calculatorType="mortgage"
                  getComparisonData={() => {
                    const rating = result.totalInterest <= result.principal * 0.3
                      ? { grade: 'A+', label: 'Excellent' }
                      : result.totalInterest <= result.principal * 0.5
                      ? { grade: 'A', label: 'Great' }
                      : result.totalInterest <= result.principal * 0.7
                      ? { grade: 'B+', label: 'Good' }
                      : result.totalInterest <= result.principal
                      ? { grade: 'B', label: 'Fair' }
                      : { grade: 'C', label: 'High Cost' };

                    return {
                      calculatorType: 'mortgage' as const,
                      label: 'Mortgage Calc',
                      currency: inputs.currency,
                      loanAmount: inputs.loanAmount,
                      interestRate: inputs.interestRate,
                      loanTerm: inputs.loanTerm,
                      monthlyPayment: result.monthlyPayment,
                      totalPayment: result.totalPayment,
                      totalInterest: result.totalInterest,
                      totalMonthlyPayment: result.totalMonthlyPayment,
                      investmentRating: rating,
                    } as Omit<MortgageComparisonData, 'timestamp'>;
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Amortization Table */}
        <div className="mt-6">
          <AmortizationTable
            schedule={result.amortizationSchedule}
            currency={inputs.currency}
            symbol={symbol}
            showAdvanced={inputs.showAdvanced}
            pmiRequired={inputs.pmiRequired}
            hoaFeesMonthly={inputs.hoaFeesMonthly}
          />
        </div>
      </div>
    </div>
  );
}

export default MortgageCalculator;
