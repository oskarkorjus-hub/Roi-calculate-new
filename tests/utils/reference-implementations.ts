/**
 * Reference Implementations for Financial Calculations
 * Uses financejs library as the source of truth for validation
 *
 * These implementations serve as the "expected" values for testing
 * our custom calculation logic.
 */

// @ts-ignore - financejs doesn't have proper types
import Finance from 'financejs';

const finance = new Finance();

// ============================================================================
// CORE FINANCIAL FUNCTIONS - Reference Implementations
// ============================================================================

/**
 * Reference NPV calculation using financejs
 * NPV = Σ(CF_t / (1 + r)^t)
 */
export function referenceNPV(rate: number, cashFlows: number[]): number {
  return finance.NPV(rate, ...cashFlows);
}

/**
 * Reference IRR calculation using financejs
 * Finds rate where NPV = 0
 */
export function referenceIRR(cashFlows: number[]): number {
  try {
    return finance.IRR(...cashFlows);
  } catch {
    return NaN;
  }
}

/**
 * Reference PMT (loan payment) calculation using financejs
 * PMT = P × [r(1+r)^n] / [(1+r)^n - 1]
 */
export function referencePMT(
  rate: number,      // Annual interest rate (e.g., 0.06 for 6%)
  periods: number,   // Total number of payment periods
  principal: number, // Loan amount
  futureValue: number = 0,
  type: number = 0   // 0 = end of period, 1 = beginning
): number {
  return finance.PMT(rate, periods, principal, futureValue, type);
}

/**
 * Reference FV (future value) calculation
 * FV = PV × (1 + r)^n
 */
export function referenceFV(
  rate: number,
  periods: number,
  payment: number,
  presentValue: number = 0,
  type: number = 0
): number {
  return finance.FV(rate, periods, payment, presentValue, type);
}

/**
 * Reference PV (present value) calculation
 * PV = FV / (1 + r)^n
 */
export function referencePV(
  rate: number,
  periods: number,
  payment: number,
  futureValue: number = 0,
  type: number = 0
): number {
  return finance.PV(rate, periods, payment, futureValue, type);
}

/**
 * Reference CAGR calculation
 * CAGR = (End Value / Beginning Value)^(1/n) - 1
 */
export function referenceCAGR(
  beginningValue: number,
  endingValue: number,
  periods: number
): number {
  return finance.CAGR(beginningValue, endingValue, periods);
}

// ============================================================================
// MORTGAGE & AMORTIZATION - Reference Implementations
// ============================================================================

export interface AmortizationEntry {
  period: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
}

/**
 * Reference amortization schedule calculation
 */
export function referenceAmortization(
  principal: number,
  annualRate: number,
  termMonths: number
): {
  monthlyPayment: number;
  totalPayment: number;
  totalInterest: number;
  schedule: AmortizationEntry[];
} {
  const monthlyRate = annualRate / 12;

  // Calculate monthly payment
  const monthlyPayment = principal *
    (monthlyRate * Math.pow(1 + monthlyRate, termMonths)) /
    (Math.pow(1 + monthlyRate, termMonths) - 1);

  // Generate amortization schedule
  const schedule: AmortizationEntry[] = [];
  let balance = principal;

  for (let period = 1; period <= termMonths; period++) {
    const interest = balance * monthlyRate;
    const principalPayment = monthlyPayment - interest;
    balance = Math.max(0, balance - principalPayment);

    schedule.push({
      period,
      payment: monthlyPayment,
      principal: principalPayment,
      interest,
      balance,
    });
  }

  const totalPayment = monthlyPayment * termMonths;
  const totalInterest = totalPayment - principal;

  return {
    monthlyPayment,
    totalPayment,
    totalInterest,
    schedule,
  };
}

// ============================================================================
// REAL ESTATE SPECIFIC - Reference Implementations
// ============================================================================

/**
 * Reference Cap Rate calculation
 * Cap Rate = (Net Operating Income / Property Value) × 100
 */
export function referenceCapRate(noi: number, propertyValue: number): number {
  if (propertyValue === 0) return 0;
  return (noi / propertyValue) * 100;
}

/**
 * Reference Cash-on-Cash Return calculation
 * CoC = (Annual Cash Flow / Total Cash Invested) × 100
 */
