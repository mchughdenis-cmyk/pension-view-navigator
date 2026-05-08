
-- DEALING
CREATE TABLE IF NOT EXISTS public.trade_blocks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  block_ref TEXT NOT NULL DEFAULT ('BLK-' || to_char(now(),'YYYYMMDD') || '-' || lpad(floor(random()*9999)::text,4,'0')),
  symbol TEXT NOT NULL, isin TEXT, side TEXT NOT NULL CHECK (side IN ('buy','sell')),
  total_units NUMERIC NOT NULL DEFAULT 0, total_value NUMERIC NOT NULL DEFAULT 0,
  exec_price NUMERIC, venue TEXT, cut_off_at TIMESTAMPTZ, executed_at TIMESTAMPTZ,
  settlement_date DATE, status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.trade_allocations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  block_id UUID NOT NULL, client_id UUID NOT NULL, account_id UUID NOT NULL,
  units NUMERIC NOT NULL DEFAULT 0, value NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending', created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.settlement_instructions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  block_id UUID, counterparty TEXT NOT NULL, settlement_type TEXT NOT NULL DEFAULT 'DvP',
  settlement_date DATE NOT NULL, amount NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending', reference TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- CASH MGMT
CREATE TABLE IF NOT EXISTS public.interest_accruals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  account_id UUID NOT NULL, client_id UUID NOT NULL,
  accrual_date DATE NOT NULL DEFAULT CURRENT_DATE,
  daily_balance NUMERIC NOT NULL DEFAULT 0, rate_pct NUMERIC NOT NULL DEFAULT 0,
  interest NUMERIC NOT NULL DEFAULT 0, paid_date DATE,
  status TEXT NOT NULL DEFAULT 'accrued', created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.cash_sweeps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  account_id UUID NOT NULL, client_id UUID NOT NULL,
  sweep_date DATE NOT NULL DEFAULT CURRENT_DATE,
  from_account TEXT NOT NULL, to_account TEXT NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0, status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.cash_forecasts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID, forecast_date DATE NOT NULL,
  expected_inflows NUMERIC NOT NULL DEFAULT 0, expected_outflows NUMERIC NOT NULL DEFAULT 0,
  net NUMERIC GENERATED ALWAYS AS (expected_inflows - expected_outflows) STORED,
  notes TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- TAX
