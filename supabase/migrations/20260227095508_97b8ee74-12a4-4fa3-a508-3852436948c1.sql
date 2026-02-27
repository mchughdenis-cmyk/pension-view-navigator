
-- Crystallisation segments table
CREATE TABLE public.crystallisation_segments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id uuid NOT NULL REFERENCES public.clients(id),
  account_id uuid NOT NULL REFERENCES public.client_accounts(id),
  bce_event_id uuid NOT NULL REFERENCES public.bce_events(id),
  segment_type text NOT NULL DEFAULT 'designated',
  crystallised_amount numeric NOT NULL DEFAULT 0,
  pcls_amount numeric NOT NULL DEFAULT 0,
  residual_fund numeric NOT NULL DEFAULT 0,
  drawdown_type text NOT NULL DEFAULT 'FAD',
  status text NOT NULL DEFAULT 'active',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.crystallisation_segments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to crystallisation_segments" ON public.crystallisation_segments FOR ALL USING (true) WITH CHECK (true);

-- updated_at trigger
CREATE TRIGGER update_crystallisation_segments_updated_at
  BEFORE UPDATE ON public.crystallisation_segments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