export function referenceCashOnCash(
  annualCashFlow: number,
  totalCashInvested: number
): number {
  if (totalCashInvested === 0) return 0;
  return (annualCashFlow / totalCashInvested) * 100;
}

/**
 * Reference Gross Rent Multiplier calculation
 * GRM = Property Price / Gross Annual Rent
 */
export function referenceGRM(
  propertyPrice: number,
  grossAnnualRent: number
): number {
  if (grossAnnualRent === 0) return 0;
  return propertyPrice / grossAnnualRent;
}

/**
 * Reference Debt Service Coverage Ratio calculation
 * DSCR = Net Operating Income / Annual Debt Service
 */
export function referenceDSCR(
  noi: number,
  annualDebtService: number
): number {
  if (annualDebtService === 0) return Infinity;
  return noi / annualDebtService;
}

/**
 * Reference Loan-to-Value calculation
 * LTV = (Loan Amount / Property Value) × 100
 */
export function referenceLTV(
  loanAmount: number,
  propertyValue: number
): number {
  if (propertyValue === 0) return 0;
  return (loanAmount / propertyValue) * 100;
}

// ============================================================================
// XIRR - Manual Reference Implementation (Newton-Raphson)
// ============================================================================

export interface DateCashFlow {
  date: Date;
  amount: number;
}

/**
 * Reference XIRR calculation using Newton-Raphson
 * This is a known-good implementation for validation
 */
export function referenceXIRR(
  cashFlows: DateCashFlow[],
  guess: number = 0.1,
  maxIterations: number = 100,
  tolerance: number = 1e-7
): number {
  if (cashFlows.length < 2) return 0;

  // Validate: need both inflows and outflows
  const hasInflow = cashFlows.some(cf => cf.amount > 0);
  const hasOutflow = cashFlows.some(cf => cf.amount < 0);
  if (!hasInflow || !hasOutflow) return 0;

  // Sort by date
  const sorted = [...cashFlows].sort(
    (a, b) => a.date.getTime() - b.date.getTime()
  );
  const firstDate = sorted[0].date;

  // Convert dates to year fractions
  const yearFractions = sorted.map(cf =>
    (cf.date.getTime() - firstDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000)
  );
  const amounts = sorted.map(cf => cf.amount);

  let rate = guess;

  for (let i = 0; i < maxIterations; i++) {
    let npv = 0;
    let derivativeNpv = 0;

    for (let j = 0; j < amounts.length; j++) {
      const t = yearFractions[j];
      const discountFactor = Math.pow(1 + rate, -t);
      npv += amounts[j] * discountFactor;
      derivativeNpv -= t * amounts[j] * Math.pow(1 + rate, -t - 1);
    }

    if (Math.abs(npv) < tolerance) {
      return rate;
    }

    if (derivativeNpv === 0) {
      return NaN;
    }

    const newRate = rate - npv / derivativeNpv;

    if (Math.abs(newRate - rate) < tolerance) {
      return newRate;
    }

    rate = newRate;

    // Prevent divergence
    if (rate < -0.99) rate = -0.99;
    if (rate > 10) rate = 10;
  }

  return rate;
}

// ============================================================================
// INVESTMENT SCORING - Reference Implementation
// ============================================================================

/**
 * Reference ROI Score calculation (0-5 points)
 */
export function referenceRoiScore(roiPercentage: number): number {
  const score = roiPercentage / 20;
  return Math.min(5, Math.max(0, score));
}

/**
 * Reference Cash Flow Score calculation (0-3 points)
 */
export function referenceCashFlowScore(
  annualCashFlow: number,
  propertyValue: number
): number {
  if (propertyValue === 0) return 0;

  const cashFlowPercentage = (annualCashFlow / propertyValue) * 100;

  if (cashFlowPercentage <= 0) return 0;
  if (cashFlowPercentage >= 10) return 3;

  return (cashFlowPercentage / 10) * 3;
}

/**
 * Reference Stability Score calculation (0-2 points)
 */
export function referenceStabilityScore(breakEvenMonths: number): number {
  if (breakEvenMonths < 12) return 2;
  if (breakEvenMonths < 24) return 1.5;
  if (breakEvenMonths < 36) return 1;
  return 0.5;
}

/**
 * Reference Investment Score calculation (0-100)
 */
