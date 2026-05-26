-- ============ ENUMS ============
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('owner','manager','senior_editor','content_creator','editor','moderator','closer','client');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE public.account_status AS ENUM ('active','paused','churned','trial','onboarding');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE public.content_priority AS ENUM ('low','medium','high','urgent');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE public.notification_priority AS ENUM ('low','normal','high','urgent');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE public.notification_type AS ENUM ('info','success','warning','error','mention','task','approval');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE public.project_cadence AS ENUM ('one_time','weekly','biweekly','monthly','quarterly','custom');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE public.project_status AS ENUM ('not_started','in_progress','review','completed','on_hold','cancelled');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE public.upload_status AS ENUM ('pending','uploading','processing','complete','failed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE public.workspace_type AS ENUM ('individual','team','agency','enterprise');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============ TABLES ============
CREATE TABLE public.tenants (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL,
  logo_url text,
  brand_colors jsonb DEFAULT '{}'::jsonb,
  plan text DEFAULT 'free'::text,
  settings jsonb DEFAULT '{}'::jsonb,
  domain text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  archived_at timestamp with time zone,
  CONSTRAINT tenants_pkey PRIMARY KEY (id),
  CONSTRAINT tenants_slug_key UNIQUE (slug)
);

CREATE TABLE public.profiles (
  id uuid NOT NULL,
  tenant_id uuid,
  full_name text,
  display_name text,
  avatar_url text,
  email text,
  phone text,
  timezone text DEFAULT 'UTC'::text,
  preferences jsonb DEFAULT '{}'::jsonb,
  onboarding_completed boolean DEFAULT false,
  last_seen_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT profiles_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE SET NULL
);

CREATE TABLE public.user_roles (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL DEFAULT 'client'::public.app_role,
  tenant_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT user_roles_pkey PRIMARY KEY (id),
  CONSTRAINT uq_user_roles_user_tenant UNIQUE (user_id, tenant_id),
  CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT user_roles_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE
);

-- ============ HELPER FUNCTIONS (after profiles+user_roles exist) ============
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE OR REPLACE FUNCTION public.has_any_role(_user_id uuid, _roles public.app_role[])
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = ANY(_roles));
$$;

CREATE OR REPLACE FUNCTION public.is_owner_or_manager(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.has_any_role(_user_id, ARRAY['owner','manager']::public.app_role[]);
$$;

CREATE OR REPLACE FUNCTION public.tenant_id_for_user(_user_id uuid)
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT tenant_id FROM public.profiles WHERE id = _user_id LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.role_hierarchy_level(_role public.app_role)
RETURNS int LANGUAGE sql IMMUTABLE AS $$
  SELECT CASE _role
    WHEN 'owner' THEN 5
    WHEN 'manager' THEN 4
    WHEN 'senior_editor' THEN 3
    WHEN 'content_creator' THEN 3
    WHEN 'editor' THEN 2
    WHEN 'moderator' THEN 2
    WHEN 'closer' THEN 2
    WHEN 'client' THEN 1
  END;
$$;

-- ============ REMAINING TABLES ============
CREATE TABLE public.activity_log (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid NOT NULL,
  changes jsonb DEFAULT '{}'::jsonb,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT activity_log_pkey PRIMARY KEY (id)
);

CREATE TABLE public.ai_prompts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  slug text NOT NULL,
  title text NOT NULL,
  system_prompt text NOT NULL,
  model text DEFAULT 'openai/gpt-5-mini'::text,
  temperature numeric DEFAULT 0.3,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT ai_prompts_pkey PRIMARY KEY (id),
  CONSTRAINT ai_prompts_tenant_id_slug_key UNIQUE (tenant_id, slug)
);

CREATE TABLE public.crm_companies (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  name text NOT NULL,
  domain text,
  description text,
  categories text[] DEFAULT '{}'::text[],
  social_links jsonb DEFAULT '{}'::jsonb,
  team_phone text,
  team_country text,
  last_interaction_at timestamp with time zone,
  attio_record_id text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT crm_companies_pkey PRIMARY KEY (id),
  CONSTRAINT crm_companies_attio_record_id_key UNIQUE (attio_record_id)
);

CREATE TABLE public.crm_people (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  email text,
  phone text,
  invalid_phone_note text,
  job_title text,
  company_id uuid REFERENCES public.crm_companies(id),
  company_name text,
  social_link text,
  instagram text,
  facebook text,
  location text,
  country text,
  city text,
  deal_stage text,
  income_range text,
  goal text,
  obstacle text,
  fit text,
  interested_in text,
  payment_link text,
  client_status text,
  assigned_to uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  first_calendar_at timestamp with time zone,
  last_calendar_at timestamp with time zone,
  source text DEFAULT 'manual'::text,
  description text,
  notes text,
  active boolean DEFAULT true,
  attio_record_id text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT crm_people_pkey PRIMARY KEY (id),
  CONSTRAINT crm_people_attio_record_id_key UNIQUE (attio_record_id)
);

CREATE TABLE public.clients (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text,
  phone text,
  logo_url text,
  workspace_type public.workspace_type NOT NULL DEFAULT 'individual'::public.workspace_type,
  account_status public.account_status NOT NULL DEFAULT 'onboarding'::public.account_status,
  workspace_token text DEFAULT (gen_random_uuid())::text,
  token_expires_at timestamp with time zone,
  token_created_at timestamp with time zone DEFAULT now(),
  token_last_accessed_at timestamp with time zone,
  industry text,
  company text,
  job_title text,
  description text,
  location text,
  videos_per_month integer,
  default_aspect_ratio text DEFAULT '9:16'::text,
  start_date date DEFAULT CURRENT_DATE,
  social_links jsonb DEFAULT '{}'::jsonb,
  onboarding_completed boolean DEFAULT false,
  onboarding_completed_at timestamp with time zone,
  branding_deck_url text,
  branding_deck_approved boolean,
  color_palette text[] DEFAULT '{}'::text[],
  connected_accounts jsonb DEFAULT '{}'::jsonb,
  analytics_enabled boolean DEFAULT false,
  person_id uuid REFERENCES public.crm_people(id),
  deal_owner_id uuid REFERENCES public.profiles(id),
  stripe_customer_id text,
  notes text,
  settings jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  archived_at timestamp with time zone,
  CONSTRAINT clients_pkey PRIMARY KEY (id),
  CONSTRAINT clients_workspace_token_key UNIQUE (workspace_token)
);

CREATE TABLE public.client_access (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT client_access_pkey PRIMARY KEY (id),
  CONSTRAINT client_access_user_id_client_id_key UNIQUE (user_id, client_id)
);

CREATE TABLE public.client_team_assignments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  assigned_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT client_team_assignments_pkey PRIMARY KEY (id),
  CONSTRAINT client_team_assignments_user_id_client_id_key UNIQUE (user_id, client_id)
);

CREATE TABLE public.client_members (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  name text NOT NULL,
  email text,
  role_title text,
  is_workspace_owner boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT client_members_pkey PRIMARY KEY (id)
);

CREATE TABLE public.client_foundation (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  foundation jsonb NOT NULL DEFAULT '{}'::jsonb,
  bios jsonb NOT NULL DEFAULT '[]'::jsonb,
  audience_avatars jsonb NOT NULL DEFAULT '[]'::jsonb,
  pillars jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT client_foundation_pkey PRIMARY KEY (id),
  CONSTRAINT client_foundation_client_id_key UNIQUE (client_id)
);

