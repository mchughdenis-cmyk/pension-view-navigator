
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS firm_id uuid REFERENCES public.firms(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_clients_firm ON public.clients(firm_id);

ALTER TABLE public.cass_reconciliations
  ADD COLUMN IF NOT EXISTS firm_id uuid REFERENCES public.firms(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS bank_balance numeric,
  ADD COLUMN IF NOT EXISTS custody_balance numeric,
  ADD COLUMN IF NOT EXISTS ledger_balance numeric,
  ADD COLUMN IF NOT EXISTS signed_off_by text,
  ADD COLUMN IF NOT EXISTS notes_url text;
CREATE INDEX IF NOT EXISTS idx_cass_recon_firm ON public.cass_reconciliations(firm_id);

ALTER TABLE public.kyc_cases
  ADD COLUMN IF NOT EXISTS firm_id uuid REFERENCES public.firms(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS document_status text,
  ADD COLUMN IF NOT EXISTS selfie_status text,
  ADD COLUMN IF NOT EXISTS pep_status text,
  ADD COLUMN IF NOT EXISTS sanctions_status text,
  ADD COLUMN IF NOT EXISTS address_status text,
  ADD COLUMN IF NOT EXISTS decision text;
CREATE INDEX IF NOT EXISTS idx_kyc_cases_firm ON public.kyc_cases(firm_id);

ALTER TABLE public.suitability_reports
  ADD COLUMN IF NOT EXISTS firm_id uuid REFERENCES public.firms(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS atr_score integer,
  ADD COLUMN IF NOT EXISTS capacity_for_loss text,
  ADD COLUMN IF NOT EXISTS objectives text,
  ADD COLUMN IF NOT EXISTS time_horizon_years integer,
  ADD COLUMN IF NOT EXISTS recommended_portfolio_id uuid REFERENCES public.model_portfolios(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS responses jsonb,
  ADD COLUMN IF NOT EXISTS report_pdf_url text;
CREATE INDEX IF NOT EXISTS idx_suitability_firm ON public.suitability_reports(firm_id);
