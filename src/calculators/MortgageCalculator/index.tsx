import { useState, useCallback } from 'react';
import { Toast } from '../../components/ui/Toast';
import { SaveToPortfolioButton } from '../../components/SaveToPortfolioButton';
import { MortgageInputs } from './components/MortgageInputs';
import { MortgageResults } from './components/MortgageResults';
import { AmortizationTable } from './components/AmortizationTable';

interface MortgageInputsType {
  loanAmount: number;
  interestRate: number;
  loanTerm: number;
  currency: 'IDR' | 'USD' | 'AUD' | 'EUR';
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

const symbols = { IDR: 'Rp', USD: '$', AUD: 'A$', EUR: '€' };

export function MortgageCalculator() {
  const [inputs, setInputs] = useState<MortgageInputsType>(INITIAL_INPUTS);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

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
    <div className="min-h-screen bg-background text-text-primary selection:bg-primary-light selection:text-primary -mx-4 md:-mx-10 lg:-mx-20 -my-8 px-6 py-8">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="max-w-[100%] mx-auto">
        {/* Header */}
        <header className="mb-8 flex flex-col xl:flex-row xl:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="bg-primary p-2.5 rounded-lg shadow-sm">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 10h18M7 15h10M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-text-primary tracking-tight">Mortgage Calculator</h1>
              <p className="text-text-muted text-xs mt-1 max-w-md">
                Calculate monthly payments, total interest, and view your amortization schedule
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            <button
              onClick={handleReset}
              className={`px-5 py-2 rounded-lg text-xs font-bold shadow-sm transition-all active:scale-95 ${
                showResetConfirm
                  ? 'bg-red-600 text-white animate-pulse'
                  : 'bg-red-500 text-white hover:bg-red-600'
              }`}
            >
              {showResetConfirm ? 'Click to Confirm' : 'Reset Values'}
            </button>

            <button
              onClick={handleSaveDraft}
              className="bg-primary text-white px-5 py-2 rounded-lg text-xs font-bold shadow-sm hover:bg-primary-dark transition-all active:scale-95"
            >
              Save Draft
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
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 h-fit sticky top-24">
              <MortgageInputs
                inputs={inputs}
                onInputChange={handleInputChange}
                symbol={symbol}
              />
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="bg-indigo-50 rounded-lg shadow-sm p-6 border border-indigo-200 space-y-4">
              <h3 className="text-xl font-bold text-gray-900">Results</h3>
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

        {/* Amortization Table */}
        <div className="mt-8">
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
