## Goal
Align the Admin daily desks with mainstream pension admin systems (Bravura Sonata, Aquila Heywood, Procentia IntelliPen, Civica UPM, Delta Financial Systems). Reposition payroll as a full process (not just a file import), give the bank reconciliation a proper file upload entry, and fill the gaps at book-of-business and client level.

## 1. Payroll — process, not "import"

Rename `Payroll file import & run` → **`Payroll processing`** (route unchanged at `/payroll-processing`, page already implements a 6-step process).

Add sibling items so the payroll workflow reads as a process, matching how Bravura/Heywood expose it:

- **Payroll processing** (`/payroll-processing`) — end-to-end run
- **Contribution schedules** (`/contributions`) — expected vs received, chase overdue schedules
- **RAS reclaim (monthly)** (`/paye`) — HMRC tax relief at source claim
- **Late-payment monitoring** — new small view flagged against `contributions` (SLA / TPR reportable breach)
- **Refunds of contributions** — short-service refunds / over-limit refunds

## 2. Bank reconciliation — add upload

Split the current single "Bank file import"/"Bank reconciliation (CASS)" entry (both pointed at `/cass`) into a clean two-step flow:

- **Bank statement upload** → `/cass?tab=upload` (opens the existing `BankUpload` component within CASSReconciliation, no new route needed)
- **Bank reconciliation (CASS 7/8)** → `/cass` (match / break / clear)
- **Cash breaks & CASS breaches** → `/cass?tab=breaches`

CASSReconciliation already has tabs; wire the sidebar links to open the right tab via query string. No schema changes.

## 3. Book-of-business daily desk — gaps vs peer systems

Add items commonly present in Bravura Sonata / Heywood Altair / Procentia:

- **Contribution schedules** (expected vs received tracker)
- **Direct debit collections run** (`/dealing` placeholder or new stub) — bulk DD sweep
- **Bulk valuation / unit pricing run** — nightly NAV / price import monitor (surfaces `market_prices` + `daily-valuations` edge fn)
- **Corporate actions processing** (`/admin?tab=corporate-actions`) — elections deadline queue
- **Rebalance runs** (`/admin?tab=rebalancing`) — scheme-wide model drift
- **Fee run (monthly)** (`/admin?tab=fees`) — periodic fee engine
- **Statement production run** — batch ABS / SMPI generation
- **Regulator returns** (`/admin?tab=regulatory`) — TPR scheme return, FCA RegData
- **Four-eyes approvals queue** (`/admin?tab=approvals`) — maker/checker for bulk ops

## 4. Client-level daily desk — gaps vs peer systems

Add member-record tasks standard in the same peer systems:

- **Beneficiary nominations** (`/beneficiaries`)
- **Expression of wish updates** — grouped with beneficiaries
- **Death claims / bereavement** (`/admin?tab=death-claims`) — already have `death_claims` and `death_benefit_payments` tables
- **Pension sharing orders (divorce)** (`/admin?tab=psos`) — table exists
- **Complaints handling** — add as ops case type; link to `ops_cases`
- **Tax code changes / P45/P46 handling** — sub-view of member details
- **Address / bank / GDPR requests** — grouped under member details
- **Vulnerable customer flags** (`/vulnerable`) — surface at client level too
- **Annual allowance / carry-forward checks** (`aa_carry_forward` table exists)
- **Crystallisation events review** — LSA/LSDBA already there, add BCE event log

## 5. What actually changes in this pass

Nav-only restructure of `src/components/nav/navConfig.ts` (Admin role). No new pages required — every target route already exists or is a tab on an existing page. Files:

- `src/components/nav/navConfig.ts` — rewrite Admin "Book-of-business daily desk" and "Client-level daily desk" groups per sections 1–4; rename payroll; split bank into upload + recon.
- `src/components/CASSReconciliation.tsx` — read `?tab=` query param and select the matching tab on mount (small change so the two sidebar entries land on the right sub-view).

No database migrations, no auth changes, no removal of existing pages.

## Out of scope
- Building brand-new pages for items that already have a home (they're linked via existing routes/tabs).
- Any adviser/client sidebar changes — this pass is Admin-only per the request.

Shall I proceed?