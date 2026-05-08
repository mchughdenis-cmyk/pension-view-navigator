# Market-Leader Build-Out — Closing All Gaps

Delivers every gap identified in the WealthOS / Platinum~Pro comparison in one coordinated build. Each module gets: schema (tables + RLS), seed demo data, UI screen, and where appropriate an edge function.

## P1 — Regulatory & Operational Core

### 1. HMRC Reporting Pack
- **Tables:** `hmrc_submissions` (type: ras_reclaim | event_report | aft | psr | rti_paye, period, payload, status, ref, response), `ras_reclaim_lines`, `event_report_lines`
- **Edge fn:** `hmrc-submit` → routes by type, calls integration-stub HMRC, records response
- **UI:** `/hmrc` — tabs RAS / Event Report / AFT / PSR / RTI; submission history; download XML

### 2. LSA / LSDBA Tracking (post-LTA)
- **Tables:** `lsa_lsdba_ledger` (client_id, event_type, lsa_used, lsdba_used, running_lsa, running_lsdba, source_event_id)
- **Logic:** `src/lib/lsaLsdba.ts` — £268,275 / £1,073,100 caps, transitional cert logic
- **UI:** allowance widget on client admin

### 3. PAYE / RTI Engine
- **Tables:** `paye_runs` (period, total_gross, total_tax, ni, status), `paye_payments` (run_id, client_id, gross, tax_code, paye, ni, net)
- **Edge fn:** extend `paye-calculator` to produce FPS/EPS-shaped output, emit `rti_paye` HMRC submission
- **UI:** `/paye` payroll dashboard

### 4. Origo Options Real Messaging
- **Tables:** `origo_messages` (transfer_id, direction in/out, message_type, status, payload, ack_ref)
- **States:** initial → in-progress → ceding-confirmed → settled
- **UI:** thread view inside transfer journey

### 5. CASS 6 & 7 Automated Recs
- **Extend** existing `cass_reconciliations` with breach auto-detection, daily cron schedule, materiality thresholds
- **Edge fn:** keep existing `cass-reconciliation`, add `cass_settings` table

## P2 — Product Breadth

### 6. SSAS Module
- **Tables:** `ssas_schemes` (sponsoring_employer, scheme_ref, registration_date, member_trustees jsonb, professional_trustee), `ssas_members` (scheme_id, client_id, trustee bool, share_pct), `ssas_loanbacks` (scheme_id, employer, principal, rate, charge_secured, repayment_schedule, repayment_actual jsonb, fifty_pct_test_pass)
- **Logic:** 50% loanback rule, charge register
- **UI:** `/ssas` — schemes list, scheme detail with members + loanbacks

### 7. Commercial Property
- **Tables:** `commercial_properties` (scheme_id, address, valuation, valuation_date, vat_registered, lease_id), `property_leases` (property_id, tenant_name, rent_pa, frequency, next_review, deposit), `property_rent_ledger` (lease_id, due_date, amount_due, amount_received, status), `property_insurance` (property_id, provider, premium, renewal_date)
- **UI:** `/property` — portfolio, rent collection, insurance renewals

### 8. Scheme Pension / Annuity Admin
- **Tables:** `scheme_pensions` (client_id, type in_house|open_market, provider, gross_annual, escalation_pct, guarantee_period, spouse_pct, commencement_date, paid_to_date)
- **UI:** `/scheme-pension` admin

### 9. Capped Drawdown Legacy
- **Tables:** `capped_drawdown_segments` (client_id, gad_basis_amount, gad_cap_pct=150, last_review_date, next_review_date, current_max)
- **Logic:** GAD lookup table + tri-annual review trigger
- **UI:** review dashboard

### 10. Pension Sharing Orders
- **Tables:** `pension_sharing_orders` (member_client_id, ex_partner_name, court_order_date, percentage, transfer_value, status, implementation_date), `in_specie_transfers` (transfer_id, asset_list jsonb, valuation_basis)
- **UI:** `/sharing-orders`