CREATE TABLE public.client_invitations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  email text NOT NULL,
  name text,
  token text NOT NULL DEFAULT (gen_random_uuid())::text,
  invited_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'pending'::text,
  accepted_at timestamp with time zone,
  expires_at timestamp with time zone NOT NULL DEFAULT (now() + '7 days'::interval),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT client_invitations_pkey PRIMARY KEY (id),
  CONSTRAINT client_invitations_token_key UNIQUE (token)
);

CREATE TABLE public.client_journey_steps (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  step_key text NOT NULL,
  step_label text NOT NULL,
  status text DEFAULT 'pending'::text,
  completed_at timestamp with time zone,
  metadata jsonb DEFAULT '{}'::jsonb,
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT client_journey_steps_pkey PRIMARY KEY (id),
  CONSTRAINT client_journey_steps_client_id_step_key_key UNIQUE (client_id, step_key)
);

CREATE TABLE public.client_onboarding (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  answers jsonb NOT NULL DEFAULT '{}'::jsonb,
  completed boolean DEFAULT false,
  completed_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT client_onboarding_pkey PRIMARY KEY (id),
  CONSTRAINT client_onboarding_client_id_key UNIQUE (client_id)
);

CREATE TABLE public.project_type_templates (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  slug text NOT NULL,
  display_name text NOT NULL,
  description text,
  default_video_count integer DEFAULT 0,
  default_cadence public.project_cadence DEFAULT 'one_time'::public.project_cadence,
  default_posting_days text[] DEFAULT '{}'::text[],
  icon text,
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT project_type_templates_pkey PRIMARY KEY (id),
  CONSTRAINT project_type_templates_tenant_id_slug_key UNIQUE (tenant_id, slug)
);

CREATE TABLE public.projects (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  project_type_template_id uuid REFERENCES public.project_type_templates(id),
  project_name text NOT NULL,
  status public.project_status NOT NULL DEFAULT 'not_started'::public.project_status,
  video_count integer NOT NULL DEFAULT 0,
  videos_completed integer NOT NULL DEFAULT 0,
  progress numeric DEFAULT 0,
  cadence public.project_cadence NOT NULL DEFAULT 'one_time'::public.project_cadence,
  posting_days text[] DEFAULT '{}'::text[],
  start_date date NOT NULL DEFAULT CURRENT_DATE,
  end_date date,
  current_cycle integer NOT NULL DEFAULT 1,
  cycle_completed_at timestamp with time zone,
  notes text,
  raw_footage_notes text,
  sort_preference text DEFAULT 'post_date_asc'::text,
  settings jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  archived_at timestamp with time zone,
  CONSTRAINT projects_pkey PRIMARY KEY (id)
);

CREATE TABLE public.cycles (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  name text NOT NULL,
  cycle_number integer NOT NULL DEFAULT 1,
  order_index integer NOT NULL DEFAULT 0,
  is_backlog boolean DEFAULT false,
  start_date date,
  end_date date,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT cycles_pkey PRIMARY KEY (id),
  CONSTRAINT cycles_project_id_name_key UNIQUE (project_id, name)
);

CREATE TABLE public.statuses (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  slug text NOT NULL,
  display_name text NOT NULL,
  color text DEFAULT '#6B7280'::text,
  sort_order integer NOT NULL DEFAULT 0,
  is_client_visible boolean DEFAULT false,
  is_default boolean DEFAULT false,
  description text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT statuses_pkey PRIMARY KEY (id),
  CONSTRAINT uq_statuses_tenant_slug UNIQUE (tenant_id, slug)
);

CREATE TABLE public.video_types (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  slug text NOT NULL,
  display_name text NOT NULL,
  icon text,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT video_types_pkey PRIMARY KEY (id),
  CONSTRAINT uq_video_types_tenant_slug UNIQUE (tenant_id, slug)
);

CREATE TABLE public.videos (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  project_id uuid REFERENCES public.projects(id) ON DELETE SET NULL,
  cycle_id uuid REFERENCES public.cycles(id) ON DELETE SET NULL,
  video_title text NOT NULL,
  status_id uuid REFERENCES public.statuses(id),
  video_type_id uuid REFERENCES public.video_types(id),
  priority public.content_priority NOT NULL DEFAULT 'medium'::public.content_priority,
  post_date date,
  order_index integer DEFAULT 0,
  video_cloudflare_id text,
  video_playback_url text,
  video_thumbnail_url text,
  video_file_name text,
  video_file_size bigint,
  video_duration integer,
  video_width integer,
  video_height integer,
  aspect_ratio text DEFAULT '9:16'::text,
  video_original_url text,
  video_original_storage_path text,
  video_upload_status public.upload_status DEFAULT 'pending'::public.upload_status,
  video_upload_progress integer DEFAULT 0,
  video_error_message text,
  video_uploaded_at timestamp with time zone,
  video_uploaded_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  thumbnail_storage_path text,
  thumbnail_text text,
  caption text,
  caption_approved boolean DEFAULT false,
  caption_context text,
  text_hook text,
  freebie_word text,
  freebie_content text,
  transcript text,
  transcription_status text DEFAULT 'pending'::text,
  detected_language text,
  trial_date text,
  notes text,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  archived_at timestamp with time zone,
  CONSTRAINT videos_pkey PRIMARY KEY (id)
);

CREATE TABLE public.video_versions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  video_id uuid NOT NULL REFERENCES public.videos(id) ON DELETE CASCADE,
  version_number integer NOT NULL DEFAULT 1,
  version_type text NOT NULL DEFAULT 'intermediate'::text,
  custom_version_label text,
  is_current boolean DEFAULT true,
  video_cloudflare_id text,
  video_playback_url text,
  video_thumbnail_url text,
  video_file_name text,
  video_file_size bigint,
  video_duration integer,
  video_width integer,
  video_height integer,
  video_original_url text,
  video_original_storage_path text,
  video_upload_status public.upload_status DEFAULT 'pending'::public.upload_status,
  video_upload_progress integer DEFAULT 0,
  version_notes text,
  transcript text,
  uploaded_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  uploaded_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT video_versions_pkey PRIMARY KEY (id),
  CONSTRAINT video_versions_video_id_version_number_key UNIQUE (video_id, version_number)
);

CREATE TABLE public.video_editors (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  editor_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id uuid REFERENCES public.clients(id) ON DELETE CASCADE,
  project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE,
  video_id uuid REFERENCES public.videos(id) ON DELETE CASCADE,
  assigned_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT video_editors_pkey PRIMARY KEY (id),
  CONSTRAINT video_editors_editor_id_client_id_project_id_video_id_key UNIQUE (editor_id, client_id, project_id, video_id)
);

