
INSERT INTO storage.buckets (id, name, public) VALUES ('firm-branding', 'firm-branding', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "firm-branding public read"
ON storage.objects FOR SELECT
USING (bucket_id = 'firm-branding');

CREATE POLICY "firm-branding open insert"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'firm-branding');

CREATE POLICY "firm-branding open update"
ON storage.objects FOR UPDATE
USING (bucket_id = 'firm-branding');

CREATE POLICY "firm-branding open delete"
ON storage.objects FOR DELETE
USING (bucket_id = 'firm-branding');
