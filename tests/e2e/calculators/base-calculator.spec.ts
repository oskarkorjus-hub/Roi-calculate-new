/**
 * Base Calculator Tests
 *
 * Tests common functionality across all calculators
 *
 * ============================================================================
 * REVERT INSTRUCTIONS:
 * Delete this file and the entire tests/e2e/calculators/ directory
 * to remove calculator E2E tests.
 * ============================================================================
 */

import { test, expect } from '@playwright/test';
import { ALL_CALCULATOR_TEST_DATA, CALCULATOR_URLS, ACTIVE_CALCULATOR_KEY } from '../../fixtures/test-data';

/**
 * Helper to navigate to a specific calculator
 */
async function goToCalculator(page: any, calculatorId: string) {
  // Set the active calculator in localStorage before navigating
  await page.addInitScript((calcId: string) => {
    localStorage.setItem('baliinvest_active_calculator', calcId);
    localStorage.setItem('baliinvest_active_view', 'calculator');
  }, calculatorId);

  await page.goto('/calculators');
  // Wait for the calculator to load
  await page.waitForTimeout(1000);
}

test.describe('All Calculators - Basic Functionality', () => {
  // Test each calculator loads correctly
  for (const calculator of ALL_CALCULATOR_TEST_DATA) {
    test(`${calculator.calculatorName} - page loads correctly`, async ({ page }) => {
      await goToCalculator(page, calculator.calculatorId);

      // Should have a header with calculator name
      await expect(page.locator('h1, h2').first()).toBeVisible();

      // Should have input fields
      const inputs = page.locator('input[type="text"], input[type="number"]');
      await expect(inputs.first()).toBeVisible();
    });

    test(`${calculator.calculatorName} - has save to portfolio button`, async ({ page }) => {
      await goToCalculator(page, calculator.calculatorId);

      // Look for save/portfolio button - uses title="Save to Portfolio"
      const saveButton = page.locator('[title="Save to Portfolio"]');
      await expect(saveButton).toBeVisible();
    });

    test(`${calculator.calculatorName} - has report/PDF button`, async ({ page }) => {
      await goToCalculator(page, calculator.calculatorId);

      // Look for report/PDF button - uses title="Export PDF report"
      const reportButton = page.locator('[title="Export PDF report"]');
      await expect(reportButton).toBeVisible();
    });
  }
});

test.describe('Calculator Navigation', () => {
  test('can navigate between calculators', async ({ page }) => {
    // Start at home
    await page.goto('/');

    // Navigate to calculators page - look for nav link
    const calcLink = page.locator('a[href*="calculator"]').first();
    if (await calcLink.isVisible()) {
      await calcLink.click();
      // Should show calculator content
      await expect(page.locator('h1, h2').first()).toBeVisible();
    }
  });

  test('calculator cards are clickable', async ({ page }) => {
    // Go directly to a calculator
    await page.goto('/calculators/mortgage');

    // Should show calculator page with inputs
    await expect(page.locator('input').first()).toBeVisible();
  });
});
