
CREATE TABLE IF NOT EXISTS public.origo_transfers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  origo_ref text NOT NULL UNIQUE,
  direction text NOT NULL CHECK (direction IN ('inbound','outbound')),
  client_id uuid,
  client_name text NOT NULL,
  client_ref text,
  account_id uuid,
  ceding_provider text NOT NULL,
  ceding_scheme_ref text,
  receiving_provider text NOT NULL,
  receiving_scheme_ref text,
  transfer_value numeric(14,2) NOT NULL DEFAULT 0,
  transfer_type text NOT NULL DEFAULT 'cetv' CHECK (transfer_type IN ('cetv','in_specie','dc_to_dc')),
  current_state text NOT NULL DEFAULT 'initiated',
  progress_pct integer NOT NULL DEFAULT 5,
  expected_settlement_date date,
  actual_settlement_date date,
  rejection_reason text,
  initiated_at timestamptz NOT NULL DEFAULT now(),
  last_event_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_origo_transfers_state ON public.origo_transfers(current_state);
CREATE INDEX IF NOT EXISTS idx_origo_transfers_client ON public.origo_transfers(client_id);

ALTER TABLE public.origo_transfers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "all select" ON public.origo_transfers FOR SELECT USING (true);
CREATE POLICY "all insert" ON public.origo_transfers FOR INSERT WITH CHECK (true);
CREATE POLICY "all update" ON public.origo_transfers FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "all delete" ON public.origo_transfers FOR DELETE USING (true);

CREATE TRIGGER origo_transfers_updated_at
  BEFORE UPDATE ON public.origo_transfers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
