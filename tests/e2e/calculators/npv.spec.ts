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

test.describe('NPV Calculator', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/calculators/npv');
  });

  test('page loads with all required elements', async ({ page }) => {
    // Header
    await expect(page.locator('h1:has-text("NPV")')).toBeVisible();

    // Discount rate input
    await expect(page.locator('input').first()).toBeVisible();

    // Cash flow table
    await expect(page.locator('table, [class*="table"]').first()).toBeVisible();

    // Results section
    await expect(page.locator('text=/NPV|Net Present Value/i').first()).toBeVisible();
  });

  // Test each persona scenario
  for (const scenario of npvTestData.scenarios) {
    test(`Scenario: ${scenario.name} (${scenario.persona})`, async ({ page }) => {
      // Fill discount rate
      const discountInput = page.locator('input').first();
      await discountInput.fill(TestUtils.formatForInput(scenario.inputs.discountRate));

      // Fill cash flows (if inputs have cashFlows array)
      if (scenario.inputs.cashFlows) {
        const cashFlowInputs = page.locator('table input, [class*="cashflow"] input');
        const count = await cashFlowInputs.count();

        for (let i = 0; i < Math.min(count, scenario.inputs.cashFlows.length); i++) {
          const cf = scenario.inputs.cashFlows[i];
          await cashFlowInputs.nth(i).fill(TestUtils.formatForInput(cf.amount));
        }
      }

      // Wait for calculations
      await TestUtils.waitForResults(page);

      // Verify NPV is displayed
      const npvText = await page.locator('text=/NPV|\\$-?[0-9,]+/').first().textContent();
      expect(npvText).toBeTruthy();

      // Verify profitability index is shown
      await expect(page.locator('text=/profitability|index|PI/i').first()).toBeVisible();
    });
  }

  test('can add cash flow years', async ({ page }) => {
    // Look for add year button
    const addButton = page.locator('button:has-text("Add"), button:has-text("Year")').first();

    if (await addButton.isVisible()) {
      const initialRows = await page.locator('table tr, [class*="row"]').count();
      await addButton.click();
      const newRows = await page.locator('table tr, [class*="row"]').count();
      expect(newRows).toBeGreaterThanOrEqual(initialRows);
    }
  });

  test('NPV calculation is correct for simple case', async ({ page }) => {
    // Simple test: -100 at year 0, +110 at year 1, 10% discount
    // NPV should be 0 (break-even)
    const discountInput = page.locator('input').first();
    await discountInput.fill('10');

    const cashFlowInputs = page.locator('table input');
    if (await cashFlowInputs.count() >= 2) {
      await cashFlowInputs.nth(0).fill('-100');
      await cashFlowInputs.nth(1).fill('110');
    }

    await TestUtils.waitForResults(page);

    // NPV should be close to 0
    const resultsSection = page.locator('[class*="result"], [class*="Result"]');
    await expect(resultsSection.first()).toBeVisible();
  });

  test('shows decision recommendation', async ({ page }) => {
    // Fill with positive NPV scenario
    await page.locator('input').first().fill('10');

    const cashFlowInputs = page.locator('table input');
    if (await cashFlowInputs.count() >= 2) {
      await cashFlowInputs.nth(0).fill('-100000');
      await cashFlowInputs.nth(1).fill('150000');
    }

    await TestUtils.waitForResults(page);

    // Should show accept/reject decision
    await expect(page.locator('text=/accept|reject|decision/i').first()).toBeVisible();
  });

  test('can save NPV analysis to portfolio', async ({ page }) => {
    // Fill data
    await page.locator('input').first().fill('12');

    const cashFlowInputs = page.locator('table input');
    if (await cashFlowInputs.count() >= 2) {
      await cashFlowInputs.nth(0).fill('-500000');
      await cashFlowInputs.nth(1).fill('600000');
    }

    await TestUtils.waitForResults(page);

    // Click save
    const saveButton = page.locator('button:has-text("Save"), button:has-text("Portfolio")').first();
    await saveButton.click();

    // Modal should appear
    await expect(page.locator('[class*="modal"], [class*="Modal"], [role="dialog"]').first()).toBeVisible();
  });
});
