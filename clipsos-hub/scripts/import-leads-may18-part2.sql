-- ClipsOS V2 Leads Import Script - Part 2

-- Leads 51 to 100

-- Lead 51:Test Test (test@test.com)
WITH inserted_person AS (
  INSERT INTO public.crm_people (
    tenant_id, full_name, email, phone, instagram, country, income_range, goal, obstacle, notes, created_at, updated_at
  ) VALUES (
    '520a4cfd-5183-4e11-aecc-bc71a52978b6',
    'Test Test',
    'test@test.com',
    '+1234',
    '@test',
    'United Arab Emirates',
    'More than $10k /mo',
    'test',
    'test',
    NULL,
    '2026-05-06T20:00:00.000Z',
    '2026-05-06T20:00:00.000Z'
  )
  ON CONFLICT (tenant_id, email) WHERE (email IS NOT NULL) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    phone = COALESCE(crm_people.phone, EXCLUDED.phone),
    instagram = COALESCE(crm_people.instagram, EXCLUDED.instagram),
    country = COALESCE(crm_people.country, EXCLUDED.country),
    income_range = COALESCE(crm_people.income_range, EXCLUDED.income_range),
    goal = COALESCE(crm_people.goal, EXCLUDED.goal),
    obstacle = COALESCE(crm_people.obstacle, EXCLUDED.obstacle),
    notes = COALESCE(crm_people.notes, EXCLUDED.notes),
    updated_at = EXCLUDED.updated_at
  RETURNING id
),
existing_person AS (
  SELECT id FROM public.crm_people WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'test@test.com'
),
person_id_to_use AS (
  SELECT id FROM inserted_person
  UNION ALL
  SELECT id FROM existing_person
  LIMIT 1
)
INSERT INTO public.leads (
  tenant_id, person_id, first_name, last_name, email, phone, social_username, business_type, monthly_income_range, goals_objectives, obstacles, call_attendance_confirmation, status, raw_payload, country, content_language, is_qualified, created_at, updated_at
)
SELECT 
  '520a4cfd-5183-4e11-aecc-bc71a52978b6',
  (SELECT id FROM person_id_to_use),
  'Test',
  'Test',
  'test@test.com',
  '+1234',
  '@test',
  'Consultant',
  'More than $10k /mo',
  'test',
  'test',
  true,
  'new',
  '{"first_name":"Test","last_name":"Test","email":"test@test.com","phone":"+1234","social_username":"@test","country":"United Arab Emirates","content_language":"","business_type":"Consultant","monthly_income_range":"More than $10k /mo","goals_objectives":"test","obstacles":"test","call_attendance_confirmation":"Yes","status":"new","notes":"","date_added":"May 7, 2026"}'::jsonb,
  'United Arab Emirates',
  NULL,
  false,
  '2026-05-06T20:00:00.000Z',
  '2026-05-06T20:00:00.000Z'
WHERE NOT EXISTS (
  SELECT 1 FROM public.leads WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'test@test.com'
);

-- Lead 52:Rania Barghout (rania@thenextchapter.vip)
WITH inserted_person AS (
  INSERT INTO public.crm_people (
    tenant_id, full_name, email, phone, instagram, country, income_range, goal, obstacle, notes, created_at, updated_at
  ) VALUES (
    '520a4cfd-5183-4e11-aecc-bc71a52978b6',
    'Rania Barghout',
    'rania@thenextchapter.vip',
    '+971585889780',
    '@raniabarghoutofficial',
    'United Arab Emirates',
    'Between $5k & $10k /mo',
    'My goals are to get more followers and more engagement and subsequently more subscribers and ultimately more clients',
    'My biggest challenges are I don''t have enough followers, views,  clicks on services,  etc',
    NULL,
    '2026-05-05T20:00:00.000Z',
    '2026-05-05T20:00:00.000Z'
  )
  ON CONFLICT (tenant_id, email) WHERE (email IS NOT NULL) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    phone = COALESCE(crm_people.phone, EXCLUDED.phone),
    instagram = COALESCE(crm_people.instagram, EXCLUDED.instagram),
    country = COALESCE(crm_people.country, EXCLUDED.country),
    income_range = COALESCE(crm_people.income_range, EXCLUDED.income_range),
    goal = COALESCE(crm_people.goal, EXCLUDED.goal),
    obstacle = COALESCE(crm_people.obstacle, EXCLUDED.obstacle),
    notes = COALESCE(crm_people.notes, EXCLUDED.notes),
    updated_at = EXCLUDED.updated_at
  RETURNING id
),
existing_person AS (
  SELECT id FROM public.crm_people WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'rania@thenextchapter.vip'
),
person_id_to_use AS (
  SELECT id FROM inserted_person
  UNION ALL
  SELECT id FROM existing_person
  LIMIT 1
)
INSERT INTO public.leads (
  tenant_id, person_id, first_name, last_name, email, phone, social_username, business_type, monthly_income_range, goals_objectives, obstacles, call_attendance_confirmation, status, raw_payload, country, content_language, is_qualified, created_at, updated_at
)
SELECT 
  '520a4cfd-5183-4e11-aecc-bc71a52978b6',
  (SELECT id FROM person_id_to_use),
  'Rania',
  'Barghout',
  'rania@thenextchapter.vip',
  '+971585889780',
  '@raniabarghoutofficial',
  'Content Creator, Online Coach, Consultant, Service Provider',
  'Between $5k & $10k /mo',
  'My goals are to get more followers and more engagement and subsequently more subscribers and ultimately more clients',
  'My biggest challenges are I don''t have enough followers, views,  clicks on services,  etc',
  true,
  'new',
  '{"first_name":"Rania","last_name":"Barghout","email":"rania@thenextchapter.vip","phone":"+971585889780","social_username":"@raniabarghoutofficial","country":"United Arab Emirates","content_language":"","business_type":"Content Creator, Online Coach, Consultant, Service Provider","monthly_income_range":"Between $5k & $10k /mo","goals_objectives":"My goals are to get more followers and more engagement and subsequently more subscribers and ultimately more clients","obstacles":"My biggest challenges are I don''t have enough followers, views,  clicks on services,  etc","call_attendance_confirmation":"Yes","status":"new","notes":"","date_added":"May 6, 2026"}'::jsonb,
  'United Arab Emirates',
  NULL,
  false,
  '2026-05-05T20:00:00.000Z',
  '2026-05-05T20:00:00.000Z'
WHERE NOT EXISTS (
  SELECT 1 FROM public.leads WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'rania@thenextchapter.vip'
);

-- Lead 53:Safwan Ayach (griffine.no2@gmail.com)
WITH inserted_person AS (
  INSERT INTO public.crm_people (
    tenant_id, full_name, email, phone, instagram, country, income_range, goal, obstacle, notes, created_at, updated_at
  ) VALUES (
    '520a4cfd-5183-4e11-aecc-bc71a52978b6',
    'Safwan Ayach',
    'griffine.no2@gmail.com',
    '0544526651',
    'Jj',
    'United Arab Emirates',
    'Between $5k & $10k /mo',
    'Go viral',
    'I don’t have time',
    NULL,
    '2026-05-05T20:00:00.000Z',
    '2026-05-05T20:00:00.000Z'
  )
  ON CONFLICT (tenant_id, email) WHERE (email IS NOT NULL) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    phone = COALESCE(crm_people.phone, EXCLUDED.phone),
    instagram = COALESCE(crm_people.instagram, EXCLUDED.instagram),
    country = COALESCE(crm_people.country, EXCLUDED.country),
    income_range = COALESCE(crm_people.income_range, EXCLUDED.income_range),
    goal = COALESCE(crm_people.goal, EXCLUDED.goal),
    obstacle = COALESCE(crm_people.obstacle, EXCLUDED.obstacle),
    notes = COALESCE(crm_people.notes, EXCLUDED.notes),
    updated_at = EXCLUDED.updated_at
  RETURNING id
),
existing_person AS (
  SELECT id FROM public.crm_people WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'griffine.no2@gmail.com'
),
person_id_to_use AS (
  SELECT id FROM inserted_person
  UNION ALL
  SELECT id FROM existing_person
  LIMIT 1
)
INSERT INTO public.leads (
  tenant_id, person_id, first_name, last_name, email, phone, social_username, business_type, monthly_income_range, goals_objectives, obstacles, call_attendance_confirmation, status, raw_payload, country, content_language, is_qualified, created_at, updated_at
)
SELECT 
  '520a4cfd-5183-4e11-aecc-bc71a52978b6',
  (SELECT id FROM person_id_to_use),
  'Safwan',
  'Ayach',
  'griffine.no2@gmail.com',
  '0544526651',
  'Jj',
  'Consultant',
  'Between $5k & $10k /mo',
  'Go viral',
  'I don’t have time',
  true,
  'new',
  '{"first_name":"Safwan","last_name":"Ayach","email":"griffine.no2@gmail.com","phone":"0544526651","social_username":"Jj","country":"United Arab Emirates","content_language":"","business_type":"Consultant","monthly_income_range":"Between $5k & $10k /mo","goals_objectives":"Go viral","obstacles":"I don’t have time","call_attendance_confirmation":"Yes","status":"new","notes":"","date_added":"May 6, 2026"}'::jsonb,
  'United Arab Emirates',
  NULL,
  false,
  '2026-05-05T20:00:00.000Z',
  '2026-05-05T20:00:00.000Z'
WHERE NOT EXISTS (
  SELECT 1 FROM public.leads WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'griffine.no2@gmail.com'
);

-- Lead 54:Selin Cetin (scmacos@icloud.com)
WITH inserted_person AS (
  INSERT INTO public.crm_people (
    tenant_id, full_name, email, phone, instagram, country, income_range, goal, obstacle, notes, created_at, updated_at
  ) VALUES (
    '520a4cfd-5183-4e11-aecc-bc71a52978b6',
    'Selin Cetin',
    'scmacos@icloud.com',
    '0585706595',
    'soldbyselin',
    'United Arab Emirates',
    'Between $5k & $10k /mo',
    'I am looking to generate videos from just 1 clip and save time',
    'I want to generate multiple videos with AU',
    NULL,
    '2026-05-05T20:00:00.000Z',
    '2026-05-05T20:00:00.000Z'
  )
  ON CONFLICT (tenant_id, email) WHERE (email IS NOT NULL) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    phone = COALESCE(crm_people.phone, EXCLUDED.phone),
    instagram = COALESCE(crm_people.instagram, EXCLUDED.instagram),
    country = COALESCE(crm_people.country, EXCLUDED.country),
    income_range = COALESCE(crm_people.income_range, EXCLUDED.income_range),
    goal = COALESCE(crm_people.goal, EXCLUDED.goal),
    obstacle = COALESCE(crm_people.obstacle, EXCLUDED.obstacle),
    notes = COALESCE(crm_people.notes, EXCLUDED.notes),
    updated_at = EXCLUDED.updated_at
  RETURNING id
),
existing_person AS (
  SELECT id FROM public.crm_people WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'scmacos@icloud.com'
),
person_id_to_use AS (
  SELECT id FROM inserted_person
  UNION ALL
  SELECT id FROM existing_person
  LIMIT 1
)
INSERT INTO public.leads (
  tenant_id, person_id, first_name, last_name, email, phone, social_username, business_type, monthly_income_range, goals_objectives, obstacles, call_attendance_confirmation, status, raw_payload, country, content_language, is_qualified, created_at, updated_at
)
SELECT 
  '520a4cfd-5183-4e11-aecc-bc71a52978b6',
  (SELECT id FROM person_id_to_use),
  'Selin',
  'Cetin',
  'scmacos@icloud.com',
  '0585706595',
  'soldbyselin',
  'Entrepreneur, Consultant',
  'Between $5k & $10k /mo',
  'I am looking to generate videos from just 1 clip and save time',
  'I want to generate multiple videos with AU',
  true,
  'new',
  '{"first_name":"Selin","last_name":"Cetin","email":"scmacos@icloud.com","phone":"0585706595","social_username":"soldbyselin","country":"United Arab Emirates","content_language":"","business_type":"Entrepreneur, Consultant","monthly_income_range":"Between $5k & $10k /mo","goals_objectives":"I am looking to generate videos from just 1 clip and save time","obstacles":"I want to generate multiple videos with AU","call_attendance_confirmation":"Yes","status":"new","notes":"","date_added":"May 6, 2026"}'::jsonb,
  'United Arab Emirates',
  NULL,
  false,
  '2026-05-05T20:00:00.000Z',
  '2026-05-05T20:00:00.000Z'
WHERE NOT EXISTS (
  SELECT 1 FROM public.leads WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'scmacos@icloud.com'
);

-- Lead 55:Francesco Ceccarini (francesco@bullwaves.com)
WITH inserted_person AS (
  INSERT INTO public.crm_people (
    tenant_id, full_name, email, phone, instagram, country, income_range, goal, obstacle, notes, created_at, updated_at
  ) VALUES (
    '520a4cfd-5183-4e11-aecc-bc71a52978b6',
    'Francesco Ceccarini',
    'francesco@bullwaves.com',
    '+971585870416',
    'Francescoceccarini4',
    'United Arab Emirates',
    'Between $5k & $10k /mo',
    'I want to build a strong personal brand in the forex and affiliate marketing space to increase the visibility and credibility of my online trading broker and prop firm.

The goal is to attract more affiliates, partners, and traders organically through high-quality content and founder-led branding. I need help creating a consistent content strategy across TikTok, Instagram, YouTube, X, and LinkedIn using clips, podcasts, storytelling, educational content, and viral formats.

Ultimately, I want to generate more affiliate partnerships, trust, and revenue for the business.',
    'The biggest challenge is consistency and content execution at scale.

We have the experience and ideas, but not yet a strong founder-led media presence. The industry is crowded and often lacks trust, so standing out with authentic, premium branding is important.

We need a system to consistently turn our knowledge and daily operations into engaging content that attracts real affiliates and clients, not just views.',
    NULL,
    '2026-05-05T20:00:00.000Z',
    '2026-05-05T20:00:00.000Z'
  )
  ON CONFLICT (tenant_id, email) WHERE (email IS NOT NULL) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    phone = COALESCE(crm_people.phone, EXCLUDED.phone),
    instagram = COALESCE(crm_people.instagram, EXCLUDED.instagram),
    country = COALESCE(crm_people.country, EXCLUDED.country),
    income_range = COALESCE(crm_people.income_range, EXCLUDED.income_range),
    goal = COALESCE(crm_people.goal, EXCLUDED.goal),
    obstacle = COALESCE(crm_people.obstacle, EXCLUDED.obstacle),
    notes = COALESCE(crm_people.notes, EXCLUDED.notes),
    updated_at = EXCLUDED.updated_at
  RETURNING id
),
existing_person AS (
  SELECT id FROM public.crm_people WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'francesco@bullwaves.com'
),
person_id_to_use AS (
  SELECT id FROM inserted_person
  UNION ALL
  SELECT id FROM existing_person
  LIMIT 1
)
INSERT INTO public.leads (
  tenant_id, person_id, first_name, last_name, email, phone, social_username, business_type, monthly_income_range, goals_objectives, obstacles, call_attendance_confirmation, status, raw_payload, country, content_language, is_qualified, created_at, updated_at
)
SELECT 
  '520a4cfd-5183-4e11-aecc-bc71a52978b6',
  (SELECT id FROM person_id_to_use),
  'Francesco',
  'Ceccarini',
  'francesco@bullwaves.com',
  '+971585870416',
  'Francescoceccarini4',
  'Entrepreneur',
  'Between $5k & $10k /mo',
  'I want to build a strong personal brand in the forex and affiliate marketing space to increase the visibility and credibility of my online trading broker and prop firm.

The goal is to attract more affiliates, partners, and traders organically through high-quality content and founder-led branding. I need help creating a consistent content strategy across TikTok, Instagram, YouTube, X, and LinkedIn using clips, podcasts, storytelling, educational content, and viral formats.

Ultimately, I want to generate more affiliate partnerships, trust, and revenue for the business.',
  'The biggest challenge is consistency and content execution at scale.

We have the experience and ideas, but not yet a strong founder-led media presence. The industry is crowded and often lacks trust, so standing out with authentic, premium branding is important.

We need a system to consistently turn our knowledge and daily operations into engaging content that attracts real affiliates and clients, not just views.',
  true,
  'new',
  '{"first_name":"Francesco","last_name":"Ceccarini","email":"francesco@bullwaves.com","phone":"+971585870416","social_username":"Francescoceccarini4","country":"United Arab Emirates","content_language":"","business_type":"Entrepreneur","monthly_income_range":"Between $5k & $10k /mo","goals_objectives":"I want to build a strong personal brand in the forex and affiliate marketing space to increase the visibility and credibility of my online trading broker and prop firm.\n\nThe goal is to attract more affiliates, partners, and traders organically through high-quality content and founder-led branding. I need help creating a consistent content strategy across TikTok, Instagram, YouTube, X, and LinkedIn using clips, podcasts, storytelling, educational content, and viral formats.\n\nUltimately, I want to generate more affiliate partnerships, trust, and revenue for the business.","obstacles":"The biggest challenge is consistency and content execution at scale.\n\nWe have the experience and ideas, but not yet a strong founder-led media presence. The industry is crowded and often lacks trust, so standing out with authentic, premium branding is important.\n\nWe need a system to consistently turn our knowledge and daily operations into engaging content that attracts real affiliates and clients, not just views.","call_attendance_confirmation":"Yes","status":"new","notes":"","date_added":"May 6, 2026"}'::jsonb,
  'United Arab Emirates',
  NULL,
  false,
  '2026-05-05T20:00:00.000Z',
  '2026-05-05T20:00:00.000Z'
WHERE NOT EXISTS (
  SELECT 1 FROM public.leads WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'francesco@bullwaves.com'
);

-- Lead 56:Lucas Silva (lucassilva.malden@gmail.com)
WITH inserted_person AS (
  INSERT INTO public.crm_people (
    tenant_id, full_name, email, phone, instagram, country, income_range, goal, obstacle, notes, created_at, updated_at
  ) VALUES (
    '520a4cfd-5183-4e11-aecc-bc71a52978b6',
    'Lucas Silva',
    'lucassilva.malden@gmail.com',
    '5612093230',
    '@VIP.RIPS',
    'United States of America (the)',
    'More than $10k /mo',
    'we are looking to be the biggest brand in the space.',
    'we are currently building out a marketing dept.',
    NULL,
    '2026-05-04T20:00:00.000Z',
    '2026-05-04T20:00:00.000Z'
  )
  ON CONFLICT (tenant_id, email) WHERE (email IS NOT NULL) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    phone = COALESCE(crm_people.phone, EXCLUDED.phone),
    instagram = COALESCE(crm_people.instagram, EXCLUDED.instagram),
    country = COALESCE(crm_people.country, EXCLUDED.country),
    income_range = COALESCE(crm_people.income_range, EXCLUDED.income_range),
    goal = COALESCE(crm_people.goal, EXCLUDED.goal),
    obstacle = COALESCE(crm_people.obstacle, EXCLUDED.obstacle),
    notes = COALESCE(crm_people.notes, EXCLUDED.notes),
    updated_at = EXCLUDED.updated_at
  RETURNING id
),
existing_person AS (
  SELECT id FROM public.crm_people WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'lucassilva.malden@gmail.com'
),
person_id_to_use AS (
  SELECT id FROM inserted_person
  UNION ALL
  SELECT id FROM existing_person
  LIMIT 1
)
INSERT INTO public.leads (
  tenant_id, person_id, first_name, last_name, email, phone, social_username, business_type, monthly_income_range, goals_objectives, obstacles, call_attendance_confirmation, status, raw_payload, country, content_language, is_qualified, created_at, updated_at
)
SELECT 
  '520a4cfd-5183-4e11-aecc-bc71a52978b6',
  (SELECT id FROM person_id_to_use),
  'Lucas',
  'Silva',
  'lucassilva.malden@gmail.com',
  '5612093230',
  '@VIP.RIPS',
  'We run breaks on sports cards and sell on whatnot.',
  'More than $10k /mo',
  'we are looking to be the biggest brand in the space.',
  'we are currently building out a marketing dept.',
  true,
  'new',
  '{"first_name":"Lucas","last_name":"Silva","email":"lucassilva.malden@gmail.com","phone":"5612093230","social_username":"@VIP.RIPS","country":"United States of America (the)","content_language":"","business_type":"We run breaks on sports cards and sell on whatnot.","monthly_income_range":"More than $10k /mo","goals_objectives":"we are looking to be the biggest brand in the space.","obstacles":"we are currently building out a marketing dept.","call_attendance_confirmation":"Yes","status":"new","notes":"","date_added":"May 5, 2026"}'::jsonb,
  'United States of America (the)',
  NULL,
  false,
  '2026-05-04T20:00:00.000Z',
  '2026-05-04T20:00:00.000Z'
WHERE NOT EXISTS (
  SELECT 1 FROM public.leads WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'lucassilva.malden@gmail.com'
);