CREATE TABLE public.trial_reels (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  video_id uuid NOT NULL REFERENCES public.videos(id) ON DELETE CASCADE,
  version_id uuid REFERENCES public.video_versions(id),
  trial_number integer NOT NULL DEFAULT 1,
  hook_description text,
  trial_date date,
  is_active boolean DEFAULT true,
  is_winner boolean DEFAULT false,
  hook_cloudflare_id text,
  hook_playback_url text,
  hook_thumbnail_url text,
  hook_duration integer,
  hook_file_name text,
  hook_file_size bigint,
  hook_upload_status public.upload_status DEFAULT 'pending'::public.upload_status,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT trial_reels_pkey PRIMARY KEY (id),
  CONSTRAINT trial_reels_video_id_trial_number_key UNIQUE (video_id, trial_number)
);

CREATE TABLE public.thumbnail_versions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  video_id uuid NOT NULL REFERENCES public.videos(id) ON DELETE CASCADE,
  version_number integer NOT NULL DEFAULT 1,
  thumbnail_url text NOT NULL,
  thumbnail_storage_path text NOT NULL,
  is_current boolean DEFAULT false,
  version_notes text,
  uploaded_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  uploaded_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT thumbnail_versions_pkey PRIMARY KEY (id)
);

CREATE TABLE public.video_comments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  video_id uuid NOT NULL REFERENCES public.videos(id) ON DELETE CASCADE,
  version_id uuid REFERENCES public.video_versions(id),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  parent_comment_id uuid,
  comment text NOT NULL,
  comment_type text DEFAULT 'review'::text,
  timestamp_seconds numeric,
  timestamp_end_seconds numeric,
  status text NOT NULL DEFAULT 'active'::text,
  resolved_at timestamp with time zone,
  resolved_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  is_internal boolean DEFAULT false,
  guest_name text,
  guest_email text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT video_comments_pkey PRIMARY KEY (id),
  CONSTRAINT video_comments_parent_comment_id_fkey FOREIGN KEY (parent_comment_id) REFERENCES public.video_comments(id) ON DELETE CASCADE
);

CREATE TABLE public.comment_attachments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  comment_id uuid NOT NULL REFERENCES public.video_comments(id) ON DELETE CASCADE,
  storage_path text NOT NULL,
  file_name text NOT NULL,
  file_size bigint,
  content_type text NOT NULL,
  uploaded_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  expires_at timestamp with time zone NOT NULL DEFAULT (now() + '14 days'::interval),
  CONSTRAINT comment_attachments_pkey PRIMARY KEY (id)
);

CREATE TABLE public.video_annotations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  video_id uuid NOT NULL REFERENCES public.videos(id) ON DELETE CASCADE,
  version_id uuid REFERENCES public.video_versions(id),
  comment_id uuid REFERENCES public.video_comments(id) ON DELETE CASCADE,
  annotation_data jsonb NOT NULL,
  frame_timestamp numeric NOT NULL,
  frame_thumbnail text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT video_annotations_pkey PRIMARY KEY (id)
);

CREATE TABLE public.video_status_history (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  video_id uuid NOT NULL REFERENCES public.videos(id) ON DELETE CASCADE,
  old_status text,
  new_status text NOT NULL,
  changed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  changed_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT video_status_history_pkey PRIMARY KEY (id)
);

CREATE TABLE public.chat_rooms (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  room_type text NOT NULL DEFAULT 'workspace'::text,
  name text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT chat_rooms_pkey PRIMARY KEY (id)
);

CREATE TABLE public.chat_threads (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  room_id uuid NOT NULL REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT 'General'::text,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT chat_threads_pkey PRIMARY KEY (id)
);

CREATE TABLE public.chat_messages (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  thread_id uuid NOT NULL REFERENCES public.chat_threads(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  content text,
  message_type text NOT NULL DEFAULT 'text'::text,
  attachments jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_edited boolean NOT NULL DEFAULT false,
  is_deleted boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT chat_messages_pkey PRIMARY KEY (id)
);

CREATE TABLE public.chat_mentions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  message_id uuid NOT NULL REFERENCES public.chat_messages(id) ON DELETE CASCADE,
  mentioned_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  is_read boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT chat_mentions_pkey PRIMARY KEY (id)
);

CREATE TABLE public.chat_mutes (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  room_id uuid NOT NULL REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  muted_until timestamp with time zone,
  notify_on_mention boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT chat_mutes_pkey PRIMARY KEY (user_id, room_id)
);

CREATE OR REPLACE FUNCTION public.user_can_access_chat_room(_user_id uuid, _room_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.chat_rooms cr
    WHERE cr.id = _room_id
      AND (
        (cr.tenant_id = public.tenant_id_for_user(_user_id) AND public.has_any_role(_user_id, ARRAY['owner','manager','senior_editor','content_creator','editor','moderator','closer']::public.app_role[]))
        OR cr.client_id IN (SELECT client_id FROM public.client_access WHERE user_id = _user_id)
      )
  );
$$;

CREATE TABLE public.guest_review_links (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  video_id uuid REFERENCES public.videos(id) ON DELETE CASCADE,
  project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE,
  token text NOT NULL DEFAULT (gen_random_uuid())::text,
  created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewer_name text,
  reviewer_email text,
  expires_at timestamp with time zone NOT NULL DEFAULT (now() + '7 days'::interval),
  max_uses integer DEFAULT 0,
  use_count integer DEFAULT 0,
  is_active boolean DEFAULT true,
  permissions jsonb DEFAULT '{"can_approve": false, "can_comment": true, "can_annotate": true}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT guest_review_links_pkey PRIMARY KEY (id),
  CONSTRAINT guest_review_links_token_key UNIQUE (token)
);

CREATE TABLE public.notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  type public.notification_type NOT NULL DEFAULT 'info'::public.notification_type,
  priority public.notification_priority NOT NULL DEFAULT 'normal'::public.notification_priority,
  read boolean NOT NULL DEFAULT false,
  link text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT notifications_pkey PRIMARY KEY (id)
);

CREATE TABLE public.notification_preferences (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  notification_type text NOT NULL,
  email_enabled boolean NOT NULL DEFAULT true,
  push_enabled boolean NOT NULL DEFAULT true,
  in_app_enabled boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT notification_preferences_pkey PRIMARY KEY (id),
  CONSTRAINT notification_preferences_user_id_notification_type_key UNIQUE (user_id, notification_type)
);

CREATE TABLE public.push_subscriptions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  endpoint text NOT NULL,
  subscription jsonb NOT NULL,
  device_label text,
  last_seen_at timestamp with time zone DEFAULT now(),
  last_push_at timestamp with time zone,
  last_push_status text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT push_subscriptions_pkey PRIMARY KEY (id),
  CONSTRAINT push_subscriptions_user_id_endpoint_key UNIQUE (user_id, endpoint)
);

CREATE TABLE public.deal_stages (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  slug text NOT NULL,
  display_name text NOT NULL,
  color text DEFAULT '#6B7280'::text,
  sort_order integer NOT NULL DEFAULT 0,
  is_auto_trigger boolean DEFAULT false,
  trigger_action text,
  probability integer DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT deal_stages_pkey PRIMARY KEY (id),
  CONSTRAINT uq_deal_stages_tenant_slug UNIQUE (tenant_id, slug)
);

