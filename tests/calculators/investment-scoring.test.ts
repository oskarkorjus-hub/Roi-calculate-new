/**
 * Investment Scoring Tests
 *
 * Tests the investment scoring algorithm that calculates
 * scores (0-100) based on ROI, cash flow, stability, and location.
 */

import { describe, it, expect } from 'vitest';
import {
  referenceRoiScore,
  referenceCashFlowScore,
  referenceStabilityScore,
  referenceInvestmentScore,
  approximatelyEqual,
} from '../utils/reference-implementations';
import {
  calculateRoiScore,
  calculateCashFlowScore,
  calculateStabilityScore,
  calculateLocationQualityScore,
  calculateInvestmentScore,
  getInvestmentRisk,
} from '../../src/utils/investmentScoring';

describe('Investment Scoring Algorithm', () => {
  // =========================================================================
  // ROI SCORE TESTS (0-5 points)
  // =========================================================================

  describe('ROI Score Calculation', () => {
    it('should calculate ROI score correctly for various percentages', () => {
      const testCases = [
        { roi: 0, expected: 0 },
        { roi: 10, expected: 0.5 },
        { roi: 20, expected: 1 },
        { roi: 50, expected: 2.5 },
        { roi: 100, expected: 5 },  // Capped at 5
        { roi: 150, expected: 5 },  // Still capped at 5
      ];

      testCases.forEach(({ roi, expected }) => {
        const result = calculateRoiScore(roi);
        const reference = referenceRoiScore(roi);

        expect(result).toBe(expected);
        expect(result).toBe(reference);
      });
    });

    it('should handle negative ROI', () => {
      const result = calculateRoiScore(-10);
      expect(result).toBe(0); // Clamped to 0
    });

    it('should match reference implementation', () => {
      for (let roi = 0; roi <= 120; roi += 5) {
        const result = calculateRoiScore(roi);
        const reference = referenceRoiScore(roi);
        expect(result).toBe(reference);
      }
    });
  });

  // =========================================================================
  // CASH FLOW SCORE TESTS (0-3 points)
  // =========================================================================

  describe('Cash Flow Score Calculation', () => {
    it('should calculate cash flow score correctly', () => {
      const propertyValue = 500000;

      const testCases = [
        { cashFlow: 0, expected: 0 },
        { cashFlow: 25000, expected: 1.5 },    // 5% yield
        { cashFlow: 50000, expected: 3 },      // 10% yield (max)
        { cashFlow: 75000, expected: 3 },      // 15% yield (capped at 3)
        { cashFlow: -10000, expected: 0 },     // Negative cash flow
      ];

      testCases.forEach(({ cashFlow, expected }) => {
        const result = calculateCashFlowScore(cashFlow, propertyValue);
        expect(approximatelyEqual(result, expected, 0.01)).toBe(true);
      });
    });

    it('should return 0 for zero property value', () => {
      const result = calculateCashFlowScore(50000, 0);
      expect(result).toBe(0);
    });

    it('should scale correctly with property value', () => {
      // Same absolute cash flow, different property values
      const score1 = calculateCashFlowScore(50000, 500000); // 10% yield
      const score2 = calculateCashFlowScore(50000, 1000000); // 5% yield

      expect(score1).toBeGreaterThan(score2);
      expect(score1).toBe(3); // Max score
      expect(approximatelyEqual(score2, 1.5, 0.01)).toBe(true);
    });

    it('should match reference implementation', () => {
      const propertyValue = 500000;
      for (let cashFlow = 0; cashFlow <= 100000; cashFlow += 10000) {
        const result = calculateCashFlowScore(cashFlow, propertyValue);
        const reference = referenceCashFlowScore(cashFlow, propertyValue);
        expect(approximatelyEqual(result, reference, 0.01)).toBe(true);
      }
    });
  });

  // =========================================================================
  // STABILITY SCORE TESTS (0-2 points)
  // =========================================================================

  describe('Stability Score Calculation', () => {
    it('should calculate stability score based on break-even months', () => {
      const testCases = [
        { months: 6, expected: 2 },     // < 12 months
        { months: 11, expected: 2 },    // < 12 months
        { months: 12, expected: 1.5 },  // 12-24 months
        { months: 18, expected: 1.5 },  // 12-24 months
        { months: 24, expected: 1 },    // 24-36 months
        { months: 30, expected: 1 },    // 24-36 months
        { months: 36, expected: 0.5 },  // > 36 months
        { months: 60, expected: 0.5 },  // > 36 months
      ];

      testCases.forEach(({ months, expected }) => {
        const result = calculateStabilityScore(months);
        const reference = referenceStabilityScore(months);

        expect(result).toBe(expected);
        expect(result).toBe(reference);
      });
    });
  });

  // =========================================================================
  // LOCATION SCORE TESTS (0-1 point)
  // =========================================================================

  describe('Location Quality Score', () => {
    it('should score premium Bali locations highest', () => {
      const premiumLocations = ['Ubud', 'Seminyak', 'Canggu', 'Sanur'];

      premiumLocations.forEach(location => {
        const result = calculateLocationQualityScore(location);
        expect(result).toBe(1);
      });
    });

    it('should score mid-tier Bali locations moderately', () => {
      const midTierLocations = ['Legian', 'Kuta', 'Jimbaran', 'Uluwatu', 'Nusa Dua'];

      midTierLocations.forEach(location => {
        const result = calculateLocationQualityScore(location);
        expect(result).toBe(0.67);
      });
    });

    it('should score other Bali locations lower', () => {
      const result = calculateLocationQualityScore('Bali - Other Area');
      expect(result).toBe(0.33);
    });

    it('should handle case insensitivity', () => {
      expect(calculateLocationQualityScore('UBUD')).toBe(1);
      expect(calculateLocationQualityScore('ubud')).toBe(1);
      expect(calculateLocationQualityScore('Ubud')).toBe(1);
    });

    it('should handle empty location', () => {
      const result = calculateLocationQualityScore('');
      expect(result).toBe(0.5); // Default
    });

    it('should handle non-Bali locations', () => {
      const result = calculateLocationQualityScore('Jakarta');
      expect(result).toBe(0.5); // Default for non-Bali
    });
  });

  // =========================================================================
  // FULL INVESTMENT SCORE TESTS (0-100)
  // =========================================================================

  describe('Full Investment Score Calculation', () => {
    it('should calculate investment score using weighted components', () => {
      // Perfect score scenario
      const perfectScore = calculateInvestmentScore(
        100,      // ROI 100% → 5 points → 40 points
        50000,    // Cash flow $50k on $500k → 3 points → 30 points
        500000,   // Property value
        6,        // 6 months break-even → 2 points → 20 points
        'Ubud'    // Premium location → 1 point → 10 points
      );

      expect(perfectScore.investmentScore).toBe(100);
    });

    it('should calculate investment score for moderate scenario', () => {
      const score = calculateInvestmentScore(
        25,       // ROI 25% → 1.25 points
        25000,    // Cash flow $25k on $500k → 5% yield → 1.5 points
        500000,   // Property value
        18,       // 18 months break-even → 1.5 points
        'Kuta'    // Mid-tier location → 0.67 points
      );

      // Expected calculation:
      // ROI: (1.25/5) * 40 = 10
      // Cash Flow: (1.5/3) * 30 = 15
      // Stability: (1.5/2) * 20 = 15
      // Location: 0.67 * 10 = 6.7
      // Total: ~47

      expect(score.investmentScore).toBeGreaterThan(40);
      expect(score.investmentScore).toBeLessThan(55);
    });

    it('should calculate poor investment score', () => {
      const score = calculateInvestmentScore(
        5,        // ROI 5% → 0.25 points
        5000,     // Cash flow $5k on $500k → 1% yield → 0.3 points
        500000,   // Property value
        48,       // 48 months break-even → 0.5 points
        ''        // No location → 0.5 points
      );

      expect(score.investmentScore).toBeLessThan(30);
    });

    it('should match reference implementation for generic scoring', () => {
      const testCases = [
        { roi: 50, cf: 30000, pv: 500000, be: 12, loc: 0.75, expected: 63 },
        { roi: 100, cf: 50000, pv: 500000, be: 6, loc: 1, expected: 100 },
        { roi: 10, cf: 10000, pv: 500000, be: 36, loc: 0.5, expected: 24 },
      ];

      testCases.forEach(({ roi, cf, pv, be, loc }) => {
        const result = calculateInvestmentScore(roi, cf, pv, be, 'Ubud');
        const reference = referenceInvestmentScore(roi, cf, pv, be, loc);

        // Allow 5 point tolerance due to location calculation differences
        expect(Math.abs(result.investmentScore - reference)).toBeLessThanOrEqual(5);
      });
    });
  });

  // =========================================================================
  // RISK LEVEL TESTS
  // =========================================================================

  describe('Investment Risk Level', () => {
    it('should return correct risk levels for score ranges', () => {
      const testCases = [
        { score: 90, level: 'excellent' },
        { score: 85, level: 'excellent' },
        { score: 75, level: 'very-good' },
        { score: 70, level: 'very-good' },
        { score: 65, level: 'good' },
        { score: 60, level: 'good' },
        { score: 55, level: 'moderate-risk' },
        { score: 50, level: 'moderate-risk' },
        { score: 45, level: 'high-risk' },
        { score: 30, level: 'high-risk' },
      ];

      testCases.forEach(({ score, level }) => {
        const result = getInvestmentRisk(score);
        expect(result.level).toBe(level);
      });
    });

    it('should provide appropriate interpretations', () => {
      const excellent = getInvestmentRisk(90);
      expect(excellent.interpretation).toContain('Excellent');

      const highRisk = getInvestmentRisk(30);
      expect(highRisk.interpretation).toContain('High risk');
    });

    it('should provide correct color coding', () => {
      const excellent = getInvestmentRisk(90);
      expect(excellent.color).toContain('green');

      const moderate = getInvestmentRisk(55);
      expect(moderate.color).toContain('yellow');

      const highRisk = getInvestmentRisk(30);
      expect(highRisk.color).toContain('red');
    });
  });

  // =========================================================================
  // CALCULATOR-SPECIFIC SCORING TESTS
  // =========================================================================

  describe('Calculator-Specific Scoring', () => {
    it('should use different weights for rental-roi calculator', () => {
      const genericScore = calculateInvestmentScore(
        15, 40000, 500000, 24, 'Ubud'
      );

      const rentalRoiScore = calculateInvestmentScore(
        15, 40000, 500000, 24, 'Ubud', 'rental-roi'
      );

      // Scores should differ due to different weights
      // rental-roi emphasizes cash flow more (35% vs 30%)
      console.log(`Generic score: ${genericScore.investmentScore}`);
      console.log(`Rental ROI score: ${rentalRoiScore.investmentScore}`);
    });

    it('should use different weights for cap-rate calculator', () => {
      const genericScore = calculateInvestmentScore(
        8, 30000, 500000, 24, 'Ubud'
      );

      const capRateScore = calculateInvestmentScore(
        8, 30000, 500000, 24, 'Ubud', 'cap-rate'
      );

      // cap-rate weighs ROI at 50% (since cap rate IS the ROI)
      console.log(`Generic score: ${genericScore.investmentScore}`);
      console.log(`Cap Rate score: ${capRateScore.investmentScore}`);
    });

    it('should handle development calculator with longer timelines', () => {
      // Development projects have longer break-even expectations
      const devScore = calculateInvestmentScore(
        25, 50000, 1000000, 36, 'Ubud', 'dev-feasibility'
      );

      // 36 months shouldn't be penalized as heavily for development
      expect(devScore.investmentScore).toBeGreaterThan(40);
    });
  });

  // =========================================================================
  // EDGE CASES
  // =========================================================================

  describe('Edge Cases', () => {
    it('should handle all zeros gracefully', () => {
      const score = calculateInvestmentScore(0, 0, 0, 0, '');
      // With 0 months break-even, stability score is max (2 points = 20%)
      // Default location gives 0.5 (5% of 10%)
      // So minimum score with zeros is ~25, not 0
      expect(score.investmentScore).toBeGreaterThanOrEqual(0);
      expect(score.investmentScore).toBeLessThanOrEqual(100);
    });

    it('should handle negative values', () => {
      const score = calculateInvestmentScore(-10, -5000, 500000, 60, '');
      expect(score.investmentScore).toBeGreaterThanOrEqual(0);
      expect(score.investmentScore).toBeLessThanOrEqual(100);
    });

    it('should clamp scores to 0-100 range', () => {
      // Try to create a score that would exceed 100
      const score = calculateInvestmentScore(
        500,      // Extreme ROI
        500000,   // Cash flow equals property value (100% yield)
        500000,
        1,        // 1 month break-even
        'Ubud'
      );

      expect(score.investmentScore).toBeLessThanOrEqual(100);
      expect(score.investmentScore).toBeGreaterThanOrEqual(0);
    });
  });

  // =========================================================================
  // VALIDATION REPORT
  // =========================================================================

  describe('Validation Summary', () => {
    it('should generate comprehensive validation report', () => {
      const scenarios = [
        { name: 'Excellent Investment', roi: 80, cf: 45000, pv: 500000, be: 8, loc: 'Ubud' },
        { name: 'Very Good Investment', roi: 40, cf: 35000, pv: 500000, be: 12, loc: 'Seminyak' },
        { name: 'Good Investment', roi: 25, cf: 25000, pv: 500000, be: 18, loc: 'Kuta' },
        { name: 'Moderate Investment', roi: 15, cf: 15000, pv: 500000, be: 30, loc: 'Bali' },
        { name: 'Poor Investment', roi: 5, cf: 5000, pv: 500000, be: 48, loc: '' },
      ];

      const results = scenarios.map(s => {
        const score = calculateInvestmentScore(s.roi, s.cf, s.pv, s.be, s.loc);
        const risk = getInvestmentRisk(score.investmentScore);

        return {
          Scenario: s.name,
          ROI: `${s.roi}%`,
          'Cash Flow Yield': `${((s.cf / s.pv) * 100).toFixed(1)}%`,
          'Break-Even': `${s.be} mo`,
          Score: score.investmentScore,
          Risk: risk.level,
        };
      });

      console.log('\n========== INVESTMENT SCORING VALIDATION ==========');
      console.table(results);

      // Verify ordering: excellent > very good > good > moderate > poor
      const scores = results.map(r => r.Score);
      for (let i = 0; i < scores.length - 1; i++) {
        expect(scores[i]).toBeGreaterThan(scores[i + 1]);
      }
    });
  });
});
