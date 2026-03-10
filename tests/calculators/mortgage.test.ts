/**
 * Mortgage Calculator Tests
 *
 * Tests mortgage payment calculations, amortization schedules,
 * and total interest calculations against reference implementations.
 */

import { describe, it, expect } from 'vitest';
import {
  referenceAmortization,
  referencePMT,
  approximatelyEqual,
} from '../utils/reference-implementations';

// ============================================================================
// MORTGAGE CALCULATION FUNCTIONS (inline for testing)
// These mirror the calculations in MortgageCalculator/index.tsx
// ============================================================================

function calculateMonthlyPayment(
  principal: number,
  annualRate: number,
  termMonths: number
): number {
  const monthlyRate = annualRate / 12;

  if (monthlyRate === 0) {
    return principal / termMonths;
  }

  return principal *
    (monthlyRate * Math.pow(1 + monthlyRate, termMonths)) /
    (Math.pow(1 + monthlyRate, termMonths) - 1);
}

function calculateTotalInterest(
  principal: number,
  monthlyPayment: number,
  termMonths: number
): number {
  return (monthlyPayment * termMonths) - principal;
}

function generateAmortizationSchedule(
  principal: number,
  annualRate: number,
  termMonths: number
): Array<{
  period: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
}> {
  const monthlyRate = annualRate / 12;
  const monthlyPayment = calculateMonthlyPayment(principal, annualRate, termMonths);

  const schedule = [];
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

  return schedule;
}

// ============================================================================
// TESTS
// ============================================================================

