import { useState, useCallback } from 'react';
import { AdvancedSection } from '../../components/AdvancedSection';
import { SaveToPortfolioButton } from '../../components/SaveToPortfolioButton';
import { Toast } from '../../components/ui/Toast';
import { CashFlowInputs } from './components/CashFlowInputs';
import { IRRResults } from './components/IRRResults';

interface CashFlow {
  year: number;
  amount: number;
}

interface IRRResult {
  irr: number;
  npv: number;
  paybackPeriod: number;
  totalCashFlow: number;
  totalInvested: number;
  mirr?: number;
  profitabilityIndex?: number;
}

const INITIAL_CASH_FLOWS: CashFlow[] = [
  { year: 0, amount: -1_000_000 },
  { year: 1, amount: 200_000 },
  { year: 2, amount: 250_000 },
  { year: 3, amount: 300_000 },
  { year: 4, amount: 350_000 },
  { year: 5, amount: 400_000 },
];

export function IRRCalculator() {
  const [currency] = useState<'IDR' | 'USD' | 'AUD' | 'EUR'>('USD');
  const [discountRate, setDiscountRate] = useState(10);
  const [cashFlows, setCashFlows] = useState<CashFlow[]>(INITIAL_CASH_FLOWS);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [reinvestmentRate, setReinvestmentRate] = useState(10);
  const [alternativeDiscountRate, setAlternativeDiscountRate] = useState(12);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const calculateNPV = (flows: CashFlow[], rate: number) => {
    return flows.reduce((npv, cf) => {
      return npv + cf.amount / Math.pow(1 + rate / 100, cf.year);
    }, 0);
  };

  const calculateIRR = (flows: CashFlow[]): number => {
    let rate = 0.1;
    const maxIterations = 100;
    const tolerance = 0.0001;

    for (let i = 0; i < maxIterations; i++) {
      const npv = calculateNPV(flows, rate * 100);
      const derivative = flows.reduce((sum, cf) => {
        return sum - cf.year * (cf.amount / Math.pow(1 + rate, cf.year + 1));
      }, 0);

      if (Math.abs(derivative) < tolerance) break;

      const newRate = rate - npv / derivative;
      if (Math.abs(newRate - rate) < tolerance) {
        return newRate * 100;
      }
      rate = newRate;
    }

    return rate * 100;
  };

  const calculateMIRR = (flows: CashFlow[], financeRate: number, reinvestRate: number): number => {
    const maxYear = Math.max(...flows.map(cf => cf.year));
    
    let positiveFlows = 0;
    let negativeFlows = 0;

    for (const cf of flows) {
      const discountedNegative = cf.amount < 0 
        ? cf.amount / Math.pow(1 + financeRate / 100, cf.year)
        : 0;
      const compoundedPositive = cf.amount > 0 
        ? cf.amount * Math.pow(1 + reinvestRate / 100, maxYear - cf.year)
        : 0;

      negativeFlows += discountedNegative;
      positiveFlows += compoundedPositive;
    }

    if (negativeFlows === 0) return 0;
    
    const mirr = (Math.pow(positiveFlows / Math.abs(negativeFlows), 1 / maxYear) - 1) * 100;
    return isNaN(mirr) ? 0 : mirr;
  };

  const calculateProfitabilityIndex = (flows: CashFlow[], rate: number): number => {
    let pv = 0;
    let initialInvestment = 0;

    for (const cf of flows) {
      if (cf.year === 0 && cf.amount < 0) {
        initialInvestment += Math.abs(cf.amount);
      } else {
        pv += cf.amount / Math.pow(1 + rate / 100, cf.year);
      }
    }

    return initialInvestment > 0 ? pv / initialInvestment : 0;
  };

  const irr = calculateIRR(cashFlows);
  const npv = calculateNPV(cashFlows, discountRate);
  const totalCashFlow = cashFlows.reduce((sum, cf) => sum + cf.amount, 0);
  const totalInvested = Math.abs(cashFlows.find(cf => cf.amount < 0)?.amount || 0);

  let cumulative = 0;
  let paybackPeriod = 0;
  for (const cf of cashFlows) {
    cumulative += cf.amount;
    if (cumulative >= 0) {
      paybackPeriod = cf.year;
      break;
    }
  }

  const mirr = showAdvanced ? calculateMIRR(cashFlows, discountRate, reinvestmentRate) : undefined;
  const npvAlt = showAdvanced ? calculateNPV(cashFlows, alternativeDiscountRate) : undefined;
  const profitabilityIndex = showAdvanced ? calculateProfitabilityIndex(cashFlows, discountRate) : undefined;

  const result: IRRResult = {
    irr: isNaN(irr) ? 0 : irr,
    npv,
    paybackPeriod: paybackPeriod || cashFlows[cashFlows.length - 1].year,
    totalCashFlow,
    totalInvested,
    mirr: mirr ? (isNaN(mirr) ? 0 : mirr) : undefined,
    profitabilityIndex,
  };

  const handleCashFlowChange = (index: number, field: keyof CashFlow, value: string) => {
    const newFlows = [...cashFlows];
    newFlows[index] = {
      ...newFlows[index],
      [field]: field === 'year' ? parseInt(value) : parseFloat(value) || 0,
    };
    setCashFlows(newFlows);
  };

  const handleAddCashFlow = useCallback(() => {
    const lastYear = Math.max(...cashFlows.map(cf => cf.year));
    setCashFlows([...cashFlows, { year: lastYear + 1, amount: 0 }]);
  }, [cashFlows]);

  const handleRemoveCashFlow = useCallback((index: number) => {
    if (cashFlows.length > 1) {
      setCashFlows(cashFlows.filter((_, i) => i !== index));
    }
  }, [cashFlows]);

  const handleReset = useCallback(() => {
    setCashFlows(INITIAL_CASH_FLOWS);
    setToast({ message: 'Cash flows reset', type: 'success' });
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-text-primary tracking-tight">IRR Calculator</h1>
              <p className="text-text-muted text-xs mt-1 max-w-md">
                Calculate Internal Rate of Return and NPV for your investment project
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            <button
              onClick={handleReset}
              className="px-5 py-2 rounded-lg text-xs font-bold shadow-sm bg-red-500 text-white hover:bg-red-600 transition-all active:scale-95"
            >
              Reset
            </button>

            <SaveToPortfolioButton
              calculatorType="irr"
              projectData={{
                projectName: "IRR Analysis",
                totalInvestment: result.totalInvested,
                roi: result.irr,
                breakEvenMonths: Math.round(result.paybackPeriod * 12),
                currency: currency,
              }}
              defaultProjectName="IRR Analysis"
            />
          </div>
        </header>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-9 space-y-6">
            {/* Description */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">IRR (Internal Rate of Return)</h2>
              <p className="text-sm text-gray-600 mb-3">
                IRR is the discount rate that makes NPV = 0. It represents the annualized return on your investment.
              </p>
              <p className="text-sm text-gray-600">
                NPV at {discountRate}% discount rate shows the present value of all future cash flows.
              </p>
            </div>

            {/* Settings */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Discount Rate for NPV Calculation (%)
                </label>
                <input
                  type="number"
                  value={discountRate}
                  onChange={(e) => setDiscountRate(parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-2">Typically 8-12%. Higher = more conservative.</p>
              </div>

              <AdvancedSection
                title="Advanced Assumptions"
                icon="🔧"
                isOpen={showAdvanced}
                onToggle={() => setShowAdvanced(!showAdvanced)}
                description="MIRR and sensitivity analysis"
              >
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reinvestment Rate for MIRR (%)
                    </label>
                    <input
                      type="number"
                      step={0.1}
                      value={reinvestmentRate}
                      onChange={(e) => setReinvestmentRate(parseFloat(e.target.value) || 0)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">Rate at which positive cash flows are reinvested</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Alternative Discount Rate (%)
                    </label>
                    <input
                      type="number"
                      step={0.1}
                      value={alternativeDiscountRate}
                      onChange={(e) => setAlternativeDiscountRate(parseFloat(e.target.value) || 0)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">Scenario analysis with different discount rate</p>
                  </div>
                </div>
              </AdvancedSection>
            </div>

            {/* Cash Flows */}
            <CashFlowInputs
              cashFlows={cashFlows}
              onCashFlowChange={handleCashFlowChange}
              onAddCashFlow={handleAddCashFlow}
              onRemoveCashFlow={handleRemoveCashFlow}
              currency={currency}
            />
          </div>

          <div className="lg:col-span-3">
            <div className="bg-indigo-50 rounded-lg shadow-sm p-6 border border-indigo-200 sticky top-24">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Results</h3>
              <IRRResults
                result={result}
                discountRate={discountRate}
                alternativeDiscountRate={alternativeDiscountRate}
                npvAlt={npvAlt}
                showAdvanced={showAdvanced}
                reinvestmentRate={reinvestmentRate}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default IRRCalculator;
