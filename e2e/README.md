# Playwright E2E Tests

End-to-end smoke tests covering the critical pension administration paths.

## Setup (one-off)

```bash
bun add -d @playwright/test
bunx playwright install chromium
```

## Run

Against the local dev server (auto-started):
```bash
bunx playwright test
```

Against a deployed preview:
```bash
BASE_URL=https://pension-view-navigator.lovable.app bunx playwright test
```

Open the HTML report:
```bash
bunx playwright show-report
```

## Coverage

| File | Journey |
|------|---------|
| `onboarding.spec.ts` | New client onboarding wizard reaches KYC + completion |
| `origo-transfer.spec.ts` | Create inbound transfer → advance through discovery → quote → option → settlement |
| `cash-warnings.spec.ts` | Cash warnings dashboard surfaces COBS 19.10 / FSCS / CASS 7 alerts |
| `sla-tracker.spec.ts` | SLA tracker lists cases and shows breach/progress states |

These tests assume the demo seed data exists (Origo transfers, SLA cases, client_accounts).
Re-run the seed migrations if assertions about specific seed records fail.
