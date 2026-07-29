
-- Cash forecast
CREATE TABLE public.cash_forecast_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID,
  forecast_date DATE NOT NULL,
  direction TEXT NOT NULL CHECK (direction IN ('inflow','outflow')),
  category TEXT NOT NULL,
  amount NUMERIC(18,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'GBP',
  reference TEXT,
  confidence TEXT DEFAULT 'expected' CHECK (confidence IN ('confirmed','expected','tentative')),
  notes TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cash_forecast_entries TO authenticated;
GRANT ALL ON public.cash_forecast_entries TO service_role;
ALTER TABLE public.cash_forecast_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cash_forecast admin/adviser read" ON public.cash_forecast_entries FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'adviser'));
CREATE POLICY "cash_forecast admin write" ON public.cash_forecast_entries FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER cash_forecast_updated_at BEFORE UPDATE ON public.cash_forecast_entries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Adviser fee schedules
CREATE TABLE public.adviser_fee_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID,
  adviser_id UUID,
  client_id UUID,
  fee_type TEXT NOT NULL CHECK (fee_type IN ('initial','ongoing','ad_hoc')),
  basis TEXT NOT NULL CHECK (basis IN ('percentage','fixed')),
  rate_or_amount NUMERIC(18,4) NOT NULL,
  frequency TEXT CHECK (frequency IN ('monthly','quarterly','annual','one_off')),
  next_due_date DATE,
  last_paid_date DATE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','paused','ended')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.adviser_fee_schedules TO authenticated;
GRANT ALL ON public.adviser_fee_schedules TO service_role;
ALTER TABLE public.adviser_fee_schedules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "adviser_fees staff read" ON public.adviser_fee_schedules FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'adviser'));
CREATE POLICY "adviser_fees admin write" ON public.adviser_fee_schedules FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER adviser_fee_schedules_updated_at BEFORE UPDATE ON public.adviser_fee_schedules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Reg reporting calendar
CREATE TABLE public.reg_reporting_calendar (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID,
  regulator TEXT NOT NULL CHECK (regulator IN ('TPR','HMRC','FCA','ICO','Other')),
  return_name TEXT NOT NULL,
  period_start DATE,
  period_end DATE,
  due_date DATE NOT NULL,
  submitted_date DATE,
  submitted_by UUID,
  status TEXT NOT NULL DEFAULT 'due' CHECK (status IN ('due','in_progress','submitted','late','waived')),
  reference TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reg_reporting_calendar TO authenticated;
GRANT ALL ON public.reg_reporting_calendar TO service_role;
ALTER TABLE public.reg_reporting_calendar ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reg_calendar staff read" ON public.reg_reporting_calendar FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'adviser'));
CREATE POLICY "reg_calendar admin write" ON public.reg_reporting_calendar FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER reg_calendar_updated_at BEFORE UPDATE ON public.reg_reporting_calendar
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed a few demo rows
INSERT INTO public.cash_forecast_entries (forecast_date, direction, category, amount, reference, confidence) VALUES
  (CURRENT_DATE + 1, 'inflow', 'Employer contributions', 125000, 'ACME-Feb', 'confirmed'),
  (CURRENT_DATE + 1, 'outflow', 'Pension payments', 48200, 'Bacs run', 'confirmed'),
  (CURRENT_DATE + 2, 'inflow', 'Transfer in', 84500, 'TR-2201', 'expected'),
  (CURRENT_DATE + 3, 'outflow', 'PCLS lump sum', 25000, 'M-1044', 'expected'),
  (CURRENT_DATE + 4, 'inflow', 'RAS reclaim', 18300, 'HMRC-JAN', 'expected'),
  (CURRENT_DATE + 5, 'outflow', 'Adviser fees', 6400, 'AF-Q4', 'tentative');

INSERT INTO public.reg_reporting_calendar (regulator, return_name, period_end, due_date, status) VALUES
  ('TPR', 'Scheme return', '2026-03-31', '2026-06-30', 'due'),
  ('HMRC', 'Event report (AFT)', '2026-06-30', '2026-08-14', 'due'),
  ('HMRC', 'Accounting for tax (APSS201)', '2026-03-31', '2026-05-14', 'in_progress'),
  ('FCA', 'RMAR', '2026-03-31', '2026-04-30', 'due'),
  ('TPR', 'Chair statement', '2026-03-31', '2026-10-01', 'due'),
  ('ICO', 'Data protection fee', NULL, '2026-05-01', 'due');
