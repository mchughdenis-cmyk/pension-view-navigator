-- Enable Realtime for messaging/notifications
ALTER TABLE public.secure_messages REPLICA IDENTITY FULL;
ALTER TABLE public.push_notifications REPLICA IDENTITY FULL;
ALTER TABLE public.activity_log REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.secure_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.push_notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.activity_log;

-- Schedule core back-office jobs via pg_cron + pg_net
DO $$
BEGIN
  -- Unschedule any existing entries so re-running is idempotent
  PERFORM cron.unschedule(jobid)
  FROM cron.job
  WHERE jobname IN ('daily-valuations-job','monthly-fees-job','annual-statements-job','interest-accrual-job');
END $$;

SELECT cron.schedule(
  'daily-valuations-job', '15 2 * * *',
  $$ SELECT public.invoke_edge_function('daily-valuations', '{}'::jsonb); $$
);

SELECT cron.schedule(
  'interest-accrual-job', '30 2 * * *',
  $$ SELECT public.invoke_edge_function('interest-accrual', '{}'::jsonb); $$
);

SELECT cron.schedule(
  'monthly-fees-job', '0 3 1 * *',
  $$ SELECT public.invoke_edge_function('monthly-fees', '{}'::jsonb); $$
);

SELECT cron.schedule(
  'annual-statements-job', '0 4 6 4 *',
  $$ SELECT public.invoke_edge_function('annual-statements', '{}'::jsonb); $$
);