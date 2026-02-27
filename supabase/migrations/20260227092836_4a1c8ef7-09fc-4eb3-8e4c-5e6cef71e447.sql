
-- Fee Schedules table
CREATE TABLE public.fee_schedules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'flat',
  rate NUMERIC NOT NULL DEFAULT 0,
  frequency TEXT NOT NULL DEFAULT 'annual',
  wrapper TEXT NOT NULL DEFAULT 'All',
  min_fee NUMERIC,
  max_fee NUMERIC,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.fee_schedules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to fee_schedules" ON public.fee_schedules FOR ALL USING (true) WITH CHECK (true);

CREATE TRIGGER update_fee_schedules_updated_at
  BEFORE UPDATE ON public.fee_schedules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Trade Orders table
CREATE TABLE public.trade_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  account_id UUID REFERENCES public.client_accounts(id) ON DELETE SET NULL,
  client_name TEXT,
  account_type TEXT,
  side TEXT NOT NULL DEFAULT 'buy',
  instrument TEXT NOT NULL,
  quantity NUMERIC NOT NULL DEFAULT 0,
  price NUMERIC NOT NULL DEFAULT 0,
  value NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  settlement_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.trade_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to trade_orders" ON public.trade_orders FOR ALL USING (true) WITH CHECK (true);

CREATE TRIGGER update_trade_orders_updated_at
  BEFORE UPDATE ON public.trade_orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Adviser Fees table
CREATE TABLE public.adviser_fees (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
  adviser_name TEXT NOT NULL,
  fee_type TEXT NOT NULL DEFAULT 'ongoing',
  rate NUMERIC NOT NULL DEFAULT 0,
  frequency TEXT NOT NULL DEFAULT 'quarterly',
  wrapper TEXT NOT NULL DEFAULT 'All',
  status TEXT NOT NULL DEFAULT 'active',
  effective_from DATE DEFAULT CURRENT_DATE,
  effective_to DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.adviser_fees ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to adviser_fees" ON public.adviser_fees FOR ALL USING (true) WITH CHECK (true);

CREATE TRIGGER update_adviser_fees_updated_at
  BEFORE UPDATE ON public.adviser_fees
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
