
ALTER TABLE public.clients
  ADD COLUMN IF NOT EXISTS mpaa_triggered boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS annual_allowance_used numeric NOT NULL DEFAULT 0;
