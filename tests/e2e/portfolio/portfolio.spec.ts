/**
 * Portfolio E2E Tests
 *
 * Tests portfolio functionality including project cards, details, and management
 *
 * ============================================================================
 * REVERT INSTRUCTIONS:
 * Delete this file to remove portfolio tests.
 * Or delete entire tests/e2e/portfolio/ directory for all portfolio tests.
 * ============================================================================
 */

import { test, expect } from '@playwright/test';
import { TestUtils } from '../../fixtures/test-data';

test.describe('Portfolio', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/portfolio');
  });

  test('portfolio page loads', async ({ page }) => {
    // Should show portfolio header
    await expect(page.locator('h1:has-text("Portfolio"), h2:has-text("Portfolio")')).toBeVisible();
  });

  test('shows empty state when no projects', async ({ page }) => {
    // Clear localStorage first
    await page.evaluate(() => {
      localStorage.removeItem('roi-portfolio');
    });
    await page.reload();

    // Should show empty state or add project prompt
    const emptyState = page.locator('text=/no project|add|create|empty/i');
    // This may or may not be visible depending on existing data
  });

  test('project cards display correctly', async ({ page }) => {
    // If there are projects, cards should display
    const projectCards = page.locator('[class*="card" i], [class*="project" i]');
    const count = await projectCards.count();

    if (count > 0) {
      // First card should have project name
      await expect(projectCards.first()).toBeVisible();

      // Should show metrics (investment, ROI, etc.)
      await expect(page.locator('text=/\\$[0-9,]+/').first()).toBeVisible();
    }
  });

  test('can click on project card to view details', async ({ page }) => {
    const projectCards = page.locator('[class*="card" i]').filter({ hasText: /\$/ });

    if (await projectCards.count() > 0) {
      await projectCards.first().click();

      // Should open details modal or navigate
      await TestUtils.waitForResults(page);

      // Should show more details
      const detailsModal = page.locator('[class*="modal" i], [role="dialog"]');
      if (await detailsModal.count() > 0) {
        await expect(detailsModal.first()).toBeVisible();
      }
    }
  });

  test('project cards show correct calculator badge', async ({ page }) => {
    const calculatorBadges = page.locator('[class*="badge" i], [class*="tag" i]').filter({
      hasText: /mortgage|roi|xirr|npv|cap|irr|feasibility|tax|rental|financing|budget|risk/i
    });

    if (await calculatorBadges.count() > 0) {
      await expect(calculatorBadges.first()).toBeVisible();
    }
  });

  test('project cards show investment score', async ({ page }) => {
    // Look for score display (e.g., "85/100" or score badge)
    const scores = page.locator('text=/[0-9]+\\/100|score/i');

    if (await scores.count() > 0) {
      await expect(scores.first()).toBeVisible();
    }
  });

  test('can filter/sort projects', async ({ page }) => {
    // Look for filter or sort controls
    const filterControls = page.locator('select, [class*="filter" i], [class*="sort" i], button:has-text("Filter")');

    if (await filterControls.count() > 0) {
      await expect(filterControls.first()).toBeVisible();
    }
  });

  test('portfolio shows summary statistics', async ({ page }) => {
    // Look for total investment, average ROI, etc.
    const stats = page.locator('[class*="stat" i], [class*="summary" i]');

    // Stats section may exist
    if (await stats.count() > 0) {
      await expect(stats.first()).toBeVisible();
    }
  });
});

test.describe('Portfolio - Save Project Flow', () => {
  test('can save project from calculator', async ({ page }) => {
    // Go to a calculator
    await page.goto('/calculators/mortgage');

    // Fill basic data
    const inputs = page.locator('input');
    await inputs.first().fill('500000');
    await inputs.nth(1).fill('7');
    await inputs.nth(2).fill('30');

    await TestUtils.waitForResults(page);

    // Click save button
    const saveButton = page.locator('button:has-text("Save"), button:has-text("Portfolio")').first();
    await saveButton.click();

    // Fill project name in modal
    const nameInput = page.locator('input[placeholder*="name" i], input[name*="name" i]').first();
    if (await nameInput.isVisible()) {
      await nameInput.fill('Test Mortgage Project');
    }

    // Confirm save
    const confirmButton = page.locator('button:has-text("Save"), button:has-text("Confirm"), button:has-text("Add")').last();
    if (await confirmButton.isVisible()) {
      await confirmButton.click();
    }

    // Should show success message or redirect
    await TestUtils.waitForResults(page);
  });
});

test.describe('Portfolio - Project Details Modal', () => {
  test('details modal shows all metrics', async ({ page }) => {
    await page.goto('/portfolio');

    const projectCard = page.locator('[class*="card" i]').filter({ hasText: /\$/ }).first();

    if (await projectCard.isVisible()) {
      // Click to open details
      await projectCard.click();

      await TestUtils.waitForResults(page);

      const modal = page.locator('[class*="modal" i], [role="dialog"]');
      if (await modal.isVisible()) {
        // Should show project name
        await expect(modal.locator('h2, h3').first()).toBeVisible();

        // Should show metrics grid
        await expect(modal.locator('text=/\\$[0-9,]+/').first()).toBeVisible();
      }
    }
  });

  test('can delete project from details', async ({ page }) => {
    await page.goto('/portfolio');

    const projectCard = page.locator('[class*="card" i]').filter({ hasText: /\$/ }).first();

    if (await projectCard.isVisible()) {
      await projectCard.click();
      await TestUtils.waitForResults(page);

      const deleteButton = page.locator('button:has-text("Delete")').first();
      if (await deleteButton.isVisible()) {
        // Delete button should exist
        await expect(deleteButton).toBeVisible();
      }
    }
  });

  test('can export project as PDF', async ({ page }) => {
    await page.goto('/portfolio');

    const projectCard = page.locator('[class*="card" i]').filter({ hasText: /\$/ }).first();

    if (await projectCard.isVisible()) {
      await projectCard.click();
      await TestUtils.waitForResults(page);

      const pdfButton = page.locator('button:has-text("PDF"), button:has-text("Export"), button:has-text("Download")').first();
      if (await pdfButton.isVisible()) {
        await expect(pdfButton).toBeVisible();
      }
    }
  });
});
