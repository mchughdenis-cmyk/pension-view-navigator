

## Benefits & Crystallisation Domain — Build Plan

### Current State
- `bce_events` table exists with basic fields (crystallised_amount, tax_free_lump_sum, lta_percentage)
- Drawdown tab shows transaction history filtered by `transaction_type = 'drawdown'`
- No crystallisation segment tracking, no PCLS auto-calculator, no UFPLS support, no death benefit rules

### What Needs Building

**1. New `crystallisation_segments` database table**
- Columns: `id`, `client_id` (FK), `account_id` (FK), `bce_event_id` (FK to bce_events), `segment_type` (designated/undesignated), `crystallised_amount`, `pcls_amount`, `residual_fund`, `drawdown_type` (FAD/UFPLS/none), `status` (active/exhausted/transferred), `created_at`, `updated_at`
- Each BCE event creates one or more segments

**2. PCLS Calculator**
- Auto-calculate 25% tax-free cash entitlement from uncrystallised fund value
- Show max PCLS available, amount to designate for drawdown, and residual fund
- Validate against available uncrystallised funds

**3. UFPLS Processing**
- Add UFPLS as a transaction type option in the drawdown tab
- UFPLS = 25% tax-free + 75% taxable from uncrystallised funds (no separate PCLS)
- Record as a BCE event + transaction in one flow

**4. Enhanced Crystallisation Tab**
- Show segments table: each crystallised tranche with PCLS taken, residual fund, drawdown type
- Summary cards: total crystallised, total uncrystallised, total PCLS taken
- "Crystallise" button that runs the PCLS calculator and creates segment + BCE event

**5. Death Benefit Rules Display**
- Info card showing applicable rules based on client age vs 75
- Pre-75: lump sum or drawdown to nominees, typically tax-free if within 2 years of death
- Post-75: lump sum or drawdown taxed at recipient's marginal rate
- Display based on client's `date_of_birth`

**6. Hook additions in `useClientData.ts`**
- `useCrystallisationSegments(clientId)` — CRUD for segments
- Extend `useClientDetail` to expose a `crystallise` function that creates BCE event + segment atomically

### Implementation Steps

1. Create migration: `crystallisation_segments` table with RLS + updated_at trigger
2. Add `useCrystallisationSegments` hook with fetch/create/update
3. Rewrite the `crystallisation` tab in `ClientAdminView.tsx`:
   - Summary cards (uncrystallised vs crystallised totals)
   - PCLS calculator with "Crystallise Now" flow
   - Segments table showing all tranches
   - Death benefit rules info panel based on age
4. Enhance the `drawdown` tab:
   - Add UFPLS processing option alongside FAD
   - Link drawdown payments to segments
5. Wire BCE creation to also create a crystallisation segment record

### Files to Change
- New migration SQL
- `src/hooks/useClientData.ts` — new hook + extend types
- `src/components/ClientAdminView.tsx` — rewrite crystallisation tab, enhance drawdown tab

