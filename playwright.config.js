// @ts-check
const { defineConfig, devices } = require('@playwright/test');

/**
 * Playwright configuration for Travlr Getaways E2E Tests
 * Tests both the customer site (port 3000) and admin SPA (port 4200)
 */
module.exports = defineConfig({
  // Look for test files in the e2e directory
  testDir: './e2e',
  globalSetup: './e2e/global-setup.js',

  // Run tests in parallel for speed
  fullyParallel: true,

  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,

  // Retry failed tests once (helps with flaky network issues)
  retries: 1,

  // Use 2 workers locally, 1 on CI for stability
  workers: process.env.CI ? 1 : 2,

  // Reporter - HTML gives nice visual reports
  reporter: 'html',

  // Shared settings for all tests
  use: {
    // Base URL for customer site (most tests use this)
    baseURL: 'http://localhost:3000',

    // Capture screenshot on failure for debugging
    screenshot: 'only-on-failure',

    // Record video on failure
    video: 'retain-on-failure',

    // Trace on failure for debugging
    trace: 'retain-on-failure',
  },

  // Define test projects for different frontends
  projects: [
    {
      name: 'customer-site',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'http://localhost:3000',
      },
      testMatch: /customer\.spec\.js/,
    },
    {
      name: 'admin-spa',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'http://localhost:4200',
      },
      testMatch: /admin\.spec\.js/,
    },
    {
      name: 'auth-tests',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'http://localhost:3000',
      },
      testMatch: /auth\.spec\.js/,
    },
  ],

  // NOTE:
  // If you want Playwright to auto-start servers, uncomment and modify:
  // webServer: [
  //   {
  //     command: 'npm start',
  //     url: 'http://localhost:3000',
  //     reuseExistingServer: true,
  //   },
  //   {
  //     command: 'cd app_admin && npm start',
  //     url: 'http://localhost:4200',
  //     reuseExistingServer: true,
  //   },
  // ],
});