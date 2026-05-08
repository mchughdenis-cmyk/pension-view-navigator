
CREATE TABLE IF NOT EXISTS public.kyc_cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL,
  provider TEXT NOT NULL DEFAULT 'Onfido (mock)',
  provider_ref TEXT,
  status TEXT NOT NULL DEFAULT 'not_started',
  risk_level TEXT NOT NULL DEFAULT 'low',
  risk_score NUMERIC NOT NULL DEFAULT 0,
  reviewer TEXT,
  decision_reason TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.kyc_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL,
  doc_type TEXT NOT NULL,
  file_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'uploaded',
  extracted JSONB,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.kyc_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL,
  check_type TEXT NOT NULL,
  provider TEXT NOT NULL,
  decision TEXT NOT NULL,
  score NUMERIC,
  details JSONB,
  ran_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.bank_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL,
  provider TEXT NOT NULL DEFAULT 'TrueLayer (mock)',
  bank_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  consent_expires_at TIMESTAMPTZ,
  accounts JSONB,
  last_synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.dd_mandates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL,
  provider TEXT NOT NULL DEFAULT 'GoCardless (mock)',
  scheme TEXT NOT NULL DEFAULT 'bacs',
  reference TEXT NOT NULL,
  account_holder TEXT,
  sort_code TEXT,
  account_number TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  signed_at TIMESTAMPTZ,
  next_collection_date DATE,
  amount NUMERIC NOT NULL DEFAULT 0,
  frequency TEXT NOT NULL DEFAULT 'monthly',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.payment_initiations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL,
  bank_connection_id UUID,
  provider TEXT NOT NULL DEFAULT 'TrueLayer Pay (mock)',
  amount NUMERIC NOT NULL,
  reference TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'initiated',
  initiated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  settled_at TIMESTAMPTZ
);

ALTER TABLE public.kyc_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kyc_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kyc_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bank_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dd_mandates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_initiations ENABLE ROW LEVEL SECURITY;

DO $$ DECLARE t TEXT; p TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY['kyc_cases','kyc_documents','kyc_checks','bank_connections','dd_mandates','payment_initiations'] LOOP
    FOREACH p IN ARRAY ARRAY['all select','all insert','all update','all delete'] LOOP
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', p, t);
    END LOOP;
    EXECUTE format('CREATE POLICY "all select" ON public.%I FOR SELECT USING (true)', t);
    EXECUTE format('CREATE POLICY "all insert" ON public.%I FOR INSERT WITH CHECK (true)', t);
    EXECUTE format('CREATE POLICY "all update" ON public.%I FOR UPDATE USING (true) WITH CHECK (true)', t);
    EXECUTE format('CREATE POLICY "all delete" ON public.%I FOR DELETE USING (true)', t);
  END LOOP;
END $$;

CREATE INDEX IF NOT EXISTS idx_kyc_cases_client ON public.kyc_cases(client_id);
CREATE INDEX IF NOT EXISTS idx_kyc_docs_case ON public.kyc_documents(case_id);
CREATE INDEX IF NOT EXISTS idx_kyc_checks_case ON public.kyc_checks(case_id);
CREATE INDEX IF NOT EXISTS idx_bank_connections_client ON public.bank_connections(client_id);
CREATE INDEX IF NOT EXISTS idx_dd_mandates_client ON public.dd_mandates(client_id);
CREATE INDEX IF NOT EXISTS idx_payment_init_client ON public.payment_initiations(client_id);
