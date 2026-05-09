CREATE TABLE public.marketing_leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  firm TEXT NOT NULL,
  message TEXT,
  source TEXT NOT NULL DEFAULT 'site/contact',
  ip_hash TEXT,
  user_agent TEXT,
  status TEXT NOT NULL DEFAULT 'new',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.marketing_leads ENABLE ROW LEVEL SECURITY;

-- Anonymous visitors can submit a lead (insert only).
CREATE POLICY "Anyone can submit a lead"
ON public.marketing_leads
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Only admins can read or modify leads.
CREATE POLICY "Admins can view leads"
ON public.marketing_leads
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update leads"
ON public.marketing_leads
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete leads"
ON public.marketing_leads
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_marketing_leads_created_at ON public.marketing_leads (created_at DESC);
CREATE INDEX idx_marketing_leads_email ON public.marketing_leads (email);

CREATE TRIGGER trg_marketing_leads_updated_at
BEFORE UPDATE ON public.marketing_leads
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();