-- Lead 57:Mukhammadjon Tilavov (tilavoff27@gmail.com)
WITH inserted_person AS (
  INSERT INTO public.crm_people (
    tenant_id, full_name, email, phone, instagram, country, income_range, goal, obstacle, notes, created_at, updated_at
  ) VALUES (
    '520a4cfd-5183-4e11-aecc-bc71a52978b6',
    'Mukhammadjon Tilavov',
    'tilavoff27@gmail.com',
    '+971551921080',
    '@mukhammadjon_tilavov',
    'United Arab Emirates',
    'Between $5k & $10k /mo',
    '100k followers by the end of the year',
    'Tired of making content on my own',
    NULL,
    '2026-05-04T20:00:00.000Z',
    '2026-05-04T20:00:00.000Z'
  )
  ON CONFLICT (tenant_id, email) WHERE (email IS NOT NULL) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    phone = COALESCE(crm_people.phone, EXCLUDED.phone),
    instagram = COALESCE(crm_people.instagram, EXCLUDED.instagram),
    country = COALESCE(crm_people.country, EXCLUDED.country),
    income_range = COALESCE(crm_people.income_range, EXCLUDED.income_range),
    goal = COALESCE(crm_people.goal, EXCLUDED.goal),
    obstacle = COALESCE(crm_people.obstacle, EXCLUDED.obstacle),
    notes = COALESCE(crm_people.notes, EXCLUDED.notes),
    updated_at = EXCLUDED.updated_at
  RETURNING id
),
existing_person AS (
  SELECT id FROM public.crm_people WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'tilavoff27@gmail.com'
),
person_id_to_use AS (
  SELECT id FROM inserted_person
  UNION ALL
  SELECT id FROM existing_person
  LIMIT 1
)
INSERT INTO public.leads (
  tenant_id, person_id, first_name, last_name, email, phone, social_username, business_type, monthly_income_range, goals_objectives, obstacles, call_attendance_confirmation, status, raw_payload, country, content_language, is_qualified, created_at, updated_at
)
SELECT 
  '520a4cfd-5183-4e11-aecc-bc71a52978b6',
  (SELECT id FROM person_id_to_use),
  'Mukhammadjon',
  'Tilavov',
  'tilavoff27@gmail.com',
  '+971551921080',
  '@mukhammadjon_tilavov',
  'Real estate agent /ceo',
  'Between $5k & $10k /mo',
  '100k followers by the end of the year',
  'Tired of making content on my own',
  true,
  'new',
  '{"first_name":"Mukhammadjon","last_name":"Tilavov","email":"tilavoff27@gmail.com","phone":"+971551921080","social_username":"@mukhammadjon_tilavov","country":"United Arab Emirates","content_language":"","business_type":"Real estate agent /ceo","monthly_income_range":"Between $5k & $10k /mo","goals_objectives":"100k followers by the end of the year","obstacles":"Tired of making content on my own","call_attendance_confirmation":"Yes","status":"new","notes":"","date_added":"May 5, 2026"}'::jsonb,
  'United Arab Emirates',
  NULL,
  false,
  '2026-05-04T20:00:00.000Z',
  '2026-05-04T20:00:00.000Z'
WHERE NOT EXISTS (
  SELECT 1 FROM public.leads WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'tilavoff27@gmail.com'
);

-- Lead 58:Najah Musthafa (najahmusthafa@gmail.com)
WITH inserted_person AS (
  INSERT INTO public.crm_people (
    tenant_id, full_name, email, phone, instagram, country, income_range, goal, obstacle, notes, created_at, updated_at
  ) VALUES (
    '520a4cfd-5183-4e11-aecc-bc71a52978b6',
    'Najah Musthafa',
    'najahmusthafa@gmail.com',
    '+971585614836',
    '@najah_thetherapist',
    'United Arab Emirates',
    'Between $5k & $10k /mo',
    'I would like to become a thought leader in my industry which is mental health as I am planning to open my own clinic next year and would like to build my personal brand to help with leads when the time is right.',
    'Time and strategy',
    NULL,
    '2026-05-04T20:00:00.000Z',
    '2026-05-04T20:00:00.000Z'
  )
  ON CONFLICT (tenant_id, email) WHERE (email IS NOT NULL) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    phone = COALESCE(crm_people.phone, EXCLUDED.phone),
    instagram = COALESCE(crm_people.instagram, EXCLUDED.instagram),
    country = COALESCE(crm_people.country, EXCLUDED.country),
    income_range = COALESCE(crm_people.income_range, EXCLUDED.income_range),
    goal = COALESCE(crm_people.goal, EXCLUDED.goal),
    obstacle = COALESCE(crm_people.obstacle, EXCLUDED.obstacle),
    notes = COALESCE(crm_people.notes, EXCLUDED.notes),
    updated_at = EXCLUDED.updated_at
  RETURNING id
),
existing_person AS (
  SELECT id FROM public.crm_people WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'najahmusthafa@gmail.com'
),
person_id_to_use AS (
  SELECT id FROM inserted_person
  UNION ALL
  SELECT id FROM existing_person
  LIMIT 1
)
INSERT INTO public.leads (
  tenant_id, person_id, first_name, last_name, email, phone, social_username, business_type, monthly_income_range, goals_objectives, obstacles, call_attendance_confirmation, status, raw_payload, country, content_language, is_qualified, created_at, updated_at
)
SELECT 
  '520a4cfd-5183-4e11-aecc-bc71a52978b6',
  (SELECT id FROM person_id_to_use),
  'Najah',
  'Musthafa',
  'najahmusthafa@gmail.com',
  '+971585614836',
  '@najah_thetherapist',
  'Entrepreneur, Doctor',
  'Between $5k & $10k /mo',
  'I would like to become a thought leader in my industry which is mental health as I am planning to open my own clinic next year and would like to build my personal brand to help with leads when the time is right.',
  'Time and strategy',
  true,
  'new',
  '{"first_name":"Najah","last_name":"Musthafa","email":"najahmusthafa@gmail.com","phone":"+971585614836","social_username":"@najah_thetherapist","country":"United Arab Emirates","content_language":"","business_type":"Entrepreneur, Doctor","monthly_income_range":"Between $5k & $10k /mo","goals_objectives":"I would like to become a thought leader in my industry which is mental health as I am planning to open my own clinic next year and would like to build my personal brand to help with leads when the time is right.","obstacles":"Time and strategy","call_attendance_confirmation":"Yes","status":"new","notes":"","date_added":"May 5, 2026"}'::jsonb,
  'United Arab Emirates',
  NULL,
  false,
  '2026-05-04T20:00:00.000Z',
  '2026-05-04T20:00:00.000Z'
WHERE NOT EXISTS (
  SELECT 1 FROM public.leads WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'najahmusthafa@gmail.com'
);

-- Lead 59:Jagdish Golani (jsginfinite@gmail.com)
WITH inserted_person AS (
  INSERT INTO public.crm_people (
    tenant_id, full_name, email, phone, instagram, country, income_range, goal, obstacle, notes, created_at, updated_at
  ) VALUES (
    '520a4cfd-5183-4e11-aecc-bc71a52978b6',
    'Jagdish Golani',
    'jsginfinite@gmail.com',
    '+971551477859',
    'Jsgrealty',
    'United Arab Emirates',
    'Between $5k & $10k /mo',
    'Looking for growing my social media to get more presence & leads and business',
    'Knowledge',
    NULL,
    '2026-05-04T20:00:00.000Z',
    '2026-05-04T20:00:00.000Z'
  )
  ON CONFLICT (tenant_id, email) WHERE (email IS NOT NULL) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    phone = COALESCE(crm_people.phone, EXCLUDED.phone),
    instagram = COALESCE(crm_people.instagram, EXCLUDED.instagram),
    country = COALESCE(crm_people.country, EXCLUDED.country),
    income_range = COALESCE(crm_people.income_range, EXCLUDED.income_range),
    goal = COALESCE(crm_people.goal, EXCLUDED.goal),
    obstacle = COALESCE(crm_people.obstacle, EXCLUDED.obstacle),
    notes = COALESCE(crm_people.notes, EXCLUDED.notes),
    updated_at = EXCLUDED.updated_at
  RETURNING id
),
existing_person AS (
  SELECT id FROM public.crm_people WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'jsginfinite@gmail.com'
),
person_id_to_use AS (
  SELECT id FROM inserted_person
  UNION ALL
  SELECT id FROM existing_person
  LIMIT 1
)
INSERT INTO public.leads (
  tenant_id, person_id, first_name, last_name, email, phone, social_username, business_type, monthly_income_range, goals_objectives, obstacles, call_attendance_confirmation, status, raw_payload, country, content_language, is_qualified, created_at, updated_at
)
SELECT 
  '520a4cfd-5183-4e11-aecc-bc71a52978b6',
  (SELECT id FROM person_id_to_use),
  'Jagdish',
  'Golani',
  'jsginfinite@gmail.com',
  '+971551477859',
  'Jsgrealty',
  'Service Provider',
  'Between $5k & $10k /mo',
  'Looking for growing my social media to get more presence & leads and business',
  'Knowledge',
  true,
  'new',
  '{"first_name":"Jagdish","last_name":"Golani","email":"jsginfinite@gmail.com","phone":"+971551477859","social_username":"Jsgrealty","country":"United Arab Emirates","content_language":"","business_type":"Service Provider","monthly_income_range":"Between $5k & $10k /mo","goals_objectives":"Looking for growing my social media to get more presence & leads and business","obstacles":"Knowledge","call_attendance_confirmation":"Yes","status":"new","notes":"","date_added":"May 5, 2026"}'::jsonb,
  'United Arab Emirates',
  NULL,
  false,
  '2026-05-04T20:00:00.000Z',
  '2026-05-04T20:00:00.000Z'
WHERE NOT EXISTS (
  SELECT 1 FROM public.leads WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'jsginfinite@gmail.com'
);

-- Lead 60:Khalid Majed (khalidmajed7@gmail.com)
WITH inserted_person AS (
  INSERT INTO public.crm_people (
    tenant_id, full_name, email, phone, instagram, country, income_range, goal, obstacle, notes, created_at, updated_at
  ) VALUES (
    '520a4cfd-5183-4e11-aecc-bc71a52978b6',
    'Khalid Majed',
    'khalidmajed7@gmail.com',
    '00971504702006',
    '@drkhalidmajed',
    'United Arab Emirates',
    'Between $5k & $10k /mo',
    'Trying to get more in touch with the audience in the East Coast region targeting Fujairah, to show my name in the area more often',
    'Content creation',
    NULL,
    '2026-05-03T20:00:00.000Z',
    '2026-05-03T20:00:00.000Z'
  )
  ON CONFLICT (tenant_id, email) WHERE (email IS NOT NULL) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    phone = COALESCE(crm_people.phone, EXCLUDED.phone),
    instagram = COALESCE(crm_people.instagram, EXCLUDED.instagram),
    country = COALESCE(crm_people.country, EXCLUDED.country),
    income_range = COALESCE(crm_people.income_range, EXCLUDED.income_range),
    goal = COALESCE(crm_people.goal, EXCLUDED.goal),
    obstacle = COALESCE(crm_people.obstacle, EXCLUDED.obstacle),
    notes = COALESCE(crm_people.notes, EXCLUDED.notes),
    updated_at = EXCLUDED.updated_at
  RETURNING id
),
existing_person AS (
  SELECT id FROM public.crm_people WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'khalidmajed7@gmail.com'
),
person_id_to_use AS (
  SELECT id FROM inserted_person
  UNION ALL
  SELECT id FROM existing_person
  LIMIT 1
)
INSERT INTO public.leads (
  tenant_id, person_id, first_name, last_name, email, phone, social_username, business_type, monthly_income_range, goals_objectives, obstacles, call_attendance_confirmation, status, raw_payload, country, content_language, is_qualified, created_at, updated_at
)
SELECT 
  '520a4cfd-5183-4e11-aecc-bc71a52978b6',
  (SELECT id FROM person_id_to_use),
  'Khalid',
  'Majed',
  'khalidmajed7@gmail.com',
  '00971504702006',
  '@drkhalidmajed',
  'Doctor',
  'Between $5k & $10k /mo',
  'Trying to get more in touch with the audience in the East Coast region targeting Fujairah, to show my name in the area more often',
  'Content creation',
  true,
  'new',
  '{"first_name":"Khalid","last_name":"Majed","email":"khalidmajed7@gmail.com","phone":"00971504702006","social_username":"@drkhalidmajed","country":"United Arab Emirates","content_language":"","business_type":"Doctor","monthly_income_range":"Between $5k & $10k /mo","goals_objectives":"Trying to get more in touch with the audience in the East Coast region targeting Fujairah, to show my name in the area more often","obstacles":"Content creation","call_attendance_confirmation":"Yes","status":"new","notes":"","date_added":"May 4, 2026"}'::jsonb,
  'United Arab Emirates',
  NULL,
  false,
  '2026-05-03T20:00:00.000Z',
  '2026-05-03T20:00:00.000Z'
WHERE NOT EXISTS (
  SELECT 1 FROM public.leads WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'khalidmajed7@gmail.com'
);

-- Lead 61:Drhanadi Khamiri (hanadi.khamiri@hotmail.com)
WITH inserted_person AS (
  INSERT INTO public.crm_people (
    tenant_id, full_name, email, phone, instagram, country, income_range, goal, obstacle, notes, created_at, updated_at
  ) VALUES (
    '520a4cfd-5183-4e11-aecc-bc71a52978b6',
    'Drhanadi Khamiri',
    'hanadi.khamiri@hotmail.com',
    '0569523003',
    '@drhanadikhamiri',
    'United Arab Emirates',
    'More than $10k /mo',
    'Want to reach my voice to bigger audiance and having more patients',
    'Doing my best but i feel its not enough still not sure wrong steps am doing',
    NULL,
    '2026-05-03T20:00:00.000Z',
    '2026-05-03T20:00:00.000Z'
  )
  ON CONFLICT (tenant_id, email) WHERE (email IS NOT NULL) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    phone = COALESCE(crm_people.phone, EXCLUDED.phone),
    instagram = COALESCE(crm_people.instagram, EXCLUDED.instagram),
    country = COALESCE(crm_people.country, EXCLUDED.country),
    income_range = COALESCE(crm_people.income_range, EXCLUDED.income_range),
    goal = COALESCE(crm_people.goal, EXCLUDED.goal),
    obstacle = COALESCE(crm_people.obstacle, EXCLUDED.obstacle),
    notes = COALESCE(crm_people.notes, EXCLUDED.notes),
    updated_at = EXCLUDED.updated_at
  RETURNING id
),
existing_person AS (
  SELECT id FROM public.crm_people WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'hanadi.khamiri@hotmail.com'
),
person_id_to_use AS (
  SELECT id FROM inserted_person
  UNION ALL
  SELECT id FROM existing_person
  LIMIT 1
)
INSERT INTO public.leads (
  tenant_id, person_id, first_name, last_name, email, phone, social_username, business_type, monthly_income_range, goals_objectives, obstacles, call_attendance_confirmation, status, raw_payload, country, content_language, is_qualified, created_at, updated_at
)
SELECT 
  '520a4cfd-5183-4e11-aecc-bc71a52978b6',
  (SELECT id FROM person_id_to_use),
  'Drhanadi',
  'Khamiri',
  'hanadi.khamiri@hotmail.com',
  '0569523003',
  '@drhanadikhamiri',
  'Doctor',
  'More than $10k /mo',
  'Want to reach my voice to bigger audiance and having more patients',
  'Doing my best but i feel its not enough still not sure wrong steps am doing',
  true,
  'new',
  '{"first_name":"Drhanadi","last_name":"Khamiri","email":"hanadi.khamiri@hotmail.com","phone":"0569523003","social_username":"@drhanadikhamiri","country":"United Arab Emirates","content_language":"","business_type":"Doctor","monthly_income_range":"More than $10k /mo","goals_objectives":"Want to reach my voice to bigger audiance and having more patients","obstacles":"Doing my best but i feel its not enough still not sure wrong steps am doing","call_attendance_confirmation":"Yes","status":"new","notes":"","date_added":"May 4, 2026"}'::jsonb,
  'United Arab Emirates',
  NULL,
  false,
  '2026-05-03T20:00:00.000Z',
  '2026-05-03T20:00:00.000Z'
WHERE NOT EXISTS (
  SELECT 1 FROM public.leads WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'hanadi.khamiri@hotmail.com'
);

-- Lead 62:Anas Idries (anas.fouad@hotmail.com)
WITH inserted_person AS (
  INSERT INTO public.crm_people (
    tenant_id, full_name, email, phone, instagram, country, income_range, goal, obstacle, notes, created_at, updated_at
  ) VALUES (
    '520a4cfd-5183-4e11-aecc-bc71a52978b6',
    'Anas Idries',
    'anas.fouad@hotmail.com',
    '+971509060117',
    'anasprimeestates',
    'United Arab Emirates',
    'Between $5k & $10k /mo',
    'My content to reach the right people and make 5 X what am doing',
    'Current conditions in the area',
    NULL,
    '2026-05-03T20:00:00.000Z',
    '2026-05-03T20:00:00.000Z'
  )
  ON CONFLICT (tenant_id, email) WHERE (email IS NOT NULL) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    phone = COALESCE(crm_people.phone, EXCLUDED.phone),
    instagram = COALESCE(crm_people.instagram, EXCLUDED.instagram),
    country = COALESCE(crm_people.country, EXCLUDED.country),
    income_range = COALESCE(crm_people.income_range, EXCLUDED.income_range),
    goal = COALESCE(crm_people.goal, EXCLUDED.goal),
    obstacle = COALESCE(crm_people.obstacle, EXCLUDED.obstacle),
    notes = COALESCE(crm_people.notes, EXCLUDED.notes),
    updated_at = EXCLUDED.updated_at
  RETURNING id
),
existing_person AS (
  SELECT id FROM public.crm_people WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'anas.fouad@hotmail.com'
),
person_id_to_use AS (
  SELECT id FROM inserted_person
  UNION ALL
  SELECT id FROM existing_person
  LIMIT 1
)
INSERT INTO public.leads (
  tenant_id, person_id, first_name, last_name, email, phone, social_username, business_type, monthly_income_range, goals_objectives, obstacles, call_attendance_confirmation, status, raw_payload, country, content_language, is_qualified, created_at, updated_at
)
SELECT 
  '520a4cfd-5183-4e11-aecc-bc71a52978b6',
  (SELECT id FROM person_id_to_use),
  'Anas',
  'Idries',
  'anas.fouad@hotmail.com',
  '+971509060117',
  'anasprimeestates',
  'Consultant',
  'Between $5k & $10k /mo',
  'My content to reach the right people and make 5 X what am doing',
  'Current conditions in the area',
  true,
  'new',
  '{"first_name":"Anas","last_name":"Idries","email":"anas.fouad@hotmail.com","phone":"+971509060117","social_username":"anasprimeestates","country":"United Arab Emirates","content_language":"","business_type":"Consultant","monthly_income_range":"Between $5k & $10k /mo","goals_objectives":"My content to reach the right people and make 5 X what am doing","obstacles":"Current conditions in the area","call_attendance_confirmation":"Yes","status":"new","notes":"","date_added":"May 4, 2026"}'::jsonb,
  'United Arab Emirates',
  NULL,
  false,
  '2026-05-03T20:00:00.000Z',
  '2026-05-03T20:00:00.000Z'
WHERE NOT EXISTS (
  SELECT 1 FROM public.leads WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'anas.fouad@hotmail.com'
);

-- Lead 63:Halil Bircan (hbircan94@gmail.com)
WITH inserted_person AS (
  INSERT INTO public.crm_people (
    tenant_id, full_name, email, phone, instagram, country, income_range, goal, obstacle, notes, created_at, updated_at
  ) VALUES (
    '520a4cfd-5183-4e11-aecc-bc71a52978b6',
    'Halil Bircan',
    'hbircan94@gmail.com',
    '0585145337',
    'Halil.homes',
    'United Arab Emirates',
    'Between $5k & $10k /mo',
    'Get Lead’s for real estate',
    'Making videos on my own',
    NULL,
    '2026-05-02T20:00:00.000Z',
    '2026-05-02T20:00:00.000Z'
  )
  ON CONFLICT (tenant_id, email) WHERE (email IS NOT NULL) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    phone = COALESCE(crm_people.phone, EXCLUDED.phone),
    instagram = COALESCE(crm_people.instagram, EXCLUDED.instagram),
    country = COALESCE(crm_people.country, EXCLUDED.country),
    income_range = COALESCE(crm_people.income_range, EXCLUDED.income_range),
    goal = COALESCE(crm_people.goal, EXCLUDED.goal),
    obstacle = COALESCE(crm_people.obstacle, EXCLUDED.obstacle),
    notes = COALESCE(crm_people.notes, EXCLUDED.notes),
    updated_at = EXCLUDED.updated_at
  RETURNING id
),
existing_person AS (
  SELECT id FROM public.crm_people WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'hbircan94@gmail.com'
),
person_id_to_use AS (
  SELECT id FROM inserted_person
  UNION ALL
  SELECT id FROM existing_person
  LIMIT 1
)
INSERT INTO public.leads (
  tenant_id, person_id, first_name, last_name, email, phone, social_username, business_type, monthly_income_range, goals_objectives, obstacles, call_attendance_confirmation, status, raw_payload, country, content_language, is_qualified, created_at, updated_at
)
SELECT 
  '520a4cfd-5183-4e11-aecc-bc71a52978b6',
  (SELECT id FROM person_id_to_use),
  'Halil',
  'Bircan',
  'hbircan94@gmail.com',
  '0585145337',
  'Halil.homes',
  'Service Provider',
  'Between $5k & $10k /mo',
  'Get Lead’s for real estate',
  'Making videos on my own',
  true,
  'new',
  '{"first_name":"Halil","last_name":"Bircan","email":"hbircan94@gmail.com","phone":"0585145337","social_username":"Halil.homes","country":"United Arab Emirates","content_language":"","business_type":"Service Provider","monthly_income_range":"Between $5k & $10k /mo","goals_objectives":"Get Lead’s for real estate","obstacles":"Making videos on my own","call_attendance_confirmation":"Yes","status":"new","notes":"","date_added":"May 3, 2026"}'::jsonb,
  'United Arab Emirates',
  NULL,
  false,
  '2026-05-02T20:00:00.000Z',
  '2026-05-02T20:00:00.000Z'
