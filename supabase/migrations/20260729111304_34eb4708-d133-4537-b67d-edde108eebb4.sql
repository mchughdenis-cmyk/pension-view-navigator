-- =========================================================================
-- Best-in-class pension administration foundations
-- =========================================================================

-- ---------- Helpers ----------
CREATE OR REPLACE FUNCTION public.tg_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- ---------- Tenants & feature flags ----------
CREATE TABLE public.tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  timezone TEXT NOT NULL DEFAULT 'Europe/London',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tenants TO authenticated;
GRANT SELECT ON public.tenants TO anon;
GRANT ALL ON public.tenants TO service_role;
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenants_read_all" ON public.tenants FOR SELECT USING (true);
CREATE POLICY "tenants_write_auth" ON public.tenants FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER trg_tenants_upd BEFORE UPDATE ON public.tenants FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

INSERT INTO public.tenants (name, slug) VALUES ('Airgead Pension Navigator', 'airgead') ON CONFLICT DO NOTHING;

CREATE TABLE public.feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  flag_key TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT false,
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, flag_key)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.feature_flags TO authenticated;
GRANT SELECT ON public.feature_flags TO anon;
GRANT ALL ON public.feature_flags TO service_role;
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "flags_read_all" ON public.feature_flags FOR SELECT USING (true);
CREATE POLICY "flags_write_auth" ON public.feature_flags FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER trg_flags_upd BEFORE UPDATE ON public.feature_flags FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- ---------- General Ledger (double-entry) ----------
CREATE TABLE public.ledger_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  account_code TEXT NOT NULL,
  account_name TEXT NOT NULL,
  account_type TEXT NOT NULL CHECK (account_type IN ('asset','liability','equity','income','expense','client_money','firm_money','suspense')),
  wrapper TEXT,
  client_id UUID,
  currency TEXT NOT NULL DEFAULT 'GBP',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, account_code)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ledger_accounts TO authenticated;
GRANT SELECT ON public.ledger_accounts TO anon;
GRANT ALL ON public.ledger_accounts TO service_role;
ALTER TABLE public.ledger_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ledger_acc_read" ON public.ledger_accounts FOR SELECT USING (true);
CREATE POLICY "ledger_acc_write" ON public.ledger_accounts FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER trg_ledger_acc_upd BEFORE UPDATE ON public.ledger_accounts FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

CREATE TABLE public.ledger_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  batch_ref TEXT NOT NULL,
  description TEXT,
  posted_at TIMESTAMPTZ,
  posted_by UUID REFERENCES auth.users(id),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','posted','reversed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ledger_batches TO authenticated;
GRANT ALL ON public.ledger_batches TO service_role;
ALTER TABLE public.ledger_batches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ledger_batch_rw" ON public.ledger_batches FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER trg_ledger_batch_upd BEFORE UPDATE ON public.ledger_batches FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

