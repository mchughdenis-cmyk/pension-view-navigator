
-- Drop all restrictive policies and replace with permissive ones for anon access
DO $$
DECLARE
  tbl TEXT;
  pol RECORD;
BEGIN
  FOR tbl IN SELECT unnest(ARRAY['clients','client_accounts','transactions','investments','activity_log','adviser_fees','bank_files','bank_file_entries','bce_events','beneficiaries','consent_records','crystallisation_segments','fee_schedules','trade_orders','workflow_definitions'])
  LOOP
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = tbl AND schemaname = 'public'
    LOOP
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol.policyname, tbl);
    END LOOP;
    
    EXECUTE format('CREATE POLICY "Allow all select" ON public.%I FOR SELECT TO anon, authenticated USING (true)', tbl);
    EXECUTE format('CREATE POLICY "Allow all insert" ON public.%I FOR INSERT TO anon, authenticated WITH CHECK (true)', tbl);
    EXECUTE format('CREATE POLICY "Allow all update" ON public.%I FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true)', tbl);
    EXECUTE format('CREATE POLICY "Allow all delete" ON public.%I FOR DELETE TO anon, authenticated USING (true)', tbl);
  END LOOP;
END $$;