WHERE NOT EXISTS (
  SELECT 1 FROM public.leads WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'hbircan94@gmail.com'
);

-- Lead 64:Baraa Kalash (baraakalashbaraakalash@gmail.com)
WITH inserted_person AS (
  INSERT INTO public.crm_people (
    tenant_id, full_name, email, phone, instagram, country, income_range, goal, obstacle, notes, created_at, updated_at
  ) VALUES (
    '520a4cfd-5183-4e11-aecc-bc71a52978b6',
    'Baraa Kalash',
    'baraakalashbaraakalash@gmail.com',
    '+971524281834',
    '@larynxclinic',
    'United Arab Emirates',
    'More than $10k /mo',
    'My end goal is to increase the number my patients, specifically the Laryngology patients (Vocal Cords, aka voice and swallowing disorders)',
    'The biggest obstacle is the lack of awareness about my presence in both cities.',
    NULL,
    '2026-05-02T20:00:00.000Z',
    '2026-05-02T20:00:00.000Z'
  )
  ON CONFLICT (tenant_id, email) WHERE (email IS NOT NULL) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    phone = COALESCE(crm_people.phone, EXCLUDED.phone),
    instagram = COALESCE(crm_people.instagram, EXCLUDED.instagram),
    country = COALESCE(crm_people.country, EXCLUDED.country),
    income_range = COALESCE(crm_people.income_range, EXCLUDED.income_range),
    goal = COALESCE(crm_people.goal, EXCLUDED.goal),
    obstacle = COALESCE(crm_people.obstacle, EXCLUDED.obstacle),
    notes = COALESCE(crm_people.notes, EXCLUDED.notes),
    updated_at = EXCLUDED.updated_at
  RETURNING id
),
existing_person AS (
  SELECT id FROM public.crm_people WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'baraakalashbaraakalash@gmail.com'
),
person_id_to_use AS (
  SELECT id FROM inserted_person
  UNION ALL
  SELECT id FROM existing_person
  LIMIT 1
)
INSERT INTO public.leads (
  tenant_id, person_id, first_name, last_name, email, phone, social_username, business_type, monthly_income_range, goals_objectives, obstacles, call_attendance_confirmation, status, raw_payload, country, content_language, is_qualified, created_at, updated_at
)
SELECT 
  '520a4cfd-5183-4e11-aecc-bc71a52978b6',
  (SELECT id FROM person_id_to_use),
  'Baraa',
  'Kalash',
  'baraakalashbaraakalash@gmail.com',
  '+971524281834',
  '@larynxclinic',
  'Doctor',
  'More than $10k /mo',
  'My end goal is to increase the number my patients, specifically the Laryngology patients (Vocal Cords, aka voice and swallowing disorders)',
  'The biggest obstacle is the lack of awareness about my presence in both cities.',
  true,
  'new',
  '{"first_name":"Baraa","last_name":"Kalash","email":"baraakalashbaraakalash@gmail.com","phone":"+971524281834","social_username":"@larynxclinic","country":"United Arab Emirates","content_language":"","business_type":"Doctor","monthly_income_range":"More than $10k /mo","goals_objectives":"My end goal is to increase the number my patients, specifically the Laryngology patients (Vocal Cords, aka voice and swallowing disorders)","obstacles":"The biggest obstacle is the lack of awareness about my presence in both cities.","call_attendance_confirmation":"Yes","status":"new","notes":"","date_added":"May 3, 2026"}'::jsonb,
  'United Arab Emirates',
  NULL,
  false,
  '2026-05-02T20:00:00.000Z',
  '2026-05-02T20:00:00.000Z'
WHERE NOT EXISTS (
  SELECT 1 FROM public.leads WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'baraakalashbaraakalash@gmail.com'
);

-- Lead 65:‏hamza Hamoud (hamza200191@gmail.com)
WITH inserted_person AS (
  INSERT INTO public.crm_people (
    tenant_id, full_name, email, phone, instagram, country, income_range, goal, obstacle, notes, created_at, updated_at
  ) VALUES (
    '520a4cfd-5183-4e11-aecc-bc71a52978b6',
    '‏hamza Hamoud',
    'hamza200191@gmail.com',
    '563936281',
    'Klipper.24',
    'United Arab Emirates',
    'Between $5k & $10k /mo',
    'Build a personal brand become a trusted advisor in my real estate field',
    'Everything',
    NULL,
    '2026-05-02T20:00:00.000Z',
    '2026-05-02T20:00:00.000Z'
  )
  ON CONFLICT (tenant_id, email) WHERE (email IS NOT NULL) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    phone = COALESCE(crm_people.phone, EXCLUDED.phone),
    instagram = COALESCE(crm_people.instagram, EXCLUDED.instagram),
    country = COALESCE(crm_people.country, EXCLUDED.country),
    income_range = COALESCE(crm_people.income_range, EXCLUDED.income_range),
    goal = COALESCE(crm_people.goal, EXCLUDED.goal),
    obstacle = COALESCE(crm_people.obstacle, EXCLUDED.obstacle),
    notes = COALESCE(crm_people.notes, EXCLUDED.notes),
    updated_at = EXCLUDED.updated_at
  RETURNING id
),
existing_person AS (
  SELECT id FROM public.crm_people WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'hamza200191@gmail.com'
),
person_id_to_use AS (
  SELECT id FROM inserted_person
  UNION ALL
  SELECT id FROM existing_person
  LIMIT 1
)
INSERT INTO public.leads (
  tenant_id, person_id, first_name, last_name, email, phone, social_username, business_type, monthly_income_range, goals_objectives, obstacles, call_attendance_confirmation, status, raw_payload, country, content_language, is_qualified, created_at, updated_at
)
SELECT 
  '520a4cfd-5183-4e11-aecc-bc71a52978b6',
  (SELECT id FROM person_id_to_use),
  '‏hamza',
  'Hamoud',
  'hamza200191@gmail.com',
  '563936281',
  'Klipper.24',
  'Consultant',
  'Between $5k & $10k /mo',
  'Build a personal brand become a trusted advisor in my real estate field',
  'Everything',
  true,
  'new',
  '{"first_name":"‏hamza","last_name":"Hamoud","email":"hamza200191@gmail.com","phone":"563936281","social_username":"Klipper.24","country":"United Arab Emirates","content_language":"","business_type":"Consultant","monthly_income_range":"Between $5k & $10k /mo","goals_objectives":"Build a personal brand become a trusted advisor in my real estate field","obstacles":"Everything","call_attendance_confirmation":"Yes","status":"new","notes":"","date_added":"May 3, 2026"}'::jsonb,
  'United Arab Emirates',
  NULL,
  false,
  '2026-05-02T20:00:00.000Z',
  '2026-05-02T20:00:00.000Z'
WHERE NOT EXISTS (
  SELECT 1 FROM public.leads WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'hamza200191@gmail.com'
);

-- Lead 66:Dhdb Dbdbdb (bdbdbdbd)
WITH inserted_person AS (
  INSERT INTO public.crm_people (
    tenant_id, full_name, email, phone, instagram, country, income_range, goal, obstacle, notes, created_at, updated_at
  ) VALUES (
    '520a4cfd-5183-4e11-aecc-bc71a52978b6',
    'Dhdb Dbdbdb',
    'bdbdbdbd',
    '454548',
    'Hdhdhd',
    'American Samoa',
    'Between $5k & $10k /mo',
    'Bdhdhdh',
    'Dhdhdhd',
    NULL,
    '2026-05-01T20:00:00.000Z',
    '2026-05-01T20:00:00.000Z'
  )
  ON CONFLICT (tenant_id, email) WHERE (email IS NOT NULL) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    phone = COALESCE(crm_people.phone, EXCLUDED.phone),
    instagram = COALESCE(crm_people.instagram, EXCLUDED.instagram),
    country = COALESCE(crm_people.country, EXCLUDED.country),
    income_range = COALESCE(crm_people.income_range, EXCLUDED.income_range),
    goal = COALESCE(crm_people.goal, EXCLUDED.goal),
    obstacle = COALESCE(crm_people.obstacle, EXCLUDED.obstacle),
    notes = COALESCE(crm_people.notes, EXCLUDED.notes),
    updated_at = EXCLUDED.updated_at
  RETURNING id
),
existing_person AS (
  SELECT id FROM public.crm_people WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'bdbdbdbd'
),
person_id_to_use AS (
  SELECT id FROM inserted_person
  UNION ALL
  SELECT id FROM existing_person
  LIMIT 1
)
INSERT INTO public.leads (
  tenant_id, person_id, first_name, last_name, email, phone, social_username, business_type, monthly_income_range, goals_objectives, obstacles, call_attendance_confirmation, status, raw_payload, country, content_language, is_qualified, created_at, updated_at
)
SELECT 
  '520a4cfd-5183-4e11-aecc-bc71a52978b6',
  (SELECT id FROM person_id_to_use),
  'Dhdb',
  'Dbdbdb',
  'bdbdbdbd',
  '454548',
  'Hdhdhd',
  'Consultant',
  'Between $5k & $10k /mo',
  'Bdhdhdh',
  'Dhdhdhd',
  true,
  'new',
  '{"first_name":"Dhdb","last_name":"Dbdbdb","email":"bdbdbdbd","phone":"454548","social_username":"Hdhdhd","country":"American Samoa","content_language":"","business_type":"Consultant","monthly_income_range":"Between $5k & $10k /mo","goals_objectives":"Bdhdhdh","obstacles":"Dhdhdhd","call_attendance_confirmation":"Yes","status":"new","notes":"","date_added":"May 2, 2026"}'::jsonb,
  'American Samoa',
  NULL,
  false,
  '2026-05-01T20:00:00.000Z',
  '2026-05-01T20:00:00.000Z'
WHERE NOT EXISTS (
  SELECT 1 FROM public.leads WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'bdbdbdbd'
);

-- Lead 67:Hameed BABELLI (hameedbabelli@gmail.com)
WITH inserted_person AS (
  INSERT INTO public.crm_people (
    tenant_id, full_name, email, phone, instagram, country, income_range, goal, obstacle, notes, created_at, updated_at
  ) VALUES (
    '520a4cfd-5183-4e11-aecc-bc71a52978b6',
    'Hameed BABELLI',
    'hameedbabelli@gmail.com',
    '0567524868',
    'Babelliclassics',
    'United Arab Emirates',
    'Between $5k & $10k /mo',
    'To reach the Clint I’m looking for in the classic and limited edition car niche',
    'Making the right content to go viral organically',
    NULL,
    '2026-05-01T20:00:00.000Z',
    '2026-05-01T20:00:00.000Z'
  )
  ON CONFLICT (tenant_id, email) WHERE (email IS NOT NULL) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    phone = COALESCE(crm_people.phone, EXCLUDED.phone),
    instagram = COALESCE(crm_people.instagram, EXCLUDED.instagram),
    country = COALESCE(crm_people.country, EXCLUDED.country),
    income_range = COALESCE(crm_people.income_range, EXCLUDED.income_range),
    goal = COALESCE(crm_people.goal, EXCLUDED.goal),
    obstacle = COALESCE(crm_people.obstacle, EXCLUDED.obstacle),
    notes = COALESCE(crm_people.notes, EXCLUDED.notes),
    updated_at = EXCLUDED.updated_at
  RETURNING id
),
existing_person AS (
  SELECT id FROM public.crm_people WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'hameedbabelli@gmail.com'
),
person_id_to_use AS (
  SELECT id FROM inserted_person
  UNION ALL
  SELECT id FROM existing_person
  LIMIT 1
)
INSERT INTO public.leads (
  tenant_id, person_id, first_name, last_name, email, phone, social_username, business_type, monthly_income_range, goals_objectives, obstacles, call_attendance_confirmation, status, raw_payload, country, content_language, is_qualified, created_at, updated_at
)
SELECT 
  '520a4cfd-5183-4e11-aecc-bc71a52978b6',
  (SELECT id FROM person_id_to_use),
  'Hameed',
  'BABELLI',
  'hameedbabelli@gmail.com',
  '0567524868',
  'Babelliclassics',
  'Entrepreneur, Service Provider, Content Creator',
  'Between $5k & $10k /mo',
  'To reach the Clint I’m looking for in the classic and limited edition car niche',
  'Making the right content to go viral organically',
  true,
  'new',
  '{"first_name":"Hameed","last_name":"BABELLI","email":"hameedbabelli@gmail.com","phone":"0567524868","social_username":"Babelliclassics","country":"United Arab Emirates","content_language":"","business_type":"Entrepreneur, Service Provider, Content Creator","monthly_income_range":"Between $5k & $10k /mo","goals_objectives":"To reach the Clint I’m looking for in the classic and limited edition car niche","obstacles":"Making the right content to go viral organically","call_attendance_confirmation":"Yes","status":"new","notes":"","date_added":"May 2, 2026"}'::jsonb,
  'United Arab Emirates',
  NULL,
  false,
  '2026-05-01T20:00:00.000Z',
  '2026-05-01T20:00:00.000Z'
WHERE NOT EXISTS (
  SELECT 1 FROM public.leads WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'hameedbabelli@gmail.com'
);

-- Lead 68:Bushra Alzubaidi (balzubaidi00@gmail.com)
WITH inserted_person AS (
  INSERT INTO public.crm_people (
    tenant_id, full_name, email, phone, instagram, country, income_range, goal, obstacle, notes, created_at, updated_at
  ) VALUES (
    '520a4cfd-5183-4e11-aecc-bc71a52978b6',
    'Bushra Alzubaidi',
    'balzubaidi00@gmail.com',
    '0568273237',
    '@bushra.alzubaidi0',
    'United Arab Emirates',
    'More than $10k /mo',
    'Spread psychological awarness',
    'Time',
    NULL,
    '2026-05-01T20:00:00.000Z',
    '2026-05-01T20:00:00.000Z'
  )
  ON CONFLICT (tenant_id, email) WHERE (email IS NOT NULL) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    phone = COALESCE(crm_people.phone, EXCLUDED.phone),
    instagram = COALESCE(crm_people.instagram, EXCLUDED.instagram),
    country = COALESCE(crm_people.country, EXCLUDED.country),
    income_range = COALESCE(crm_people.income_range, EXCLUDED.income_range),
    goal = COALESCE(crm_people.goal, EXCLUDED.goal),
    obstacle = COALESCE(crm_people.obstacle, EXCLUDED.obstacle),
    notes = COALESCE(crm_people.notes, EXCLUDED.notes),
    updated_at = EXCLUDED.updated_at
  RETURNING id
),
existing_person AS (
  SELECT id FROM public.crm_people WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'balzubaidi00@gmail.com'
),
person_id_to_use AS (
  SELECT id FROM inserted_person
  UNION ALL
  SELECT id FROM existing_person
  LIMIT 1
)
INSERT INTO public.leads (
  tenant_id, person_id, first_name, last_name, email, phone, social_username, business_type, monthly_income_range, goals_objectives, obstacles, call_attendance_confirmation, status, raw_payload, country, content_language, is_qualified, created_at, updated_at
)
SELECT 
  '520a4cfd-5183-4e11-aecc-bc71a52978b6',
  (SELECT id FROM person_id_to_use),
  'Bushra',
  'Alzubaidi',
  'balzubaidi00@gmail.com',
  '0568273237',
  '@bushra.alzubaidi0',
  'Content Creator',
  'More than $10k /mo',
  'Spread psychological awarness',
  'Time',
  true,
  'new',
  '{"first_name":"Bushra","last_name":"Alzubaidi","email":"balzubaidi00@gmail.com","phone":"0568273237","social_username":"@bushra.alzubaidi0","country":"United Arab Emirates","content_language":"","business_type":"Content Creator","monthly_income_range":"More than $10k /mo","goals_objectives":"Spread psychological awarness","obstacles":"Time","call_attendance_confirmation":"Yes","status":"new","notes":"","date_added":"May 2, 2026"}'::jsonb,
  'United Arab Emirates',
  NULL,
  false,
  '2026-05-01T20:00:00.000Z',
  '2026-05-01T20:00:00.000Z'
WHERE NOT EXISTS (
  SELECT 1 FROM public.leads WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'balzubaidi00@gmail.com'
);

-- Lead 69:Muzamil Memon (muzamil9884@gmail.com)
WITH inserted_person AS (
  INSERT INTO public.crm_people (
    tenant_id, full_name, email, phone, instagram, country, income_range, goal, obstacle, notes, created_at, updated_at
  ) VALUES (
    '520a4cfd-5183-4e11-aecc-bc71a52978b6',
    'Muzamil Memon',
    'muzamil9884@gmail.com',
    '03332738782',
    'm.creative.studio_.',
    'Pakistan',
    'Between $5k & $10k /mo',
    'I want to establish a reliable, long term B2B partnership between your agency and my team at Creative Studio. Our goal is to handle high volume, top tier short form video editing for your clients. You can help us achieve this by onboarding us as a trusted editing partner, which will allow you to focus on scaling your operations and signing more clients while we handle the heavy lifting of production and maintaining high retention rates.',
    'Currently, our biggest obstacle is spending too much time hunting for individual clients instead of maximizing our actual editing capacity. I have a fully equipped, in house team of experienced editors ready to handle bulk workloads, but we need a consistent, reliable pipeline of projects from an established agency like yours to truly utilize our studio''s full potential.',
    NULL,
    '2026-04-30T20:00:00.000Z',
    '2026-04-30T20:00:00.000Z'
  )
  ON CONFLICT (tenant_id, email) WHERE (email IS NOT NULL) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    phone = COALESCE(crm_people.phone, EXCLUDED.phone),
    instagram = COALESCE(crm_people.instagram, EXCLUDED.instagram),
    country = COALESCE(crm_people.country, EXCLUDED.country),
    income_range = COALESCE(crm_people.income_range, EXCLUDED.income_range),
    goal = COALESCE(crm_people.goal, EXCLUDED.goal),
    obstacle = COALESCE(crm_people.obstacle, EXCLUDED.obstacle),
    notes = COALESCE(crm_people.notes, EXCLUDED.notes),
    updated_at = EXCLUDED.updated_at
  RETURNING id
),
existing_person AS (
  SELECT id FROM public.crm_people WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'muzamil9884@gmail.com'
),
person_id_to_use AS (
  SELECT id FROM inserted_person
  UNION ALL
  SELECT id FROM existing_person
  LIMIT 1
)
INSERT INTO public.leads (
  tenant_id, person_id, first_name, last_name, email, phone, social_username, business_type, monthly_income_range, goals_objectives, obstacles, call_attendance_confirmation, status, raw_payload, country, content_language, is_qualified, created_at, updated_at
)
SELECT 
  '520a4cfd-5183-4e11-aecc-bc71a52978b6',
  (SELECT id FROM person_id_to_use),
  'Muzamil',
  'Memon',
  'muzamil9884@gmail.com',
  '03332738782',
  'm.creative.studio_.',
  'Service Provider, Content Creator, Entrepreneur',
  'Between $5k & $10k /mo',
  'I want to establish a reliable, long term B2B partnership between your agency and my team at Creative Studio. Our goal is to handle high volume, top tier short form video editing for your clients. You can help us achieve this by onboarding us as a trusted editing partner, which will allow you to focus on scaling your operations and signing more clients while we handle the heavy lifting of production and maintaining high retention rates.',
  'Currently, our biggest obstacle is spending too much time hunting for individual clients instead of maximizing our actual editing capacity. I have a fully equipped, in house team of experienced editors ready to handle bulk workloads, but we need a consistent, reliable pipeline of projects from an established agency like yours to truly utilize our studio''s full potential.',
  true,
  'new',
  '{"first_name":"Muzamil","last_name":"Memon","email":"muzamil9884@gmail.com","phone":"03332738782","social_username":"m.creative.studio_.","country":"Pakistan","content_language":"","business_type":"Service Provider, Content Creator, Entrepreneur","monthly_income_range":"Between $5k & $10k /mo","goals_objectives":"I want to establish a reliable, long term B2B partnership between your agency and my team at Creative Studio. Our goal is to handle high volume, top tier short form video editing for your clients. You can help us achieve this by onboarding us as a trusted editing partner, which will allow you to focus on scaling your operations and signing more clients while we handle the heavy lifting of production and maintaining high retention rates.","obstacles":"Currently, our biggest obstacle is spending too much time hunting for individual clients instead of maximizing our actual editing capacity. I have a fully equipped, in house team of experienced editors ready to handle bulk workloads, but we need a consistent, reliable pipeline of projects from an established agency like yours to truly utilize our studio''s full potential.","call_attendance_confirmation":"Yes","status":"new","notes":"","date_added":"May 1, 2026"}'::jsonb,
  'Pakistan',
  NULL,
  false,
  '2026-04-30T20:00:00.000Z',
  '2026-04-30T20:00:00.000Z'
WHERE NOT EXISTS (
  SELECT 1 FROM public.leads WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'muzamil9884@gmail.com'
);

