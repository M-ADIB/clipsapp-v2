-- 1. Lock down stripe_events_log: deny all to authenticated users (only service role can access)
CREATE POLICY "Deny all access to stripe events log" ON public.stripe_events_log
  AS PERMISSIVE FOR ALL TO authenticated
  USING (false) WITH CHECK (false);

-- 2. Fix mutable search_path on helper functions
ALTER FUNCTION public.set_updated_at() SET search_path = public;
ALTER FUNCTION public.role_hierarchy_level(public.app_role) SET search_path = public;