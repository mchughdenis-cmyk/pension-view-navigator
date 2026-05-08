
ALTER TABLE public.dd_mandates ADD COLUMN IF NOT EXISTS provider TEXT NOT NULL DEFAULT 'GoCardless (mock)';
ALTER TABLE public.dd_mandates ADD COLUMN IF NOT EXISTS scheme TEXT NOT NULL DEFAULT 'bacs';
ALTER TABLE public.dd_mandates ADD COLUMN IF NOT EXISTS reference TEXT;
ALTER TABLE public.dd_mandates ADD COLUMN IF NOT EXISTS account_holder TEXT;
ALTER TABLE public.dd_mandates ADD COLUMN IF NOT EXISTS signed_at TIMESTAMPTZ;