-- Lead 70:Muzamil Memon (muzamil9884@gmail.com)
WITH inserted_person AS (
  INSERT INTO public.crm_people (
    tenant_id, full_name, email, phone, instagram, country, income_range, goal, obstacle, notes, created_at, updated_at
  ) VALUES (
    '520a4cfd-5183-4e11-aecc-bc71a52978b6',
    'Muzamil Memon',
    'muzamil9884@gmail.com',
    '03332738782',
    'm.creative.studio_.',
    'Pakistan',
    'Between $5k & $10k /mo',
    'I want to establish a reliable, long term B2B partnership between your agency and my team at Creative Studio. Our goal is to handle high volume, top tier short form video editing for your clients. You can help us achieve this by onboarding us as a trusted editing partner, which will allow you to focus on scaling your operations and signing more clients while we handle the heavy lifting of production and maintaining high retention rates.',
    'Currently, our biggest obstacle is spending too much time hunting for individual clients instead of maximizing our actual editing capacity. I have a fully equipped, in house team of experienced editors ready to handle bulk workloads, but we need a consistent, reliable pipeline of projects from an established agency like yours to truly utilize our studio''s full potential.',
    NULL,
    '2026-04-30T20:00:00.000Z',
    '2026-04-30T20:00:00.000Z'
  )
  ON CONFLICT (tenant_id, email) WHERE (email IS NOT NULL) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    phone = COALESCE(crm_people.phone, EXCLUDED.phone),
    instagram = COALESCE(crm_people.instagram, EXCLUDED.instagram),
    country = COALESCE(crm_people.country, EXCLUDED.country),
    income_range = COALESCE(crm_people.income_range, EXCLUDED.income_range),
    goal = COALESCE(crm_people.goal, EXCLUDED.goal),
    obstacle = COALESCE(crm_people.obstacle, EXCLUDED.obstacle),
    notes = COALESCE(crm_people.notes, EXCLUDED.notes),
    updated_at = EXCLUDED.updated_at
  RETURNING id
),
existing_person AS (
  SELECT id FROM public.crm_people WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'muzamil9884@gmail.com'
),
person_id_to_use AS (
  SELECT id FROM inserted_person
  UNION ALL
  SELECT id FROM existing_person
  LIMIT 1
)
INSERT INTO public.leads (
  tenant_id, person_id, first_name, last_name, email, phone, social_username, business_type, monthly_income_range, goals_objectives, obstacles, call_attendance_confirmation, status, raw_payload, country, content_language, is_qualified, created_at, updated_at
)
SELECT 
  '520a4cfd-5183-4e11-aecc-bc71a52978b6',
  (SELECT id FROM person_id_to_use),
  'Muzamil',
  'Memon',
  'muzamil9884@gmail.com',
  '03332738782',
  'm.creative.studio_.',
  'Service Provider, Content Creator, Entrepreneur',
  'Between $5k & $10k /mo',
  'I want to establish a reliable, long term B2B partnership between your agency and my team at Creative Studio. Our goal is to handle high volume, top tier short form video editing for your clients. You can help us achieve this by onboarding us as a trusted editing partner, which will allow you to focus on scaling your operations and signing more clients while we handle the heavy lifting of production and maintaining high retention rates.',
  'Currently, our biggest obstacle is spending too much time hunting for individual clients instead of maximizing our actual editing capacity. I have a fully equipped, in house team of experienced editors ready to handle bulk workloads, but we need a consistent, reliable pipeline of projects from an established agency like yours to truly utilize our studio''s full potential.',
  true,
  'new',
  '{"first_name":"Muzamil","last_name":"Memon","email":"muzamil9884@gmail.com","phone":"03332738782","social_username":"m.creative.studio_.","country":"Pakistan","content_language":"","business_type":"Service Provider, Content Creator, Entrepreneur","monthly_income_range":"Between $5k & $10k /mo","goals_objectives":"I want to establish a reliable, long term B2B partnership between your agency and my team at Creative Studio. Our goal is to handle high volume, top tier short form video editing for your clients. You can help us achieve this by onboarding us as a trusted editing partner, which will allow you to focus on scaling your operations and signing more clients while we handle the heavy lifting of production and maintaining high retention rates.","obstacles":"Currently, our biggest obstacle is spending too much time hunting for individual clients instead of maximizing our actual editing capacity. I have a fully equipped, in house team of experienced editors ready to handle bulk workloads, but we need a consistent, reliable pipeline of projects from an established agency like yours to truly utilize our studio''s full potential.","call_attendance_confirmation":"Yes","status":"new","notes":"","date_added":"May 1, 2026"}'::jsonb,
  'Pakistan',
  NULL,
  false,
  '2026-04-30T20:00:00.000Z',
  '2026-04-30T20:00:00.000Z'
WHERE NOT EXISTS (
  SELECT 1 FROM public.leads WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'muzamil9884@gmail.com'
);

-- Lead 71:Ciara Duffy (ciaraduffy2724@gmail.com)
WITH inserted_person AS (
  INSERT INTO public.crm_people (
    tenant_id, full_name, email, phone, instagram, country, income_range, goal, obstacle, notes, created_at, updated_at
  ) VALUES (
    '520a4cfd-5183-4e11-aecc-bc71a52978b6',
    'Ciara Duffy',
    'ciaraduffy2724@gmail.com',
    '+353867911812',
    'CiaraDuffyUGC',
    'Ireland',
    'Between $5k & $10k /mo',
    'I want to build a sustainable UGC creator business working with brands that value authentic, story-led content. My goal is to consistently create high-performing short-form videos that feel really real, relatable, and native to the platform, while growing long-term brand partnerships rather than one-off deals.
I’m already creating lifestyle, mum-life and product-led content that converts because it’s grounded in real moments, not overly polished ads. What I’m looking for is guidance, structure and access to the right opportunities so I can scale what’s already working.
I’d love support with brand connections, feedback on content performance, and strategic direction on how to position myself for higher-quality, better-paid collaborations. Having a clear system and expert insight would help me grow faster, smarter, and with confidence.',
    'My biggest obstacle is scaling beyond organic growth without the right brand access and strategic feedback. I’m confident in my content (but also improving all the time), but guidance and better opportunities would help me grow faster and more intentionally.',
    NULL,
    '2026-04-30T20:00:00.000Z',
    '2026-04-30T20:00:00.000Z'
  )
  ON CONFLICT (tenant_id, email) WHERE (email IS NOT NULL) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    phone = COALESCE(crm_people.phone, EXCLUDED.phone),
    instagram = COALESCE(crm_people.instagram, EXCLUDED.instagram),
    country = COALESCE(crm_people.country, EXCLUDED.country),
    income_range = COALESCE(crm_people.income_range, EXCLUDED.income_range),
    goal = COALESCE(crm_people.goal, EXCLUDED.goal),
    obstacle = COALESCE(crm_people.obstacle, EXCLUDED.obstacle),
    notes = COALESCE(crm_people.notes, EXCLUDED.notes),
    updated_at = EXCLUDED.updated_at
  RETURNING id
),
existing_person AS (
  SELECT id FROM public.crm_people WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'ciaraduffy2724@gmail.com'
),
person_id_to_use AS (
  SELECT id FROM inserted_person
  UNION ALL
  SELECT id FROM existing_person
  LIMIT 1
)
INSERT INTO public.leads (
  tenant_id, person_id, first_name, last_name, email, phone, social_username, business_type, monthly_income_range, goals_objectives, obstacles, call_attendance_confirmation, status, raw_payload, country, content_language, is_qualified, created_at, updated_at
)
SELECT 
  '520a4cfd-5183-4e11-aecc-bc71a52978b6',
  (SELECT id FROM person_id_to_use),
  'Ciara',
  'Duffy',
  'ciaraduffy2724@gmail.com',
  '+353867911812',
  'CiaraDuffyUGC',
  'Content Creator',
  'Between $5k & $10k /mo',
  'I want to build a sustainable UGC creator business working with brands that value authentic, story-led content. My goal is to consistently create high-performing short-form videos that feel really real, relatable, and native to the platform, while growing long-term brand partnerships rather than one-off deals.
I’m already creating lifestyle, mum-life and product-led content that converts because it’s grounded in real moments, not overly polished ads. What I’m looking for is guidance, structure and access to the right opportunities so I can scale what’s already working.
I’d love support with brand connections, feedback on content performance, and strategic direction on how to position myself for higher-quality, better-paid collaborations. Having a clear system and expert insight would help me grow faster, smarter, and with confidence.',
  'My biggest obstacle is scaling beyond organic growth without the right brand access and strategic feedback. I’m confident in my content (but also improving all the time), but guidance and better opportunities would help me grow faster and more intentionally.',
  true,
  'new',
  '{"first_name":"Ciara","last_name":"Duffy","email":"ciaraduffy2724@gmail.com","phone":"+353867911812","social_username":"CiaraDuffyUGC","country":"Ireland","content_language":"English","business_type":"Content Creator","monthly_income_range":"Between $5k & $10k /mo","goals_objectives":"I want to build a sustainable UGC creator business working with brands that value authentic, story-led content. My goal is to consistently create high-performing short-form videos that feel really real, relatable, and native to the platform, while growing long-term brand partnerships rather than one-off deals.\nI’m already creating lifestyle, mum-life and product-led content that converts because it’s grounded in real moments, not overly polished ads. What I’m looking for is guidance, structure and access to the right opportunities so I can scale what’s already working.\nI’d love support with brand connections, feedback on content performance, and strategic direction on how to position myself for higher-quality, better-paid collaborations. Having a clear system and expert insight would help me grow faster, smarter, and with confidence.","obstacles":"My biggest obstacle is scaling beyond organic growth without the right brand access and strategic feedback. I’m confident in my content (but also improving all the time), but guidance and better opportunities would help me grow faster and more intentionally.","call_attendance_confirmation":"Yes","status":"new","notes":"","date_added":"May 1, 2026"}'::jsonb,
  'Ireland',
  'English',
  false,
  '2026-04-30T20:00:00.000Z',
  '2026-04-30T20:00:00.000Z'
WHERE NOT EXISTS (
  SELECT 1 FROM public.leads WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'ciaraduffy2724@gmail.com'
);

-- Lead 72:Jumaima Zain (saifjumaima@gmail.com)
WITH inserted_person AS (
  INSERT INTO public.crm_people (
    tenant_id, full_name, email, phone, instagram, country, income_range, goal, obstacle, notes, created_at, updated_at
  ) VALUES (
    '520a4cfd-5183-4e11-aecc-bc71a52978b6',
    'Jumaima Zain',
    'saifjumaima@gmail.com',
    '+971507559055',
    'Jumaima.Zain',
    'United Arab Emirates',
    'More than $10k /mo',
    'Hi, hope you’re doing well.

Yes, please share your complete proposal.

I’m a Partner at SYKON Properties, part of a large Omani family group. ( Which my husband is the owner) 

I’ve recently joined to build a women-focused investment and hiring initiative, positioning my personal brand alongside SYKON.

Our goal is to attract women investors and experienced female real estate agents to join SYKON through strong brand positioning and content.

Looking forward to your proposal.',
    'Let’s get on a call',
    NULL,
    '2026-04-30T20:00:00.000Z',
    '2026-04-30T20:00:00.000Z'
  )
  ON CONFLICT (tenant_id, email) WHERE (email IS NOT NULL) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    phone = COALESCE(crm_people.phone, EXCLUDED.phone),
    instagram = COALESCE(crm_people.instagram, EXCLUDED.instagram),
    country = COALESCE(crm_people.country, EXCLUDED.country),
    income_range = COALESCE(crm_people.income_range, EXCLUDED.income_range),
    goal = COALESCE(crm_people.goal, EXCLUDED.goal),
    obstacle = COALESCE(crm_people.obstacle, EXCLUDED.obstacle),
    notes = COALESCE(crm_people.notes, EXCLUDED.notes),
    updated_at = EXCLUDED.updated_at
  RETURNING id
),
existing_person AS (
  SELECT id FROM public.crm_people WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'saifjumaima@gmail.com'
),
person_id_to_use AS (
  SELECT id FROM inserted_person
  UNION ALL
  SELECT id FROM existing_person
  LIMIT 1
)
INSERT INTO public.leads (
  tenant_id, person_id, first_name, last_name, email, phone, social_username, business_type, monthly_income_range, goals_objectives, obstacles, call_attendance_confirmation, status, raw_payload, country, content_language, is_qualified, created_at, updated_at
)
SELECT 
  '520a4cfd-5183-4e11-aecc-bc71a52978b6',
  (SELECT id FROM person_id_to_use),
  'Jumaima',
  'Zain',
  'saifjumaima@gmail.com',
  '+971507559055',
  'Jumaima.Zain',
  'Real estate Dubai',
  'More than $10k /mo',
  'Hi, hope you’re doing well.

Yes, please share your complete proposal.

I’m a Partner at SYKON Properties, part of a large Omani family group. ( Which my husband is the owner) 

I’ve recently joined to build a women-focused investment and hiring initiative, positioning my personal brand alongside SYKON.

Our goal is to attract women investors and experienced female real estate agents to join SYKON through strong brand positioning and content.

Looking forward to your proposal.',
  'Let’s get on a call',
  true,
  'new',
  '{"first_name":"Jumaima","last_name":"Zain","email":"saifjumaima@gmail.com","phone":"+971507559055","social_username":"Jumaima.Zain","country":"United Arab Emirates","content_language":"","business_type":"Real estate Dubai","monthly_income_range":"More than $10k /mo","goals_objectives":"Hi, hope you’re doing well.\n\nYes, please share your complete proposal.\n\nI’m a Partner at SYKON Properties, part of a large Omani family group. ( Which my husband is the owner) \n\nI’ve recently joined to build a women-focused investment and hiring initiative, positioning my personal brand alongside SYKON.\n\nOur goal is to attract women investors and experienced female real estate agents to join SYKON through strong brand positioning and content.\n\nLooking forward to your proposal.","obstacles":"Let’s get on a call","call_attendance_confirmation":"Yes","status":"new","notes":"","date_added":"May 1, 2026"}'::jsonb,
  'United Arab Emirates',
  NULL,
  false,
  '2026-04-30T20:00:00.000Z',
  '2026-04-30T20:00:00.000Z'
WHERE NOT EXISTS (
  SELECT 1 FROM public.leads WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'saifjumaima@gmail.com'
);

-- Lead 73:Munisa Mirza (yasmin.ue@gmail.com)
WITH inserted_person AS (
  INSERT INTO public.crm_people (
    tenant_id, full_name, email, phone, instagram, country, income_range, goal, obstacle, notes, created_at, updated_at
  ) VALUES (
    '520a4cfd-5183-4e11-aecc-bc71a52978b6',
    'Munisa Mirza',
    'yasmin.ue@gmail.com',
    '+971561980008',
    'Munisamirza official',
    'United Arab Emirates',
    'More than $10k /mo',
    'Getting leads',
    'Lack of professional content creator',
    NULL,
    '2026-04-30T20:00:00.000Z',
    '2026-04-30T20:00:00.000Z'
  )
  ON CONFLICT (tenant_id, email) WHERE (email IS NOT NULL) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    phone = COALESCE(crm_people.phone, EXCLUDED.phone),
    instagram = COALESCE(crm_people.instagram, EXCLUDED.instagram),
    country = COALESCE(crm_people.country, EXCLUDED.country),
    income_range = COALESCE(crm_people.income_range, EXCLUDED.income_range),
    goal = COALESCE(crm_people.goal, EXCLUDED.goal),
    obstacle = COALESCE(crm_people.obstacle, EXCLUDED.obstacle),
    notes = COALESCE(crm_people.notes, EXCLUDED.notes),
    updated_at = EXCLUDED.updated_at
  RETURNING id
),
existing_person AS (
  SELECT id FROM public.crm_people WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'yasmin.ue@gmail.com'
),
person_id_to_use AS (
  SELECT id FROM inserted_person
  UNION ALL
  SELECT id FROM existing_person
  LIMIT 1
)
INSERT INTO public.leads (
  tenant_id, person_id, first_name, last_name, email, phone, social_username, business_type, monthly_income_range, goals_objectives, obstacles, call_attendance_confirmation, status, raw_payload, country, content_language, is_qualified, created_at, updated_at
)
SELECT 
  '520a4cfd-5183-4e11-aecc-bc71a52978b6',
  (SELECT id FROM person_id_to_use),
  'Munisa',
  'Mirza',
  'yasmin.ue@gmail.com',
  '+971561980008',
  'Munisamirza official',
  'Entrepreneur, Real estate',
  'More than $10k /mo',
  'Getting leads',
  'Lack of professional content creator',
  true,
  'new',
  '{"first_name":"Munisa","last_name":"Mirza","email":"yasmin.ue@gmail.com","phone":"+971561980008","social_username":"Munisamirza official","country":"United Arab Emirates","content_language":"","business_type":"Entrepreneur, Real estate","monthly_income_range":"More than $10k /mo","goals_objectives":"Getting leads","obstacles":"Lack of professional content creator","call_attendance_confirmation":"Yes","status":"new","notes":"","date_added":"May 1, 2026"}'::jsonb,
  'United Arab Emirates',
  NULL,
  false,
  '2026-04-30T20:00:00.000Z',
  '2026-04-30T20:00:00.000Z'
WHERE NOT EXISTS (
  SELECT 1 FROM public.leads WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'yasmin.ue@gmail.com'
);

-- Lead 74:Amer Alaaeddin (ameralqassar220@gmail.com)
WITH inserted_person AS (
  INSERT INTO public.crm_people (
    tenant_id, full_name, email, phone, instagram, country, income_range, goal, obstacle, notes, created_at, updated_at
  ) VALUES (
    '520a4cfd-5183-4e11-aecc-bc71a52978b6',
    'Amer Alaaeddin',
    'ameralqassar220@gmail.com',
    '+971544560013',
    'Razanuae_',
    'United Arab Emirates',
    'More than $10k /mo',
    'Build personal brand',
    'Consistency and content',
    NULL,
    '2026-04-30T20:00:00.000Z',
    '2026-04-30T20:00:00.000Z'
  )
  ON CONFLICT (tenant_id, email) WHERE (email IS NOT NULL) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    phone = COALESCE(crm_people.phone, EXCLUDED.phone),
    instagram = COALESCE(crm_people.instagram, EXCLUDED.instagram),
    country = COALESCE(crm_people.country, EXCLUDED.country),
    income_range = COALESCE(crm_people.income_range, EXCLUDED.income_range),
    goal = COALESCE(crm_people.goal, EXCLUDED.goal),
    obstacle = COALESCE(crm_people.obstacle, EXCLUDED.obstacle),
    notes = COALESCE(crm_people.notes, EXCLUDED.notes),
    updated_at = EXCLUDED.updated_at
  RETURNING id
),
existing_person AS (
  SELECT id FROM public.crm_people WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'ameralqassar220@gmail.com'
),
person_id_to_use AS (
  SELECT id FROM inserted_person
  UNION ALL
  SELECT id FROM existing_person
  LIMIT 1
)
INSERT INTO public.leads (
  tenant_id, person_id, first_name, last_name, email, phone, social_username, business_type, monthly_income_range, goals_objectives, obstacles, call_attendance_confirmation, status, raw_payload, country, content_language, is_qualified, created_at, updated_at
)
SELECT 
  '520a4cfd-5183-4e11-aecc-bc71a52978b6',
  (SELECT id FROM person_id_to_use),
  'Amer',
  'Alaaeddin',
  'ameralqassar220@gmail.com',
  '+971544560013',
  'Razanuae_',
  'Entrepreneur',
  'More than $10k /mo',
  'Build personal brand',
  'Consistency and content',
  true,
  'new',
  '{"first_name":"Amer","last_name":"Alaaeddin","email":"ameralqassar220@gmail.com","phone":"+971544560013","social_username":"Razanuae_","country":"United Arab Emirates","content_language":"","business_type":"Entrepreneur","monthly_income_range":"More than $10k /mo","goals_objectives":"Build personal brand","obstacles":"Consistency and content","call_attendance_confirmation":"Yes","status":"new","notes":"","date_added":"May 1, 2026"}'::jsonb,
  'United Arab Emirates',
  NULL,
  false,
  '2026-04-30T20:00:00.000Z',
  '2026-04-30T20:00:00.000Z'
WHERE NOT EXISTS (
  SELECT 1 FROM public.leads WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'ameralqassar220@gmail.com'
);

