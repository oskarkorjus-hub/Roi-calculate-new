/**
 * Calculator-Specific Scoring Tests
 *
 * Comprehensive tests for each calculator type with custom metrics.
 * Validates the exact math for all scoring configurations.
 */

import { describe, it, expect } from 'vitest';
import { calculateInvestmentScore } from '../../src/utils/investmentScoring';

// Helper to round to 2 decimals for comparison
const round = (n: number) => Math.round(n * 100) / 100;

describe('Calculator-Specific Scoring - Comprehensive Tests', () => {
  // =========================================================================
  // BRRRR CALCULATOR (Cash Recovery Custom Metric)
  // =========================================================================
  describe('BRRRR Calculator', () => {
    // Config: roiWeight=45, roiMax=20, cashFlowWeight=35, cashFlowMax=10,
    //         stabilityWeight=10, stabilityMax=12, locationWeight=10
    // Custom: cashRecovery (weight=20) - bonus for pulling out capital

    it('should calculate score with full capital recovery', () => {
      // Perfect BRRRR: 100% capital pulled out, great cash flow
      const score = calculateInvestmentScore(
        20,        // 20% CoC ROI (max for BRRRR)
        50000,     // 10% cash flow yield
        500000,    // Total investment
        0,         // 0 break-even (cash pulled out)
        'Canggu',  // Premium location
        'brrrr',
        {
          cashLeftInDeal: 0,     // Full recovery
          totalInvestment: 500000,
        }
      );

      // Calculate expected:
      // totalWeight = 45 + 35 + 10 + 10 + 20 = 120
      // roiNorm = min(1, 20/20) = 1.0
      // cashFlowNorm = min(1, 10/10) = 1.0
      // stabilityNorm = max(0, 1 - (0/12)*0.5) = 1.0
      // locationScore = 1.0 (Canggu)
      // cashRecovery = 1 - (0/500000) = 1.0
      // weightedSum = 1*45 + 1*35 + 1*10 + 1*10 + 1*20 = 120
      // score = (120/120) * 100 = 100

      expect(score.investmentScore).toBe(100);
    });

    it('should calculate score with partial capital recovery', () => {
      const score = calculateInvestmentScore(
        10,        // 10% CoC ROI (half of max)
        25000,     // 5% cash flow yield
        500000,
        12,        // 12 months break-even
        'Bali',
        'brrrr',
        {
          cashLeftInDeal: 100000,   // 20% left in deal
          totalInvestment: 500000,
        }
      );

      // roiNorm = 10/20 = 0.5
      // cashFlowNorm = 5/10 = 0.5
      // stabilityNorm = max(0, 1 - (12/12)*0.5) = 0.5
      // locationScore = 0.33 (Bali other)
      // cashRecovery = 1 - (100000/500000) = 0.8
      // weightedSum = 0.5*45 + 0.5*35 + 0.5*10 + 0.33*10 + 0.8*20
      //             = 22.5 + 17.5 + 5 + 3.3 + 16 = 64.3
      // score = (64.3/120) * 100 = 53.58

      expect(score.investmentScore).toBeGreaterThan(50);
      expect(score.investmentScore).toBeLessThan(60);
    });

    it('should handle negative cash flow BRRRR (high risk)', () => {
      const score = calculateInvestmentScore(
        -5,        // Negative ROI
        -25000,    // Negative cash flow
        500000,
        36,        // 36 months (long)
        'Bali',
        'brrrr',
        {
          cashLeftInDeal: 200000,  // 40% still in deal
          totalInvestment: 500000,
        }
      );

      // roiNorm = max(0, -5/20) = 0
      // cashFlowNorm = max(0, -5/10) = 0
      // stabilityNorm = max(0, 1 - (36/12)*0.5) = max(0, -0.5) = 0
      // locationScore = 0.33
      // cashRecovery = 1 - (200000/500000) = 0.6
      // weightedSum = 0 + 0 + 0 + 3.3 + 12 = 15.3
      // score = (15.3/120) * 100 = 12.75

      expect(score.investmentScore).toBeLessThan(20);
      expect(score.investmentScore).toBeGreaterThan(10);
    });
  });

  // =========================================================================
  // NPV CALCULATOR (Profitability Index Custom Metric)
  // =========================================================================
  describe('NPV Calculator', () => {
    // Config: roiWeight=30, roiMax=20, cashFlowWeight=30, cashFlowMax=5,
    //         stabilityWeight=30, stabilityMax=36, locationWeight=10
    // Custom: profitabilityIndex (weight=20) - PI > 1.5 is excellent

    it('should calculate score with high profitability index', () => {
      const score = calculateInvestmentScore(
        20,        // 20% ROI (max)
        50000,     // 10% yield (exceeds 5% max)
        500000,
        12,        // 12 months break-even
        'Ubud',    // Premium
        'npv',
        {
          profitabilityIndex: 2.0,  // Excellent PI
        }
      );

      // totalWeight = 30 + 30 + 30 + 10 + 20 = 120
      // roiNorm = min(1, 20/20) = 1.0
      // cashFlowNorm = min(1, 10/5) = 1.0
      // stabilityNorm = max(0, 1 - (12/36)*0.5) = 0.833
      // locationScore = 1.0
      // PI bonus = min(1, 2.0/1.5) = 1.0
      // weightedSum = 1*30 + 1*30 + 0.833*30 + 1*10 + 1*20 = 115
      // score = (115/120) * 100 = 95.83

      expect(score.investmentScore).toBeGreaterThan(90);
    });

    it('should calculate score with low profitability index', () => {
      const score = calculateInvestmentScore(
        5,         // 5% ROI (low)
        10000,     // 2% yield
        500000,
        36,        // 36 months (long)
        'Bali',
        'npv',
        {
          profitabilityIndex: 0.8,  // Below 1.0 (bad)
        }
      );

      // roiNorm = 5/20 = 0.25
      // cashFlowNorm = 2/5 = 0.4
      // stabilityNorm = max(0, 1 - (36/36)*0.5) = 0.5
      // locationScore = 0.33
      // PI bonus = min(1, 0.8/1.5) = 0.533
      // weightedSum = 0.25*30 + 0.4*30 + 0.5*30 + 0.33*10 + 0.533*20
      //             = 7.5 + 12 + 15 + 3.3 + 10.67 = 48.47
      // score = (48.47/120) * 100 = 40.39

      expect(score.investmentScore).toBeGreaterThan(35);
      expect(score.investmentScore).toBeLessThan(50);
    });
  });

  // =========================================================================
  // INDONESIA TAX OPTIMIZER (Effective Tax Rate Custom Metric)
  // =========================================================================
  describe('Indonesia Tax Optimizer', () => {
    // Config: roiWeight=40, roiMax=15, cashFlowWeight=30, cashFlowMax=8,
    //         stabilityWeight=15, stabilityMax=36, locationWeight=15
    // Custom: effectiveTaxRate (weight=20) - lower tax = better

    it('should reward low effective tax rate', () => {
      const score = calculateInvestmentScore(
        15,        // 15% ROI (max)
        40000,     // 8% yield (max)
        500000,
        18,        // 18 months
        'Ubud',
        'indonesia-tax',
        {
          effectiveTaxRate: 5,  // Only 5% effective tax
        }
      );

      // totalWeight = 40 + 30 + 15 + 15 + 20 = 120
      // roiNorm = 15/15 = 1.0
      // cashFlowNorm = 8/8 = 1.0
      // stabilityNorm = max(0, 1 - (18/36)*0.5) = 0.75
      // locationScore = 1.0
      // taxBonus = max(0, 1 - 5/30) = 0.833
      // weightedSum = 1*40 + 1*30 + 0.75*15 + 1*15 + 0.833*20
      //             = 40 + 30 + 11.25 + 15 + 16.67 = 112.92
      // score = (112.92/120) * 100 = 94.1

      expect(score.investmentScore).toBeGreaterThan(90);
    });

    it('should penalize high effective tax rate', () => {
      const score = calculateInvestmentScore(
        10,
        20000,     // 4% yield
        500000,
        24,
        'Bali',
        'indonesia-tax',
        {
          effectiveTaxRate: 25,  // High 25% tax
        }
      );

      // taxBonus = max(0, 1 - 25/30) = 0.167
      // Lower bonus = lower score

      expect(score.investmentScore).toBeLessThan(60);
    });
  });

  // =========================================================================
  // DEV BUDGET TRACKER (Budget Variance Custom Metric)
  // =========================================================================
  describe('Dev Budget Tracker', () => {
    // Config: roiWeight=20, roiMax=20, cashFlowWeight=20, cashFlowMax=5,
    //         stabilityWeight=30, stabilityMax=24, locationWeight=10
    // Custom: budgetVariance (weight=30) - under budget = better

    it('should reward under-budget projects', () => {
      const score = calculateInvestmentScore(
        20,        // 20% ROI
        25000,     // 5% yield
        500000,
        12,        // 12 months
        'Ubud',
        'dev-budget',
        {
          variance: -5,  // 5% under budget
        }
      );

      // totalWeight = 20 + 20 + 30 + 10 + 30 = 110
      // roiNorm = 20/20 = 1.0
      // cashFlowNorm = 5/5 = 1.0
      // stabilityNorm = max(0, 1 - (12/24)*0.5) = 0.75
      // locationScore = 1.0
      // varianceBonus = max(0, 1 - |-5|/20) = 0.75
      // weightedSum = 1*20 + 1*20 + 0.75*30 + 1*10 + 0.75*30
      //             = 20 + 20 + 22.5 + 10 + 22.5 = 95
      // score = (95/110) * 100 = 86.36

      expect(score.investmentScore).toBeGreaterThan(80);
    });

    it('should penalize over-budget projects', () => {
      const score = calculateInvestmentScore(
        10,
        15000,     // 3% yield
        500000,
        24,
        'Bali',
        'dev-budget',
        {
          variance: 15,  // 15% over budget
        }
      );

      // varianceBonus = max(0, 1 - |15|/20) = 0.25

      expect(score.investmentScore).toBeLessThan(60);
    });
  });

  // =========================================================================
  // RISK ASSESSMENT (Risk Score Custom Metric - INVERTED)
  // =========================================================================
  describe('Risk Assessment', () => {
    // Config: roiWeight=30, roiMax=15, cashFlowWeight=20, cashFlowMax=8,
    //         stabilityWeight=20, stabilityMax=36, locationWeight=10
    // Custom: riskScore (weight=30) - lower risk = better (INVERTED)

    it('should reward low risk scores', () => {
      const score = calculateInvestmentScore(
        15,
        40000,     // 8% yield
        500000,
        18,
        'Seminyak',
        'risk-assessment',
        {
          riskScore: 20,  // Low risk (good)
        }
      );

      // totalWeight = 30 + 20 + 20 + 10 + 30 = 110
      // riskBonus = max(0, 1 - 20/100) = 0.8 (low risk = high bonus)

      expect(score.investmentScore).toBeGreaterThan(75);
    });

    it('should penalize high risk scores', () => {
      const score = calculateInvestmentScore(
        10,
        20000,
        500000,
        30,
        'Bali',
        'risk-assessment',
        {
          riskScore: 80,  // High risk (bad)
        }
      );

      // riskBonus = max(0, 1 - 80/100) = 0.2 (high risk = low bonus)

      expect(score.investmentScore).toBeLessThan(50);
    });
  });

  // =========================================================================
  // CAP RATE CALCULATOR (ROI-focused)
  // =========================================================================
  describe('Cap Rate Calculator', () => {
    // Config: roiWeight=50, roiMax=8, cashFlowWeight=25, cashFlowMax=6,
    //         stabilityWeight=15, stabilityMax=36, locationWeight=10

    it('should heavily weight cap rate (ROI)', () => {
      const score = calculateInvestmentScore(
        8,         // 8% cap rate (max for this calculator)
        30000,     // 6% cash flow yield (max)
        500000,
        24,
        'Ubud',
        'cap-rate'
      );

      // totalWeight = 50 + 25 + 15 + 10 = 100
      // roiNorm = min(1, 8/8) = 1.0
      // cashFlowNorm = min(1, 6/6) = 1.0
      // stabilityNorm = max(0, 1 - (24/36)*0.5) = 0.667
      // locationScore = 1.0
      // weightedSum = 1*50 + 1*25 + 0.667*15 + 1*10 = 95
      // score = (95/100) * 100 = 95

      expect(score.investmentScore).toBe(95);
    });

    it('should penalize low cap rates', () => {
      const score = calculateInvestmentScore(
        4,         // 4% cap rate (half of max)
        15000,     // 3% yield (half)
        500000,
        36,
        'Bali',
        'cap-rate'
      );

      // roiNorm = 4/8 = 0.5
      // cashFlowNorm = 3/6 = 0.5
      // With these halved metrics, score should be around 50

      expect(score.investmentScore).toBeGreaterThan(40);
      expect(score.investmentScore).toBeLessThan(60);
    });
  });

  // =========================================================================
  // XIRR CALCULATOR (Development timeline tolerant)
  // =========================================================================
  describe('XIRR Calculator', () => {
    // Config: roiWeight=45, roiMax=12, cashFlowWeight=25, cashFlowMax=3,
    //         stabilityWeight=20, stabilityMax=48, locationWeight=10

    it('should tolerate longer break-even for development', () => {
      const score = calculateInvestmentScore(
        12,        // 12% XIRR (max)
        15000,     // 3% cash flow yield (max)
        500000,
        36,        // 36 months - acceptable for development
        'Ubud',
        'xirr'
      );

      // stabilityNorm = max(0, 1 - (36/48)*0.5) = 0.625
      // Still decent because stabilityMax is 48 months

      expect(score.investmentScore).toBeGreaterThan(80);
    });

    it('should score excellent XIRR returns', () => {
      const score = calculateInvestmentScore(
        15,        // 15% XIRR (exceeds 12% max)
        15000,
        500000,
        24,
        'Canggu',
        'xirr'
      );

      // roiNorm = min(1, 15/12) = 1.0 (capped)

      expect(score.investmentScore).toBeGreaterThan(85);
    });
  });

  // =========================================================================
  // RENTAL ROI (Balanced approach)
  // =========================================================================
  describe('Rental ROI Calculator', () => {
    // Config: roiWeight=35, roiMax=15, cashFlowWeight=35, cashFlowMax=8,
    //         stabilityWeight=20, stabilityMax=24, locationWeight=10

    it('should balance ROI and cash flow equally', () => {
      const highROIScore = calculateInvestmentScore(
        15, 20000, 500000, 24, 'Ubud', 'rental-roi'
      );

      const highCashFlowScore = calculateInvestmentScore(
        7.5, 40000, 500000, 24, 'Ubud', 'rental-roi'
      );

      // With equal weights (35/35), these should be similar
      expect(Math.abs(highROIScore.investmentScore - highCashFlowScore.investmentScore)).toBeLessThan(15);
    });
  });

  // =========================================================================
  // MORTGAGE/FINANCING (Different scoring model)
  // =========================================================================
  describe('Mortgage/Financing Calculator', () => {
    // Config: roiWeight=10, roiMax=5, cashFlowWeight=40, cashFlowMax=30,
    //         stabilityWeight=40, stabilityMax=240, locationWeight=10
    // Note: This is about loan affordability, not investment returns

    it('should score affordable loans highly', () => {
      const score = calculateInvestmentScore(
        5,         // Low rate (5% is "good")
        30000,     // 30% DSCR equivalent
        100000,    // Loan amount
        120,       // 10-year loan (120 months - stable)
        'Ubud',
        'mortgage'
      );

      // Very different model - affordability focused
      expect(score.investmentScore).toBeGreaterThan(60);
    });
  });

  // =========================================================================
  // DEV FEASIBILITY (High return expectations)
  // =========================================================================
  describe('Dev Feasibility Calculator', () => {
    // Config: roiWeight=35, roiMax=25, cashFlowWeight=15, cashFlowMax=5,
    //         stabilityWeight=25, stabilityMax=36, locationWeight=15
    // Custom: profitMargin (weight=20) - 20% margin is excellent

    it('should reward high profit margins', () => {
      const score = calculateInvestmentScore(
        25,        // 25% ROI (max)
        25000,     // 5% yield
        500000,
        24,
        'Ubud',
        'dev-feasibility',
        {
          profitMargin: 20,  // 20% margin (excellent)
        }
      );

      // totalWeight = 35 + 15 + 25 + 15 + 20 = 110
      // profitMarginBonus = min(1, 20/20) = 1.0

      expect(score.investmentScore).toBeGreaterThan(85);
    });
  });

  // =========================================================================
  // VALIDATION: Generic vs Calculator-Specific
  // =========================================================================
  describe('Generic vs Calculator-Specific Comparison', () => {
    it('should produce different scores for same inputs with different calculator types', () => {
      const testData = {
        roi: 12,
        cashFlow: 30000,
        propertyValue: 500000,
        breakEven: 24,
        location: 'Ubud',
      };

      const genericScore = calculateInvestmentScore(
        testData.roi,
        testData.cashFlow,
        testData.propertyValue,
        testData.breakEven,
        testData.location
        // No calculator type = generic
      );

      const calculatorScores: Record<string, number> = {};
      const calculatorTypes = [
        'rental-roi', 'rental-projection', 'cashflow', 'cap-rate',
        'xirr', 'irr', 'npv', 'dev-feasibility', 'mortgage',
        'indonesia-tax', 'dev-budget', 'risk-assessment', 'brrrr'
      ];

      calculatorTypes.forEach(calcType => {
        const score = calculateInvestmentScore(
          testData.roi,
          testData.cashFlow,
          testData.propertyValue,
          testData.breakEven,
          testData.location,
          calcType
        );
        calculatorScores[calcType] = score.investmentScore;
      });

      console.log('\n========== CALCULATOR SCORE COMPARISON ==========');
      console.log(`Input: ROI=${testData.roi}%, CashFlow=$${testData.cashFlow}, BreakEven=${testData.breakEven}mo`);
      console.log(`Generic Score: ${genericScore.investmentScore}`);
      console.table(
        Object.entries(calculatorScores)
          .sort((a, b) => b[1] - a[1])
          .map(([calc, score]) => ({ Calculator: calc, Score: score }))
      );

      // Verify that scores differ based on calculator type
      const uniqueScores = new Set(Object.values(calculatorScores));
      expect(uniqueScores.size).toBeGreaterThan(3); // At least 4 different scores
    });
  });

  // =========================================================================
  // EDGE CASES FOR ALL CALCULATORS
  // =========================================================================
  describe('Edge Cases', () => {
    const calculators = [
      'rental-roi', 'cap-rate', 'xirr', 'brrrr', 'npv',
      'indonesia-tax', 'dev-budget', 'risk-assessment'
    ];

    calculators.forEach(calcType => {
      it(`should handle zero inputs for ${calcType}`, () => {
        const score = calculateInvestmentScore(0, 0, 0, 0, '', calcType);
        expect(score.investmentScore).toBeGreaterThanOrEqual(0);
        expect(score.investmentScore).toBeLessThanOrEqual(100);
      });

      it(`should handle negative inputs for ${calcType}`, () => {
        const score = calculateInvestmentScore(-10, -5000, 500000, 60, '', calcType);
        expect(score.investmentScore).toBeGreaterThanOrEqual(0);
        expect(score.investmentScore).toBeLessThanOrEqual(100);
      });

      it(`should handle extreme positive inputs for ${calcType}`, () => {
        const score = calculateInvestmentScore(500, 500000, 100000, 1, 'Ubud', calcType);
        expect(score.investmentScore).toBeLessThanOrEqual(100);
        expect(score.investmentScore).toBeGreaterThanOrEqual(0);
      });
    });
  });
});