CREATE TABLE IF NOT EXISTS public.paye_calculations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL, payment_type TEXT NOT NULL,
  gross_amount NUMERIC NOT NULL DEFAULT 0, tax_free_amount NUMERIC NOT NULL DEFAULT 0,
  taxable_amount NUMERIC NOT NULL DEFAULT 0, tax_code TEXT NOT NULL DEFAULT '1257L',
  emergency_basis BOOLEAN NOT NULL DEFAULT false, income_tax NUMERIC NOT NULL DEFAULT 0,
  net_amount NUMERIC NOT NULL DEFAULT 0, tax_year TEXT NOT NULL DEFAULT '2024/25',
  pay_date DATE NOT NULL DEFAULT CURRENT_DATE, created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.rti_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  submission_type TEXT NOT NULL DEFAULT 'FPS', tax_year TEXT NOT NULL DEFAULT '2024/25',
  period_end DATE NOT NULL DEFAULT CURRENT_DATE, client_count INT NOT NULL DEFAULT 0,
  total_gross NUMERIC NOT NULL DEFAULT 0, total_tax NUMERIC NOT NULL DEFAULT 0,
  hmrc_reference TEXT, status TEXT NOT NULL DEFAULT 'draft', payload JSONB,
  submitted_at TIMESTAMPTZ, created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.isa_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL, account_id UUID NOT NULL,
  tax_year TEXT NOT NULL DEFAULT '2024/25', amount NUMERIC NOT NULL DEFAULT 0,
  subscription_date DATE NOT NULL DEFAULT CURRENT_DATE,
  source TEXT NOT NULL DEFAULT 'cash', created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.cgt_disposals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL, account_id UUID NOT NULL, symbol TEXT NOT NULL,
  disposal_date DATE NOT NULL, units NUMERIC NOT NULL DEFAULT 0,
  proceeds NUMERIC NOT NULL DEFAULT 0, cost_basis NUMERIC NOT NULL DEFAULT 0,
  gain_loss NUMERIC GENERATED ALWAYS AS (proceeds - cost_basis) STORED,
  matching_rule TEXT NOT NULL DEFAULT 'section_104',
  tax_year TEXT NOT NULL DEFAULT '2024/25', created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.aa_carry_forward (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL, tax_year TEXT NOT NULL,
  annual_allowance NUMERIC NOT NULL DEFAULT 60000,
  used_this_year NUMERIC NOT NULL DEFAULT 0,
  carried_forward NUMERIC NOT NULL DEFAULT 0,
  notes TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- STATEMENTS
CREATE TABLE IF NOT EXISTS public.statements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL, statement_type TEXT NOT NULL DEFAULT 'quarterly',
  period_start DATE NOT NULL, period_end DATE NOT NULL,
  opening_value NUMERIC NOT NULL DEFAULT 0, closing_value NUMERIC NOT NULL DEFAULT 0,
  net_contributions NUMERIC NOT NULL DEFAULT 0, net_withdrawals NUMERIC NOT NULL DEFAULT 0,
  growth NUMERIC NOT NULL DEFAULT 0, fees NUMERIC NOT NULL DEFAULT 0,
  storage_path TEXT, status TEXT NOT NULL DEFAULT 'generated',
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.mifid_drop_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL, account_id UUID NOT NULL,
  threshold_pct NUMERIC NOT NULL DEFAULT 10, drop_pct NUMERIC NOT NULL,
  reference_value NUMERIC NOT NULL, current_value NUMERIC NOT NULL,
  alerted_at TIMESTAMPTZ NOT NULL DEFAULT now(), notified BOOLEAN NOT NULL DEFAULT false
);
CREATE TABLE IF NOT EXISTS public.costs_charges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL, disclosure_type TEXT NOT NULL DEFAULT 'ex_post',
  period_start DATE NOT NULL, period_end DATE NOT NULL,
  platform_charges NUMERIC NOT NULL DEFAULT 0, adviser_charges NUMERIC NOT NULL DEFAULT 0,
  fund_charges NUMERIC NOT NULL DEFAULT 0, transaction_costs NUMERIC NOT NULL DEFAULT 0,
  total_charges NUMERIC GENERATED ALWAYS AS (platform_charges + adviser_charges + fund_charges + transaction_costs) STORED,
  pct_of_aua NUMERIC, created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.consumer_duty_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL, review_date DATE NOT NULL DEFAULT CURRENT_DATE,
  fair_value_score INT NOT NULL DEFAULT 0, outcomes_score INT NOT NULL DEFAULT 0,
  vulnerability_flag BOOLEAN NOT NULL DEFAULT false, notes TEXT, reviewer TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- WORKFLOW
CREATE TABLE IF NOT EXISTS public.workflow_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL, description TEXT, trigger_event TEXT,
  steps JSONB NOT NULL DEFAULT '[]'::jsonb,
  sla_minutes INT NOT NULL DEFAULT 1440,
  four_eyes_required BOOLEAN NOT NULL DEFAULT false,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.workflow_instances (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id UUID, case_id UUID, client_id UUID,
  status TEXT NOT NULL DEFAULT 'running', current_step INT NOT NULL DEFAULT 0,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(), due_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ, context JSONB
);
CREATE TABLE IF NOT EXISTS public.four_eyes_approvals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  entity_type TEXT NOT NULL, entity_id UUID NOT NULL, amount NUMERIC,
  requested_by TEXT NOT NULL, approved_by TEXT,
  status TEXT NOT NULL DEFAULT 'pending', notes TEXT,
  requested_at TIMESTAMPTZ NOT NULL DEFAULT now(), approved_at TIMESTAMPTZ
);

-- DOCS
CREATE TABLE IF NOT EXISTS public.document_versions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID NOT NULL, version INT NOT NULL DEFAULT 1,
  storage_path TEXT NOT NULL, uploaded_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.esign_envelopes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL, provider TEXT NOT NULL DEFAULT 'docusign',
  envelope_ref TEXT, document_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'sent', sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  signed_at TIMESTAMPTZ, created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.retention_policies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  doc_type TEXT NOT NULL UNIQUE, retention_years INT NOT NULL DEFAULT 7,
  legal_hold BOOLEAN NOT NULL DEFAULT false, notes TEXT
);