-- Lead 75:Faiz Felemban (faizam3@hotmail.com)
WITH inserted_person AS (
  INSERT INTO public.crm_people (
    tenant_id, full_name, email, phone, instagram, country, income_range, goal, obstacle, notes, created_at, updated_at
  ) VALUES (
    '520a4cfd-5183-4e11-aecc-bc71a52978b6',
    'Faiz Felemban',
    'faizam3@hotmail.com',
    '0502708284',
    '@drfauzfelemban',
    'Saudi Arabia',
    'Between $5k & $10k /mo',
    'More exposure to public',
    'I need professional videos',
    NULL,
    '2026-04-29T20:00:00.000Z',
    '2026-04-29T20:00:00.000Z'
  )
  ON CONFLICT (tenant_id, email) WHERE (email IS NOT NULL) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    phone = COALESCE(crm_people.phone, EXCLUDED.phone),
    instagram = COALESCE(crm_people.instagram, EXCLUDED.instagram),
    country = COALESCE(crm_people.country, EXCLUDED.country),
    income_range = COALESCE(crm_people.income_range, EXCLUDED.income_range),
    goal = COALESCE(crm_people.goal, EXCLUDED.goal),
    obstacle = COALESCE(crm_people.obstacle, EXCLUDED.obstacle),
    notes = COALESCE(crm_people.notes, EXCLUDED.notes),
    updated_at = EXCLUDED.updated_at
  RETURNING id
),
existing_person AS (
  SELECT id FROM public.crm_people WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'faizam3@hotmail.com'
),
person_id_to_use AS (
  SELECT id FROM inserted_person
  UNION ALL
  SELECT id FROM existing_person
  LIMIT 1
)
INSERT INTO public.leads (
  tenant_id, person_id, first_name, last_name, email, phone, social_username, business_type, monthly_income_range, goals_objectives, obstacles, call_attendance_confirmation, status, raw_payload, country, content_language, is_qualified, created_at, updated_at
)
SELECT 
  '520a4cfd-5183-4e11-aecc-bc71a52978b6',
  (SELECT id FROM person_id_to_use),
  'Faiz',
  'Felemban',
  'faizam3@hotmail.com',
  '0502708284',
  '@drfauzfelemban',
  'Doctor, Content Creator',
  'Between $5k & $10k /mo',
  'More exposure to public',
  'I need professional videos',
  true,
  'new',
  '{"first_name":"Faiz","last_name":"Felemban","email":"faizam3@hotmail.com","phone":"0502708284","social_username":"@drfauzfelemban","country":"Saudi Arabia","content_language":"","business_type":"Doctor, Content Creator","monthly_income_range":"Between $5k & $10k /mo","goals_objectives":"More exposure to public","obstacles":"I need professional videos","call_attendance_confirmation":"Yes","status":"new","notes":"","date_added":"Apr 30, 2026"}'::jsonb,
  'Saudi Arabia',
  NULL,
  false,
  '2026-04-29T20:00:00.000Z',
  '2026-04-29T20:00:00.000Z'
WHERE NOT EXISTS (
  SELECT 1 FROM public.leads WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'faizam3@hotmail.com'
);

-- Lead 76:Nicolette Connors (nicoletteinvestdubai@gmail.com)
WITH inserted_person AS (
  INSERT INTO public.crm_people (
    tenant_id, full_name, email, phone, instagram, country, income_range, goal, obstacle, notes, created_at, updated_at
  ) VALUES (
    '520a4cfd-5183-4e11-aecc-bc71a52978b6',
    'Nicolette Connors',
    'nicoletteinvestdubai@gmail.com',
    '+971585516635',
    'Nicoletteinvestuae',
    'United Arab Emirates',
    'More than $10k /mo',
    'Quality leads',
    'No
Leads',
    NULL,
    '2026-04-29T20:00:00.000Z',
    '2026-04-29T20:00:00.000Z'
  )
  ON CONFLICT (tenant_id, email) WHERE (email IS NOT NULL) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    phone = COALESCE(crm_people.phone, EXCLUDED.phone),
    instagram = COALESCE(crm_people.instagram, EXCLUDED.instagram),
    country = COALESCE(crm_people.country, EXCLUDED.country),
    income_range = COALESCE(crm_people.income_range, EXCLUDED.income_range),
    goal = COALESCE(crm_people.goal, EXCLUDED.goal),
    obstacle = COALESCE(crm_people.obstacle, EXCLUDED.obstacle),
    notes = COALESCE(crm_people.notes, EXCLUDED.notes),
    updated_at = EXCLUDED.updated_at
  RETURNING id
),
existing_person AS (
  SELECT id FROM public.crm_people WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'nicoletteinvestdubai@gmail.com'
),
person_id_to_use AS (
  SELECT id FROM inserted_person
  UNION ALL
  SELECT id FROM existing_person
  LIMIT 1
)
INSERT INTO public.leads (
  tenant_id, person_id, first_name, last_name, email, phone, social_username, business_type, monthly_income_range, goals_objectives, obstacles, call_attendance_confirmation, status, raw_payload, country, content_language, is_qualified, created_at, updated_at
)
SELECT 
  '520a4cfd-5183-4e11-aecc-bc71a52978b6',
  (SELECT id FROM person_id_to_use),
  'Nicolette',
  'Connors',
  'nicoletteinvestdubai@gmail.com',
  '+971585516635',
  'Nicoletteinvestuae',
  'Consultant',
  'More than $10k /mo',
  'Quality leads',
  'No
Leads',
  true,
  'new',
  '{"first_name":"Nicolette","last_name":"Connors","email":"nicoletteinvestdubai@gmail.com","phone":"+971585516635","social_username":"Nicoletteinvestuae","country":"United Arab Emirates","content_language":"","business_type":"Consultant","monthly_income_range":"More than $10k /mo","goals_objectives":"Quality leads","obstacles":"No\nLeads","call_attendance_confirmation":"Yes","status":"new","notes":"","date_added":"Apr 30, 2026"}'::jsonb,
  'United Arab Emirates',
  NULL,
  false,
  '2026-04-29T20:00:00.000Z',
  '2026-04-29T20:00:00.000Z'
WHERE NOT EXISTS (
  SELECT 1 FROM public.leads WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'nicoletteinvestdubai@gmail.com'
);

-- Lead 77:Ibrahim Ab (dubai@gmail.com)
WITH inserted_person AS (
  INSERT INTO public.crm_people (
    tenant_id, full_name, email, phone, instagram, country, income_range, goal, obstacle, notes, created_at, updated_at
  ) VALUES (
    '520a4cfd-5183-4e11-aecc-bc71a52978b6',
    'Ibrahim Ab',
    'dubai@gmail.com',
    '0585885918',
    'Vexaonline',
    'United Arab Emirates',
    'Between $5k & $10k /mo',
    'Views and exposure to UAE Germany KSA',
    'Social media, looking to begin some clips',
    NULL,
    '2026-04-28T20:00:00.000Z',
    '2026-04-28T20:00:00.000Z'
  )
  ON CONFLICT (tenant_id, email) WHERE (email IS NOT NULL) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    phone = COALESCE(crm_people.phone, EXCLUDED.phone),
    instagram = COALESCE(crm_people.instagram, EXCLUDED.instagram),
    country = COALESCE(crm_people.country, EXCLUDED.country),
    income_range = COALESCE(crm_people.income_range, EXCLUDED.income_range),
    goal = COALESCE(crm_people.goal, EXCLUDED.goal),
    obstacle = COALESCE(crm_people.obstacle, EXCLUDED.obstacle),
    notes = COALESCE(crm_people.notes, EXCLUDED.notes),
    updated_at = EXCLUDED.updated_at
  RETURNING id
),
existing_person AS (
  SELECT id FROM public.crm_people WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'dubai@gmail.com'
),
person_id_to_use AS (
  SELECT id FROM inserted_person
  UNION ALL
  SELECT id FROM existing_person
  LIMIT 1
)
INSERT INTO public.leads (
  tenant_id, person_id, first_name, last_name, email, phone, social_username, business_type, monthly_income_range, goals_objectives, obstacles, call_attendance_confirmation, status, raw_payload, country, content_language, is_qualified, created_at, updated_at
)
SELECT 
  '520a4cfd-5183-4e11-aecc-bc71a52978b6',
  (SELECT id FROM person_id_to_use),
  'Ibrahim',
  'Ab',
  'dubai@gmail.com',
  '0585885918',
  'Vexaonline',
  'Entrepreneur',
  'Between $5k & $10k /mo',
  'Views and exposure to UAE Germany KSA',
  'Social media, looking to begin some clips',
  true,
  'new',
  '{"first_name":"Ibrahim","last_name":"Ab","email":"dubai@gmail.com","phone":"0585885918","social_username":"Vexaonline","country":"United Arab Emirates","content_language":"","business_type":"Entrepreneur","monthly_income_range":"Between $5k & $10k /mo","goals_objectives":"Views and exposure to UAE Germany KSA","obstacles":"Social media, looking to begin some clips","call_attendance_confirmation":"Yes","status":"new","notes":"","date_added":"Apr 29, 2026"}'::jsonb,
  'United Arab Emirates',
  NULL,
  false,
  '2026-04-28T20:00:00.000Z',
  '2026-04-28T20:00:00.000Z'
WHERE NOT EXISTS (
  SELECT 1 FROM public.leads WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'dubai@gmail.com'
);

-- Lead 78:Yousef Aldobikhi (yousef10100@gmail.com)
WITH inserted_person AS (
  INSERT INTO public.crm_people (
    tenant_id, full_name, email, phone, instagram, country, income_range, goal, obstacle, notes, created_at, updated_at
  ) VALUES (
    '520a4cfd-5183-4e11-aecc-bc71a52978b6',
    'Yousef Aldobikhi',
    'yousef10100@gmail.com',
    '+966533510100',
    '@yousefaldubikhi',
    'Saudi Arabia',
    'More than $10k /mo',
    'More followers and more patients',
    'No time to manage my social media',
    NULL,
    '2026-04-28T20:00:00.000Z',
    '2026-04-28T20:00:00.000Z'
  )
  ON CONFLICT (tenant_id, email) WHERE (email IS NOT NULL) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    phone = COALESCE(crm_people.phone, EXCLUDED.phone),
    instagram = COALESCE(crm_people.instagram, EXCLUDED.instagram),
    country = COALESCE(crm_people.country, EXCLUDED.country),
    income_range = COALESCE(crm_people.income_range, EXCLUDED.income_range),
    goal = COALESCE(crm_people.goal, EXCLUDED.goal),
    obstacle = COALESCE(crm_people.obstacle, EXCLUDED.obstacle),
    notes = COALESCE(crm_people.notes, EXCLUDED.notes),
    updated_at = EXCLUDED.updated_at
  RETURNING id
),
existing_person AS (
  SELECT id FROM public.crm_people WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'yousef10100@gmail.com'
),
person_id_to_use AS (
  SELECT id FROM inserted_person
  UNION ALL
  SELECT id FROM existing_person
  LIMIT 1
)
INSERT INTO public.leads (
  tenant_id, person_id, first_name, last_name, email, phone, social_username, business_type, monthly_income_range, goals_objectives, obstacles, call_attendance_confirmation, status, raw_payload, country, content_language, is_qualified, created_at, updated_at
)
SELECT 
  '520a4cfd-5183-4e11-aecc-bc71a52978b6',
  (SELECT id FROM person_id_to_use),
  'Yousef',
  'Aldobikhi',
  'yousef10100@gmail.com',
  '+966533510100',
  '@yousefaldubikhi',
  'Doctor',
  'More than $10k /mo',
  'More followers and more patients',
  'No time to manage my social media',
  true,
  'new',
  '{"first_name":"Yousef","last_name":"Aldobikhi","email":"yousef10100@gmail.com","phone":"+966533510100","social_username":"@yousefaldubikhi","country":"Saudi Arabia","content_language":"","business_type":"Doctor","monthly_income_range":"More than $10k /mo","goals_objectives":"More followers and more patients","obstacles":"No time to manage my social media","call_attendance_confirmation":"Yes","status":"new","notes":"","date_added":"Apr 29, 2026"}'::jsonb,
  'Saudi Arabia',
  NULL,
  false,
  '2026-04-28T20:00:00.000Z',
  '2026-04-28T20:00:00.000Z'
WHERE NOT EXISTS (
  SELECT 1 FROM public.leads WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'yousef10100@gmail.com'
);

-- Lead 79:Hamidah Safi (hamida.a.safi@gmail.com)
WITH inserted_person AS (
  INSERT INTO public.crm_people (
    tenant_id, full_name, email, phone, instagram, country, income_range, goal, obstacle, notes, created_at, updated_at
  ) VALUES (
    '520a4cfd-5183-4e11-aecc-bc71a52978b6',
    'Hamidah Safi',
    'hamida.a.safi@gmail.com',
    '0506798880',
    'Dr_hamidasafi',
    'United Arab Emirates',
    'Between $5k & $10k /mo',
    'More followers 
More patients to the clinic 
Famous enough to be able to have my independent practice in future',
    'Less patients 
Slow marketing growth',
    NULL,
    '2026-04-28T20:00:00.000Z',
    '2026-04-28T20:00:00.000Z'
  )
  ON CONFLICT (tenant_id, email) WHERE (email IS NOT NULL) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    phone = COALESCE(crm_people.phone, EXCLUDED.phone),
    instagram = COALESCE(crm_people.instagram, EXCLUDED.instagram),
    country = COALESCE(crm_people.country, EXCLUDED.country),
    income_range = COALESCE(crm_people.income_range, EXCLUDED.income_range),
    goal = COALESCE(crm_people.goal, EXCLUDED.goal),
    obstacle = COALESCE(crm_people.obstacle, EXCLUDED.obstacle),
    notes = COALESCE(crm_people.notes, EXCLUDED.notes),
    updated_at = EXCLUDED.updated_at
  RETURNING id
),
existing_person AS (
  SELECT id FROM public.crm_people WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'hamida.a.safi@gmail.com'
),
person_id_to_use AS (
  SELECT id FROM inserted_person
  UNION ALL
  SELECT id FROM existing_person
  LIMIT 1
)
INSERT INTO public.leads (
  tenant_id, person_id, first_name, last_name, email, phone, social_username, business_type, monthly_income_range, goals_objectives, obstacles, call_attendance_confirmation, status, raw_payload, country, content_language, is_qualified, created_at, updated_at
)
SELECT 
  '520a4cfd-5183-4e11-aecc-bc71a52978b6',
  (SELECT id FROM person_id_to_use),
  'Hamidah',
  'Safi',
  'hamida.a.safi@gmail.com',
  '0506798880',
  'Dr_hamidasafi',
  'Doctor',
  'Between $5k & $10k /mo',
  'More followers 
More patients to the clinic 
Famous enough to be able to have my independent practice in future',
  'Less patients 
Slow marketing growth',
  true,
  'new',
  '{"first_name":"Hamidah","last_name":"Safi","email":"hamida.a.safi@gmail.com","phone":"0506798880","social_username":"Dr_hamidasafi","country":"United Arab Emirates","content_language":"","business_type":"Doctor","monthly_income_range":"Between $5k & $10k /mo","goals_objectives":"More followers \nMore patients to the clinic \nFamous enough to be able to have my independent practice in future","obstacles":"Less patients \nSlow marketing growth","call_attendance_confirmation":"Yes","status":"new","notes":"","date_added":"Apr 29, 2026"}'::jsonb,
  'United Arab Emirates',
  NULL,
  false,
  '2026-04-28T20:00:00.000Z',
  '2026-04-28T20:00:00.000Z'
WHERE NOT EXISTS (
  SELECT 1 FROM public.leads WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'hamida.a.safi@gmail.com'
);

-- Lead 80:Omar Abbas (alsamrai70@gmail.com)
WITH inserted_person AS (
  INSERT INTO public.crm_people (
    tenant_id, full_name, email, phone, instagram, country, income_range, goal, obstacle, notes, created_at, updated_at
  ) VALUES (
    '520a4cfd-5183-4e11-aecc-bc71a52978b6',
    'Omar Abbas',
    'alsamrai70@gmail.com',
    '+971544377299',
    'khgjh',
    'United Arab Emirates',
    'More than $10k /mo',
    'Polyclinic located at DHCC',
    'No',
    NULL,
    '2026-04-27T20:00:00.000Z',
    '2026-04-27T20:00:00.000Z'
  )
  ON CONFLICT (tenant_id, email) WHERE (email IS NOT NULL) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    phone = COALESCE(crm_people.phone, EXCLUDED.phone),
    instagram = COALESCE(crm_people.instagram, EXCLUDED.instagram),
    country = COALESCE(crm_people.country, EXCLUDED.country),
    income_range = COALESCE(crm_people.income_range, EXCLUDED.income_range),
    goal = COALESCE(crm_people.goal, EXCLUDED.goal),
    obstacle = COALESCE(crm_people.obstacle, EXCLUDED.obstacle),
    notes = COALESCE(crm_people.notes, EXCLUDED.notes),
    updated_at = EXCLUDED.updated_at
  RETURNING id
),
existing_person AS (
  SELECT id FROM public.crm_people WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'alsamrai70@gmail.com'
),
person_id_to_use AS (
  SELECT id FROM inserted_person
  UNION ALL
  SELECT id FROM existing_person
  LIMIT 1
)
INSERT INTO public.leads (
  tenant_id, person_id, first_name, last_name, email, phone, social_username, business_type, monthly_income_range, goals_objectives, obstacles, call_attendance_confirmation, status, raw_payload, country, content_language, is_qualified, created_at, updated_at
)
SELECT 
  '520a4cfd-5183-4e11-aecc-bc71a52978b6',
  (SELECT id FROM person_id_to_use),
  'Omar',
  'Abbas',
  'alsamrai70@gmail.com',
  '+971544377299',
  'khgjh',
  'Service Provider, Doctor',
  'More than $10k /mo',
  'Polyclinic located at DHCC',
  'No',
  true,
  'new',
  '{"first_name":"Omar","last_name":"Abbas","email":"alsamrai70@gmail.com","phone":"+971544377299","social_username":"khgjh","country":"United Arab Emirates","content_language":"","business_type":"Service Provider, Doctor","monthly_income_range":"More than $10k /mo","goals_objectives":"Polyclinic located at DHCC","obstacles":"No","call_attendance_confirmation":"Yes","status":"new","notes":"","date_added":"Apr 28, 2026"}'::jsonb,
  'United Arab Emirates',
  NULL,
  false,
  '2026-04-27T20:00:00.000Z',
  '2026-04-27T20:00:00.000Z'
WHERE NOT EXISTS (
  SELECT 1 FROM public.leads WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'alsamrai70@gmail.com'
);

-- Lead 81:Wael Hosni (whosni.med@gmail.com)
WITH inserted_person AS (
  INSERT INTO public.crm_people (
    tenant_id, full_name, email, phone, instagram, country, income_range, goal, obstacle, notes, created_at, updated_at
  ) VALUES (
    '520a4cfd-5183-4e11-aecc-bc71a52978b6',
    'Wael Hosni',
    'whosni.med@gmail.com',
    '+971582341386',
    '@dr.waelhosni',
    'United Arab Emirates',
    'More than $10k /mo',
    'I want to build a strong, authoritative personal brand in women’s health and  gynecologic surgery across the UAE and internationally.

My goals:

* Position myself as a leading expert in women’s healthcare 
* Increase high-quality patient flow 
* Educate patients through high-value, evidence-based content
* Grow a professional audience of patiwnts, doctors and collaborators
* Support visibility for my surgical work, academic work, lectures, and conferences

I need help with a structured content strategy, professional video editing, branding consistency, and scaling my reach through optimized social media growth.',
    'The main challenge is time and consistency.

I already have strong content ideas (podcasts, educational reels, patient education topics), but I lack the time to:

* Edit content professionally
* Post consistently
* Optimize reach and engagement
* Scale content across platforms strategically

Additionally, I want to elevate the quality from “good content” to a premium, highly polished brand that reflects my level as a surgeon and speaker.',
    NULL,
    '2026-04-26T20:00:00.000Z',
    '2026-04-26T20:00:00.000Z'
  )
  ON CONFLICT (tenant_id, email) WHERE (email IS NOT NULL) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    phone = COALESCE(crm_people.phone, EXCLUDED.phone),
    instagram = COALESCE(crm_people.instagram, EXCLUDED.instagram),
    country = COALESCE(crm_people.country, EXCLUDED.country),
    income_range = COALESCE(crm_people.income_range, EXCLUDED.income_range),
    goal = COALESCE(crm_people.goal, EXCLUDED.goal),
    obstacle = COALESCE(crm_people.obstacle, EXCLUDED.obstacle),
    notes = COALESCE(crm_people.notes, EXCLUDED.notes),
    updated_at = EXCLUDED.updated_at
  RETURNING id
),
existing_person AS (
  SELECT id FROM public.crm_people WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'whosni.med@gmail.com'
),
person_id_to_use AS (
  SELECT id FROM inserted_person
  UNION ALL
  SELECT id FROM existing_person
  LIMIT 1
)
INSERT INTO public.leads (
  tenant_id, person_id, first_name, last_name, email, phone, social_username, business_type, monthly_income_range, goals_objectives, obstacles, call_attendance_confirmation, status, raw_payload, country, content_language, is_qualified, created_at, updated_at
)
SELECT 
  '520a4cfd-5183-4e11-aecc-bc71a52978b6',
  (SELECT id FROM person_id_to_use),
  'Wael',
  'Hosni',
  'whosni.med@gmail.com',
  '+971582341386',
  '@dr.waelhosni',
  'Doctor',
  'More than $10k /mo',
  'I want to build a strong, authoritative personal brand in women’s health and  gynecologic surgery across the UAE and internationally.

My goals:

* Position myself as a leading expert in women’s healthcare 
* Increase high-quality patient flow 
* Educate patients through high-value, evidence-based content
* Grow a professional audience of patiwnts, doctors and collaborators
* Support visibility for my surgical work, academic work, lectures, and conferences

I need help with a structured content strategy, professional video editing, branding consistency, and scaling my reach through optimized social media growth.',
  'The main challenge is time and consistency.

I already have strong content ideas (podcasts, educational reels, patient education topics), but I lack the time to:

* Edit content professionally
* Post consistently
* Optimize reach and engagement
* Scale content across platforms strategically

