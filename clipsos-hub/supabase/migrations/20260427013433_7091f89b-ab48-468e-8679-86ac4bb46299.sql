UPDATE public.tenants
SET settings = COALESCE(settings, '{}'::jsonb) || '{"dev_mode": true}'::jsonb
WHERE slug = 'theclips';