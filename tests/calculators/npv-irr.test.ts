/**
 * NPV & IRR Calculator Tests
 *
 * Tests the NPV (Net Present Value) and IRR (Internal Rate of Return)
 * calculations against reference implementations.
 */

import { describe, it, expect } from 'vitest';
import {
  referenceIRR,
  approximatelyEqual,
} from '../utils/reference-implementations';

// =========================================================================
// NPV CALCULATION FUNCTIONS (extracted from calculator logic)
// =========================================================================

function calculateDiscountedValue(amount: number, year: number, rate: number): number {
  return amount / Math.pow(1 + rate / 100, year);
}

function calculateNPV(cashFlows: { year: number; amount: number }[], discountRate: number): number {
  return cashFlows.reduce((sum, cf) => {
    return sum + calculateDiscountedValue(cf.amount, cf.year, discountRate);
  }, 0);
}

function calculateIRR(cashFlows: { year: number; amount: number }[]): number {
  let rate = 0.1;
  const maxIterations = 100;
  const tolerance = 0.0001;

  for (let i = 0; i < maxIterations; i++) {
    const npv = calculateNPV(cashFlows, rate * 100);
    const derivative = cashFlows.reduce((sum, cf) => {
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
}

function calculateMIRR(
  cashFlows: { year: number; amount: number }[],
  financeRate: number,
  reinvestRate: number
): number {
  const maxYear = Math.max(...cashFlows.map(cf => cf.year));

  let positiveFlows = 0;
  let negativeFlows = 0;

  for (const cf of cashFlows) {
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
}

function calculateProfitabilityIndex(cashFlows: { year: number; amount: number }[], rate: number): number {
  let pv = 0;
  let initialInvestment = 0;

  for (const cf of cashFlows) {
    if (cf.year === 0 && cf.amount < 0) {
      initialInvestment += Math.abs(cf.amount);
    } else {
      pv += cf.amount / Math.pow(1 + rate / 100, cf.year);
    }
  }

  return initialInvestment > 0 ? pv / initialInvestment : 0;
}

describe('NPV Calculator', () => {
  // =========================================================================
  // BASIC NPV TESTS
  // =========================================================================

  describe('Basic NPV Calculation', () => {
    it('should calculate NPV correctly for simple investment', () => {
      const cashFlows = [
        { year: 0, amount: -100000 },
        { year: 1, amount: 30000 },
        { year: 2, amount: 35000 },
        { year: 3, amount: 40000 },
        { year: 4, amount: 45000 },
      ];
      const discountRate = 10;

      const result = calculateNPV(cashFlows, discountRate);

      // Manual calculation:
      // -100000 + 30000/1.1 + 35000/1.21 + 40000/1.331 + 45000/1.4641
      // = -100000 + 27272.73 + 28925.62 + 30052.59 + 30736.96 = 16,987.90
      expect(approximatelyEqual(result, 16987.9, 100)).toBe(true);
    });

    it('should calculate NPV correctly with 0% discount rate', () => {
      const cashFlows = [
        { year: 0, amount: -100000 },
        { year: 1, amount: 50000 },
        { year: 2, amount: 50000 },
        { year: 3, amount: 50000 },
      ];

      const result = calculateNPV(cashFlows, 0);

      // At 0% discount, NPV = sum of cash flows
      expect(result).toBe(50000);
    });

    it('should return negative NPV for unprofitable investment', () => {
      const cashFlows = [
        { year: 0, amount: -100000 },
        { year: 1, amount: 20000 },
        { year: 2, amount: 20000 },
        { year: 3, amount: 20000 },
      ];
      const discountRate = 10;

      const result = calculateNPV(cashFlows, discountRate);

      expect(result).toBeLessThan(0);
    });

    it('should produce consistent results across discount rates', () => {
      const cashFlows = [
        { year: 0, amount: -100000 },
        { year: 1, amount: 35000 },
        { year: 2, amount: 35000 },
        { year: 3, amount: 35000 },
        { year: 4, amount: 35000 },
      ];

      // NPV should decrease as discount rate increases
      const npv5 = calculateNPV(cashFlows, 5);
      const npv10 = calculateNPV(cashFlows, 10);
      const npv15 = calculateNPV(cashFlows, 15);

      expect(npv5).toBeGreaterThan(npv10);
      expect(npv10).toBeGreaterThan(npv15);

      // At 10%, NPV should be approximately 10,893 (manual calculation)
      // -100000 + 35000/1.1 + 35000/1.21 + 35000/1.331 + 35000/1.4641
      expect(approximatelyEqual(npv10, 10893, 100)).toBe(true);
    });
  });

  // =========================================================================
  // DISCOUNT FACTOR TESTS
  // =========================================================================

  describe('Discount Factor Calculation', () => {
    it('should calculate correct discount factors', () => {
      const rate = 10; // 10%

      // Year 0: 1 / (1.1)^0 = 1
      expect(calculateDiscountedValue(100, 0, rate)).toBe(100);

      // Year 1: 1 / (1.1)^1 = 0.909...
      expect(approximatelyEqual(calculateDiscountedValue(100, 1, rate), 90.909, 0.01)).toBe(true);

      // Year 5: 1 / (1.1)^5 = 0.6209...
      expect(approximatelyEqual(calculateDiscountedValue(100, 5, rate), 62.09, 0.1)).toBe(true);
    });

    it('should handle high discount rates', () => {
      const rate = 25;
      const result = calculateDiscountedValue(100, 5, rate);

      // 1 / (1.25)^5 = 0.328
      expect(approximatelyEqual(result, 32.8, 0.1)).toBe(true);
    });
  });

  // =========================================================================
  // PROFITABILITY INDEX TESTS
  // =========================================================================

  describe('Profitability Index', () => {
    it('should calculate PI > 1 for profitable investment', () => {
      const cashFlows = [
        { year: 0, amount: -100000 },
        { year: 1, amount: 40000 },
        { year: 2, amount: 40000 },
        { year: 3, amount: 50000 },
      ];

      const pi = calculateProfitabilityIndex(cashFlows, 10);

      expect(pi).toBeGreaterThan(1);
    });

    it('should calculate PI < 1 for unprofitable investment', () => {
      const cashFlows = [
        { year: 0, amount: -100000 },
        { year: 1, amount: 20000 },
        { year: 2, amount: 20000 },
        { year: 3, amount: 20000 },
      ];

      const pi = calculateProfitabilityIndex(cashFlows, 10);

      expect(pi).toBeLessThan(1);
    });

    it('should return 0 when no initial investment', () => {
      const cashFlows = [
        { year: 0, amount: 0 },
        { year: 1, amount: 50000 },
      ];

      const pi = calculateProfitabilityIndex(cashFlows, 10);

      expect(pi).toBe(0);
    });
  });
});

describe('IRR Calculator', () => {
  // =========================================================================
  // BASIC IRR TESTS
  // =========================================================================

  describe('Basic IRR Calculation', () => {
    it('should calculate IRR for simple investment', () => {
      const cashFlows = [
        { year: 0, amount: -100000 },
        { year: 1, amount: 110000 },
      ];

      const result = calculateIRR(cashFlows);

      // 10% return
      expect(approximatelyEqual(result, 10, 1)).toBe(true);
    });

    it('should calculate IRR for multi-year investment', () => {
      const cashFlows = [
        { year: 0, amount: -100000 },
        { year: 1, amount: 30000 },
        { year: 2, amount: 30000 },
        { year: 3, amount: 30000 },
        { year: 4, amount: 30000 },
        { year: 5, amount: 30000 },
      ];

      const result = calculateIRR(cashFlows);

      // ~15% IRR (annuity factor for 5 years at 15% ≈ 3.35)
      expect(approximatelyEqual(result, 15, 2)).toBe(true);
    });

    it('should match reference implementation', () => {
      const cashFlows = [
        { year: 0, amount: -100000 },
        { year: 1, amount: 25000 },
        { year: 2, amount: 30000 },
        { year: 3, amount: 35000 },
        { year: 4, amount: 40000 },
      ];

      const implementation = calculateIRR(cashFlows);
      const reference = referenceIRR(cashFlows.map(cf => cf.amount));

      expect(approximatelyEqual(implementation, reference, 2)).toBe(true);
    });
  });

  // =========================================================================
  // IRR EDGE CASES
  // =========================================================================

  describe('IRR Edge Cases', () => {
    it('should handle negative return scenarios', () => {
      const cashFlows = [
        { year: 0, amount: -100000 },
        { year: 1, amount: 20000 },
        { year: 2, amount: 20000 },
        { year: 3, amount: 20000 },
      ];

      const result = calculateIRR(cashFlows);

      expect(result).toBeLessThan(0);
    });

    it('should handle high return scenarios', () => {
      const cashFlows = [
        { year: 0, amount: -100000 },
        { year: 1, amount: 50000 },
        { year: 2, amount: 80000 },
        { year: 3, amount: 100000 },
      ];

      const result = calculateIRR(cashFlows);

      expect(result).toBeGreaterThan(30);
    });
  });

  // =========================================================================
  // MIRR TESTS
  // =========================================================================

  describe('MIRR Calculation', () => {
    it('should calculate MIRR correctly', () => {
      const cashFlows = [
        { year: 0, amount: -100000 },
        { year: 1, amount: 30000 },
        { year: 2, amount: 35000 },
        { year: 3, amount: 40000 },
        { year: 4, amount: 45000 },
      ];

      const financeRate = 10;
      const reinvestRate = 12;

      const result = calculateMIRR(cashFlows, financeRate, reinvestRate);

      // MIRR should be between finance rate and reinvest rate typically
      expect(result).toBeGreaterThan(0);
      expect(result).toBeLessThan(30);
    });

    it('should return 0 when no negative cash flows', () => {
      const cashFlows = [
        { year: 0, amount: 0 },
        { year: 1, amount: 30000 },
      ];

      const result = calculateMIRR(cashFlows, 10, 12);

      expect(result).toBe(0);
    });

    it('should handle single year investment', () => {
      const cashFlows = [
        { year: 0, amount: -100000 },
        { year: 1, amount: 120000 },
      ];

      const result = calculateMIRR(cashFlows, 8, 10);

      // For single year, MIRR ≈ simple return
      expect(approximatelyEqual(result, 20, 5)).toBe(true);
    });
  });

  // =========================================================================
  // PAYBACK PERIOD TESTS
  // =========================================================================

  describe('Payback Period Calculation', () => {
    function calculatePaybackPeriod(cashFlows: { year: number; amount: number }[]): number {
      let cumulative = 0;
      for (const cf of cashFlows) {
        cumulative += cf.amount;
        if (cumulative >= 0) {
          return cf.year;
        }
      }
      return cashFlows[cashFlows.length - 1].year;
    }

    it('should calculate payback period correctly', () => {
      const cashFlows = [
        { year: 0, amount: -100000 },
        { year: 1, amount: 30000 },
        { year: 2, amount: 35000 },
        { year: 3, amount: 40000 }, // Cumulative: 5000
        { year: 4, amount: 45000 },
      ];

      const result = calculatePaybackPeriod(cashFlows);

      expect(result).toBe(3); // Breaks even in year 3
    });

    it('should handle immediate payback', () => {
      const cashFlows = [
        { year: 0, amount: -50000 },
        { year: 1, amount: 60000 },
      ];

      const result = calculatePaybackPeriod(cashFlows);

      expect(result).toBe(1);
    });

    it('should handle never breaking even', () => {
      const cashFlows = [
        { year: 0, amount: -100000 },
        { year: 1, amount: 10000 },
        { year: 2, amount: 10000 },
        { year: 3, amount: 10000 },
      ];

      const result = calculatePaybackPeriod(cashFlows);

      expect(result).toBe(3); // Returns last year
    });
  });

  // =========================================================================
  // REAL ESTATE INVESTMENT SCENARIOS
  // =========================================================================

  describe('Real Estate Investment Scenarios', () => {
    it('should calculate metrics for Bali villa investment', () => {
      // Typical Bali villa: $200k investment, $30k/year rental income, sell at $250k after 5 years
      const cashFlows = [
        { year: 0, amount: -200000 },
        { year: 1, amount: 30000 },
        { year: 2, amount: 32000 },
        { year: 3, amount: 34000 },
        { year: 4, amount: 36000 },
        { year: 5, amount: 288000 }, // Final year income + sale
      ];

      const irr = calculateIRR(cashFlows);
      const npv = calculateNPV(cashFlows, 10);

      // Expect reasonable returns for Bali property
      expect(irr).toBeGreaterThan(15);
      expect(irr).toBeLessThan(30);
      expect(npv).toBeGreaterThan(0);
    });

    it('should calculate metrics for development project', () => {
      // Development: $500k initial, additional investments, then flip
      const cashFlows = [
        { year: 0, amount: -300000 }, // Land
        { year: 0, amount: -150000 }, // Construction start
        { year: 1, amount: -200000 }, // More construction
        { year: 2, amount: 800000 },  // Sale
      ];

      const irr = calculateIRR(cashFlows);
      const npv = calculateNPV(cashFlows, 12);

      expect(irr).toBeGreaterThan(0);
      expect(typeof npv).toBe('number');
    });
  });

  // =========================================================================
  // VALIDATION REPORT
  // =========================================================================

  describe('Validation Summary', () => {
    it('should validate all scenarios against reference', () => {
      const scenarios = [
        {
          name: 'Conservative Investment',
          cashFlows: [
            { year: 0, amount: -100000 },
            { year: 1, amount: 15000 },
            { year: 2, amount: 15000 },
            { year: 3, amount: 15000 },
            { year: 4, amount: 15000 },
            { year: 5, amount: 65000 },
          ],
        },
        {
          name: 'Aggressive Growth',
          cashFlows: [
            { year: 0, amount: -100000 },
            { year: 1, amount: 20000 },
            { year: 2, amount: 30000 },
            { year: 3, amount: 45000 },
            { year: 4, amount: 60000 },
          ],
        },
        {
          name: 'Break-even Scenario',
          cashFlows: [
            { year: 0, amount: -100000 },
            { year: 1, amount: 25000 },
            { year: 2, amount: 25000 },
            { year: 3, amount: 25000 },
            { year: 4, amount: 25000 },
          ],
        },
      ];

      const results = scenarios.map(s => {
        const irr = calculateIRR(s.cashFlows);
        const npv10 = calculateNPV(s.cashFlows, 10);
        const refIRR = referenceIRR(s.cashFlows.map(cf => cf.amount));

        return {
          name: s.name,
          irr,
          refIRR,
          npv10,
          irrMatch: approximatelyEqual(irr, refIRR, 3),
        };
      });

      console.log('\n========== NPV/IRR VALIDATION REPORT ==========');
      console.table(results.map(r => ({
        Scenario: r.name,
        'IRR (%)': r.irr.toFixed(2),
        'Ref IRR (%)': r.refIRR.toFixed(2),
        'NPV @10%': r.npv10.toFixed(0),
        Match: r.irrMatch ? 'PASS' : 'FAIL',
      })));

      // All IRRs should match reference within tolerance
      expect(results.every(r => r.irrMatch)).toBe(true);
    });
  });
});
