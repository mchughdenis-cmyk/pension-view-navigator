
CREATE TABLE public.payroll_runs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employer_client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  scheme_name TEXT,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  pay_date DATE NOT NULL,
  frequency TEXT NOT NULL DEFAULT 'monthly',
  source_file_path TEXT,
  source_file_name TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  totals JSONB NOT NULL DEFAULT '{}'::jsonb,
  column_mapping JSONB NOT NULL DEFAULT '{}'::jsonb,
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.payroll_runs TO authenticated;
GRANT ALL ON public.payroll_runs TO service_role;
ALTER TABLE public.payroll_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage payroll runs"
  ON public.payroll_runs FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_payroll_runs_updated_at
  BEFORE UPDATE ON public.payroll_runs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.payroll_run_lines (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  payroll_run_id UUID NOT NULL REFERENCES public.payroll_runs(id) ON DELETE CASCADE,
  member_client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  raw_row JSONB NOT NULL DEFAULT '{}'::jsonb,
  ni_number TEXT,
  full_name TEXT,
  pensionable_pay_pence BIGINT NOT NULL DEFAULT 0,
  employee_contrib_pence BIGINT NOT NULL DEFAULT 0,
  employer_contrib_pence BIGINT NOT NULL DEFAULT 0,
  avc_pence BIGINT NOT NULL DEFAULT 0,
  tax_relief_pence BIGINT NOT NULL DEFAULT 0,
  salary_sacrifice BOOLEAN NOT NULL DEFAULT false,
  tax_relief_method TEXT NOT NULL DEFAULT 'ras',
  match_status TEXT NOT NULL DEFAULT 'unmatched',
  exception_reason TEXT,
  contribution_id UUID REFERENCES public.contributions(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.payroll_run_lines TO authenticated;
GRANT ALL ON public.payroll_run_lines TO service_role;
ALTER TABLE public.payroll_run_lines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage payroll run lines"
  ON public.payroll_run_lines FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_payroll_run_lines_run ON public.payroll_run_lines(payroll_run_id);

ALTER TABLE public.contributions
  ADD COLUMN IF NOT EXISTS payroll_run_id UUID REFERENCES public.payroll_runs(id) ON DELETE SET NULL;
