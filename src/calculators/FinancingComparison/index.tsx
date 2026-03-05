import { useState, useCallback, useMemo, useEffect } from 'react';
import { Toast } from '../../components/ui/Toast';
import { UsageBadge } from '../../components/ui/UsageBadge';
import { SaveToPortfolioButton } from '../../components/SaveToPortfolioButton';
import { ReportPreviewModal } from '../../components/ui/ReportPreviewModal';
import { generateFinancingReport } from '../../hooks/useReportGenerator';
import { formatCurrency, parseDecimalInput } from '../../utils/numberParsing';
import { Tooltip } from '../../components/ui/Tooltip';
import { LoanComparisonChart } from './components/LoanComparisonChart';
import { AmortizationTable } from './components/AmortizationTable';
import { LoanCard } from './components/LoanCard';

type CurrencyType = 'IDR' | 'USD' | 'AUD' | 'EUR' | 'GBP';
type LenderType = 'bank' | 'developer' | 'private' | 'hard-money';
type PaymentSchedule = 'monthly' | 'quarterly' | 'interest-only';

export interface LoanConfig {
  id: number;
  enabled: boolean;
  name: string;
  lenderType: LenderType;
  amount: number;
  interestRate: number;
  term: number;
  originationFeePercent: number;
  prepaymentPenaltyPercent: number;
  interestOnlyPeriod: number;
  balloonPayment: number;
  paymentSchedule: PaymentSchedule;
}

export interface LoanResult {
  id: number;
  name: string;
  lenderType: LenderType;
  amount: number;
  interestRate: number;
  term: number;
  monthlyPayment: number;
  totalPayment: number;
  totalInterest: number;
  originationFee: number;
  totalCostOfBorrowing: number;
  effectiveRate: number;
  amortizationSchedule: AmortizationEntry[];
  cashFlowImpact: number;
  isWinner: boolean;
}

export interface AmortizationEntry {
  year: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
  cumulativeInterest: number;
}

interface FinancingInputs {
  propertyValue: number;
  downPaymentPercent: number;
  currency: CurrencyType;
  loans: LoanConfig[];
  showScenarios: boolean;
  refinanceYear: number;
  prepayAmount: number;
  rateIncreasePercent: number;
}

const createDefaultLoan = (id: number): LoanConfig => ({
  id,
  enabled: id === 1,
  name: id === 1 ? 'Bank Loan' : id === 2 ? 'Developer Finance' : id === 3 ? 'Private Lender' : 'Hard Money',
  lenderType: id === 1 ? 'bank' : id === 2 ? 'developer' : id === 3 ? 'private' : 'hard-money',
  amount: 0,
  interestRate: 0,
  term: 0,
  originationFeePercent: 0,
  prepaymentPenaltyPercent: 0,
  interestOnlyPeriod: 0,
  balloonPayment: 0,
  paymentSchedule: 'monthly',
});

const INITIAL_INPUTS: FinancingInputs = {
  propertyValue: 0,
  downPaymentPercent: 0,
  currency: 'IDR',
  loans: [
    createDefaultLoan(1),
    createDefaultLoan(2),
    createDefaultLoan(3),
    createDefaultLoan(4),
  ],
  showScenarios: false,
  refinanceYear: 0,
  prepayAmount: 0,
  rateIncreasePercent: 0,
};

const symbols: Record<CurrencyType, string> = {
  IDR: 'Rp',
  USD: '$',
  AUD: 'A$',
  EUR: '€',
  GBP: '£',
};

const lenderLabels: Record<LenderType, string> = {
  'bank': 'Bank',
  'developer': 'Developer',
  'private': 'Private Lender',
  'hard-money': 'Hard Money',
};

const lenderColors: Record<LenderType, string> = {
  'bank': 'emerald',
  'developer': 'cyan',
  'private': 'purple',
  'hard-money': 'orange',
};

const lenderDescriptions: Record<LenderType, string> = {
  'bank': '4-8% rates, strict requirements, 15-30 year terms. Best for long-term holds.',
  'developer': 'Often 0% during construction, then refinance to permanent. Good for new builds.',
  'private': '8-12% rates, flexible terms, faster approval. Good for value-add projects.',
  'hard-money': 'Quick funding (7-14 days), 12-15% rates. Used for flips and bridge loans.',
};

