/**
 * Portfolio Calculation Tests
 *
 * Tests portfolio-level calculations including blended ROI,
 * weighted averages, break-even analysis, and cash flow aggregation.
 */

import { describe, it, expect } from 'vitest';
import { approximatelyEqual } from '../utils/reference-implementations';

// ============================================================================
// PORTFOLIO CALCULATION FUNCTIONS (mirroring src/components/PortfolioStats.tsx)
// ============================================================================

interface PortfolioProject {
  id: string;
  name: string;
  totalInvestment: number;
  roi: number; // as percentage (e.g., 15 for 15%)
  avgCashFlow: number; // monthly
  breakEvenMonths: number;
  investmentScore: number;
}

function calculateTotalInvestment(projects: PortfolioProject[]): number {
  return projects.reduce((sum, p) => sum + p.totalInvestment, 0);
}

function calculateBlendedROI(projects: PortfolioProject[]): number {
  const totalInvestment = calculateTotalInvestment(projects);
  if (totalInvestment === 0) return 0;

  return projects.reduce((sum, p) => {
    const weight = p.totalInvestment / totalInvestment;
    return sum + (p.roi * weight);
  }, 0);
}

function calculateAverageInvestmentScore(projects: PortfolioProject[]): number {
  if (projects.length === 0) return 0;
  const total = projects.reduce((sum, p) => sum + p.investmentScore, 0);
  return total / projects.length;
}

function calculateWeightedInvestmentScore(projects: PortfolioProject[]): number {
  const totalInvestment = calculateTotalInvestment(projects);
  if (totalInvestment === 0) return 0;

  return projects.reduce((sum, p) => {
    const weight = p.totalInvestment / totalInvestment;
    return sum + (p.investmentScore * weight);
  }, 0);
}

function calculateAnnualCashFlow(projects: PortfolioProject[]): number {
  return projects.reduce((sum, p) => sum + (p.avgCashFlow * 12), 0);
}

function calculateAverageBreakEven(projects: PortfolioProject[]): number {
  if (projects.length === 0) return 0;
  const total = projects.reduce((sum, p) => sum + p.breakEvenMonths, 0);
  return total / projects.length;
}

function findBestPerformer(projects: PortfolioProject[]): PortfolioProject | null {
  if (projects.length === 0) return null;
  return projects.reduce((best, p) =>
    p.investmentScore > best.investmentScore ? p : best
  );
}

function findWorstPerformer(projects: PortfolioProject[]): PortfolioProject | null {
  if (projects.length === 0) return null;
  return projects.reduce((worst, p) =>
    p.investmentScore < worst.investmentScore ? p : worst
  );
}

function calculatePortfolioDiversification(projects: PortfolioProject[]): number {
  // Simple diversification score based on number of projects and investment spread
  if (projects.length <= 1) return 0;

  const totalInvestment = calculateTotalInvestment(projects);
  const weights = projects.map(p => p.totalInvestment / totalInvestment);

  // Herfindahl-Hirschman Index (inverted for diversification)
  const hhi = weights.reduce((sum, w) => sum + (w * w), 0);

  // Convert to 0-100 scale (lower HHI = higher diversification)
  // HHI of 1 = concentrated, HHI of 1/n = perfectly diversified
  const maxHHI = 1;
  const minHHI = 1 / projects.length;

  return ((maxHHI - hhi) / (maxHHI - minHHI)) * 100;
}

// ============================================================================
// TESTS
// ============================================================================

