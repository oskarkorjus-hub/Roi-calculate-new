/**
 * Financing Comparison Calculator Tests
 *
 * Tests the loan comparison calculations including
 * monthly payments, amortization, and total cost analysis.
 */

import { describe, it, expect } from 'vitest';
import { approximatelyEqual, referencePMT, referenceAmortization } from '../utils/reference-implementations';

// =========================================================================
// FINANCING CALCULATION FUNCTIONS (extracted from calculator logic)
// =========================================================================

interface LoanConfig {
  amount: number;
  interestRate: number;
  term: number;
  originationFeePercent: number;
  interestOnlyPeriod: number;
  balloonPayment: number;
}

interface LoanResult {
  monthlyPayment: number;
  totalPayment: number;
  totalInterest: number;
  originationFee: number;
  totalCostOfBorrowing: number;
  effectiveRate: number;
}

interface AmortizationEntry {
  year: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
  cumulativeInterest: number;
}

function calculateMonthlyPayment(principal: number, annualRate: number, termYears: number): number {
  const monthlyRate = annualRate / 100 / 12;
  const numberOfPayments = termYears * 12;

  if (monthlyRate === 0) return principal / numberOfPayments;

  return (principal * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments))) /
    (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
}

function calculateLoanResult(loan: LoanConfig): LoanResult {
  const { amount, interestRate, term, originationFeePercent, interestOnlyPeriod } = loan;
  const monthlyRate = interestRate / 100 / 12;
  const numberOfPayments = term * 12;

  // Standard amortization payment
  const monthlyPayment = monthlyRate > 0
    ? (amount * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments))) /
      (Math.pow(1 + monthlyRate, numberOfPayments) - 1)
    : amount / numberOfPayments;

  // Interest-only payment
  const interestOnlyPayment = amount * monthlyRate;

  // Calculate amortization
  let balance = amount;
  let totalPayment = 0;
  let totalInterest = 0;

  for (let month = 1; month <= numberOfPayments; month++) {
    const isInterestOnly = month <= interestOnlyPeriod;

    if (isInterestOnly) {
      totalPayment += interestOnlyPayment;
      totalInterest += balance * monthlyRate;
    } else {
      const interest = balance * monthlyRate;
      const principal = monthlyPayment - interest;
      totalPayment += monthlyPayment;
      totalInterest += interest;
      balance -= principal;
    }
  }

  const originationFee = (amount * originationFeePercent) / 100;
  const totalCostOfBorrowing = totalInterest + originationFee;
  const effectiveRate = ((totalCostOfBorrowing / amount) / term) * 100;

  return {
    monthlyPayment: interestOnlyPeriod > 0 ? interestOnlyPayment : monthlyPayment,
    totalPayment,
    totalInterest,
    originationFee,
    totalCostOfBorrowing,
    effectiveRate,
  };
}

function calculateAmortizationSchedule(loan: LoanConfig): AmortizationEntry[] {
  const { amount, interestRate, term } = loan;
  const monthlyRate = interestRate / 100 / 12;
  const numberOfPayments = term * 12;

  const monthlyPayment = monthlyRate > 0
    ? (amount * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments))) /
      (Math.pow(1 + monthlyRate, numberOfPayments) - 1)
    : amount / numberOfPayments;

  const schedule: AmortizationEntry[] = [];
  let balance = amount;
  let cumulativeInterest = 0;

  for (let year = 1; year <= term; year++) {
    let yearlyPayment = 0;
    let yearlyPrincipal = 0;
    let yearlyInterest = 0;

    for (let month = 1; month <= 12; month++) {
      if (balance <= 0) break;

      const interest = balance * monthlyRate;
      const principal = Math.min(monthlyPayment - interest, balance);

      yearlyPayment += monthlyPayment;
      yearlyInterest += interest;
      yearlyPrincipal += principal;
      balance -= principal;
      cumulativeInterest += interest;
    }

    schedule.push({
      year,
      payment: yearlyPayment,
      principal: yearlyPrincipal,
      interest: yearlyInterest,
      balance: Math.max(0, balance),
      cumulativeInterest,
    });
  }

  return schedule;
}