Additionally, I want to elevate the quality from “good content” to a premium, highly polished brand that reflects my level as a surgeon and speaker.',
  true,
  'new',
  '{"first_name":"Wael","last_name":"Hosni","email":"whosni.med@gmail.com","phone":"+971582341386","social_username":"@dr.waelhosni","country":"United Arab Emirates","content_language":"","business_type":"Doctor","monthly_income_range":"More than $10k /mo","goals_objectives":"I want to build a strong, authoritative personal brand in women’s health and  gynecologic surgery across the UAE and internationally.\n\nMy goals:\n\n* Position myself as a leading expert in women’s healthcare \n* Increase high-quality patient flow \n* Educate patients through high-value, evidence-based content\n* Grow a professional audience of patiwnts, doctors and collaborators\n* Support visibility for my surgical work, academic work, lectures, and conferences\n\nI need help with a structured content strategy, professional video editing, branding consistency, and scaling my reach through optimized social media growth.","obstacles":"The main challenge is time and consistency.\n\nI already have strong content ideas (podcasts, educational reels, patient education topics), but I lack the time to:\n\n* Edit content professionally\n* Post consistently\n* Optimize reach and engagement\n* Scale content across platforms strategically\n\nAdditionally, I want to elevate the quality from “good content” to a premium, highly polished brand that reflects my level as a surgeon and speaker.","call_attendance_confirmation":"Yes","status":"new","notes":"","date_added":"Apr 27, 2026"}'::jsonb,
  'United Arab Emirates',
  NULL,
  false,
  '2026-04-26T20:00:00.000Z',
  '2026-04-26T20:00:00.000Z'
WHERE NOT EXISTS (
  SELECT 1 FROM public.leads WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'whosni.med@gmail.com'
);

-- Lead 82:Praveen Dawar (prandawar@gmail.com)
WITH inserted_person AS (
  INSERT INTO public.crm_people (
    tenant_id, full_name, email, phone, instagram, country, income_range, goal, obstacle, notes, created_at, updated_at
  ) VALUES (
    '520a4cfd-5183-4e11-aecc-bc71a52978b6',
    'Praveen Dawar',
    'prandawar@gmail.com',
    '+971545324203',
    'wolfiedxb',
    'United Arab Emirates',
    'Between $5k & $10k /mo',
    'Social media growth and clients',
    'Lack of knowledge',
    NULL,
    '2026-04-26T20:00:00.000Z',
    '2026-04-26T20:00:00.000Z'
  )
  ON CONFLICT (tenant_id, email) WHERE (email IS NOT NULL) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    phone = COALESCE(crm_people.phone, EXCLUDED.phone),
    instagram = COALESCE(crm_people.instagram, EXCLUDED.instagram),
    country = COALESCE(crm_people.country, EXCLUDED.country),
    income_range = COALESCE(crm_people.income_range, EXCLUDED.income_range),
    goal = COALESCE(crm_people.goal, EXCLUDED.goal),
    obstacle = COALESCE(crm_people.obstacle, EXCLUDED.obstacle),
    notes = COALESCE(crm_people.notes, EXCLUDED.notes),
    updated_at = EXCLUDED.updated_at
  RETURNING id
),
existing_person AS (
  SELECT id FROM public.crm_people WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'prandawar@gmail.com'
),
person_id_to_use AS (
  SELECT id FROM inserted_person
  UNION ALL
  SELECT id FROM existing_person
  LIMIT 1
)
INSERT INTO public.leads (
  tenant_id, person_id, first_name, last_name, email, phone, social_username, business_type, monthly_income_range, goals_objectives, obstacles, call_attendance_confirmation, status, raw_payload, country, content_language, is_qualified, created_at, updated_at
)
SELECT 
  '520a4cfd-5183-4e11-aecc-bc71a52978b6',
  (SELECT id FROM person_id_to_use),
  'Praveen',
  'Dawar',
  'prandawar@gmail.com',
  '+971545324203',
  'wolfiedxb',
  'Entrepreneur',
  'Between $5k & $10k /mo',
  'Social media growth and clients',
  'Lack of knowledge',
  true,
  'new',
  '{"first_name":"Praveen","last_name":"Dawar","email":"prandawar@gmail.com","phone":"+971545324203","social_username":"wolfiedxb","country":"United Arab Emirates","content_language":"","business_type":"Entrepreneur","monthly_income_range":"Between $5k & $10k /mo","goals_objectives":"Social media growth and clients","obstacles":"Lack of knowledge","call_attendance_confirmation":"Yes","status":"new","notes":"","date_added":"Apr 27, 2026"}'::jsonb,
  'United Arab Emirates',
  NULL,
  false,
  '2026-04-26T20:00:00.000Z',
  '2026-04-26T20:00:00.000Z'
WHERE NOT EXISTS (
  SELECT 1 FROM public.leads WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'prandawar@gmail.com'
);

-- Lead 83:Lina Riman (lriman@hotmail.com)
WITH inserted_person AS (
  INSERT INTO public.crm_people (
    tenant_id, full_name, email, phone, instagram, country, income_range, goal, obstacle, notes, created_at, updated_at
  ) VALUES (
    '520a4cfd-5183-4e11-aecc-bc71a52978b6',
    'Lina Riman',
    'lriman@hotmail.com',
    '00971555232732',
    'No',
    'United Arab Emirates',
    'Between $5k & $10k /mo',
    'Visibility 
Enhance visibility and positioning for SMEs seeking bank financing, by building awareness, credibility, and clearer communication of their financial profiles to lenders.',
    'I’m still refining the right approach and would benefit from expert guidance to structure and execute this effectively.',
    NULL,
    '2026-04-25T20:00:00.000Z',
    '2026-04-25T20:00:00.000Z'
  )
  ON CONFLICT (tenant_id, email) WHERE (email IS NOT NULL) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    phone = COALESCE(crm_people.phone, EXCLUDED.phone),
    instagram = COALESCE(crm_people.instagram, EXCLUDED.instagram),
    country = COALESCE(crm_people.country, EXCLUDED.country),
    income_range = COALESCE(crm_people.income_range, EXCLUDED.income_range),
    goal = COALESCE(crm_people.goal, EXCLUDED.goal),
    obstacle = COALESCE(crm_people.obstacle, EXCLUDED.obstacle),
    notes = COALESCE(crm_people.notes, EXCLUDED.notes),
    updated_at = EXCLUDED.updated_at
  RETURNING id
),
existing_person AS (
  SELECT id FROM public.crm_people WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'lriman@hotmail.com'
),
person_id_to_use AS (
  SELECT id FROM inserted_person
  UNION ALL
  SELECT id FROM existing_person
  LIMIT 1
)
INSERT INTO public.leads (
  tenant_id, person_id, first_name, last_name, email, phone, social_username, business_type, monthly_income_range, goals_objectives, obstacles, call_attendance_confirmation, status, raw_payload, country, content_language, is_qualified, created_at, updated_at
)
SELECT 
  '520a4cfd-5183-4e11-aecc-bc71a52978b6',
  (SELECT id FROM person_id_to_use),
  'Lina',
  'Riman',
  'lriman@hotmail.com',
  '00971555232732',
  'No',
  'I want to brand myself by sharing my experience as banker in the corporate division',
  'Between $5k & $10k /mo',
  'Visibility 
Enhance visibility and positioning for SMEs seeking bank financing, by building awareness, credibility, and clearer communication of their financial profiles to lenders.',
  'I’m still refining the right approach and would benefit from expert guidance to structure and execute this effectively.',
  true,
  'new',
  '{"first_name":"Lina","last_name":"Riman","email":"lriman@hotmail.com","phone":"00971555232732","social_username":"No","country":"United Arab Emirates","content_language":"","business_type":"I want to brand myself by sharing my experience as banker in the corporate division","monthly_income_range":"Between $5k & $10k /mo","goals_objectives":"Visibility \nEnhance visibility and positioning for SMEs seeking bank financing, by building awareness, credibility, and clearer communication of their financial profiles to lenders.","obstacles":"I’m still refining the right approach and would benefit from expert guidance to structure and execute this effectively.","call_attendance_confirmation":"Yes","status":"new","notes":"","date_added":"Apr 26, 2026"}'::jsonb,
  'United Arab Emirates',
  NULL,
  false,
  '2026-04-25T20:00:00.000Z',
  '2026-04-25T20:00:00.000Z'
WHERE NOT EXISTS (
  SELECT 1 FROM public.leads WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'lriman@hotmail.com'
);

-- Lead 84:Mohammad Ak (bashirakil5@gmail.com)
WITH inserted_person AS (
  INSERT INTO public.crm_people (
    tenant_id, full_name, email, phone, instagram, country, income_range, goal, obstacle, notes, created_at, updated_at
  ) VALUES (
    '520a4cfd-5183-4e11-aecc-bc71a52978b6',
    'Mohammad Ak',
    'bashirakil5@gmail.com',
    '+966582223318',
    'Akil',
    'Saudi Arabia',
    'Between $5k & $10k /mo',
    'Consultant',
    'I don’t know how I start',
    NULL,
    '2026-04-25T20:00:00.000Z',
    '2026-04-25T20:00:00.000Z'
  )
  ON CONFLICT (tenant_id, email) WHERE (email IS NOT NULL) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    phone = COALESCE(crm_people.phone, EXCLUDED.phone),
    instagram = COALESCE(crm_people.instagram, EXCLUDED.instagram),
    country = COALESCE(crm_people.country, EXCLUDED.country),
    income_range = COALESCE(crm_people.income_range, EXCLUDED.income_range),
    goal = COALESCE(crm_people.goal, EXCLUDED.goal),
    obstacle = COALESCE(crm_people.obstacle, EXCLUDED.obstacle),
    notes = COALESCE(crm_people.notes, EXCLUDED.notes),
    updated_at = EXCLUDED.updated_at
  RETURNING id
),
existing_person AS (
  SELECT id FROM public.crm_people WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'bashirakil5@gmail.com'
),
person_id_to_use AS (
  SELECT id FROM inserted_person
  UNION ALL
  SELECT id FROM existing_person
  LIMIT 1
)
INSERT INTO public.leads (
  tenant_id, person_id, first_name, last_name, email, phone, social_username, business_type, monthly_income_range, goals_objectives, obstacles, call_attendance_confirmation, status, raw_payload, country, content_language, is_qualified, created_at, updated_at
)
SELECT 
  '520a4cfd-5183-4e11-aecc-bc71a52978b6',
  (SELECT id FROM person_id_to_use),
  'Mohammad',
  'Ak',
  'bashirakil5@gmail.com',
  '+966582223318',
  'Akil',
  'Consultant',
  'Between $5k & $10k /mo',
  'Consultant',
  'I don’t know how I start',
  true,
  'new',
  '{"first_name":"Mohammad","last_name":"Ak","email":"bashirakil5@gmail.com","phone":"+966582223318","social_username":"Akil","country":"Saudi Arabia","content_language":"","business_type":"Consultant","monthly_income_range":"Between $5k & $10k /mo","goals_objectives":"Consultant","obstacles":"I don’t know how I start","call_attendance_confirmation":"Yes","status":"new","notes":"","date_added":"Apr 26, 2026"}'::jsonb,
  'Saudi Arabia',
  NULL,
  false,
  '2026-04-25T20:00:00.000Z',
  '2026-04-25T20:00:00.000Z'
WHERE NOT EXISTS (
  SELECT 1 FROM public.leads WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'bashirakil5@gmail.com'
);

-- Lead 85:Raul Rodriguez (letstalk@raulrmediagroup.com)
WITH inserted_person AS (
  INSERT INTO public.crm_people (
    tenant_id, full_name, email, phone, instagram, country, income_range, goal, obstacle, notes, created_at, updated_at
  ) VALUES (
    '520a4cfd-5183-4e11-aecc-bc71a52978b6',
    'Raul Rodriguez',
    'letstalk@raulrmediagroup.com',
    '12012684878',
    'trainwithraul',
    'United States of America (the)',
    'Between $5k & $10k /mo',
    'i wanna see the demo inside and how this will work if i have to edit video and i wanna  hire someone inside here',
    'editing at your elevel',
    NULL,
    '2026-04-23T20:00:00.000Z',
    '2026-04-23T20:00:00.000Z'
  )
  ON CONFLICT (tenant_id, email) WHERE (email IS NOT NULL) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    phone = COALESCE(crm_people.phone, EXCLUDED.phone),
    instagram = COALESCE(crm_people.instagram, EXCLUDED.instagram),
    country = COALESCE(crm_people.country, EXCLUDED.country),
    income_range = COALESCE(crm_people.income_range, EXCLUDED.income_range),
    goal = COALESCE(crm_people.goal, EXCLUDED.goal),
    obstacle = COALESCE(crm_people.obstacle, EXCLUDED.obstacle),
    notes = COALESCE(crm_people.notes, EXCLUDED.notes),
    updated_at = EXCLUDED.updated_at
  RETURNING id
),
existing_person AS (
  SELECT id FROM public.crm_people WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'letstalk@raulrmediagroup.com'
),
person_id_to_use AS (
  SELECT id FROM inserted_person
  UNION ALL
  SELECT id FROM existing_person
  LIMIT 1
)
INSERT INTO public.leads (
  tenant_id, person_id, first_name, last_name, email, phone, social_username, business_type, monthly_income_range, goals_objectives, obstacles, call_attendance_confirmation, status, raw_payload, country, content_language, is_qualified, created_at, updated_at
)
SELECT 
  '520a4cfd-5183-4e11-aecc-bc71a52978b6',
  (SELECT id FROM person_id_to_use),
  'Raul',
  'Rodriguez',
  'letstalk@raulrmediagroup.com',
  '12012684878',
  'trainwithraul',
  'Service Provider',
  'Between $5k & $10k /mo',
  'i wanna see the demo inside and how this will work if i have to edit video and i wanna  hire someone inside here',
  'editing at your elevel',
  true,
  'new',
  '{"first_name":"Raul","last_name":"Rodriguez","email":"letstalk@raulrmediagroup.com","phone":"12012684878","social_username":"trainwithraul","country":"United States of America (the)","content_language":"","business_type":"Service Provider","monthly_income_range":"Between $5k & $10k /mo","goals_objectives":"i wanna see the demo inside and how this will work if i have to edit video and i wanna  hire someone inside here","obstacles":"editing at your elevel","call_attendance_confirmation":"Yes","status":"new","notes":"","date_added":"Apr 24, 2026"}'::jsonb,
  'United States of America (the)',
  NULL,
  false,
  '2026-04-23T20:00:00.000Z',
  '2026-04-23T20:00:00.000Z'
WHERE NOT EXISTS (
  SELECT 1 FROM public.leads WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'letstalk@raulrmediagroup.com'
);

-- Lead 86:Marian Khatib (mariankh.gmail.com)
WITH inserted_person AS (
  INSERT INTO public.crm_people (
    tenant_id, full_name, email, phone, instagram, country, income_range, goal, obstacle, notes, created_at, updated_at
  ) VALUES (
    '520a4cfd-5183-4e11-aecc-bc71a52978b6',
    'Marian Khatib',
    'mariankh.gmail.com',
    '0554311566',
    'Dr. Marian_khatib_',
    'United Arab Emirates',
    'More than $10k /mo',
    'Branding',
    'No experience',
    NULL,
    '2026-04-23T20:00:00.000Z',
    '2026-04-23T20:00:00.000Z'
  )
  ON CONFLICT (tenant_id, email) WHERE (email IS NOT NULL) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    phone = COALESCE(crm_people.phone, EXCLUDED.phone),
    instagram = COALESCE(crm_people.instagram, EXCLUDED.instagram),
    country = COALESCE(crm_people.country, EXCLUDED.country),
    income_range = COALESCE(crm_people.income_range, EXCLUDED.income_range),
    goal = COALESCE(crm_people.goal, EXCLUDED.goal),
    obstacle = COALESCE(crm_people.obstacle, EXCLUDED.obstacle),
    notes = COALESCE(crm_people.notes, EXCLUDED.notes),
    updated_at = EXCLUDED.updated_at
  RETURNING id
),
existing_person AS (
  SELECT id FROM public.crm_people WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'mariankh.gmail.com'
),
person_id_to_use AS (
  SELECT id FROM inserted_person
  UNION ALL
  SELECT id FROM existing_person
  LIMIT 1
)
INSERT INTO public.leads (
  tenant_id, person_id, first_name, last_name, email, phone, social_username, business_type, monthly_income_range, goals_objectives, obstacles, call_attendance_confirmation, status, raw_payload, country, content_language, is_qualified, created_at, updated_at
)
SELECT 
  '520a4cfd-5183-4e11-aecc-bc71a52978b6',
  (SELECT id FROM person_id_to_use),
  'Marian',
  'Khatib',
  'mariankh.gmail.com',
  '0554311566',
  'Dr. Marian_khatib_',
  'Doctor',
  'More than $10k /mo',
  'Branding',
  'No experience',
  true,
  'new',
  '{"first_name":"Marian","last_name":"Khatib","email":"mariankh.gmail.com","phone":"0554311566","social_username":"Dr. Marian_khatib_","country":"United Arab Emirates","content_language":"","business_type":"Doctor","monthly_income_range":"More than $10k /mo","goals_objectives":"Branding","obstacles":"No experience","call_attendance_confirmation":"Yes","status":"new","notes":"","date_added":"Apr 24, 2026"}'::jsonb,
  'United Arab Emirates',
  NULL,
  false,
  '2026-04-23T20:00:00.000Z',
  '2026-04-23T20:00:00.000Z'
WHERE NOT EXISTS (
  SELECT 1 FROM public.leads WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'mariankh.gmail.com'
);

-- Lead 87:Rola El amine (rola.elamine@rakbank.ae)
WITH inserted_person AS (
  INSERT INTO public.crm_people (
    tenant_id, full_name, email, phone, instagram, country, income_range, goal, obstacle, notes, created_at, updated_at
  ) VALUES (
    '520a4cfd-5183-4e11-aecc-bc71a52978b6',
    'Rola El amine',
    'rola.elamine@rakbank.ae',
    '+971562819678',
    'Rakbank',
    'United Arab Emirates',
    'More than $10k /mo',
    'We are changing the traditional banking relationship into a new concept in the region where we are more of a community centered and financial solution advisory. We have setup 2 community hubs so far in Dubai and building more across the uae',
    'Awareness and visibility',
    NULL,
    '2026-04-23T20:00:00.000Z',
    '2026-04-23T20:00:00.000Z'
  )
  ON CONFLICT (tenant_id, email) WHERE (email IS NOT NULL) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    phone = COALESCE(crm_people.phone, EXCLUDED.phone),
    instagram = COALESCE(crm_people.instagram, EXCLUDED.instagram),
    country = COALESCE(crm_people.country, EXCLUDED.country),
    income_range = COALESCE(crm_people.income_range, EXCLUDED.income_range),
    goal = COALESCE(crm_people.goal, EXCLUDED.goal),
    obstacle = COALESCE(crm_people.obstacle, EXCLUDED.obstacle),
    notes = COALESCE(crm_people.notes, EXCLUDED.notes),
    updated_at = EXCLUDED.updated_at
  RETURNING id
),
existing_person AS (
  SELECT id FROM public.crm_people WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'rola.elamine@rakbank.ae'
),
person_id_to_use AS (
  SELECT id FROM inserted_person
  UNION ALL
  SELECT id FROM existing_person
  LIMIT 1
)
INSERT INTO public.leads (
  tenant_id, person_id, first_name, last_name, email, phone, social_username, business_type, monthly_income_range, goals_objectives, obstacles, call_attendance_confirmation, status, raw_payload, country, content_language, is_qualified, created_at, updated_at
)
SELECT 
  '520a4cfd-5183-4e11-aecc-bc71a52978b6',
  (SELECT id FROM person_id_to_use),
  'Rola',
  'El amine',
  'rola.elamine@rakbank.ae',
  '+971562819678',
  'Rakbank',
  'Community Banking',
  'More than $10k /mo',
  'We are changing the traditional banking relationship into a new concept in the region where we are more of a community centered and financial solution advisory. We have setup 2 community hubs so far in Dubai and building more across the uae',
  'Awareness and visibility',
  true,
  'new',
  '{"first_name":"Rola","last_name":"El amine","email":"rola.elamine@rakbank.ae","phone":"+971562819678","social_username":"Rakbank","country":"United Arab Emirates","content_language":"","business_type":"Community Banking","monthly_income_range":"More than $10k /mo","goals_objectives":"We are changing the traditional banking relationship into a new concept in the region where we are more of a community centered and financial solution advisory. We have setup 2 community hubs so far in Dubai and building more across the uae","obstacles":"Awareness and visibility","call_attendance_confirmation":"Yes","status":"new","notes":"","date_added":"Apr 24, 2026"}'::jsonb,
  'United Arab Emirates',
  NULL,
  false,
  '2026-04-23T20:00:00.000Z',
  '2026-04-23T20:00:00.000Z'
WHERE NOT EXISTS (
  SELECT 1 FROM public.leads WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'rola.elamine@rakbank.ae'
);

