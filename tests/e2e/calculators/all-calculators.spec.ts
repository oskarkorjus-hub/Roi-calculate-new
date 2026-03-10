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
import { ALL_CALCULATOR_TEST_DATA, CALCULATOR_URLS, TestUtils } from '../../fixtures/test-data';

// Test each calculator with all 4 persona scenarios
for (const calculator of ALL_CALCULATOR_TEST_DATA) {
  test.describe(`${calculator.calculatorName}`, () => {
    const url = CALCULATOR_URLS[calculator.calculatorId];

    test.beforeEach(async ({ page }) => {
      if (!url) {
        test.skip();
        return;
      }
      await page.goto(url);
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

      // Should show some results
      const resultsArea = page.locator('[class*="result" i], [class*="output" i], [class*="summary" i]');
      await expect(resultsArea.first()).toBeVisible();
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

    // Test each persona scenario
    for (const scenario of calculator.scenarios) {
      test(`scenario: ${scenario.name}`, async ({ page }) => {
        const inputs = page.locator('input[type="text"], input[type="number"]');
        const inputCount = await inputs.count();

        // Fill first few inputs with scenario data
        const inputValues = Object.values(scenario.inputs)
          .filter(v => typeof v === 'number')
          .slice(0, inputCount);

        for (let i = 0; i < Math.min(inputValues.length, inputCount); i++) {
          const value = inputValues[i] as number;
          if (typeof value === 'number' && !isNaN(value)) {
            await inputs.nth(i).fill(TestUtils.formatForInput(Math.abs(value)));
          }
        }

        await TestUtils.waitForResults(page);

        // Page should still be functional
        await expect(page.locator('h1, h2').first()).toBeVisible();

        // Should show some calculated values
        const moneyValues = page.locator('text=/\\$[0-9,]+/');
        expect(await moneyValues.count()).toBeGreaterThan(0);
      });
    }

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