describe('Financing Comparison Calculator', () => {
  // =========================================================================
  // BASIC PAYMENT TESTS
  // =========================================================================

  describe('Monthly Payment Calculation', () => {
    it('should calculate monthly payment for standard loan', () => {
      const principal = 400000;
      const rate = 6.5;
      const term = 30;

      const result = calculateMonthlyPayment(principal, rate, term);

      // Compare with reference implementation (monthly rate, periods, principal)
      // Note: financejs PMT returns negative (outflow convention), so take absolute value
      const reference = Math.abs(referencePMT(rate / 100 / 12, term * 12, principal));
      expect(approximatelyEqual(result, reference, 1)).toBe(true);
    });

    it('should calculate monthly payment for 15-year loan', () => {
      const principal = 300000;
      const rate = 5.5;
      const term = 15;

      const result = calculateMonthlyPayment(principal, rate, term);
      const reference = Math.abs(referencePMT(rate / 100 / 12, term * 12, principal));

      expect(approximatelyEqual(result, reference, 1)).toBe(true);
    });

    it('should handle 0% interest rate', () => {
      const principal = 120000;
      const rate = 0;
      const term = 10;

      const result = calculateMonthlyPayment(principal, rate, term);

      // Simple division
      expect(result).toBe(1000); // 120000 / 120 months
    });

    it('should match reference for various rates', () => {
      const principal = 250000;
      const term = 25;

      for (const rate of [4, 5, 6, 7, 8, 10, 12]) {
        const result = calculateMonthlyPayment(principal, rate, term);
        const reference = Math.abs(referencePMT(rate / 100 / 12, term * 12, principal));
        expect(approximatelyEqual(result, reference, 1)).toBe(true);
      }
    });
  });

  // =========================================================================
  // TOTAL COST TESTS
  // =========================================================================

  describe('Total Cost Calculation', () => {
    it('should calculate total interest correctly', () => {
      const loan: LoanConfig = {
        amount: 300000,
        interestRate: 6,
        term: 30,
        originationFeePercent: 0,
        interestOnlyPeriod: 0,
        balloonPayment: 0,
      };

      const result = calculateLoanResult(loan);

      // 30-year loan at 6% will have significant interest
      expect(result.totalInterest).toBeGreaterThan(300000); // More than principal
      expect(result.totalPayment).toBeGreaterThan(600000);
    });

    it('should calculate origination fee correctly', () => {
      const loan: LoanConfig = {
        amount: 400000,
        interestRate: 5,
        term: 30,
        originationFeePercent: 2,
        interestOnlyPeriod: 0,
        balloonPayment: 0,
      };

      const result = calculateLoanResult(loan);

      expect(result.originationFee).toBe(8000); // 400k * 2%
    });

    it('should calculate effective rate correctly', () => {
      const loan: LoanConfig = {
        amount: 300000,
        interestRate: 6,
        term: 30,
        originationFeePercent: 1,
        interestOnlyPeriod: 0,
        balloonPayment: 0,
      };

      const result = calculateLoanResult(loan);

      // Effective rate (average annual cost as % of principal) should be positive
      // Note: This is not APR but a simplified metric
      expect(result.effectiveRate).toBeGreaterThan(0);
      expect(result.totalCostOfBorrowing).toBeGreaterThan(result.originationFee);
    });
  });

  // =========================================================================
  // AMORTIZATION TESTS
  // =========================================================================

  describe('Amortization Schedule', () => {
    it('should generate correct amortization schedule', () => {
      const loan: LoanConfig = {
        amount: 200000,
        interestRate: 5,
        term: 30,
        originationFeePercent: 0,
        interestOnlyPeriod: 0,
        balloonPayment: 0,
      };

      const schedule = calculateAmortizationSchedule(loan);

      expect(schedule.length).toBe(30);
      expect(schedule[0].balance).toBeLessThan(loan.amount);
      expect(schedule[29].balance).toBeLessThan(100); // Near zero at end
    });

    it('should have decreasing interest over time', () => {
      const loan: LoanConfig = {
        amount: 250000,
        interestRate: 6,
        term: 25,
        originationFeePercent: 0,
        interestOnlyPeriod: 0,
        balloonPayment: 0,
      };

      const schedule = calculateAmortizationSchedule(loan);

      // Interest should decrease each year
      for (let i = 1; i < schedule.length; i++) {
        expect(schedule[i].interest).toBeLessThan(schedule[i - 1].interest);
      }
    });

    it('should have increasing principal over time', () => {
      const loan: LoanConfig = {
        amount: 300000,
        interestRate: 5.5,
        term: 20,
        originationFeePercent: 0,
        interestOnlyPeriod: 0,
        balloonPayment: 0,
      };

      const schedule = calculateAmortizationSchedule(loan);

      // Principal should increase each year
      for (let i = 1; i < schedule.length; i++) {
        expect(schedule[i].principal).toBeGreaterThan(schedule[i - 1].principal);
      }
    });

    it('should match reference implementation', () => {
      const loan: LoanConfig = {
        amount: 400000,
        interestRate: 6.5,
        term: 30,
        originationFeePercent: 0,
        interestOnlyPeriod: 0,
        balloonPayment: 0,
      };

      const schedule = calculateAmortizationSchedule(loan);
      const reference = referenceAmortization(loan.amount, loan.interestRate / 100, loan.term * 12);

      // Check monthly payment matches
      expect(approximatelyEqual(
        schedule[0].payment / 12,
        reference.monthlyPayment,
        1
      )).toBe(true);
    });
  });

  // =========================================================================
  // INTEREST-ONLY TESTS
  // =========================================================================

  describe('Interest-Only Period', () => {
    it('should calculate interest-only payment correctly', () => {
      const loan: LoanConfig = {
        amount: 300000,
        interestRate: 6,
        term: 30,
        originationFeePercent: 0,
        interestOnlyPeriod: 60, // 5 years interest-only
        balloonPayment: 0,
      };

      const result = calculateLoanResult(loan);

      // Interest-only monthly: 300000 * 0.06 / 12 = 1500
      expect(approximatelyEqual(result.monthlyPayment, 1500, 1)).toBe(true);
    });

    it('should result in higher total interest', () => {
      const standardLoan: LoanConfig = {
        amount: 300000,
        interestRate: 6,
        term: 30,
        originationFeePercent: 0,
        interestOnlyPeriod: 0,
        balloonPayment: 0,
      };

      const ioLoan: LoanConfig = {
        ...standardLoan,
        interestOnlyPeriod: 60,
      };

      const standardResult = calculateLoanResult(standardLoan);
      const ioResult = calculateLoanResult(ioLoan);

      expect(ioResult.totalInterest).toBeGreaterThan(standardResult.totalInterest);
    });
  });

  // =========================================================================
  // LOAN COMPARISON TESTS
  // =========================================================================

  describe('Loan Comparison', () => {
    it('should identify lowest cost loan', () => {
      const loans: LoanConfig[] = [
        {
          amount: 300000,
          interestRate: 6,
          term: 30,
          originationFeePercent: 1,
          interestOnlyPeriod: 0,
          balloonPayment: 0,
        },
        {
          amount: 300000,
          interestRate: 5.5,
          term: 30,
          originationFeePercent: 2,
          interestOnlyPeriod: 0,
          balloonPayment: 0,
        },
        {
          amount: 300000,
          interestRate: 7,
          term: 30,
          originationFeePercent: 0,
          interestOnlyPeriod: 0,
          balloonPayment: 0,
        },
      ];

      const results = loans.map(l => calculateLoanResult(l));
      const minCost = Math.min(...results.map(r => r.totalCostOfBorrowing));
      const bestLoan = results.findIndex(r => r.totalCostOfBorrowing === minCost);

      // The 5.5% loan should be best despite higher origination
      expect(bestLoan).toBe(1);
    });

    it('should calculate savings between loans', () => {
      const cheapLoan: LoanConfig = {
        amount: 300000,
        interestRate: 5,
        term: 30,
        originationFeePercent: 1,
        interestOnlyPeriod: 0,
        balloonPayment: 0,
      };

      const expensiveLoan: LoanConfig = {
        amount: 300000,
        interestRate: 7,
        term: 30,
        originationFeePercent: 0,
        interestOnlyPeriod: 0,
        balloonPayment: 0,
      };

      const cheapResult = calculateLoanResult(cheapLoan);
      const expensiveResult = calculateLoanResult(expensiveLoan);
      const savings = expensiveResult.totalCostOfBorrowing - cheapResult.totalCostOfBorrowing;

      // 2% rate difference over 30 years should save a lot
      expect(savings).toBeGreaterThan(100000);
    });
  });

  // =========================================================================
  // LENDER TYPE SCENARIOS
  // =========================================================================

  describe('Lender Type Scenarios', () => {
    it('should analyze bank loan', () => {
      const bankLoan: LoanConfig = {
        amount: 400000,
        interestRate: 6.5,
        term: 30,
        originationFeePercent: 1,
        interestOnlyPeriod: 0,
        balloonPayment: 0,
      };

      const result = calculateLoanResult(bankLoan);

      expect(result.monthlyPayment).toBeLessThan(3000);
      expect(result.effectiveRate).toBeLessThan(8);
    });

    it('should analyze hard money loan', () => {
      const hardMoney: LoanConfig = {
        amount: 300000,
        interestRate: 12,
        term: 2,
        originationFeePercent: 3,
        interestOnlyPeriod: 24, // Full IO
        balloonPayment: 300000,
      };

      const result = calculateLoanResult(hardMoney);

      // Interest-only: 300k * 12% / 12 = 3000
      expect(approximatelyEqual(result.monthlyPayment, 3000, 10)).toBe(true);
    });

    it('should analyze developer financing', () => {
      const devFinancing: LoanConfig = {
        amount: 250000,
        interestRate: 0, // 0% during construction
        term: 2,
        originationFeePercent: 0,
        interestOnlyPeriod: 0,
        balloonPayment: 0,
      };

      const result = calculateLoanResult(devFinancing);

      expect(result.totalInterest).toBe(0);
      expect(result.monthlyPayment).toBe(250000 / 24);
    });
  });

  // =========================================================================
  // EDGE CASES
  // =========================================================================

  describe('Edge Cases', () => {
    it('should handle very small loan', () => {
      const loan: LoanConfig = {
        amount: 10000,
        interestRate: 5,
        term: 5,
        originationFeePercent: 1,
        interestOnlyPeriod: 0,
        balloonPayment: 0,
      };

      const result = calculateLoanResult(loan);

      expect(result.monthlyPayment).toBeGreaterThan(0);
      expect(result.totalInterest).toBeLessThan(loan.amount);
    });

    it('should handle very large loan', () => {
      const loan: LoanConfig = {
        amount: 10000000, // $10M
        interestRate: 4,
        term: 30,
        originationFeePercent: 0.5,
        interestOnlyPeriod: 0,
        balloonPayment: 0,
      };

      const result = calculateLoanResult(loan);

      expect(result.monthlyPayment).toBeGreaterThan(40000);
      expect(typeof result.totalCostOfBorrowing).toBe('number');
    });

    it('should handle short term loan', () => {
      const loan: LoanConfig = {
        amount: 100000,
        interestRate: 8,
        term: 1,
        originationFeePercent: 2,
        interestOnlyPeriod: 0,
        balloonPayment: 0,
      };

      const result = calculateLoanResult(loan);
      const schedule = calculateAmortizationSchedule(loan);

      expect(schedule.length).toBe(1);
      expect(schedule[0].balance).toBeLessThan(100);
    });
  });

  // =========================================================================
  // VALIDATION REPORT
  // =========================================================================

  describe('Validation Summary', () => {
    it('should generate loan comparison report', () => {
      const loans = [
        { name: 'Bank Loan', config: { amount: 300000, interestRate: 6.5, term: 30, originationFeePercent: 1, interestOnlyPeriod: 0, balloonPayment: 0 } },
        { name: 'Credit Union', config: { amount: 300000, interestRate: 5.75, term: 30, originationFeePercent: 0.5, interestOnlyPeriod: 0, balloonPayment: 0 } },
        { name: 'Private Lender', config: { amount: 300000, interestRate: 9, term: 15, originationFeePercent: 2, interestOnlyPeriod: 0, balloonPayment: 0 } },
        { name: 'Hard Money', config: { amount: 300000, interestRate: 12, term: 2, originationFeePercent: 3, interestOnlyPeriod: 24, balloonPayment: 0 } },
      ];

      const results = loans.map(l => ({
        Name: l.name,
        Rate: `${l.config.interestRate}%`,
        Term: `${l.config.term}yr`,
        ...calculateLoanResult(l.config),
      }));

      console.log('\n========== FINANCING COMPARISON VALIDATION ==========');
      console.table(results.map(r => ({
        Loan: r.Name,
        Rate: r.Rate,
        Term: r.Term,
        'Monthly Pmt': `$${r.monthlyPayment.toFixed(0)}`,
        'Total Interest': `$${r.totalInterest.toLocaleString()}`,
        'Total Cost': `$${r.totalCostOfBorrowing.toLocaleString()}`,
        'Eff Rate': `${r.effectiveRate.toFixed(2)}%`,
      })));

      // Credit Union should be best for long-term
      const costs = results.map(r => r.totalCostOfBorrowing);
      expect(costs[1]).toBeLessThan(costs[0]); // Credit Union < Bank
    });
  });
});
