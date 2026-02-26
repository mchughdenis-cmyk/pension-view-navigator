
-- Drop all restrictive policies and recreate as permissive
DROP POLICY IF EXISTS "Allow all access to activity_log" ON public.activity_log;
DROP POLICY IF EXISTS "Allow all access to bank_file_entries" ON public.bank_file_entries;
DROP POLICY IF EXISTS "Allow all access to bank_files" ON public.bank_files;
DROP POLICY IF EXISTS "Allow all access to bce_events" ON public.bce_events;
DROP POLICY IF EXISTS "Allow all access to beneficiaries" ON public.beneficiaries;
DROP POLICY IF EXISTS "Allow all access to client_accounts" ON public.client_accounts;
DROP POLICY IF EXISTS "Allow all access to clients" ON public.clients;
DROP POLICY IF EXISTS "Allow all access to investments" ON public.investments;
DROP POLICY IF EXISTS "Allow all access to transactions" ON public.transactions;

-- Recreate as PERMISSIVE policies
CREATE POLICY "Allow all access to activity_log" ON public.activity_log FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to bank_file_entries" ON public.bank_file_entries FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to bank_files" ON public.bank_files FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to bce_events" ON public.bce_events FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to beneficiaries" ON public.beneficiaries FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to client_accounts" ON public.client_accounts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to clients" ON public.clients FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to investments" ON public.investments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to transactions" ON public.transactions FOR ALL USING (true) WITH CHECK (true);
