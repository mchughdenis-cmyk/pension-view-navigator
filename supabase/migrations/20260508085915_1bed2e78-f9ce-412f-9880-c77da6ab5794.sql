
-- Helper to invoke an edge function via pg_net
CREATE OR REPLACE FUNCTION public.invoke_edge_function(fn_name TEXT, body JSONB DEFAULT '{}'::jsonb)
RETURNS BIGINT LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE req_id BIGINT;
BEGIN
  SELECT net.http_post(
    url := 'https://hzmkgkgrelxwmkswdkyw.supabase.co/functions/v1/' || fn_name,
    headers := jsonb_build_object('Content-Type','application/json'),
    body := body
  ) INTO req_id;
  RETURN req_id;
END;
$$;

-- Unschedule any prior versions
DO $$ BEGIN
  PERFORM cron.unschedule('daily-valuations-job');
EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN
  PERFORM cron.unschedule('monthly-fees-job');
EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN
  PERFORM cron.unschedule('annual-statements-job');
EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- Daily valuations at 02:00 UTC
SELECT cron.schedule(
  'daily-valuations-job',
  '0 2 * * *',
  $$ SELECT public.invoke_edge_function('daily-valuations'); $$
);

-- Monthly fees on the 1st at 03:00 UTC
SELECT cron.schedule(
  'monthly-fees-job',
  '0 3 1 * *',
  $$ SELECT public.invoke_edge_function('monthly-fees'); $$
);

-- Annual statements on 10 April at 04:00 UTC (after UK tax year end 5 Apr)
SELECT cron.schedule(
  'annual-statements-job',
  '0 4 10 4 *',
  $$ SELECT public.invoke_edge_function('annual-statements'); $$
);