describe('Portfolio Calculations', () => {
  // Sample portfolio data
  const samplePortfolio: PortfolioProject[] = [
    {
      id: '1',
      name: 'Ubud Villa A',
      totalInvestment: 2000000000, // 2B IDR
      roi: 15,
      avgCashFlow: 25000000, // 25M/month
      breakEvenMonths: 24,
      investmentScore: 75,
    },
    {
      id: '2',
      name: 'Canggu Villa B',
      totalInvestment: 3000000000, // 3B IDR
      roi: 12,
      avgCashFlow: 30000000, // 30M/month
      breakEvenMonths: 30,
      investmentScore: 68,
    },
    {
      id: '3',
      name: 'Seminyak Apartment',
      totalInvestment: 1000000000, // 1B IDR
      roi: 20,
      avgCashFlow: 18000000, // 18M/month
      breakEvenMonths: 18,
      investmentScore: 82,
    },
  ];

  // =========================================================================
  // TOTAL INVESTMENT TESTS
  // =========================================================================

  describe('Total Investment Calculation', () => {
    it('should sum all project investments', () => {
      const result = calculateTotalInvestment(samplePortfolio);
      expect(result).toBe(6000000000); // 6B IDR
    });

    it('should return 0 for empty portfolio', () => {
      const result = calculateTotalInvestment([]);
      expect(result).toBe(0);
    });

    it('should handle single project', () => {
      const result = calculateTotalInvestment([samplePortfolio[0]]);
      expect(result).toBe(2000000000);
    });
  });

  // =========================================================================
  // BLENDED ROI TESTS
  // =========================================================================

  describe('Blended ROI Calculation', () => {
    it('should calculate investment-weighted ROI', () => {
      const result = calculateBlendedROI(samplePortfolio);

      // Manual calculation:
      // Total: 6B
      // Ubud: 2B/6B * 15% = 5%
      // Canggu: 3B/6B * 12% = 6%
      // Seminyak: 1B/6B * 20% = 3.33%
      // Blended: 14.33%

      expect(approximatelyEqual(result, 14.33, 0.01)).toBe(true);
    });

    it('should return 0 for empty portfolio', () => {
      const result = calculateBlendedROI([]);
      expect(result).toBe(0);
    });

    it('should equal project ROI for single project', () => {
      const result = calculateBlendedROI([samplePortfolio[0]]);
      expect(result).toBe(15);
    });

    it('should weight larger investments more heavily', () => {
      const unevenPortfolio: PortfolioProject[] = [
        { ...samplePortfolio[0], totalInvestment: 9000000000, roi: 5 },
        { ...samplePortfolio[1], totalInvestment: 1000000000, roi: 50 },
      ];

      const result = calculateBlendedROI(unevenPortfolio);

      // 90% weight on 5% ROI + 10% weight on 50% ROI = 9.5%
      expect(approximatelyEqual(result, 9.5, 0.01)).toBe(true);
    });
  });

  // =========================================================================
  // INVESTMENT SCORE TESTS
  // =========================================================================

  describe('Investment Score Calculations', () => {
    it('should calculate simple average investment score', () => {
      const result = calculateAverageInvestmentScore(samplePortfolio);
      // (75 + 68 + 82) / 3 = 75
      expect(result).toBe(75);
    });

    it('should calculate weighted investment score', () => {
      const result = calculateWeightedInvestmentScore(samplePortfolio);

      // Ubud: 2B/6B * 75 = 25
      // Canggu: 3B/6B * 68 = 34
      // Seminyak: 1B/6B * 82 = 13.67
      // Weighted: 72.67

      expect(approximatelyEqual(result, 72.67, 0.1)).toBe(true);
    });

    it('should return 0 for empty portfolio', () => {
      expect(calculateAverageInvestmentScore([])).toBe(0);
      expect(calculateWeightedInvestmentScore([])).toBe(0);
    });
  });

  // =========================================================================
  // CASH FLOW TESTS
  // =========================================================================

  describe('Annual Cash Flow Calculation', () => {
    it('should calculate total annual cash flow', () => {
      const result = calculateAnnualCashFlow(samplePortfolio);

      // (25M + 30M + 18M) * 12 = 876M IDR/year
      expect(result).toBe(876000000);
    });

    it('should return 0 for empty portfolio', () => {
      const result = calculateAnnualCashFlow([]);
      expect(result).toBe(0);
    });

    it('should handle negative cash flows', () => {
      const negativePortfolio: PortfolioProject[] = [
        { ...samplePortfolio[0], avgCashFlow: -5000000 },
        { ...samplePortfolio[1], avgCashFlow: 10000000 },
      ];

      const result = calculateAnnualCashFlow(negativePortfolio);
      // (-5M + 10M) * 12 = 60M
      expect(result).toBe(60000000);
    });
  });

  // =========================================================================
  // BREAK-EVEN TESTS
  // =========================================================================

  describe('Average Break-Even Calculation', () => {
    it('should calculate average break-even months', () => {
      const result = calculateAverageBreakEven(samplePortfolio);
      // (24 + 30 + 18) / 3 = 24
      expect(result).toBe(24);
    });

    it('should return 0 for empty portfolio', () => {
      const result = calculateAverageBreakEven([]);
      expect(result).toBe(0);
    });
  });

  // =========================================================================
  // BEST/WORST PERFORMER TESTS
  // =========================================================================

  describe('Best and Worst Performer Identification', () => {
    it('should find best performer by investment score', () => {
      const result = findBestPerformer(samplePortfolio);
      expect(result?.name).toBe('Seminyak Apartment');
      expect(result?.investmentScore).toBe(82);
    });

    it('should find worst performer by investment score', () => {
      const result = findWorstPerformer(samplePortfolio);
      expect(result?.name).toBe('Canggu Villa B');
      expect(result?.investmentScore).toBe(68);
    });

    it('should return null for empty portfolio', () => {
      expect(findBestPerformer([])).toBeNull();
      expect(findWorstPerformer([])).toBeNull();
    });
  });

  // =========================================================================
  // DIVERSIFICATION TESTS
  // =========================================================================

  describe('Portfolio Diversification', () => {
    it('should return 0 for single project', () => {
      const result = calculatePortfolioDiversification([samplePortfolio[0]]);
      expect(result).toBe(0);
    });

    it('should return higher score for evenly distributed portfolio', () => {
      const evenPortfolio: PortfolioProject[] = [
        { ...samplePortfolio[0], totalInvestment: 1000000000 },
        { ...samplePortfolio[1], totalInvestment: 1000000000 },
        { ...samplePortfolio[2], totalInvestment: 1000000000 },
      ];

      const unevenPortfolio: PortfolioProject[] = [
        { ...samplePortfolio[0], totalInvestment: 8000000000 },
        { ...samplePortfolio[1], totalInvestment: 1000000000 },
        { ...samplePortfolio[2], totalInvestment: 1000000000 },
      ];

      const evenScore = calculatePortfolioDiversification(evenPortfolio);
      const unevenScore = calculatePortfolioDiversification(unevenPortfolio);

      expect(evenScore).toBeGreaterThan(unevenScore);
      expect(evenScore).toBeCloseTo(100, 0); // Perfect diversification for 3 equal projects
    });
  });

  // =========================================================================
  // COMPREHENSIVE PORTFOLIO ANALYSIS
  // =========================================================================

  describe('Comprehensive Portfolio Analysis', () => {
    it('should analyze a complete portfolio', () => {
      const totalInvestment = calculateTotalInvestment(samplePortfolio);
      const blendedROI = calculateBlendedROI(samplePortfolio);
      const avgScore = calculateAverageInvestmentScore(samplePortfolio);
      const weightedScore = calculateWeightedInvestmentScore(samplePortfolio);
      const annualCashFlow = calculateAnnualCashFlow(samplePortfolio);
      const avgBreakEven = calculateAverageBreakEven(samplePortfolio);
      const bestPerformer = findBestPerformer(samplePortfolio);
      const worstPerformer = findWorstPerformer(samplePortfolio);
      const diversification = calculatePortfolioDiversification(samplePortfolio);

      console.log('\n========== PORTFOLIO ANALYSIS ==========');
      console.log(`Total Investment: IDR ${(totalInvestment / 1e9).toFixed(1)}B`);
      console.log(`Blended ROI: ${blendedROI.toFixed(2)}%`);
      console.log(`Avg Investment Score: ${avgScore.toFixed(0)}`);
      console.log(`Weighted Investment Score: ${weightedScore.toFixed(1)}`);
      console.log(`Annual Cash Flow: IDR ${(annualCashFlow / 1e6).toFixed(0)}M`);
      console.log(`Avg Break-Even: ${avgBreakEven} months`);
      console.log(`Best Performer: ${bestPerformer?.name} (Score: ${bestPerformer?.investmentScore})`);
      console.log(`Worst Performer: ${worstPerformer?.name} (Score: ${worstPerformer?.investmentScore})`);
      console.log(`Diversification Score: ${diversification.toFixed(1)}%`);

      // Basic sanity checks
      expect(totalInvestment).toBeGreaterThan(0);
      expect(blendedROI).toBeGreaterThan(0);
      expect(blendedROI).toBeLessThan(100);
      expect(avgScore).toBeGreaterThanOrEqual(0);
      expect(avgScore).toBeLessThanOrEqual(100);
    });
  });

  // =========================================================================
  // EDGE CASES
  // =========================================================================

  describe('Edge Cases', () => {
    it('should handle all zero investments gracefully', () => {
      const zeroPortfolio: PortfolioProject[] = [
        { ...samplePortfolio[0], totalInvestment: 0 },
        { ...samplePortfolio[1], totalInvestment: 0 },
      ];

      expect(calculateBlendedROI(zeroPortfolio)).toBe(0);
      expect(calculateWeightedInvestmentScore(zeroPortfolio)).toBe(0);
    });

    it('should handle extreme ROI values', () => {
      const extremePortfolio: PortfolioProject[] = [
        { ...samplePortfolio[0], roi: 500 },
        { ...samplePortfolio[1], roi: -50 },
      ];

      const result = calculateBlendedROI(extremePortfolio);
      expect(typeof result).toBe('number');
      expect(!isNaN(result)).toBe(true);
    });

    it('should handle large number of projects', () => {
      const largePortfolio: PortfolioProject[] = [];
      for (let i = 0; i < 100; i++) {
        largePortfolio.push({
          id: String(i),
          name: `Project ${i}`,
          totalInvestment: 1000000000 + (i * 100000000),
          roi: 5 + (i % 20),
          avgCashFlow: 10000000 + (i * 500000),
          breakEvenMonths: 12 + (i % 36),
          investmentScore: 50 + (i % 50),
        });
      }

      const startTime = performance.now();
      const blendedROI = calculateBlendedROI(largePortfolio);
      const annualCashFlow = calculateAnnualCashFlow(largePortfolio);
      const diversification = calculatePortfolioDiversification(largePortfolio);
      const endTime = performance.now();

      console.log(`\n100 projects - Calculation time: ${(endTime - startTime).toFixed(2)}ms`);

      expect(typeof blendedROI).toBe('number');
      expect(!isNaN(blendedROI)).toBe(true);
      expect(annualCashFlow).toBeGreaterThan(0);
      expect(diversification).toBeGreaterThan(90); // High diversification with 100 projects
    });
  });

  // =========================================================================
  // VALIDATION REPORT
  // =========================================================================

  describe('Validation Summary', () => {
    it('should generate validation report', () => {
      const results = [
        {
          Metric: 'Total Investment',
          Result: `IDR ${(calculateTotalInvestment(samplePortfolio) / 1e9).toFixed(1)}B`,
          Expected: 'IDR 6.0B',
          Pass: calculateTotalInvestment(samplePortfolio) === 6000000000,
        },
        {
          Metric: 'Blended ROI',
          Result: `${calculateBlendedROI(samplePortfolio).toFixed(2)}%`,
          Expected: '~14.33%',
          Pass: approximatelyEqual(calculateBlendedROI(samplePortfolio), 14.33, 0.01),
        },
        {
          Metric: 'Avg Investment Score',
          Result: String(calculateAverageInvestmentScore(samplePortfolio)),
          Expected: '75',
          Pass: calculateAverageInvestmentScore(samplePortfolio) === 75,
        },
        {
          Metric: 'Annual Cash Flow',
          Result: `IDR ${(calculateAnnualCashFlow(samplePortfolio) / 1e6).toFixed(0)}M`,
          Expected: 'IDR 876M',
          Pass: calculateAnnualCashFlow(samplePortfolio) === 876000000,
        },
        {
          Metric: 'Avg Break-Even',
          Result: `${calculateAverageBreakEven(samplePortfolio)} months`,
          Expected: '24 months',
          Pass: calculateAverageBreakEven(samplePortfolio) === 24,
        },
      ];

      console.log('\n========== PORTFOLIO VALIDATION REPORT ==========');
      console.table(results.map(r => ({
        Metric: r.Metric,
        Result: r.Result,
        Expected: r.Expected,
        Status: r.Pass ? 'PASS' : 'FAIL',
      })));

      const allPassed = results.every(r => r.Pass);
      expect(allPassed).toBe(true);
    });
  });
});
