
DROP MATERIALIZED VIEW IF EXISTS public.mi_fee_yield;
DROP VIEW IF EXISTS public.mi_fee_yield CASCADE;
DROP VIEW IF EXISTS public.mi_net_flows CASCADE;
DROP VIEW IF EXISTS public.mi_ops_queue_health CASCADE;

CREATE VIEW public.mi_fee_yield AS
SELECT aa.firm_id,
       date_trunc('month', fc.charged_date::timestamp)::date AS month,
       SUM(fc.total) AS total_fees,
       SUM(fc.total) AS fees_charged,
       COUNT(DISTINCT fc.client_id) AS billed_clients
FROM public.fee_charges fc
LEFT JOIN public.agency_assignments aa
  ON aa.client_id = fc.client_id AND aa.assigned_to IS NULL
GROUP BY aa.firm_id, date_trunc('month', fc.charged_date::timestamp)::date;

CREATE VIEW public.mi_net_flows AS
SELECT aa.firm_id,
       date_trunc('month', t.effective_date::timestamp)::date AS month,
       SUM(CASE WHEN t.amount > 0 THEN t.amount ELSE 0 END) AS inflows,
       SUM(CASE WHEN t.amount < 0 THEN t.amount ELSE 0 END) AS outflows,
       SUM(t.amount) AS net_flow,
       COUNT(*) AS txn_count
FROM public.transactions t
LEFT JOIN public.client_accounts ca ON ca.id = t.account_id
LEFT JOIN public.agency_assignments aa
  ON aa.client_id = ca.client_id AND aa.assigned_to IS NULL
WHERE t.status IN ('completed','settled')
GROUP BY aa.firm_id, date_trunc('month', t.effective_date::timestamp)::date;

CREATE VIEW public.mi_ops_queue_health AS
SELECT aa.firm_id,
       oc.queue, oc.status, oc.priority,
       COUNT(*) AS case_count,
       COUNT(*) FILTER (WHERE oc.sla_due_at < now() AND oc.status NOT IN ('resolved','closed')) AS sla_breached
FROM public.ops_cases oc
LEFT JOIN public.agency_assignments aa
  ON aa.client_id = oc.client_id AND aa.assigned_to IS NULL
GROUP BY aa.firm_id, oc.queue, oc.status, oc.priority;

GRANT SELECT ON public.mi_fee_yield, public.mi_net_flows, public.mi_ops_queue_health TO anon, authenticated, service_role;
