
# Gap analysis — Pension Navigator vs full-function pension admin

Benchmarked against Bravura Sonata, Heywood Altair, Procentia IntelliPen, Civica UPM and Delta. The system already covers the majority of daily desk, member events, CASS, HMRC, Origo, drawdown, KYC and MI. The list below is what a fully-functional UK SIPP/SSAS/occupational admin platform still needs.

## A. Scheme & product engine (missing)
1. **Scheme register** — schemes, sections, employers, participating employers, PSTR/PSR numbers, trust deed & rules, effective-dated benefit basis.
2. **Employer register** — PAYE ref, staging/duties date, TPR contact, contribution rates, salary-sacrifice flag, pay reference periods.
3. **Product rules engine** — per-product limits (MPAA, tapered AA, PCLS entitlement, protected TFC, protected pension age, protected retirement age).
4. **Contribution matrix** — employee %/£, employer %/£, matching bands, salary-sacrifice reversal rules, tiered contributions.

## B. Benefit administration (partial → missing)
5. **DB benefit calculator** — CARE and Final Salary revaluation, GMP equalisation, CPI/RPI orders, late-retirement factors.
6. **CETV / transfer value quotation** — trustee-approved factors, guarantee period tracker, safeguarded benefits & advice requirement (>£30k) gate.
7. **Retirement quote pack** — full options illustration (annuity, drawdown, UFPLS, small pots), risk warnings, wake-up packs (age 50/55/60/65).
8. **Small pot commutation (triviality)** — £10k pot rules, three-pot lifetime limit tracker.
9. **Serious ill-health lump sum** — pre-75 tax-free / post-75 marginal, evidence workflow.
10. **Nominee & successor drawdown setup** — separate arrangements, LSDBA tracking.
11. **Pension sharing on divorce (PSO)** — pension debit / credit, external transfer, implementation period, s.24 order register.
12. **Earmarking / attachment orders** — periodic payment schedule, court order register.

## C. Regulatory & statutory (missing / thin)
13. **Event Report (AFT)** — full event catalogue, quarterly submission workflow, HMRC portal file.
14. **Scheme Return (TPR)** — annual return dataset, scheme funding stats, MNT/MND compliance.
15. **Pensions Regulator breach register (s.70)** — decision tree, materiality, submission log.
16. **Chair's Statement / Value for Members** assessment (occupational DC).
17. **Own-risk assessment (ORA)** — for schemes >100 members.
18. **Trustee meeting pack builder** — agenda, minutes, action tracker, conflicts register.
19. **PPF levy data submission** — s179 valuation inputs, contingent asset log.

## D. Money & CASS (partial)
20. **Trustee bank account register** — per-scheme designated & pooled accounts, mandate list, signatory matrix.
21. **Daily CASS internal reconciliation** vs external, break aging & escalation ladder, CMAR return.
22. **Bank payment authorisations** — Faster Payments / CHAPS / Bacs runs with dual authorisation and payment cut-off calendar.
23. **Unclaimed / gone-away money register** — tracing workflow, dormancy timers, dispersal rules.

## E. Investments & assets (partial)
24. **Order management (OMS)** — placement to dealing counterparty, allocation, best-execution evidence, RTS 27/28.
25. **Custody & settlement** — trade confirmations, settlement fails, corporate action elections capture.
26. **Unit-linked pricing** — box management, dilution levy, dual pricing (bid/offer), swing pricing.
27. **Direct property administration** — rent roll, service charge, tenant register, VAT option, dilapidations, insurance.
28. **Loanbacks (SSAS)** — 50% net-assets rule, 5-year amortisation, 1% above base, first-charge register.

## F. Member communications (partial)
29. **Statutory Money Purchase Illustration (SMPI)** — already have runner; need bulk-annual production, AS TM1 v5.0 assumptions library, error/exception queue.
30. **Wake-up packs** — age-triggered issuance calendar, Pension Wise stronger-nudge workflow.
31. **Annual benefit statement (occupational)** — simpler statement template, two-page rule.
32. **Correspondence library** — template versioning, merge fields, print/email/portal channel, delivery evidence, dead-letter handling.
33. **Complaints — IDRP two-stage** — SLA clocks per stage, Ombudsman referral pack builder.

