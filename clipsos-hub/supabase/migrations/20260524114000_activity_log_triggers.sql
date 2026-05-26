-- Migration: Client Workspace Activity Log Triggers
-- Created: 2026-05-24
-- Description: Automatically logs actions on clients, videos, comments, versions, and journey steps to activity_log.

-- 1. Create or replace the activity logging function
CREATE OR REPLACE FUNCTION public.log_activity()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  _tenant_id uuid;
  _client_id uuid;
  _target_name text;
  _metadata jsonb := '{}'::jsonb;
  _changes jsonb := null;
  _user_id uuid := auth.uid();
  _action text;
BEGIN
  -- Determine base action
  IF TG_OP = 'INSERT' THEN
    _action := 'created';
  ELSIF TG_OP = 'UPDATE' THEN
    _action := 'updated';
  ELSE
    _action := 'deleted';
  END IF;

  -- Resolve tenant, client, and target name based on the table name
  IF TG_TABLE_NAME = 'clients' THEN
    _tenant_id := COALESCE(NEW.tenant_id, OLD.tenant_id);
    _client_id := COALESCE(NEW.id, OLD.id);
    _target_name := COALESCE(NEW.name, OLD.name);
    
  ELSIF TG_TABLE_NAME = 'videos' THEN
    _tenant_id := COALESCE(NEW.tenant_id, OLD.tenant_id);
    -- Resolve client_id from project
    SELECT client_id INTO _client_id FROM public.projects WHERE id = COALESCE(NEW.project_id, OLD.project_id);
    _target_name := COALESCE(NEW.video_title, OLD.video_title);
    
    -- Specific action for status change
    IF TG_OP = 'UPDATE' AND NEW.status_id IS DISTINCT FROM OLD.status_id THEN
      _action := 'status_changed';
      DECLARE
        _old_status text;
        _new_status text;
      BEGIN
        SELECT display_name INTO _old_status FROM public.statuses WHERE id = OLD.status_id;
        SELECT display_name INTO _new_status FROM public.statuses WHERE id = NEW.status_id;
        _metadata := jsonb_build_object('old_status', _old_status, 'new_status', _new_status);
      END;
    END IF;

  ELSIF TG_TABLE_NAME = 'video_comments' THEN
    _tenant_id := COALESCE(NEW.tenant_id, OLD.tenant_id);
    -- Resolve client_id from project through video
    SELECT p.client_id, v.video_title INTO _client_id, _target_name
    FROM public.videos v
    JOIN public.projects p ON p.id = v.project_id
    WHERE v.id = COALESCE(NEW.video_id, OLD.video_id);
    
    _action := 'commented';

  ELSIF TG_TABLE_NAME = 'client_journey_steps' THEN
    _tenant_id := COALESCE(NEW.tenant_id, OLD.tenant_id);
    _client_id := COALESCE(NEW.client_id, OLD.client_id);
    _target_name := COALESCE(NEW.step_label, OLD.step_label);
    
    IF TG_OP = 'UPDATE' AND NEW.status IS DISTINCT FROM OLD.status THEN
      IF NEW.status = 'completed' THEN
        _action := 'approved';
      ELSE
        _action := 'status_changed';
      END IF;
      _metadata := jsonb_build_object('status', NEW.status);
    END IF;

  ELSIF TG_TABLE_NAME = 'video_versions' THEN
    -- Resolve tenant_id and client_id from video
    SELECT v.tenant_id, p.client_id, v.video_title INTO _tenant_id, _client_id, _target_name
    FROM public.videos v
    JOIN public.projects p ON p.id = v.project_id
    WHERE v.id = COALESCE(NEW.video_id, OLD.video_id);
    
    _action := 'uploaded';
    _metadata := jsonb_build_object('version_name', COALESCE(NEW.name, OLD.name));
  END IF;

  -- Only log if we successfully resolved both the tenant and the client context
  IF _tenant_id IS NOT NULL AND _client_id IS NOT NULL THEN
    -- Add base fields to metadata JSON for frontend ease-of-use
    _metadata := _metadata || jsonb_build_object('target_name', _target_name, 'client_id', _client_id);
    
    INSERT INTO public.activity_log (
      tenant_id,
      user_id,
      action,
      entity_type,
      entity_id,
      metadata,
      changes
    ) VALUES (
      _tenant_id,
      _user_id,
      _action,
      TG_TABLE_NAME,
      COALESCE(NEW.id, OLD.id),
      _metadata,
      _changes
    );
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$;

-- 2. Drop existing triggers if they exist, then create them
DROP TRIGGER IF EXISTS log_client_activity ON public.clients;
CREATE TRIGGER log_client_activity
  AFTER INSERT OR UPDATE OR DELETE ON public.clients
  FOR EACH ROW EXECUTE FUNCTION public.log_activity();

DROP TRIGGER IF EXISTS log_video_activity ON public.videos;
CREATE TRIGGER log_video_activity
  AFTER INSERT OR UPDATE OR DELETE ON public.videos
  FOR EACH ROW EXECUTE FUNCTION public.log_activity();

DROP TRIGGER IF EXISTS log_comment_activity ON public.video_comments;
CREATE TRIGGER log_comment_activity
  AFTER INSERT OR UPDATE OR DELETE ON public.video_comments
  FOR EACH ROW EXECUTE FUNCTION public.log_activity();

DROP TRIGGER IF EXISTS log_journey_activity ON public.client_journey_steps;
CREATE TRIGGER log_journey_activity
  AFTER INSERT OR UPDATE OR DELETE ON public.client_journey_steps
  FOR EACH ROW EXECUTE FUNCTION public.log_activity();

DROP TRIGGER IF EXISTS log_version_activity ON public.video_versions;
CREATE TRIGGER log_version_activity
  AFTER INSERT OR UPDATE OR DELETE ON public.video_versions
  FOR EACH ROW EXECUTE FUNCTION public.log_activity();

-- 3. Update RLS policies on activity_log to include content_creator in select
DROP POLICY IF EXISTS "Team leads can view activity log" ON public.activity_log;
DROP POLICY IF EXISTS "Team members can view activity log" ON public.activity_log;

CREATE POLICY "Team members can view activity log" ON public.activity_log
  FOR SELECT USING (
    tenant_id = public.tenant_id_for_user(auth.uid())
    AND public.has_any_role(auth.uid(), ARRAY['owner','manager','senior_editor','content_creator']::public.app_role[])
  );
