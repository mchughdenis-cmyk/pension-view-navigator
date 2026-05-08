
CREATE TABLE IF NOT EXISTS public.hmrc_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), submission_type TEXT NOT NULL, period TEXT NOT NULL,
  scheme_ref TEXT, payload JSONB, response JSONB, status TEXT NOT NULL DEFAULT 'draft',
  hmrc_ref TEXT, total_amount NUMERIC DEFAULT 0, submitted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS public.ras_reclaim_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), submission_id UUID NOT NULL, client_id UUID NOT NULL,
  net_contribution NUMERIC NOT NULL DEFAULT 0, reclaim_amount NUMERIC NOT NULL DEFAULT 0,
  ni_number TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS public.event_report_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), submission_id UUID NOT NULL, client_id UUID,
  event_code TEXT NOT NULL, event_date DATE NOT NULL, amount NUMERIC, details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS public.hmrc_test_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), submission_type TEXT NOT NULL,
  payload JSONB, expected JSONB, actual JSONB, passed BOOLEAN NOT NULL DEFAULT false,
  notes TEXT, run_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS public.lsa_lsdba_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), client_id UUID NOT NULL, event_type TEXT NOT NULL,
  event_date DATE NOT NULL, lsa_used NUMERIC NOT NULL DEFAULT 0, lsdba_used NUMERIC NOT NULL DEFAULT 0,
  running_lsa NUMERIC NOT NULL DEFAULT 0, running_lsdba NUMERIC NOT NULL DEFAULT 0,
  source_event_id UUID, notes TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS public.paye_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), period TEXT NOT NULL, pay_date DATE NOT NULL,
  total_gross NUMERIC NOT NULL DEFAULT 0, total_tax NUMERIC NOT NULL DEFAULT 0,
  total_ni NUMERIC NOT NULL DEFAULT 0, total_net NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft', fps_ref TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS public.paye_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), run_id UUID NOT NULL, client_id UUID NOT NULL,
  gross NUMERIC NOT NULL DEFAULT 0, tax_code TEXT NOT NULL DEFAULT '1257L',
  paye NUMERIC NOT NULL DEFAULT 0, ni NUMERIC NOT NULL DEFAULT 0, net NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS public.origo_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), transfer_id UUID, client_id UUID,
  direction TEXT NOT NULL, message_type TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'pending',
  ack_ref TEXT, payload JSONB, sent_at TIMESTAMPTZ, acked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS public.cass_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), materiality_threshold NUMERIC NOT NULL DEFAULT 1000,
  daily_recon_enabled BOOLEAN NOT NULL DEFAULT true, alert_email TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS public.ssas_schemes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), scheme_ref TEXT NOT NULL, scheme_name TEXT NOT NULL,
  sponsoring_employer TEXT NOT NULL, registration_date DATE, professional_trustee TEXT,
  status TEXT NOT NULL DEFAULT 'active', total_assets NUMERIC NOT NULL DEFAULT 0, notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS public.ssas_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), scheme_id UUID NOT NULL, client_id UUID NOT NULL,
  is_trustee BOOLEAN NOT NULL DEFAULT false, share_pct NUMERIC NOT NULL DEFAULT 0,
  joined_date DATE, created_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS public.ssas_loanbacks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), scheme_id UUID NOT NULL, borrower_employer TEXT NOT NULL,
  principal NUMERIC NOT NULL DEFAULT 0, interest_rate NUMERIC NOT NULL DEFAULT 0,
  charge_secured TEXT, start_date DATE NOT NULL, term_months INTEGER NOT NULL DEFAULT 60,
  outstanding_balance NUMERIC NOT NULL DEFAULT 0, fifty_pct_test_pass BOOLEAN NOT NULL DEFAULT true,
  status TEXT NOT NULL DEFAULT 'active', notes TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS public.commercial_properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), scheme_id UUID, client_id UUID, address TEXT NOT NULL,
  property_type TEXT NOT NULL DEFAULT 'office', valuation NUMERIC NOT NULL DEFAULT 0,
  valuation_date DATE, vat_registered BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'owned', created_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS public.property_leases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), property_id UUID NOT NULL, tenant_name TEXT NOT NULL,
  rent_pa NUMERIC NOT NULL DEFAULT 0, frequency TEXT NOT NULL DEFAULT 'quarterly',
  start_date DATE, end_date DATE, next_review DATE, deposit NUMERIC DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active', created_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS public.property_rent_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), lease_id UUID NOT NULL, due_date DATE NOT NULL,
  amount_due NUMERIC NOT NULL DEFAULT 0, amount_received NUMERIC NOT NULL DEFAULT 0,
  received_date DATE, status TEXT NOT NULL DEFAULT 'due',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS public.property_insurance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), property_id UUID NOT NULL, provider TEXT NOT NULL,
  policy_ref TEXT, premium NUMERIC NOT NULL DEFAULT 0, renewal_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active', created_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS public.scheme_pensions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), client_id UUID NOT NULL,
  pension_type TEXT NOT NULL DEFAULT 'open_market', provider TEXT NOT NULL, policy_ref TEXT,
  gross_annual NUMERIC NOT NULL DEFAULT 0, escalation_pct NUMERIC NOT NULL DEFAULT 0,
  guarantee_period_years INTEGER NOT NULL DEFAULT 0, spouse_pct NUMERIC NOT NULL DEFAULT 0,
  commencement_date DATE NOT NULL, paid_to_date NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active', created_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS public.capped_drawdown_segments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), client_id UUID NOT NULL, account_id UUID,
  fund_value NUMERIC NOT NULL DEFAULT 0, gad_basis_amount NUMERIC NOT NULL DEFAULT 0,
  gad_cap_pct NUMERIC NOT NULL DEFAULT 150, current_max_pa NUMERIC NOT NULL DEFAULT 0,
  last_review_date DATE NOT NULL, next_review_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active', created_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS public.pension_sharing_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), member_client_id UUID NOT NULL,
  ex_partner_name TEXT NOT NULL, ex_partner_dob DATE, court_order_date DATE NOT NULL,
  percentage NUMERIC NOT NULL DEFAULT 0, transfer_value NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'received', implementation_date DATE, notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS public.in_specie_transfers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), client_id UUID NOT NULL,
  direction TEXT NOT NULL DEFAULT 'in', asset_list JSONB NOT NULL DEFAULT '[]'::jsonb,
  valuation_basis TEXT NOT NULL DEFAULT 'mid_market', valuation_date DATE NOT NULL,
  total_value NUMERIC NOT NULL DEFAULT 0, status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS public.bulk_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), model_id UUID,
  trade_date DATE NOT NULL DEFAULT CURRENT_DATE, status TEXT NOT NULL DEFAULT 'aggregating',
  total_value NUMERIC NOT NULL DEFAULT 0, total_clients INTEGER NOT NULL DEFAULT 0,
  notes TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS public.bulk_order_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), bulk_id UUID NOT NULL, client_id UUID NOT NULL,
  account_id UUID, symbol TEXT NOT NULL, side TEXT NOT NULL,
  units NUMERIC NOT NULL DEFAULT 0, price NUMERIC, fill_pct NUMERIC NOT NULL DEFAULT 100,
  status TEXT NOT NULL DEFAULT 'pending', created_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS public.webhook_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), api_key_id UUID, url TEXT NOT NULL,
  events TEXT[] NOT NULL DEFAULT ARRAY['*'], secret TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active', created_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS public.webhook_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), subscription_id UUID NOT NULL, event TEXT NOT NULL,
  payload JSONB, attempts INTEGER NOT NULL DEFAULT 0, last_attempt_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'pending', response_code INTEGER, response_body TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS public.open_banking_consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), client_id UUID NOT NULL, bank TEXT NOT NULL,
  consent_ref TEXT NOT NULL, scope TEXT NOT NULL DEFAULT 'accounts,balances',
  expires_at TIMESTAMPTZ, status TEXT NOT NULL DEFAULT 'authorised',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS public.open_banking_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), consent_id UUID NOT NULL, account_ref TEXT NOT NULL,
  account_name TEXT, balance NUMERIC NOT NULL DEFAULT 0, currency TEXT NOT NULL DEFAULT 'GBP',
  last_synced TIMESTAMPTZ, created_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS public.lisa_bonus_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), client_id UUID NOT NULL, account_id UUID NOT NULL,
  tax_year TEXT NOT NULL, contributions NUMERIC NOT NULL DEFAULT 0,
  bonus_amount NUMERIC NOT NULL DEFAULT 0, claim_status TEXT NOT NULL DEFAULT 'pending',
  claimed_at TIMESTAMPTZ, created_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS public.jisa_holders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), account_id UUID NOT NULL,
  registered_contact_client_id UUID NOT NULL, child_first_name TEXT NOT NULL,
  child_last_name TEXT NOT NULL, child_dob DATE NOT NULL, matures_on DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS public.sso_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), firm_id UUID,
  provider TEXT NOT NULL DEFAULT 'saml', metadata_xml TEXT, domain TEXT,
  status TEXT NOT NULL DEFAULT 'active', created_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS public.firm_branding (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), firm_id UUID NOT NULL,
  logo_url TEXT, primary_color TEXT, accent_color TEXT, custom_domain TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS public.dr_drills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), drill_date DATE NOT NULL,
  scenario TEXT NOT NULL, rto_minutes INTEGER NOT NULL DEFAULT 60,
  rpo_minutes INTEGER NOT NULL DEFAULT 15, actual_rto INTEGER, actual_rpo INTEGER,
  status TEXT NOT NULL DEFAULT 'planned', notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now());

