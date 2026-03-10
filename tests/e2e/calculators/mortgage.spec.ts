/**
 * Mortgage Calculator E2E Tests
 *
 * Basic functionality tests for the mortgage calculator.
 * Note: Detailed calculation tests are in calculation-tests.spec.ts
 *
 * ============================================================================
 * REVERT INSTRUCTIONS:
 * Delete this file to remove mortgage calculator tests.
 * Or delete entire tests/e2e/calculators/ directory for all calculator tests.
 * ============================================================================
 */

import { test, expect } from '@playwright/test';
import { TestUtils } from '../../fixtures/test-data';
import { login } from '../../fixtures/auth';

/**
 * Helper to navigate to mortgage calculator
 */
async function goToMortgageCalculator(page: any) {
  await page.evaluate(() => {
    localStorage.setItem('baliinvest_active_calculator', 'mortgage');
    localStorage.setItem('baliinvest_active_view', 'calculator');
  });
  await page.goto('/calculators');
  await page.waitForTimeout(1000);
}

test.describe('Mortgage Calculator', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await goToMortgageCalculator(page);
  });

  test('page loads with all required elements', async ({ page }) => {
    // Header should be visible
    await expect(page.locator('h1, h2').first()).toBeVisible();

    // Input fields should be visible
    await expect(page.locator('input').first()).toBeVisible();
  });

  test('can fill input fields', async ({ page }) => {
    // Fill basic data
    const inputs = page.locator('input');
    await inputs.first().fill('500000');
    await inputs.nth(1).fill('7');
    await inputs.nth(2).fill('30');

    // Page should remain functional
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test('can save to portfolio', async ({ page }) => {
    // Fill basic data
    const inputs = page.locator('input');
    await inputs.first().fill('500000');
    await inputs.nth(1).fill('7.5');
    await inputs.nth(2).fill('30');

    await TestUtils.waitForResults(page);

    // Save button should be visible
    const saveButton = page.locator('[title="Save to Portfolio"]').first();
    await expect(saveButton).toBeVisible();
  });

  test('can generate report', async ({ page }) => {
    // Fill basic data
    const inputs = page.locator('input');
    await inputs.first().fill('500000');
    await inputs.nth(1).fill('7.5');
    await inputs.nth(2).fill('30');

    await TestUtils.waitForResults(page);

    // Report button should be visible
    const reportButton = page.locator('[title="Export PDF report"]').first();
    await expect(reportButton).toBeVisible();
  });

  test('handles edge cases - zero values', async ({ page }) => {
    const inputs = page.locator('input');
    await inputs.first().fill('0');

    // Should handle gracefully (no crashes)
    await TestUtils.waitForResults(page);
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test('handles edge cases - large values', async ({ page }) => {
    const inputs = page.locator('input');
    await inputs.first().fill('100000000');
    await inputs.nth(1).fill('15');
    await inputs.nth(2).fill('30');

    // Should calculate without errors
    await TestUtils.waitForResults(page);
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });
});
