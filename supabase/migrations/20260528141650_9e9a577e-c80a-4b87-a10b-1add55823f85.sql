
-- ============================================================
-- SECURITY LOCKDOWN MIGRATION
-- ============================================================

-- Helper: resolve client_id linked to the calling user (from profiles)
CREATE OR REPLACE FUNCTION public.current_client_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT client_id FROM public.profiles WHERE id = auth.uid()
$$;

REVOKE EXECUTE ON FUNCTION public.current_client_id() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.current_client_id() TO authenticated;

-- Lock down internal SECURITY DEFINER helpers
REVOKE EXECUTE ON FUNCTION public.invoke_edge_function(text, jsonb) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.prevent_activity_log_modification() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_running_balance() FROM PUBLIC, anon, authenticated;
-- has_role must stay callable from policies
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;

-- ============================================================
-- Drop every existing policy in public schema, then re-add strict ones
-- ============================================================
DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT schemaname, tablename, policyname
    FROM pg_policies
    WHERE schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', r.policyname, r.schemaname, r.tablename);
  END LOOP;
END $$;

-- Ensure RLS enabled and revoke broad public grants on every public table
DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT tablename FROM pg_tables WHERE schemaname = 'public'
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', r.tablename);
    EXECUTE format('REVOKE ALL ON public.%I FROM PUBLIC, anon', r.tablename);
    EXECUTE format('GRANT ALL ON public.%I TO service_role', r.tablename);
  END LOOP;
END $$;

-- ============================================================
-- CLIENT-OWNED tables: admin/adviser full; client SELECT own; no anon
-- ============================================================
DO $$
DECLARE
  client_tables text[] := ARRAY[
    'aa_carry_forward','adviser_fees','agency_assignments','agency_transfers','ai_insights',
    'atr_assessments','bank_connections','bce_events','beneficiaries','bulk_order_lines',
    'capped_drawdown_segments','cash_forecasts','cash_sweeps','cgt_disposals','client_accounts',
    'client_documents','commercial_properties','consent_records','consumer_duty_reviews','contributions',
    'corporate_action_elections','costs_charges','crystallisation_segments','dd_mandates',
    'death_benefit_payments','death_claims','esign_envelopes','event_report_lines','fact_finds',
    'fee_charges','illustrations','in_specie_transfers','interest_accruals','investments',
    'isa_subscriptions','kyc_cases','kyc_records','lisa_bonus_claims','lsa_lsdba_ledger',
    'mifid_drop_alerts','model_assignments','notifications','open_banking_consents','open_banking_links',
    'ops_cases','origo_messages','origo_transfers','paye_calculations','paye_payments',
    'payment_initiations','push_notifications','ras_reclaim_lines','rebalance_runs',
    'scheme_pensions','secure_messages','sla_cases','ssas_members','statements',
    'suitability_reports','trade_allocations','trade_orders','transactions','transfers_in',
    'valuations','workflow_instances'
  ];
  t text;
BEGIN
  FOREACH t IN ARRAY client_tables LOOP
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON public.%I TO authenticated', t);

    EXECUTE format($f$
      CREATE POLICY "Staff manage all %1$s" ON public.%1$I
      FOR ALL TO authenticated
      USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'adviser'))
      WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'adviser'))
    $f$, t);

    EXECUTE format($f$
      CREATE POLICY "Client reads own %1$s" ON public.%1$I
      FOR SELECT TO authenticated
      USING (client_id IS NOT NULL AND client_id = public.current_client_id())
    $f$, t);
  END LOOP;
END $$;

-- ============================================================
-- KYC documents/checks (no client_id, linked via kyc_cases)
-- Restrict to admin/adviser only.
-- ============================================================
DO $$
DECLARE staff_only text[] := ARRAY['kyc_checks','kyc_documents','property_expenses','property_insurance','property_leases','property_rent_ledger','ops_case_notes','jisa_holders'];
  t text;
BEGIN
  FOREACH t IN ARRAY staff_only LOOP
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON public.%I TO authenticated', t);
    EXECUTE format($f$
      CREATE POLICY "Staff manage %1$s" ON public.%1$I
      FOR ALL TO authenticated
      USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'adviser'))
      WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'adviser'))
    $f$, t);
  END LOOP;
END $$;

-- ============================================================
-- ADMIN-ONLY tables (system config, secrets, regulatory)
-- ============================================================
DO $$
DECLARE
  admin_only text[] := ARRAY[
    'api_keys','webhook_endpoints','webhook_subscriptions','webhook_deliveries',
    'sso_configurations','firm_branding','firms','retention_policies',
    'integration_log','hmrc_submissions','hmrc_test_runs','rti_submissions',
    'cass_settings','cass_breaches','cass_reconciliations','dr_drills',
    'four_eyes_approvals','registration_log','paye_runs',
    'workflow_templates','workflow_definitions','marketing_leads',
    'fee_schedules','fee_splits','adviser_fees','document_versions','statements'
  ];
  t text;
