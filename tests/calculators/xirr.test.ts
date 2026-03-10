/**
 * XIRR Calculator Tests
 *
 * Tests the XIRR (Extended Internal Rate of Return) calculation
 * against reference implementations and known Excel results.
 */

import { describe, it, expect } from 'vitest';
import { calculateXIRR } from '../../src/utils/xirr';
import {
  referenceXIRR,
  generateTestCashFlows,
  approximatelyEqual,
  percentDifference,
} from '../utils/reference-implementations';

describe('XIRR Calculator', () => {
  // =========================================================================
  // BASIC FUNCTIONALITY TESTS
  // =========================================================================

  describe('Basic Functionality', () => {
    it('should return 0 for less than 2 cash flows', () => {
      const result = calculateXIRR([
        { date: new Date(), amount: -100000 },
      ]);
      expect(result).toBe(0);
    });

    it('should return 0 for all zero cash flows', () => {
      const result = calculateXIRR([
        { date: new Date(), amount: 0 },
        { date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), amount: 0 },
      ]);
      expect(result).toBe(0);
    });

    it('should return 0 when there are only inflows', () => {
      const result = calculateXIRR([
        { date: new Date(), amount: 100000 },
        { date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), amount: 50000 },
      ]);
      expect(result).toBe(0);
    });

    it('should return 0 when there are only outflows', () => {
      const result = calculateXIRR([
        { date: new Date(), amount: -100000 },
        { date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), amount: -50000 },
      ]);
      expect(result).toBe(0);
    });
  });

  // =========================================================================
  // SIMPLE INVESTMENT SCENARIOS
  // =========================================================================

  describe('Simple Investment Scenarios', () => {
    it('should calculate correct XIRR for a simple 1-year investment', () => {
      const today = new Date('2024-01-01');
      const oneYearLater = new Date('2025-01-01');

      const cashFlows = [
        { date: today, amount: -100000 },
        { date: oneYearLater, amount: 110000 },
      ];

      const result = calculateXIRR(cashFlows);
      // Expected: 10% return
      expect(approximatelyEqual(result, 0.10, 0.01)).toBe(true);
    });

    it('should calculate correct XIRR for a 2-year investment with annual returns', () => {
      const start = new Date('2024-01-01');

      const cashFlows = [
        { date: start, amount: -100000 },
        { date: new Date('2025-01-01'), amount: 5000 },
        { date: new Date('2026-01-01'), amount: 115000 },
      ];

      const result = calculateXIRR(cashFlows);
      const reference = referenceXIRR(cashFlows);

      // Compare against reference implementation
      expect(approximatelyEqual(result, reference, 0.01)).toBe(true);
    });

    it('should calculate correct XIRR for 3-year hold with rental income', () => {
      const cashFlows = generateTestCashFlows('simple');

      const result = calculateXIRR(cashFlows);
      const reference = referenceXIRR(cashFlows);

      console.log(`Simple scenario - Result: ${(result * 100).toFixed(2)}%, Reference: ${(reference * 100).toFixed(2)}%`);

      expect(approximatelyEqual(result, reference, 0.02)).toBe(true);
    });
  });

  // =========================================================================
  // COMPLEX INVESTMENT SCENARIOS
  // =========================================================================

  describe('Complex Investment Scenarios', () => {
    it('should handle multiple investments and returns', () => {
      const cashFlows = generateTestCashFlows('complex');

      const result = calculateXIRR(cashFlows);
      const reference = referenceXIRR(cashFlows);

      console.log(`Complex scenario - Result: ${(result * 100).toFixed(2)}%, Reference: ${(reference * 100).toFixed(2)}%`);

      expect(approximatelyEqual(result, reference, 0.02)).toBe(true);
    });

    it('should handle irregular payment schedules', () => {
      const cashFlows = generateTestCashFlows('irregular');

      const result = calculateXIRR(cashFlows);
      const reference = referenceXIRR(cashFlows);

      console.log(`Irregular scenario - Result: ${(result * 100).toFixed(2)}%, Reference: ${(reference * 100).toFixed(2)}%`);

      expect(approximatelyEqual(result, reference, 0.02)).toBe(true);
    });

    it('should handle negative return scenarios', () => {
      const cashFlows = generateTestCashFlows('negative');

      const result = calculateXIRR(cashFlows);
      const reference = referenceXIRR(cashFlows);

      console.log(`Negative scenario - Result: ${(result * 100).toFixed(2)}%, Reference: ${(reference * 100).toFixed(2)}%`);

      // Both should be negative
      expect(result).toBeLessThan(0);
      expect(approximatelyEqual(result, reference, 0.05)).toBe(true);
    });
  });

  // =========================================================================
  // EDGE CASES
  // =========================================================================

  describe('Edge Cases', () => {
    it('should handle very small amounts', () => {
      const today = new Date();
      const cashFlows = [
        { date: today, amount: -100 },
        { date: new Date(today.getTime() + 365 * 24 * 60 * 60 * 1000), amount: 110 },
      ];

      const result = calculateXIRR(cashFlows);
      expect(approximatelyEqual(result, 0.10, 0.01)).toBe(true);
    });

    it('should handle very large amounts (IDR scale)', () => {
      const today = new Date();
      const cashFlows = [
        { date: today, amount: -5000000000 }, // 5 billion IDR
        { date: new Date(today.getTime() + 365 * 24 * 60 * 60 * 1000), amount: 5500000000 },
      ];

      const result = calculateXIRR(cashFlows);
      expect(approximatelyEqual(result, 0.10, 0.01)).toBe(true);
    });

    it('should handle same-day transactions', () => {
      const today = new Date();
      const nextYear = new Date(today.getTime() + 365 * 24 * 60 * 60 * 1000);

      const cashFlows = [
        { date: today, amount: -50000 },
        { date: today, amount: -50000 }, // Same day
        { date: nextYear, amount: 120000 },
      ];

      const result = calculateXIRR(cashFlows);
      // Should handle gracefully
      expect(typeof result).toBe('number');
      expect(!isNaN(result)).toBe(true);
    });

    it('should clamp extremely high returns', () => {
      const today = new Date();
      const cashFlows = [
        { date: today, amount: -1000 },
        { date: new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000), amount: 100000 },
      ];

      const result = calculateXIRR(cashFlows);
      // Should be clamped to max (10 = 1000%)
      expect(result).toBeLessThanOrEqual(10);
    });

    it('should clamp extremely negative returns', () => {
      const today = new Date();
      const cashFlows = [
        { date: today, amount: -100000 },
        { date: new Date(today.getTime() + 365 * 24 * 60 * 60 * 1000), amount: 100 },
      ];

      const result = calculateXIRR(cashFlows);
      // Should be clamped to min (-0.99 = -99%)
      expect(result).toBeGreaterThanOrEqual(-0.99);
    });
  });

  // =========================================================================
  // REAL ESTATE SPECIFIC SCENARIOS
  // =========================================================================

  describe('Real Estate Investment Scenarios', () => {
    it('should calculate correct XIRR for Bali villa investment', () => {
      const purchaseDate = new Date('2024-01-01');

      // Typical Bali villa investment scenario
      const cashFlows = [
        // Initial investment
        { date: purchaseDate, amount: -2000000000 }, // 2B IDR purchase
        { date: new Date('2024-02-01'), amount: -200000000 }, // 200M renovation

        // Monthly rental income (Year 1)
        { date: new Date('2024-06-01'), amount: 50000000 },
        { date: new Date('2024-07-01'), amount: 60000000 },
        { date: new Date('2024-08-01'), amount: 70000000 },
        { date: new Date('2024-09-01'), amount: 55000000 },
        { date: new Date('2024-10-01'), amount: 45000000 },
        { date: new Date('2024-11-01'), amount: 40000000 },
        { date: new Date('2024-12-01'), amount: 65000000 },

        // Year 2 income
        { date: new Date('2025-01-01'), amount: 55000000 },
        { date: new Date('2025-06-01'), amount: 70000000 },
        { date: new Date('2025-12-01'), amount: 65000000 },

        // Year 3 - Sale
        { date: new Date('2026-06-01'), amount: 2500000000 }, // Sale at 2.5B
      ];

      const result = calculateXIRR(cashFlows);
      const reference = referenceXIRR(cashFlows);

      console.log(`Bali Villa - Result: ${(result * 100).toFixed(2)}%, Reference: ${(reference * 100).toFixed(2)}%`);

      expect(approximatelyEqual(result, reference, 0.02)).toBe(true);
      // Expect reasonable return for Bali property
      expect(result).toBeGreaterThan(0.05); // > 5%
      expect(result).toBeLessThan(0.50); // < 50%
    });

    it('should calculate XIRR for installment payment plan', () => {
      const startDate = new Date('2024-01-01');

      // Off-plan purchase with payment schedule
      const cashFlows = [
        // Booking fee
        { date: startDate, amount: -100000000 },
        // Down payment
        { date: new Date('2024-02-01'), amount: -300000000 },
        // Installments
        { date: new Date('2024-04-01'), amount: -200000000 },
        { date: new Date('2024-06-01'), amount: -200000000 },
        { date: new Date('2024-08-01'), amount: -200000000 },
        // Final payment at handover
        { date: new Date('2024-12-01'), amount: -500000000 },
        // Furniture
        { date: new Date('2025-01-01'), amount: -100000000 },

        // Rental income starts
        { date: new Date('2025-03-01'), amount: 30000000 },
        { date: new Date('2025-06-01'), amount: 40000000 },
        { date: new Date('2025-09-01'), amount: 35000000 },
        { date: new Date('2025-12-01'), amount: 45000000 },

        // Year 2
        { date: new Date('2026-06-01'), amount: 50000000 },
        { date: new Date('2026-12-01'), amount: 55000000 },

        // Exit at Year 3
        { date: new Date('2027-06-01'), amount: 2000000000 },
      ];

      const result = calculateXIRR(cashFlows);
      const reference = referenceXIRR(cashFlows);

      console.log(`Installment Plan - Result: ${(result * 100).toFixed(2)}%, Reference: ${(reference * 100).toFixed(2)}%`);

      expect(approximatelyEqual(result, reference, 0.02)).toBe(true);
    });
  });

  // =========================================================================
  // EXCEL COMPATIBILITY TESTS
  // =========================================================================

  describe('Excel Compatibility', () => {
    it('should match Excel XIRR for known test case 1', () => {
      // Known Excel result: approximately 37.34%
      const cashFlows = [
        { date: new Date('2008-01-01'), amount: -10000 },
        { date: new Date('2008-03-01'), amount: 2750 },
        { date: new Date('2008-10-30'), amount: 4250 },
        { date: new Date('2009-02-15'), amount: 3250 },
        { date: new Date('2009-04-01'), amount: 2750 },
      ];

      const result = calculateXIRR(cashFlows);

      console.log(`Excel Test Case 1 - Result: ${(result * 100).toFixed(2)}%, Expected: ~37.34%`);

      // Allow 2% tolerance vs Excel
      expect(approximatelyEqual(result, 0.3734, 0.02)).toBe(true);
    });

    it('should match Excel XIRR for known test case 2', () => {
      // Known Excel result: approximately 10% (annual payments)
      const cashFlows = [
        { date: new Date('2020-01-01'), amount: -100000 },
        { date: new Date('2020-12-31'), amount: 10000 },
        { date: new Date('2021-12-31'), amount: 10000 },
        { date: new Date('2022-12-31'), amount: 10000 },
        { date: new Date('2023-12-31'), amount: 10000 },
        { date: new Date('2024-12-31'), amount: 110000 },
      ];

      const result = calculateXIRR(cashFlows);

      console.log(`Excel Test Case 2 - Result: ${(result * 100).toFixed(2)}%, Expected: ~10%`);

      // This is actually ~10% IRR (10k/year return on 100k investment)
      expect(approximatelyEqual(result, 0.10, 0.02)).toBe(true);
    });
  });

  // =========================================================================
  // PERFORMANCE TESTS
  // =========================================================================

  describe('Performance', () => {
    it('should calculate XIRR for 100 cash flows in reasonable time', () => {
      const today = new Date();
      const cashFlows = [{ date: today, amount: -1000000 }];

      // Add 98 monthly returns
      for (let i = 1; i <= 98; i++) {
        cashFlows.push({
          date: new Date(today.getTime() + i * 30 * 24 * 60 * 60 * 1000),
          amount: 15000,
        });
      }

      // Final sale
      cashFlows.push({
        date: new Date(today.getTime() + 99 * 30 * 24 * 60 * 60 * 1000),
        amount: 1200000,
      });

      const startTime = performance.now();
      const result = calculateXIRR(cashFlows);
      const endTime = performance.now();

      console.log(`100 cash flows - Time: ${(endTime - startTime).toFixed(2)}ms, Result: ${(result * 100).toFixed(2)}%`);

      // Should complete in under 100ms
      expect(endTime - startTime).toBeLessThan(100);
      expect(typeof result).toBe('number');
      expect(!isNaN(result)).toBe(true);
    });
  });

  // =========================================================================
  // VALIDATION REPORT
  // =========================================================================

  describe('Validation Summary', () => {
    it('should generate validation report for all scenarios', () => {
      const scenarios = ['simple', 'complex', 'irregular', 'negative'] as const;
      const results: Array<{
        scenario: string;
        implementation: number;
        reference: number;
        diffPercent: number;
        pass: boolean;
      }> = [];

      for (const scenario of scenarios) {
        const cashFlows = generateTestCashFlows(scenario);
        const implementation = calculateXIRR(cashFlows);
        const reference = referenceXIRR(cashFlows);
        const diff = percentDifference(implementation, reference);

        results.push({
          scenario,
          implementation: implementation * 100,
          reference: reference * 100,
          diffPercent: diff,
          pass: Math.abs(diff) < 2,
        });
      }

      console.log('\n========== XIRR VALIDATION REPORT ==========');
      console.table(results.map(r => ({
        Scenario: r.scenario,
        'Implementation (%)': r.implementation.toFixed(2),
        'Reference (%)': r.reference.toFixed(2),
        'Difference (%)': r.diffPercent.toFixed(2),
        Status: r.pass ? 'PASS' : 'FAIL',
      })));

      // All scenarios should pass
      const allPassed = results.every(r => r.pass);
      expect(allPassed).toBe(true);
    });
  });
});
