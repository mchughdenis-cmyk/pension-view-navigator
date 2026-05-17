import { test, expect } from '@playwright/test'

test('cash warnings dashboard renders with regulatory alerts', async ({ page }) => {
  await page.goto('/cash-warnings')
  await expect(page.getByText(/Cash warnings/i).first()).toBeVisible()
  // Seed data should produce at least one COBS / CASS / FSCS finding
  await expect(page.getByText(/COBS 19\.10|CASS 7|FSCS/i).first()).toBeVisible({ timeout: 10_000 })
})
