-- Migration: Revert GUC Caching in RLS Helpers
-- Created: 2026-05-23
-- Description: Reverts the namespaced GUC session-caching in security helpers due to transaction pooler leaks and RLS 403 Forbidden violations.

-- 1. tenant_id_for_user
CREATE OR REPLACE FUNCTION public.tenant_id_for_user(_user_id uuid)
 RETURNS uuid
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _tenant_id uuid;
BEGIN
  IF _user_id IS NULL THEN
    RETURN NULL;
  END IF;

  SELECT tenant_id INTO _tenant_id
  FROM public.profiles
  WHERE id = _user_id;

  RETURN _tenant_id;
END;
$function$;

-- 2. has_role
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _has_role boolean;
BEGIN
  IF _user_id IS NULL THEN
    RETURN false;
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id
      AND tenant_id = public.tenant_id_for_user(_user_id)
      AND role = _role
  ) INTO _has_role;

  RETURN _has_role;
END;
$function$;

-- 3. has_any_role
CREATE OR REPLACE FUNCTION public.has_any_role(_user_id uuid, _roles app_role[])
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _role app_role;
  _user_roles text[];
BEGIN
  IF _user_id IS NULL THEN
    RETURN false;
  END IF;

  SELECT array_agg(role::text) INTO _user_roles
  FROM public.user_roles
  WHERE user_id = _user_id
    AND tenant_id = public.tenant_id_for_user(_user_id);

  IF _user_roles IS NULL THEN
    RETURN false;
  END IF;

  FOREACH _role IN ARRAY _roles LOOP
    IF _role::text = ANY(_user_roles) THEN
      RETURN true;
    END IF;
  END LOOP;
  
  RETURN false;
END;
$function$;

-- 4. get_user_role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id uuid)
 RETURNS app_role
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _role app_role;
BEGIN
  IF _user_id IS NULL THEN
    RETURN NULL;
  END IF;

  SELECT role INTO _role
  FROM public.user_roles
  WHERE user_id = _user_id
    AND tenant_id = public.tenant_id_for_user(_user_id)
  ORDER BY public.role_hierarchy_level(role) DESC
  LIMIT 1;

  RETURN _role;
END;
$function$;

-- 5. is_platform_admin
CREATE OR REPLACE FUNCTION public.is_platform_admin(uid uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _is_admin boolean;
BEGIN
  IF uid IS NULL THEN
    RETURN false;
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM public.platform_admins WHERE user_id = uid
  ) INTO _is_admin;

  RETURN _is_admin;
END;
$function$;
