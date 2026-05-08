
-- =============================================================
-- 1. FIRM / ADVISER HIERARCHY
-- =============================================================
CREATE TABLE IF NOT EXISTS public.firms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  fca_ref TEXT,
  network_id UUID,
  status TEXT NOT NULL DEFAULT 'active',
  address_line1 TEXT, postcode TEXT, city TEXT,
  default_platform_fee_pct NUMERIC NOT NULL DEFAULT 0.30,
  default_adviser_fee_pct NUMERIC NOT NULL DEFAULT 0.50,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.advisers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  firm_id UUID REFERENCES public.firms(id) ON DELETE SET NULL,
  user_id UUID,
  name TEXT NOT NULL,
  email TEXT,
  fca_individual_ref TEXT,
  role TEXT NOT NULL DEFAULT 'adviser', -- adviser | paraplanner | principal
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.agency_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL,
  firm_id UUID NOT NULL,
  adviser_id UUID NOT NULL,
  assigned_from DATE NOT NULL DEFAULT CURRENT_DATE,
  assigned_to DATE,
  is_primary BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.fee_splits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  firm_id UUID NOT NULL,
  adviser_id UUID,
  fee_charge_id UUID,
  firm_share_pct NUMERIC NOT NULL DEFAULT 70,
  adviser_share_pct NUMERIC NOT NULL DEFAULT 30,
  amount_firm NUMERIC NOT NULL DEFAULT 0,
  amount_adviser NUMERIC NOT NULL DEFAULT 0,
  period_end DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================================
-- 2. CASS 7 CLIENT MONEY RECONCILIATION
-- =============================================================
CREATE TABLE IF NOT EXISTS public.cass_reconciliations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recon_date DATE NOT NULL DEFAULT CURRENT_DATE,
  recon_type TEXT NOT NULL DEFAULT 'internal_external', -- internal_external | internal_only
  internal_balance NUMERIC NOT NULL DEFAULT 0,  -- sum of client cash on platform
  external_balance NUMERIC NOT NULL DEFAULT 0,  -- bank statement balance
  unmatched_count INTEGER NOT NULL DEFAULT 0,
  variance NUMERIC GENERATED ALWAYS AS (internal_balance - external_balance) STORED,
  status TEXT NOT NULL DEFAULT 'in_progress', -- in_progress | passed | breach
  performed_by TEXT,
  reviewed_by TEXT,
  resolution_notes TEXT,
  signed_off_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.cass_breaches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recon_id UUID,
  breach_date DATE NOT NULL DEFAULT CURRENT_DATE,
  breach_type TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'minor',
  amount NUMERIC,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================================
-- 3. MODEL PORTFOLIO SERVICE (MPS)
-- =============================================================
CREATE TABLE IF NOT EXISTS public.model_portfolios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  manager TEXT,                       -- DFM / in-house
  risk_level INTEGER NOT NULL DEFAULT 5,  -- 1..10
  description TEXT,
  benchmark TEXT,
  rebalance_frequency TEXT NOT NULL DEFAULT 'quarterly',
  drift_tolerance_pct NUMERIC NOT NULL DEFAULT 5,
  ocf NUMERIC NOT NULL DEFAULT 0,     -- ongoing charges figure
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.model_holdings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_id UUID NOT NULL REFERENCES public.model_portfolios(id) ON DELETE CASCADE,
  symbol TEXT NOT NULL,
  isin TEXT,
  fund_name TEXT NOT NULL,
  target_pct NUMERIC NOT NULL DEFAULT 0,
  asset_class TEXT,                    -- equity | bond | cash | property | alt
  region TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.model_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL,
  account_id UUID NOT NULL,
  model_id UUID NOT NULL,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'active'
);

CREATE TABLE IF NOT EXISTS public.rebalance_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_id UUID NOT NULL,
  account_id UUID NOT NULL,
  client_id UUID NOT NULL,
  triggered_by TEXT NOT NULL DEFAULT 'manual',
  drift_summary JSONB,
  trades_generated JSONB,
  total_buy_value NUMERIC NOT NULL DEFAULT 0,
  total_sell_value NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending', -- pending | approved | executed | failed
  approved_by TEXT,
  executed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================================
-- 4. CORPORATE ACTIONS
-- =============================================================
CREATE TABLE IF NOT EXISTS public.corporate_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  isin TEXT,
  symbol TEXT NOT NULL,
  action_type TEXT NOT NULL,           -- dividend | scrip | rights | merger | split | tender
  ex_date DATE,
  record_date DATE,
  payment_date DATE,
  rate NUMERIC,
  ratio TEXT,
  currency TEXT DEFAULT 'GBP',
  voluntary BOOLEAN NOT NULL DEFAULT false,
  election_deadline DATE,
  status TEXT NOT NULL DEFAULT 'announced',  -- announced | elections_open | processing | settled
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.corporate_action_elections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  corporate_action_id UUID NOT NULL,
  client_id UUID NOT NULL,
  account_id UUID NOT NULL,
  election TEXT NOT NULL DEFAULT 'default',  -- cash | scrip | default
  units_held NUMERIC NOT NULL DEFAULT 0,
  cash_amount NUMERIC,
  units_received NUMERIC,
  status TEXT NOT NULL DEFAULT 'pending',
  elected_at TIMESTAMPTZ,
  settled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================================
