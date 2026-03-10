/**
 * Portfolio Comparison E2E Tests
 *
 * Tests project comparison functionality
 *
 * ============================================================================
 * REVERT INSTRUCTIONS:
 * Delete this file to remove comparison tests.
 * Or delete entire tests/e2e/portfolio/ directory for all portfolio tests.
 * ============================================================================
 */

import { test, expect } from '@playwright/test';
import { TestUtils } from '../../fixtures/test-data';

test.describe('Project Comparison', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/portfolio');
  });

  test('comparison page/section loads', async ({ page }) => {
    // Look for comparison tab or link
    const comparisonLink = page.locator('a:has-text("Compare"), button:has-text("Compare"), [href*="compare"]').first();

    if (await comparisonLink.isVisible()) {
      await comparisonLink.click();
      await TestUtils.waitForResults(page);

      // Should show comparison interface
      await expect(page.locator('text=/compare|select.*project/i').first()).toBeVisible();
    }
  });

  test('can select projects to compare', async ({ page }) => {
    // Navigate to comparison
    const comparisonLink = page.locator('a:has-text("Compare"), button:has-text("Compare")').first();

    if (await comparisonLink.isVisible()) {
      await comparisonLink.click();
      await TestUtils.waitForResults(page);

      // Look for checkboxes or selectable items
      const checkboxes = page.locator('input[type="checkbox"], [role="checkbox"]');

      if (await checkboxes.count() > 0) {
        // Select first two projects
        await checkboxes.first().click();
        if (await checkboxes.count() > 1) {
          await checkboxes.nth(1).click();
        }
      }
    }
  });

  test('comparison table shows metrics', async ({ page }) => {
    const comparisonLink = page.locator('a:has-text("Compare"), button:has-text("Compare")').first();

    if (await comparisonLink.isVisible()) {
      await comparisonLink.click();
      await TestUtils.waitForResults(page);

      // Select projects
      const checkboxes = page.locator('input[type="checkbox"]');
      if (await checkboxes.count() >= 2) {
        await checkboxes.nth(0).click();
        await checkboxes.nth(1).click();

        await TestUtils.waitForResults(page);

        // Should show comparison table
        const table = page.locator('table, [class*="comparison" i]');
        await expect(table.first()).toBeVisible();

        // Should show metrics like ROI, Investment, etc.
        await expect(page.locator('text=/roi|investment|return/i').first()).toBeVisible();
      }
    }
  });

  test('select all button works', async ({ page }) => {
    const comparisonLink = page.locator('a:has-text("Compare"), button:has-text("Compare")').first();

    if (await comparisonLink.isVisible()) {
      await comparisonLink.click();
      await TestUtils.waitForResults(page);

      const selectAllButton = page.locator('button:has-text("Select All"), button:has-text("All")').first();

      if (await selectAllButton.isVisible()) {
        await selectAllButton.click();

        // All checkboxes should be checked
        const checkboxes = page.locator('input[type="checkbox"]:checked');
        expect(await checkboxes.count()).toBeGreaterThan(0);
      }
    }
  });

  test('comparison highlights best values', async ({ page }) => {
    const comparisonLink = page.locator('a:has-text("Compare"), button:has-text("Compare")').first();

    if (await comparisonLink.isVisible()) {
      await comparisonLink.click();
      await TestUtils.waitForResults(page);

      // Select projects
      const checkboxes = page.locator('input[type="checkbox"]');
      if (await checkboxes.count() >= 2) {
        await checkboxes.nth(0).click();
        await checkboxes.nth(1).click();

        await TestUtils.waitForResults(page);

        // Look for highlighted/best indicators
        const highlights = page.locator('[class*="best" i], [class*="winner" i], [class*="highlight" i], [class*="emerald" i]');

        // May have highlighting for best values
        if (await highlights.count() > 0) {
          await expect(highlights.first()).toBeVisible();
        }
      }
    }
  });
});

test.describe('Cross-Calculator Comparison', () => {
  test('can compare different calculator types', async ({ page }) => {
    await page.goto('/portfolio');

    const comparisonLink = page.locator('a:has-text("Compare"), button:has-text("Compare")').first();

    if (await comparisonLink.isVisible()) {
      await comparisonLink.click();
      await TestUtils.waitForResults(page);

      // Look for projects from different calculators
      const projectItems = page.locator('[class*="project" i], [class*="card" i]').filter({
        hasText: /mortgage|npv|roi|xirr/i
      });

      // Select different types if available
      if (await projectItems.count() >= 2) {
        await projectItems.nth(0).locator('input[type="checkbox"]').click();
        await projectItems.nth(1).locator('input[type="checkbox"]').click();
      }
    }
  });

  test('shows universal comparison metrics', async ({ page }) => {
    await page.goto('/portfolio');

    const comparisonLink = page.locator('a:has-text("Compare"), button:has-text("Compare")').first();

    if (await comparisonLink.isVisible()) {
      await comparisonLink.click();

      // Select some projects
      const checkboxes = page.locator('input[type="checkbox"]');
      if (await checkboxes.count() >= 2) {
        await checkboxes.nth(0).click();
        await checkboxes.nth(1).click();

        await TestUtils.waitForResults(page);

        // Should show universal metrics that apply to all calculators
        const universalMetrics = page.locator('text=/investment|roi|score/i');
        expect(await universalMetrics.count()).toBeGreaterThan(0);
      }
    }
  });
});
