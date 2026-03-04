import { useState, useCallback, useMemo } from 'react';
import { Toast } from '../../components/ui/Toast';
import { SaveToPortfolioButton } from '../../components/SaveToPortfolioButton';
import { ReportPreviewModal } from '../../components/ui/ReportPreviewModal';
import { generateMortgageReport } from '../../hooks/useReportGenerator';
import { MortgageInputs } from './components/MortgageInputs';
import { MortgageResults } from './components/MortgageResults';
import { AmortizationTable } from './components/AmortizationTable';

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
  loanAmount: 500000000,
  interestRate: 6.5,
  loanTerm: 20,
  currency: 'IDR',
  showAdvanced: false,
  originationFeePercent: 1,
  propertyTaxRate: 1.2,
  homeInsuranceAnnual: 50000000,
  pmiRequired: false,
  pmiRate: 0.5,
  hoaFeesMonthly: 0,
};

const symbols: Record<CurrencyType, string> = { IDR: 'Rp', USD: '$', AUD: 'A$', EUR: '€', GBP: '£', INR: '₹', CNY: '¥', AED: 'د.إ', RUB: '₽' };

export function MortgageCalculator() {
  const [inputs, setInputs] = useState<MortgageInputsType>(INITIAL_INPUTS);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

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
  const symbol = symbols[inputs.currency];

  // Generate report data for PDF export
  const reportData = useMemo(() => {
    return generateMortgageReport(inputs, result, symbol);
  }, [inputs, result, symbol]);

  const handleInputChange = (field: keyof MortgageInputsType, value: string | number | boolean) => {
    setInputs(prev => ({
      ...prev,
      [field]: typeof value === 'string' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleReset = useCallback(() => {
    if (showResetConfirm) {
      setInputs(INITIAL_INPUTS);
      setShowResetConfirm(false);
      setToast({ message: 'All values reset', type: 'success' });
    } else {
      setShowResetConfirm(true);
      setTimeout(() => setShowResetConfirm(false), 3000);
    }
  }, [showResetConfirm]);

  const handleSaveDraft = useCallback(() => {
    setToast({ message: 'Draft saved successfully!', type: 'success' });
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white -mx-4 md:-mx-10 lg:-mx-20 -my-8 px-6 py-8">
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
        <header className="mb-8 flex flex-col xl:flex-row xl:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center text-2xl">
              🏦
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Mortgage Calculator</h1>
              <p className="text-zinc-500 text-sm mt-1">
                Calculate monthly payments, total interest, and view your amortization schedule
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center bg-zinc-800 px-4 py-2 rounded-lg border border-zinc-700">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mr-3">Currency</span>
              <select
                value={inputs.currency}
                onChange={(e) => handleInputChange('currency', e.target.value as CurrencyType)}
                className="bg-transparent text-white text-xs font-bold focus:outline-none cursor-pointer"
              >
                <option value="IDR" className="bg-zinc-800 text-white">Rp IDR</option>
                <option value="USD" className="bg-zinc-800 text-white">$ USD</option>
                <option value="EUR" className="bg-zinc-800 text-white">€ EUR</option>
                <option value="AUD" className="bg-zinc-800 text-white">A$ AUD</option>
                <option value="GBP" className="bg-zinc-800 text-white">£ GBP</option>
                <option value="INR" className="bg-zinc-800 text-white">₹ INR</option>
                <option value="CNY" className="bg-zinc-800 text-white">¥ CNY</option>
                <option value="AED" className="bg-zinc-800 text-white">د.إ AED</option>
                <option value="RUB" className="bg-zinc-800 text-white">₽ RUB</option>
              </select>
            </div>

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
              className="px-4 py-2 rounded-lg text-sm font-medium bg-zinc-800 text-zinc-300 border border-zinc-700 hover:bg-zinc-700 transition-all"
            >
              Save Draft
            </button>

            <button
              onClick={() => setShowReportModal(true)}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-cyan-600 text-white hover:bg-cyan-700 transition-all flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              PDF Report
            </button>

            <SaveToPortfolioButton
              calculatorType="mortgage"
              projectData={{
                ...inputs,
                result,
              }}
              defaultProjectName="Mortgage Calculation"
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
