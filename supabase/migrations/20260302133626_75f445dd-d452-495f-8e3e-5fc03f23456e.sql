
-- Drop all permissive policies and replace with authenticated-only access

-- clients
DROP POLICY IF EXISTS "Allow all access to clients" ON public.clients;
CREATE POLICY "Authenticated users can select clients" ON public.clients FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert clients" ON public.clients FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update clients" ON public.clients FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete clients" ON public.clients FOR DELETE TO authenticated USING (true);

-- client_accounts
DROP POLICY IF EXISTS "Allow all access to client_accounts" ON public.client_accounts;
CREATE POLICY "Authenticated users can select client_accounts" ON public.client_accounts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert client_accounts" ON public.client_accounts FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update client_accounts" ON public.client_accounts FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete client_accounts" ON public.client_accounts FOR DELETE TO authenticated USING (true);

-- transactions
DROP POLICY IF EXISTS "Allow all access to transactions" ON public.transactions;
CREATE POLICY "Authenticated users can select transactions" ON public.transactions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert transactions" ON public.transactions FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update transactions" ON public.transactions FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete transactions" ON public.transactions FOR DELETE TO authenticated USING (true);

-- investments
DROP POLICY IF EXISTS "Allow all access to investments" ON public.investments;
CREATE POLICY "Authenticated users can select investments" ON public.investments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert investments" ON public.investments FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update investments" ON public.investments FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete investments" ON public.investments FOR DELETE TO authenticated USING (true);

-- beneficiaries
DROP POLICY IF EXISTS "Allow all access to beneficiaries" ON public.beneficiaries;
CREATE POLICY "Authenticated users can select beneficiaries" ON public.beneficiaries FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert beneficiaries" ON public.beneficiaries FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update beneficiaries" ON public.beneficiaries FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete beneficiaries" ON public.beneficiaries FOR DELETE TO authenticated USING (true);

-- bce_events
DROP POLICY IF EXISTS "Allow all access to bce_events" ON public.bce_events;
CREATE POLICY "Authenticated users can select bce_events" ON public.bce_events FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert bce_events" ON public.bce_events FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update bce_events" ON public.bce_events FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete bce_events" ON public.bce_events FOR DELETE TO authenticated USING (true);

-- activity_log
DROP POLICY IF EXISTS "Allow all access to activity_log" ON public.activity_log;
CREATE POLICY "Authenticated users can select activity_log" ON public.activity_log FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert activity_log" ON public.activity_log FOR INSERT TO authenticated WITH CHECK (true);

-- adviser_fees
DROP POLICY IF EXISTS "Allow all access to adviser_fees" ON public.adviser_fees;
CREATE POLICY "Authenticated users can select adviser_fees" ON public.adviser_fees FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert adviser_fees" ON public.adviser_fees FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update adviser_fees" ON public.adviser_fees FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete adviser_fees" ON public.adviser_fees FOR DELETE TO authenticated USING (true);

-- fee_schedules
DROP POLICY IF EXISTS "Allow all access to fee_schedules" ON public.fee_schedules;
CREATE POLICY "Authenticated users can select fee_schedules" ON public.fee_schedules FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert fee_schedules" ON public.fee_schedules FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update fee_schedules" ON public.fee_schedules FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete fee_schedules" ON public.fee_schedules FOR DELETE TO authenticated USING (true);

-- trade_orders
DROP POLICY IF EXISTS "Allow all access to trade_orders" ON public.trade_orders;
CREATE POLICY "Authenticated users can select trade_orders" ON public.trade_orders FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert trade_orders" ON public.trade_orders FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update trade_orders" ON public.trade_orders FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete trade_orders" ON public.trade_orders FOR DELETE TO authenticated USING (true);

-- bank_files
DROP POLICY IF EXISTS "Allow all access to bank_files" ON public.bank_files;
CREATE POLICY "Authenticated users can select bank_files" ON public.bank_files FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert bank_files" ON public.bank_files FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update bank_files" ON public.bank_files FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete bank_files" ON public.bank_files FOR DELETE TO authenticated USING (true);

-- bank_file_entries
DROP POLICY IF EXISTS "Allow all access to bank_file_entries" ON public.bank_file_entries;
CREATE POLICY "Authenticated users can select bank_file_entries" ON public.bank_file_entries FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert bank_file_entries" ON public.bank_file_entries FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update bank_file_entries" ON public.bank_file_entries FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete bank_file_entries" ON public.bank_file_entries FOR DELETE TO authenticated USING (true);

-- workflow_definitions
DROP POLICY IF EXISTS "Allow all access to workflow_definitions" ON public.workflow_definitions;
CREATE POLICY "Authenticated users can select workflow_definitions" ON public.workflow_definitions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert workflow_definitions" ON public.workflow_definitions FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update workflow_definitions" ON public.workflow_definitions FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete workflow_definitions" ON public.workflow_definitions FOR DELETE TO authenticated USING (true);

-- consent_records
DROP POLICY IF EXISTS "Allow all access to consent_records" ON public.consent_records;
CREATE POLICY "Authenticated users can select consent_records" ON public.consent_records FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert consent_records" ON public.consent_records FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update consent_records" ON public.consent_records FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete consent_records" ON public.consent_records FOR DELETE TO authenticated USING (true);

-- crystallisation_segments
DROP POLICY IF EXISTS "Allow all access to crystallisation_segments" ON public.crystallisation_segments;
CREATE POLICY "Authenticated users can select crystallisation_segments" ON public.crystallisation_segments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert crystallisation_segments" ON public.crystallisation_segments FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update crystallisation_segments" ON public.crystallisation_segments FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete crystallisation_segments" ON public.crystallisation_segments FOR DELETE TO authenticated USING (true);
