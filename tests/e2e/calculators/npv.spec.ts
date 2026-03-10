/**
 * NPV Calculator E2E Tests
 *
 * Basic functionality tests for the NPV calculator.
 * Note: Detailed calculation tests are in calculation-tests.spec.ts
 *
 * ============================================================================
 * REVERT INSTRUCTIONS:
 * Delete this file to remove NPV calculator tests.
 * Or delete entire tests/e2e/calculators/ directory for all calculator tests.
 * ============================================================================
 */

import { test, expect } from '@playwright/test';
import { TestUtils } from '../../fixtures/test-data';
import { login } from '../../fixtures/auth';

/**
 * Helper to navigate to NPV calculator
 */
async function goToNPVCalculator(page: any) {
  await page.evaluate(() => {
    localStorage.setItem('baliinvest_active_calculator', 'npv');
    localStorage.setItem('baliinvest_active_view', 'calculator');
  });
  await page.goto('/calculators');
  await page.waitForTimeout(1000);
}

test.describe('NPV Calculator', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await goToNPVCalculator(page);
  });

  test('page loads with all required elements', async ({ page }) => {
    // Header should be visible
    await expect(page.locator('h1, h2').first()).toBeVisible();

    // Input fields should be visible
    await expect(page.locator('input').first()).toBeVisible();
  });

  test('can fill discount rate', async ({ page }) => {
    // Fill discount rate
    const discountInput = page.locator('input').first();
    await discountInput.fill('10');

    // Page should remain functional
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test('can save to portfolio', async ({ page }) => {
    // Fill data
    await page.locator('input').first().fill('12');

    await TestUtils.waitForResults(page);

    // Save button should be visible
    const saveButton = page.locator('[title="Save to Portfolio"]').first();
    await expect(saveButton).toBeVisible();
  });

  test('can generate report', async ({ page }) => {
    // Fill data
    await page.locator('input').first().fill('10');

    await TestUtils.waitForResults(page);

    // Report button should be visible
    const reportButton = page.locator('[title="Export PDF report"]').first();
    await expect(reportButton).toBeVisible();
  });
});