BEGIN
  FOREACH t IN ARRAY admin_only LOOP
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON public.%I TO authenticated', t);
    EXECUTE format($f$
      DROP POLICY IF EXISTS "Admin only %1$s" ON public.%1$I;
      CREATE POLICY "Admin only %1$s" ON public.%1$I
      FOR ALL TO authenticated
      USING (public.has_role(auth.uid(),'admin'))
      WITH CHECK (public.has_role(auth.uid(),'admin'))
    $f$, t);
  END LOOP;
END $$;

-- ============================================================
-- STAFF-READ tables (advisers/admins) - reference data
-- ============================================================
DO $$
DECLARE
  staff_read text[] := ARRAY[
    'advisers','market_prices','esg_fund_data','model_portfolios','model_holdings',
    'corporate_actions','bank_files','bank_file_entries','bulk_orders','trade_blocks',
    'voting_records','settlement_instructions','ssas_schemes','ssas_loanbacks','clients'
  ];
  t text;
BEGIN
  FOREACH t IN ARRAY staff_read LOOP
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON public.%I TO authenticated', t);
    EXECUTE format($f$
      CREATE POLICY "Staff manage %1$s" ON public.%1$I
      FOR ALL TO authenticated
      USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'adviser'))
      WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'adviser'))
    $f$, t);
  END LOOP;
END $$;

-- ============================================================
-- activity_log: admin SELECT only; INSERT via service_role/system
-- ============================================================
GRANT SELECT ON public.activity_log TO authenticated;
CREATE POLICY "Admin reads activity_log" ON public.activity_log
FOR SELECT TO authenticated
USING (public.has_role(auth.uid(),'admin'));

-- ============================================================
-- profiles: own + admin
-- ============================================================
GRANT SELECT, UPDATE ON public.profiles TO authenticated;
CREATE POLICY "Own profile read" ON public.profiles
FOR SELECT TO authenticated USING (id = auth.uid());
CREATE POLICY "Admin reads profiles" ON public.profiles
FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Own profile update" ON public.profiles
FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());
CREATE POLICY "Admin manages profiles" ON public.profiles
FOR ALL TO authenticated
USING (public.has_role(auth.uid(),'admin'))
WITH CHECK (public.has_role(auth.uid(),'admin'));

-- ============================================================
-- user_roles: own SELECT, admin manage
-- ============================================================
GRANT SELECT ON public.user_roles TO authenticated;
CREATE POLICY "Own role read" ON public.user_roles
FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Admin manages roles" ON public.user_roles
FOR ALL TO authenticated
USING (public.has_role(auth.uid(),'admin'))
WITH CHECK (public.has_role(auth.uid(),'admin'));

-- ============================================================
-- STORAGE LOCKDOWN
-- ============================================================
-- Drop existing storage policies relevant to these buckets
DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT policyname FROM pg_policies
    WHERE schemaname='storage' AND tablename='objects'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', r.policyname);
  END LOOP;
END $$;

-- client-documents: owner-scoped (file path begins with client_id) + staff
CREATE POLICY "client-documents owner read" ON storage.objects
FOR SELECT TO authenticated
USING (
  bucket_id = 'client-documents'
  AND (
    (storage.foldername(name))[1] = public.current_client_id()::text
    OR public.has_role(auth.uid(),'admin')
    OR public.has_role(auth.uid(),'adviser')
  )
);
CREATE POLICY "client-documents staff write" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'client-documents'
  AND (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'adviser'))
);
CREATE POLICY "client-documents staff update" ON storage.objects
FOR UPDATE TO authenticated
USING (bucket_id = 'client-documents' AND (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'adviser')));
CREATE POLICY "client-documents staff delete" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'client-documents' AND (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'adviser')));

-- firm-branding: public read (it's a public bucket), admin-only write
CREATE POLICY "firm-branding public read" ON storage.objects
FOR SELECT TO public USING (bucket_id = 'firm-branding');
CREATE POLICY "firm-branding admin write" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'firm-branding' AND public.has_role(auth.uid(),'admin'));
CREATE POLICY "firm-branding admin update" ON storage.objects
FOR UPDATE TO authenticated
USING (bucket_id = 'firm-branding' AND public.has_role(auth.uid(),'admin'));
CREATE POLICY "firm-branding admin delete" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'firm-branding' AND public.has_role(auth.uid(),'admin'));