-- Lead 88:Ruba Al chamaa (roubachamaa@yahoo.com)
WITH inserted_person AS (
  INSERT INTO public.crm_people (
    tenant_id, full_name, email, phone, instagram, country, income_range, goal, obstacle, notes, created_at, updated_at
  ) VALUES (
    '520a4cfd-5183-4e11-aecc-bc71a52978b6',
    'Ruba Al chamaa',
    'roubachamaa@yahoo.com',
    '0502541129',
    'Not for me',
    'United Arab Emirates',
    'More than $10k /mo',
    'Filiming videos',
    'New patient',
    NULL,
    '2026-04-23T20:00:00.000Z',
    '2026-04-23T20:00:00.000Z'
  )
  ON CONFLICT (tenant_id, email) WHERE (email IS NOT NULL) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    phone = COALESCE(crm_people.phone, EXCLUDED.phone),
    instagram = COALESCE(crm_people.instagram, EXCLUDED.instagram),
    country = COALESCE(crm_people.country, EXCLUDED.country),
    income_range = COALESCE(crm_people.income_range, EXCLUDED.income_range),
    goal = COALESCE(crm_people.goal, EXCLUDED.goal),
    obstacle = COALESCE(crm_people.obstacle, EXCLUDED.obstacle),
    notes = COALESCE(crm_people.notes, EXCLUDED.notes),
    updated_at = EXCLUDED.updated_at
  RETURNING id
),
existing_person AS (
  SELECT id FROM public.crm_people WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'roubachamaa@yahoo.com'
),
person_id_to_use AS (
  SELECT id FROM inserted_person
  UNION ALL
  SELECT id FROM existing_person
  LIMIT 1
)
INSERT INTO public.leads (
  tenant_id, person_id, first_name, last_name, email, phone, social_username, business_type, monthly_income_range, goals_objectives, obstacles, call_attendance_confirmation, status, raw_payload, country, content_language, is_qualified, created_at, updated_at
)
SELECT 
  '520a4cfd-5183-4e11-aecc-bc71a52978b6',
  (SELECT id FROM person_id_to_use),
  'Ruba',
  'Al chamaa',
  'roubachamaa@yahoo.com',
  '0502541129',
  'Not for me',
  'Doctor',
  'More than $10k /mo',
  'Filiming videos',
  'New patient',
  true,
  'new',
  '{"first_name":"Ruba","last_name":"Al chamaa","email":"roubachamaa@yahoo.com","phone":"0502541129","social_username":"Not for me","country":"United Arab Emirates","content_language":"","business_type":"Doctor","monthly_income_range":"More than $10k /mo","goals_objectives":"Filiming videos","obstacles":"New patient","call_attendance_confirmation":"Yes","status":"new","notes":"","date_added":"Apr 24, 2026"}'::jsonb,
  'United Arab Emirates',
  NULL,
  false,
  '2026-04-23T20:00:00.000Z',
  '2026-04-23T20:00:00.000Z'
WHERE NOT EXISTS (
  SELECT 1 FROM public.leads WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'roubachamaa@yahoo.com'
);

-- Lead 89:Sagar Patel (sagar.patell@outlook.com)
WITH inserted_person AS (
  INSERT INTO public.crm_people (
    tenant_id, full_name, email, phone, instagram, country, income_range, goal, obstacle, notes, created_at, updated_at
  ) VALUES (
    '520a4cfd-5183-4e11-aecc-bc71a52978b6',
    'Sagar Patel',
    'sagar.patell@outlook.com',
    '+971555535118',
    'Sagsp',
    'United Arab Emirates',
    'Between $5k & $10k /mo',
    'Consistent, sustainable content creation across all platforms',
    'Editing and social media management and cost to do the same',
    NULL,
    '2026-04-22T20:00:00.000Z',
    '2026-04-22T20:00:00.000Z'
  )
  ON CONFLICT (tenant_id, email) WHERE (email IS NOT NULL) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    phone = COALESCE(crm_people.phone, EXCLUDED.phone),
    instagram = COALESCE(crm_people.instagram, EXCLUDED.instagram),
    country = COALESCE(crm_people.country, EXCLUDED.country),
    income_range = COALESCE(crm_people.income_range, EXCLUDED.income_range),
    goal = COALESCE(crm_people.goal, EXCLUDED.goal),
    obstacle = COALESCE(crm_people.obstacle, EXCLUDED.obstacle),
    notes = COALESCE(crm_people.notes, EXCLUDED.notes),
    updated_at = EXCLUDED.updated_at
  RETURNING id
),
existing_person AS (
  SELECT id FROM public.crm_people WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'sagar.patell@outlook.com'
),
person_id_to_use AS (
  SELECT id FROM inserted_person
  UNION ALL
  SELECT id FROM existing_person
  LIMIT 1
)
INSERT INTO public.leads (
  tenant_id, person_id, first_name, last_name, email, phone, social_username, business_type, monthly_income_range, goals_objectives, obstacles, call_attendance_confirmation, status, raw_payload, country, content_language, is_qualified, created_at, updated_at
)
SELECT 
  '520a4cfd-5183-4e11-aecc-bc71a52978b6',
  (SELECT id FROM person_id_to_use),
  'Sagar',
  'Patel',
  'sagar.patell@outlook.com',
  '+971555535118',
  'Sagsp',
  'Entrepreneur',
  'Between $5k & $10k /mo',
  'Consistent, sustainable content creation across all platforms',
  'Editing and social media management and cost to do the same',
  true,
  'new',
  '{"first_name":"Sagar","last_name":"Patel","email":"sagar.patell@outlook.com","phone":"+971555535118","social_username":"Sagsp","country":"United Arab Emirates","content_language":"","business_type":"Entrepreneur","monthly_income_range":"Between $5k & $10k /mo","goals_objectives":"Consistent, sustainable content creation across all platforms","obstacles":"Editing and social media management and cost to do the same","call_attendance_confirmation":"Yes","status":"new","notes":"","date_added":"Apr 23, 2026"}'::jsonb,
  'United Arab Emirates',
  NULL,
  false,
  '2026-04-22T20:00:00.000Z',
  '2026-04-22T20:00:00.000Z'
WHERE NOT EXISTS (
  SELECT 1 FROM public.leads WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'sagar.patell@outlook.com'
);

-- Lead 90:Marian Khatib (mariankh@gmail.com)
WITH inserted_person AS (
  INSERT INTO public.crm_people (
    tenant_id, full_name, email, phone, instagram, country, income_range, goal, obstacle, notes, created_at, updated_at
  ) VALUES (
    '520a4cfd-5183-4e11-aecc-bc71a52978b6',
    'Marian Khatib',
    'mariankh@gmail.com',
    '0554311566',
    'Dr. Marian Khatib',
    'United Arab Emirates',
    'More than $10k /mo',
    'Exposure 
Online reach
Branding',
    'No experience in social media',
    NULL,
    '2026-04-22T20:00:00.000Z',
    '2026-04-22T20:00:00.000Z'
  )
  ON CONFLICT (tenant_id, email) WHERE (email IS NOT NULL) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    phone = COALESCE(crm_people.phone, EXCLUDED.phone),
    instagram = COALESCE(crm_people.instagram, EXCLUDED.instagram),
    country = COALESCE(crm_people.country, EXCLUDED.country),
    income_range = COALESCE(crm_people.income_range, EXCLUDED.income_range),
    goal = COALESCE(crm_people.goal, EXCLUDED.goal),
    obstacle = COALESCE(crm_people.obstacle, EXCLUDED.obstacle),
    notes = COALESCE(crm_people.notes, EXCLUDED.notes),
    updated_at = EXCLUDED.updated_at
  RETURNING id
),
existing_person AS (
  SELECT id FROM public.crm_people WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'mariankh@gmail.com'
),
person_id_to_use AS (
  SELECT id FROM inserted_person
  UNION ALL
  SELECT id FROM existing_person
  LIMIT 1
)
INSERT INTO public.leads (
  tenant_id, person_id, first_name, last_name, email, phone, social_username, business_type, monthly_income_range, goals_objectives, obstacles, call_attendance_confirmation, status, raw_payload, country, content_language, is_qualified, created_at, updated_at
)
SELECT 
  '520a4cfd-5183-4e11-aecc-bc71a52978b6',
  (SELECT id FROM person_id_to_use),
  'Marian',
  'Khatib',
  'mariankh@gmail.com',
  '0554311566',
  'Dr. Marian Khatib',
  'Doctor',
  'More than $10k /mo',
  'Exposure 
Online reach
Branding',
  'No experience in social media',
  true,
  'new',
  '{"first_name":"Marian","last_name":"Khatib","email":"mariankh@gmail.com","phone":"0554311566","social_username":"Dr. Marian Khatib","country":"United Arab Emirates","content_language":"","business_type":"Doctor","monthly_income_range":"More than $10k /mo","goals_objectives":"Exposure \nOnline reach\nBranding","obstacles":"No experience in social media","call_attendance_confirmation":"Yes","status":"new","notes":"","date_added":"Apr 23, 2026"}'::jsonb,
  'United Arab Emirates',
  NULL,
  false,
  '2026-04-22T20:00:00.000Z',
  '2026-04-22T20:00:00.000Z'
WHERE NOT EXISTS (
  SELECT 1 FROM public.leads WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'mariankh@gmail.com'
);

-- Lead 91:Mohamed Alfawaz (dr.alfawazface@gmail.com)
WITH inserted_person AS (
  INSERT INTO public.crm_people (
    tenant_id, full_name, email, phone, instagram, country, income_range, goal, obstacle, notes, created_at, updated_at
  ) VALUES (
    '520a4cfd-5183-4e11-aecc-bc71a52978b6',
    'Mohamed Alfawaz',
    'dr.alfawazface@gmail.com',
    '+971558889880',
    'Dr.malfawaz',
    'Saudi Arabia',
    'Between $5k & $10k /mo',
    'Increase viewers , gettimg viral',
    'Brand identity, logo , videos , videography , tiktok friendly videos, someone taking videos of me',
    NULL,
    '2026-04-21T20:00:00.000Z',
    '2026-04-21T20:00:00.000Z'
  )
  ON CONFLICT (tenant_id, email) WHERE (email IS NOT NULL) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    phone = COALESCE(crm_people.phone, EXCLUDED.phone),
    instagram = COALESCE(crm_people.instagram, EXCLUDED.instagram),
    country = COALESCE(crm_people.country, EXCLUDED.country),
    income_range = COALESCE(crm_people.income_range, EXCLUDED.income_range),
    goal = COALESCE(crm_people.goal, EXCLUDED.goal),
    obstacle = COALESCE(crm_people.obstacle, EXCLUDED.obstacle),
    notes = COALESCE(crm_people.notes, EXCLUDED.notes),
    updated_at = EXCLUDED.updated_at
  RETURNING id
),
existing_person AS (
  SELECT id FROM public.crm_people WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'dr.alfawazface@gmail.com'
),
person_id_to_use AS (
  SELECT id FROM inserted_person
  UNION ALL
  SELECT id FROM existing_person
  LIMIT 1
)
INSERT INTO public.leads (
  tenant_id, person_id, first_name, last_name, email, phone, social_username, business_type, monthly_income_range, goals_objectives, obstacles, call_attendance_confirmation, status, raw_payload, country, content_language, is_qualified, created_at, updated_at
)
SELECT 
  '520a4cfd-5183-4e11-aecc-bc71a52978b6',
  (SELECT id FROM person_id_to_use),
  'Mohamed',
  'Alfawaz',
  'dr.alfawazface@gmail.com',
  '+971558889880',
  'Dr.malfawaz',
  'Doctor',
  'Between $5k & $10k /mo',
  'Increase viewers , gettimg viral',
  'Brand identity, logo , videos , videography , tiktok friendly videos, someone taking videos of me',
  true,
  'new',
  '{"first_name":"Mohamed","last_name":"Alfawaz","email":"dr.alfawazface@gmail.com","phone":"+971558889880","social_username":"Dr.malfawaz","country":"Saudi Arabia","content_language":"","business_type":"Doctor","monthly_income_range":"Between $5k & $10k /mo","goals_objectives":"Increase viewers , gettimg viral","obstacles":"Brand identity, logo , videos , videography , tiktok friendly videos, someone taking videos of me","call_attendance_confirmation":"Yes","status":"new","notes":"","date_added":"Apr 22, 2026"}'::jsonb,
  'Saudi Arabia',
  NULL,
  false,
  '2026-04-21T20:00:00.000Z',
  '2026-04-21T20:00:00.000Z'
WHERE NOT EXISTS (
  SELECT 1 FROM public.leads WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'dr.alfawazface@gmail.com'
);

-- Lead 92:Ahmed Alali (amral.aj@hotmail.com)
WITH inserted_person AS (
  INSERT INTO public.crm_people (
    tenant_id, full_name, email, phone, instagram, country, income_range, goal, obstacle, notes, created_at, updated_at
  ) VALUES (
    '520a4cfd-5183-4e11-aecc-bc71a52978b6',
    'Ahmed Alali',
    'amral.aj@hotmail.com',
    '0566260505',
    '__aalali',
    'United Arab Emirates',
    'Between $5k & $10k /mo',
    'Sales',
    'Sales',
    NULL,
    '2026-04-21T20:00:00.000Z',
    '2026-04-21T20:00:00.000Z'
  )
  ON CONFLICT (tenant_id, email) WHERE (email IS NOT NULL) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    phone = COALESCE(crm_people.phone, EXCLUDED.phone),
    instagram = COALESCE(crm_people.instagram, EXCLUDED.instagram),
    country = COALESCE(crm_people.country, EXCLUDED.country),
    income_range = COALESCE(crm_people.income_range, EXCLUDED.income_range),
    goal = COALESCE(crm_people.goal, EXCLUDED.goal),
    obstacle = COALESCE(crm_people.obstacle, EXCLUDED.obstacle),
    notes = COALESCE(crm_people.notes, EXCLUDED.notes),
    updated_at = EXCLUDED.updated_at
  RETURNING id
),
existing_person AS (
  SELECT id FROM public.crm_people WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'amral.aj@hotmail.com'
),
person_id_to_use AS (
  SELECT id FROM inserted_person
  UNION ALL
  SELECT id FROM existing_person
  LIMIT 1
)
INSERT INTO public.leads (
  tenant_id, person_id, first_name, last_name, email, phone, social_username, business_type, monthly_income_range, goals_objectives, obstacles, call_attendance_confirmation, status, raw_payload, country, content_language, is_qualified, created_at, updated_at
)
SELECT 
  '520a4cfd-5183-4e11-aecc-bc71a52978b6',
  (SELECT id FROM person_id_to_use),
  'Ahmed',
  'Alali',
  'amral.aj@hotmail.com',
  '0566260505',
  '__aalali',
  'Service Provider',
  'Between $5k & $10k /mo',
  'Sales',
  'Sales',
  true,
  'new',
  '{"first_name":"Ahmed","last_name":"Alali","email":"amral.aj@hotmail.com","phone":"0566260505","social_username":"__aalali","country":"United Arab Emirates","content_language":"","business_type":"Service Provider","monthly_income_range":"Between $5k & $10k /mo","goals_objectives":"Sales","obstacles":"Sales","call_attendance_confirmation":"Yes","status":"new","notes":"","date_added":"Apr 22, 2026"}'::jsonb,
  'United Arab Emirates',
  NULL,
  false,
  '2026-04-21T20:00:00.000Z',
  '2026-04-21T20:00:00.000Z'
WHERE NOT EXISTS (
  SELECT 1 FROM public.leads WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'amral.aj@hotmail.com'
);

-- Lead 93:Tristan Pirouz (tristan@dsgnbynd.com)
WITH inserted_person AS (
  INSERT INTO public.crm_people (
    tenant_id, full_name, email, phone, instagram, country, income_range, goal, obstacle, notes, created_at, updated_at
  ) VALUES (
    '520a4cfd-5183-4e11-aecc-bc71a52978b6',
    'Tristan Pirouz',
    'tristan@dsgnbynd.com',
    '00971564145027',
    '@dsgb_bynd',
    'United Arab Emirates',
    'Between $5k & $10k /mo',
    'Become an educator',
    'I would like to get some guidance and structure',
    NULL,
    '2026-04-21T20:00:00.000Z',
    '2026-04-21T20:00:00.000Z'
  )
  ON CONFLICT (tenant_id, email) WHERE (email IS NOT NULL) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    phone = COALESCE(crm_people.phone, EXCLUDED.phone),
    instagram = COALESCE(crm_people.instagram, EXCLUDED.instagram),
    country = COALESCE(crm_people.country, EXCLUDED.country),
    income_range = COALESCE(crm_people.income_range, EXCLUDED.income_range),
    goal = COALESCE(crm_people.goal, EXCLUDED.goal),
    obstacle = COALESCE(crm_people.obstacle, EXCLUDED.obstacle),
    notes = COALESCE(crm_people.notes, EXCLUDED.notes),
    updated_at = EXCLUDED.updated_at
  RETURNING id
),
existing_person AS (
  SELECT id FROM public.crm_people WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'tristan@dsgnbynd.com'
),
person_id_to_use AS (
  SELECT id FROM inserted_person
  UNION ALL
  SELECT id FROM existing_person
  LIMIT 1
)
INSERT INTO public.leads (
  tenant_id, person_id, first_name, last_name, email, phone, social_username, business_type, monthly_income_range, goals_objectives, obstacles, call_attendance_confirmation, status, raw_payload, country, content_language, is_qualified, created_at, updated_at
)
SELECT 
  '520a4cfd-5183-4e11-aecc-bc71a52978b6',
  (SELECT id FROM person_id_to_use),
  'Tristan',
  'Pirouz',
  'tristan@dsgnbynd.com',
  '00971564145027',
  '@dsgb_bynd',
  'Service Provider',
  'Between $5k & $10k /mo',
  'Become an educator',
  'I would like to get some guidance and structure',
  true,
  'new',
  '{"first_name":"Tristan","last_name":"Pirouz","email":"tristan@dsgnbynd.com","phone":"00971564145027","social_username":"@dsgb_bynd","country":"United Arab Emirates","content_language":"","business_type":"Service Provider","monthly_income_range":"Between $5k & $10k /mo","goals_objectives":"Become an educator","obstacles":"I would like to get some guidance and structure","call_attendance_confirmation":"Yes","status":"new","notes":"","date_added":"Apr 22, 2026"}'::jsonb,
  'United Arab Emirates',
  NULL,
  false,
  '2026-04-21T20:00:00.000Z',
  '2026-04-21T20:00:00.000Z'
WHERE NOT EXISTS (
  SELECT 1 FROM public.leads WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'tristan@dsgnbynd.com'
);

-- Lead 94:Rami Hababat (ramiha878@gmail.com)
WITH inserted_person AS (
  INSERT INTO public.crm_people (
    tenant_id, full_name, email, phone, instagram, country, income_range, goal, obstacle, notes, created_at, updated_at
  ) VALUES (
    '520a4cfd-5183-4e11-aecc-bc71a52978b6',
    'Rami Hababat',
    'ramiha878@gmail.com',
    '569821673',
    'Infinity',
    'United Arab Emirates',
    'More than $10k /mo',
    'Increase sales',
    'Unqualified leads',
    NULL,
    '2026-04-20T20:00:00.000Z',
    '2026-04-20T20:00:00.000Z'
  )
  ON CONFLICT (tenant_id, email) WHERE (email IS NOT NULL) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    phone = COALESCE(crm_people.phone, EXCLUDED.phone),
    instagram = COALESCE(crm_people.instagram, EXCLUDED.instagram),
    country = COALESCE(crm_people.country, EXCLUDED.country),
    income_range = COALESCE(crm_people.income_range, EXCLUDED.income_range),
    goal = COALESCE(crm_people.goal, EXCLUDED.goal),
    obstacle = COALESCE(crm_people.obstacle, EXCLUDED.obstacle),
    notes = COALESCE(crm_people.notes, EXCLUDED.notes),
    updated_at = EXCLUDED.updated_at
  RETURNING id
),
existing_person AS (
  SELECT id FROM public.crm_people WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'ramiha878@gmail.com'
),
person_id_to_use AS (
  SELECT id FROM inserted_person
  UNION ALL
  SELECT id FROM existing_person
  LIMIT 1
)
INSERT INTO public.leads (
  tenant_id, person_id, first_name, last_name, email, phone, social_username, business_type, monthly_income_range, goals_objectives, obstacles, call_attendance_confirmation, status, raw_payload, country, content_language, is_qualified, created_at, updated_at
)
SELECT 
  '520a4cfd-5183-4e11-aecc-bc71a52978b6',
  (SELECT id FROM person_id_to_use),
  'Rami',
  'Hababat',
  'ramiha878@gmail.com',
  '569821673',
  'Infinity',
  'Doctor',
  'More than $10k /mo',
  'Increase sales',
  'Unqualified leads',
  true,
  'new',
  '{"first_name":"Rami","last_name":"Hababat","email":"ramiha878@gmail.com","phone":"569821673","social_username":"Infinity","country":"United Arab Emirates","content_language":"","business_type":"Doctor","monthly_income_range":"More than $10k /mo","goals_objectives":"Increase sales","obstacles":"Unqualified leads","call_attendance_confirmation":"Yes","status":"new","notes":"","date_added":"Apr 21, 2026"}'::jsonb,
  'United Arab Emirates',
  NULL,
  false,
  '2026-04-20T20:00:00.000Z',
  '2026-04-20T20:00:00.000Z'
WHERE NOT EXISTS (
  SELECT 1 FROM public.leads WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'ramiha878@gmail.com'
);

