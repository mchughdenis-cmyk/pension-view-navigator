import { defineConfig, devices } from '@playwright/test'

/**
 * Playwright E2E tests for Pension Navigator.
 *
 * Run locally:
 *   bun add -d @playwright/test
 *   bunx playwright install chromium
 *   bunx playwright test
 *
 * Set BASE_URL to target a deployed preview, e.g.:
 *   BASE_URL=https://pension-view-navigator.lovable.app bunx playwright test
 */
export default defineConfig({
  testDir: './e2e',
  timeout: 60_000,
  expect: { timeout: 10_000 },
  retries: process.env.CI ? 2 : 0,
  reporter: [['html', { open: 'never' }], ['list']],
  use: {
    baseURL: process.env.BASE_URL ?? 'http://localhost:8080',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  webServer: process.env.BASE_URL ? undefined : {
    command: 'bun run dev',
    url: 'http://localhost:8080',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
})