CREATE TABLE public.crm_deals (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  person_id uuid REFERENCES public.crm_people(id),
  name text NOT NULL,
  stage_id uuid REFERENCES public.deal_stages(id),
  stage text NOT NULL DEFAULT 'no_stage'::text,
  stage_order integer DEFAULT 0,
  plan text,
  total_videos numeric,
  payment_method text,
  deal_owner text,
  region text DEFAULT 'UAE & Gulf'::text,
  next_due_date timestamp with time zone,
  attio_record_id text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT crm_deals_pkey PRIMARY KEY (id),
  CONSTRAINT crm_deals_attio_record_id_key UNIQUE (attio_record_id)
);

CREATE TABLE public.crm_deal_options (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  category text NOT NULL,
  value text NOT NULL,
  label text NOT NULL,
  color text,
  order_index integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT crm_deal_options_pkey PRIMARY KEY (id),
  CONSTRAINT crm_deal_options_tenant_id_category_value_key UNIQUE (tenant_id, category, value)
);

CREATE TABLE public.crm_editors (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  person_id uuid REFERENCES public.crm_people(id),
  full_name text NOT NULL,
  email text,
  phone text,
  location text,
  portfolio_url text,
  sample_link_url text,
  video_intro_url text,
  resume_url text,
  languages text[] DEFAULT '{}'::text[],
  software_fluency text[] DEFAULT '{}'::text[],
  role_applied text,
  notes text,
  submission_date timestamp with time zone,
  metadata jsonb DEFAULT '{}'::jsonb,
  attio_record_id text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT crm_editors_pkey PRIMARY KEY (id),
  CONSTRAINT crm_editors_attio_record_id_key UNIQUE (attio_record_id)
);

CREATE TABLE public.leads (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  person_id uuid REFERENCES public.crm_people(id),
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text NOT NULL,
  phone text,
  social_username text,
  business_type text,
  monthly_income_range text,
  goals_objectives text,
  obstacles text,
  call_attendance_confirmation boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'new'::text,
  assigned_to uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  notes text,
  raw_payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  follow_up_at timestamp with time zone,
  country text,
  content_language text,
  is_qualified boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT leads_pkey PRIMARY KEY (id)
);

CREATE TABLE public.leads_custom_columns (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  column_name text NOT NULL,
  column_type text NOT NULL DEFAULT 'text'::text,
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT leads_custom_columns_pkey PRIMARY KEY (id)
);

CREATE TABLE public.leads_saved_views (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  view_name text NOT NULL,
  column_config jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_default boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT leads_saved_views_pkey PRIMARY KEY (id)
);

CREATE TABLE public.follow_ups (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  person_id uuid REFERENCES public.crm_people(id),
  lead_id uuid REFERENCES public.leads(id),
  assigned_to uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  title text NOT NULL,
  notes text,
  due_at timestamp with time zone NOT NULL,
  status text DEFAULT 'pending'::text,
  priority text DEFAULT 'medium'::text,
  completed_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT follow_ups_pkey PRIMARY KEY (id)
);

CREATE TABLE public.calendly_events (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  person_id uuid REFERENCES public.crm_people(id),
  lead_id uuid REFERENCES public.leads(id),
  sales_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  calendly_event_uri text NOT NULL,
  event_type_name text,
  start_time timestamp with time zone NOT NULL,
  end_time timestamp with time zone NOT NULL,
  status text NOT NULL DEFAULT 'active'::text,
  invitee_name text,
  invitee_email text,
  invitee_phone text,
  reschedule_url text,
  questions_and_answers jsonb DEFAULT '[]'::jsonb,
  location_info jsonb,
  cancellation jsonb,
  raw_payload jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT calendly_events_pkey PRIMARY KEY (id),
  CONSTRAINT calendly_events_calendly_event_uri_key UNIQUE (calendly_event_uri)
);

CREATE TABLE public.partnership_applications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  person_id uuid REFERENCES public.crm_people(id),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  location text,
  languages text,
  role text,
  target_audience text,
  experience_years text,
  portfolio_link text,
  best_pieces text,
  client_accounts text,
  has_paying_clients boolean DEFAULT false,
  has_sold_service boolean DEFAULT false,
  sold_service_explanation text,
  status text NOT NULL DEFAULT 'new'::text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT partnership_applications_pkey PRIMARY KEY (id)
);

CREATE TABLE public.closer_regions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  region_name text NOT NULL,
  countries text[] NOT NULL DEFAULT '{}'::text[],
  calendly_api_key text,
  calendly_webhook_uri text,
  calendar_event_filter text DEFAULT '30 Mins Discovery Call'::text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT closer_regions_pkey PRIMARY KEY (id),
  CONSTRAINT closer_regions_user_id_key UNIQUE (user_id)
);

CREATE TABLE public.email_templates (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  slug text NOT NULL,
  name text NOT NULL,
  subject text NOT NULL,
  body_html text NOT NULL,
  variables text[] DEFAULT '{}'::text[],
  is_active boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  category text,
  headline text,
  body text,
  cta_text text,
  cta_url text,
  preview_text text,
  edit_mode text NOT NULL DEFAULT 'visual'::text,
  CONSTRAINT email_templates_pkey PRIMARY KEY (id),
  CONSTRAINT email_templates_tenant_id_slug_key UNIQUE (tenant_id, slug)
);

CREATE TABLE public.email_queue (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  template_id uuid REFERENCES public.email_templates(id),
  to_email text NOT NULL,
  to_name text,
  subject text NOT NULL,
  body_html text NOT NULL,
  status text NOT NULL DEFAULT 'pending'::text,
  sent_at timestamp with time zone,
  error text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT email_queue_pkey PRIMARY KEY (id)
);

CREATE TABLE public.email_campaigns (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  subject text NOT NULL,
  headline text,
  body text NOT NULL,
  cta_text text,
  cta_url text,
  audience text NOT NULL,
  recipient_count integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'sent'::text,
  sent_at timestamp with time zone,
  scheduled_for timestamp with time zone,
  rendered_html text,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT email_campaigns_pkey PRIMARY KEY (id)
);

CREATE TABLE public.email_campaign_recipients (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  campaign_id uuid NOT NULL REFERENCES public.email_campaigns(id) ON DELETE CASCADE,
  email text NOT NULL,
  name text,
  status text NOT NULL DEFAULT 'queued'::text,
  error text,
  sent_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT email_campaign_recipients_pkey PRIMARY KEY (id)
);

CREATE TABLE public.stripe_charges (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  stripe_charge_id text NOT NULL,
  client_id uuid REFERENCES public.clients(id) ON DELETE SET NULL,
  customer_email text,
  stripe_customer_id text,
  amount integer NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'usd'::text,
  status text NOT NULL DEFAULT 'pending'::text,
  fee integer NOT NULL DEFAULT 0,
  net integer NOT NULL DEFAULT 0,
  description text,
  stripe_created_at timestamp with time zone,
  synced_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT stripe_charges_pkey PRIMARY KEY (id),
  CONSTRAINT stripe_charges_stripe_charge_id_key UNIQUE (stripe_charge_id)
);

CREATE TABLE public.stripe_subscriptions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  stripe_subscription_id text NOT NULL,
  stripe_customer_id text,
  client_id uuid REFERENCES public.clients(id) ON DELETE SET NULL,
  customer_email text,
  status text NOT NULL DEFAULT 'active'::text,
  plan_name text,
  amount integer NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'usd'::text,
  "interval" text NOT NULL DEFAULT 'month'::text,
  current_period_start timestamp with time zone,
  current_period_end timestamp with time zone,
  canceled_at timestamp with time zone,
  stripe_created_at timestamp with time zone,
  synced_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT stripe_subscriptions_pkey PRIMARY KEY (id),
  CONSTRAINT stripe_subscriptions_stripe_subscription_id_key UNIQUE (stripe_subscription_id)
);

