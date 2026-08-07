# Expand the capability showcase

The existing 12 capabilities cover the core pension lifecycle well. Add four cross-cutting areas so the showcase also reflects how a real administration platform is operated:

1. **Case management, workflow & controls**
   - Intake, assignment, prioritisation, SLAs, four-eyes approval, escalations, audit history and closure.
   - Link to the operator console, case workbench, work queue, SLA tracker and approval queue.
   - Status: **Live for demo**, with broader cross-module approval coverage called out as partial where relevant.

2. **Payments, money movement & accounting**
   - Payment instruction creation, beneficiary checks, approval, bank-file generation, payment-file archive, ledger posting, settlement and failed-payment handling.
   - Link to Payments Hub, payment file store, General Ledger, Cash Forecast and relevant benefit/contribution flows.
   - Status: **Live for demo**, with live bank connectivity and return-file automation marked roadmap.

3. **Communications, documents & records**
   - Templated letters, secure messages, email issue, document generation, versioning, retention and evidence of delivery.
   - Link to Communications, Document Vault, saved illustrations, welcome packs, statements and audit trail.
   - Status: **Live/partial**, distinguishing generated and stored documents from production correspondence delivery.

4. **Data governance, security & access administration**
   - Firm and scheme hierarchy, role-based access, user administration, data quality, privacy requests, retention, audit and operational security controls.
   - Link to Firm Hierarchy, User Management, Data Quality, Privacy Centre, Audit Log and System Configuration.
   - Status: **Partial**, with enterprise SSO/SCIM and independently evidenced security assurance identified as roadmap items.

## Showcase changes

- Expand the hub from 12 to 16 capability cards and update the count/legend text.
- Add one typed data entry per new area in the existing capability data model, including rules, demo steps, connectors, live screens and honest roadmap notes.
- Keep previous/next sequencing working across the full set and retain public access to the showcase.
- Correct demo links that do not match the registered application routes while adding the new screen links.
- Keep all existing 12 areas and their current workflows unchanged.
- Update the transparent roadmap section so newly exposed partial or roadmap items are consistent with the capability pages.

## Technical details

- Extend `src/data/capabilities.ts` only for the capability catalogue and demo journeys.
- Reuse the existing hub, detail page, maturity badge and demo journey components.
- No new database tables or backend functions are required for the showcase expansion.
- Preserve UK 2026/27 terminology, British English spelling and the existing marketing design tokens.