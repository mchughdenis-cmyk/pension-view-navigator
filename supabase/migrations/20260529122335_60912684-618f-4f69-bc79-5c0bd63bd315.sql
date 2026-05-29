
CREATE POLICY "Client reads own record"
ON public.clients FOR SELECT
TO authenticated
USING (id IS NOT NULL AND id = public.current_client_id());

CREATE POLICY "Client reads own open_banking_accounts"
ON public.open_banking_accounts FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.open_banking_consents c
    WHERE c.id = open_banking_accounts.consent_id
      AND c.client_id = public.current_client_id()
  )
);

CREATE POLICY "Client reads own pension_sharing_orders"
ON public.pension_sharing_orders FOR SELECT
TO authenticated
USING (member_client_id IS NOT NULL AND member_client_id = public.current_client_id());
