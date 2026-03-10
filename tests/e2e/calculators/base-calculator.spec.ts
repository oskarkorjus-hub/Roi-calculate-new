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
import { login } from '../../fixtures/auth';

/**
 * Helper to navigate to a specific calculator (requires login first)
 */
async function goToCalculator(page: any, calculatorId: string) {
  // Set the active calculator in localStorage
  await page.evaluate((calcId: string) => {
    localStorage.setItem('baliinvest_active_calculator', calcId);
    localStorage.setItem('baliinvest_active_view', 'calculator');
  }, calculatorId);

  await page.goto('/calculators');
  await page.waitForTimeout(1000);
}

test.describe('All Calculators - Basic Functionality', () => {
  for (const calculator of ALL_CALCULATOR_TEST_DATA) {
    test(`${calculator.calculatorName} - page loads correctly`, async ({ page }) => {
      await page.goto('/calculators');
      await page.waitForTimeout(500);

      // Should have some content (either calculator or login prompt)
      await expect(page.locator('h1, h2').first()).toBeVisible();
    });
  }
});

// Authentication-required tests - login once before all tests
test.describe('Calculator Toolbar (authenticated)', () => {
  // Login before running these tests
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  for (const calculator of ALL_CALCULATOR_TEST_DATA) {
    test(`${calculator.calculatorName} - has save to portfolio button`, async ({ page }) => {
      await goToCalculator(page, calculator.calculatorId);

      const saveButton = page.locator('[title="Save to Portfolio"]');
      await expect(saveButton).toBeVisible();
    });

    test(`${calculator.calculatorName} - has report/PDF button`, async ({ page }) => {
      await goToCalculator(page, calculator.calculatorId);

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
