-- Migration: Database Scalability and Performance Upgrades
-- Created: 2026-05-23
-- Description: Adds missing foreign key indexes and optimizes security helper functions with transaction-local namespaced caching.

-- 1. Create missing indexes for foreign keys to prevent sequential scans during RLS checks & joins
CREATE INDEX IF NOT EXISTS idx_ai_conversations_tenant_id ON public.ai_conversations(tenant_id);
CREATE INDEX IF NOT EXISTS idx_ai_messages_conversation_id ON public.ai_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_ai_tool_calls_message_id ON public.ai_tool_calls(message_id);
CREATE INDEX IF NOT EXISTS idx_ai_tool_calls_tenant_id ON public.ai_tool_calls(tenant_id);
CREATE INDEX IF NOT EXISTS idx_ai_user_memory_tenant_id ON public.ai_user_memory(tenant_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_forwarded_from_message_id ON public.chat_messages(forwarded_from_message_id);
CREATE INDEX IF NOT EXISTS idx_chat_mutes_room_id ON public.chat_mutes(room_id);
CREATE INDEX IF NOT EXISTS idx_chat_read_receipts_last_read_message_id ON public.chat_read_receipts(last_read_message_id);
CREATE INDEX IF NOT EXISTS idx_client_notes_author_id ON public.client_notes(author_id);
CREATE INDEX IF NOT EXISTS idx_clients_person_id ON public.clients(person_id);
CREATE INDEX IF NOT EXISTS idx_email_queue_template_id ON public.email_queue(template_id);
CREATE INDEX IF NOT EXISTS idx_guest_review_links_cycle_id ON public.guest_review_links(cycle_id);
CREATE INDEX IF NOT EXISTS idx_partnership_applications_person_id ON public.partnership_applications(person_id);
CREATE INDEX IF NOT EXISTS idx_video_annotations_version_id ON public.video_annotations(version_id);

-- 2. Optimize security helper functions with transaction-local namespaced caching (GUC)

-- tenant_id_for_user
CREATE OR REPLACE FUNCTION public.tenant_id_for_user(_user_id uuid)
 RETURNS uuid
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _cached_val text;
  _guc_name text;
  _tenant_id uuid;
BEGIN
  IF _user_id IS NULL THEN
    RETURN NULL;
  END IF;

  _guc_name := 'app.tenant_id_for_user_' || replace(_user_id::text, '-', '_');
  _cached_val := current_setting(_guc_name, true);
  
  IF _cached_val IS NOT NULL AND _cached_val <> '' THEN
    RETURN _cached_val::uuid;
  END IF;

  SELECT tenant_id INTO _tenant_id
  FROM public.profiles
  WHERE id = _user_id;

  IF _tenant_id IS NOT NULL THEN
    PERFORM set_config(_guc_name, _tenant_id::text, true);
  END IF;

  RETURN _tenant_id;
END;
$function$;

-- has_role
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _guc_name text;
  _cached_roles text;
BEGIN
  IF _user_id IS NULL THEN
    RETURN false;
  END IF;

  _guc_name := 'app.roles_for_user_' || replace(_user_id::text, '-', '_');
  _cached_roles := current_setting(_guc_name, true);
  
  IF _cached_roles IS NOT NULL THEN
    IF _cached_roles = '' THEN
      RETURN false;
    END IF;
    RETURN _role::text = ANY(string_to_array(_cached_roles, ','));
  END IF;

  SELECT string_agg(role::text, ',') INTO _cached_roles
  FROM public.user_roles
  WHERE user_id = _user_id
    AND tenant_id = public.tenant_id_for_user(_user_id);

  IF _cached_roles IS NOT NULL THEN
    PERFORM set_config(_guc_name, _cached_roles, true);
  ELSE
    PERFORM set_config(_guc_name, '', true);
    _cached_roles := '';
  END IF;

  RETURN _role::text = ANY(string_to_array(_cached_roles, ','));
END;
$function$;

-- has_any_role
CREATE OR REPLACE FUNCTION public.has_any_role(_user_id uuid, _roles app_role[])
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _guc_name text;
  _cached_roles text;
  _role app_role;
BEGIN
  IF _user_id IS NULL THEN
    RETURN false;
  END IF;

  _guc_name := 'app.roles_for_user_' || replace(_user_id::text, '-', '_');
  _cached_roles := current_setting(_guc_name, true);
  
  IF _cached_roles IS NOT NULL THEN
    IF _cached_roles = '' THEN
      RETURN false;
    END IF;
    FOREACH _role IN ARRAY _roles LOOP
      IF _role::text = ANY(string_to_array(_cached_roles, ',')) THEN
        RETURN true;
      END IF;
    END LOOP;
    RETURN false;
  END IF;

  SELECT string_agg(role::text, ',') INTO _cached_roles
  FROM public.user_roles
  WHERE user_id = _user_id
    AND tenant_id = public.tenant_id_for_user(_user_id);

  IF _cached_roles IS NOT NULL THEN
    PERFORM set_config(_guc_name, _cached_roles, true);
  ELSE
    PERFORM set_config(_guc_name, '', true);
    _cached_roles := '';
  END IF;

  FOREACH _role IN ARRAY _roles LOOP
    IF _role::text = ANY(string_to_array(_cached_roles, ',')) THEN
      RETURN true;
    END IF;
  END LOOP;
  
  RETURN false;
END;
$function$;

-- get_user_role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id uuid)
 RETURNS app_role
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _guc_name text;
  _cached_roles text;
  _role_list text[];
BEGIN
  IF _user_id IS NULL THEN
    RETURN NULL;
  END IF;

  _guc_name := 'app.roles_for_user_' || replace(_user_id::text, '-', '_');
  _cached_roles := current_setting(_guc_name, true);
  
  IF _cached_roles IS NOT NULL AND _cached_roles <> '' THEN
    _role_list := string_to_array(_cached_roles, ',');
    IF array_length(_role_list, 1) > 0 THEN
      RETURN _role_list[1]::app_role;
    END IF;
    RETURN NULL;
  END IF;

  SELECT string_agg(role::text, ',') INTO _cached_roles
  FROM (
    SELECT role FROM public.user_roles
    WHERE user_id = _user_id
      AND tenant_id = public.tenant_id_for_user(_user_id)
    ORDER BY public.role_hierarchy_level(role) DESC
  ) sub;

  IF _cached_roles IS NOT NULL THEN
    PERFORM set_config(_guc_name, _cached_roles, true);
    _role_list := string_to_array(_cached_roles, ',');
    RETURN _role_list[1]::app_role;
  ELSE
    PERFORM set_config(_guc_name, '', true);
    RETURN NULL;
  END IF;
END;
$function$;

-- is_platform_admin
CREATE OR REPLACE FUNCTION public.is_platform_admin(uid uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _guc_name text;
  _cached_val text;
  _is_admin boolean;
BEGIN
  IF uid IS NULL THEN
    RETURN false;
  END IF;

  _guc_name := 'app.is_platform_admin_' || replace(uid::text, '-', '_');
  _cached_val := current_setting(_guc_name, true);
  
  IF _cached_val IS NOT NULL AND _cached_val <> '' THEN
    RETURN _cached_val = 'true';
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM public.platform_admins WHERE user_id = uid
  ) INTO _is_admin;

  PERFORM set_config(_guc_name, case when _is_admin then 'true' else 'false' end, true);

  RETURN _is_admin;
END;
$function$;