describe('Mortgage Calculator', () => {
  // =========================================================================
  // BASIC MONTHLY PAYMENT TESTS
  // =========================================================================

  describe('Monthly Payment Calculation', () => {
    it('should calculate correct monthly payment for standard 30-year mortgage', () => {
      const principal = 400000;
      const annualRate = 0.065; // 6.5%
      const termMonths = 360; // 30 years

      const result = calculateMonthlyPayment(principal, annualRate, termMonths);
      const reference = referenceAmortization(principal, annualRate, termMonths);

      console.log(`30-year mortgage - Result: $${result.toFixed(2)}, Reference: $${reference.monthlyPayment.toFixed(2)}`);

      expect(approximatelyEqual(result, reference.monthlyPayment, 0.001)).toBe(true);
    });

    it('should calculate correct monthly payment for 15-year mortgage', () => {
      const principal = 300000;
      const annualRate = 0.055; // 5.5%
      const termMonths = 180; // 15 years

      const result = calculateMonthlyPayment(principal, annualRate, termMonths);
      const reference = referenceAmortization(principal, annualRate, termMonths);

      console.log(`15-year mortgage - Result: $${result.toFixed(2)}, Reference: $${reference.monthlyPayment.toFixed(2)}`);

      expect(approximatelyEqual(result, reference.monthlyPayment, 0.001)).toBe(true);
    });

    it('should calculate correct monthly payment for 5-year loan', () => {
      const principal = 50000;
      const annualRate = 0.08; // 8%
      const termMonths = 60; // 5 years

      const result = calculateMonthlyPayment(principal, annualRate, termMonths);
      const reference = referenceAmortization(principal, annualRate, termMonths);

      console.log(`5-year loan - Result: $${result.toFixed(2)}, Reference: $${reference.monthlyPayment.toFixed(2)}`);

      expect(approximatelyEqual(result, reference.monthlyPayment, 0.001)).toBe(true);
    });

    it('should handle 0% interest rate', () => {
      const principal = 120000;
      const annualRate = 0;
      const termMonths = 120;

      const result = calculateMonthlyPayment(principal, annualRate, termMonths);

      // With 0% interest, payment should be principal / months
      expect(result).toBe(1000);
    });

    it('should handle very high interest rates', () => {
      const principal = 100000;
      const annualRate = 0.20; // 20%
      const termMonths = 60;

      const result = calculateMonthlyPayment(principal, annualRate, termMonths);
      const reference = referenceAmortization(principal, annualRate, termMonths);

      expect(approximatelyEqual(result, reference.monthlyPayment, 0.001)).toBe(true);
    });
  });

  // =========================================================================
  // TOTAL INTEREST TESTS
  // =========================================================================

  describe('Total Interest Calculation', () => {
    it('should calculate correct total interest for 30-year mortgage', () => {
      const principal = 400000;
      const annualRate = 0.065;
      const termMonths = 360;

      const monthlyPayment = calculateMonthlyPayment(principal, annualRate, termMonths);
      const totalInterest = calculateTotalInterest(principal, monthlyPayment, termMonths);
      const reference = referenceAmortization(principal, annualRate, termMonths);

      console.log(`Total interest (30yr) - Result: $${totalInterest.toFixed(2)}, Reference: $${reference.totalInterest.toFixed(2)}`);

      expect(approximatelyEqual(totalInterest, reference.totalInterest, 0.001)).toBe(true);
    });

    it('should show significantly less interest for 15-year vs 30-year', () => {
      const principal = 300000;
      const annualRate = 0.06;

      const monthlyPayment30 = calculateMonthlyPayment(principal, annualRate, 360);
      const totalInterest30 = calculateTotalInterest(principal, monthlyPayment30, 360);

      const monthlyPayment15 = calculateMonthlyPayment(principal, annualRate, 180);
      const totalInterest15 = calculateTotalInterest(principal, monthlyPayment15, 180);

      console.log(`Interest comparison - 30yr: $${totalInterest30.toFixed(0)}, 15yr: $${totalInterest15.toFixed(0)}`);

      // 15-year should have significantly less total interest
      expect(totalInterest15).toBeLessThan(totalInterest30 * 0.5);
    });
  });

  // =========================================================================
  // AMORTIZATION SCHEDULE TESTS
  // =========================================================================

  describe('Amortization Schedule', () => {
    it('should generate correct schedule length', () => {
      const schedule = generateAmortizationSchedule(100000, 0.06, 360);
      expect(schedule.length).toBe(360);
    });

    it('should have final balance of 0 (or near 0)', () => {
      const schedule = generateAmortizationSchedule(200000, 0.065, 360);
      const finalBalance = schedule[schedule.length - 1].balance;

      expect(Math.abs(finalBalance)).toBeLessThan(0.01);
    });

    it('should have principal payment increasing over time', () => {
      const schedule = generateAmortizationSchedule(300000, 0.06, 360);

      const firstPrincipal = schedule[0].principal;
      const lastPrincipal = schedule[schedule.length - 1].principal;

      // Last principal payment should be larger than first
      expect(lastPrincipal).toBeGreaterThan(firstPrincipal);
    });

    it('should have interest payment decreasing over time', () => {
      const schedule = generateAmortizationSchedule(300000, 0.06, 360);

      const firstInterest = schedule[0].interest;
      const lastInterest = schedule[schedule.length - 1].interest;

      // Last interest payment should be smaller than first
      expect(lastInterest).toBeLessThan(firstInterest);
    });

    it('should match reference schedule values', () => {
      const principal = 250000;
      const annualRate = 0.055;
      const termMonths = 360;

      const schedule = generateAmortizationSchedule(principal, annualRate, termMonths);
      const reference = referenceAmortization(principal, annualRate, termMonths);

      // Check first payment
      expect(approximatelyEqual(schedule[0].payment, reference.schedule[0].payment, 0.001)).toBe(true);
      expect(approximatelyEqual(schedule[0].interest, reference.schedule[0].interest, 0.001)).toBe(true);
      expect(approximatelyEqual(schedule[0].principal, reference.schedule[0].principal, 0.001)).toBe(true);

      // Check middle payment (month 180)
      const mid = 179;
      expect(approximatelyEqual(schedule[mid].balance, reference.schedule[mid].balance, 0.001)).toBe(true);

      // Check last payment
      const last = termMonths - 1;
      expect(Math.abs(schedule[last].balance)).toBeLessThan(0.01);
    });

    it('should have payment = principal + interest for each period', () => {
      const schedule = generateAmortizationSchedule(200000, 0.06, 240);

      for (const entry of schedule) {
        const sum = entry.principal + entry.interest;
        expect(approximatelyEqual(entry.payment, sum, 0.0001)).toBe(true);
      }
    });
  });

  // =========================================================================
  // REAL ESTATE SPECIFIC SCENARIOS
  // =========================================================================

  describe('Real Estate Scenarios', () => {
    it('should calculate typical Indonesian property loan', () => {
      // Indonesian scenario: 10B IDR property, 70% LTV, 12% rate, 15 years
      const principal = 7000000000; // 7B IDR loan
      const annualRate = 0.12;
      const termMonths = 180;

      const monthlyPayment = calculateMonthlyPayment(principal, annualRate, termMonths);
      const totalInterest = calculateTotalInterest(principal, monthlyPayment, termMonths);

      console.log(`Indonesian property loan:`);
      console.log(`  Principal: IDR ${(principal / 1e9).toFixed(1)}B`);
      console.log(`  Monthly Payment: IDR ${(monthlyPayment / 1e6).toFixed(1)}M`);
      console.log(`  Total Interest: IDR ${(totalInterest / 1e9).toFixed(2)}B`);

      // Verify against reference
      const reference = referenceAmortization(principal, annualRate, termMonths);
      expect(approximatelyEqual(monthlyPayment, reference.monthlyPayment, 0.001)).toBe(true);
    });

    it('should calculate US property loan', () => {
      // US scenario: $500k property, 80% LTV, 7% rate, 30 years
      const principal = 400000;
      const annualRate = 0.07;
      const termMonths = 360;

      const monthlyPayment = calculateMonthlyPayment(principal, annualRate, termMonths);
      const reference = referenceAmortization(principal, annualRate, termMonths);

      console.log(`US property loan:`);
      console.log(`  Principal: $${(principal / 1000).toFixed(0)}k`);
      console.log(`  Monthly Payment: $${monthlyPayment.toFixed(2)}`);
      console.log(`  Total Interest: $${reference.totalInterest.toFixed(0)}`);

      expect(approximatelyEqual(monthlyPayment, reference.monthlyPayment, 0.001)).toBe(true);
    });
  });

  // =========================================================================
  // WITH ADDITIONAL COSTS TESTS
  // =========================================================================

  describe('Additional Costs (Taxes, Insurance, PMI)', () => {
    function calculateTotalMonthlyPayment(
      principal: number,
      annualRate: number,
      termMonths: number,
      propertyValue: number,
      propertyTaxRate: number,    // Annual rate as decimal (e.g., 0.012 for 1.2%)
      homeInsuranceAnnual: number,
      pmiRate: number,            // Annual rate as decimal
      hoaMonthly: number
    ): {
      basePayment: number;
      propertyTax: number;
      insurance: number;
      pmi: number;
      hoa: number;
      total: number;
    } {
      const basePayment = calculateMonthlyPayment(principal, annualRate, termMonths);
      const propertyTax = (propertyValue * propertyTaxRate) / 12;
      const insurance = homeInsuranceAnnual / 12;
      const pmi = (principal * pmiRate) / 12;
      const hoa = hoaMonthly;

      return {
        basePayment,
        propertyTax,
        insurance,
        pmi,
        hoa,
        total: basePayment + propertyTax + insurance + pmi + hoa,
      };
    }

    it('should calculate total payment with all costs', () => {
      const principal = 400000;
      const propertyValue = 500000;
      const annualRate = 0.065;
      const termMonths = 360;

      const result = calculateTotalMonthlyPayment(
        principal,
        annualRate,
        termMonths,
        propertyValue,
        0.012,    // 1.2% property tax
        2400,     // $2400/year insurance
        0.005,    // 0.5% PMI
        300       // $300/month HOA
      );

      console.log('Total Monthly Payment Breakdown:');
      console.log(`  Base P&I: $${result.basePayment.toFixed(2)}`);
      console.log(`  Property Tax: $${result.propertyTax.toFixed(2)}`);
      console.log(`  Insurance: $${result.insurance.toFixed(2)}`);
      console.log(`  PMI: $${result.pmi.toFixed(2)}`);
      console.log(`  HOA: $${result.hoa.toFixed(2)}`);
      console.log(`  TOTAL: $${result.total.toFixed(2)}`);

      // Verify sum
      const sum = result.basePayment + result.propertyTax + result.insurance + result.pmi + result.hoa;
      expect(result.total).toBe(sum);

      // Verify each component is reasonable
      expect(result.propertyTax).toBe(500); // 500k * 1.2% / 12
      expect(result.insurance).toBe(200); // 2400 / 12
      expect(result.pmi).toBeCloseTo(166.67, 1); // 400k * 0.5% / 12
    });
  });

  // =========================================================================
  // EDGE CASES
  // =========================================================================

  describe('Edge Cases', () => {
    it('should handle minimum loan amount', () => {
      const result = calculateMonthlyPayment(1000, 0.05, 12);
      expect(result).toBeGreaterThan(0);
      expect(!isNaN(result)).toBe(true);
    });

    it('should handle very short term (1 month)', () => {
      const result = calculateMonthlyPayment(10000, 0.06, 1);
      // Should be principal + 1 month interest
      expect(result).toBeCloseTo(10050, 0);
    });

    it('should handle very long term (50 years)', () => {
      const result = calculateMonthlyPayment(500000, 0.06, 600);
      const reference = referenceAmortization(500000, 0.06, 600);

      expect(approximatelyEqual(result, reference.monthlyPayment, 0.001)).toBe(true);
    });
  });

  // =========================================================================
  // VALIDATION REPORT
  // =========================================================================

  describe('Validation Summary', () => {
    it('should generate validation report for common scenarios', () => {
      const scenarios = [
        { name: '30yr @ 6%', principal: 300000, rate: 0.06, months: 360 },
        { name: '30yr @ 7%', principal: 400000, rate: 0.07, months: 360 },
        { name: '15yr @ 5.5%', principal: 250000, rate: 0.055, months: 180 },
        { name: '15yr @ 6.5%', principal: 350000, rate: 0.065, months: 180 },
        { name: '10yr @ 8%', principal: 100000, rate: 0.08, months: 120 },
        { name: 'IDR 15yr @ 12%', principal: 5000000000, rate: 0.12, months: 180 },
      ];

      const results = scenarios.map(s => {
        const implementation = calculateMonthlyPayment(s.principal, s.rate, s.months);
        const reference = referenceAmortization(s.principal, s.rate, s.months);
        const diff = Math.abs(implementation - reference.monthlyPayment) / reference.monthlyPayment * 100;

        return {
          Scenario: s.name,
          Implementation: implementation.toFixed(2),
          Reference: reference.monthlyPayment.toFixed(2),
          'Diff (%)': diff.toFixed(4),
          Status: diff < 0.01 ? 'PASS' : 'FAIL',
        };
      });

      console.log('\n========== MORTGAGE VALIDATION REPORT ==========');
      console.table(results);

      // All scenarios should pass
      const allPassed = results.every(r => r.Status === 'PASS');
      expect(allPassed).toBe(true);
    });
  });
});
