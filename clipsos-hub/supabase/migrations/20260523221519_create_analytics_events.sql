-- Migration: Create analytics_events table
-- Created: 2026-05-23
-- Description: Sets up the analytics_events table for tracking visitor sessions and heartbeats, with multi-tenancy, RLS policies and performance indexes.

CREATE TABLE IF NOT EXISTS public.analytics_events (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  visitor_id  text NOT NULL,
  session_id  text NOT NULL,
  event_type  text NOT NULL, -- 'pageview' or 'heartbeat'
  path        text NOT NULL,
  source      text NOT NULL DEFAULT 'Direct',
  device      text NOT NULL,
  variant     text,
  country     text,
  timestamp   timestamptz NOT NULL DEFAULT now()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- 1. Create indexes for performance on multi-tenant reads and analytical aggregations
CREATE INDEX IF NOT EXISTS idx_analytics_events_tenant_id ON public.analytics_events(tenant_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_timestamp ON public.analytics_events(tenant_id, timestamp);
CREATE INDEX IF NOT EXISTS idx_analytics_events_session ON public.analytics_events(tenant_id, session_id);

-- 2. RLS Policies
-- Owner and manager roles can select events for their matching tenant
CREATE POLICY "Owners and managers can view analytics" ON public.analytics_events
  FOR SELECT USING (
    tenant_id = public.tenant_id_for_user(auth.uid())
    AND public.is_owner_or_manager(auth.uid())
  );

-- Platform admin can select everything
CREATE POLICY "Platform admins can view all analytics" ON public.analytics_events
  FOR SELECT USING (
    public.is_platform_admin(auth.uid())
  );
