
-- Tables with RLS but no policy — add admin/adviser only (and remove anon grant)
GRANT SELECT, INSERT, UPDATE, DELETE ON public.open_banking_accounts TO authenticated;
CREATE POLICY "Staff manage open_banking_accounts" ON public.open_banking_accounts
FOR ALL TO authenticated
USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'adviser'))
WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'adviser'));

GRANT SELECT, INSERT, UPDATE, DELETE ON public.pension_sharing_orders TO authenticated;
CREATE POLICY "Staff manage pension_sharing_orders" ON public.pension_sharing_orders
FOR ALL TO authenticated
USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'adviser'))
WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'adviser'));

-- Materialised views: remove from PostgREST exposure by revoking grants
REVOKE ALL ON public.mi_fee_yield FROM anon, authenticated, PUBLIC;
REVOKE ALL ON public.mi_persistency FROM anon, authenticated, PUBLIC;
GRANT SELECT ON public.mi_fee_yield TO service_role;
GRANT SELECT ON public.mi_persistency TO service_role;

-- firm-branding bucket: remove broad list policy; keep public read on specific objects only
DROP POLICY IF EXISTS "firm-branding public read" ON storage.objects;
-- Public can read individual objects when they know the URL; no listing
CREATE POLICY "firm-branding object read" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'firm-branding' AND name IS NOT NULL);

-- Tighten current_client_id exec
REVOKE EXECUTE ON FUNCTION public.current_client_id() FROM PUBLIC;
