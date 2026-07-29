CREATE TABLE public.payment_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  file_name text NOT NULL,
  file_kind text NOT NULL DEFAULT 'bacs_pain001',
  content_type text NOT NULL DEFAULT 'application/xml',
  storage_path text NOT NULL,
  batch_reference text,
  payment_count integer NOT NULL DEFAULT 0,
  total_amount numeric NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'GBP',
  status text NOT NULL DEFAULT 'generated',
  payment_ids uuid[] NOT NULL DEFAULT '{}',
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.payment_files TO authenticated;
GRANT ALL ON public.payment_files TO service_role;

ALTER TABLE public.payment_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view payment files" ON public.payment_files
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'adviser'));

CREATE POLICY "Staff can create payment files" ON public.payment_files
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'adviser'));

CREATE POLICY "Staff can update payment files" ON public.payment_files
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'adviser'));

CREATE POLICY "Admins can delete payment files" ON public.payment_files
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(),'admin'));

CREATE TRIGGER payment_files_set_updated_at
  BEFORE UPDATE ON public.payment_files
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

CREATE POLICY "Staff can read payment file objects" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'payment-files' AND (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'adviser')));

CREATE POLICY "Staff can upload payment file objects" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'payment-files' AND (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'adviser')));

CREATE POLICY "Staff can update payment file objects" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'payment-files' AND (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'adviser')));