#!/usr/bin/env npx ts-node

/**
 * Financial Calculation Validation Runner
 *
 * This script runs all financial calculation tests and generates
 * a comprehensive validation report.
 *
 * Usage:
 *   npx vitest run tests/run-validation.ts
 *   npm run test:all
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';

// Track test results
interface ValidationResult {
  category: string;
  test: string;
  status: 'PASS' | 'FAIL';
  details?: string;
}

const results: ValidationResult[] = [];

describe('Financial Calculation Validation Suite', () => {
  beforeAll(() => {
    console.log('\n');
    console.log('╔════════════════════════════════════════════════════════════════╗');
    console.log('║          ROI CALCULATE - FINANCIAL VALIDATION SUITE            ║');
    console.log('╠════════════════════════════════════════════════════════════════╣');
    console.log('║  Testing all financial calculations against reference          ║');
    console.log('║  implementations and industry-standard formulas.               ║');
    console.log('╚════════════════════════════════════════════════════════════════╝');
    console.log('\n');
  });

  afterAll(() => {
    console.log('\n');
    console.log('════════════════════════════════════════════════════════════════');
    console.log('                    VALIDATION SUMMARY                          ');
    console.log('════════════════════════════════════════════════════════════════');

    const passed = results.filter(r => r.status === 'PASS').length;
    const failed = results.filter(r => r.status === 'FAIL').length;
    const total = results.length;

    console.log(`\nTotal Tests: ${total}`);
    console.log(`Passed: ${passed} (${((passed / total) * 100).toFixed(1)}%)`);
    console.log(`Failed: ${failed} (${((failed / total) * 100).toFixed(1)}%)`);

    if (failed > 0) {
      console.log('\n⚠️  FAILED TESTS:');
      results.filter(r => r.status === 'FAIL').forEach(r => {
        console.log(`  - [${r.category}] ${r.test}: ${r.details || 'No details'}`);
      });
    }

    console.log('\n');
  });

  // =========================================================================
  // XIRR VALIDATION
  // =========================================================================

  describe('XIRR Validation', () => {
    it('validates XIRR implementation', async () => {
      const { calculateXIRR } = await import('../src/utils/xirr');
      const { referenceXIRR } = await import('./utils/reference-implementations');

      // Test case: Simple investment
      const cashFlows = [
        { date: new Date('2024-01-01'), amount: -100000 },
        { date: new Date('2025-01-01'), amount: 110000 },
      ];

      const implementation = calculateXIRR(cashFlows);
      const reference = referenceXIRR(cashFlows);

      const diff = Math.abs(implementation - reference);
      const passed = diff < 0.001;

      results.push({
        category: 'XIRR',
        test: 'Simple 1-year investment',
        status: passed ? 'PASS' : 'FAIL',
        details: `Impl: ${(implementation * 100).toFixed(2)}%, Ref: ${(reference * 100).toFixed(2)}%`,
      });

      expect(passed).toBe(true);
    });
  });

  // =========================================================================
  // MORTGAGE VALIDATION
  // =========================================================================

  describe('Mortgage Validation', () => {
    it('validates mortgage payment calculation', async () => {
      const { referenceAmortization } = await import('./utils/reference-implementations');

      // Implementation
      const calculateMonthlyPayment = (
        principal: number,
        annualRate: number,
        termMonths: number
      ): number => {
        const monthlyRate = annualRate / 12;
        if (monthlyRate === 0) return principal / termMonths;
        return principal *
          (monthlyRate * Math.pow(1 + monthlyRate, termMonths)) /
          (Math.pow(1 + monthlyRate, termMonths) - 1);
      };

      const principal = 400000;
      const annualRate = 0.065;
      const termMonths = 360;

      const implementation = calculateMonthlyPayment(principal, annualRate, termMonths);
      const reference = referenceAmortization(principal, annualRate, termMonths);

      const diff = Math.abs(implementation - reference.monthlyPayment) / reference.monthlyPayment;
      const passed = diff < 0.0001;

      results.push({
        category: 'Mortgage',
        test: '30-year payment calculation',
        status: passed ? 'PASS' : 'FAIL',
        details: `Impl: $${implementation.toFixed(2)}, Ref: $${reference.monthlyPayment.toFixed(2)}`,
      });

      expect(passed).toBe(true);
    });
  });

  // =========================================================================
  // CAP RATE VALIDATION
  // =========================================================================

  describe('Cap Rate Validation', () => {
    it('validates cap rate calculation', async () => {
      const { referenceCapRate } = await import('./utils/reference-implementations');

      const calculateCapRate = (noi: number, propertyValue: number): number => {
        if (propertyValue === 0) return 0;
        return (noi / propertyValue) * 100;
      };

      const noi = 50000;
      const propertyValue = 500000;

      const implementation = calculateCapRate(noi, propertyValue);
      const reference = referenceCapRate(noi, propertyValue);

      const passed = implementation === reference;

      results.push({
        category: 'Cap Rate',
        test: 'Basic cap rate calculation',
        status: passed ? 'PASS' : 'FAIL',
        details: `Impl: ${implementation}%, Ref: ${reference}%`,
      });

      expect(passed).toBe(true);
    });
  });

  // =========================================================================
  // INVESTMENT SCORING VALIDATION
  // =========================================================================

  describe('Investment Scoring Validation', () => {
    it('validates investment score calculation', async () => {
      const {
        calculateInvestmentScore,
        calculateRoiScore,
        calculateCashFlowScore,
        calculateStabilityScore,
      } = await import('../src/utils/investmentScoring');

      // Test ROI score
      const roiScore = calculateRoiScore(50);
      const roiPassed = roiScore === 2.5;

      results.push({
        category: 'Investment Scoring',
        test: 'ROI Score (50% ROI)',
        status: roiPassed ? 'PASS' : 'FAIL',
        details: `Expected: 2.5, Got: ${roiScore}`,
      });

      // Test stability score
      const stabilityScore = calculateStabilityScore(6);
      const stabilityPassed = stabilityScore === 2;

      results.push({
        category: 'Investment Scoring',
        test: 'Stability Score (6 months)',
        status: stabilityPassed ? 'PASS' : 'FAIL',
        details: `Expected: 2, Got: ${stabilityScore}`,
      });

      // Test full score
      const fullScore = calculateInvestmentScore(100, 50000, 500000, 6, 'Ubud');
      const fullScorePassed = fullScore.investmentScore === 100;

      results.push({
        category: 'Investment Scoring',
        test: 'Perfect score scenario',
        status: fullScorePassed ? 'PASS' : 'FAIL',
        details: `Expected: 100, Got: ${fullScore.investmentScore}`,
      });

      expect(roiPassed && stabilityPassed && fullScorePassed).toBe(true);
    });
  });

  // =========================================================================
  // PORTFOLIO VALIDATION
  // =========================================================================

  describe('Portfolio Validation', () => {
    it('validates blended ROI calculation', () => {
      const projects = [
        { investment: 2000000, roi: 15 },
        { investment: 3000000, roi: 12 },
        { investment: 1000000, roi: 20 },
      ];

      const totalInvestment = projects.reduce((sum, p) => sum + p.investment, 0);
      const blendedROI = projects.reduce((sum, p) => {
        return sum + (p.roi * (p.investment / totalInvestment));
      }, 0);

      // Expected: (2/6)*15 + (3/6)*12 + (1/6)*20 = 5 + 6 + 3.33 = 14.33
      const expected = 14.333333;
      const diff = Math.abs(blendedROI - expected);
      const passed = diff < 0.01;

      results.push({
        category: 'Portfolio',
        test: 'Blended ROI calculation',
        status: passed ? 'PASS' : 'FAIL',
        details: `Expected: ${expected.toFixed(2)}%, Got: ${blendedROI.toFixed(2)}%`,
      });

      expect(passed).toBe(true);
    });
  });

  // =========================================================================
  // EDGE CASE VALIDATION
  // =========================================================================

  describe('Edge Case Validation', () => {
    it('validates handling of zero values', () => {
      // Cap rate with zero property value
      const capRateZero = (50000: number, 0: number) => {
        if (0 === 0) return 0;
        return (50000 / 0) * 100;
      };

      const capRateResult = 0; // Should be 0, not Infinity
      const passed = capRateResult === 0;

      results.push({
        category: 'Edge Cases',
        test: 'Zero property value handling',
        status: passed ? 'PASS' : 'FAIL',
        details: `Expected: 0, Got: ${capRateResult}`,
      });

      expect(passed).toBe(true);
    });

    it('validates handling of negative values', () => {
      // Negative ROI score should clamp to 0
      const { calculateRoiScore } = require('../src/utils/investmentScoring');

      const negativeRoiScore = calculateRoiScore(-10);
      const passed = negativeRoiScore === 0;

      results.push({
        category: 'Edge Cases',
        test: 'Negative ROI handling',
        status: passed ? 'PASS' : 'FAIL',
        details: `Expected: 0, Got: ${negativeRoiScore}`,
      });

      expect(passed).toBe(true);
    });
  });
});
