
DO $$
DECLARE
  c1 uuid; c2 uuid; c3 uuid;
  s1 uuid; s2 uuid; s3 uuid;
  inv1 uuid; inv2 uuid; inv3 uuid;
BEGIN
  SELECT id INTO c1 FROM public.clients ORDER BY created_at LIMIT 1 OFFSET 0;
  SELECT id INTO c2 FROM public.clients ORDER BY created_at LIMIT 1 OFFSET 1;
  SELECT id INTO c3 FROM public.clients ORDER BY created_at LIMIT 1 OFFSET 2;

  INSERT INTO public.schemes (name, scheme_type, pstr, status, established_date, benefit_basis) VALUES
    ('Airgead Master Trust','master_trust','00812345RM','active','2015-04-06','DC'),
    ('Acme Ltd Group Personal Pension','gpp','00898765RN','active','2018-06-01','DC'),
    ('Brightside SSAS','ssas','00811223RS','active','2012-01-15','DC');
  SELECT id INTO s1 FROM public.schemes WHERE name='Airgead Master Trust';
  SELECT id INTO s2 FROM public.schemes WHERE name='Acme Ltd Group Personal Pension';
  SELECT id INTO s3 FROM public.schemes WHERE name='Brightside SSAS';

  INSERT INTO public.employers (name, paye_reference, accounts_office_ref, staging_date, employee_contribution_pct, employer_contribution_pct, salary_sacrifice, pay_reference_period, status) VALUES
    ('Acme Ltd','120/AB456','120PA00012345','2017-05-01',5,3,false,'monthly','active'),
    ('Brightside Cafés','120/CD789','120PA00067890','2018-01-01',5,4,true,'monthly','active'),
    ('Norwood Health Ltd','120/EF012','120PA00013579','2019-09-01',4,3,false,'monthly','active');

  INSERT INTO public.cases (case_ref, case_type, subject_client_id, title, description, status, priority, sla_due_at) VALUES
    ('CASE-2026-001','transfer_in',c1,'Transfer in from Aviva','£142,500 SIPP transfer requested','open','high', now() + interval '2 days'),
    ('CASE-2026-002','drawdown',c2,'FAD income setup','Set monthly £2,000 income + 25% PCLS','in_progress','normal', now() + interval '4 days'),
    ('CASE-2026-003','death_claim',c3,'Bereavement notification','Beneficiary payment to spouse','open','urgent', now() + interval '1 day');

  INSERT INTO public.cetv_quotes (client_id, scheme_id, request_date, quote_date, guarantee_end_date, transfer_value, safeguarded_benefits, advice_required, status, requested_by) VALUES
    (c1,s1,CURRENT_DATE - 20, CURRENT_DATE - 10, CURRENT_DATE + 80, 187500, true, true, 'issued','J. Adviser'),
    (c2,s2,CURRENT_DATE - 5,  NULL, NULL, NULL, false, false, 'draft','A. Admin'),
    (c3,s3,CURRENT_DATE - 45, CURRENT_DATE - 30, CURRENT_DATE + 60, 412300, true, true, 'accepted','J. Adviser');

  INSERT INTO public.retirement_quotes (client_id, scheme_id, quote_date, target_retirement_date, fund_value, pcls_amount, annuity_gross, drawdown_income, ufpls_amount, wake_up_stage, status) VALUES
    (c1,s1,CURRENT_DATE,CURRENT_DATE + 180, 240000, 60000, 8400, 12000, 24000, '50_wake_up','issued'),
    (c2,s2,CURRENT_DATE,CURRENT_DATE + 365, 315000, 78750, 11200, 15750, 31500, 'pre_retirement','draft'),
    (c3,s3,CURRENT_DATE - 30,CURRENT_DATE + 30, 512000, 128000, 19500, 25600, 51200, 'at_retirement','accepted');

  INSERT INTO public.death_claims (client_id, date_of_death, notified_date, total_pot_value, status, pre_75, notes) VALUES
    (c1,CURRENT_DATE - 12,CURRENT_DATE - 10, 187500,'in_progress',true,'Spouse nominated 100%'),
    (c2,CURRENT_DATE - 40,CURRENT_DATE - 38, 92300,'awaiting_docs',false,'Post-75: taxable at marginal rate'),
    (c3,CURRENT_DATE - 90,CURRENT_DATE - 88, 415000,'paid',true,'Two beneficiaries: 60/40 split');

  INSERT INTO public.trustee_meetings (scheme_id, meeting_date, meeting_type, location, chair, attendees, agenda, status) VALUES
    (s1,CURRENT_DATE + 14,'quarterly','London / Teams','C. Trustee',ARRAY['C. Trustee','J. Adviser','A. Admin'],'[{"item":"Investment review"},{"item":"Value for money"}]'::jsonb,'scheduled'),
    (s2,CURRENT_DATE - 30,'annual','Manchester','C. Trustee',ARRAY['C. Trustee','A. Auditor'],'[{"item":"Chair statement"},{"item":"Employer covenant"}]'::jsonb,'minuted'),
    (s3,CURRENT_DATE + 45,'ad_hoc','Teams','C. Trustee',ARRAY['C. Trustee','J. Adviser'],'[{"item":"Property valuation"}]'::jsonb,'scheduled');

  INSERT INTO public.tpr_breaches (scheme_id, identified_date, identified_by, category, description, cause, effect, reaction, materiality, reportable_to_tpr, status, reference) VALUES
    (s1,CURRENT_DATE - 5,'A. Admin','contributions','Employer late payment April 2026','Payroll error','Delay <10 working days','Chase issued; paid','green',false,'open','TPR-2026-001'),
    (s2,CURRENT_DATE - 20,'C. Trustee','governance','Chair statement filed 3 days late','Reviewer absence','Minor non-compliance','Process updated','amber',true,'reported','TPR-2026-002'),
    (s3,CURRENT_DATE - 60,'J. Adviser','investments','SIPP fund suspended','Provider gating','Delay to trades','Reported to TPR & members','red',true,'closed','TPR-2026-003');

  INSERT INTO public.invoices (invoice_number, scheme_id, client_id, issue_date, due_date, subtotal, vat, total, status)
    VALUES ('INV-2026-001',s1,c1,CURRENT_DATE - 30, CURRENT_DATE, 1200, 240, 1440, 'sent') RETURNING id INTO inv1;
  INSERT INTO public.invoices (invoice_number, scheme_id, client_id, issue_date, due_date, subtotal, vat, total, status)
    VALUES ('INV-2026-002',s2,c2,CURRENT_DATE - 15, CURRENT_DATE + 15, 850, 170, 1020, 'sent') RETURNING id INTO inv2;
  INSERT INTO public.invoices (invoice_number, scheme_id, client_id, issue_date, due_date, subtotal, vat, total, status)
    VALUES ('INV-2026-003',s3,c3,CURRENT_DATE - 60, CURRENT_DATE - 30, 2400, 480, 2880, 'paid') RETURNING id INTO inv3;
  INSERT INTO public.invoice_lines (invoice_id, description, quantity, unit_amount, vat_rate, line_total) VALUES
    (inv1,'Quarterly admin fee',1,1200,20,1200),
    (inv2,'Scheme actuarial review',1,850,20,850),
    (inv3,'Annual trustee support',1,2400,20,2400);

  INSERT INTO public.adviser_fees (client_id, adviser_name, fee_type, rate, frequency, wrapper, status) VALUES
    (c1,'James Adviser','ongoing',0.75,'quarterly','SIPP','active'),
    (c2,'Nadia Rowe','initial',3.00,'once','ISA','active'),
    (c3,'James Adviser','ongoing',0.50,'annual','GIA','active');

  INSERT INTO public.adviser_fee_schedules (client_id, fee_type, basis, rate_or_amount, frequency, next_due_date, status) VALUES
    (c1,'ongoing','percentage',0.75,'quarterly',CURRENT_DATE + 30,'active'),
    (c2,'initial','fixed',1500,'one_off',CURRENT_DATE + 7,'active'),
    (c3,'ongoing','percentage',0.50,'annual',CURRENT_DATE + 90,'active');

  INSERT INTO public.workflow_definitions (name, trigger, action, frequency, days_before_due, assign_to, active) VALUES
    ('Wake-up pack at 50','age_reached_50','send_wake_up_pack','once',0,'admin_team',true),
    ('Contribution chase T+5','contribution_missed','send_chaser','daily',0,'admin_team',true),
    ('Annual review reminder','review_due','create_case','yearly',30,'adviser_pool',true);

  INSERT INTO public.workflow_instances (client_id, status, current_step, started_at, due_at, context) VALUES
    (c1,'in_progress',2,now() - interval '3 days',now() + interval '4 days','{"workflow":"Wake-up pack at 50"}'::jsonb),
    (c2,'pending',1,now(),now() + interval '2 days','{"workflow":"Contribution chase"}'::jsonb),
    (c3,'completed',3,now() - interval '14 days',now() - interval '1 day','{"workflow":"Annual review"}'::jsonb);

  INSERT INTO public.illustrations (client_id, scenario_name, contributions, growth_rate, retirement_age, projected_pot, inflation_rate, fca_rate_low, fca_rate_mid, fca_rate_high) VALUES
    (c1,'Base 5% growth', 500, 5, 67, 425000, 2.5, 2, 5, 8),
    (c2,'Accelerated contributions', 850, 5, 65, 612000, 2.5, 2, 5, 8),
    (c3,'Late retirement age 70', 350, 5, 70, 388000, 2.5, 2, 5, 8);

  INSERT INTO public.kyc_records (client_id, provider, reference, status, identity_check, address_check, pep_sanctions_check, checked_at) VALUES
    (c1,'Onfido','ONF-8812','passed',true,true,true,now() - interval '30 days'),
    (c2,'Onfido','ONF-8813','pending',true,false,true,now() - interval '2 days'),
    (c3,'ComplyAdvantage','CA-4451','review',true,true,false,now() - interval '5 days');

  INSERT INTO public.fact_finds (client_id, income_annual, expenditure_annual, dependants, objectives, completed_at) VALUES
    (c1,68000,42000,2,'Retire at 60 with £30k p.a. income',now() - interval '20 days'),
    (c2,92000,55000,1,'Maximise ISA + SIPP; IHT planning',now() - interval '10 days'),
    (c3,145000,78000,3,'Property purchase via SSAS',now() - interval '45 days');

  INSERT INTO public.suitability_reports (client_id, recommendation, rationale, risk_alignment, costs_summary, status, atr_score, capacity_for_loss, objectives, time_horizon_years) VALUES
    (c1,'Consolidate 3 legacy pensions into Airgead SIPP','Reduces charges by 0.4% p.a., single portal, better fund range','ATR 5 aligned to Balanced portfolio','0.75% adviser + 0.35% platform + 0.22% OCF','signed_off',5,'medium','Retire at 60',15),
    (c2,'Maintain existing arrangement + top-up ISA','Existing scheme competitive; use £20k ISA allowance','ATR 6 aligned to Growth portfolio','1.00% initial + 0.75% ongoing','draft',6,'high','Growth over 20 years',20),
    (c3,'Fund SSAS with in-specie property','Uses commercial property to fund business & pension','ATR 4 aligned to Cautious','0.50% ongoing + property costs','issued',4,'low','Property purchase',10);

  INSERT INTO public.dd_mandates (client_id, bank_name, sort_code, account_number, amount, frequency, status, next_collection, provider, scheme, reference, account_holder, signed_at) VALUES
    (c1,'Lloyds Bank','30-96-26','12345678',500,'monthly','active',CURRENT_DATE + 7,'GoCardless (mock)','bacs','DD-C1-001','Client One',now() - interval '90 days'),
    (c2,'Barclays','20-11-04','87654321',250,'monthly','active',CURRENT_DATE + 12,'GoCardless (mock)','bacs','DD-C2-001','Client Two',now() - interval '60 days'),
    (c3,'HSBC','40-05-15','55667788',1000,'monthly','pending',CURRENT_DATE + 14,'GoCardless (mock)','bacs','DD-C3-001','Client Three',now() - interval '5 days');

  INSERT INTO public.corporate_actions (isin, symbol, action_type, ex_date, record_date, payment_date, rate, currency, voluntary, status, description) VALUES
    ('GB00B03MLX29','RDSB','dividend',CURRENT_DATE + 5, CURRENT_DATE + 6, CURRENT_DATE + 20, 0.36,'GBP',false,'announced','Q2 dividend'),
    ('GB0007099541','PRU','dividend',CURRENT_DATE - 2, CURRENT_DATE - 1, CURRENT_DATE + 14, 0.14,'GBP',false,'announced','Interim dividend'),
    ('GB00B10RZP78','ULVR','rights_issue',CURRENT_DATE + 10, CURRENT_DATE + 12, CURRENT_DATE + 35, NULL,'GBP',true,'announced','2-for-15 rights offer');

  INSERT INTO public.rti_submissions (submission_type, tax_year, period_end, client_count, total_gross, total_tax, hmrc_reference, status, submitted_at) VALUES
    ('FPS','2025-26',CURRENT_DATE - 30, 42, 178500, 35700, 'HMRC-2026-04-FPS','accepted', now() - interval '30 days'),
    ('EPS','2025-26',CURRENT_DATE - 30, 1, 0, 0, 'HMRC-2026-04-EPS','accepted', now() - interval '30 days'),
    ('FPS','2025-26',CURRENT_DATE, 44, 182300, 36460, NULL,'pending', NULL);

  INSERT INTO public.marketing_leads (first_name, last_name, email, firm, message, source, status) VALUES
    ('Emma','Wright','emma.wright@example.com','Wright Wealth','Interested in white-label SIPP admin','marketing_site','new'),
    ('David','Kaur','david.kaur@example.com','Kaur & Co IFA','Demo request for 400 clients','marketing_site','qualified'),
    ('Priya','Shah','priya.shah@example.com','Shah Financial','Migration from AJ Bell platform','marketing_site','contacted');

  INSERT INTO public.secure_messages (client_id, sender, recipient, subject, body, from_role) VALUES
    (c1,'James Adviser','Client One','Your annual review is due','Please book a slot via the client portal.','adviser'),
    (c2,'A. Admin','Client Two','Contribution received','April contribution of £500 has been allocated.','admin'),
    (c3,'Client Three','James Adviser','Question about drawdown','How do I change my monthly income amount?','client');

  INSERT INTO public.payroll_runs (scheme_name, period_start, period_end, pay_date, frequency, status, totals, notes) VALUES
    ('Acme Ltd April 2026',CURRENT_DATE - 60,CURRENT_DATE - 30,CURRENT_DATE - 25,'monthly','completed','{"gross":178500,"ee":8925,"er":5355,"members":42}'::jsonb,'Approved by A. Admin'),
    ('Brightside May 2026',CURRENT_DATE - 30,CURRENT_DATE,CURRENT_DATE + 3,'monthly','awaiting_approval','{"gross":62300,"ee":3115,"er":2492,"members":18}'::jsonb,'Salary sacrifice scheme'),
    ('Norwood May 2026',CURRENT_DATE - 30,CURRENT_DATE,CURRENT_DATE + 5,'monthly','in_progress','{"gross":98700,"ee":3948,"er":2961,"members":27}'::jsonb,NULL);

  INSERT INTO public.bank_files (filename, total_entries, total_amount, matched_count, unmatched_count, status) VALUES
    ('lloyds-statement-2026-05-20.csv',48, 92340, 45, 3,'reconciled'),
    ('barclays-statement-2026-05-21.csv',22, 41250, 22, 0,'reconciled'),
    ('hsbc-statement-2026-05-22.csv',31, 58720, 25, 6,'in_progress');

  INSERT INTO public.four_eyes_approvals (entity_type, entity_id, amount, requested_by, status, notes) VALUES
    ('payment_instruction', gen_random_uuid(), 42500,'A. Admin','pending','Drawdown lump sum'),
    ('payment_instruction', gen_random_uuid(), 12300,'A. Admin','approved','Fee sweep — approved by S. Supervisor'),
    ('bulk_order', gen_random_uuid(), 187000,'A. Admin','pending','Model portfolio rebalance');

  INSERT INTO public.data_quality_scores (scheme_id, as_at_date, common_score, scheme_specific_score, members_total, members_with_gaps, remediation_plan, status) VALUES
    (s1,CURRENT_DATE, 97.4, 92.1, 1240, 32,'NI numbers missing for 12 members; address gaps for 20','active'),
    (s2,CURRENT_DATE, 98.9, 95.6,  420,  4,'Minor DOB corrections','active'),
    (s3,CURRENT_DATE, 89.2, 84.3,   68,  9,'Historic transferee records incomplete','under_review');

  INSERT INTO public.aa_carry_forward (client_id, tax_year, annual_allowance, used_this_year, carried_forward, notes) VALUES
    (c1,'2025-26',60000,42000,18000,'£18k CF available from 2022-23'),
    (c2,'2025-26',60000,60000,0,'Fully used; MPAA not triggered'),
    (c3,'2025-26',10000,10000,0,'MPAA applies from flexible access in 2024');

  INSERT INTO public.feature_flags (flag_key, enabled, config) VALUES
    ('four_eyes_payments',true,'{"threshold":10000}'::jsonb),
    ('ai_case_triage',true,'{"model":"gemini-2.5-flash"}'::jsonb),
    ('open_banking_beta',false,'{"providers":["truelayer"]}'::jsonb);

END $$;
