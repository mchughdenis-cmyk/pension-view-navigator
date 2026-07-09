
DO $$
DECLARE
  t record;
BEGIN
  FOR t IN SELECT tablename FROM pg_tables WHERE schemaname='public' LOOP
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON public.%I TO anon, authenticated;', t.tablename);
    EXECUTE format('DROP POLICY IF EXISTS "Open access anon" ON public.%I;', t.tablename);
    EXECUTE format('CREATE POLICY "Open access anon" ON public.%I FOR ALL TO anon USING (true) WITH CHECK (true);', t.tablename);
  END LOOP;
END $$;
