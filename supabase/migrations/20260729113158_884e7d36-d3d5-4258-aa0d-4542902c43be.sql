
CREATE OR REPLACE FUNCTION public.emit_payment_domain_event()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  ev text;
BEGIN
  IF TG_OP = 'INSERT' THEN
    ev := 'payment.created';
  ELSIF TG_OP = 'UPDATE' AND NEW.status IS DISTINCT FROM OLD.status THEN
    ev := 'payment.' || NEW.status;
  ELSE
    RETURN NEW;
  END IF;

  INSERT INTO public.domain_events (event_name, aggregate_type, aggregate_id, payload, tenant_id, emitted_by)
  VALUES (
    ev,
    'payment_instruction',
    NEW.id,
    jsonb_build_object(
      'amount', NEW.amount,
      'currency', NEW.currency,
      'purpose', NEW.purpose,
      'status', NEW.status,
      'beneficiary', NEW.beneficiary_name
    ),
    NEW.tenant_id,
    COALESCE(NEW.approved_by, NEW.created_by)
  );
  RETURN NEW;
END;
$$;