CREATE TABLE public.stripe_events_log (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  stripe_event_id text NOT NULL,
  event_type text NOT NULL,
  processed_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT stripe_events_log_pkey PRIMARY KEY (id),
  CONSTRAINT stripe_events_log_stripe_event_id_key UNIQUE (stripe_event_id)
);

CREATE TABLE public.finance_transactions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  client_id uuid REFERENCES public.clients(id) ON DELETE SET NULL,
  amount numeric NOT NULL,
  currency text NOT NULL DEFAULT 'usd'::text,
  transaction_type text NOT NULL,
  category text,
  payment_status text NOT NULL DEFAULT 'pending'::text,
  payment_date date,
  payment_method text,
  stripe_payment_id text,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT finance_transactions_pkey PRIMARY KEY (id)
);

CREATE TABLE public.studio_scripts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  title text NOT NULL,
  body text,
  video_type text,
  status text DEFAULT 'draft'::text,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT studio_scripts_pkey PRIMARY KEY (id)
);

CREATE TABLE public.studio_hooks (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  hook_text text NOT NULL,
  category text,
  source text DEFAULT 'manual'::text,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT studio_hooks_pkey PRIMARY KEY (id)
);

CREATE TABLE public.content_vault (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text,
  category text,
  tags text[] DEFAULT '{}'::text[],
  source_url text,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT content_vault_pkey PRIMARY KEY (id)
);

CREATE TABLE public.credentials (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  client_id uuid REFERENCES public.clients(id) ON DELETE CASCADE,
  title text NOT NULL,
  username text,
  password text,
  url text,
  notes text,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT credentials_pkey PRIMARY KEY (id)
);

CREATE TABLE public.tasks (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  assigned_to uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text,
  status text DEFAULT 'todo'::text,
  priority text DEFAULT 'medium'::text,
  due_date timestamp with time zone,
  linked_entity_type text,
  linked_entity_id uuid,
  completed_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT tasks_pkey PRIMARY KEY (id)
);

CREATE TABLE public.custom_columns (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE,
  column_name text NOT NULL,
  column_type text NOT NULL DEFAULT 'text'::text,
  options jsonb,
  default_value text,
  is_required boolean DEFAULT false,
  show_in_table boolean DEFAULT true,
  show_in_new_form boolean DEFAULT true,
  show_in_edit_form boolean DEFAULT true,
  allow_inline_edit boolean DEFAULT true,
  description text,
  width_px integer DEFAULT 150,
  order_index integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT custom_columns_pkey PRIMARY KEY (id)
);

CREATE TABLE public.custom_column_values (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  column_id uuid NOT NULL REFERENCES public.custom_columns(id) ON DELETE CASCADE,
  video_id uuid NOT NULL REFERENCES public.videos(id) ON DELETE CASCADE,
  value text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT custom_column_values_pkey PRIMARY KEY (id),
  CONSTRAINT custom_column_values_column_id_video_id_key UNIQUE (column_id, video_id)
);

CREATE TABLE public.saved_filter_views (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  page text NOT NULL,
  filters jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_default boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT saved_filter_views_pkey PRIMARY KEY (id)
);

CREATE TABLE public.status_role_permissions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  status_id uuid NOT NULL REFERENCES public.statuses(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  can_view boolean DEFAULT true,
  can_set boolean DEFAULT false,
  can_transition_from boolean DEFAULT false,
  can_transition_to boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT status_role_permissions_pkey PRIMARY KEY (id),
  CONSTRAINT uq_status_role_perms UNIQUE (tenant_id, status_id, role)
);

-- ============ INDEXES ============
CREATE INDEX idx_profiles_tenant_id ON public.profiles(tenant_id);
CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_user_roles_user ON public.user_roles(user_id);
CREATE INDEX idx_user_roles_tenant ON public.user_roles(tenant_id);
CREATE INDEX idx_clients_tenant ON public.clients(tenant_id);
CREATE INDEX idx_clients_account_status ON public.clients(account_status);
CREATE INDEX idx_clients_workspace_token ON public.clients(workspace_token);
CREATE INDEX idx_client_access_user ON public.client_access(user_id);
CREATE INDEX idx_client_access_client ON public.client_access(client_id);
CREATE INDEX idx_client_team_assignments_user ON public.client_team_assignments(user_id);
CREATE INDEX idx_client_team_assignments_client ON public.client_team_assignments(client_id);
CREATE INDEX idx_projects_tenant ON public.projects(tenant_id);
CREATE INDEX idx_projects_client ON public.projects(client_id);
CREATE INDEX idx_videos_tenant ON public.videos(tenant_id);
CREATE INDEX idx_videos_client ON public.videos(client_id);
CREATE INDEX idx_videos_project ON public.videos(project_id);
CREATE INDEX idx_video_versions_video ON public.video_versions(video_id);
CREATE INDEX idx_video_comments_video ON public.video_comments(video_id);
CREATE INDEX idx_chat_messages_thread ON public.chat_messages(thread_id);
CREATE INDEX idx_chat_threads_room ON public.chat_threads(room_id);
CREATE INDEX idx_notifications_user ON public.notifications(user_id);
CREATE INDEX idx_notifications_unread ON public.notifications(user_id, created_at DESC) WHERE read = false;
CREATE INDEX idx_crm_people_tenant ON public.crm_people(tenant_id);
CREATE INDEX idx_crm_deals_tenant ON public.crm_deals(tenant_id);
CREATE INDEX idx_leads_tenant ON public.leads(tenant_id);
CREATE INDEX idx_tasks_tenant ON public.tasks(tenant_id);
CREATE INDEX idx_finance_tenant ON public.finance_transactions(tenant_id);

-- ============ ENABLE RLS ============
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendly_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_mentions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_mutes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_foundation ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_journey_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_onboarding ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_team_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.closer_regions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comment_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_vault ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_deal_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_editors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_people ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_column_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_columns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deal_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_campaign_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.finance_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follow_ups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guest_review_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads_custom_columns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads_saved_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partnership_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_type_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_filter_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.status_role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.statuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stripe_charges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stripe_events_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stripe_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.studio_hooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.studio_scripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.thumbnail_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trial_reels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_annotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_editors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;

-- ============ updated_at TRIGGERS ============
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.tenants FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.user_roles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.ai_prompts FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.calendly_events FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.chat_messages FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.chat_rooms FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.chat_threads FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.client_foundation FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.client_journey_steps FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.client_members FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.client_onboarding FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.clients FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.closer_regions FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.content_vault FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.credentials FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.crm_companies FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.crm_deal_options FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.crm_deals FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.crm_editors FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.crm_people FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.custom_column_values FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.custom_columns FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.cycles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.deal_stages FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.email_campaigns FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.email_templates FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.finance_transactions FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.follow_ups FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.leads FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.leads_saved_views FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.notification_preferences FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.partnership_applications FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.project_type_templates FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.push_subscriptions FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.saved_filter_views FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.statuses FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.studio_hooks FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.studio_scripts FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.trial_reels FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.video_annotations FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.video_comments FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.video_types FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.video_versions FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.videos FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ RLS POLICIES (partial - tables not listed get RLS enabled but no policies, so default-deny applies) ============

