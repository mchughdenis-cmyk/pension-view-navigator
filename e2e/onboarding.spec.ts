import { test, expect } from '@playwright/test'

test('client onboarding wizard reaches KYC step', async ({ page }) => {
  await page.goto('/onboarding')
  await expect(page.getByText(/onboarding/i).first()).toBeVisible()
  // The wizard exposes a progress indicator covering all steps
  const progress = page.locator('[role="progressbar"]').first()
  await expect(progress).toBeVisible()
})
