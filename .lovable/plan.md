

## Admin Portal Review: Database vs Mock Data Audit

### Current State Summary

The admin portal has **20+ modules** but only **3 are database-backed**. The rest use hardcoded mock data that won't persist or reflect real operations. Here's the full breakdown:

### Database-Connected (Working)

| Module | Status | Notes |
|--------|--------|-------|
| **Clients** | Live DB | CRUD via `useClients()`, joins work, 4 clients in DB |
| **Transaction Ledger** | Live DB | `useAllTransactions()` with client/account joins, 10 transactions |
| **Bank Upload** | Live DB | `useBankFiles()` with auto-matching, creates entries |
| **Client Admin View** | Live DB | Full detail view per client (accounts, investments, beneficiaries, BCE events) |
| **Activity Log** | Live DB | `logActivity()` writes audit entries on every CRUD action |

### Mock Data Only (Not Persisted)

| Module | Issue |
|--------|-------|
| **Scheme Dashboard** | Hardcoded AUM, member counts, flow metrics |
| **Fee Engine** | Local `useState` with mock fee schedules; edits lost on refresh |
| **Trade Order Management** | Local `useState` with mock orders; no DB table |
| **Portfolio Rebalancing** | Mock model portfolios and drift data |
| **Custody & Reconciliation** | Mock reconciliation entries |
| **Adviser Charging** | Mock adviser fee agreements |
| **Document Generation** | Mock document list |
| **Audit Trail** | Mock entries (despite real `activity_log` table existing) |
| **Workflow Engine** | Mock workflow definitions |
| **Bulk Operations** | Mock bulk tasks |
| **User Management** | Mock user/adviser list |
| **System Configuration** | Mock config values |
| **Regulatory Reporting** | Mock reports |
| **Activity tab** | Hardcoded `adminData.recentActivity` |
| **Alerts tab** | Hardcoded `adminData.alerts` |
| **Pooled Account** | Mock pooled account data |

### Critical Issues Found

1. **Audit Trail uses mock data despite having a real `activity_log` table** -- the `AuditTrail.tsx` component shows hardcoded entries while `logActivity()` already writes real audit records to the database. Wiring it up is a quick win.

2. **Scheme Dashboard shows hardcoded stats** -- should aggregate from real `clients`, `client_accounts`, and `transactions` tables (AUM from `client_accounts.total_value`, member count from `clients`, flows from `transactions`).

3. **Activity and Alerts tabs in main dashboard use `adminData` mock object** -- the Activity tab should query `activity_log` and the Alerts could be derived from real data (e.g., overdue reviews, approaching allowance limits).

4. **Fee Engine, Trade Orders, Workflows, User Management have no backing tables** -- these need new database tables to persist configuration.

### Recommended Plan (Priority Order)

**Phase 1 -- Wire existing DB tables to mock-using components (no schema changes)**

1. **Connect Audit Trail to `activity_log` table** -- Replace mock `auditEntries` array with a query to `activity_log`, mapping `entity_type`, `action`, `description`, `performed_by`, `created_at`.

2. **Connect Scheme Dashboard to real aggregates** -- Query `clients` count, `SUM(client_accounts.total_value)` for AUM, `transactions` for recent flows.

3. **Connect Activity tab to `activity_log`** -- Replace `adminData.recentActivity` with recent `activity_log` entries.

**Phase 2 -- New database tables for missing modules**

4. **Create `fee_schedules` table** -- columns: `id`, `name`, `type` (ad_valorem/flat/per_transaction/one_off), `rate`, `frequency`, `wrapper`, `min_fee`, `max_fee`, `active`, `created_at`, `updated_at`. Wire FeeEngine component.

5. **Create `trade_orders` table** -- columns: `id`, `client_id` (FK), `account_id` (FK), `side`, `instrument`, `quantity`, `price`, `value`, `status`, `settlement_date`, `created_at`. Wire TradeOrderManagement.

6. **Create `workflow_definitions` and `workflow_instances` tables** -- for the Workflow Engine.

7. **Create `adviser_fees` table** -- for Adviser Charging agreements per client.

**Phase 3 -- Derived/computed features**

8. **Alerts engine** -- Build alerts from real data conditions (e.g., clients with no review in 12 months, accounts approaching annual allowance).

9. **Regulatory reporting** -- Generate reports from real transaction and client data.

10. **Bulk operations** -- Wire to real batch updates on `clients`, `transactions`, etc.

### Technical Details

- All new tables will use the same RLS pattern (`ALLOW ALL` for `public` role) matching existing tables
- Each table gets `updated_at` trigger using existing `update_updated_at_column()` function
- The `useClientData.ts` hook pattern will be extended with new hooks per table
- Foreign keys to `clients` and `client_accounts` with `ON DELETE CASCADE`

