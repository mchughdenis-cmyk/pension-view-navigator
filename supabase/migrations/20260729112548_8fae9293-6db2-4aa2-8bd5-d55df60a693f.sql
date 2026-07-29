
-- 1) Seed HMRC 2025/26 rates (idempotent)
INSERT INTO public.reference_rates (rate_key, tax_year, rate_value, unit, effective_from, effective_to, notes) VALUES
  ('annual_allowance',            '2025/26',  60000, 'GBP', '2025-04-06', '2026-04-05', 'Standard annual allowance'),
  ('mpaa',                        '2025/26',  10000, 'GBP', '2025-04-06', '2026-04-05', 'Money Purchase Annual Allowance'),
  ('tapered_aa_threshold_income', '2025/26', 200000, 'GBP', '2025-04-06', '2026-04-05', 'Threshold income for tapered AA'),
  ('tapered_aa_adjusted_income',  '2025/26', 260000, 'GBP', '2025-04-06', '2026-04-05', 'Adjusted income where taper starts'),
  ('tapered_aa_min',              '2025/26',  10000, 'GBP', '2025-04-06', '2026-04-05', 'Minimum tapered AA'),
  ('lsa',                         '2025/26', 268275, 'GBP', '2025-04-06', '2026-04-05', 'Lump Sum Allowance'),
  ('lsdba',                       '2025/26', 1073100,'GBP', '2025-04-06', '2026-04-05', 'Lump Sum & Death Benefit Allowance'),
  ('personal_allowance',          '2025/26',  12570, 'GBP', '2025-04-06', '2026-04-05', 'Income tax personal allowance'),
  ('basic_rate_limit',            '2025/26',  37700, 'GBP', '2025-04-06', '2026-04-05', 'Basic-rate band on top of PA'),
  ('higher_rate_threshold',       '2025/26', 125140, 'GBP', '2025-04-06', '2026-04-05', 'Additional-rate threshold'),
  ('nrb_iht',                     '2025/26', 325000, 'GBP', '2025-04-06', '2026-04-05', 'Nil-rate band IHT'),
  ('rnrb_iht',                    '2025/26', 175000, 'GBP', '2025-04-06', '2026-04-05', 'Residence nil-rate band IHT'),
  ('cgt_annual_exempt',           '2025/26',   3000, 'GBP', '2025-04-06', '2026-04-05', 'CGT annual exempt amount'),
  ('isa_allowance',               '2025/26',  20000, 'GBP', '2025-04-06', '2026-04-05', 'ISA annual subscription limit'),
  ('state_pension_full',          '2025/26', 11973, 'GBP', '2025-04-06', '2026-04-05', 'Full new state pension (annual)')
ON CONFLICT DO NOTHING;

-- 2) Seed UK Bacs bank holidays 2025/2026 (idempotent)
INSERT INTO public.bank_calendar (calendar_date, is_working_day, is_bacs_day, holiday_name) VALUES
  ('2025-01-01', false, false, 'New Year''s Day'),
  ('2025-04-18', false, false, 'Good Friday'),
  ('2025-04-21', false, false, 'Easter Monday'),
  ('2025-05-05', false, false, 'Early May bank holiday'),
  ('2025-05-26', false, false, 'Spring bank holiday'),
  ('2025-08-25', false, false, 'Summer bank holiday'),
  ('2025-12-25', false, false, 'Christmas Day'),
  ('2025-12-26', false, false, 'Boxing Day'),
  ('2026-01-01', false, false, 'New Year''s Day'),
  ('2026-04-03', false, false, 'Good Friday'),
  ('2026-04-06', false, false, 'Easter Monday'),
  ('2026-05-04', false, false, 'Early May bank holiday'),
  ('2026-05-25', false, false, 'Spring bank holiday'),
  ('2026-08-31', false, false, 'Summer bank holiday'),
  ('2026-12-25', false, false, 'Christmas Day'),
  ('2026-12-28', false, false, 'Boxing Day (substitute)')
ON CONFLICT (calendar_date) DO NOTHING;

-- 3) Domain-event emit on payment status change
CREATE OR REPLACE FUNCTION public.emit_payment_domain_event()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  ev TEXT;
BEGIN
  IF TG_OP = 'INSERT' THEN
    ev := 'payment.created';
  ELSIF NEW.status IS DISTINCT FROM OLD.status THEN
    ev := 'payment.' || NEW.status;
  ELSE
    RETURN NEW;
  END IF;

  INSERT INTO public.domain_events (event_name, aggregate_type, aggregate_id, payload, tenant_id, emitted_by)
  VALUES (
    ev,
    'payment_instruction',
    NEW.id::text,
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
END $$;

DROP TRIGGER IF EXISTS trg_emit_payment_event ON public.payment_instructions;
CREATE TRIGGER trg_emit_payment_event
AFTER INSERT OR UPDATE OF status ON public.payment_instructions
FOR EACH ROW EXECUTE FUNCTION public.emit_payment_domain_event();

-- 4) Auto-log breach when a payment is released after its requested date
CREATE OR REPLACE FUNCTION public.auto_log_late_payment_breach()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'released'
     AND OLD.status IS DISTINCT FROM 'released'
     AND NEW.requested_date IS NOT NULL
     AND NEW.released_at::date > NEW.requested_date THEN
    INSERT INTO public.tpr_breaches (
      category, description, materiality, status,
      reference, identified_date, cause, effect, reaction, reportable_to_tpr
    ) VALUES (
      'payments',
      'Payment ' || NEW.id::text || ' (' || COALESCE(NEW.beneficiary_name,'—') || ', £' || NEW.amount::text ||
        ') released on ' || NEW.released_at::date || ', after requested date ' || NEW.requested_date::text,
      'amber',
      'open',
      'PAY-' || substr(NEW.id::text, 1, 8),
      NEW.released_at::date,
      'Late release vs SLA',
      'Delayed member/beneficiary payment',
      'Investigate root cause; confirm no member detriment',
      false
    );
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_auto_log_late_payment_breach ON public.payment_instructions;
CREATE TRIGGER trg_auto_log_late_payment_breach
AFTER UPDATE OF status ON public.payment_instructions
FOR EACH ROW EXECUTE FUNCTION public.auto_log_late_payment_breach();
