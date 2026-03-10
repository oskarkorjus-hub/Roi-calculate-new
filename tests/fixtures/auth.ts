/**
 * E2E Test Authentication Helper
 *
 * ============================================================================
 * REVERT INSTRUCTIONS:
 * Delete this file to remove test authentication.
 * ============================================================================
 */

import { Page } from '@playwright/test';

// Test credentials - change these or use environment variables
export const TEST_CREDENTIALS = {
  email: 'ozzkorjus@gmail.com',
  password: 'Volurozz_2005',
};

/**
 * Login to the application
 */
export async function login(page: Page): Promise<boolean> {
  try {
    // Go to login page
    await page.goto('/login');
    await page.waitForTimeout(500);

    // Fill in credentials
    const emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="email" i]').first();
    const passwordInput = page.locator('input[type="password"], input[name="password"]').first();

    await emailInput.fill(TEST_CREDENTIALS.email);
    await passwordInput.fill(TEST_CREDENTIALS.password);

    // Click login button
    const loginButton = page.locator('button[type="submit"], button:has-text("Sign In"), button:has-text("Log In")').first();
    await loginButton.click();

    // Wait for redirect to calculators
    await page.waitForURL('**/calculators**', { timeout: 10000 });

    return true;
  } catch (error) {
    console.error('Login failed:', error);
    return false;
  }
}

/**
 * Check if user is logged in
 */
export async function isLoggedIn(page: Page): Promise<boolean> {
  await page.goto('/calculators');
  await page.waitForTimeout(1000);

  // Check if we see the calculator toolbar (authenticated) or login prompt
  const toolbar = page.locator('[title="Save to Portfolio"]');
  return await toolbar.isVisible().catch(() => false);
}
