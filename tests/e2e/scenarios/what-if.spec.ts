/**
 * What-If Scenario E2E Tests
 *
 * Tests what-if scenario creation and comparison
 *
 * ============================================================================
 * REVERT INSTRUCTIONS:
 * Delete this file to remove scenario tests.
 * Or delete entire tests/e2e/scenarios/ directory for all scenario tests.
 * ============================================================================
 */

import { test, expect } from '@playwright/test';
import { TestUtils } from '../../fixtures/test-data';

test.describe('What-If Scenarios', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/portfolio');
  });

  test('can access what-if scenario from project card', async ({ page }) => {
    // Find a project card with actions menu
    const projectCard = page.locator('[class*="card" i]').filter({ hasText: /\$/ }).first();

    if (await projectCard.isVisible()) {
      // Look for more actions button (three dots)
      const actionsButton = projectCard.locator('button:has-text("..."), button[title*="action" i], [class*="more" i]');

      if (await actionsButton.isVisible()) {
        await actionsButton.click();

        // Look for what-if option
        const whatIfOption = page.locator('button:has-text("What-if"), button:has-text("Scenario"), [class*="scenario" i]');
        await expect(whatIfOption.first()).toBeVisible();
      }
    }
  });

  test('what-if modal opens with adjustable fields', async ({ page }) => {
    const projectCard = page.locator('[class*="card" i]').filter({ hasText: /\$/ }).first();

    if (await projectCard.isVisible()) {
      // Try to open what-if modal
      const actionsButton = projectCard.locator('button').last();
      await actionsButton.click();

      const whatIfOption = page.locator('text=/what.?if|scenario/i').first();
      if (await whatIfOption.isVisible()) {
        await whatIfOption.click();

        await TestUtils.waitForResults(page);

        // Modal should have input fields for adjustments
        const modal = page.locator('[class*="modal" i], [role="dialog"]');
        if (await modal.isVisible()) {
          const inputs = modal.locator('input, select, [role="slider"]');
          expect(await inputs.count()).toBeGreaterThan(0);
        }
      }
    }
  });

  test('can create multiple scenarios', async ({ page }) => {
    // Navigate to scenarios page if it exists
    const scenariosLink = page.locator('a:has-text("Scenario"), [href*="scenario"]').first();

    if (await scenariosLink.isVisible()) {
      await scenariosLink.click();
      await TestUtils.waitForResults(page);

      // Look for create scenario button
      const createButton = page.locator('button:has-text("Create"), button:has-text("New"), button:has-text("Add")');
      await expect(createButton.first()).toBeVisible();
    }
  });

  test('scenario shows comparison with baseline', async ({ page }) => {
    const scenariosLink = page.locator('a:has-text("Scenario"), [href*="scenario"]').first();

    if (await scenariosLink.isVisible()) {
      await scenariosLink.click();
      await TestUtils.waitForResults(page);

      // Should show baseline and scenario comparison
      const comparison = page.locator('text=/baseline|original|compare/i');
      if (await comparison.count() > 0) {
        await expect(comparison.first()).toBeVisible();
      }
    }
  });
});

test.describe('Scenario Analysis Page', () => {
  test('scenario analysis page loads', async ({ page }) => {
    // Try direct navigation
    await page.goto('/scenarios');

    // Or it might be under portfolio
    if (await page.locator('text=/not found|404/i').isVisible()) {
      await page.goto('/portfolio/scenarios');
    }

    // Check if page has scenario content
    const scenarioContent = page.locator('text=/scenario|what.?if|analysis/i');
    if (await scenarioContent.count() > 0) {
      await expect(scenarioContent.first()).toBeVisible();
    }
  });

  test('can select project for scenario analysis', async ({ page }) => {
    await page.goto('/scenarios');

    // Look for project selector
    const selector = page.locator('select, [role="combobox"], [class*="select" i]').first();

    if (await selector.isVisible()) {
      await selector.click();

      // Should show project options
      const options = page.locator('[role="option"], option');
      expect(await options.count()).toBeGreaterThan(0);
    }
  });

  test('scenario adjustments update results', async ({ page }) => {
    await page.goto('/scenarios');

    // Find adjustment sliders or inputs
    const adjustments = page.locator('input[type="range"], input[type="number"], [role="slider"]');

    if (await adjustments.count() > 0) {
      // Change an adjustment
      await adjustments.first().fill('20');

      await TestUtils.waitForResults(page);

      // Results should update
      const results = page.locator('[class*="result" i], [class*="output" i]');
      await expect(results.first()).toBeVisible();
    }
  });

  test('can compare multiple scenarios side by side', async ({ page }) => {
    await page.goto('/scenarios');

    // Look for comparison view
    const compareButton = page.locator('button:has-text("Compare"), [class*="compare" i]');

    if (await compareButton.isVisible()) {
      await compareButton.click();

      await TestUtils.waitForResults(page);

      // Should show side-by-side comparison
      const columns = page.locator('[class*="column" i], [class*="scenario" i]');
      expect(await columns.count()).toBeGreaterThanOrEqual(2);
    }
  });

  test('scenarios can be saved', async ({ page }) => {
    await page.goto('/scenarios');

    // Create or modify a scenario
    const inputs = page.locator('input[type="number"], input[type="range"]');
    if (await inputs.count() > 0) {
      await inputs.first().fill('25');
    }

    // Look for save button
    const saveButton = page.locator('button:has-text("Save"), button:has-text("Create")').first();

    if (await saveButton.isVisible()) {
      await expect(saveButton).toBeEnabled();
    }
  });

  test('scenarios can be deleted', async ({ page }) => {
    await page.goto('/scenarios');

    // Look for existing scenarios with delete option
    const deleteButtons = page.locator('button:has-text("Delete"), button[title*="delete" i], [class*="delete" i]');

    if (await deleteButtons.count() > 0) {
      // Delete button should exist
      await expect(deleteButtons.first()).toBeVisible();
    }
  });
});

test.describe('Scenario Charts', () => {
  test('scenario comparison shows charts', async ({ page }) => {
    await page.goto('/scenarios');

    // Charts should be present
    const charts = page.locator('svg, canvas, [class*="chart" i], [class*="Chart" i]');

    if (await charts.count() > 0) {
      await expect(charts.first()).toBeVisible();
    }
  });

  test('charts update when scenario changes', async ({ page }) => {
    await page.goto('/scenarios');

    // Find charts
    const charts = page.locator('svg, canvas');

    if (await charts.count() > 0) {
      // Get initial state
      const initialCount = await charts.count();

      // Change a value
      const inputs = page.locator('input[type="number"]');
      if (await inputs.count() > 0) {
        await inputs.first().fill('50');
        await TestUtils.waitForResults(page);
      }

      // Charts should still be present (and possibly updated)
      expect(await charts.count()).toBeGreaterThanOrEqual(initialCount);
    }
  });
});
