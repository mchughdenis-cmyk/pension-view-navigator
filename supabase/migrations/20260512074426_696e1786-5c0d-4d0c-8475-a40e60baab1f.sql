WITH ranked AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY last_name, first_name) AS rn
  FROM public.clients
  WHERE firm_id IS NULL
)
UPDATE public.clients c
SET firm_id = CASE (r.rn - 1) % 3
  WHEN 0 THEN '11111111-1111-1111-1111-111111111111'::uuid
  WHEN 1 THEN '22222222-2222-2222-2222-222222222222'::uuid
  ELSE '33333333-3333-3333-3333-333333333333'::uuid
END
FROM ranked r
WHERE c.id = r.id;