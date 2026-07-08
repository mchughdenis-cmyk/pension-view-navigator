## Gap review — payroll processing & admin daily desks

Benchmarked the new `PayrollProcessing` workflow and the two Admin daily-desk groups against Bravura Sonata, Aquila Heywood Altair, Procentia IntelliPen, Civica UPM and Delta Financial Systems. Below are the missing pieces worth building next, grouped by where they belong.

### A. Payroll processing workflow — gaps

1. **Pre-run comparison to last period** — variance report (headcount, £ pay, £ contribs) vs previous run; flag >10% swings before approval.
2. **Contribution cap checks** — Annual Allowance (£60k), MPAA (£10k) and tapered AA screening per member using `aa_carry_forward`; block or warn.
3. **Salary sacrifice handling** — when sal-sac is on, the employee amount should move to the employer column and NI saving surfaces; currently the flag is captured but not applied to totals.
4. **Refunds & adjustments line type** — negative contribution lines for short-service refunds, over-payments and prior-period corrections.
5. **New joiner / leaver detection** — members enrolled or left mid-period should appear as flagged rows with pro-rata pay prompts.
6. **Opt-in / opt-out register** — capture opt-out dates against members excluded with reason `opt_out`, and auto-refund contributions if within the 1-month opt-out window.
7. **Persist the run reference / preparer / checker** — currently preparer & checker names are captured but not stored; add columns and audit-log entries.
8. **Draft resume** — save a run in progress and resume; today the wizard is in-memory only.
9. **Cash collection instruction** — actually create a `payment_initiations` / `dd_mandates` collection row for the total, rather than only linking to the dealing desk.
10. **RTI FPS payload build** — hand-off currently just navigates to /paye; should insert an `rti_submissions` draft row with the payroll totals attached.

### B. Book-of-business daily desk — still missing

11. **Chase overdue contribution schedules** — TPR requires reporting late payments; needs an overdue tracker with 90-day materiality flag.
12. **Unallocated cash / suspense clearing** — daily task; surface `transactions` where `client_id` is null.
13. **Employer / scheme onboarding & terminations** — new employer setup and scheme wind-up tasks.
14. **Bulk transfer-out (bulk annuity / buy-in / bulk transfer)** — scheme-level exit event.
15. **Corporate governance calendar** — trustee meetings, actuarial valuation prompts, statement of investment principles reviews.
16. **Reg breach register & TPR reportable events** — separate from CASS breaches.

### C. Client-level daily desk — still missing

17. **Retirement quotes / benefit projections queue** — quotes requested by members awaiting production.
18. **Divorce PSO calculations** — pension debit / credit calc, not just tracking.
19. **Transfer value quotations (CETV)** — separate from the transfer-out execution.
20. **Nominee / successor drawdown setup** — post-death continuation, distinct from death claims.
21. **GDPR requests (SAR, erasure, portability)** — mentioned in the nav under member details but no queue/workflow.
22. **Trace / gone-away members** — reunification workflow.
23. **Small pot commutation & trivial commutation** — separate journey from UFPLS/drawdown.

### D. Recommended first slice to build now

Rather than 23 changes at once, propose implementing the highest-value payroll gaps + one new desk workflow:

- **A1** period-vs-period variance panel on step 4
- **A2** AA/MPAA cap checks on step 4
- **A3** salary-sacrifice recalculation on step 3
- **A4** negative/refund line type on step 3
- **A7** persist preparer/checker + audit log entry on approval
- **A9** create `payment_initiations` row on approval
- **A10** create `rti_submissions` draft row on approval
- **B11** new "Contribution schedule chaser" view listing `contributions` with status `expected` and effective_date older than 22nd of the month
- **B12** new "Unallocated cash" queue view

### Files (first-slice implementation)

- `src/pages/PayrollProcessing.tsx` — add variance card, AA/MPAA screening, sal-sac recalculation, refund line UI, persist approvers, insert `payment_initiations` and `rti_submissions` rows on approval.
- `src/pages/admin/ContributionChaser.tsx` (new) — overdue schedule list with chase-email action; add nav item under Book-of-business desk.
- `src/pages/admin/UnallocatedCash.tsx` (new) — suspense queue reading `transactions` with null `client_id`; add nav item.
- `src/App.tsx` — routes for the two new pages.
- `src/components/nav/navConfig.ts` — two new sidebar entries in the book-of-business group.
- No schema migration required (all target tables already exist: `aa_carry_forward`, `payment_initiations`, `rti_submissions`, `contributions`, `transactions`).

### Out of scope this pass

Items C17–C23 and B13–B16 — larger new journeys; flag as backlog and pick individually next.

Approve to build the first slice, or tell me which of the 23 you want prioritised.