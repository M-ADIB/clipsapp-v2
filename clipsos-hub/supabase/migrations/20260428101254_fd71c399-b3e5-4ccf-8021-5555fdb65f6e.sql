-- Seed statuses lookup for The Clips Agency tenant
INSERT INTO public.statuses (tenant_id, slug, display_name, color, sort_order, is_client_visible, is_default) VALUES
  ('127f3184-fb0e-4b0b-8088-1a468c2bba52', 'not_started',       'Not Started',       '#94a3b8', 10, false, true),
  ('127f3184-fb0e-4b0b-8088-1a468c2bba52', 'in_progress',       'In Progress',       '#3b82f6', 20, false, false),
  ('127f3184-fb0e-4b0b-8088-1a468c2bba52', 'rough_cut',         'Rough Cut',         '#8b5cf6', 30, true,  false),
  ('127f3184-fb0e-4b0b-8088-1a468c2bba52', 'internal_revision', 'Internal Revision', '#f59e0b', 40, false, false),
  ('127f3184-fb0e-4b0b-8088-1a468c2bba52', 'ready_edit',        'Ready Edit',        '#06b6d4', 50, false, false),
  ('127f3184-fb0e-4b0b-8088-1a468c2bba52', 'client_revision',   'Client Revision',   '#f97316', 60, true,  false),
  ('127f3184-fb0e-4b0b-8088-1a468c2bba52', 'client_approved',   'Client Approved',   '#10b981', 70, true,  false),
  ('127f3184-fb0e-4b0b-8088-1a468c2bba52', 'scheduled',         'Scheduled',         '#0ea5e9', 80, true,  false),
  ('127f3184-fb0e-4b0b-8088-1a468c2bba52', 'posted',            'Posted',            '#22c55e', 90, true,  false),
  ('127f3184-fb0e-4b0b-8088-1a468c2bba52', 'declined',          'Declined',          '#ef4444', 100, false, false),
  ('127f3184-fb0e-4b0b-8088-1a468c2bba52', 'cancelled',         'Cancelled',         '#6b7280', 110, false, false)
ON CONFLICT (tenant_id, slug) DO NOTHING;

-- Seed video_types lookup
INSERT INTO public.video_types (tenant_id, slug, display_name, icon, sort_order, is_active) VALUES
  ('127f3184-fb0e-4b0b-8088-1a468c2bba52', 'talking_head',     'Talking Head',     'mic',         10, true),
  ('127f3184-fb0e-4b0b-8088-1a468c2bba52', 'voice_over',       'Voice Over',       'speaker',     20, true),
  ('127f3184-fb0e-4b0b-8088-1a468c2bba52', 'jump_cut',         'Jump Cut',         'scissors',    30, true),
  ('127f3184-fb0e-4b0b-8088-1a468c2bba52', 'engaging_series',  'Engaging Series',  'layers',      40, true),
  ('127f3184-fb0e-4b0b-8088-1a468c2bba52', 'caption_video',    'Caption Video',    'captions',    50, true),
  ('127f3184-fb0e-4b0b-8088-1a468c2bba52', 'ad',               'Ad',               'megaphone',   60, true),
  ('127f3184-fb0e-4b0b-8088-1a468c2bba52', 'vsl',              'VSL',              'video',       70, true)
ON CONFLICT (tenant_id, slug) DO NOTHING;