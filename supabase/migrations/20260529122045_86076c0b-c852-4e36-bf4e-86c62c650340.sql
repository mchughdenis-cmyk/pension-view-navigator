
CREATE OR REPLACE FUNCTION public.email_for_identifier(_identifier text)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT u.email::text
  FROM public.profiles p
  JOIN auth.users u ON u.id = p.id
  WHERE lower(p.display_name) = lower(_identifier)
  LIMIT 1
$$;

GRANT EXECUTE ON FUNCTION public.email_for_identifier(text) TO anon, authenticated;
