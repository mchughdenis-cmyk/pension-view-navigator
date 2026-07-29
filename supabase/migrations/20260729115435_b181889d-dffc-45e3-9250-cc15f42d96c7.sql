
-- 1) Drop every "Open access anon" policy across the public schema
DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT schemaname, tablename, policyname
    FROM pg_policies
    WHERE schemaname = 'public'
      AND policyname = 'Open access anon'
  LOOP
    EXECUTE format('DROP POLICY %I ON %I.%I', r.policyname, r.schemaname, r.tablename);
  END LOOP;
END $$;

-- 2) user_roles: ensure only admin manage + own read remain (Open access anon already dropped above)
--    (Admin manages roles + Own role read policies already exist.)

-- 3) Financial / case / event / credential tables — replace permissive
--    "USING true" authenticated policies with admin-or-adviser scoping.
DO $$
DECLARE
  t text;
  tables text[] := ARRAY[
    'ledger_entries','ledger_batches','payment_instructions','payment_approvals',
    'payment_batches','expected_receipts','cases','case_tasks','case_events',
    'case_documents','domain_events'
  ];
  pol record;
BEGIN
  FOREACH t IN ARRAY tables LOOP
    FOR pol IN
      SELECT policyname FROM pg_policies WHERE schemaname='public' AND tablename=t
    LOOP
      EXECUTE format('DROP POLICY %I ON public.%I', pol.policyname, t);
    END LOOP;
    EXECUTE format($f$
      CREATE POLICY "Staff read %1$s" ON public.%1$I
        FOR SELECT TO authenticated
        USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'adviser'));
      CREATE POLICY "Staff write %1$s" ON public.%1$I
        FOR ALL TO authenticated
        USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'adviser'))
        WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'adviser'));
      REVOKE ALL ON public.%1$I FROM anon;
      GRANT SELECT, INSERT, UPDATE, DELETE ON public.%1$I TO authenticated;
      GRANT ALL ON public.%1$I TO service_role;
    $f$, t);
  END LOOP;
END $$;

-- 4) Admin-only sensitive tables
DO $$
DECLARE
  t text;
  tables text[] := ARRAY[
    'api_keys','api_credentials','webhook_endpoints','webhook_subscriptions',
    'sso_configurations','cass_settings','feature_flags','tenants'
  ];
  pol record;
BEGIN
  FOREACH t IN ARRAY tables LOOP
    -- skip if table doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname='public' AND tablename=t) THEN
      CONTINUE;
    END IF;
    FOR pol IN
      SELECT policyname FROM pg_policies WHERE schemaname='public' AND tablename=t
    LOOP
      EXECUTE format('DROP POLICY %I ON public.%I', pol.policyname, t);
    END LOOP;
    EXECUTE format($f$
      CREATE POLICY "Admin only %1$s" ON public.%1$I
        FOR ALL TO authenticated
        USING (public.has_role(auth.uid(),'admin'))
        WITH CHECK (public.has_role(auth.uid(),'admin'));
      REVOKE ALL ON public.%1$I FROM anon, public;
      GRANT SELECT, INSERT, UPDATE, DELETE ON public.%1$I TO authenticated;
      GRANT ALL ON public.%1$I TO service_role;
    $f$, t);
  END LOOP;
END $$;

-- 5) ledger_accounts: authenticated staff read, admin write
DROP POLICY IF EXISTS ledger_acc_read ON public.ledger_accounts;
DROP POLICY IF EXISTS ledger_acc_write ON public.ledger_accounts;
CREATE POLICY "Staff read ledger_accounts" ON public.ledger_accounts
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'adviser'));
CREATE POLICY "Admin write ledger_accounts" ON public.ledger_accounts
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin'));
REVOKE ALL ON public.ledger_accounts FROM anon, public;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ledger_accounts TO authenticated;
GRANT ALL ON public.ledger_accounts TO service_role;

-- 6) reference_rates & bank_calendar: keep public/authenticated read, restrict write to admin
DROP POLICY IF EXISTS refrates_write ON public.reference_rates;
CREATE POLICY "Admin write reference_rates" ON public.reference_rates
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin'));

DROP POLICY IF EXISTS bankcal_write ON public.bank_calendar;
CREATE POLICY "Admin write bank_calendar" ON public.bank_calendar
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin'));

-- 7) site_settings: the "Open access anon" policy is dropped in step 1; nothing else to change.

-- 8) Views: ensure security_invoker so they enforce caller's RLS, not the view owner's.
ALTER VIEW public.trial_balance SET (security_invoker = on);
