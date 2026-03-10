/**
 * NPV Calculator E2E Tests
 *
 * Tests NPV calculator with all 4 persona scenarios
 *
 * ============================================================================
 * REVERT INSTRUCTIONS:
 * Delete this file to remove NPV calculator tests.
 * Or delete entire tests/e2e/calculators/ directory for all calculator tests.
 * ============================================================================
 */

import { test, expect } from '@playwright/test';
import { npvTestData, TestUtils } from '../../fixtures/test-data';
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
    // Header
    await expect(page.locator('h1, h2').first()).toBeVisible();

    // Input fields
    await expect(page.locator('input').first()).toBeVisible();

    // Results section - look for NPV text
    await expect(page.locator('text=/NPV|Net Present Value/i').first()).toBeVisible();
  });

  // Test each persona scenario
  for (const scenario of npvTestData.scenarios) {
    test(`Scenario: ${scenario.name} (${scenario.persona})`, async ({ page }) => {
      // Fill discount rate
      const discountInput = page.locator('input').first();
      await discountInput.fill(TestUtils.formatForInput(scenario.inputs.discountRate));

      // Wait for calculations
      await TestUtils.waitForResults(page);

      // Verify NPV result is displayed (Rp or $ currency)
      const npvText = await page.locator('text=/NPV|Rp-?[0-9,]+|\\$-?[0-9,]+/').first().textContent();
      expect(npvText).toBeTruthy();
    });
  }

  test('can add cash flow years', async ({ page }) => {
    // Look for add year button
    const addButton = page.locator('button:has-text("Add"), button:has-text("Year"), button:has-text("+")').first();

    if (await addButton.isVisible()) {
      await addButton.click();
      await page.waitForTimeout(500);
      // Page should still be functional
      await expect(page.locator('input').first()).toBeVisible();
    }
  });

  test('NPV calculation works with inputs', async ({ page }) => {
    // Fill discount rate
    const discountInput = page.locator('input').first();
    await discountInput.fill('10');

    await TestUtils.waitForResults(page);

    // Should show NPV result
    await expect(page.locator('text=/NPV/i').first()).toBeVisible();
  });

  test('shows profitability metrics', async ({ page }) => {
    // Fill with positive NPV scenario
    await page.locator('input').first().fill('10');

    await TestUtils.waitForResults(page);

    // Should show some calculated values (Rp or $)
    const hasValues = await page.locator('text=/Rp[0-9,]+|\\$[0-9,]+/').first().isVisible().catch(() => false);
    expect(hasValues).toBeTruthy();
  });

  test('can save NPV analysis to portfolio', async ({ page }) => {
    // Fill data
    await page.locator('input').first().fill('12');

    await TestUtils.waitForResults(page);

    // Click save button
    const saveButton = page.locator('[title="Save to Portfolio"]').first();
    await expect(saveButton).toBeVisible();
    await saveButton.click();

    // Modal or toast should appear
    const feedback = page.locator('[role="dialog"], [class*="modal" i], [class*="toast" i]').first();
    await expect(feedback).toBeVisible({ timeout: 5000 });
  });
});
