
CREATE TABLE public.saved_illustrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  adviser_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  member_email TEXT NOT NULL,
  member_name TEXT,
  scenario_name TEXT NOT NULL DEFAULT 'Pension Illustration',
  inputs JSONB NOT NULL,
  summary JSONB NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.saved_illustrations TO authenticated;
GRANT ALL ON public.saved_illustrations TO service_role;

ALTER TABLE public.saved_illustrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Advisers manage their own saved illustrations"
  ON public.saved_illustrations
  FOR ALL
  TO authenticated
  USING (auth.uid() = adviser_id OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (auth.uid() = adviser_id OR public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_saved_illustrations_adviser ON public.saved_illustrations(adviser_id, created_at DESC);
CREATE INDEX idx_saved_illustrations_email ON public.saved_illustrations(member_email);

CREATE TRIGGER trg_saved_illustrations_updated
  BEFORE UPDATE ON public.saved_illustrations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