export function FinancingComparison() {
  const [inputs, setInputs] = useState<FinancingInputs>(INITIAL_INPUTS);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedLoanForAmortization, setSelectedLoanForAmortization] = useState<number>(1);

  const calculateLoans = useCallback((): LoanResult[] => {
    const { propertyValue, downPaymentPercent, loans } = inputs;
    const loanAmount = propertyValue * (1 - downPaymentPercent / 100);

    const results: LoanResult[] = loans
      .filter(loan => loan.enabled)
      .map(loan => {
        const amount = loan.amount > 0 ? loan.amount : loanAmount;
        const monthlyRate = loan.interestRate / 100 / 12;
        const numberOfPayments = loan.term * 12;

        // Calculate monthly payment (standard amortization)
        let monthlyPayment: number;
        if (loan.paymentSchedule === 'interest-only') {
          monthlyPayment = amount * monthlyRate;
        } else {
          monthlyPayment = monthlyRate > 0
            ? (amount * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments))) /
              (Math.pow(1 + monthlyRate, numberOfPayments) - 1)
            : amount / numberOfPayments;
        }

        // Handle interest-only period
        const interestOnlyPayments = loan.interestOnlyPeriod;
        const amortizingPayments = numberOfPayments - interestOnlyPayments;
        const interestOnlyMonthlyPayment = amount * monthlyRate;

        // Calculate amortization schedule
        const amortizationSchedule: AmortizationEntry[] = [];
        let balance = amount;
        let cumulativeInterest = 0;

        for (let year = 1; year <= loan.term; year++) {
          let yearlyPayment = 0;
          let yearlyPrincipal = 0;
          let yearlyInterest = 0;

          for (let month = 1; month <= 12; month++) {
            const monthNum = (year - 1) * 12 + month;
            const isInterestOnly = monthNum <= interestOnlyPayments;

            const interestPayment = balance * monthlyRate;
            let principalPayment: number;

            if (isInterestOnly) {
              principalPayment = 0;
              yearlyPayment += interestOnlyMonthlyPayment;
            } else {
              // Recalculate payment for amortizing period if needed
              const remainingPayments = numberOfPayments - monthNum + 1;
              const amortizedPayment = monthlyRate > 0
                ? (balance * (monthlyRate * Math.pow(1 + monthlyRate, remainingPayments))) /
                  (Math.pow(1 + monthlyRate, remainingPayments) - 1)
                : balance / remainingPayments;
              principalPayment = amortizedPayment - interestPayment;
              yearlyPayment += amortizedPayment;
            }

            yearlyInterest += interestPayment;
            yearlyPrincipal += principalPayment;
            balance -= principalPayment;
            cumulativeInterest += interestPayment;
          }

          // Handle balloon payment in final year
          if (year === loan.term && loan.balloonPayment > 0) {
            balance = Math.max(0, balance - loan.balloonPayment);
          }

          amortizationSchedule.push({
            year,
            payment: yearlyPayment,
            principal: yearlyPrincipal,
            interest: yearlyInterest,
            balance: Math.max(0, balance),
            cumulativeInterest,
          });
        }

        const totalPayment = amortizationSchedule.reduce((sum, entry) => sum + entry.payment, 0) +
          (loan.balloonPayment > 0 ? loan.balloonPayment : 0);
        const totalInterest = amortizationSchedule[amortizationSchedule.length - 1]?.cumulativeInterest || 0;
        const originationFee = (amount * loan.originationFeePercent) / 100;
        const totalCostOfBorrowing = totalInterest + originationFee;
        const effectiveRate = ((totalCostOfBorrowing / amount) / loan.term) * 100;

        return {
          id: loan.id,
          name: loan.name,
          lenderType: loan.lenderType,
          amount,
          interestRate: loan.interestRate,
          term: loan.term,
          monthlyPayment: loan.interestOnlyPeriod > 0 ? interestOnlyMonthlyPayment : monthlyPayment,
          totalPayment,
          totalInterest,
          originationFee,
          totalCostOfBorrowing,
          effectiveRate,
          amortizationSchedule,
          cashFlowImpact: monthlyPayment,
          isWinner: false,
        };
      });

    // Mark the winner (lowest total cost)
    if (results.length > 0) {
      const minCost = Math.min(...results.map(r => r.totalCostOfBorrowing));
      results.forEach(r => {
        r.isWinner = r.totalCostOfBorrowing === minCost;
      });
    }

    return results;
  }, [inputs]);

  const loanResults = calculateLoans();
  const symbol = symbols[inputs.currency] || 'Rp';

  // Find winner
  const winner = loanResults.find(l => l.isWinner);
  const maxCost = Math.max(...loanResults.map(l => l.totalCostOfBorrowing));
  const savingsFromWinner = winner ? maxCost - winner.totalCostOfBorrowing : 0;

  // Generate report data
  const reportData = useMemo(() => {
    return generateFinancingReport(
      {
        propertyValue: inputs.propertyValue,
        numberOfLoans: loanResults.length,
      },
      loanResults.map(l => ({
        name: l.name,
        lenderType: lenderLabels[l.lenderType],
        amount: l.amount,
        rate: l.interestRate,
        term: l.term,
        monthlyPayment: l.monthlyPayment,
        totalInterest: l.totalInterest,
        totalCost: l.totalCostOfBorrowing,
      })),
      {
        name: winner?.name || '',
        savings: savingsFromWinner,
      },
      symbol
    );
  }, [inputs.propertyValue, loanResults, winner, savingsFromWinner, symbol]);

  const handleInputChange = (field: keyof FinancingInputs, value: string | number | boolean) => {
    setInputs(prev => ({
      ...prev,
      [field]: typeof value === 'string' && field !== 'currency'
        ? parseDecimalInput(value) || 0
        : value,
    }));
  };

  const handleLoanChange = (loanId: number, field: keyof LoanConfig, value: string | number | boolean) => {
    setInputs(prev => ({
      ...prev,
      loans: prev.loans.map(loan =>
        loan.id === loanId
          ? {
              ...loan,
              [field]: typeof value === 'string' && !['name', 'lenderType', 'paymentSchedule'].includes(field)
                ? parseDecimalInput(value) || 0
                : value,
            }
          : loan
      ),
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

  const enabledLoans = inputs.loans.filter(l => l.enabled);

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
        <header className="mb-6 sm:mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-600 to-cyan-800 flex items-center justify-center shadow-lg shadow-cyan-900/30">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Financing Comparison</h1>
              <p className="text-zinc-500 text-sm mt-1">
                Compare up to 4 loan options side-by-side with detailed analysis
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <UsageBadge />

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
              </select>
            </div>

            <button
              onClick={handleReset}
              className={`px-3 sm:px-4 py-3 min-h-[44px] rounded-lg text-xs sm:text-sm font-medium transition-all ${
                showResetConfirm
                  ? 'bg-red-500 text-white'
                  : 'bg-zinc-800 text-zinc-300 border border-zinc-700 hover:bg-zinc-700'
              }`}
            >
              {showResetConfirm ? 'Click to Confirm' : 'Reset'}
            </button>

            <button
              onClick={handleSaveDraft}
              className="px-3 sm:px-4 py-3 min-h-[44px] rounded-lg text-xs sm:text-sm font-medium bg-zinc-800 text-zinc-300 border border-zinc-700 hover:bg-zinc-700 transition-all"
            >
              Save Draft
            </button>

            <button
              onClick={() => setShowReportModal(true)}
              className="px-3 sm:px-4 py-3 min-h-[44px] rounded-lg text-xs sm:text-sm font-medium bg-cyan-600 text-white hover:bg-cyan-700 transition-all flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              PDF Report
            </button>

            <SaveToPortfolioButton
              calculatorType="financing"
              projectData={{
                ...inputs,
                results: loanResults,
              }}
              defaultProjectName="Financing Comparison"
            />
          </div>
        </header>

        {/* Property Value Section */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6 mb-8">
          <div className="mb-6 flex items-center border-b border-zinc-800 pb-4">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-cyan-400">home</span>
              <h2 className="text-xl font-bold text-white">Property & Down Payment</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <InputField
              label="Property Value"
              value={inputs.propertyValue}
              onChange={(v) => handleInputChange('propertyValue', v)}
              prefix={symbol}
              tooltip="Total purchase price of the property"
            />

            <InputField
              label="Down Payment"
              value={inputs.downPaymentPercent}
              onChange={(v) => handleInputChange('downPaymentPercent', v)}
              suffix="%"
              tooltip="Percentage of property value paid upfront"
            />

            <div className="bg-zinc-800 rounded-xl p-4 border border-zinc-700">
              <p className="text-xs text-zinc-400 uppercase tracking-wider mb-1">Loan Amount</p>
              <p className="text-2xl font-bold text-cyan-400">
                {symbol} {formatCurrency(inputs.propertyValue * (1 - inputs.downPaymentPercent / 100), inputs.currency)}
              </p>
              <p className="text-[10px] text-zinc-500 mt-1">
                {100 - inputs.downPaymentPercent}% of property value
              </p>
            </div>
          </div>
        </div>

        {/* Loan Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {inputs.loans.map(loan => (
            <LoanCard
              key={loan.id}
              loan={loan}
              result={loanResults.find(r => r.id === loan.id)}
              symbol={symbol}
              currency={inputs.currency}
              onLoanChange={handleLoanChange}
              lenderLabels={lenderLabels}
              lenderDescriptions={lenderDescriptions}
            />
          ))}
        </div>

        {/* Comparison Section */}
        {loanResults.length > 0 && (
          <>
            {/* Winner Banner */}
            {winner && loanResults.length > 1 && (
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-6 mb-8">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                      <span className="text-3xl">🏆</span>
                    </div>
                    <div>
                      <p className="text-xs text-emerald-400 uppercase tracking-wider mb-1">Best Option</p>
                      <h3 className="text-2xl font-bold text-white">{winner.name}</h3>
                      <p className="text-sm text-zinc-400">{lenderLabels[winner.lenderType]}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-zinc-400 mb-1">Potential Savings</p>
                    <p className="text-3xl font-bold text-emerald-400">
                      {symbol} {formatCurrency(savingsFromWinner, inputs.currency)}
                    </p>
                    <p className="text-xs text-zinc-500">vs highest cost option</p>
                  </div>
                </div>
              </div>
            )}

            {/* Comparison Charts */}
            <LoanComparisonChart
              loanResults={loanResults}
              symbol={symbol}
              currency={inputs.currency}
            />

            {/* Amortization Table */}
            <div className="mt-8">
              <div className="flex items-center gap-4 mb-4">
                <h3 className="text-lg font-bold text-white">Amortization Schedule</h3>
                <select
                  value={selectedLoanForAmortization}
                  onChange={(e) => setSelectedLoanForAmortization(Number(e.target.value))}
                  className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white"
                >
                  {enabledLoans.map(loan => (
                    <option key={loan.id} value={loan.id}>{loan.name}</option>
                  ))}
                </select>
              </div>
              <AmortizationTable
                result={loanResults.find(r => r.id === selectedLoanForAmortization)}
                symbol={symbol}
                currency={inputs.currency}
              />
            </div>

            {/* Risk Warnings */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
              {loanResults.some(l => inputs.loans.find(loan => loan.id === l.id)?.interestOnlyPeriod > 0) && (
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-amber-400">⚠️</span>
                    <h4 className="font-bold text-sm text-amber-400">Interest-Only Warning</h4>
                  </div>
                  <p className="text-xs text-zinc-300">
                    Interest-only periods create balloon risk. Ensure you have a plan to refinance or pay down principal before the amortizing period begins.
                  </p>
                </div>
              )}

              {loanResults.some(l => inputs.loans.find(loan => loan.id === l.id)?.balloonPayment > 0) && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-red-400">⚠️</span>
                    <h4 className="font-bold text-sm text-red-400">Balloon Payment Warning</h4>
                  </div>
                  <p className="text-xs text-zinc-300">
                    Balloon payments require a large final payment. Make sure you can refinance or sell the property by the due date.
                  </p>
                </div>
              )}

              {loanResults.some(l => l.lenderType === 'hard-money') && (
                <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-orange-400">💡</span>
                    <h4 className="font-bold text-sm text-orange-400">Hard Money Tip</h4>
                  </div>
                  <p className="text-xs text-zinc-300">
                    Hard money loans are best for short-term projects (flips). High rates make them expensive for long-term holds. Plan your exit strategy carefully.
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// Input Field Component
function InputField({ label, value, onChange, prefix, suffix, tooltip }: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  prefix?: string;
  suffix?: string;
  tooltip?: string;
}) {
  const [localValue, setLocalValue] = useState(value === 0 ? '' : String(value));

  useEffect(() => {
    const currentParsed = parseDecimalInput(localValue);
    if (value !== currentParsed && !isNaN(value)) {
      setLocalValue(value === 0 ? '' : String(value));
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === '' || /^-?[0-9]*[.,]?[0-9]*$/.test(val)) {
      setLocalValue(val);
      if (val === '' || val === '-') {
        onChange(0);
      } else {
        const parsed = parseDecimalInput(val);
        if (!isNaN(parsed)) {
          onChange(parsed);
        }
      }
    }
  };

  return (
    <div className="space-y-3">
      <label className="flex items-center gap-1.5 text-sm font-medium text-zinc-400">
        {label}
        {tooltip && <Tooltip text={tooltip} />}
      </label>
      <div className="relative">
        {prefix && (
          <span className="absolute left-5 top-1/2 -translate-y-1/2 text-[13px] font-bold text-zinc-500">{prefix}</span>
        )}
        <input
          type="text"
          inputMode="decimal"
          value={localValue}
          onChange={handleChange}
          placeholder="0"
          className={`w-full bg-zinc-800 border border-zinc-700 rounded-2xl py-4 text-[16px] font-bold text-white placeholder:text-zinc-500 outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all tabular-nums ${prefix ? 'pl-12 pr-6' : suffix ? 'pl-6 pr-16' : 'px-6'}`}
        />
        {suffix && (
          <span className="absolute right-5 top-1/2 -translate-y-1/2 text-[13px] font-bold text-zinc-500">{suffix}</span>
        )}
      </div>
    </div>
  );
}

export default FinancingComparison;
