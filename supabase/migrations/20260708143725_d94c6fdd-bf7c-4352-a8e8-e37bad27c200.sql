
-- ============ SCHEMES & EMPLOYERS ============
CREATE TABLE public.schemes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  scheme_type TEXT NOT NULL DEFAULT 'SIPP',
  pstr TEXT,
  psr_number TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  established_date DATE,
  trust_deed_ref TEXT,
  benefit_basis TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.schemes TO authenticated;
GRANT ALL ON public.schemes TO service_role;
ALTER TABLE public.schemes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff manage schemes" ON public.schemes FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'adviser'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'adviser'));
CREATE TRIGGER trg_schemes_updated BEFORE UPDATE ON public.schemes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.employers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  paye_reference TEXT,
  accounts_office_ref TEXT,
  staging_date DATE,
  duties_date DATE,
  tpr_contact_name TEXT,
  tpr_contact_email TEXT,
  employee_contribution_pct NUMERIC(5,2),
  employer_contribution_pct NUMERIC(5,2),
  salary_sacrifice BOOLEAN NOT NULL DEFAULT false,
  pay_reference_period TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.employers TO authenticated;
GRANT ALL ON public.employers TO service_role;
ALTER TABLE public.employers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff manage employers" ON public.employers FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'adviser'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'adviser'));
CREATE TRIGGER trg_employers_updated BEFORE UPDATE ON public.employers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.scheme_employers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scheme_id UUID NOT NULL REFERENCES public.schemes(id) ON DELETE CASCADE,
  employer_id UUID NOT NULL REFERENCES public.employers(id) ON DELETE CASCADE,
  joined_date DATE,
  left_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(scheme_id, employer_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.scheme_employers TO authenticated;
GRANT ALL ON public.scheme_employers TO service_role;
ALTER TABLE public.scheme_employers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff manage scheme_employers" ON public.scheme_employers FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'adviser'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'adviser'));

-- ============ CETV / RETIREMENT QUOTES ============
CREATE TABLE public.cetv_quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  scheme_id UUID REFERENCES public.schemes(id) ON DELETE SET NULL,
  request_date DATE NOT NULL DEFAULT CURRENT_DATE,
  quote_date DATE,
  guarantee_end_date DATE,
  transfer_value NUMERIC(14,2),
  safeguarded_benefits BOOLEAN NOT NULL DEFAULT false,
  advice_required BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'draft',
  requested_by TEXT,
  approved_by TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cetv_quotes TO authenticated;
GRANT ALL ON public.cetv_quotes TO service_role;
ALTER TABLE public.cetv_quotes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff manage cetv_quotes" ON public.cetv_quotes FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'adviser'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'adviser'));
CREATE TRIGGER trg_cetv_updated BEFORE UPDATE ON public.cetv_quotes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.retirement_quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  scheme_id UUID REFERENCES public.schemes(id) ON DELETE SET NULL,
  quote_date DATE NOT NULL DEFAULT CURRENT_DATE,
  target_retirement_date DATE,
  fund_value NUMERIC(14,2),
  pcls_amount NUMERIC(14,2),
  annuity_gross NUMERIC(14,2),
  drawdown_income NUMERIC(14,2),
  ufpls_amount NUMERIC(14,2),
  options JSONB DEFAULT '{}'::jsonb,
  wake_up_stage TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.retirement_quotes TO authenticated;
GRANT ALL ON public.retirement_quotes TO service_role;
ALTER TABLE public.retirement_quotes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff manage retirement_quotes" ON public.retirement_quotes FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'adviser'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'adviser'));
CREATE TRIGGER trg_retq_updated BEFORE UPDATE ON public.retirement_quotes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.wake_up_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  age_trigger INTEGER NOT NULL,
  due_date DATE NOT NULL,
  issued_date DATE,
  channel TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  pension_wise_offered BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.wake_up_events TO authenticated;
GRANT ALL ON public.wake_up_events TO service_role;
ALTER TABLE public.wake_up_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff manage wake_up_events" ON public.wake_up_events FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'adviser'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'adviser'));
CREATE TRIGGER trg_wake_updated BEFORE UPDATE ON public.wake_up_events
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ TPR BREACH REGISTER ============
CREATE TABLE public.tpr_breaches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scheme_id UUID REFERENCES public.schemes(id) ON DELETE SET NULL,
  identified_date DATE NOT NULL DEFAULT CURRENT_DATE,
  identified_by TEXT,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  cause TEXT,
  effect TEXT,
  reaction TEXT,
  materiality TEXT NOT NULL DEFAULT 'not_material',
  reportable_to_tpr BOOLEAN NOT NULL DEFAULT false,
  reported_date DATE,
  reference TEXT,
  status TEXT NOT NULL DEFAULT 'open',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tpr_breaches TO authenticated;
GRANT ALL ON public.tpr_breaches TO service_role;
ALTER TABLE public.tpr_breaches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff manage tpr_breaches" ON public.tpr_breaches FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'adviser'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'adviser'));
CREATE TRIGGER trg_tpr_updated BEFORE UPDATE ON public.tpr_breaches
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ TRUSTEE MEETINGS ============
CREATE TABLE public.trustee_meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scheme_id UUID REFERENCES public.schemes(id) ON DELETE SET NULL,
  meeting_date DATE NOT NULL,
  meeting_type TEXT NOT NULL DEFAULT 'quarterly',
  location TEXT,
  chair TEXT,
  attendees TEXT[],
  agenda JSONB DEFAULT '[]'::jsonb,
  minutes TEXT,
  status TEXT NOT NULL DEFAULT 'scheduled',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.trustee_meetings TO authenticated;
GRANT ALL ON public.trustee_meetings TO service_role;
ALTER TABLE public.trustee_meetings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff manage trustee_meetings" ON public.trustee_meetings FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'adviser'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'adviser'));
CREATE TRIGGER trg_tm_updated BEFORE UPDATE ON public.trustee_meetings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.trustee_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID REFERENCES public.trustee_meetings(id) ON DELETE CASCADE,
  scheme_id UUID REFERENCES public.schemes(id) ON DELETE SET NULL,
  description TEXT NOT NULL,
  owner TEXT,
  due_date DATE,
  status TEXT NOT NULL DEFAULT 'open',
  completed_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.trustee_actions TO authenticated;
GRANT ALL ON public.trustee_actions TO service_role;
ALTER TABLE public.trustee_actions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff manage trustee_actions" ON public.trustee_actions FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'adviser'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'adviser'));
CREATE TRIGGER trg_ta_updated BEFORE UPDATE ON public.trustee_actions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ DATA QUALITY ============
CREATE TABLE public.data_quality_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scheme_id UUID REFERENCES public.schemes(id) ON DELETE SET NULL,
  as_at_date DATE NOT NULL DEFAULT CURRENT_DATE,
  common_score NUMERIC(5,2),
  scheme_specific_score NUMERIC(5,2),
  members_total INTEGER,
  members_with_gaps INTEGER,
  remediation_plan TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.data_quality_scores TO authenticated;
GRANT ALL ON public.data_quality_scores TO service_role;
ALTER TABLE public.data_quality_scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff manage data_quality_scores" ON public.data_quality_scores FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'adviser'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'adviser'));
CREATE TRIGGER trg_dq_updated BEFORE UPDATE ON public.data_quality_scores
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ INVOICING ============
CREATE TABLE public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number TEXT NOT NULL UNIQUE,
  scheme_id UUID REFERENCES public.schemes(id) ON DELETE SET NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE,
  subtotal NUMERIC(14,2) NOT NULL DEFAULT 0,
  vat NUMERIC(14,2) NOT NULL DEFAULT 0,
  total NUMERIC(14,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft',
  exported_to TEXT,
  paid_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.invoices TO authenticated;
GRANT ALL ON public.invoices TO service_role;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff manage invoices" ON public.invoices FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'adviser'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'adviser'));
CREATE TRIGGER trg_inv_updated BEFORE UPDATE ON public.invoices
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.invoice_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity NUMERIC(10,2) NOT NULL DEFAULT 1,
  unit_amount NUMERIC(14,2) NOT NULL DEFAULT 0,
  vat_rate NUMERIC(5,2) NOT NULL DEFAULT 20,
  line_total NUMERIC(14,2) NOT NULL DEFAULT 0,
  fee_schedule_id UUID REFERENCES public.fee_schedules(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.invoice_lines TO authenticated;
GRANT ALL ON public.invoice_lines TO service_role;
ALTER TABLE public.invoice_lines ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff manage invoice_lines" ON public.invoice_lines FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'adviser'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'adviser'));
