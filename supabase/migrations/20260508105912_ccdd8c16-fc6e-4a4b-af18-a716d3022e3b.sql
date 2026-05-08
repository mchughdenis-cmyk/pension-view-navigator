
CREATE TABLE IF NOT EXISTS public.property_expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL,
  expense_date DATE NOT NULL,
  category TEXT NOT NULL,
  vendor TEXT NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  vat NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'paid',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.property_expenses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "all select" ON public.property_expenses FOR SELECT USING (true);
CREATE POLICY "all insert" ON public.property_expenses FOR INSERT WITH CHECK (true);
CREATE POLICY "all update" ON public.property_expenses FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "all delete" ON public.property_expenses FOR DELETE USING (true);
CREATE INDEX IF NOT EXISTS idx_property_expenses_property ON public.property_expenses(property_id);
CREATE INDEX IF NOT EXISTS idx_property_expenses_date ON public.property_expenses(expense_date);
