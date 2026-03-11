import { useState, useCallback, useMemo } from 'react';
import { Toast } from '../../components/ui/Toast';
import { DraftSelector } from '../../components/ui/DraftSelector';
import { CalculatorToolbar } from '../../components/ui/CalculatorToolbar';
import { ReportPreviewModal } from '../../components/ui/ReportPreviewModal';
import { ComparisonButtons } from '../../components/ui/ComparisonButtons';
import { generateBRRRRReport } from '../../hooks/useReportGenerator';
import { useArchivedDrafts, type ArchivedDraft } from '../../hooks/useArchivedDrafts';
import { useAutoSave, loadAutoSave } from '../../hooks/useAutoSave';
import { useAuth } from '../../lib/auth-context';
import { useNotifications } from '../../lib/notification-context';
import { BRRRRInputs } from './components/BRRRRInputs';
import { BRRRRResults } from './components/BRRRRResults';
import type { BRRRRComparisonData } from '../../lib/comparison-types';

type CurrencyType = 'IDR' | 'USD' | 'AUD' | 'EUR' | 'GBP';

const symbols: Record<CurrencyType, string> = {
  IDR: 'Rp',
  USD: '$',
  AUD: 'A$',
  EUR: '€',
  GBP: '£',
};

export interface BRRRRInputState {
  purchasePrice: number;
  rehabCost: number;
  holdingCosts: number;
  afterRepairValue: number;
  refinanceLTV: number;
  refinanceRate: number;
  loanTerm: number;
  monthlyRent: number;
  operatingExpensesPct: number;
  currency: CurrencyType;
}

export interface BRRRRResult {
  totalInvestment: number;
  refinanceLoanAmount: number;
  cashLeftInDeal: number;
  monthlyMortgagePayment: number;
  monthlyNOI: number;
  monthlyCashFlow: number;
  annualCashFlow: number;
  cashOnCashROI: number;
  equity: number;
}

const INITIAL_INPUTS: BRRRRInputState = {
  purchasePrice: 0,
  rehabCost: 0,
  holdingCosts: 0,
  afterRepairValue: 0,
  refinanceLTV: 75,
  refinanceRate: 7,
  loanTerm: 30,
  monthlyRent: 0,
  operatingExpensesPct: 40,
  currency: 'USD',
};

