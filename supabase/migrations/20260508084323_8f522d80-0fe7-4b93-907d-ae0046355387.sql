
-- Contributions
CREATE TABLE public.contributions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL,
  account_id UUID NOT NULL,
  contribution_type TEXT NOT NULL DEFAULT 'member', -- member | employer | third_party
  gross_amount NUMERIC NOT NULL DEFAULT 0,
  net_amount NUMERIC NOT NULL DEFAULT 0,
  tax_relief NUMERIC NOT NULL DEFAULT 0,
  relief_method TEXT NOT NULL DEFAULT 'ras', -- ras | net_pay | none
  tax_year TEXT,
  effective_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'received',
  reference TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.contributions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all select" ON public.contributions FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow all insert" ON public.contributions FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Allow all update" ON public.contributions FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all delete" ON public.contributions FOR DELETE TO anon, authenticated USING (true);
CREATE TRIGGER update_contributions_updated_at BEFORE UPDATE ON public.contributions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Transfers In
CREATE TABLE public.transfers_in (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL,
  account_id UUID,
  ceding_scheme_name TEXT NOT NULL,
  ceding_scheme_ref TEXT,
  ceding_provider TEXT,
  transfer_type TEXT NOT NULL DEFAULT 'cash', -- cash | in_specie
  estimated_value NUMERIC NOT NULL DEFAULT 0,
  received_value NUMERIC,
  contains_protected_tax_free_cash BOOLEAN NOT NULL DEFAULT false,
  protected_tax_free_cash_pct NUMERIC,
  contains_safeguarded_benefits BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'requested', -- requested | letter_sent | in_progress | received | completed | cancelled
  request_date DATE NOT NULL DEFAULT CURRENT_DATE,
  completed_date DATE,
  origo_used BOOLEAN NOT NULL DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.transfers_in ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all select" ON public.transfers_in FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow all insert" ON public.transfers_in FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Allow all update" ON public.transfers_in FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all delete" ON public.transfers_in FOR DELETE TO anon, authenticated USING (true);
CREATE TRIGGER update_transfers_in_updated_at BEFORE UPDATE ON public.transfers_in FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Fee Charges
CREATE TABLE public.fee_charges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL,
  account_id UUID NOT NULL,
  fee_type TEXT NOT NULL DEFAULT 'platform', -- platform | adviser | dealing | exit
  description TEXT,
  basis TEXT NOT NULL DEFAULT 'percent', -- percent | flat
  rate NUMERIC NOT NULL DEFAULT 0,
  amount NUMERIC NOT NULL DEFAULT 0,
  vat NUMERIC NOT NULL DEFAULT 0,
  total NUMERIC NOT NULL DEFAULT 0,
  period_start DATE,
  period_end DATE,
  charged_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'accrued', -- accrued | charged | refunded
  reference TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.fee_charges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all select" ON public.fee_charges FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow all insert" ON public.fee_charges FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Allow all update" ON public.fee_charges FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all delete" ON public.fee_charges FOR DELETE TO anon, authenticated USING (true);
CREATE TRIGGER update_fee_charges_updated_at BEFORE UPDATE ON public.fee_charges FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Valuations
CREATE TABLE public.valuations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL,
  account_id UUID NOT NULL,
  valuation_date DATE NOT NULL DEFAULT CURRENT_DATE,
  cash_balance NUMERIC NOT NULL DEFAULT 0,
  investments_value NUMERIC NOT NULL DEFAULT 0,
  total_value NUMERIC NOT NULL DEFAULT 0,
  source TEXT NOT NULL DEFAULT 'system', -- system | manual | feed
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.valuations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all select" ON public.valuations FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow all insert" ON public.valuations FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Allow all update" ON public.valuations FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all delete" ON public.valuations FOR DELETE TO anon, authenticated USING (true);

-- Death Claims
CREATE TABLE public.death_claims (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL,
  date_of_death DATE NOT NULL,
  notified_date DATE NOT NULL DEFAULT CURRENT_DATE,
  cause_of_death TEXT,
  total_pot_value NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'opened', -- opened | documents_received | in_payment | settled | closed
  pre_75 BOOLEAN NOT NULL DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.death_claims ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all select" ON public.death_claims FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow all insert" ON public.death_claims FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Allow all update" ON public.death_claims FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all delete" ON public.death_claims FOR DELETE TO anon, authenticated USING (true);
CREATE TRIGGER update_death_claims_updated_at BEFORE UPDATE ON public.death_claims FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Death Benefit Payments (per beneficiary)
CREATE TABLE public.death_benefit_payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  death_claim_id UUID NOT NULL,
  client_id UUID NOT NULL,
  beneficiary_id UUID,
  beneficiary_name TEXT NOT NULL,
  payment_type TEXT NOT NULL DEFAULT 'lump_sum', -- lump_sum | dependant_drawdown | annuity
  gross_amount NUMERIC NOT NULL DEFAULT 0,
  tax_amount NUMERIC NOT NULL DEFAULT 0,
  net_amount NUMERIC NOT NULL DEFAULT 0,
  paid_date DATE,
  status TEXT NOT NULL DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.death_benefit_payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all select" ON public.death_benefit_payments FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow all insert" ON public.death_benefit_payments FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Allow all update" ON public.death_benefit_payments FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all delete" ON public.death_benefit_payments FOR DELETE TO anon, authenticated USING (true);
CREATE TRIGGER update_dbp_updated_at BEFORE UPDATE ON public.death_benefit_payments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Statements
CREATE TABLE public.statements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL,
  account_id UUID,
  statement_type TEXT NOT NULL DEFAULT 'annual', -- annual | tax | valuation | quarterly
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  opening_value NUMERIC NOT NULL DEFAULT 0,
  closing_value NUMERIC NOT NULL DEFAULT 0,
  contributions_total NUMERIC NOT NULL DEFAULT 0,
  withdrawals_total NUMERIC NOT NULL DEFAULT 0,
  fees_total NUMERIC NOT NULL DEFAULT 0,
  growth NUMERIC NOT NULL DEFAULT 0,
  generated_date DATE NOT NULL DEFAULT CURRENT_DATE,
  payload JSONB,
  status TEXT NOT NULL DEFAULT 'generated',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.statements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all select" ON public.statements FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow all insert" ON public.statements FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Allow all update" ON public.statements FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all delete" ON public.statements FOR DELETE TO anon, authenticated USING (true);

CREATE INDEX idx_contributions_client ON public.contributions(client_id);
CREATE INDEX idx_transfers_in_client ON public.transfers_in(client_id);
CREATE INDEX idx_fee_charges_client ON public.fee_charges(client_id);
CREATE INDEX idx_valuations_client ON public.valuations(client_id, valuation_date DESC);
CREATE INDEX idx_death_claims_client ON public.death_claims(client_id);
CREATE INDEX idx_dbp_claim ON public.death_benefit_payments(death_claim_id);
CREATE INDEX idx_statements_client ON public.statements(client_id, period_end DESC);