-- ADVISER PORTAL
CREATE TABLE IF NOT EXISTS public.agency_transfers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL, from_firm_id UUID, to_firm_id UUID NOT NULL,
  effective_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'pending', notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.illustrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL, scenario_name TEXT NOT NULL,
  contributions NUMERIC NOT NULL DEFAULT 0, growth_rate NUMERIC NOT NULL DEFAULT 0.05,
  retirement_age INT NOT NULL DEFAULT 65, projected_pot NUMERIC NOT NULL DEFAULT 0,
  inflation_rate NUMERIC NOT NULL DEFAULT 0.025,
  fca_rate_low NUMERIC NOT NULL DEFAULT 0.02,
  fca_rate_mid NUMERIC NOT NULL DEFAULT 0.05,
  fca_rate_high NUMERIC NOT NULL DEFAULT 0.08,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.suitability_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL, recommendation TEXT NOT NULL,
  rationale TEXT, risk_alignment TEXT, costs_summary TEXT,
  status TEXT NOT NULL DEFAULT 'draft', signed_off_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.fact_finds (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL, income_annual NUMERIC, expenditure_annual NUMERIC,
  assets JSONB, liabilities JSONB, dependants INT, objectives TEXT,
  completed_at TIMESTAMPTZ, created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.atr_assessments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL, score INT NOT NULL, category TEXT NOT NULL,
  capacity_for_loss TEXT, questionnaire JSONB,
  assessed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- CLIENT PORTAL
CREATE TABLE IF NOT EXISTS public.open_banking_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL, provider TEXT NOT NULL DEFAULT 'truelayer',
  bank_name TEXT, account_mask TEXT, consent_expiry DATE,
  status TEXT NOT NULL DEFAULT 'active', created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.push_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL, title TEXT NOT NULL, body TEXT NOT NULL,
  category TEXT, read_at TIMESTAMPTZ, sent_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.secure_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL, thread_id UUID,
  sender TEXT NOT NULL, recipient TEXT NOT NULL,
  subject TEXT, body TEXT NOT NULL, read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.dd_mandates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL, account_id UUID NOT NULL,
  bank_name TEXT NOT NULL, sort_code TEXT NOT NULL, account_number TEXT NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0, frequency TEXT NOT NULL DEFAULT 'monthly',
  status TEXT NOT NULL DEFAULT 'active', next_collection DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- API
CREATE TABLE IF NOT EXISTS public.api_keys (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL, key_prefix TEXT NOT NULL,
  scopes TEXT[] NOT NULL DEFAULT ARRAY['read'],
  status TEXT NOT NULL DEFAULT 'active', last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.webhook_endpoints (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  url TEXT NOT NULL, events TEXT[] NOT NULL DEFAULT ARRAY['*'],
  secret TEXT, status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.webhook_deliveries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  endpoint_id UUID NOT NULL, event TEXT NOT NULL, payload JSONB,
  status TEXT NOT NULL DEFAULT 'pending', response_code INT,
  delivered_at TIMESTAMPTZ, created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ESG
CREATE TABLE IF NOT EXISTS public.esg_fund_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  symbol TEXT NOT NULL, isin TEXT, fund_name TEXT,
  sfdr_article TEXT, esg_score NUMERIC, carbon_intensity NUMERIC,
  fossil_fuel_pct NUMERIC, controversies INT NOT NULL DEFAULT 0,
  source TEXT NOT NULL DEFAULT 'msci_stub',
  as_of_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.voting_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  fund_symbol TEXT NOT NULL, meeting_date DATE NOT NULL,
  proposal TEXT NOT NULL, vote TEXT NOT NULL, rationale TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- AI
CREATE TABLE IF NOT EXISTS public.ai_insights (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  insight_type TEXT NOT NULL, entity_type TEXT, entity_id UUID,
  client_id UUID, title TEXT NOT NULL, summary TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'info', confidence NUMERIC NOT NULL DEFAULT 0.8,
  raw JSONB, acted_on BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_trade_allocations_client ON public.trade_allocations(client_id);
CREATE INDEX IF NOT EXISTS idx_trade_allocations_block ON public.trade_allocations(block_id);
CREATE INDEX IF NOT EXISTS idx_paye_client ON public.paye_calculations(client_id);
CREATE INDEX IF NOT EXISTS idx_isa_client_year ON public.isa_subscriptions(client_id, tax_year);
CREATE INDEX IF NOT EXISTS idx_cgt_client_year ON public.cgt_disposals(client_id, tax_year);
CREATE INDEX IF NOT EXISTS idx_aa_client_year ON public.aa_carry_forward(client_id, tax_year);
CREATE INDEX IF NOT EXISTS idx_statements_client ON public.statements(client_id);
CREATE INDEX IF NOT EXISTS idx_workflow_instances_status ON public.workflow_instances(status);
CREATE INDEX IF NOT EXISTS idx_secure_messages_client ON public.secure_messages(client_id);
CREATE INDEX IF NOT EXISTS idx_push_client ON public.push_notifications(client_id);
CREATE INDEX IF NOT EXISTS idx_ai_insights_client ON public.ai_insights(client_id);
CREATE INDEX IF NOT EXISTS idx_esg_symbol ON public.esg_fund_data(symbol);

-- RLS
DO $$
DECLARE t TEXT;
BEGIN
  FOR t IN SELECT unnest(ARRAY[
    'trade_blocks','trade_allocations','settlement_instructions',
    'interest_accruals','cash_sweeps','cash_forecasts',
    'paye_calculations','rti_submissions','isa_subscriptions','cgt_disposals','aa_carry_forward',
    'statements','mifid_drop_alerts','costs_charges','consumer_duty_reviews',
    'workflow_templates','workflow_instances','four_eyes_approvals',
    'document_versions','esign_envelopes','retention_policies',
    'agency_transfers','illustrations','suitability_reports','fact_finds','atr_assessments',
    'open_banking_links','push_notifications','secure_messages','dd_mandates',
    'api_keys','webhook_endpoints','webhook_deliveries',
    'esg_fund_data','voting_records','ai_insights'
  ])
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('DROP POLICY IF EXISTS "all select" ON public.%I', t);
    EXECUTE format('DROP POLICY IF EXISTS "all insert" ON public.%I', t);
    EXECUTE format('DROP POLICY IF EXISTS "all update" ON public.%I', t);
    EXECUTE format('DROP POLICY IF EXISTS "all delete" ON public.%I', t);
    EXECUTE format('CREATE POLICY "all select" ON public.%I FOR SELECT USING (true)', t);
    EXECUTE format('CREATE POLICY "all insert" ON public.%I FOR INSERT WITH CHECK (true)', t);
    EXECUTE format('CREATE POLICY "all update" ON public.%I FOR UPDATE USING (true) WITH CHECK (true)', t);
    EXECUTE format('CREATE POLICY "all delete" ON public.%I FOR DELETE USING (true)', t);
  END LOOP;
END $$;

-- MI views (handle either type)
DROP VIEW IF EXISTS public.mi_persistency CASCADE;
DROP MATERIALIZED VIEW IF EXISTS public.mi_persistency CASCADE;
CREATE MATERIALIZED VIEW public.mi_persistency AS
SELECT
  date_trunc('month', c.created_at)::date AS month,
  count(*) FILTER (WHERE c.status = 'active') AS active_clients,
  count(*) FILTER (WHERE c.status = 'closed') AS closed_clients,
  CASE WHEN count(*) > 0 THEN
    round(100.0 * count(*) FILTER (WHERE c.status = 'active') / count(*), 2)
  ELSE 0 END AS persistency_pct
FROM public.clients c GROUP BY 1 ORDER BY 1 DESC;
GRANT SELECT ON public.mi_persistency TO anon, authenticated;

DROP VIEW IF EXISTS public.mi_fee_yield CASCADE;
DROP MATERIALIZED VIEW IF EXISTS public.mi_fee_yield CASCADE;
CREATE MATERIALIZED VIEW public.mi_fee_yield AS
SELECT
  date_trunc('month', fc.charged_date)::date AS month,
  sum(fc.total) AS fees_charged,
  count(distinct fc.client_id) AS billed_clients
FROM public.fee_charges fc GROUP BY 1 ORDER BY 1 DESC;
GRANT SELECT ON public.mi_fee_yield TO anon, authenticated;