export function BRRRRCalculator() {
  const { user } = useAuth();
  const { addNotification } = useNotifications();

  const [inputs, setInputs] = useState<BRRRRInputState>(() => {
    const saved = loadAutoSave<BRRRRInputState>('brrrr');
    return saved?.data || INITIAL_INPUTS;
  });

  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [currentDraftName, setCurrentDraftName] = useState<string | undefined>();

  const { drafts, saveDraft: saveArchivedDraft, deleteDraft } = useArchivedDrafts<BRRRRInputState>('brrrr', user?.id);

  // Auto-save
  useAutoSave('brrrr', inputs, (data) => ({
    purchasePrice: data.purchasePrice,
    rehabCost: data.rehabCost,
    afterRepairValue: data.afterRepairValue,
    monthlyRent: data.monthlyRent,
    currency: data.currency,
  }));

  const handleSelectDraft = useCallback((draft: ArchivedDraft<BRRRRInputState>) => {
    setInputs(draft.data);
    setCurrentDraftName(draft.name);
    setToast({ message: `Loaded "${draft.name}"`, type: 'success' });
  }, []);

  const handleSaveArchive = useCallback((name: string) => {
    saveArchivedDraft(name, inputs);
    setCurrentDraftName(name);
    setToast({ message: `Saved "${name}"`, type: 'success' });
    addNotification({
      title: 'Draft Saved',
      message: `"${name}" saved to BRRRR drafts`,
      type: 'success',
      icon: 'save',
    });
  }, [saveArchivedDraft, inputs, addNotification]);

  const handleDeleteDraft = useCallback((id: string) => {
    deleteDraft(id);
    setToast({ message: 'Draft deleted', type: 'success' });
  }, [deleteDraft]);

  // Calculate results
  const result = useMemo((): BRRRRResult => {
    const {
      purchasePrice,
      rehabCost,
      holdingCosts,
      afterRepairValue,
      refinanceLTV,
      refinanceRate,
      loanTerm,
      monthlyRent,
      operatingExpensesPct,
    } = inputs;

    // Total investment = Purchase + Rehab + Holding
    const totalInvestment = purchasePrice + rehabCost + holdingCosts;

    // Refinance loan amount = ARV * LTV%
    const refinanceLoanAmount = afterRepairValue * (refinanceLTV / 100);

    // Cash left in deal = Total Investment - Refinance Amount
    const cashLeftInDeal = Math.max(0, totalInvestment - refinanceLoanAmount);

    // Monthly mortgage payment (standard amortization formula)
    const monthlyRate = refinanceRate / 100 / 12;
    const numPayments = loanTerm * 12;
    let monthlyMortgagePayment = 0;
    if (refinanceLoanAmount > 0 && monthlyRate > 0) {
      monthlyMortgagePayment = refinanceLoanAmount *
        (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
        (Math.pow(1 + monthlyRate, numPayments) - 1);
    }

    // Monthly NOI = Rent - Operating Expenses
    const operatingExpenses = monthlyRent * (operatingExpensesPct / 100);
    const monthlyNOI = monthlyRent - operatingExpenses;

    // Monthly Cash Flow = NOI - Mortgage Payment
    const monthlyCashFlow = monthlyNOI - monthlyMortgagePayment;

    // Annual Cash Flow
    const annualCashFlow = monthlyCashFlow * 12;

    // Cash-on-Cash ROI = Annual Cash Flow / Cash Left in Deal
    const cashOnCashROI = cashLeftInDeal > 0 ? (annualCashFlow / cashLeftInDeal) * 100 :
      (annualCashFlow > 0 ? Infinity : 0);

    // Equity = ARV - Loan Amount
    const equity = afterRepairValue - refinanceLoanAmount;

    return {
      totalInvestment,
      refinanceLoanAmount,
      cashLeftInDeal,
      monthlyMortgagePayment,
      monthlyNOI,
      monthlyCashFlow,
      annualCashFlow,
      cashOnCashROI,
      equity,
    };
  }, [inputs]);

  const symbol = symbols[inputs.currency] || '$';

  // Report generation
  const reportData = useMemo(() => {
    return generateBRRRRReport(
      {
        purchasePrice: inputs.purchasePrice,
        rehabCost: inputs.rehabCost,
        holdingCosts: inputs.holdingCosts,
        afterRepairValue: inputs.afterRepairValue,
        refinanceLTV: inputs.refinanceLTV,
        refinanceRate: inputs.refinanceRate,
        loanTerm: inputs.loanTerm,
        monthlyRent: inputs.monthlyRent,
        operatingExpensesPct: inputs.operatingExpensesPct,
      },
      result,
      symbol
    );
  }, [inputs, result, symbol]);

  // Input handler
  const handleInputChange = useCallback((field: keyof BRRRRInputState, value: number | string) => {
    setInputs(prev => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  // Reset handler
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

  // Get investment rating
  const getInvestmentRating = useCallback(() => {
    const roi = result.cashOnCashROI;
    if (!isFinite(roi)) {
      return result.annualCashFlow > 0
        ? { grade: 'A+', label: 'Infinite ROI' }
        : { grade: 'N/A', label: 'No Investment' };
    }
    if (roi >= 20) return { grade: 'A+', label: 'Excellent' };
    if (roi >= 15) return { grade: 'A', label: 'Great' };
    if (roi >= 10) return { grade: 'B+', label: 'Good' };
    if (roi >= 5) return { grade: 'B', label: 'Fair' };
    if (roi >= 0) return { grade: 'C', label: 'Low' };
    return { grade: 'D', label: 'Negative' };
  }, [result]);

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
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center shadow-lg shadow-amber-900/30">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">BRRRR Calculator</h1>
              <p className="text-zinc-500 text-sm mt-1">
                Buy, Rehab, Rent, Refinance, Repeat - Calculate your cash-on-cash returns
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
              onCurrencyChange={(c) => handleInputChange('currency', c as CurrencyType)}
              onReset={handleReset}
              onOpenReport={() => setShowReportModal(true)}
              calculatorType="brrrr"
              projectData={{ ...inputs, result }}
              projectName="BRRRR Analysis"
              showResetConfirm={showResetConfirm}
            />
          </div>
        </header>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-9">
            <BRRRRInputs
              inputs={inputs}
              onInputChange={handleInputChange}
              symbol={symbol}
            />
          </div>

          <div className="lg:col-span-3">
            <div className="sticky top-20 flex flex-col gap-4">
              {/* Comparison Buttons */}
              <ComparisonButtons
                calculatorType="brrrr"
                getComparisonData={() => {
                  return {
                    calculatorType: 'brrrr' as const,
                    label: 'BRRRR Analysis',
                    currency: inputs.currency,
                    purchasePrice: inputs.purchasePrice,
                    rehabCost: inputs.rehabCost,
                    holdingCosts: inputs.holdingCosts,
                    afterRepairValue: inputs.afterRepairValue,
                    refinanceLTV: inputs.refinanceLTV,
                    refinanceRate: inputs.refinanceRate,
                    monthlyRent: inputs.monthlyRent,
                    totalInvestment: result.totalInvestment,
                    cashLeftInDeal: result.cashLeftInDeal,
                    monthlyCashFlow: result.monthlyCashFlow,
                    annualCashFlow: result.annualCashFlow,
                    cashOnCashROI: result.cashOnCashROI,
                    equity: result.equity,
                    investmentRating: getInvestmentRating(),
                  } as Omit<BRRRRComparisonData, 'timestamp'>;
                }}
              />

              {/* Results Panel */}
              <BRRRRResults
                result={result}
                symbol={symbol}
                rating={getInvestmentRating()}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BRRRRCalculator;