-- profiles, user_roles, tenants
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (id = auth.uid());
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (id = auth.uid()) WITH CHECK (id = auth.uid());
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (id = auth.uid());
CREATE POLICY "Tenant members can view tenant profiles" ON public.profiles FOR SELECT USING (tenant_id IS NOT NULL AND tenant_id = public.tenant_id_for_user(auth.uid()));

CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Owners can manage roles in tenant" ON public.user_roles FOR ALL USING (tenant_id = public.tenant_id_for_user(auth.uid()) AND public.has_role(auth.uid(),'owner')) WITH CHECK (tenant_id = public.tenant_id_for_user(auth.uid()) AND public.has_role(auth.uid(),'owner'));

CREATE POLICY "Tenant members can view their tenant" ON public.tenants FOR SELECT USING (id = public.tenant_id_for_user(auth.uid()));
CREATE POLICY "Owners can update their tenant" ON public.tenants FOR UPDATE USING (id = public.tenant_id_for_user(auth.uid()) AND public.has_role(auth.uid(),'owner')) WITH CHECK (id = public.tenant_id_for_user(auth.uid()) AND public.has_role(auth.uid(),'owner'));

-- activity_log
CREATE POLICY "Service can insert activity log" ON public.activity_log FOR INSERT WITH CHECK (tenant_id = public.tenant_id_for_user(auth.uid()));
CREATE POLICY "Team leads can view activity log" ON public.activity_log FOR SELECT USING (tenant_id = public.tenant_id_for_user(auth.uid()) AND public.has_any_role(auth.uid(), ARRAY['owner','manager','senior_editor']::public.app_role[]));

-- ai_prompts
CREATE POLICY "Owner can manage AI prompts" ON public.ai_prompts FOR ALL USING (tenant_id = public.tenant_id_for_user(auth.uid()) AND public.has_role(auth.uid(),'owner')) WITH CHECK (tenant_id = public.tenant_id_for_user(auth.uid()) AND public.has_role(auth.uid(),'owner'));
CREATE POLICY "Team can view AI prompts" ON public.ai_prompts FOR SELECT USING (tenant_id = public.tenant_id_for_user(auth.uid()));

-- calendly_events
CREATE POLICY "Closers can view calendly events" ON public.calendly_events FOR SELECT USING (tenant_id = public.tenant_id_for_user(auth.uid()) AND public.has_role(auth.uid(),'closer'));
CREATE POLICY "Team leads can manage calendly events" ON public.calendly_events FOR ALL USING (tenant_id = public.tenant_id_for_user(auth.uid()) AND public.is_owner_or_manager(auth.uid())) WITH CHECK (tenant_id = public.tenant_id_for_user(auth.uid()) AND public.is_owner_or_manager(auth.uid()));

-- chat (mentions, messages, mutes, rooms, threads)
CREATE POLICY "Users can create mentions" ON public.chat_mentions FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.chat_messages cm JOIN public.chat_threads ct ON ct.id = cm.thread_id WHERE cm.id = chat_mentions.message_id AND public.user_can_access_chat_room(auth.uid(), ct.room_id)));
CREATE POLICY "Users can update own mentions" ON public.chat_mentions FOR UPDATE USING (mentioned_user_id = auth.uid()) WITH CHECK (mentioned_user_id = auth.uid());
CREATE POLICY "Users can view mentions in accessible rooms" ON public.chat_mentions FOR SELECT USING (EXISTS (SELECT 1 FROM public.chat_messages cm JOIN public.chat_threads ct ON ct.id = cm.thread_id WHERE cm.id = chat_mentions.message_id AND public.user_can_access_chat_room(auth.uid(), ct.room_id)));

CREATE POLICY "Users can delete own messages" ON public.chat_messages FOR DELETE USING (sender_id = auth.uid());
CREATE POLICY "Users can edit own messages" ON public.chat_messages FOR UPDATE USING (sender_id = auth.uid()) WITH CHECK (sender_id = auth.uid());
CREATE POLICY "Users can send messages in accessible rooms" ON public.chat_messages FOR INSERT WITH CHECK (sender_id = auth.uid() AND EXISTS (SELECT 1 FROM public.chat_threads ct WHERE ct.id = chat_messages.thread_id AND public.user_can_access_chat_room(auth.uid(), ct.room_id)));
CREATE POLICY "Users can view messages in accessible rooms" ON public.chat_messages FOR SELECT USING (EXISTS (SELECT 1 FROM public.chat_threads ct WHERE ct.id = chat_messages.thread_id AND public.user_can_access_chat_room(auth.uid(), ct.room_id)));

CREATE POLICY "Users can manage own mutes" ON public.chat_mutes FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY "Team leads can manage chat rooms" ON public.chat_rooms FOR ALL USING (tenant_id = public.tenant_id_for_user(auth.uid()) AND public.is_owner_or_manager(auth.uid())) WITH CHECK (tenant_id = public.tenant_id_for_user(auth.uid()) AND public.is_owner_or_manager(auth.uid()));
CREATE POLICY "Users can view accessible chat rooms" ON public.chat_rooms FOR SELECT USING (public.user_can_access_chat_room(auth.uid(), id));

CREATE POLICY "Users can create threads in accessible rooms" ON public.chat_threads FOR INSERT WITH CHECK (public.user_can_access_chat_room(auth.uid(), room_id));
CREATE POLICY "Users can view threads in accessible rooms" ON public.chat_threads FOR SELECT USING (public.user_can_access_chat_room(auth.uid(), room_id));

-- client_*
CREATE POLICY "Managers can manage client access" ON public.client_access FOR ALL USING (tenant_id = public.tenant_id_for_user(auth.uid()) AND public.is_owner_or_manager(auth.uid())) WITH CHECK (tenant_id = public.tenant_id_for_user(auth.uid()) AND public.is_owner_or_manager(auth.uid()));
CREATE POLICY "Users can view their own access" ON public.client_access FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Clients can view own foundation" ON public.client_foundation FOR SELECT USING (client_id IN (SELECT client_id FROM public.client_access WHERE user_id = auth.uid()));
CREATE POLICY "Team leads can manage client foundation" ON public.client_foundation FOR ALL USING (tenant_id = public.tenant_id_for_user(auth.uid()) AND public.has_any_role(auth.uid(), ARRAY['owner','manager','senior_editor','content_creator']::public.app_role[])) WITH CHECK (tenant_id = public.tenant_id_for_user(auth.uid()) AND public.has_any_role(auth.uid(), ARRAY['owner','manager','senior_editor','content_creator']::public.app_role[]));

CREATE POLICY "Team leads can manage client invitations" ON public.client_invitations FOR ALL USING (tenant_id = public.tenant_id_for_user(auth.uid()) AND public.has_any_role(auth.uid(), ARRAY['owner','manager','senior_editor']::public.app_role[])) WITH CHECK (tenant_id = public.tenant_id_for_user(auth.uid()) AND public.has_any_role(auth.uid(), ARRAY['owner','manager','senior_editor']::public.app_role[]));

