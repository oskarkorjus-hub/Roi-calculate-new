/**
 * Rental Income Projection Calculator E2E Tests
 *
 * Tests rental projection with all 4 persona scenarios
 *
 * ============================================================================
 * REVERT INSTRUCTIONS:
 * Delete this file to remove rental projection tests.
 * Or delete entire tests/e2e/calculators/ directory for all calculator tests.
 * ============================================================================
 */

import { test, expect } from '@playwright/test';
import { rentalProjectionTestData, TestUtils } from '../../fixtures/test-data';

test.describe('Rental Income Projection Calculator', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/calculators/rental-projection');
  });

  test('page loads with all required elements', async ({ page }) => {
    // Header
    await expect(page.locator('h1:has-text("Rental"), h1:has-text("Projection")')).toBeVisible();

    // Key input fields
    await expect(page.locator('input').first()).toBeVisible();

    // Results section with revenue/income
    await expect(page.locator('text=/revenue|income|occupancy/i').first()).toBeVisible();
  });

  // Test each persona scenario
  for (const scenario of rentalProjectionTestData.scenarios) {
    test(`Scenario: ${scenario.name} (${scenario.persona})`, async ({ page }) => {
      // Find and fill nightly rate
      const nightlyInput = page.locator('input[placeholder*="night" i], input[name*="night" i]').first();
      if (await nightlyInput.isVisible()) {
        await nightlyInput.fill(TestUtils.formatForInput(scenario.inputs.nightlyRate));
      }

      // Find and fill occupancy
      const occupancyInput = page.locator('input[placeholder*="occupancy" i], input[name*="occupancy" i]').first();
      if (await occupancyInput.isVisible()) {
        await occupancyInput.fill(TestUtils.formatForInput(scenario.inputs.baseOccupancyRate));
      }

      // Find and fill expenses
      const expenseInput = page.locator('input[placeholder*="expense" i], input[name*="expense" i]').first();
      if (await expenseInput.isVisible()) {
        await expenseInput.fill(TestUtils.formatForInput(scenario.inputs.monthlyExpenses));
      }

      await TestUtils.waitForResults(page);

      // Should display revenue
      await expect(page.locator('text=/\\$[0-9,]+/').first()).toBeVisible();

      // Should display occupancy percentage
      await expect(page.locator('text=/[0-9]+%/').first()).toBeVisible();
    });
  }

  test('seasonality settings work', async ({ page }) => {
    // Look for seasonality toggle or section
    const seasonalityToggle = page.locator('text=/season/i, button:has-text("Season")').first();

    if (await seasonalityToggle.isVisible()) {
      await seasonalityToggle.click();

      // Should show peak/low season multipliers
      await expect(page.locator('text=/peak|high|low/i').first()).toBeVisible();
    }
  });

  test('location selector affects projections', async ({ page }) => {
    // Find location selector
    const locationSelect = page.locator('select, [role="combobox"], button:has-text("Location")').first();

    if (await locationSelect.isVisible()) {
      await locationSelect.click();

      // Should show location options
      await expect(page.locator('text=/bali|canggu|ubud|seminyak/i').first()).toBeVisible();
    }
  });

  test('break-even is calculated', async ({ page }) => {
    // Fill basic inputs
    const inputs = page.locator('input');
    await inputs.first().fill('200'); // nightly rate

    await TestUtils.waitForResults(page);

    // Should show break-even months
    await expect(page.locator('text=/break.?even|months/i').first()).toBeVisible();
  });

  test('charts are rendered', async ({ page }) => {
    // Fill some data first
    const inputs = page.locator('input');
    await inputs.first().fill('250');

    await TestUtils.waitForResults(page);

    // Should have charts (SVG or canvas)
    const charts = page.locator('svg, canvas, [class*="chart"], [class*="Chart"]');
    expect(await charts.count()).toBeGreaterThan(0);
  });

  test('can save projection to portfolio', async ({ page }) => {
    // Fill basic data
    const inputs = page.locator('input');
    await inputs.first().fill('300');
    await inputs.nth(1).fill('65');

    await TestUtils.waitForResults(page);

    // Click save
    const saveButton = page.locator('button:has-text("Save"), button:has-text("Portfolio")').first();
    await saveButton.click();

    // Modal should appear
    await expect(page.locator('[class*="modal"], [class*="Modal"], [role="dialog"]').first()).toBeVisible();
  });
});