CREATE TABLE public.ledger_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  batch_id UUID REFERENCES public.ledger_batches(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES public.ledger_accounts(id),
  client_id UUID,
  value_date DATE NOT NULL,
  effective_date DATE NOT NULL DEFAULT CURRENT_DATE,
  debit NUMERIC(18,2) NOT NULL DEFAULT 0,
  credit NUMERIC(18,2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'GBP',
  narrative TEXT,
  source_type TEXT,
  source_id UUID,
  reversal_of UUID REFERENCES public.ledger_entries(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK ((debit >= 0 AND credit >= 0) AND (debit = 0 OR credit = 0))
);
CREATE INDEX idx_ledger_entries_account ON public.ledger_entries(account_id, value_date);
CREATE INDEX idx_ledger_entries_client ON public.ledger_entries(client_id, value_date);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ledger_entries TO authenticated;
GRANT ALL ON public.ledger_entries TO service_role;
ALTER TABLE public.ledger_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ledger_entries_rw" ON public.ledger_entries FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ---------- Payments Hub ----------
CREATE TABLE public.payment_instructions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  client_id UUID,
  direction TEXT NOT NULL CHECK (direction IN ('outbound','inbound')),
  purpose TEXT NOT NULL CHECK (purpose IN ('benefit_payment','ufpls','pcls','drawdown','investment_buy','investment_sell','transfer_in','transfer_out','contribution','adviser_fee','platform_fee','hmrc','refund','other')),
  amount NUMERIC(18,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'GBP',
  beneficiary_name TEXT,
  beneficiary_sort_code TEXT,
  beneficiary_account TEXT,
  beneficiary_reference TEXT,
  payment_method TEXT CHECK (payment_method IN ('bacs','chaps','faster_payments','internal_transfer','cheque')),
  requested_date DATE,
  released_at TIMESTAMPTZ,
  settled_at TIMESTAMPTZ,
  reconciled_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','pending_approval','approved','rejected','released','settled','reconciled','failed','cancelled')),
  created_by UUID REFERENCES auth.users(id),
  approved_by UUID REFERENCES auth.users(id),
  batch_id UUID,
  case_id UUID,
  ledger_entry_id UUID REFERENCES public.ledger_entries(id),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_payments_status ON public.payment_instructions(status, requested_date);
CREATE INDEX idx_payments_client ON public.payment_instructions(client_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.payment_instructions TO authenticated;
GRANT ALL ON public.payment_instructions TO service_role;
ALTER TABLE public.payment_instructions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "payments_rw" ON public.payment_instructions FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER trg_payments_upd BEFORE UPDATE ON public.payment_instructions FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

CREATE TABLE public.payment_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id UUID NOT NULL REFERENCES public.payment_instructions(id) ON DELETE CASCADE,
  approver_id UUID NOT NULL REFERENCES auth.users(id),
  decision TEXT NOT NULL CHECK (decision IN ('approved','rejected')),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.payment_approvals TO authenticated;
GRANT ALL ON public.payment_approvals TO service_role;
ALTER TABLE public.payment_approvals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "payapp_rw" ON public.payment_approvals FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Four-eyes: approver must differ from maker
CREATE OR REPLACE FUNCTION public.enforce_four_eyes()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
DECLARE maker UUID;
BEGIN
  SELECT created_by INTO maker FROM public.payment_instructions WHERE id = NEW.payment_id;
  IF maker IS NOT NULL AND maker = NEW.approver_id THEN
    RAISE EXCEPTION 'Four-eyes violation: maker cannot approve own payment';
  END IF;
  RETURN NEW;
END; $$;
CREATE TRIGGER trg_four_eyes BEFORE INSERT ON public.payment_approvals
FOR EACH ROW EXECUTE FUNCTION public.enforce_four_eyes();

CREATE TABLE public.payment_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  batch_ref TEXT NOT NULL,
  payment_method TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'building' CHECK (status IN ('building','ready','submitted','settled','failed')),
  file_url TEXT,
  total_amount NUMERIC(18,2),
  item_count INTEGER,
  submitted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.payment_batches TO authenticated;
GRANT ALL ON public.payment_batches TO service_role;
ALTER TABLE public.payment_batches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "paybatch_rw" ON public.payment_batches FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER trg_paybatch_upd BEFORE UPDATE ON public.payment_batches FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- ---------- Expected receipts (auto-match) ----------
CREATE TABLE public.expected_receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  client_id UUID,
  source TEXT NOT NULL CHECK (source IN ('contribution','direct_debit','transfer_in','refund','other')),
  amount NUMERIC(18,2) NOT NULL,
  expected_date DATE NOT NULL,
  reference TEXT,
  matched_bank_line_id UUID,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','matched','partial','missed','cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_expected_receipts_status ON public.expected_receipts(status, expected_date);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.expected_receipts TO authenticated;
GRANT ALL ON public.expected_receipts TO service_role;
ALTER TABLE public.expected_receipts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "exprec_rw" ON public.expected_receipts FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER trg_exprec_upd BEFORE UPDATE ON public.expected_receipts FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- ---------- Case & workflow engine ----------
CREATE TABLE public.cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  case_ref TEXT NOT NULL,
  case_type TEXT NOT NULL,
  subject_client_id UUID,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','in_progress','pending_client','pending_approval','on_hold','closed','cancelled')),
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low','normal','high','urgent')),
  sla_due_at TIMESTAMPTZ,
  assignee_id UUID REFERENCES auth.users(id),
  opened_by UUID REFERENCES auth.users(id),
  closed_at TIMESTAMPTZ,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_cases_status ON public.cases(status, sla_due_at);
CREATE INDEX idx_cases_client ON public.cases(subject_client_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cases TO authenticated;
GRANT ALL ON public.cases TO service_role;
ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cases_rw" ON public.cases FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER trg_cases_upd BEFORE UPDATE ON public.cases FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

CREATE TABLE public.case_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  seq INTEGER NOT NULL DEFAULT 0,
  title TEXT NOT NULL,
  is_done BOOLEAN NOT NULL DEFAULT false,
  done_by UUID REFERENCES auth.users(id),
  done_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.case_tasks TO authenticated;
GRANT ALL ON public.case_tasks TO service_role;
ALTER TABLE public.case_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "casetasks_rw" ON public.case_tasks FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE TABLE public.case_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES auth.users(id),
  event_type TEXT NOT NULL,
  detail TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_case_events_case ON public.case_events(case_id, created_at);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.case_events TO authenticated;
GRANT ALL ON public.case_events TO service_role;
ALTER TABLE public.case_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "caseevents_rw" ON public.case_events FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE TABLE public.case_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT,
  file_size INTEGER,
  mime_type TEXT,
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.case_documents TO authenticated;
GRANT ALL ON public.case_documents TO service_role;
ALTER TABLE public.case_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "casedocs_rw" ON public.case_documents FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ---------- Domain events bus ----------
CREATE TABLE public.domain_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  event_name TEXT NOT NULL,
  aggregate_type TEXT,
  aggregate_id UUID,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  emitted_by UUID REFERENCES auth.users(id),
  published BOOLEAN NOT NULL DEFAULT false,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_domain_events_pub ON public.domain_events(published, created_at);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.domain_events TO authenticated;
GRANT ALL ON public.domain_events TO service_role;
ALTER TABLE public.domain_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "domainevt_rw" ON public.domain_events FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ---------- Reference data ----------
CREATE TABLE public.reference_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tax_year TEXT NOT NULL,
  rate_key TEXT NOT NULL,
  rate_value NUMERIC(18,4) NOT NULL,
  unit TEXT,
  notes TEXT,
  effective_from DATE,
  effective_to DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tax_year, rate_key)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reference_rates TO authenticated;
GRANT SELECT ON public.reference_rates TO anon;
GRANT ALL ON public.reference_rates TO service_role;
ALTER TABLE public.reference_rates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "refrates_read" ON public.reference_rates FOR SELECT USING (true);
CREATE POLICY "refrates_write" ON public.reference_rates FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER trg_refrates_upd BEFORE UPDATE ON public.reference_rates FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

INSERT INTO public.reference_rates (tax_year, rate_key, rate_value, unit, notes) VALUES
  ('2024/25','annual_allowance', 60000, 'GBP', 'Standard AA'),
  ('2024/25','mpaa', 10000, 'GBP', 'Money Purchase AA'),
  ('2024/25','lsa', 268275, 'GBP', 'Lump Sum Allowance'),
  ('2024/25','lsdba', 1073100, 'GBP', 'Lump Sum & Death Benefit Allowance'),
  ('2024/25','isa_allowance', 20000, 'GBP', 'Adult ISA'),
  ('2024/25','pension_basic_rate_relief', 0.20, 'ratio', 'RAS basic rate'),
  ('2024/25','personal_allowance', 12570, 'GBP', 'Income tax PA'),
  ('2024/25','basic_rate_band', 37700, 'GBP', 'Basic rate band'),
  ('2024/25','higher_rate_threshold', 50270, 'GBP', 'HR threshold'),
  ('2024/25','additional_rate_threshold', 125140, 'GBP', 'AR threshold')
ON CONFLICT DO NOTHING;

CREATE TABLE public.bank_calendar (
  calendar_date DATE PRIMARY KEY,
  is_working_day BOOLEAN NOT NULL DEFAULT true,
  is_bacs_day BOOLEAN NOT NULL DEFAULT true,
  holiday_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bank_calendar TO authenticated;
GRANT SELECT ON public.bank_calendar TO anon;
GRANT ALL ON public.bank_calendar TO service_role;
ALTER TABLE public.bank_calendar ENABLE ROW LEVEL SECURITY;
CREATE POLICY "bankcal_read" ON public.bank_calendar FOR SELECT USING (true);
CREATE POLICY "bankcal_write" ON public.bank_calendar FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ---------- Secure messages (already exists — extend with tenant/case/from_role) ----------
ALTER TABLE public.secure_messages
  ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS case_id UUID REFERENCES public.cases(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS from_user_id UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS from_role TEXT;
CREATE INDEX IF NOT EXISTS idx_secmsg_thread ON public.secure_messages(thread_id, created_at);

-- ---------- API credentials ----------
CREATE TABLE public.api_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  key_prefix TEXT NOT NULL,
  key_hash TEXT NOT NULL,
  scopes TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_used_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.api_credentials TO authenticated;
GRANT ALL ON public.api_credentials TO service_role;
ALTER TABLE public.api_credentials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "apikey_rw" ON public.api_credentials FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER trg_apikey_upd BEFORE UPDATE ON public.api_credentials FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- Convenience view: trial balance by account
CREATE OR REPLACE VIEW public.trial_balance AS
SELECT
  a.tenant_id,
  a.id AS account_id,
  a.account_code,
  a.account_name,
  a.account_type,
  COALESCE(SUM(e.debit),0)::NUMERIC(18,2) AS total_debit,
  COALESCE(SUM(e.credit),0)::NUMERIC(18,2) AS total_credit,
  (COALESCE(SUM(e.debit),0) - COALESCE(SUM(e.credit),0))::NUMERIC(18,2) AS balance
FROM public.ledger_accounts a
LEFT JOIN public.ledger_entries e ON e.account_id = a.id
GROUP BY a.tenant_id, a.id, a.account_code, a.account_name, a.account_type;
GRANT SELECT ON public.trial_balance TO authenticated, anon, service_role;
