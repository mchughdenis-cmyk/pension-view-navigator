## Fix broken links + confirm end-to-end flows

### Problem
"Death claims / bereavement" and "Pension sharing orders (divorce)" in the Admin nav both point at `/admin?tab=death-claims` and `/admin?tab=psos`, but `Admin.tsx` has no handlers for those query tabs — so clicking them just lands on the Admin landing with nothing extra rendered. The underlying tables (`death_claims`, `death_benefit_payments`, `pension_sharing_orders`) already exist.

### Fix — two new admin pages
Build these using the same pattern as the recently-added Phase-1 pages (`CETVQuotes`, `RetirementQuotes`, `BreachRegister`, etc.): `PageHeader`, client picker, table listing, "New …" dialog, four-eyes toggle where relevant, audit-log write.

1. **`src/pages/admin/DeathClaims.tsx`** → route `/death-claims`
   - Reads/writes `death_claims` (notification date, claimant, cause, docs received, status: notified → verifying → calculating → paid → closed).
   - Nested payments panel on `death_benefit_payments` (lump sum / dependant's pension / annuity purchase, LSDBA usage against `lsa_lsdba_ledger`, tax treatment pre/post age 75).
   - Beneficiary preview pulled from `beneficiaries` for the selected member.
2. **`src/pages/admin/PensionSharingOrders.tsx`** → route `/pension-sharing`
   - Reads/writes `pension_sharing_orders` (court order ref, transferor/transferee, percentage, cash-equivalent, implementation deadline = 4 months from receipt, status: received → valuing → implemented → discharged).
   - Actions: request CETV, generate discharge notice, mark implemented, produce implementation statement.
3. **Wire-up**
   - Register both routes in `src/App.tsx` behind adviser/admin `RoleGate`.
   - Update the two `navConfig.ts` entries to point at `/death-claims` and `/pension-sharing`.

### Confirmation of the requested end-to-end flows
No code change — this is a walkthrough of what already exists so you know where to click:

| Flow | Where it lives | Backing table(s) |
|---|---|---|
| Client onboarding | `/onboarding` (`ClientOnboarding.tsx`) + `/onboarding-progress` tracker | `clients`, `kyc_cases`, `fact_finds` |
| Contribution add / expectation | `/client-services` → *Contribution* tab, plus `/contribution-chaser` for expected-vs-received | `contributions`, `dd_mandates` |
| Direct debit request | `/direct-debit` (`DirectDebitCollections.tsx`) → "New mandate" | `dd_mandates` |
| Transfer in — Origo | `/origo-transfers` | `origo_transfers`, `transfers_in` |
| Transfer in — manual | `/transfer` (`TransferWizard`) | `transfers_in`, `activity_log` |
| Daily banking file reconciliation | `/bank-upload` → Match → Allocate → Apply, then `/unallocated-cash` for exceptions, `/cass-recon` for CASS breaks | `bank_files`, `bank_file_entries`, `cass_reconciliations` |
| Drawdown — FAD designation | `/drawdown` | `bce_events`, `crystallisation_segments` |
| Drawdown — regular | `/drip-feed` | `bce_events`, `paye_calculations` |
| Drawdown — UFPLS | `/instant-withdrawal` or `/client-services` → *Drawdown* | `bce_events`, `paye_calculations` |
| Benefits taken (retirement quote → wake-up → crystallisation) | `/retirement-quotes` → `/cetv` → `/drawdown` | `retirement_quotes`, `wake_up_events`, `bce_events`, `lsa_lsdba_ledger` |

After building the two pages I'll spot-check each of the above routes loads and the primary "create" action writes to its table.

### Technical notes
- Reuse `useClientData` for the client picker, `runWithToast` for mutations, `AsyncState` for list panels.
- All new rows: default `firm_id = current firm`, log to `activity_log` on create/status change (matches existing admin pages).
- No new migrations required — schemas already in place.