## G. Data quality & governance (missing)
34. **Common & scheme-specific data score** (TPR data quality) — automated scoring, remediation queues.
35. **GDPR request desk** — SAR, erasure, portability with 30-day SLA and evidence pack.
36. **Trace / gone-away workflow** — tracing bureau integration, LOA, evidence log.
37. **Data cleanse projects** — bulk update jobs with maker-checker and rollback.
38. **Benefit rectification projects** — GMP eq, PPF, McCloud-style bulk recalcs with per-member audit.

## H. Workflow & operating model (partial)
39. **Case management** — one queue per work-type, SLA per case, ownership, hand-offs, pause reasons, RCA codes.
40. **Digital forms designer** — member self-service forms with e-sign and evidence upload.
41. **Bulk operations console** — bulk transfer out, bulk revaluation, bulk fee change, bulk correspondence run.
42. **Scheme events calendar** — trustee, corporate governance, regulatory deadlines, fund-manager reviews.
43. **Third-party register** — actuary, auditor, custodian, investment consultant with contract & fee tracker.

## I. Finance (missing)
44. **Fee scheduler** — per-scheme fee model, tiered ad valorem, activity-based, minimum fees, VAT.
45. **Invoicing & billing** — invoice generation, Xero/Sage export, sales-ledger reconciliation.
46. **Adviser remuneration** — initial/ongoing/ad-hoc fees, VAT, adviser statements, clawback rules.

## J. Security, tenancy & platform (partial)
47. **Role & permission matrix UI** — task-level entitlements, four-eyes rule config, delegation.
48. **Multi-tenant scheme partitioning** — data segregation by trustee/scheme, per-tenant branding & templates.
49. **Session security posture** — MFA enrolment, IP allow-list, session length, break-glass access log.
50. **Disaster recovery runbook & data export** — evidenced monthly backup restore.

---

## Recommended Phase-1 slice (proposed to build first)

The most impactful gaps that align with what's already scaffolded and unlock several other items:

1. **Scheme register** (A1) + **Employer register** (A2) — foundational, everything else keys off these.
2. **CETV quotation** (B6) — high-frequency member journey, complements existing transfer-out.
3. **Retirement quote pack** (B7) with wake-up pack triggers (F30).
4. **Pensions Regulator breach register** (C15) — small but statutory.
5. **Trustee meeting pack builder** (C18) — high visibility to trustee clients.
6. **Common & scheme-specific data score** (G34) — plugs into existing member data.
7. **Case management inbox** (H39) — consolidates the many task-based pages behind one queue per user.
8. **Fee scheduler + invoicing** (I44 + I45) — revenue-critical.

Each ships as one page + one Cloud table (or a small set), reusing the existing `useClientData` pattern, four-eyes approval flow, audit trail and Airgead branding. No breaking changes to existing routes.

## Technical outline (for the phase-1 slice)

```text
New routes                 New tables (public schema, RLS + GRANTs)
/schemes                   schemes, scheme_employers
/employers                 employers
/cetv                      cetv_quotes
/retirement-quotes         retirement_quotes, wake_up_events
/breach-register           tpr_breaches
/trustee-meetings          trustee_meetings, trustee_actions
/data-quality              data_quality_scores
/cases                     cases, case_events (feeds all task pages)
/fees                      fee_schedules, invoices, invoice_lines
```

Each table follows the standard: CREATE → GRANT SELECT/INSERT/UPDATE/DELETE to authenticated + ALL to service_role → ENABLE RLS → policies keyed to `auth.uid()` via `has_role`.

## Out of scope for phase-1
- DB benefit engine (A5) — heavy actuarial work, deferred.
- Direct property admin (E27), loanbacks (E28) — SSAS-specific, staged after core.
- OMS / custody (E24, E25) — usually integrated with a third party; scaffold API stubs only.
- PPF levy (C19), Chair's statement (C16), ORA (C17) — annual/periodic, deferred.

## Ask
Confirm the Phase-1 slice (or tell me which numbered items you want swapped in/out) and I'll build it in the next turn.
