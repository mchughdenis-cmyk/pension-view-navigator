
ALTER TABLE public.ops_cases REPLICA IDENTITY FULL;
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.ops_cases;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