DO $$
DECLARE t TEXT;
BEGIN
  FOR t IN SELECT unnest(ARRAY[
    'hmrc_submissions','ras_reclaim_lines','event_report_lines','hmrc_test_runs',
    'lsa_lsdba_ledger','paye_runs','paye_payments','origo_messages','cass_settings',
    'ssas_schemes','ssas_members','ssas_loanbacks',
    'commercial_properties','property_leases','property_rent_ledger','property_insurance',
    'scheme_pensions','capped_drawdown_segments','pension_sharing_orders','in_specie_transfers',
    'bulk_orders','bulk_order_lines','webhook_subscriptions','webhook_deliveries',
    'open_banking_consents','open_banking_accounts','lisa_bonus_claims','jisa_holders',
    'sso_configurations','firm_branding','dr_drills'])
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    BEGIN EXECUTE format('CREATE POLICY "all select" ON public.%I FOR SELECT USING (true)', t); EXCEPTION WHEN duplicate_object THEN NULL; END;
    BEGIN EXECUTE format('CREATE POLICY "all insert" ON public.%I FOR INSERT WITH CHECK (true)', t); EXCEPTION WHEN duplicate_object THEN NULL; END;
    BEGIN EXECUTE format('CREATE POLICY "all update" ON public.%I FOR UPDATE USING (true) WITH CHECK (true)', t); EXCEPTION WHEN duplicate_object THEN NULL; END;
    BEGIN EXECUTE format('CREATE POLICY "all delete" ON public.%I FOR DELETE USING (true)', t); EXCEPTION WHEN duplicate_object THEN NULL; END;
  END LOOP;
END $$;
