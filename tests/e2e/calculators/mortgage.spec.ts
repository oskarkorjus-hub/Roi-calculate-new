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

test.describe('Mortgage Calculator', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/calculators/mortgage');
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

      // Verify results are displayed (non-zero)
      const resultsText = await page.locator('[class*="result"], [class*="Result"]').first().textContent();
      expect(resultsText).toBeTruthy();

      // Should show monthly payment
      await expect(page.locator('text=/\\$[0-9,]+/').first()).toBeVisible();
    });
  }

  test('can save to portfolio', async ({ page }) => {
    // Fill basic data
    const inputs = page.locator('input');
    await inputs.first().fill('500000');
    await inputs.nth(1).fill('7.5');
    await inputs.nth(2).fill('30');

    await TestUtils.waitForResults(page);

    // Click save button
    const saveButton = page.locator('button:has-text("Save"), button:has-text("Portfolio")').first();
    await saveButton.click();

    // Should show save modal or confirmation
    await expect(page.locator('[class*="modal"], [class*="Modal"], [role="dialog"]').first()).toBeVisible();
  });

  test('can generate report', async ({ page }) => {
    // Fill basic data
    const inputs = page.locator('input');
    await inputs.first().fill('500000');
    await inputs.nth(1).fill('7.5');
    await inputs.nth(2).fill('30');

    await TestUtils.waitForResults(page);

    // Click report button
    const reportButton = page.locator('button:has-text("Report"), button:has-text("PDF")').first();
    await reportButton.click();

    // Should show report modal
    await expect(page.locator('[class*="modal"], [class*="Modal"], [role="dialog"]').first()).toBeVisible();
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
    await expect(page.locator('text=/\\$[0-9,]+/')).toBeVisible();
  });
});