-- 5. OPERATIONS COCKPIT — CASES & QUEUES
-- =============================================================
CREATE TABLE IF NOT EXISTS public.ops_cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_ref TEXT NOT NULL UNIQUE DEFAULT ('CASE-' || to_char(now(), 'YYYYMMDD') || '-' || lpad(floor(random()*9999)::text, 4, '0')),
  case_type TEXT NOT NULL,             -- new_business | transfer | drawdown | death | complaint | rebalance | corp_action | cass_breach
  client_id UUID,
  related_id UUID,
  related_table TEXT,
  priority TEXT NOT NULL DEFAULT 'normal',  -- low | normal | high | urgent
  status TEXT NOT NULL DEFAULT 'open',      -- open | in_progress | awaiting | blocked | resolved | closed
  queue TEXT NOT NULL DEFAULT 'general',
  assigned_to TEXT,
  sla_due_at TIMESTAMPTZ,
  title TEXT NOT NULL,
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.ops_case_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL,
  author TEXT NOT NULL DEFAULT 'System',
  note TEXT NOT NULL,
  is_internal BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================================
-- 6. RLS — demo permissive (matches existing pattern)
-- =============================================================
DO $$
DECLARE t TEXT;
BEGIN
  FOR t IN SELECT unnest(ARRAY['firms','advisers','agency_assignments','fee_splits',
           'cass_reconciliations','cass_breaches','model_portfolios','model_holdings',
           'model_assignments','rebalance_runs','corporate_actions','corporate_action_elections',
           'ops_cases','ops_case_notes'])
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('DROP POLICY IF EXISTS "Allow all select" ON public.%I', t);
    EXECUTE format('DROP POLICY IF EXISTS "Allow all insert" ON public.%I', t);
    EXECUTE format('DROP POLICY IF EXISTS "Allow all update" ON public.%I', t);
    EXECUTE format('DROP POLICY IF EXISTS "Allow all delete" ON public.%I', t);
    EXECUTE format('CREATE POLICY "Allow all select" ON public.%I FOR SELECT TO anon, authenticated USING (true)', t);
    EXECUTE format('CREATE POLICY "Allow all insert" ON public.%I FOR INSERT TO anon, authenticated WITH CHECK (true)', t);
    EXECUTE format('CREATE POLICY "Allow all update" ON public.%I FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true)', t);
    EXECUTE format('CREATE POLICY "Allow all delete" ON public.%I FOR DELETE TO anon, authenticated USING (true)', t);
  END LOOP;
END $$;

-- updated_at triggers
DO $$
DECLARE t TEXT;
BEGIN
  FOR t IN SELECT unnest(ARRAY['firms','advisers','model_portfolios','ops_cases'])
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS update_%s_updated_at ON public.%I', t, t);
    EXECUTE format('CREATE TRIGGER update_%s_updated_at BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column()', t, t);
  END LOOP;
END $$;

-- =============================================================
-- 7. MI VIEWS — analytics layer
-- =============================================================
CREATE OR REPLACE VIEW public.mi_aua_by_firm AS
SELECT
  f.id AS firm_id, f.name AS firm_name,
  COUNT(DISTINCT aa.client_id) AS client_count,
  COALESCE(SUM(ca.total_value), 0) AS aua,
  COALESCE(SUM(ca.cash_balance), 0) AS cash
FROM public.firms f
LEFT JOIN public.agency_assignments aa ON aa.firm_id = f.id AND aa.assigned_to IS NULL
LEFT JOIN public.client_accounts ca ON ca.client_id = aa.client_id AND ca.status = 'active'
GROUP BY f.id, f.name;

CREATE OR REPLACE VIEW public.mi_net_flows AS
SELECT
  date_trunc('month', t.effective_date)::date AS month,
  SUM(CASE WHEN t.amount > 0 THEN t.amount ELSE 0 END) AS inflows,
  SUM(CASE WHEN t.amount < 0 THEN t.amount ELSE 0 END) AS outflows,
  SUM(t.amount) AS net_flow,
  COUNT(*) AS txn_count
FROM public.transactions t
WHERE t.status IN ('completed','settled')
GROUP BY 1
ORDER BY 1 DESC;

CREATE OR REPLACE VIEW public.mi_fee_yield AS
SELECT
  date_trunc('month', fc.charged_date)::date AS month,
  fc.fee_type,
  SUM(fc.total) AS total_fees,
  COUNT(DISTINCT fc.client_id) AS clients_charged
FROM public.fee_charges fc
WHERE fc.status = 'charged'
GROUP BY 1, 2
ORDER BY 1 DESC, 2;

CREATE OR REPLACE VIEW public.mi_ops_queue_health AS
SELECT
  queue,
  status,
  priority,
  COUNT(*) AS case_count,
  COUNT(*) FILTER (WHERE sla_due_at < now() AND status NOT IN ('resolved','closed')) AS sla_breached
FROM public.ops_cases
GROUP BY queue, status, priority;

-- =============================================================
-- 8. INDEXES
-- =============================================================
CREATE INDEX IF NOT EXISTS idx_agency_client ON public.agency_assignments(client_id);
CREATE INDEX IF NOT EXISTS idx_agency_firm ON public.agency_assignments(firm_id);
CREATE INDEX IF NOT EXISTS idx_model_holdings_model ON public.model_holdings(model_id);
CREATE INDEX IF NOT EXISTS idx_model_assign_account ON public.model_assignments(account_id);
CREATE INDEX IF NOT EXISTS idx_corp_action_symbol ON public.corporate_actions(symbol);
CREATE INDEX IF NOT EXISTS idx_corp_election_action ON public.corporate_action_elections(corporate_action_id);
CREATE INDEX IF NOT EXISTS idx_ops_cases_status ON public.ops_cases(status, queue);
CREATE INDEX IF NOT EXISTS idx_ops_cases_assigned ON public.ops_cases(assigned_to);
CREATE INDEX IF NOT EXISTS idx_cass_recon_date ON public.cass_reconciliations(recon_date DESC);