## P3 — Platform & Integrations

### 11. Bulk Dealing Engine
- **Tables:** `bulk_orders` (model_id, trade_date, status, total_value), `bulk_order_lines` (bulk_id, client_id, account_id, symbol, side, units, price)
- **Edge fn:** `bulk-deal-aggregator` — aggregates rebalance trades, allocates fills pro-rata
- **UI:** `/bulk-dealing`

### 12. Public REST API + Webhooks
- **Tables:** `webhook_subscriptions` (api_key_id, url, events[], secret, status), `webhook_deliveries` (subscription_id, event, status, attempts, last_attempt_at, response)
- **Edge fn:** `public-api` (read-only endpoints: clients, accounts, valuations, transactions) with API-key auth + rate limiting
- **Edge fn:** `webhook-dispatcher` (cron, fires queued events)
- **UI:** `/api-directory` extended with webhook config

### 13. Open Banking AISP / PISP
- **Tables:** `open_banking_consents` (client_id, bank, consent_ref, scope, expires_at, status), `open_banking_accounts` (consent_id, account_id, balance, last_synced)
- **Edge fn:** `open-banking-stub` — simulates AISP balance fetch + PISP payment initiation
- **UI:** `/open-banking`

### 14. JISA + LISA Wrappers
- **Extend** `client_accounts` to support `jisa` and `lisa` types
- **Tables:** `lisa_bonus_claims` (client_id, account_id, tax_year, contributions, bonus_25pct, claim_status), `jisa_holders` (account_id, registered_contact_id, child_dob)
- **Logic:** £4k LISA cap, 25% bonus, age 60 access; JISA £9k cap, age 18 conversion
- **UI:** new tabs on portfolio page

## P4 — Enterprise Readiness

### 15. SSO / White-Label / DR
- **Tables:** `sso_configurations` (firm_id, provider saml|oidc, metadata_xml, domain), `firm_branding` (firm_id, logo_url, primary_color, accent_color, custom_domain), `dr_drills` (drill_date, scenario, rto_minutes, rpo_minutes, status)
- **UI:** `/enterprise` extended with SSO config + branding + DR drill log

### 16. HMRC Test Harness
- **Table:** `hmrc_test_runs` (submission_type, payload, expected, actual, passed, run_at)
- **UI:** `/hmrc` "Test Harness" tab — run sandbox submissions

## Navigation
Add to `navConfig.ts` (admin/adviser): HMRC, PAYE, SSAS, Property, Scheme Pension, Sharing Orders, Bulk Dealing, Open Banking. Keep client-side simple.

## Technical notes
- All tables get RLS with permissive policies (matches existing demo posture per memory)
- All money in pence-safe NUMERIC, all dates DATE
- Audit-log triggers piggyback on existing `activity_log` pattern via app code (not DB triggers — none exist now)
- Single migration file for schema, then `supabase--insert` for seed data per module
- Edge functions all use existing `corsHeaders` + integration-stub pattern
- UI pages are read-mostly dashboards with one or two action buttons (create submission, run rec, etc.) — full CRUD is deferred where it adds little demo value

## Out of scope (intentionally)
- ISO 27001 paperwork (not buildable in code)
- Real Origo network connection (stubbed)
- Real HMRC sandbox keys (stubbed; harness is offline)
- Real Open Banking TPP licence (stubbed)

## Build order
1. One migration with all 30+ tables
2. Seed data via insert tool (one batch per module)
3. Library files (`lsaLsdba.ts`, `gadLookup.ts`)
4. Edge functions (`hmrc-submit`, `bulk-deal-aggregator`, `public-api`, `webhook-dispatcher`, `open-banking-stub`)
5. UI pages (~12 new screens)
6. App.tsx routes + navConfig
7. Smoke test: visit each new route, fire one action per module
