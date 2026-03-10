/**
 * Playwright E2E Test Configuration
 *
 * ============================================================================
 * REVERT INSTRUCTIONS:
 * To remove E2E testing from this project:
 *
 * 1. Delete this file: playwright.config.ts
 * 2. Delete the tests/ directory: rm -rf tests/
 * 3. Remove Playwright dependency: npm uninstall @playwright/test
 * 4. Remove test scripts from package.json:
 *    - "test:e2e"
 *    - "test:e2e:ui"
 *    - "test:e2e:headed"
 * ============================================================================
 */

import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  // Test directory
  testDir: './tests/e2e',

  // Run tests in parallel (reduced workers for stability)
  fullyParallel: true,

  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,

  // Retry failed tests once
  retries: process.env.CI ? 2 : 1,

  // Workers for parallel execution (limit to 3 for stability with auth)
  workers: process.env.CI ? 1 : 3,

  // Global test timeout (45 seconds per test)
  timeout: 45000,

  // Expect timeout (10 seconds for assertions)
  expect: {
    timeout: 10000,
  },

  // Reporter configuration
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['list'],
  ],

  // Shared settings for all projects
  use: {
    // Base URL for tests
    baseURL: 'http://localhost:5173',

    // Collect trace when retrying failed test
    trace: 'on-first-retry',

    // Screenshot on failure
    screenshot: 'only-on-failure',

    // Video on failure
    video: 'on-first-retry',

    // Action timeout
    actionTimeout: 15000,

    // Navigation timeout
    navigationTimeout: 30000,
  },

  // Configure projects - chromium only by default for faster, more reliable tests
  // Run with --project=firefox or --project=webkit to test other browsers
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // Uncomment to test on other browsers:
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },
  ],

  // Run local dev server before tests
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
