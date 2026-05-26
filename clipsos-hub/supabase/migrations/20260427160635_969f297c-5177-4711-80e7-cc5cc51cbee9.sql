
-- 1. custom_columns: per-column role-based edit permission
ALTER TABLE public.custom_columns
  ADD COLUMN IF NOT EXISTS editable_roles app_role[] NOT NULL DEFAULT ARRAY['owner','manager','senior_editor','content_creator','editor']::app_role[];

-- 2. saved_filter_views: shareable views (tenant-wide)
ALTER TABLE public.saved_filter_views
  ADD COLUMN IF NOT EXISTS is_shared boolean NOT NULL DEFAULT false;

-- Allow team members to read shared views from other users in the same tenant
DROP POLICY IF EXISTS "Users can read shared views in tenant" ON public.saved_filter_views;
CREATE POLICY "Users can read shared views in tenant"
  ON public.saved_filter_views
  FOR SELECT
  USING (
    is_shared = true
    AND tenant_id = public.tenant_id_for_user(auth.uid())
  );

-- 3. tenants: tenant-wide rename overrides for built-in video columns
ALTER TABLE public.tenants
  ADD COLUMN IF NOT EXISTS video_column_labels jsonb NOT NULL DEFAULT '{}'::jsonb;
