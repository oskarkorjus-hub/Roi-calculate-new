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
import { ALL_CALCULATOR_TEST_DATA, CALCULATOR_URLS } from '../../fixtures/test-data';

test.describe('All Calculators - Basic Functionality', () => {
  // Test each calculator loads correctly
  for (const calculator of ALL_CALCULATOR_TEST_DATA) {
    test(`${calculator.calculatorName} - page loads correctly`, async ({ page }) => {
      const url = CALCULATOR_URLS[calculator.calculatorId];
      if (!url) {
        test.skip();
        return;
      }

      await page.goto(url);

      // Should have a header with calculator name
      await expect(page.locator('h1, h2').first()).toBeVisible();

      // Should have input fields
      const inputs = page.locator('input[type="text"], input[type="number"]');
      await expect(inputs.first()).toBeVisible();

      // Should not show any error messages initially
      const errorMessages = page.locator('[class*="error"], [class*="Error"]');
      await expect(errorMessages).toHaveCount(0);
    });

    test(`${calculator.calculatorName} - has save to portfolio button`, async ({ page }) => {
      const url = CALCULATOR_URLS[calculator.calculatorId];
      if (!url) {
        test.skip();
        return;
      }

      await page.goto(url);

      // Look for save/portfolio button
      const saveButton = page.locator('button:has-text("Save"), button:has-text("Portfolio"), [title*="Save"]');
      await expect(saveButton.first()).toBeVisible();
    });

    test(`${calculator.calculatorName} - has report/PDF button`, async ({ page }) => {
      const url = CALCULATOR_URLS[calculator.calculatorId];
      if (!url) {
        test.skip();
        return;
      }

      await page.goto(url);

      // Look for report/PDF button
      const reportButton = page.locator('button:has-text("Report"), button:has-text("PDF"), [title*="Report"]');
      await expect(reportButton.first()).toBeVisible();
    });
  }
});

test.describe('Calculator Navigation', () => {
  test('can navigate between calculators', async ({ page }) => {
    // Start at home
    await page.goto('/');

    // Navigate to calculators page
    await page.click('a:has-text("Calculators"), [href*="calculator"]');

    // Should show calculator grid
    await expect(page.locator('[class*="grid"], [class*="Grid"]').first()).toBeVisible();
  });

  test('calculator cards are clickable', async ({ page }) => {
    await page.goto('/calculators');

    // Click first calculator card
    const calculatorCard = page.locator('[class*="card"], [class*="Card"]').first();
    await calculatorCard.click();

    // Should navigate to calculator page
    await expect(page.url()).toContain('/calculators/');
  });
});