CREATE POLICY "Clients can view own journey" ON public.client_journey_steps FOR SELECT USING (client_id IN (SELECT client_id FROM public.client_access WHERE user_id = auth.uid()));
CREATE POLICY "Team leads can manage journey steps" ON public.client_journey_steps FOR ALL USING (tenant_id = public.tenant_id_for_user(auth.uid()) AND public.has_any_role(auth.uid(), ARRAY['owner','manager','senior_editor']::public.app_role[])) WITH CHECK (tenant_id = public.tenant_id_for_user(auth.uid()) AND public.has_any_role(auth.uid(), ARRAY['owner','manager','senior_editor']::public.app_role[]));

CREATE POLICY "Clients can view their workspace members" ON public.client_members FOR SELECT USING (EXISTS (SELECT 1 FROM public.client_access ca WHERE ca.user_id = auth.uid() AND ca.client_id = client_members.client_id));
CREATE POLICY "Team leads can manage client members" ON public.client_members FOR ALL USING (tenant_id = public.tenant_id_for_user(auth.uid()) AND public.is_owner_or_manager(auth.uid())) WITH CHECK (tenant_id = public.tenant_id_for_user(auth.uid()) AND public.is_owner_or_manager(auth.uid()));

CREATE POLICY "Clients can manage own onboarding" ON public.client_onboarding FOR ALL USING (client_id IN (SELECT client_id FROM public.client_access WHERE user_id = auth.uid())) WITH CHECK (client_id IN (SELECT client_id FROM public.client_access WHERE user_id = auth.uid()));
CREATE POLICY "Team leads can manage client onboarding" ON public.client_onboarding FOR ALL USING (tenant_id = public.tenant_id_for_user(auth.uid()) AND public.has_any_role(auth.uid(), ARRAY['owner','manager','senior_editor']::public.app_role[])) WITH CHECK (tenant_id = public.tenant_id_for_user(auth.uid()) AND public.has_any_role(auth.uid(), ARRAY['owner','manager','senior_editor']::public.app_role[]));

CREATE POLICY "Managers can manage team assignments" ON public.client_team_assignments FOR ALL USING (tenant_id = public.tenant_id_for_user(auth.uid()) AND public.has_any_role(auth.uid(), ARRAY['owner','manager','senior_editor']::public.app_role[])) WITH CHECK (tenant_id = public.tenant_id_for_user(auth.uid()) AND public.has_any_role(auth.uid(), ARRAY['owner','manager','senior_editor']::public.app_role[]));
CREATE POLICY "Users can view their own assignments" ON public.client_team_assignments FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Clients can view their workspace" ON public.clients FOR SELECT USING (EXISTS (SELECT 1 FROM public.client_access ca WHERE ca.user_id = auth.uid() AND ca.client_id = clients.id));
CREATE POLICY "Editors can view assigned workspaces" ON public.clients FOR SELECT USING (tenant_id = public.tenant_id_for_user(auth.uid()) AND EXISTS (SELECT 1 FROM public.client_team_assignments cta WHERE cta.user_id = auth.uid() AND cta.client_id = clients.id));
CREATE POLICY "Team leads can manage workspaces" ON public.clients FOR ALL USING (tenant_id = public.tenant_id_for_user(auth.uid()) AND public.has_any_role(auth.uid(), ARRAY['owner','manager','senior_editor','content_creator']::public.app_role[])) WITH CHECK (tenant_id = public.tenant_id_for_user(auth.uid()) AND public.has_any_role(auth.uid(), ARRAY['owner','manager','senior_editor','content_creator']::public.app_role[]));

CREATE POLICY "Closers can update own region" ON public.closer_regions FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Closers can view own region" ON public.closer_regions FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Team leads can manage closer regions" ON public.closer_regions FOR ALL USING (tenant_id = public.tenant_id_for_user(auth.uid()) AND public.is_owner_or_manager(auth.uid())) WITH CHECK (tenant_id = public.tenant_id_for_user(auth.uid()) AND public.is_owner_or_manager(auth.uid()));

CREATE POLICY "Users can create comment attachments" ON public.comment_attachments FOR INSERT WITH CHECK (uploaded_by = auth.uid());
CREATE POLICY "Users can delete own attachments" ON public.comment_attachments FOR DELETE USING (uploaded_by = auth.uid());
CREATE POLICY "Users can view comment attachments" ON public.comment_attachments FOR SELECT USING (true);

CREATE POLICY "Team can manage content vault" ON public.content_vault FOR ALL USING (tenant_id = public.tenant_id_for_user(auth.uid()) AND public.has_any_role(auth.uid(), ARRAY['owner','manager','senior_editor','content_creator']::public.app_role[])) WITH CHECK (tenant_id = public.tenant_id_for_user(auth.uid()) AND public.has_any_role(auth.uid(), ARRAY['owner','manager','senior_editor','content_creator']::public.app_role[]));

CREATE POLICY "Team leads can manage credentials" ON public.credentials FOR ALL USING (tenant_id = public.tenant_id_for_user(auth.uid()) AND public.has_any_role(auth.uid(), ARRAY['owner','manager','senior_editor','content_creator','editor']::public.app_role[])) WITH CHECK (tenant_id = public.tenant_id_for_user(auth.uid()) AND public.has_any_role(auth.uid(), ARRAY['owner','manager','senior_editor','content_creator','editor']::public.app_role[]));

CREATE POLICY "Closers can manage CRM companies" ON public.crm_companies FOR ALL USING (tenant_id = public.tenant_id_for_user(auth.uid()) AND public.has_role(auth.uid(),'closer')) WITH CHECK (tenant_id = public.tenant_id_for_user(auth.uid()) AND public.has_role(auth.uid(),'closer'));
CREATE POLICY "Team leads can manage CRM companies" ON public.crm_companies FOR ALL USING (tenant_id = public.tenant_id_for_user(auth.uid()) AND public.is_owner_or_manager(auth.uid())) WITH CHECK (tenant_id = public.tenant_id_for_user(auth.uid()) AND public.is_owner_or_manager(auth.uid()));

CREATE POLICY "Team leads can manage deal options" ON public.crm_deal_options FOR ALL USING (tenant_id = public.tenant_id_for_user(auth.uid()) AND public.is_owner_or_manager(auth.uid())) WITH CHECK (tenant_id = public.tenant_id_for_user(auth.uid()) AND public.is_owner_or_manager(auth.uid()));
CREATE POLICY "Tenant users can view deal options" ON public.crm_deal_options FOR SELECT USING (tenant_id = public.tenant_id_for_user(auth.uid()));

CREATE POLICY "Closers can manage CRM deals" ON public.crm_deals FOR ALL USING (tenant_id = public.tenant_id_for_user(auth.uid()) AND public.has_role(auth.uid(),'closer')) WITH CHECK (tenant_id = public.tenant_id_for_user(auth.uid()) AND public.has_role(auth.uid(),'closer'));
CREATE POLICY "Team leads can manage CRM deals" ON public.crm_deals FOR ALL USING (tenant_id = public.tenant_id_for_user(auth.uid()) AND public.is_owner_or_manager(auth.uid())) WITH CHECK (tenant_id = public.tenant_id_for_user(auth.uid()) AND public.is_owner_or_manager(auth.uid()));

