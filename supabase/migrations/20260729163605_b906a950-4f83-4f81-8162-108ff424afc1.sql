GRANT SELECT, INSERT, UPDATE, DELETE ON public.payment_instructions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.payment_approvals TO authenticated;
GRANT SELECT ON public.payment_instructions TO anon;
GRANT SELECT ON public.payment_approvals TO anon;
GRANT ALL ON public.payment_instructions TO service_role;
GRANT ALL ON public.payment_approvals TO service_role;