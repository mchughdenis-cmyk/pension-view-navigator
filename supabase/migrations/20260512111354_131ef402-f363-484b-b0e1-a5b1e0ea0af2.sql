CREATE TABLE IF NOT EXISTS public.sla_cases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  firm_id UUID,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  case_type TEXT NOT NULL,
  reference TEXT,
  description TEXT,
  priority TEXT NOT NULL DEFAULT 'medium',
  status TEXT NOT NULL DEFAULT 'open',
  owner TEXT,
  sla_hours INTEGER NOT NULL DEFAULT 120,
  opened_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  due_at TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.sla_cases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all select" ON public.sla_cases FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow all insert" ON public.sla_cases FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Allow all update" ON public.sla_cases FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all delete" ON public.sla_cases FOR DELETE TO anon, authenticated USING (true);

CREATE TRIGGER update_sla_cases_updated_at BEFORE UPDATE ON public.sla_cases
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_sla_cases_status ON public.sla_cases(status);
CREATE INDEX IF NOT EXISTS idx_sla_cases_firm ON public.sla_cases(firm_id);
CREATE INDEX IF NOT EXISTS idx_sla_cases_due ON public.sla_cases(due_at);