
-- Timestamp update function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Clients table
CREATE TABLE public.clients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT DEFAULT 'Mr',
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  date_of_birth DATE,
  email TEXT,
  phone TEXT,
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  postcode TEXT,
  ni_number TEXT,
  marital_status TEXT DEFAULT 'Single',
  employment_status TEXT DEFAULT 'Employed',
  nationality TEXT DEFAULT 'British',
  tax_residency TEXT DEFAULT 'UK',
  adviser TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  risk_profile TEXT DEFAULT 'Moderate',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to clients" ON public.clients FOR ALL USING (true) WITH CHECK (true);

CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON public.clients
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Client accounts (SIPP, ISA, GIA)
CREATE TABLE public.client_accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  account_type TEXT NOT NULL,
  account_number TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  opened_date DATE DEFAULT CURRENT_DATE,
  cash_balance NUMERIC(15,2) DEFAULT 0,
  total_value NUMERIC(15,2) DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.client_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to client_accounts" ON public.client_accounts FOR ALL USING (true) WITH CHECK (true);

CREATE TRIGGER update_client_accounts_updated_at BEFORE UPDATE ON public.client_accounts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Transactions
CREATE TABLE public.transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  account_id UUID NOT NULL REFERENCES public.client_accounts(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  transaction_type TEXT NOT NULL,
  description TEXT,
  amount NUMERIC(15,2) NOT NULL,
  running_balance NUMERIC(15,2) DEFAULT 0,
  reference TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  effective_date DATE DEFAULT CURRENT_DATE,
  tax_year TEXT,
  tax_relief_amount NUMERIC(15,2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to transactions" ON public.transactions FOR ALL USING (true) WITH CHECK (true);

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Investments / Holdings
CREATE TABLE public.investments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  account_id UUID NOT NULL REFERENCES public.client_accounts(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  fund_name TEXT NOT NULL,
  isin TEXT,
  sedol TEXT,
  units NUMERIC(15,6) DEFAULT 0,
  unit_price NUMERIC(15,4) DEFAULT 0,
  current_value NUMERIC(15,2) DEFAULT 0,
  cost_basis NUMERIC(15,2) DEFAULT 0,
  allocation_pct NUMERIC(5,2) DEFAULT 0,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.investments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to investments" ON public.investments FOR ALL USING (true) WITH CHECK (true);

CREATE TRIGGER update_investments_updated_at BEFORE UPDATE ON public.investments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Beneficiaries
CREATE TABLE public.beneficiaries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  relationship TEXT NOT NULL,
  date_of_birth DATE,
  allocation_pct NUMERIC(5,2) NOT NULL DEFAULT 0,
  contact_details TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.beneficiaries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to beneficiaries" ON public.beneficiaries FOR ALL USING (true) WITH CHECK (true);

-- BCE Events
CREATE TABLE public.bce_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  bce_type TEXT NOT NULL,
  event_date DATE NOT NULL DEFAULT CURRENT_DATE,
  crystallised_amount NUMERIC(15,2) NOT NULL DEFAULT 0,
  lta_percentage NUMERIC(8,4) DEFAULT 0,
  tax_free_lump_sum NUMERIC(15,2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.bce_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to bce_events" ON public.bce_events FOR ALL USING (true) WITH CHECK (true);

-- Bank files
CREATE TABLE public.bank_files (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  filename TEXT NOT NULL,
  upload_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  total_entries INT DEFAULT 0,
  total_amount NUMERIC(15,2) DEFAULT 0,
  matched_count INT DEFAULT 0,
  unmatched_count INT DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'uploaded',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.bank_files ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to bank_files" ON public.bank_files FOR ALL USING (true) WITH CHECK (true);

-- Bank file entries
CREATE TABLE public.bank_file_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  bank_file_id UUID NOT NULL REFERENCES public.bank_files(id) ON DELETE CASCADE,
  entry_date DATE NOT NULL,
  description TEXT,
  amount NUMERIC(15,2) NOT NULL,
  reference TEXT,
  matched_client_id UUID REFERENCES public.clients(id),
  matched_account_id UUID REFERENCES public.client_accounts(id),
  transaction_type TEXT,
  status TEXT NOT NULL DEFAULT 'unmatched',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.bank_file_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to bank_file_entries" ON public.bank_file_entries FOR ALL USING (true) WITH CHECK (true);

-- Activity / Audit log
CREATE TABLE public.activity_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  action TEXT NOT NULL,
  description TEXT NOT NULL,
  old_values JSONB,
  new_values JSONB,
  performed_by TEXT DEFAULT 'System Admin',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to activity_log" ON public.activity_log FOR ALL USING (true) WITH CHECK (true);

-- Indexes
CREATE INDEX idx_transactions_client_id ON public.transactions(client_id);
CREATE INDEX idx_transactions_account_id ON public.transactions(account_id);
CREATE INDEX idx_transactions_type ON public.transactions(transaction_type);
CREATE INDEX idx_investments_account_id ON public.investments(account_id);
CREATE INDEX idx_bank_file_entries_file_id ON public.bank_file_entries(bank_file_id);
CREATE INDEX idx_bank_file_entries_status ON public.bank_file_entries(status);
CREATE INDEX idx_activity_log_entity ON public.activity_log(entity_type, entity_id);
CREATE INDEX idx_clients_status ON public.clients(status);
