CREATE TABLE public.activity_log (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  user_id uuid,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid NOT NULL,
  changes jsonb DEFAULT '{}'::jsonb,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE public.ai_prompts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  slug text NOT NULL,
  title text NOT NULL,
  system_prompt text NOT NULL,
  model text DEFAULT 'openai/gpt-5-mini'::text,
  temperature numeric DEFAULT 0.3,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE public.calendly_events (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  person_id uuid,
  lead_id uuid,
  sales_user_id uuid,
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
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.chat_mentions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  message_id uuid NOT NULL,
  mentioned_user_id uuid NOT NULL,
  is_read boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.chat_messages (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  thread_id uuid NOT NULL,
  sender_id uuid NOT NULL,
  content text,
  message_type text NOT NULL DEFAULT 'text'::text,
  attachments jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_edited boolean NOT NULL DEFAULT false,
  is_deleted boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE public.chat_mutes (
  user_id uuid NOT NULL,
  room_id uuid NOT NULL,
  tenant_id uuid NOT NULL,
  muted_until timestamp with time zone,
  notify_on_mention boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE public.chat_rooms (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  client_id uuid NOT NULL,
  room_type text NOT NULL DEFAULT 'workspace'::text,
  name text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE public.chat_threads (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  room_id uuid NOT NULL,
  title text NOT NULL DEFAULT 'General'::text,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE public.client_access (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  user_id uuid NOT NULL,
  client_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE public.client_foundation (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  client_id uuid NOT NULL,
  foundation jsonb NOT NULL DEFAULT '{}'::jsonb,
  bios jsonb NOT NULL DEFAULT '[]'::jsonb,
  audience_avatars jsonb NOT NULL DEFAULT '[]'::jsonb,
  pillars jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE public.client_invitations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  client_id uuid NOT NULL,
  email text NOT NULL,
  name text,
  token text NOT NULL DEFAULT (gen_random_uuid())::text,
  invited_by uuid NOT NULL,
  status text NOT NULL DEFAULT 'pending'::text,
  accepted_at timestamp with time zone,
  expires_at timestamp with time zone NOT NULL DEFAULT (now() + '7 days'::interval),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE public.client_journey_steps (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  client_id uuid NOT NULL,
  step_key text NOT NULL,
  step_label text NOT NULL,
  status text DEFAULT 'pending'::text,
  completed_at timestamp with time zone,
  metadata jsonb DEFAULT '{}'::jsonb,
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE public.client_members (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  client_id uuid NOT NULL,
  user_id uuid,
  name text NOT NULL,
  email text,
  role_title text,
  is_workspace_owner boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE public.client_onboarding (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  client_id uuid NOT NULL,
  answers jsonb NOT NULL DEFAULT '{}'::jsonb,
  completed boolean DEFAULT false,
  completed_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE public.client_team_assignments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  user_id uuid NOT NULL,
  client_id uuid NOT NULL,
  assigned_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE public.clients (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  name text NOT NULL,
  email text,
  phone text,
  logo_url text,
  workspace_type workspace_type NOT NULL DEFAULT 'individual'::workspace_type,
  account_status account_status NOT NULL DEFAULT 'onboarding'::account_status,
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
  person_id uuid,
  deal_owner_id uuid,
  stripe_customer_id text,
  notes text,
  settings jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  archived_at timestamp with time zone
);

CREATE TABLE public.closer_regions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  user_id uuid NOT NULL,
  region_name text NOT NULL,
  countries text[] NOT NULL DEFAULT '{}'::text[],
  calendly_api_key text,
  calendly_webhook_uri text,
  calendar_event_filter text DEFAULT '30 Mins Discovery Call'::text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE public.comment_attachments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  comment_id uuid NOT NULL,
  storage_path text NOT NULL,
  file_name text NOT NULL,
  file_size bigint,
  content_type text NOT NULL,
  uploaded_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  expires_at timestamp with time zone NOT NULL DEFAULT (now() + '14 days'::interval)
);

CREATE TABLE public.content_vault (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  client_id uuid NOT NULL,
  title text NOT NULL,
  content text,
  category text,
  tags text[] DEFAULT '{}'::text[],
  source_url text,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE public.credentials (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  client_id uuid,
  title text NOT NULL,
  username text,
  password text,
  url text,
  notes text,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE public.crm_companies (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
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
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.crm_deal_options (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  category text NOT NULL,
  value text NOT NULL,
  label text NOT NULL,
  color text,
  order_index integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE public.crm_deals (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  person_id uuid,
  name text NOT NULL,
  stage_id uuid,
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
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.crm_editors (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  person_id uuid,
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
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.crm_people (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  full_name text NOT NULL,
  email text,
  phone text,
  invalid_phone_note text,
  job_title text,
  company_id uuid,
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
  assigned_to uuid,
  first_calendar_at timestamp with time zone,
  last_calendar_at timestamp with time zone,
  source text DEFAULT 'manual'::text,
  description text,
  notes text,
  active boolean DEFAULT true,
  attio_record_id text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.custom_column_values (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  column_id uuid NOT NULL,
  video_id uuid NOT NULL,
  value text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.custom_columns (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  project_id uuid,
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
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.cycles (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  client_id uuid NOT NULL,
  project_id uuid NOT NULL,
  name text NOT NULL,
  cycle_number integer NOT NULL DEFAULT 1,
  order_index integer NOT NULL DEFAULT 0,
  is_backlog boolean DEFAULT false,
  start_date date,
  end_date date,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE public.deal_stages (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  slug text NOT NULL,
  display_name text NOT NULL,
  color text DEFAULT '#6B7280'::text,
  sort_order integer NOT NULL DEFAULT 0,
  is_auto_trigger boolean DEFAULT false,
  trigger_action text,
  probability integer DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE public.email_campaign_recipients (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  campaign_id uuid NOT NULL,
  email text NOT NULL,
  name text,
  status text NOT NULL DEFAULT 'queued'::text,
  error text,
  sent_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE public.email_campaigns (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
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
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE public.email_queue (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  template_id uuid,
  to_email text NOT NULL,
  to_name text,
  subject text NOT NULL,
  body_html text NOT NULL,
  status text NOT NULL DEFAULT 'pending'::text,
  sent_at timestamp with time zone,
  error text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE public.email_templates (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
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
  edit_mode text NOT NULL DEFAULT 'visual'::text
);

CREATE TABLE public.finance_transactions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  client_id uuid,
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
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE public.follow_ups (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  person_id uuid,
  lead_id uuid,
  assigned_to uuid,
  title text NOT NULL,
  notes text,
  due_at timestamp with time zone NOT NULL,
  status text DEFAULT 'pending'::text,
  priority text DEFAULT 'medium'::text,
  completed_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE public.guest_review_links (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  video_id uuid,
  project_id uuid,
  token text NOT NULL DEFAULT (gen_random_uuid())::text,
  created_by uuid NOT NULL,
  reviewer_name text,
  reviewer_email text,
  expires_at timestamp with time zone NOT NULL DEFAULT (now() + '7 days'::interval),
  max_uses integer DEFAULT 0,
  use_count integer DEFAULT 0,
  is_active boolean DEFAULT true,
  permissions jsonb DEFAULT '{"can_approve": false, "can_comment": true, "can_annotate": true}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE public.leads (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  person_id uuid,
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
  assigned_to uuid,
  notes text,
  raw_payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  follow_up_at timestamp with time zone,
  country text,
  content_language text,
  is_qualified boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE public.leads_custom_columns (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  created_by uuid NOT NULL,
  column_name text NOT NULL,
  column_type text NOT NULL DEFAULT 'text'::text,
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE public.leads_saved_views (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  user_id uuid NOT NULL,
  view_name text NOT NULL,
  column_config jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_default boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE public.notification_preferences (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  tenant_id uuid NOT NULL,
  notification_type text NOT NULL,
  email_enabled boolean NOT NULL DEFAULT true,
  push_enabled boolean NOT NULL DEFAULT true,
  in_app_enabled boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE public.notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  user_id uuid NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  type notification_type NOT NULL DEFAULT 'info'::notification_type,
  priority notification_priority NOT NULL DEFAULT 'normal'::notification_priority,
  read boolean NOT NULL DEFAULT false,
  link text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE public.partnership_applications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  person_id uuid,
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
  updated_at timestamp with time zone NOT NULL DEFAULT now()
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
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE public.project_type_templates (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  slug text NOT NULL,
  display_name text NOT NULL,
  description text,
  default_video_count integer DEFAULT 0,
  default_cadence project_cadence DEFAULT 'one_time'::project_cadence,
  default_posting_days text[] DEFAULT '{}'::text[],
  icon text,
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE public.projects (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  client_id uuid NOT NULL,
  project_type_template_id uuid,
  project_name text NOT NULL,
  status project_status NOT NULL DEFAULT 'not_started'::project_status,
  video_count integer NOT NULL DEFAULT 0,
  videos_completed integer NOT NULL DEFAULT 0,
  progress numeric DEFAULT 0,
  cadence project_cadence NOT NULL DEFAULT 'one_time'::project_cadence,
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
  archived_at timestamp with time zone
);

CREATE TABLE public.push_subscriptions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  tenant_id uuid NOT NULL,
  endpoint text NOT NULL,
  subscription jsonb NOT NULL,
  device_label text,
  last_seen_at timestamp with time zone DEFAULT now(),
  last_push_at timestamp with time zone,
  last_push_status text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.saved_filter_views (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  user_id uuid NOT NULL,
  name text NOT NULL,
  page text NOT NULL,
  filters jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_default boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE public.status_role_permissions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  status_id uuid NOT NULL,
  role app_role NOT NULL,
  can_view boolean DEFAULT true,
  can_set boolean DEFAULT false,
  can_transition_from boolean DEFAULT false,
  can_transition_to boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE public.statuses (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  slug text NOT NULL,
  display_name text NOT NULL,
  color text DEFAULT '#6B7280'::text,
  sort_order integer NOT NULL DEFAULT 0,
  is_client_visible boolean DEFAULT false,
  is_default boolean DEFAULT false,
  description text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE public.stripe_charges (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  stripe_charge_id text NOT NULL,
  client_id uuid,
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
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE public.stripe_events_log (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  stripe_event_id text NOT NULL,
  event_type text NOT NULL,
  processed_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE public.stripe_subscriptions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  stripe_subscription_id text NOT NULL,
  stripe_customer_id text,
  client_id uuid,
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
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE public.studio_hooks (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  client_id uuid NOT NULL,
  hook_text text NOT NULL,
  category text,
  source text DEFAULT 'manual'::text,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE public.studio_scripts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  client_id uuid NOT NULL,
  title text NOT NULL,
  body text,
  video_type text,
  status text DEFAULT 'draft'::text,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE public.tasks (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  assigned_to uuid,
  created_by uuid,
  title text NOT NULL,
  description text,
  status text DEFAULT 'todo'::text,
  priority text DEFAULT 'medium'::text,
  due_date timestamp with time zone,
  linked_entity_type text,
  linked_entity_id uuid,
  completed_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

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
  archived_at timestamp with time zone
);

CREATE TABLE public.thumbnail_versions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  video_id uuid NOT NULL,
  version_number integer NOT NULL DEFAULT 1,
  thumbnail_url text NOT NULL,
  thumbnail_storage_path text NOT NULL,
  is_current boolean DEFAULT false,
  version_notes text,
  uploaded_by uuid,
  uploaded_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE public.trial_reels (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  video_id uuid NOT NULL,
  version_id uuid,
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
  hook_upload_status upload_status DEFAULT 'pending'::upload_status,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE public.user_roles (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role app_role NOT NULL DEFAULT 'client'::app_role,
  tenant_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE public.video_annotations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  video_id uuid NOT NULL,
  version_id uuid,
  comment_id uuid,
  annotation_data jsonb NOT NULL,
  frame_timestamp numeric NOT NULL,
  frame_thumbnail text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE public.video_comments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  video_id uuid NOT NULL,
  version_id uuid,
  user_id uuid,
  parent_comment_id uuid,
  comment text NOT NULL,
  comment_type text DEFAULT 'review'::text,
  timestamp_seconds numeric,
  timestamp_end_seconds numeric,
  status text NOT NULL DEFAULT 'active'::text,
  resolved_at timestamp with time zone,
  resolved_by uuid,
  is_internal boolean DEFAULT false,
  guest_name text,
  guest_email text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE public.video_editors (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  editor_id uuid NOT NULL,
  client_id uuid,
  project_id uuid,
  video_id uuid,
  assigned_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE public.video_status_history (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  video_id uuid NOT NULL,
  old_status text,
  new_status text NOT NULL,
  changed_by uuid,
  changed_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE public.video_types (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  slug text NOT NULL,
  display_name text NOT NULL,
  icon text,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE public.video_versions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  video_id uuid NOT NULL,
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
  video_upload_status upload_status DEFAULT 'pending'::upload_status,
  video_upload_progress integer DEFAULT 0,
  version_notes text,
  transcript text,
  uploaded_by uuid,
  uploaded_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE public.videos (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  client_id uuid NOT NULL,
  project_id uuid,
  cycle_id uuid,
  video_title text NOT NULL,
  status_id uuid,
  video_type_id uuid,
  priority content_priority NOT NULL DEFAULT 'medium'::content_priority,
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
  video_upload_status upload_status DEFAULT 'pending'::upload_status,
  video_upload_progress integer DEFAULT 0,
  video_error_message text,
  video_uploaded_at timestamp with time zone,
  video_uploaded_by uuid,
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
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  archived_at timestamp with time zone
);

-- activity_log
  FOREIGN KEY: activity_log_tenant_id_fkey (tenant_id) REFERENCES tenants(id)
  FOREIGN KEY: activity_log_user_id_fkey (user_id)
  PRIMARY KEY: activity_log_pkey (id)

-- ai_prompts
  FOREIGN KEY: ai_prompts_tenant_id_fkey (tenant_id) REFERENCES tenants(id)
  PRIMARY KEY: ai_prompts_pkey (id)
  UNIQUE: ai_prompts_tenant_id_slug_key (tenant_id, slug)

-- calendly_events
  FOREIGN KEY: calendly_events_lead_id_fkey (lead_id) REFERENCES leads(id)
  FOREIGN KEY: calendly_events_person_id_fkey (person_id) REFERENCES crm_people(id)
  FOREIGN KEY: calendly_events_sales_user_id_fkey (sales_user_id)
  FOREIGN KEY: calendly_events_tenant_id_fkey (tenant_id) REFERENCES tenants(id)
  PRIMARY KEY: calendly_events_pkey (id)
  UNIQUE: calendly_events_calendly_event_uri_key (calendly_event_uri)

-- chat_mentions
  FOREIGN KEY: chat_mentions_mentioned_user_id_fkey (mentioned_user_id)
  FOREIGN KEY: chat_mentions_message_id_fkey (message_id) REFERENCES chat_messages(id)
  FOREIGN KEY: chat_mentions_tenant_id_fkey (tenant_id) REFERENCES tenants(id)
  PRIMARY KEY: chat_mentions_pkey (id)

-- chat_messages
  FOREIGN KEY: chat_messages_sender_id_fkey (sender_id)
  FOREIGN KEY: chat_messages_tenant_id_fkey (tenant_id) REFERENCES tenants(id)
  FOREIGN KEY: chat_messages_thread_id_fkey (thread_id) REFERENCES chat_threads(id)
  PRIMARY KEY: chat_messages_pkey (id)

-- chat_mutes
  FOREIGN KEY: chat_mutes_room_id_fkey (room_id) REFERENCES chat_rooms(id)
  FOREIGN KEY: chat_mutes_tenant_id_fkey (tenant_id) REFERENCES tenants(id)
  FOREIGN KEY: chat_mutes_user_id_fkey (user_id)
  PRIMARY KEY: chat_mutes_pkey (user_id, room_id)

-- chat_rooms
  FOREIGN KEY: chat_rooms_client_id_fkey (client_id) REFERENCES clients(id)
  FOREIGN KEY: chat_rooms_tenant_id_fkey (tenant_id) REFERENCES tenants(id)
  PRIMARY KEY: chat_rooms_pkey (id)

-- chat_threads
  FOREIGN KEY: chat_threads_created_by_fkey (created_by)
  FOREIGN KEY: chat_threads_room_id_fkey (room_id) REFERENCES chat_rooms(id)
  FOREIGN KEY: chat_threads_tenant_id_fkey (tenant_id) REFERENCES tenants(id)
  PRIMARY KEY: chat_threads_pkey (id)

-- client_access
  FOREIGN KEY: client_access_client_id_fkey (client_id) REFERENCES clients(id)
  FOREIGN KEY: client_access_tenant_id_fkey (tenant_id) REFERENCES tenants(id)
  FOREIGN KEY: client_access_user_id_fkey (user_id)
  PRIMARY KEY: client_access_pkey (id)
  UNIQUE: client_access_user_id_client_id_key (user_id, client_id)

-- client_foundation
  FOREIGN KEY: client_foundation_client_id_fkey (client_id) REFERENCES clients(id)
  FOREIGN KEY: client_foundation_tenant_id_fkey (tenant_id) REFERENCES tenants(id)
  PRIMARY KEY: client_foundation_pkey (id)
  UNIQUE: client_foundation_client_id_key (client_id)

-- client_invitations
  FOREIGN KEY: client_invitations_client_id_fkey (client_id) REFERENCES clients(id)
  FOREIGN KEY: client_invitations_invited_by_fkey (invited_by)
  FOREIGN KEY: client_invitations_tenant_id_fkey (tenant_id) REFERENCES tenants(id)
  PRIMARY KEY: client_invitations_pkey (id)
  UNIQUE: client_invitations_token_key (token)

-- client_journey_steps
  FOREIGN KEY: client_journey_steps_client_id_fkey (client_id) REFERENCES clients(id)
  FOREIGN KEY: client_journey_steps_tenant_id_fkey (tenant_id) REFERENCES tenants(id)
  PRIMARY KEY: client_journey_steps_pkey (id)
  UNIQUE: client_journey_steps_client_id_step_key_key (client_id, step_key)

-- client_members
  FOREIGN KEY: client_members_client_id_fkey (client_id) REFERENCES clients(id)
  FOREIGN KEY: client_members_tenant_id_fkey (tenant_id) REFERENCES tenants(id)
  FOREIGN KEY: client_members_user_id_fkey (user_id)
  PRIMARY KEY: client_members_pkey (id)

-- client_onboarding
  FOREIGN KEY: client_onboarding_client_id_fkey (client_id) REFERENCES clients(id)
  FOREIGN KEY: client_onboarding_tenant_id_fkey (tenant_id) REFERENCES tenants(id)
  PRIMARY KEY: client_onboarding_pkey (id)
  UNIQUE: client_onboarding_client_id_key (client_id)

-- client_team_assignments
  FOREIGN KEY: client_team_assignments_assigned_by_fkey (assigned_by)
  FOREIGN KEY: client_team_assignments_client_id_fkey (client_id) REFERENCES clients(id)
  FOREIGN KEY: client_team_assignments_tenant_id_fkey (tenant_id) REFERENCES tenants(id)
  FOREIGN KEY: client_team_assignments_user_id_fkey (user_id)
  PRIMARY KEY: client_team_assignments_pkey (id)
  UNIQUE: client_team_assignments_user_id_client_id_key (user_id, client_id)

-- clients
  FOREIGN KEY: clients_deal_owner_id_fkey (deal_owner_id) REFERENCES profiles(id)
  FOREIGN KEY: clients_tenant_id_fkey (tenant_id) REFERENCES tenants(id)
  FOREIGN KEY: fk_clients_person (person_id) REFERENCES crm_people(id)
  PRIMARY KEY: clients_pkey (id)
  UNIQUE: clients_workspace_token_key (workspace_token)

-- closer_regions
  FOREIGN KEY: closer_regions_tenant_id_fkey (tenant_id) REFERENCES tenants(id)
  FOREIGN KEY: closer_regions_user_id_fkey (user_id)
  PRIMARY KEY: closer_regions_pkey (id)
  UNIQUE: closer_regions_user_id_key (user_id)

-- comment_attachments
  FOREIGN KEY: comment_attachments_comment_id_fkey (comment_id) REFERENCES video_comments(id)
  FOREIGN KEY: comment_attachments_tenant_id_fkey (tenant_id) REFERENCES tenants(id)
  FOREIGN KEY: comment_attachments_uploaded_by_fkey (uploaded_by)
  PRIMARY KEY: comment_attachments_pkey (id)

-- content_vault
  FOREIGN KEY: content_vault_client_id_fkey (client_id) REFERENCES clients(id)
  FOREIGN KEY: content_vault_created_by_fkey (created_by)
  FOREIGN KEY: content_vault_tenant_id_fkey (tenant_id) REFERENCES tenants(id)
  PRIMARY KEY: content_vault_pkey (id)

-- credentials
  FOREIGN KEY: credentials_client_id_fkey (client_id) REFERENCES clients(id)
  FOREIGN KEY: credentials_created_by_fkey (created_by)
  FOREIGN KEY: credentials_tenant_id_fkey (tenant_id) REFERENCES tenants(id)
  PRIMARY KEY: credentials_pkey (id)

-- crm_companies
  FOREIGN KEY: crm_companies_tenant_id_fkey (tenant_id) REFERENCES tenants(id)
  PRIMARY KEY: crm_companies_pkey (id)
  UNIQUE: crm_companies_attio_record_id_key (attio_record_id)

-- crm_deal_options
  FOREIGN KEY: crm_deal_options_tenant_id_fkey (tenant_id) REFERENCES tenants(id)
  PRIMARY KEY: crm_deal_options_pkey (id)
  UNIQUE: crm_deal_options_tenant_id_category_value_key (tenant_id, category, value)

-- crm_deals
  FOREIGN KEY: crm_deals_person_id_fkey (person_id) REFERENCES crm_people(id)
  FOREIGN KEY: crm_deals_stage_id_fkey (stage_id) REFERENCES deal_stages(id)
  FOREIGN KEY: crm_deals_tenant_id_fkey (tenant_id) REFERENCES tenants(id)
  PRIMARY KEY: crm_deals_pkey (id)
  UNIQUE: crm_deals_attio_record_id_key (attio_record_id)

-- crm_editors
  FOREIGN KEY: crm_editors_person_id_fkey (person_id) REFERENCES crm_people(id)
  FOREIGN KEY: crm_editors_tenant_id_fkey (tenant_id) REFERENCES tenants(id)
  PRIMARY KEY: crm_editors_pkey (id)
  UNIQUE: crm_editors_attio_record_id_key (attio_record_id)

-- crm_people
  FOREIGN KEY: crm_people_assigned_to_fkey (assigned_to)
  FOREIGN KEY: crm_people_company_id_fkey (company_id) REFERENCES crm_companies(id)
  FOREIGN KEY: crm_people_tenant_id_fkey (tenant_id) REFERENCES tenants(id)
  PRIMARY KEY: crm_people_pkey (id)
  UNIQUE: crm_people_attio_record_id_key (attio_record_id)

-- custom_column_values
  FOREIGN KEY: custom_column_values_column_id_fkey (column_id) REFERENCES custom_columns(id)
  FOREIGN KEY: custom_column_values_tenant_id_fkey (tenant_id) REFERENCES tenants(id)
  FOREIGN KEY: custom_column_values_video_id_fkey (video_id) REFERENCES videos(id)
  PRIMARY KEY: custom_column_values_pkey (id)
  UNIQUE: custom_column_values_column_id_video_id_key (column_id, video_id)

-- custom_columns
  FOREIGN KEY: custom_columns_project_id_fkey (project_id) REFERENCES projects(id)
  FOREIGN KEY: custom_columns_tenant_id_fkey (tenant_id) REFERENCES tenants(id)
  PRIMARY KEY: custom_columns_pkey (id)

-- cycles
  FOREIGN KEY: cycles_client_id_fkey (client_id) REFERENCES clients(id)
  FOREIGN KEY: cycles_project_id_fkey (project_id) REFERENCES projects(id)
  FOREIGN KEY: cycles_tenant_id_fkey (tenant_id) REFERENCES tenants(id)
  PRIMARY KEY: cycles_pkey (id)
  UNIQUE: cycles_project_id_name_key (project_id, name)

-- deal_stages
  FOREIGN KEY: deal_stages_tenant_id_fkey (tenant_id) REFERENCES tenants(id)
  PRIMARY KEY: deal_stages_pkey (id)
  UNIQUE: uq_deal_stages_tenant_slug (tenant_id, slug)

-- email_campaign_recipients
  FOREIGN KEY: email_campaign_recipients_campaign_id_fkey (campaign_id) REFERENCES email_campaigns(id)
  FOREIGN KEY: email_campaign_recipients_tenant_id_fkey (tenant_id) REFERENCES tenants(id)
  PRIMARY KEY: email_campaign_recipients_pkey (id)

-- email_campaigns
  FOREIGN KEY: email_campaigns_created_by_fkey (created_by)
  FOREIGN KEY: email_campaigns_tenant_id_fkey (tenant_id) REFERENCES tenants(id)
  PRIMARY KEY: email_campaigns_pkey (id)

-- email_queue
  FOREIGN KEY: email_queue_template_id_fkey (template_id) REFERENCES email_templates(id)
  FOREIGN KEY: email_queue_tenant_id_fkey (tenant_id) REFERENCES tenants(id)
  PRIMARY KEY: email_queue_pkey (id)

-- email_templates
  FOREIGN KEY: email_templates_tenant_id_fkey (tenant_id) REFERENCES tenants(id)
  PRIMARY KEY: email_templates_pkey (id)
  UNIQUE: email_templates_tenant_id_slug_key (tenant_id, slug)

-- finance_transactions
  FOREIGN KEY: finance_transactions_client_id_fkey (client_id) REFERENCES clients(id)
  FOREIGN KEY: finance_transactions_tenant_id_fkey (tenant_id) REFERENCES tenants(id)
  PRIMARY KEY: finance_transactions_pkey (id)

-- follow_ups
  FOREIGN KEY: follow_ups_assigned_to_fkey (assigned_to)
  FOREIGN KEY: follow_ups_lead_id_fkey (lead_id) REFERENCES leads(id)
  FOREIGN KEY: follow_ups_person_id_fkey (person_id) REFERENCES crm_people(id)
  FOREIGN KEY: follow_ups_tenant_id_fkey (tenant_id) REFERENCES tenants(id)
  PRIMARY KEY: follow_ups_pkey (id)

-- guest_review_links
  FOREIGN KEY: guest_review_links_created_by_fkey (created_by)
  FOREIGN KEY: guest_review_links_project_id_fkey (project_id) REFERENCES projects(id)
  FOREIGN KEY: guest_review_links_tenant_id_fkey (tenant_id) REFERENCES tenants(id)
  FOREIGN KEY: guest_review_links_video_id_fkey (video_id) REFERENCES videos(id)
  PRIMARY KEY: guest_review_links_pkey (id)
  UNIQUE: guest_review_links_token_key (token)

-- leads
  FOREIGN KEY: leads_assigned_to_fkey (assigned_to)
  FOREIGN KEY: leads_person_id_fkey (person_id) REFERENCES crm_people(id)
  FOREIGN KEY: leads_tenant_id_fkey (tenant_id) REFERENCES tenants(id)
  PRIMARY KEY: leads_pkey (id)

-- leads_custom_columns
  FOREIGN KEY: leads_custom_columns_created_by_fkey (created_by)
  FOREIGN KEY: leads_custom_columns_tenant_id_fkey (tenant_id) REFERENCES tenants(id)
  PRIMARY KEY: leads_custom_columns_pkey (id)

-- leads_saved_views
  FOREIGN KEY: leads_saved_views_tenant_id_fkey (tenant_id) REFERENCES tenants(id)
  FOREIGN KEY: leads_saved_views_user_id_fkey (user_id)
  PRIMARY KEY: leads_saved_views_pkey (id)

-- notification_preferences
  FOREIGN KEY: notification_preferences_tenant_id_fkey (tenant_id) REFERENCES tenants(id)
  FOREIGN KEY: notification_preferences_user_id_fkey (user_id)
  PRIMARY KEY: notification_preferences_pkey (id)
  UNIQUE: notification_preferences_user_id_notification_type_key (user_id, notification_type)

-- notifications
  FOREIGN KEY: notifications_tenant_id_fkey (tenant_id) REFERENCES tenants(id)
  FOREIGN KEY: notifications_user_id_fkey (user_id)
  PRIMARY KEY: notifications_pkey (id)

-- partnership_applications
  FOREIGN KEY: partnership_applications_person_id_fkey (person_id) REFERENCES crm_people(id)
  FOREIGN KEY: partnership_applications_tenant_id_fkey (tenant_id) REFERENCES tenants(id)
  PRIMARY KEY: partnership_applications_pkey (id)

-- profiles
  FOREIGN KEY: profiles_id_fkey (id)
  FOREIGN KEY: profiles_tenant_id_fkey (tenant_id) REFERENCES tenants(id)
  PRIMARY KEY: profiles_pkey (id)

-- project_type_templates
  FOREIGN KEY: project_type_templates_tenant_id_fkey (tenant_id) REFERENCES tenants(id)
  PRIMARY KEY: project_type_templates_pkey (id)
  UNIQUE: project_type_templates_tenant_id_slug_key (tenant_id, slug)

-- projects
  FOREIGN KEY: projects_client_id_fkey (client_id) REFERENCES clients(id)
  FOREIGN KEY: projects_project_type_template_id_fkey (project_type_template_id) REFERENCES project_type_templates(id)
  FOREIGN KEY: projects_tenant_id_fkey (tenant_id) REFERENCES tenants(id)
  PRIMARY KEY: projects_pkey (id)

-- push_subscriptions
  FOREIGN KEY: push_subscriptions_tenant_id_fkey (tenant_id) REFERENCES tenants(id)
  FOREIGN KEY: push_subscriptions_user_id_fkey (user_id)
  PRIMARY KEY: push_subscriptions_pkey (id)
  UNIQUE: push_subscriptions_user_id_endpoint_key (user_id, endpoint)

-- saved_filter_views
  FOREIGN KEY: saved_filter_views_tenant_id_fkey (tenant_id) REFERENCES tenants(id)
  FOREIGN KEY: saved_filter_views_user_id_fkey (user_id)
  PRIMARY KEY: saved_filter_views_pkey (id)

-- status_role_permissions
  FOREIGN KEY: status_role_permissions_status_id_fkey (status_id) REFERENCES statuses(id)
  FOREIGN KEY: status_role_permissions_tenant_id_fkey (tenant_id) REFERENCES tenants(id)
  PRIMARY KEY: status_role_permissions_pkey (id)
  UNIQUE: uq_status_role_perms (tenant_id, status_id, role)

-- statuses
  FOREIGN KEY: statuses_tenant_id_fkey (tenant_id) REFERENCES tenants(id)
  PRIMARY KEY: statuses_pkey (id)
  UNIQUE: uq_statuses_tenant_slug (tenant_id, slug)

-- stripe_charges
  FOREIGN KEY: stripe_charges_client_id_fkey (client_id) REFERENCES clients(id)
  FOREIGN KEY: stripe_charges_tenant_id_fkey (tenant_id) REFERENCES tenants(id)
  PRIMARY KEY: stripe_charges_pkey (id)
  UNIQUE: stripe_charges_stripe_charge_id_key (stripe_charge_id)

-- stripe_events_log
  FOREIGN KEY: stripe_events_log_tenant_id_fkey (tenant_id) REFERENCES tenants(id)
  PRIMARY KEY: stripe_events_log_pkey (id)
  UNIQUE: stripe_events_log_stripe_event_id_key (stripe_event_id)

-- stripe_subscriptions
  FOREIGN KEY: stripe_subscriptions_client_id_fkey (client_id) REFERENCES clients(id)
  FOREIGN KEY: stripe_subscriptions_tenant_id_fkey (tenant_id) REFERENCES tenants(id)
  PRIMARY KEY: stripe_subscriptions_pkey (id)
  UNIQUE: stripe_subscriptions_stripe_subscription_id_key (stripe_subscription_id)

-- studio_hooks
  FOREIGN KEY: studio_hooks_client_id_fkey (client_id) REFERENCES clients(id)
  FOREIGN KEY: studio_hooks_created_by_fkey (created_by)
  FOREIGN KEY: studio_hooks_tenant_id_fkey (tenant_id) REFERENCES tenants(id)
  PRIMARY KEY: studio_hooks_pkey (id)

-- studio_scripts
  FOREIGN KEY: studio_scripts_client_id_fkey (client_id) REFERENCES clients(id)
  FOREIGN KEY: studio_scripts_created_by_fkey (created_by)
  FOREIGN KEY: studio_scripts_tenant_id_fkey (tenant_id) REFERENCES tenants(id)
  PRIMARY KEY: studio_scripts_pkey (id)

-- tasks
  FOREIGN KEY: tasks_assigned_to_fkey (assigned_to)
  FOREIGN KEY: tasks_created_by_fkey (created_by)
  FOREIGN KEY: tasks_tenant_id_fkey (tenant_id) REFERENCES tenants(id)
  PRIMARY KEY: tasks_pkey (id)

-- tenants
  PRIMARY KEY: tenants_pkey (id)
  UNIQUE: tenants_slug_key (slug)

-- thumbnail_versions
  FOREIGN KEY: thumbnail_versions_tenant_id_fkey (tenant_id) REFERENCES tenants(id)
  FOREIGN KEY: thumbnail_versions_uploaded_by_fkey (uploaded_by)
  FOREIGN KEY: thumbnail_versions_video_id_fkey (video_id) REFERENCES videos(id)
  PRIMARY KEY: thumbnail_versions_pkey (id)

-- trial_reels
  FOREIGN KEY: trial_reels_created_by_fkey (created_by)
  FOREIGN KEY: trial_reels_tenant_id_fkey (tenant_id) REFERENCES tenants(id)
  FOREIGN KEY: trial_reels_version_id_fkey (version_id) REFERENCES video_versions(id)
  FOREIGN KEY: trial_reels_video_id_fkey (video_id) REFERENCES videos(id)
  PRIMARY KEY: trial_reels_pkey (id)
  UNIQUE: trial_reels_video_id_trial_number_key (video_id, trial_number)

-- user_roles
  FOREIGN KEY: user_roles_tenant_id_fkey (tenant_id) REFERENCES tenants(id)
  FOREIGN KEY: user_roles_user_id_fkey (user_id)
  PRIMARY KEY: user_roles_pkey (id)
  UNIQUE: uq_user_roles_user_tenant (user_id, tenant_id)

-- video_annotations
  FOREIGN KEY: video_annotations_comment_id_fkey (comment_id) REFERENCES video_comments(id)
  FOREIGN KEY: video_annotations_tenant_id_fkey (tenant_id) REFERENCES tenants(id)
  FOREIGN KEY: video_annotations_version_id_fkey (version_id) REFERENCES video_versions(id)
  FOREIGN KEY: video_annotations_video_id_fkey (video_id) REFERENCES videos(id)
  PRIMARY KEY: video_annotations_pkey (id)

-- video_comments
  FOREIGN KEY: video_comments_parent_comment_id_fkey (parent_comment_id) REFERENCES video_comments(id)
  FOREIGN KEY: video_comments_resolved_by_fkey (resolved_by)
  FOREIGN KEY: video_comments_tenant_id_fkey (tenant_id) REFERENCES tenants(id)
  FOREIGN KEY: video_comments_user_id_fkey (user_id)
  FOREIGN KEY: video_comments_version_id_fkey (version_id) REFERENCES video_versions(id)
  FOREIGN KEY: video_comments_video_id_fkey (video_id) REFERENCES videos(id)
  PRIMARY KEY: video_comments_pkey (id)

-- video_editors
  FOREIGN KEY: video_editors_assigned_by_fkey (assigned_by)
  FOREIGN KEY: video_editors_client_id_fkey (client_id) REFERENCES clients(id)
  FOREIGN KEY: video_editors_editor_id_fkey (editor_id)
  FOREIGN KEY: video_editors_project_id_fkey (project_id) REFERENCES projects(id)
  FOREIGN KEY: video_editors_tenant_id_fkey (tenant_id) REFERENCES tenants(id)
  FOREIGN KEY: video_editors_video_id_fkey (video_id) REFERENCES videos(id)
  PRIMARY KEY: video_editors_pkey (id)
  UNIQUE: video_editors_editor_id_client_id_project_id_video_id_key (editor_id, client_id, project_id, video_id)

-- video_status_history
  FOREIGN KEY: video_status_history_changed_by_fkey (changed_by)
  FOREIGN KEY: video_status_history_tenant_id_fkey (tenant_id) REFERENCES tenants(id)
  FOREIGN KEY: video_status_history_video_id_fkey (video_id) REFERENCES videos(id)
  PRIMARY KEY: video_status_history_pkey (id)

-- video_types
  FOREIGN KEY: video_types_tenant_id_fkey (tenant_id) REFERENCES tenants(id)
  PRIMARY KEY: video_types_pkey (id)
  UNIQUE: uq_video_types_tenant_slug (tenant_id, slug)

-- video_versions
  FOREIGN KEY: video_versions_tenant_id_fkey (tenant_id) REFERENCES tenants(id)
  FOREIGN KEY: video_versions_uploaded_by_fkey (uploaded_by)
  FOREIGN KEY: video_versions_video_id_fkey (video_id) REFERENCES videos(id)
  PRIMARY KEY: video_versions_pkey (id)
  UNIQUE: video_versions_video_id_version_number_key (video_id, version_number)

-- videos
  FOREIGN KEY: videos_client_id_fkey (client_id) REFERENCES clients(id)
  FOREIGN KEY: videos_created_by_fkey (created_by)
  FOREIGN KEY: videos_cycle_id_fkey (cycle_id) REFERENCES cycles(id)
  FOREIGN KEY: videos_project_id_fkey (project_id) REFERENCES projects(id)
  FOREIGN KEY: videos_status_id_fkey (status_id) REFERENCES statuses(id)
  FOREIGN KEY: videos_tenant_id_fkey (tenant_id) REFERENCES tenants(id)
  FOREIGN KEY: videos_video_type_id_fkey (video_type_id) REFERENCES video_types(id)
  FOREIGN KEY: videos_video_uploaded_by_fkey (video_uploaded_by)
  PRIMARY KEY: videos_pkey (id)

