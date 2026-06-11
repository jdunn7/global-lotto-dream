
-- 1) Restrict affiliate self-updates to safe columns only
REVOKE UPDATE ON public.affiliates FROM authenticated;
GRANT UPDATE (payout_method, payout_details) ON public.affiliates TO authenticated;

-- 2) Make user_roles writes admin-only (explicit, in addition to default-deny)
DROP POLICY IF EXISTS "admin manage user_roles" ON public.user_roles;
CREATE POLICY "admin manage user_roles" ON public.user_roles
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

-- 3) Don't expose has_role() as a public RPC to anonymous callers
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;