export function referenceInvestmentScore(
  roiPercentage: number,
  annualCashFlow: number,
  propertyValue: number,
  breakEvenMonths: number,
  locationScore: number = 0.5
): number {
  const roiScore = referenceRoiScore(roiPercentage);
  const cashFlowScore = referenceCashFlowScore(annualCashFlow, propertyValue);
  const stabilityScore = referenceStabilityScore(breakEvenMonths);

  // Weighted average: 40% ROI + 30% Cash Flow + 20% Stability + 10% Location
  const score =
    (roiScore / 5) * 40 +
    (cashFlowScore / 3) * 30 +
    (stabilityScore / 2) * 20 +
    locationScore * 10;

  return Math.round(score);
}

// ============================================================================
// TEST DATA GENERATORS
// ============================================================================

/**
 * Generate test cash flows for XIRR testing
 */
export function generateTestCashFlows(
  scenario: 'simple' | 'complex' | 'irregular' | 'negative'
): DateCashFlow[] {
  const today = new Date();

  switch (scenario) {
    case 'simple':
      // Simple investment: buy, hold 3 years, sell
      return [
        { date: today, amount: -100000 },
        { date: addMonths(today, 12), amount: 5000 },
        { date: addMonths(today, 24), amount: 5000 },
        { date: addMonths(today, 36), amount: 120000 },
      ];

    case 'complex':
      // Complex: multiple investments and returns
      return [
        { date: today, amount: -50000 },
        { date: addMonths(today, 3), amount: -30000 },
        { date: addMonths(today, 6), amount: 2000 },
        { date: addMonths(today, 12), amount: 5000 },
        { date: addMonths(today, 18), amount: 5000 },
        { date: addMonths(today, 24), amount: 5000 },
        { date: addMonths(today, 30), amount: 5000 },
        { date: addMonths(today, 36), amount: 100000 },
      ];

    case 'irregular':
      // Irregular payment schedule
      return [
        { date: today, amount: -75000 },
        { date: addDays(today, 45), amount: -25000 },
        { date: addDays(today, 120), amount: 3000 },
        { date: addDays(today, 200), amount: 3500 },
        { date: addDays(today, 400), amount: 4000 },
        { date: addDays(today, 600), amount: 110000 },
      ];

    case 'negative':
      // Negative return scenario
      return [
        { date: today, amount: -100000 },
        { date: addMonths(today, 12), amount: 2000 },
        { date: addMonths(today, 24), amount: 2000 },
        { date: addMonths(today, 36), amount: 80000 },
      ];

    default:
      return [];
  }
}

function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Generate rental property test scenarios
 */
export function generateRentalScenario(
  type: 'excellent' | 'good' | 'moderate' | 'poor'
): {
  propertyValue: number;
  annualRent: number;
  annualExpenses: number;
  downPayment: number;
  loanAmount: number;
  annualDebtService: number;
} {
  switch (type) {
    case 'excellent':
      return {
        propertyValue: 500000,
        annualRent: 60000,
        annualExpenses: 15000,
        downPayment: 100000,
        loanAmount: 400000,
        annualDebtService: 28000,
      };

    case 'good':
      return {
        propertyValue: 400000,
        annualRent: 36000,
        annualExpenses: 10000,
        downPayment: 80000,
        loanAmount: 320000,
        annualDebtService: 22000,
      };

    case 'moderate':
      return {
        propertyValue: 350000,
        annualRent: 24000,
        annualExpenses: 8000,
        downPayment: 70000,
        loanAmount: 280000,
        annualDebtService: 20000,
      };

    case 'poor':
      return {
        propertyValue: 300000,
        annualRent: 18000,
        annualExpenses: 9000,
        downPayment: 60000,
        loanAmount: 240000,
        annualDebtService: 18000,
      };
  }
}

// ============================================================================
// TOLERANCE HELPERS
// ============================================================================

/**
 * Check if two numbers are approximately equal within a tolerance
 */
export function approximatelyEqual(
  actual: number,
  expected: number,
  tolerancePercent: number = 0.01 // 1% default tolerance
): boolean {
  if (expected === 0) {
    return Math.abs(actual) < 0.0001;
  }
  const diff = Math.abs(actual - expected) / Math.abs(expected);
  return diff <= tolerancePercent;
}

/**
 * Calculate percentage difference between two values
 */
export function percentDifference(actual: number, expected: number): number {
  if (expected === 0) {
    return actual === 0 ? 0 : Infinity;
  }
  return ((actual - expected) / Math.abs(expected)) * 100;
}
