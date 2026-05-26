-- Migration: Schedule Dashboard RLS Policies Upgrade
-- Created: 2026-05-26
-- Description: Adds/updates RLS policies on public.calendly_events and public.closer_regions to support the schedule dashboard upgrades.

-- ==========================================
-- 1. Upgrades for public.calendly_events
-- ==========================================

-- Drop existing SELECT policies we wish to consolidate
DROP POLICY IF EXISTS "Closers can view calendly events" ON public.calendly_events;
DROP POLICY IF EXISTS "Content creators can view calendly events" ON public.calendly_events;
DROP POLICY IF EXISTS "Users can view calendly events" ON public.calendly_events;

-- Create updated SELECT policy allowing owner, manager, content_creator, and closer within their tenant
CREATE POLICY "Users can view calendly events" ON public.calendly_events
  FOR SELECT
  USING (
    tenant_id = public.tenant_id_for_user(auth.uid()) AND
    (
      public.is_owner_or_manager(auth.uid()) OR
      public.has_role(auth.uid(), 'content_creator'::public.app_role) OR
      public.has_role(auth.uid(), 'closer'::public.app_role)
    )
  );


-- ==========================================
-- 2. Upgrades for public.closer_regions
-- ==========================================

-- Drop existing policies on closer_regions
DROP POLICY IF EXISTS "Closers can view own region" ON public.closer_regions;
DROP POLICY IF EXISTS "Closers and creators can view own region" ON public.closer_regions;
DROP POLICY IF EXISTS "Closers can insert own region" ON public.closer_regions;
DROP POLICY IF EXISTS "Closers can update own region" ON public.closer_regions;
DROP POLICY IF EXISTS "Team leads can view all closer regions" ON public.closer_regions;
DROP POLICY IF EXISTS "Team leads can manage closer regions" ON public.closer_regions;

-- A. Owner and manager to view all regions (so they can verify team connection status)
CREATE POLICY "Team leads can view all closer regions" ON public.closer_regions
  FOR SELECT
  USING (
    tenant_id = public.tenant_id_for_user(auth.uid()) AND
    public.is_owner_or_manager(auth.uid())
  );

-- B. Closer and content_creator to view their own region
CREATE POLICY "Closers and creators can view own region" ON public.closer_regions
  FOR SELECT
  USING (
    user_id = auth.uid() AND
    (
      public.has_role(auth.uid(), 'closer'::public.app_role) OR
      public.has_role(auth.uid(), 'content_creator'::public.app_role)
    )
  );

-- C. Users to insert their own region
CREATE POLICY "Users can insert own region" ON public.closer_regions
  FOR INSERT
  WITH CHECK (
    user_id = auth.uid() AND
    tenant_id = public.tenant_id_for_user(auth.uid())
  );

-- D. Users to update their own region
CREATE POLICY "Users can update own region" ON public.closer_regions
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- E. Team leads (owner, manager) to manage all regions (ALL)
CREATE POLICY "Team leads can manage closer regions" ON public.closer_regions
  FOR ALL
  USING (
    tenant_id = public.tenant_id_for_user(auth.uid()) AND
    public.is_owner_or_manager(auth.uid())
  )
  WITH CHECK (
    tenant_id = public.tenant_id_for_user(auth.uid()) AND
    public.is_owner_or_manager(auth.uid())
  );
