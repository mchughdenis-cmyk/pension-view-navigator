-- Notifications centre: in-app + mocked email/SMS deliveries
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID,
  channel TEXT NOT NULL CHECK (channel IN ('inapp','email','sms')),
  event_type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'info' CHECK (severity IN ('info','success','warning','error')),
  recipient TEXT,
  status TEXT NOT NULL DEFAULT 'delivered' CHECK (status IN ('queued','delivered','failed','read')),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_notifications_created ON public.notifications (created_at DESC);
CREATE INDEX idx_notifications_client  ON public.notifications (client_id, created_at DESC);
CREATE INDEX idx_notifications_channel ON public.notifications (channel, created_at DESC);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Demo project: public read/write to mirror existing demo tables
CREATE POLICY "Public can view notifications"   ON public.notifications FOR SELECT USING (true);
CREATE POLICY "Public can create notifications" ON public.notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can mark notifications"   ON public.notifications FOR UPDATE USING (true);

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER TABLE public.notifications REPLICA IDENTITY FULL;