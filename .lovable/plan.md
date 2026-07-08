# Reorganise Admin navigation around daily pension-admin work

Right now the Admin sidebar leads with "Workspace", "Operations", "Client modules (act on behalf)", "Compliance" etc. The tasks a pensions administrator actually performs every day are scattered across three or four groups (Operations, Money in & out, Client modules). This plan pulls those daily tasks to the top of the sidebar as a clearly labelled block, then keeps everything else beneath it in a logical order.

## Daily pension-administrator tasks to call out

These are the activities a scheme/SIPP administrator typically works through each day. They will form a new top group in the Admin nav called **"Daily admin desk"**:

1. **Bank reconciliation** — `/cass` (CASS reconciliation) — match internal cash vs bank file, clear breaks.
2. **Cash onboarding / allocate incoming cash** — `/cash-onboarding` — apply received money to member accounts.
3. **Bank file upload & allocation** — (BankUpload) — ingest bank statements, match to expected items.
4. **Contribution processing (all types)** — `/contributions` — regular, single, employer, third-party, in-specie; includes PAYE/RTI feed at `/paye`.
5. **Transfers in (request & track)** — `/transfer` (client-side request on behalf) + `/origo-transfers` + `/equisoft` (in-specie) — raise, chase, book.
6. **Transfers out** — `/transfer-out` + `/origo-transfers` — discharge, CETV, Origo out.
7. **Drawdown processing** — `/drawdown` (crystallisation / PCLS / income) + `/drip-feed` (drip-feed drawdown) + `/instant-withdrawal` (UFPLS / one-off).
8. **Dealing / trade execution** — `/dealing` — place buys, sells, switches raised overnight.
9. **Instrument transfers / re-registrations** — `/instrument-transfer`.
10. **Cash warnings & SLA queue** — `/cash-warnings`, `/sla-tracker` — daily worklist triage.
11. **KYC review queue** — `/kyc-review` — clear pending identity checks.
12. **Origo message inbox** — `/origo` — action inbound Origo messages.
13. **HMRC / regulatory day-to-day filings** — `/hmrc` (event reports, RAS claims), `/lsa` (LSA/LSDBA checks at BCE).
14. **Transaction history / audit lookup** — `/transactions`, `/audit` — used constantly for enquiries.
15. **Illustrations & SMPI runs on request** — `/illustration`, `/smpi`.

Anything not on this list (Model portfolios, Monte Carlo, White-label branding, System configuration, Firm hierarchy, Enterprise suite, API directory, Webhook sandbox, Documentation, MI dashboard, Adviser workbench, etc.) is not a daily admin task and moves further down.

## Proposed new Admin sidebar order

Only the Admin role in `src/components/nav/navConfig.ts` changes. Client and Adviser navs are untouched.

```text
Workspace
  Dashboard, Admin console, Registration log

Daily admin desk                         ← NEW, top-of-mind
  Bank reconciliation (CASS)             /cass
  Cash onboarding                        /cash-onboarding
  Contribution manager                   /contributions
  PAYE / RTI                             /paye
  Transfers in                           /transfer
  Transfers out                          /transfer-out
  Origo transfers                        /origo-transfers
  Equisoft in-specie                     /equisoft
  Drawdown processing                    /drawdown
  Drip-feed drawdown                     /drip-feed
  Instant withdrawal (UFPLS)             /instant-withdrawal
  Dealing desk                           /dealing
  Instrument transfer                    /instrument-transfer
  Origo message inbox                    /origo
  KYC review queue                       /kyc-review
  Cash warnings                          /cash-warnings
  SLA tracker                            /sla-tracker
  HMRC event reporting                   /hmrc
  LSA / LSDBA checks                     /lsa
  Transaction history                    /transactions
  Illustration                           /illustration
  SMPI runner                            /smpi

Operations (periodic / oversight)
  Client operations hub, Operations cockpit, Pension operations,
  Pensions Dashboards (PDP)

Compliance (periodic)
  CASS reconciliation history, Audit trail, Vulnerable register,
  Cost & charges, Firm hierarchy

Client modules (act on behalf)          ← trimmed: items promoted to Daily desk removed
  ISA, GIA, Onshore bond, Offshore bond, Annual summary,
  Pension passport, Beneficiaries, Pension health score, Life events,
  Employer matching, State Pension forecast, Onboarding,
  Onboarding tracker, Identity check (KYC), Welcome pack,
  Learning centre, Mobile app view, Ask Navigator (AI), Privacy centre

Products
  SSAS, Commercial property, Advanced capabilities

Investments
  Model portfolios, Monte Carlo

Insights
  MI dashboard, Enterprise suite

Client service
  Adviser workbench, Client services hub, Annual review pack,
  Suitability assessment, Reporting suite, Communications

System
  Administration, System configuration, White-label branding,
  Persona selector, Audit log, Documents, System overview,
  API directory, Documentation, Webhook sandbox, Settings
```

Notes:
- `/cass` appears once in "Daily admin desk" (the working screen); the Compliance group keeps the historical/oversight framing but I'll relabel to avoid a duplicate entry — either keep only in Daily desk or point Compliance to an archive route if one exists. Confirmation below.
- No routes, components, or business logic change — this is a nav reorder only.

## Technical detail

- Single file edit: `src/components/nav/navConfig.ts`, `NAV_BY_ROLE.admin` array.
- No new icons needed; reuse existing lucide icons already imported.
- No changes to `AppSidebar.tsx` — it renders whatever groups are provided.
- No route or component changes; `findNavLabel` continues to resolve because URLs are unchanged.

## One thing to confirm before I build

Do you want `/cass` listed **only** in "Daily admin desk" (cleaner), or kept in both Daily desk and Compliance (redundant but discoverable)? Default in the plan above: only in Daily desk.
