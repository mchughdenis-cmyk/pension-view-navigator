
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'adviser', 'client', 'demo');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  client_id UUID,
  is_demo BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Profiles viewable by all authenticated" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Profiles viewable by all authenticated" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins manage roles" ON public.user_roles;
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Admins can view all roles" ON public.user_roles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage roles" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)))
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'client') ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.prevent_activity_log_modification()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN RAISE EXCEPTION 'activity_log entries are immutable'; END;
$$;
DROP TRIGGER IF EXISTS prevent_activity_log_update ON public.activity_log;
DROP TRIGGER IF EXISTS prevent_activity_log_delete ON public.activity_log;
CREATE TRIGGER prevent_activity_log_update BEFORE UPDATE ON public.activity_log FOR EACH ROW EXECUTE FUNCTION public.prevent_activity_log_modification();
CREATE TRIGGER prevent_activity_log_delete BEFORE DELETE ON public.activity_log FOR EACH ROW EXECUTE FUNCTION public.prevent_activity_log_modification();
DROP POLICY IF EXISTS "Allow all delete" ON public.activity_log;
DROP POLICY IF EXISTS "Allow all update" ON public.activity_log;

CREATE OR REPLACE FUNCTION public.update_running_balance()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
DECLARE prev_balance NUMERIC;
BEGIN
  SELECT COALESCE(running_balance, 0) INTO prev_balance
  FROM public.transactions
  WHERE account_id = NEW.account_id AND id <> NEW.id
  ORDER BY effective_date DESC NULLS LAST, created_at DESC LIMIT 1;
  NEW.running_balance := COALESCE(prev_balance, 0) + COALESCE(NEW.amount, 0);
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS set_running_balance ON public.transactions;
CREATE TRIGGER set_running_balance BEFORE INSERT ON public.transactions FOR EACH ROW EXECUTE FUNCTION public.update_running_balance();

ALTER TABLE public.contributions DROP CONSTRAINT IF EXISTS contributions_gross_non_negative;
ALTER TABLE public.contributions DROP CONSTRAINT IF EXISTS contributions_relief_non_negative;
ALTER TABLE public.contributions ADD CONSTRAINT contributions_gross_non_negative CHECK (gross_amount >= 0);
ALTER TABLE public.contributions ADD CONSTRAINT contributions_relief_non_negative CHECK (tax_relief >= 0);

INSERT INTO storage.buckets (id, name, public) VALUES ('client-documents', 'client-documents', false) ON CONFLICT (id) DO NOTHING;
DROP POLICY IF EXISTS "Documents readable by all" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can upload documents" ON storage.objects;
DROP POLICY IF EXISTS "Anonymous can upload to demo folder" ON storage.objects;
DROP POLICY IF EXISTS "Owners can delete their documents" ON storage.objects;
CREATE POLICY "Documents readable by all" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'client-documents');
CREATE POLICY "Authenticated can upload documents" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'client-documents');
CREATE POLICY "Anonymous can upload to demo folder" ON storage.objects FOR INSERT TO anon WITH CHECK (bucket_id = 'client-documents' AND (storage.foldername(name))[1] = 'demo');
CREATE POLICY "Owners can delete their documents" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'client-documents' AND (auth.uid()::text = (storage.foldername(name))[1] OR public.has_role(auth.uid(), 'admin')));

CREATE TABLE IF NOT EXISTS public.client_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL,
  uploaded_by UUID,
  document_type TEXT NOT NULL DEFAULT 'general',
  filename TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  mime_type TEXT,
  size_bytes INTEGER,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.client_documents ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all select" ON public.client_documents;
DROP POLICY IF EXISTS "Allow all insert" ON public.client_documents;
DROP POLICY IF EXISTS "Allow all update" ON public.client_documents;
DROP POLICY IF EXISTS "Allow all delete" ON public.client_documents;
CREATE POLICY "Allow all select" ON public.client_documents FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow all insert" ON public.client_documents FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Allow all update" ON public.client_documents FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all delete" ON public.client_documents FOR DELETE TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS public.integration_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  provider TEXT NOT NULL,
  endpoint TEXT NOT NULL,
  request_payload JSONB,
  response_payload JSONB,
  status TEXT NOT NULL DEFAULT 'success',
  error_message TEXT,
  duration_ms INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.integration_log ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all select" ON public.integration_log;
DROP POLICY IF EXISTS "Allow all insert" ON public.integration_log;
CREATE POLICY "Allow all select" ON public.integration_log FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow all insert" ON public.integration_log FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.kyc_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL,
  provider TEXT NOT NULL DEFAULT 'onfido',
  reference TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  identity_check BOOLEAN,
  address_check BOOLEAN,
  pep_sanctions_check BOOLEAN,
  raw_result JSONB,
  checked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.kyc_records ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all select" ON public.kyc_records;
DROP POLICY IF EXISTS "Allow all insert" ON public.kyc_records;
DROP POLICY IF EXISTS "Allow all update" ON public.kyc_records;
DROP POLICY IF EXISTS "Allow all delete" ON public.kyc_records;
CREATE POLICY "Allow all select" ON public.kyc_records FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow all insert" ON public.kyc_records FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Allow all update" ON public.kyc_records FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all delete" ON public.kyc_records FOR DELETE TO anon, authenticated USING (true);
DROP TRIGGER IF EXISTS update_kyc_updated_at ON public.kyc_records;
CREATE TRIGGER update_kyc_updated_at BEFORE UPDATE ON public.kyc_records FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.market_prices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  isin TEXT,
  sedol TEXT,
  symbol TEXT NOT NULL,
  fund_name TEXT,
  price NUMERIC NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'GBP',
  price_date DATE NOT NULL DEFAULT CURRENT_DATE,
  source TEXT NOT NULL DEFAULT 'fe_fundinfo_stub',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.market_prices ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all select" ON public.market_prices;
DROP POLICY IF EXISTS "Allow all insert" ON public.market_prices;
CREATE POLICY "Allow all select" ON public.market_prices FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow all insert" ON public.market_prices FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE INDEX IF NOT EXISTS idx_market_prices_symbol_date ON public.market_prices(symbol, price_date DESC);
CREATE INDEX IF NOT EXISTS idx_client_documents_client ON public.client_documents(client_id);
CREATE INDEX IF NOT EXISTS idx_kyc_records_client ON public.kyc_records(client_id);
CREATE INDEX IF NOT EXISTS idx_integration_log_provider_date ON public.integration_log(provider, created_at DESC);
