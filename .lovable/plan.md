## Add Payroll processing to Admin Daily admin desk

Add a new **Payroll processing** item at the top of the Admin "Daily admin desk" group with a dedicated route and an end-to-end workflow page that flows from employer file upload through to contribution handoff.

### 1. Navigation

Edit `src/components/nav/navConfig.ts`:
- Insert a new item in `NAV_BY_ROLE.admin` "Daily admin desk" group, positioned just above **Contributions**:
  - Label: `Payroll processing`
  - Route: `/payroll-processing`
  - Icon: `FileSpreadsheet` (lucide)

### 2. New route

Register `/payroll-processing` in `src/App.tsx` (Admin/Adviser only, gated same as other admin pages) pointing to a new `PayrollProcessing` page.

### 3. New page: `src/pages/PayrollProcessing.tsx`

A single-page workflow with a stepper showing progress and the ability to jump between steps:

```text
1. Upload  →  2. Parse & validate  →  3. Match members  →  4. Calculate  →  5. Review & approve  →  6. Hand off to Contributions
```

**Step 1 – Upload**
- Drag-and-drop area accepting `.csv`, `.xlsx` payroll files
- Employer/scheme selector (dropdown of clients with an employer flag)
- Pay period (month/year), pay frequency, pay date
- File stored in the existing `client-documents` bucket under `payroll/{scheme}/{period}/`

**Step 2 – Parse & validate**
- Client-side CSV/XLSX parse (existing `xlsx` skill patterns; use SheetJS already common in the project or add `papaparse` for CSV)
- Column mapping UI (NI number, name, pensionable pay, employee contrib, employer contrib, AVC, salary sacrifice flag)
- Validation summary: row count, totals, duplicates, missing NI numbers, negative values

**Step 3 – Match members**
- Auto-match rows to scheme members by NI number, then name fallback
- Unmatched rows list with actions: link to existing member, create new member stub, or exclude

**Step 4 – Calculate**
- Apply tax relief method per member (RAS vs net pay) — read from scheme config
- Compute grossed-up amounts for RAS, apply salary sacrifice logic, split employee/employer/AVC
- Show per-member breakdown and scheme-level totals; flag members over £60k annual allowance (link to AA carry-forward)

**Step 5 – Review & approve**
- Summary card: total employee, employer, AVC, tax relief reclaim, member count
- Four-eyes approval hook (uses existing `four_eyes_approvals` table pattern)
- Discrepancy report vs previous period

**Step 6 – Hand off to Contributions**
- On approve, insert rows into existing `contributions` table (one per member) with `source = 'payroll'` and a shared `payroll_run_id`
- Queue RAS reclaim lines in `ras_reclaim_lines` for RAS members
- Redirect to `/contributions` filtered to the new run; show a toast with the run id

### 4. Data model (migration)

Two new tables to track the run itself (contribution rows continue to live in `contributions`):

- `payroll_runs` — scheme_id, employer_client_id, period_start, period_end, pay_date, frequency, source_file_path, status (`draft` | `parsed` | `matched` | `calculated` | `approved` | `posted`), totals jsonb, uploaded_by, approved_by, created_at, updated_at
- `payroll_run_lines` — payroll_run_id, member_client_id (nullable until matched), raw_row jsonb, ni_number, full_name, pensionable_pay, employee_contrib, employer_contrib, avc, salary_sacrifice bool, match_status, exception_reason, contribution_id (set after post), created_at

Both with standard grants (`authenticated`, `service_role`), RLS enabled, policies restricted to users with `admin` role via `public.has_role(auth.uid(), 'admin')`, and `updated_at` trigger on `payroll_runs`.

Add `payroll_run_id uuid` nullable column to `contributions` to link posted rows back to their run.

### 5. Supporting components

- `src/components/payroll/PayrollUpload.tsx`
- `src/components/payroll/PayrollColumnMapper.tsx`
- `src/components/payroll/PayrollMemberMatch.tsx`
- `src/components/payroll/PayrollCalculation.tsx`
- `src/components/payroll/PayrollReview.tsx`
- `src/lib/payroll.ts` — parsing, validation, RAS/net-pay/salary-sacrifice calculations, handoff helper

### Technical notes

- All amounts stored in pence (bigint) consistent with the rest of the codebase; UI formats as GBP.
- Uses existing `useClientData` audit-log pattern so every step writes to `activity_log`.
- No changes to existing Contributions page beyond it picking up rows tagged with `source = 'payroll'`.
- UK 2024/25 rules: £60k AA, MPAA £10k, RAS at 20% basic rate.
