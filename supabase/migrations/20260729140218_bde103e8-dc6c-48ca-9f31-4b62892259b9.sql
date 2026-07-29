
DO $$
DECLARE
  c1 uuid; c2 uuid; c3 uuid;
  s1 uuid; s2 uuid;
  bf1 uuid; bf2 uuid; bf3 uuid;
  dc1 uuid;
  tm1 uuid; tm2 uuid;
  acc1 uuid;
  pay1 uuid; pay2 uuid; pay3 uuid;
BEGIN
  SELECT id INTO c1 FROM public.clients ORDER BY created_at LIMIT 1 OFFSET 0;
  SELECT id INTO c2 FROM public.clients ORDER BY created_at LIMIT 1 OFFSET 1;
  SELECT id INTO c3 FROM public.clients ORDER BY created_at LIMIT 1 OFFSET 2;
  SELECT id INTO s1 FROM public.schemes WHERE name='Airgead Master Trust';
  SELECT id INTO s2 FROM public.schemes WHERE name='Acme Ltd Group Personal Pension';
  SELECT id INTO bf1 FROM public.bank_files WHERE filename='lloyds-statement-2026-05-20.csv';
  SELECT id INTO bf2 FROM public.bank_files WHERE filename='barclays-statement-2026-05-21.csv';
  SELECT id INTO bf3 FROM public.bank_files WHERE filename='hsbc-statement-2026-05-22.csv';
  SELECT id INTO dc1 FROM public.death_claims WHERE client_id=c1 LIMIT 1;
  SELECT id INTO tm1 FROM public.trustee_meetings WHERE scheme_id=s1 LIMIT 1;
  SELECT id INTO tm2 FROM public.trustee_meetings WHERE scheme_id=s2 LIMIT 1;
  SELECT id INTO acc1 FROM public.client_accounts LIMIT 1;

  -- ops_cases (Operator Console + Case Inbox)
  INSERT INTO public.ops_cases (case_ref, case_type, client_id, priority, status, queue, assigned_to, sla_due_at, title, description) VALUES
    ('OPS-2026-001','transfer_in',c1,'high','open','transfers','A. Admin', now() + interval '2 days','Aviva transfer £142,500','Origo one-way transfer in from Aviva SIPP'),
    ('OPS-2026-002','drawdown',c2,'urgent','in_progress','drawdown','J. Adviser', now() + interval '18 hours','Set up FAD income','25% PCLS + £2,000/mo income'),
    ('OPS-2026-003','onboarding',c3,'normal','awaiting','onboarding','A. Admin', now() + interval '5 days','Complete KYC','Awaiting proof of address'),
    ('OPS-2026-004','contribution',c1,'normal','open','compliance',NULL, now() + interval '3 days','MPAA check needed','Client took UFPLS last year — verify £10k limit'),
    ('OPS-2026-005','investments',c2,'low','open','investments','J. Adviser', now() + interval '7 days','Rebalance to Balanced 60/40','Drift >5% from model'),
    ('OPS-2026-006','general',c3,'urgent','blocked','general','A. Admin', now() - interval '4 hours','Address change verification','SLA breached — chase Onfido');

  -- bank_file_entries (Unallocated cash)
  INSERT INTO public.bank_file_entries (bank_file_id, entry_date, description, amount, reference, transaction_type, status) VALUES
    (bf1, CURRENT_DATE - 2,'ACME LTD MAY PAYROLL', 8340,'ACME/PAY/2026-05','credit','matched'),
    (bf1, CURRENT_DATE - 2,'BRIGHTSIDE CAFES MAY',  6725,'BSC/PAY/2026-05','credit','matched'),
    (bf1, CURRENT_DATE - 2,'UNKNOWN REF X12',        2150,'X12-UNKNOWN','credit','unmatched'),
    (bf2, CURRENT_DATE - 1,'AVIVA TRANSFER',       142500,'AV-XFER-9981','credit','matched'),
    (bf2, CURRENT_DATE - 1,'DD COLLECTION MAY',      3250,'BACS-DD-05','credit','matched'),
    (bf3, CURRENT_DATE,     'HMRC RAS RECLAIM',      4820,'HMRC-RAS-APR','credit','suspense'),
    (bf3, CURRENT_DATE,     'DUPLICATE PAYMENT?',    1500,'DUP-CHECK','credit','suspense');

  -- contributions (Contribution chaser)
  IF acc1 IS NOT NULL THEN
    INSERT INTO public.contributions (client_id, account_id, contribution_type, gross_amount, net_amount, tax_relief, relief_method, tax_year, effective_date, status, reference) VALUES
      (c1, acc1,'regular',  500, 400, 100,'relief_at_source','2025-26', CURRENT_DATE - 40,'overdue','APR-C1'),
      (c2, acc1,'regular',  250, 200,  50,'relief_at_source','2025-26', CURRENT_DATE - 10,'expected','MAY-C2'),
      (c3, acc1,'employer',1000,1000,   0,'net_pay',         '2025-26', CURRENT_DATE - 5, 'received','MAY-C3'),
      (c1, acc1,'single', 10000,8000,2000,'relief_at_source','2025-26', CURRENT_DATE - 60,'received','LUMP-C1'),
      (c2, acc1,'regular',  250, 200,  50,'relief_at_source','2025-26', CURRENT_DATE + 5, 'expected','JUN-C2');
  END IF;

  -- wake_up_events
  INSERT INTO public.wake_up_events (client_id, age_trigger, due_date, issued_date, channel, status, pension_wise_offered) VALUES
    (c1, 50, CURRENT_DATE - 60, CURRENT_DATE - 55,'post','issued',true),
    (c2, 55, CURRENT_DATE + 10, NULL,'email','due',true),
    (c3, 65, CURRENT_DATE + 30, NULL,'post','scheduled',true);

  -- trustee_actions
  INSERT INTO public.trustee_actions (meeting_id, scheme_id, description, owner, due_date, status) VALUES
    (tm1, s1,'Review investment platform SLAs','C. Trustee', CURRENT_DATE + 30,'open'),
    (tm2, s2,'File Chair Statement 2026','A. Admin', CURRENT_DATE + 60,'open'),
    (tm1, s1,'Approve updated SIP','C. Trustee', CURRENT_DATE - 10,'completed');

  -- beneficiaries
  INSERT INTO public.beneficiaries (client_id, name, relationship, date_of_birth, allocation_pct, contact_details) VALUES
    (c1,'Sarah One','spouse','1972-06-15',100,'sarah.one@example.com'),
    (c2,'Tom Two','son','2005-03-22',50,'tom.two@example.com'),
    (c2,'Ella Two','daughter','2007-11-08',50,'ella.two@example.com');

  -- death benefit payments
  IF dc1 IS NOT NULL THEN
    INSERT INTO public.death_benefit_payments (death_claim_id, client_id, beneficiary_name, payment_type, gross_amount, tax_amount, net_amount, paid_date, status) VALUES
      (dc1, c1,'Sarah One','lump_sum',  93750, 0, 93750, CURRENT_DATE - 3,'paid'),
      (dc1, c1,'Sarah One','drawdown',  93750, 0, 93750, NULL,'pending'),
      (dc1, c1,'Sarah One','pcls',      15000, 0, 15000, CURRENT_DATE - 3,'paid');
  END IF;

  -- payment_approvals (link to existing payments if any)
  SELECT id INTO pay1 FROM public.payment_instructions ORDER BY created_at LIMIT 1 OFFSET 0;
  SELECT id INTO pay2 FROM public.payment_instructions ORDER BY created_at LIMIT 1 OFFSET 1;
  SELECT id INTO pay3 FROM public.payment_instructions ORDER BY created_at LIMIT 1 OFFSET 2;
  IF pay1 IS NOT NULL THEN
    DECLARE
      appr uuid;
    BEGIN
      SELECT id INTO appr FROM auth.users LIMIT 1;
      IF appr IS NOT NULL THEN
        INSERT INTO public.payment_approvals (payment_id, approver_id, decision, comment) VALUES
          (pay1, appr,'approved','Verified against instruction'),
          (COALESCE(pay2,pay1), appr,'approved','Second signatory sign-off'),
          (COALESCE(pay3,pay1), appr,'rejected','Amount exceeds threshold — split required');
      END IF;
    END;
  END IF;

