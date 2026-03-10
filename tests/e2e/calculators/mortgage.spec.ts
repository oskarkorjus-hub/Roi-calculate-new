/**
 * Mortgage Calculator E2E Tests
 *
 * Tests mortgage calculator with all 4 persona scenarios
 *
 * ============================================================================
 * REVERT INSTRUCTIONS:
 * Delete this file to remove mortgage calculator tests.
 * Or delete entire tests/e2e/calculators/ directory for all calculator tests.
 * ============================================================================
 */

import { test, expect } from '@playwright/test';
import { mortgageTestData, TestUtils } from '../../fixtures/test-data';
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
    // Header
    await expect(page.locator('h1:has-text("Mortgage")')).toBeVisible();

    // Input fields should be visible
    await expect(page.locator('input').first()).toBeVisible();

    // Results section should exist
    await expect(page.locator('text=/monthly|payment/i').first()).toBeVisible();
  });

  // Test each persona scenario
  for (const scenario of mortgageTestData.scenarios) {
    test(`Scenario: ${scenario.name} (${scenario.persona})`, async ({ page }) => {
      // Fill in loan amount
      const loanInput = page.locator('input').first();
      await loanInput.fill(TestUtils.formatForInput(scenario.inputs.loanAmount));

      // Fill in interest rate
      const rateInputs = page.locator('input');
      if (await rateInputs.nth(1).isVisible()) {
        await rateInputs.nth(1).fill(TestUtils.formatForInput(scenario.inputs.interestRate));
      }

      // Fill in loan term
      if (await rateInputs.nth(2).isVisible()) {
        await rateInputs.nth(2).fill(TestUtils.formatForInput(scenario.inputs.loanTermYears));
      }

      // Wait for calculations
      await TestUtils.waitForResults(page);

      // Should show monthly payment (Rp or $ currency)
      await expect(page.locator('text=/Rp[0-9,]+|\\$[0-9,]+/').first()).toBeVisible();
    });
  }

  test('can save to portfolio', async ({ page }) => {
    // Fill basic data
    const inputs = page.locator('input');
    await inputs.first().fill('500000');
    await inputs.nth(1).fill('7.5');
    await inputs.nth(2).fill('30');

    await TestUtils.waitForResults(page);

    // Click save button (icon button with title)
    const saveButton = page.locator('[title="Save to Portfolio"]').first();
    await expect(saveButton).toBeVisible();
    await saveButton.click();

    // Should show save modal or toast confirmation
    const modal = page.locator('[role="dialog"], [class*="modal" i], [class*="toast" i]').first();
    await expect(modal).toBeVisible({ timeout: 5000 });
  });

  test('can generate report', async ({ page }) => {
    // Fill basic data
    const inputs = page.locator('input');
    await inputs.first().fill('500000');
    await inputs.nth(1).fill('7.5');
    await inputs.nth(2).fill('30');

    await TestUtils.waitForResults(page);

    // Click report button (icon button with title)
    const reportButton = page.locator('[title="Export PDF report"]').first();
    await expect(reportButton).toBeVisible();
    await reportButton.click();

    // Should show report preview modal
    const modal = page.locator('[role="dialog"], [class*="modal" i]').first();
    await expect(modal).toBeVisible({ timeout: 5000 });
  });

  test('handles edge cases - zero values', async ({ page }) => {
    const inputs = page.locator('input');
    await inputs.first().fill('0');

    // Should handle gracefully (no crashes)
    await TestUtils.waitForResults(page);
    await expect(page.locator('h1')).toBeVisible();
  });

  test('handles edge cases - large values', async ({ page }) => {
    const inputs = page.locator('input');
    await inputs.first().fill('100000000');
    await inputs.nth(1).fill('15');
    await inputs.nth(2).fill('30');

    // Should calculate without errors
    await TestUtils.waitForResults(page);
    await expect(page.locator('text=/Rp[0-9,]+|\\$[0-9,]+/')).toBeVisible();
  });
});