-- Lead 95:Rami Ha (ramiha878@gmail.com)
WITH inserted_person AS (
  INSERT INTO public.crm_people (
    tenant_id, full_name, email, phone, instagram, country, income_range, goal, obstacle, notes, created_at, updated_at
  ) VALUES (
    '520a4cfd-5183-4e11-aecc-bc71a52978b6',
    'Rami Ha',
    'ramiha878@gmail.com',
    '569821673',
    'Infinity',
    'United Arab Emirates',
    'More than $10k /mo',
    'Increase sales',
    'Digital buyer',
    NULL,
    '2026-04-20T20:00:00.000Z',
    '2026-04-20T20:00:00.000Z'
  )
  ON CONFLICT (tenant_id, email) WHERE (email IS NOT NULL) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    phone = COALESCE(crm_people.phone, EXCLUDED.phone),
    instagram = COALESCE(crm_people.instagram, EXCLUDED.instagram),
    country = COALESCE(crm_people.country, EXCLUDED.country),
    income_range = COALESCE(crm_people.income_range, EXCLUDED.income_range),
    goal = COALESCE(crm_people.goal, EXCLUDED.goal),
    obstacle = COALESCE(crm_people.obstacle, EXCLUDED.obstacle),
    notes = COALESCE(crm_people.notes, EXCLUDED.notes),
    updated_at = EXCLUDED.updated_at
  RETURNING id
),
existing_person AS (
  SELECT id FROM public.crm_people WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'ramiha878@gmail.com'
),
person_id_to_use AS (
  SELECT id FROM inserted_person
  UNION ALL
  SELECT id FROM existing_person
  LIMIT 1
)
INSERT INTO public.leads (
  tenant_id, person_id, first_name, last_name, email, phone, social_username, business_type, monthly_income_range, goals_objectives, obstacles, call_attendance_confirmation, status, raw_payload, country, content_language, is_qualified, created_at, updated_at
)
SELECT 
  '520a4cfd-5183-4e11-aecc-bc71a52978b6',
  (SELECT id FROM person_id_to_use),
  'Rami',
  'Ha',
  'ramiha878@gmail.com',
  '569821673',
  'Infinity',
  'Doctor',
  'More than $10k /mo',
  'Increase sales',
  'Digital buyer',
  true,
  'new',
  '{"first_name":"Rami","last_name":"Ha","email":"ramiha878@gmail.com","phone":"569821673","social_username":"Infinity","country":"United Arab Emirates","content_language":"","business_type":"Doctor","monthly_income_range":"More than $10k /mo","goals_objectives":"Increase sales","obstacles":"Digital buyer","call_attendance_confirmation":"Yes","status":"new","notes":"","date_added":"Apr 21, 2026"}'::jsonb,
  'United Arab Emirates',
  NULL,
  false,
  '2026-04-20T20:00:00.000Z',
  '2026-04-20T20:00:00.000Z'
WHERE NOT EXISTS (
  SELECT 1 FROM public.leads WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'ramiha878@gmail.com'
);

-- Lead 96:Mohammed Yashar (yashar@spacesandbeyond.ae)
WITH inserted_person AS (
  INSERT INTO public.crm_people (
    tenant_id, full_name, email, phone, instagram, country, income_range, goal, obstacle, notes, created_at, updated_at
  ) VALUES (
    '520a4cfd-5183-4e11-aecc-bc71a52978b6',
    'Mohammed Yashar',
    'yashar@spacesandbeyond.ae',
    '0585806343',
    'Memed_yashar',
    'United Arab Emirates',
    'Between $5k & $10k /mo',
    'I need to get followers trust then get leads',
    'I didnt started yet',
    NULL,
    '2026-04-20T20:00:00.000Z',
    '2026-04-20T20:00:00.000Z'
  )
  ON CONFLICT (tenant_id, email) WHERE (email IS NOT NULL) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    phone = COALESCE(crm_people.phone, EXCLUDED.phone),
    instagram = COALESCE(crm_people.instagram, EXCLUDED.instagram),
    country = COALESCE(crm_people.country, EXCLUDED.country),
    income_range = COALESCE(crm_people.income_range, EXCLUDED.income_range),
    goal = COALESCE(crm_people.goal, EXCLUDED.goal),
    obstacle = COALESCE(crm_people.obstacle, EXCLUDED.obstacle),
    notes = COALESCE(crm_people.notes, EXCLUDED.notes),
    updated_at = EXCLUDED.updated_at
  RETURNING id
),
existing_person AS (
  SELECT id FROM public.crm_people WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'yashar@spacesandbeyond.ae'
),
person_id_to_use AS (
  SELECT id FROM inserted_person
  UNION ALL
  SELECT id FROM existing_person
  LIMIT 1
)
INSERT INTO public.leads (
  tenant_id, person_id, first_name, last_name, email, phone, social_username, business_type, monthly_income_range, goals_objectives, obstacles, call_attendance_confirmation, status, raw_payload, country, content_language, is_qualified, created_at, updated_at
)
SELECT 
  '520a4cfd-5183-4e11-aecc-bc71a52978b6',
  (SELECT id FROM person_id_to_use),
  'Mohammed',
  'Yashar',
  'yashar@spacesandbeyond.ae',
  '0585806343',
  'Memed_yashar',
  'Real estate',
  'Between $5k & $10k /mo',
  'I need to get followers trust then get leads',
  'I didnt started yet',
  true,
  'new',
  '{"first_name":"Mohammed","last_name":"Yashar","email":"yashar@spacesandbeyond.ae","phone":"0585806343","social_username":"Memed_yashar","country":"United Arab Emirates","content_language":"","business_type":"Real estate","monthly_income_range":"Between $5k & $10k /mo","goals_objectives":"I need to get followers trust then get leads","obstacles":"I didnt started yet","call_attendance_confirmation":"Yes","status":"new","notes":"","date_added":"Apr 21, 2026"}'::jsonb,
  'United Arab Emirates',
  NULL,
  false,
  '2026-04-20T20:00:00.000Z',
  '2026-04-20T20:00:00.000Z'
WHERE NOT EXISTS (
  SELECT 1 FROM public.leads WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'yashar@spacesandbeyond.ae'
);

-- Lead 97:Fatimah Al Hammad (faabalhammad@gmail.com)
WITH inserted_person AS (
  INSERT INTO public.crm_people (
    tenant_id, full_name, email, phone, instagram, country, income_range, goal, obstacle, notes, created_at, updated_at
  ) VALUES (
    '520a4cfd-5183-4e11-aecc-bc71a52978b6',
    'Fatimah Al Hammad',
    'faabalhammad@gmail.com',
    '+966500062504',
    'Drfatima_hammad',
    'Saudi Arabia',
    'Between $5k & $10k /mo',
    'More cosmetic patients',
    'I don’t like to picture my self in in front camera',
    NULL,
    '2026-04-19T20:00:00.000Z',
    '2026-04-19T20:00:00.000Z'
  )
  ON CONFLICT (tenant_id, email) WHERE (email IS NOT NULL) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    phone = COALESCE(crm_people.phone, EXCLUDED.phone),
    instagram = COALESCE(crm_people.instagram, EXCLUDED.instagram),
    country = COALESCE(crm_people.country, EXCLUDED.country),
    income_range = COALESCE(crm_people.income_range, EXCLUDED.income_range),
    goal = COALESCE(crm_people.goal, EXCLUDED.goal),
    obstacle = COALESCE(crm_people.obstacle, EXCLUDED.obstacle),
    notes = COALESCE(crm_people.notes, EXCLUDED.notes),
    updated_at = EXCLUDED.updated_at
  RETURNING id
),
existing_person AS (
  SELECT id FROM public.crm_people WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'faabalhammad@gmail.com'
),
person_id_to_use AS (
  SELECT id FROM inserted_person
  UNION ALL
  SELECT id FROM existing_person
  LIMIT 1
)
INSERT INTO public.leads (
  tenant_id, person_id, first_name, last_name, email, phone, social_username, business_type, monthly_income_range, goals_objectives, obstacles, call_attendance_confirmation, status, raw_payload, country, content_language, is_qualified, created_at, updated_at
)
SELECT 
  '520a4cfd-5183-4e11-aecc-bc71a52978b6',
  (SELECT id FROM person_id_to_use),
  'Fatimah',
  'Al Hammad',
  'faabalhammad@gmail.com',
  '+966500062504',
  'Drfatima_hammad',
  'Doctor',
  'Between $5k & $10k /mo',
  'More cosmetic patients',
  'I don’t like to picture my self in in front camera',
  true,
  'new',
  '{"first_name":"Fatimah","last_name":"Al Hammad","email":"faabalhammad@gmail.com","phone":"+966500062504","social_username":"Drfatima_hammad","country":"Saudi Arabia","content_language":"","business_type":"Doctor","monthly_income_range":"Between $5k & $10k /mo","goals_objectives":"More cosmetic patients","obstacles":"I don’t like to picture my self in in front camera","call_attendance_confirmation":"Yes","status":"new","notes":"","date_added":"Apr 20, 2026"}'::jsonb,
  'Saudi Arabia',
  NULL,
  false,
  '2026-04-19T20:00:00.000Z',
  '2026-04-19T20:00:00.000Z'
WHERE NOT EXISTS (
  SELECT 1 FROM public.leads WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'faabalhammad@gmail.com'
);

-- Lead 98:Moath Abuayaha (moathabuaysha@gmail.com)
WITH inserted_person AS (
  INSERT INTO public.crm_people (
    tenant_id, full_name, email, phone, instagram, country, income_range, goal, obstacle, notes, created_at, updated_at
  ) VALUES (
    '520a4cfd-5183-4e11-aecc-bc71a52978b6',
    'Moath Abuayaha',
    'moathabuaysha@gmail.com',
    '+966555855519',
    'X previously, Tweeter @Moath_Abuaysha',
    'Saudi Arabia',
    'Between $5k & $10k /mo',
    'My goal is to build a strong expert presence around 3D printing and advanced manufacturing across multiple sectors including medical, construction, space, and other future-focused industries.

I want to grow an audience that values real expertise, innovation, and practical impact. My work sits at the intersection of technology, problem-solving, and industry application, and I want that to be translated into content that is credible, clear, and influential.

What I need help with is shaping that into a strong content and brand system: defining the right positioning, identifying the right content pillars, and turning my experience, projects, insights, and opinions into content that can consistently reach and engage the right audience.

Ultimately, I want my content to do more than gain attention. I want it to create meaningful opportunities — whether that is partnerships, speaking engagements, industry recognition, media visibility, or future ventures while positioning me as a trusted voice in 3D printing and its real-world applications.',
    'The biggest obstacle right now is turning deep, real-world expertise into a consistent content engine.

I have strong experience, valuable projects, and meaningful insights across 3D printing and advanced manufacturing, but the challenge is packaging that into clear, high-quality content consistently and strategically. I want to grow without losing authenticity, and I want the content to attract the right audience and opportunities — not just views.

That gap between expertise and scalable content is the main thing holding me back.',
    NULL,
    '2026-04-19T20:00:00.000Z',
    '2026-04-19T20:00:00.000Z'
  )
  ON CONFLICT (tenant_id, email) WHERE (email IS NOT NULL) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    phone = COALESCE(crm_people.phone, EXCLUDED.phone),
    instagram = COALESCE(crm_people.instagram, EXCLUDED.instagram),
    country = COALESCE(crm_people.country, EXCLUDED.country),
    income_range = COALESCE(crm_people.income_range, EXCLUDED.income_range),
    goal = COALESCE(crm_people.goal, EXCLUDED.goal),
    obstacle = COALESCE(crm_people.obstacle, EXCLUDED.obstacle),
    notes = COALESCE(crm_people.notes, EXCLUDED.notes),
    updated_at = EXCLUDED.updated_at
  RETURNING id
),
existing_person AS (
  SELECT id FROM public.crm_people WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'moathabuaysha@gmail.com'
),
person_id_to_use AS (
  SELECT id FROM inserted_person
  UNION ALL
  SELECT id FROM existing_person
  LIMIT 1
)
INSERT INTO public.leads (
  tenant_id, person_id, first_name, last_name, email, phone, social_username, business_type, monthly_income_range, goals_objectives, obstacles, call_attendance_confirmation, status, raw_payload, country, content_language, is_qualified, created_at, updated_at
)
SELECT 
  '520a4cfd-5183-4e11-aecc-bc71a52978b6',
  (SELECT id FROM person_id_to_use),
  'Moath',
  'Abuayaha',
  'moathabuaysha@gmail.com',
  '+966555855519',
  'X previously, Tweeter @Moath_Abuaysha',
  '3D surgical planning with 3D printing , Entrepreneur, Service Provider',
  'Between $5k & $10k /mo',
  'My goal is to build a strong expert presence around 3D printing and advanced manufacturing across multiple sectors including medical, construction, space, and other future-focused industries.

I want to grow an audience that values real expertise, innovation, and practical impact. My work sits at the intersection of technology, problem-solving, and industry application, and I want that to be translated into content that is credible, clear, and influential.

What I need help with is shaping that into a strong content and brand system: defining the right positioning, identifying the right content pillars, and turning my experience, projects, insights, and opinions into content that can consistently reach and engage the right audience.

Ultimately, I want my content to do more than gain attention. I want it to create meaningful opportunities — whether that is partnerships, speaking engagements, industry recognition, media visibility, or future ventures while positioning me as a trusted voice in 3D printing and its real-world applications.',
  'The biggest obstacle right now is turning deep, real-world expertise into a consistent content engine.

I have strong experience, valuable projects, and meaningful insights across 3D printing and advanced manufacturing, but the challenge is packaging that into clear, high-quality content consistently and strategically. I want to grow without losing authenticity, and I want the content to attract the right audience and opportunities — not just views.

That gap between expertise and scalable content is the main thing holding me back.',
  true,
  'new',
  '{"first_name":"Moath","last_name":"Abuayaha","email":"moathabuaysha@gmail.com","phone":"+966555855519","social_username":"X previously, Tweeter @Moath_Abuaysha","country":"Saudi Arabia","content_language":"","business_type":"3D surgical planning with 3D printing , Entrepreneur, Service Provider","monthly_income_range":"Between $5k & $10k /mo","goals_objectives":"My goal is to build a strong expert presence around 3D printing and advanced manufacturing across multiple sectors including medical, construction, space, and other future-focused industries.\n\nI want to grow an audience that values real expertise, innovation, and practical impact. My work sits at the intersection of technology, problem-solving, and industry application, and I want that to be translated into content that is credible, clear, and influential.\n\nWhat I need help with is shaping that into a strong content and brand system: defining the right positioning, identifying the right content pillars, and turning my experience, projects, insights, and opinions into content that can consistently reach and engage the right audience.\n\nUltimately, I want my content to do more than gain attention. I want it to create meaningful opportunities — whether that is partnerships, speaking engagements, industry recognition, media visibility, or future ventures while positioning me as a trusted voice in 3D printing and its real-world applications.","obstacles":"The biggest obstacle right now is turning deep, real-world expertise into a consistent content engine.\n\nI have strong experience, valuable projects, and meaningful insights across 3D printing and advanced manufacturing, but the challenge is packaging that into clear, high-quality content consistently and strategically. I want to grow without losing authenticity, and I want the content to attract the right audience and opportunities — not just views.\n\nThat gap between expertise and scalable content is the main thing holding me back.","call_attendance_confirmation":"Yes","status":"new","notes":"","date_added":"Apr 20, 2026"}'::jsonb,
  'Saudi Arabia',
  NULL,
  false,
  '2026-04-19T20:00:00.000Z',
  '2026-04-19T20:00:00.000Z'
WHERE NOT EXISTS (
  SELECT 1 FROM public.leads WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'moathabuaysha@gmail.com'
);

-- Lead 99:Abdullah Junid (abdwlahjunid@gmail.com)
WITH inserted_person AS (
  INSERT INTO public.crm_people (
    tenant_id, full_name, email, phone, instagram, country, income_range, goal, obstacle, notes, created_at, updated_at
  ) VALUES (
    '520a4cfd-5183-4e11-aecc-bc71a52978b6',
    'Abdullah Junid',
    'abdwlahjunid@gmail.com',
    '+971558313188',
    'Drjunid',
    'United Arab Emirates',
    'Between $5k & $10k /mo',
    'More real patients to the clinic',
    'A trusted social media marketing company',
    NULL,
    '2026-04-19T20:00:00.000Z',
    '2026-04-19T20:00:00.000Z'
  )
  ON CONFLICT (tenant_id, email) WHERE (email IS NOT NULL) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    phone = COALESCE(crm_people.phone, EXCLUDED.phone),
    instagram = COALESCE(crm_people.instagram, EXCLUDED.instagram),
    country = COALESCE(crm_people.country, EXCLUDED.country),
    income_range = COALESCE(crm_people.income_range, EXCLUDED.income_range),
    goal = COALESCE(crm_people.goal, EXCLUDED.goal),
    obstacle = COALESCE(crm_people.obstacle, EXCLUDED.obstacle),
    notes = COALESCE(crm_people.notes, EXCLUDED.notes),
    updated_at = EXCLUDED.updated_at
  RETURNING id
),
existing_person AS (
  SELECT id FROM public.crm_people WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'abdwlahjunid@gmail.com'
),
person_id_to_use AS (
  SELECT id FROM inserted_person
  UNION ALL
  SELECT id FROM existing_person
  LIMIT 1
)
INSERT INTO public.leads (
  tenant_id, person_id, first_name, last_name, email, phone, social_username, business_type, monthly_income_range, goals_objectives, obstacles, call_attendance_confirmation, status, raw_payload, country, content_language, is_qualified, created_at, updated_at
)
SELECT 
  '520a4cfd-5183-4e11-aecc-bc71a52978b6',
  (SELECT id FROM person_id_to_use),
  'Abdullah',
  'Junid',
  'abdwlahjunid@gmail.com',
  '+971558313188',
  'Drjunid',
  'Doctor',
  'Between $5k & $10k /mo',
  'More real patients to the clinic',
  'A trusted social media marketing company',
  true,
  'new',
  '{"first_name":"Abdullah","last_name":"Junid","email":"abdwlahjunid@gmail.com","phone":"+971558313188","social_username":"Drjunid","country":"United Arab Emirates","content_language":"","business_type":"Doctor","monthly_income_range":"Between $5k & $10k /mo","goals_objectives":"More real patients to the clinic","obstacles":"A trusted social media marketing company","call_attendance_confirmation":"Yes","status":"new","notes":"","date_added":"Apr 20, 2026"}'::jsonb,
  'United Arab Emirates',
  NULL,
  false,
  '2026-04-19T20:00:00.000Z',
  '2026-04-19T20:00:00.000Z'
WHERE NOT EXISTS (
  SELECT 1 FROM public.leads WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'abdwlahjunid@gmail.com'
);

-- Lead 100:Rania Barghout (rania@thenextchapter.vip)
WITH inserted_person AS (
  INSERT INTO public.crm_people (
    tenant_id, full_name, email, phone, instagram, country, income_range, goal, obstacle, notes, created_at, updated_at
  ) VALUES (
    '520a4cfd-5183-4e11-aecc-bc71a52978b6',
    'Rania Barghout',
    'rania@thenextchapter.vip',
    '0585889780',
    '@Notaassater',
    'United Arab Emirates',
    'Between $5k & $10k /mo',
    'I need more clients',
    'I am unable to reach the right clients not the right followers',
    NULL,
    '2026-04-19T20:00:00.000Z',
    '2026-04-19T20:00:00.000Z'
  )
  ON CONFLICT (tenant_id, email) WHERE (email IS NOT NULL) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    phone = COALESCE(crm_people.phone, EXCLUDED.phone),
    instagram = COALESCE(crm_people.instagram, EXCLUDED.instagram),
    country = COALESCE(crm_people.country, EXCLUDED.country),
    income_range = COALESCE(crm_people.income_range, EXCLUDED.income_range),
    goal = COALESCE(crm_people.goal, EXCLUDED.goal),
    obstacle = COALESCE(crm_people.obstacle, EXCLUDED.obstacle),
    notes = COALESCE(crm_people.notes, EXCLUDED.notes),
    updated_at = EXCLUDED.updated_at
  RETURNING id
),
existing_person AS (
  SELECT id FROM public.crm_people WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'rania@thenextchapter.vip'
),
person_id_to_use AS (
  SELECT id FROM inserted_person
  UNION ALL
  SELECT id FROM existing_person
  LIMIT 1
)
INSERT INTO public.leads (
  tenant_id, person_id, first_name, last_name, email, phone, social_username, business_type, monthly_income_range, goals_objectives, obstacles, call_attendance_confirmation, status, raw_payload, country, content_language, is_qualified, created_at, updated_at
)
SELECT 
  '520a4cfd-5183-4e11-aecc-bc71a52978b6',
  (SELECT id FROM person_id_to_use),
  'Rania',
  'Barghout',
  'rania@thenextchapter.vip',
  '0585889780',
  '@Notaassater',
  'Service Provider, Content Creator, Consultant, Media and communication coach',
  'Between $5k & $10k /mo',
  'I need more clients',
  'I am unable to reach the right clients not the right followers',
  true,
  'new',
  '{"first_name":"Rania","last_name":"Barghout","email":"rania@thenextchapter.vip","phone":"0585889780","social_username":"@Notaassater","country":"United Arab Emirates","content_language":"","business_type":"Service Provider, Content Creator, Consultant, Media and communication coach","monthly_income_range":"Between $5k & $10k /mo","goals_objectives":"I need more clients","obstacles":"I am unable to reach the right clients not the right followers","call_attendance_confirmation":"Yes","status":"new","notes":"","date_added":"Apr 20, 2026"}'::jsonb,
  'United Arab Emirates',
  NULL,
  false,
  '2026-04-19T20:00:00.000Z',
  '2026-04-19T20:00:00.000Z'
WHERE NOT EXISTS (
  SELECT 1 FROM public.leads WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'rania@thenextchapter.vip'
);