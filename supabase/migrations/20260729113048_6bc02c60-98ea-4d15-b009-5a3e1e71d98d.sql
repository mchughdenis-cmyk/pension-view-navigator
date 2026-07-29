
-- Open anon access for demo (auth is currently disabled in the app)
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ledger_accounts TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ledger_entries TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.payment_instructions TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.expected_receipts TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ledger_batches TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.payment_approvals TO anon;

DROP POLICY IF EXISTS ledger_acc_write ON public.ledger_accounts;
CREATE POLICY ledger_acc_write ON public.ledger_accounts FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS ledger_entries_rw ON public.ledger_entries;
CREATE POLICY ledger_entries_rw ON public.ledger_entries FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS payments_rw ON public.payment_instructions;
CREATE POLICY payments_rw ON public.payment_instructions FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS exprec_rw ON public.expected_receipts;
CREATE POLICY exprec_rw ON public.expected_receipts FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
