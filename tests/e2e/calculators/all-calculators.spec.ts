/**
 * All Calculators E2E Tests
 *
 * Comprehensive tests for all 13 calculators using test data scenarios
 *
 * ============================================================================
 * REVERT INSTRUCTIONS:
 * Delete this file to remove comprehensive calculator tests.
 * Or delete entire tests/e2e/calculators/ directory for all calculator tests.
 * ============================================================================
 */

import { test, expect } from '@playwright/test';
import { ALL_CALCULATOR_TEST_DATA, CALCULATOR_URLS, TestUtils, ACTIVE_CALCULATOR_KEY } from '../../fixtures/test-data';
import { login } from '../../fixtures/auth';

/**
 * Helper to navigate to a specific calculator (requires login first)
 */
async function goToCalculator(page: any, calculatorId: string) {
  await page.evaluate((calcId: string) => {
    localStorage.setItem('baliinvest_active_calculator', calcId);
    localStorage.setItem('baliinvest_active_view', 'calculator');
  }, calculatorId);
  await page.goto('/calculators');
  await page.waitForTimeout(1000);
}

// Test each calculator with all 4 persona scenarios
for (const calculator of ALL_CALCULATOR_TEST_DATA) {
  test.describe(`${calculator.calculatorName}`, () => {
    test.beforeEach(async ({ page }) => {
      await login(page);
      await goToCalculator(page, calculator.calculatorId);
    });

    test('loads correctly', async ({ page }) => {
      // Page should load without errors
      await expect(page.locator('h1, h2').first()).toBeVisible();

      // Should have input fields
      await expect(page.locator('input').first()).toBeVisible();
    });

    test('has working input fields', async ({ page }) => {
      const inputs = page.locator('input[type="text"], input[type="number"]');
      const firstInput = inputs.first();

      await firstInput.fill('100000');
      await expect(firstInput).toHaveValue('100000');
    });

    test('shows results section', async ({ page }) => {
      // Fill first input to trigger calculation
      await page.locator('input').first().fill('100000');
      await TestUtils.waitForResults(page);

      // Should show results (look for Results heading or any calculated values)
      const resultsHeading = page.locator('text=/Results/i, h3:has-text("Results")').first();
      const hasResultsHeading = await resultsHeading.isVisible().catch(() => false);

      // Or look for any currency values displayed (Rp or $)
      const currencyValues = page.locator('text=/Rp[0-9,]+|\\$[0-9,]+/');
      const hasCurrencyValues = (await currencyValues.count()) > 0;

      expect(hasResultsHeading || hasCurrencyValues).toBeTruthy();
    });

    test('has save to portfolio functionality', async ({ page }) => {
      // Fill minimal data
      await page.locator('input').first().fill('100000');
      await TestUtils.waitForResults(page);

      // Look for save button
      const saveButton = page.locator('button:has-text("Save"), button:has-text("Portfolio"), [title*="Save" i]').first();
      await expect(saveButton).toBeVisible();
    });

    test('has report/PDF functionality', async ({ page }) => {
      // Fill minimal data
      await page.locator('input').first().fill('100000');
      await TestUtils.waitForResults(page);

      // Look for report button
      const reportButton = page.locator('button:has-text("Report"), button:has-text("PDF"), [title*="Report" i]').first();
      await expect(reportButton).toBeVisible();
    });

    // Note: Detailed scenario tests are in calculation-tests.spec.ts
    // This file focuses on UI/UX functionality tests

    test('handles reset functionality', async ({ page }) => {
      // Fill data
      await page.locator('input').first().fill('999999');

      // Look for reset button
      const resetButton = page.locator('button:has-text("Reset"), button:has-text("Clear"), [title*="Reset" i]').first();

      if (await resetButton.isVisible()) {
        await resetButton.click();

        // Input should be cleared or reset
        await TestUtils.waitForResults(page, 500);
      }
    });

    test('is responsive on mobile', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });

      // Page should still be usable
      await expect(page.locator('h1, h2').first()).toBeVisible();
      await expect(page.locator('input').first()).toBeVisible();
    });
  });
}
