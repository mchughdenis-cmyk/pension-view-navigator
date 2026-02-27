

## Admin Portal Review: Database vs Mock Data Audit

### Current State Summary (Updated)

Phase 1 and Phase 2 have been implemented. The following modules are now database-backed:

### Database-Connected (Working)

| Module | Status | Notes |
|--------|--------|-------|
| **Clients** | ✅ Live DB | CRUD via `useClients()` |
| **Transaction Ledger** | ✅ Live DB | `useAllTransactions()` with client/account joins |
| **Bank Upload** | ✅ Live DB | `useBankFiles()` with auto-matching |
| **Client Admin View** | ✅ Live DB | Full detail view per client |
| **Activity Log** | ✅ Live DB | `logActivity()` writes audit entries |
| **Audit Trail** | ✅ Live DB | Now queries `activity_log` table via `useAuditTrail()` |
| **Scheme Dashboard** | ✅ Live DB | Aggregates from `clients`, `client_accounts`, `transactions` via `useSchemeStats()` |
| **Activity Tab** | ✅ Live DB | Shows real `activity_log` entries |
| **Summary Cards** | ✅ Live DB | Real client count, AUM, accounts, transactions |
| **Fee Engine** | ✅ Live DB | `fee_schedules` table with full CRUD via `useFeeSchedules()` |
| **Trade Order Management** | ✅ Live DB | `trade_orders` table with full CRUD via `useTradeOrders()` |

### New Database Tables Created

- `fee_schedules` — fee configuration with CRUD
- `trade_orders` — trade lifecycle with client/account FKs
- `adviser_fees` — adviser charging agreements (table created, component wiring pending)

### Still Mock Data (Phase 3)

| Module | Notes |
|--------|-------|
| **Portfolio Rebalancing** | Mock model portfolios |
| **Custody & Reconciliation** | Mock reconciliation entries |
| **Document Generation** | Mock document list |
| **Bulk Operations** | Mock bulk tasks |
| **User Management** | Mock user/adviser list |
| **System Configuration** | Mock config values |
| **Regulatory Reporting** | Mock reports |
| **Pooled Account** | Mock pooled account data |

### Recently Completed (This Session)

| Module | Status | Notes |
|--------|--------|-------|
| **Adviser Charging** | ✅ Live DB | `useAdviserFees()` with full CRUD, client FK joins |
| **Workflow Engine** | ✅ Live DB | `useWorkflows()` with full CRUD via `workflow_definitions` table |
| **Alerts Engine** | ✅ Live DB | `useAdminAlerts()` computes from real client/transaction data |
| **GDPR Consent** | ✅ Live DB | `useConsentRecords()` with `consent_records` table per client |
| **MPAA Flag** | ✅ Live DB | `mpaa_triggered` column on clients, toggle in compliance tab |
| **Annual Allowance** | ✅ Live DB | `annual_allowance_used` column with progress bar in compliance |
