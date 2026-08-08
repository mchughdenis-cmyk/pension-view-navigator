# Align the roadmap with the capability showcase

## Goal
Make the roadmap tab the single transparent view of the capability showcase’s outstanding production gaps, without changing any working demo workflows.

## Recommended additions

### Priority 1 — production connectivity and operational completeness
- **Live Origo Options connection** — the transfer state machine is demonstrable, but live network exchange and exception handling are not connected.
- **Pensions Dashboards Programme integration** — add live find/view data exchange and downstream exception handling.
- **Live custodian and platform feeds** — replace uploaded/recorded positions with scheduled position and transaction feeds.
- **Live bank connectivity** — retrieve statements and transmit approved payment files through supported bank channels.
- **Payment return-file ingestion** — automate pain.002, ARUDD and AWACS processing, reconciliation and re-issue.
- **Direct HMRC gateway submissions** — cover Managing Pension Schemes, RTI and relief-at-source submissions with acknowledgements and retry handling.
- **Automated scheme registration filing** — submit scheme registration data electronically and store HMRC acknowledgements.

### Priority 2 — pension administration workflow depth
- **Cross-module four-eyes approvals** — extend approval controls beyond the currently protected payment, payroll and reconciliation actions to all sensitive case types.
- **Configurable workflow designer** — allow firms to define case types, steps, SLAs, escalations and approval rules without a code release.
- **Death benefits end-to-end processing** — add beneficiary self-service claim intake, document upload, decision evidence and complete settlement tracking.
- **Automated relief-at-source reconciliation** — match HMRC remittances to claims, identify variances and manage adjustments.
- **HMRC tax-code automation** — ingest P6/P9 notices and apply changes to future pension payroll runs with an audit trail.
- **Transitional tax-free amount certificates** — support members with pre-2024 crystallisation history and evidence review.
- **Dedicated complaints and DISP register** — capture root cause, outcome, redress, deadlines and reportable complaint metrics.
- **Corporate actions processing** — add the full election, entitlement, settlement and member allocation workflow behind the existing calendar.
- **Fee rebates and negotiated tariffs** — support firm-level tariff overrides, rebate rules, approvals and reconciliation.

### Priority 3 — records, governance and enterprise readiness
- **Correspondence template governance** — version control, compliance approval, effective dating and rollback before issue.
- **Print and postal fulfilment** — integrate physical dispatch, returned mail, delivery status and evidence of despatch.
- **Beneficiary self-service portal** — secure claim updates and document exchange for death-benefit cases.
- **Enterprise SSO and SCIM** — institutional login, automated provisioning/deprovisioning and tenant administration.
- **Signed immutable audit export** — regulator/auditor export with integrity verification and chain of custody.
- **Formal security assurance** — penetration testing, control attestation and evidence pack.
- **Accessibility conformance** — complete and record a WCAG 2.2 AA audit and remediation cycle.
- **Performance and resilience evidence** — load testing at 100k+ members plus documented DR, RPO and RTO controls.
- **Automated projection-assumption refresh** — governed FRC/FCA rate updates with approval, effective dates and version history.

## Presentation changes
- Add the missing capability-derived entries to `src/pages/admin/Roadmap.tsx`.
- Retain honest statuses: `Partial` for workflows that already exist but need depth, `Not connected` for external integrations, `Missing` for absent functionality, and `Unverified`/`Not done` for assurance items.
- Add a priority column or grouped sections so visitors can distinguish near-term operational improvements from enterprise assurance work.
- Update the marketing roadmap summary so it links to the same source of truth and does not omit major capability-page gaps.
- Keep British English, UK 2026/27 terminology and the existing design tokens.

## Technical details
- Use the existing roadmap row model and badge styling; no database or backend changes are required.
- Derive wording from the `roadmap` arrays in `src/data/capabilities.ts` so the showcase detail pages and roadmap remain consistent.
- Preserve all existing roadmap entries and working capability/demo journeys.
- Validate that the final roadmap contains each capability’s outstanding roadmap item once, with no duplicate or contradictory statuses.