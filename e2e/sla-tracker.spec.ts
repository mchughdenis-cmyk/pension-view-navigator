import { test, expect } from '@playwright/test'

test('SLA tracker lists seeded cases with progress bars', async ({ page }) => {
  await page.goto('/sla-tracker')
  await expect(page.getByRole('heading', { name: /SLA/i }).first()).toBeVisible()
  // At least one progress bar from seed data
  await expect(page.locator('[role="progressbar"]').first()).toBeVisible({ timeout: 10_000 })
})