END $$;

-- Restore anon read access for demo mode (unauthenticated). Writes remain staff-only.
DO $$
DECLARE t text;
BEGIN
  FOR t IN SELECT unnest(ARRAY[
    'ops_cases','cases','bank_file_entries','bank_files','contributions','tpr_breaches',
    'cash_forecast_entries','reg_reporting_calendar','ledger_accounts','ledger_entries',
    'payment_instructions','payment_approvals','expected_receipts','trustee_meetings',
    'trustee_actions','death_claims','death_benefit_payments','cetv_quotes','retirement_quotes',
    'schemes','employers','invoices','invoice_lines','four_eyes_approvals','data_quality_scores',
    'pension_sharing_orders','wake_up_events','beneficiaries','corporate_actions','rti_submissions',
    'workflow_definitions','workflow_instances','illustrations','kyc_records','fact_finds',
    'suitability_reports','dd_mandates','marketing_leads','secure_messages','payroll_runs',
    'adviser_fees','adviser_fee_schedules','aa_carry_forward','feature_flags','domain_events',
    'reference_rates'
  ]) LOOP
    IF EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='public' AND c.relname=t) THEN
      EXECUTE format('GRANT SELECT ON public.%I TO anon', t);
      EXECUTE format('DROP POLICY IF EXISTS "Demo anon read" ON public.%I', t);
      EXECUTE format('CREATE POLICY "Demo anon read" ON public.%I FOR SELECT TO anon USING (true)', t);
    END IF;
  END LOOP;
END $$;
