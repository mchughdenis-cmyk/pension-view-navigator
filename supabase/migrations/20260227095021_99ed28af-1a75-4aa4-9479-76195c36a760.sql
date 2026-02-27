
-- Workflow definitions table
CREATE TABLE IF NOT EXISTS public.workflow_definitions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  trigger text NOT NULL,
  action text NOT NULL,
  frequency text NOT NULL DEFAULT 'Per event',
  days_before_due integer NOT NULL DEFAULT 0,
  assign_to text NOT NULL DEFAULT 'System',
  active boolean NOT NULL DEFAULT true,
  last_triggered timestamptz,
  times_triggered integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.workflow_definitions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to workflow_definitions" ON public.workflow_definitions FOR ALL USING (true) WITH CHECK (true);
CREATE TRIGGER update_workflow_definitions_updated_at BEFORE UPDATE ON public.workflow_definitions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Consent records table for GDPR
CREATE TABLE IF NOT EXISTS public.consent_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  consent_type text NOT NULL,
  granted boolean NOT NULL DEFAULT false,
  granted_at timestamptz,
  withdrawn_at timestamptz,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.consent_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to consent_records" ON public.consent_records FOR ALL USING (true) WITH CHECK (true);
CREATE TRIGGER update_consent_records_updated_at BEFORE UPDATE ON public.consent_records FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