CREATE POLICY "Closers can manage CRM editors" ON public.crm_editors FOR ALL USING (tenant_id = public.tenant_id_for_user(auth.uid()) AND public.has_role(auth.uid(),'closer')) WITH CHECK (tenant_id = public.tenant_id_for_user(auth.uid()) AND public.has_role(auth.uid(),'closer'));
CREATE POLICY "Team leads can manage CRM editors" ON public.crm_editors FOR ALL USING (tenant_id = public.tenant_id_for_user(auth.uid()) AND public.is_owner_or_manager(auth.uid())) WITH CHECK (tenant_id = public.tenant_id_for_user(auth.uid()) AND public.is_owner_or_manager(auth.uid()));

CREATE POLICY "Closers can manage CRM people" ON public.crm_people FOR ALL USING (tenant_id = public.tenant_id_for_user(auth.uid()) AND public.has_role(auth.uid(),'closer')) WITH CHECK (tenant_id = public.tenant_id_for_user(auth.uid()) AND public.has_role(auth.uid(),'closer'));
CREATE POLICY "Team leads can manage CRM people" ON public.crm_people FOR ALL USING (tenant_id = public.tenant_id_for_user(auth.uid()) AND public.is_owner_or_manager(auth.uid())) WITH CHECK (tenant_id = public.tenant_id_for_user(auth.uid()) AND public.is_owner_or_manager(auth.uid()));

CREATE POLICY "Team leads can manage custom column values" ON public.custom_column_values FOR ALL USING (tenant_id = public.tenant_id_for_user(auth.uid()) AND public.has_any_role(auth.uid(), ARRAY['owner','manager','senior_editor','content_creator','editor']::public.app_role[])) WITH CHECK (tenant_id = public.tenant_id_for_user(auth.uid()) AND public.has_any_role(auth.uid(), ARRAY['owner','manager','senior_editor','content_creator','editor']::public.app_role[]));
CREATE POLICY "Team members can view custom column values" ON public.custom_column_values FOR SELECT USING (tenant_id = public.tenant_id_for_user(auth.uid()));

CREATE POLICY "Team leads can manage custom columns" ON public.custom_columns FOR ALL USING (tenant_id = public.tenant_id_for_user(auth.uid()) AND public.has_any_role(auth.uid(), ARRAY['owner','manager','senior_editor']::public.app_role[])) WITH CHECK (tenant_id = public.tenant_id_for_user(auth.uid()) AND public.has_any_role(auth.uid(), ARRAY['owner','manager','senior_editor']::public.app_role[]));
CREATE POLICY "Team members can view custom columns" ON public.custom_columns FOR SELECT USING (tenant_id = public.tenant_id_for_user(auth.uid()));

CREATE POLICY "Clients can view their cycles" ON public.cycles FOR SELECT USING (EXISTS (SELECT 1 FROM public.client_access ca WHERE ca.user_id = auth.uid() AND ca.client_id = cycles.client_id));
CREATE POLICY "Editors can manage cycles for assigned projects" ON public.cycles FOR ALL USING (tenant_id = public.tenant_id_for_user(auth.uid()) AND public.has_role(auth.uid(),'editor') AND EXISTS (SELECT 1 FROM public.client_team_assignments cta WHERE cta.user_id = auth.uid() AND cta.client_id = cycles.client_id)) WITH CHECK (tenant_id = public.tenant_id_for_user(auth.uid()) AND public.has_role(auth.uid(),'editor') AND EXISTS (SELECT 1 FROM public.client_team_assignments cta WHERE cta.user_id = auth.uid() AND cta.client_id = cycles.client_id));
CREATE POLICY "Team leads can manage cycles" ON public.cycles FOR ALL USING (tenant_id = public.tenant_id_for_user(auth.uid()) AND public.has_any_role(auth.uid(), ARRAY['owner','manager','senior_editor','content_creator']::public.app_role[])) WITH CHECK (tenant_id = public.tenant_id_for_user(auth.uid()) AND public.has_any_role(auth.uid(), ARRAY['owner','manager','senior_editor','content_creator']::public.app_role[]));

CREATE POLICY deal_stages_manage_admin ON public.deal_stages FOR ALL TO authenticated USING (tenant_id = public.tenant_id_for_user(auth.uid()) AND public.is_owner_or_manager(auth.uid())) WITH CHECK (tenant_id = public.tenant_id_for_user(auth.uid()) AND public.is_owner_or_manager(auth.uid()));
CREATE POLICY deal_stages_select_same_tenant ON public.deal_stages FOR SELECT TO authenticated USING (tenant_id = public.tenant_id_for_user(auth.uid()));

CREATE POLICY "Owners and managers can insert recipients" ON public.email_campaign_recipients FOR INSERT TO authenticated WITH CHECK (tenant_id = public.tenant_id_for_user(auth.uid()) AND public.is_owner_or_manager(auth.uid()));
CREATE POLICY "Owners and managers can view recipients" ON public.email_campaign_recipients FOR SELECT TO authenticated USING (tenant_id = public.tenant_id_for_user(auth.uid()) AND public.is_owner_or_manager(auth.uid()));

CREATE POLICY "Owners and managers can insert campaigns" ON public.email_campaigns FOR INSERT TO authenticated WITH CHECK (tenant_id = public.tenant_id_for_user(auth.uid()) AND public.is_owner_or_manager(auth.uid()));
CREATE POLICY "Owners and managers can update campaigns" ON public.email_campaigns FOR UPDATE TO authenticated USING (tenant_id = public.tenant_id_for_user(auth.uid()) AND public.is_owner_or_manager(auth.uid())) WITH CHECK (tenant_id = public.tenant_id_for_user(auth.uid()) AND public.is_owner_or_manager(auth.uid()));
CREATE POLICY "Owners and managers can view campaigns" ON public.email_campaigns FOR SELECT TO authenticated USING (tenant_id = public.tenant_id_for_user(auth.uid()) AND public.is_owner_or_manager(auth.uid()));

CREATE POLICY "Owner can view email queue" ON public.email_queue FOR SELECT USING (tenant_id = public.tenant_id_for_user(auth.uid()) AND public.is_owner_or_manager(auth.uid()));
CREATE POLICY "Service can insert email queue" ON public.email_queue FOR INSERT WITH CHECK (tenant_id = public.tenant_id_for_user(auth.uid()));

CREATE POLICY "Team can view email templates" ON public.email_templates FOR SELECT USING (tenant_id = public.tenant_id_for_user(auth.uid()));
CREATE POLICY "Team leads can manage email templates" ON public.email_templates FOR ALL USING (tenant_id = public.tenant_id_for_user(auth.uid()) AND public.is_owner_or_manager(auth.uid())) WITH CHECK (tenant_id = public.tenant_id_for_user(auth.uid()) AND public.is_owner_or_manager(auth.uid()));

-- Notifications: users see/manage their own
CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Service can insert notifications" ON public.notifications FOR INSERT WITH CHECK (tenant_id = public.tenant_id_for_user(auth.uid()));

CREATE POLICY "Users can manage own notification preferences" ON public.notification_preferences FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can manage own push subscriptions" ON public.push_subscriptions FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can manage own saved filter views" ON public.saved_filter_views FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());