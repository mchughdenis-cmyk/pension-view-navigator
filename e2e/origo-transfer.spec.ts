import { test, expect } from '@playwright/test'

/**
 * Origo transfer end-to-end: create a new inbound transfer and walk it
 * through the full state machine to settlement.
 */
test('origo transfer: initiated → settled via state machine', async ({ page }) => {
  await page.goto('/origo-transfers')

  await expect(page.getByRole('heading', { name: /Origo Transfer Service/i })).toBeVisible()

  // Create new transfer
  await page.getByTestId('new-transfer-btn').click()
  await page.getByLabel('Client name').fill('E2E Test Client')
  await page.getByLabel('Client reference').fill('E2E-001')
  await page.getByLabel(/provider/i).fill('Aviva')
  await page.getByLabel(/Transfer value/i).fill('50000')
  await page.getByRole('button', { name: /Initiate/i }).click()

  // Find the row for the newly created transfer (most recent ORG-... ref)
  await page.getByRole('button', { name: /Refresh/i }).click()
  const row = page.locator('tr', { hasText: 'E2E Test Client' }).first()
  await expect(row).toBeVisible()

  // Walk through each action button — discovery → quote → option → settlement
  const advanceLabels = ['Send discovery', 'Request quote', 'Send option to proceed', 'Instruct settlement']
  for (const label of advanceLabels) {
    const btn = row.getByRole('button', { name: new RegExp(label, 'i') })
    await expect(btn).toBeVisible({ timeout: 15_000 })
    await btn.click()
    // wait for the toast confirming the advance
    await expect(page.getByText(/Transfer advanced/i).first()).toBeVisible({ timeout: 10_000 })
  }

  // After settlement the row should show the settled badge
  await expect(row.getByText(/Settled/i)).toBeVisible({ timeout: 10_000 })
})
