-- ClipsOS V2 Leads Import Script - Part 4

-- Leads 151 to 200

-- Lead 151:Rakan Al-Turki (rralturki@gmail.com)
WITH inserted_person AS (
  INSERT INTO public.crm_people (
    tenant_id, full_name, email, phone, instagram, country, income_range, goal, obstacle, notes, created_at, updated_at
  ) VALUES (
    '520a4cfd-5183-4e11-aecc-bc71a52978b6',
    'Rakan Al-Turki',
    'rralturki@gmail.com',
    '+4915511311458',
    'rakanrt',
    'Saudi Arabia',
    'Between $5k & $10k /mo',
    'I want to build a high-level personal brand around my work as a plastic and reconstructive microsurgeon, with a particular focus on microsurgery, lymphatic surgery, and complex reconstruction. My goal is not just to post content, but to establish a digital presence that reflects expertise, credibility, international training, and a premium standard;  I want to suggest luxury in reconstructive mircosurgery, similar to luxury in aesthetic plastic surgery. I want my platform to attract the right audience, strengthen my professional reputation in the GCC, and position me as a leading voice in my field. I need help turning my knowledge, cases, and perspective into a clear content strategy, high-quality production, and a consistent social media presence that feels polished and intentional.',
    'The biggest obstacle is time and structure. My work is demanding, and while I have a clear vision for how I want to be positioned, I do not have the bandwidth to build and run the content machine myself. I also want to avoid generic or overly commercial medical content. It is important to me that the brand feels refined, authoritative, and aligned with who I am professionally. So the challenge is creating high-quality, strategic content consistently without compromising standards or consuming too much of my time.',
    NULL,
    '2026-04-12T20:00:00.000Z',
    '2026-04-12T20:00:00.000Z'
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
  SELECT id FROM public.crm_people WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'rralturki@gmail.com'
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
  'Rakan',
  'Al-Turki',
  'rralturki@gmail.com',
  '+4915511311458',
  'rakanrt',
  'Service Provider, Content Creator, Doctor',
  'Between $5k & $10k /mo',
  'I want to build a high-level personal brand around my work as a plastic and reconstructive microsurgeon, with a particular focus on microsurgery, lymphatic surgery, and complex reconstruction. My goal is not just to post content, but to establish a digital presence that reflects expertise, credibility, international training, and a premium standard;  I want to suggest luxury in reconstructive mircosurgery, similar to luxury in aesthetic plastic surgery. I want my platform to attract the right audience, strengthen my professional reputation in the GCC, and position me as a leading voice in my field. I need help turning my knowledge, cases, and perspective into a clear content strategy, high-quality production, and a consistent social media presence that feels polished and intentional.',
  'The biggest obstacle is time and structure. My work is demanding, and while I have a clear vision for how I want to be positioned, I do not have the bandwidth to build and run the content machine myself. I also want to avoid generic or overly commercial medical content. It is important to me that the brand feels refined, authoritative, and aligned with who I am professionally. So the challenge is creating high-quality, strategic content consistently without compromising standards or consuming too much of my time.',
  true,
  'new',
  '{"first_name":"Rakan","last_name":"Al-Turki","email":"rralturki@gmail.com","phone":"+4915511311458","social_username":"rakanrt","country":"Saudi Arabia","content_language":"","business_type":"Service Provider, Content Creator, Doctor","monthly_income_range":"Between $5k & $10k /mo","goals_objectives":"I want to build a high-level personal brand around my work as a plastic and reconstructive microsurgeon, with a particular focus on microsurgery, lymphatic surgery, and complex reconstruction. My goal is not just to post content, but to establish a digital presence that reflects expertise, credibility, international training, and a premium standard;  I want to suggest luxury in reconstructive mircosurgery, similar to luxury in aesthetic plastic surgery. I want my platform to attract the right audience, strengthen my professional reputation in the GCC, and position me as a leading voice in my field. I need help turning my knowledge, cases, and perspective into a clear content strategy, high-quality production, and a consistent social media presence that feels polished and intentional.","obstacles":"The biggest obstacle is time and structure. My work is demanding, and while I have a clear vision for how I want to be positioned, I do not have the bandwidth to build and run the content machine myself. I also want to avoid generic or overly commercial medical content. It is important to me that the brand feels refined, authoritative, and aligned with who I am professionally. So the challenge is creating high-quality, strategic content consistently without compromising standards or consuming too much of my time.","call_attendance_confirmation":"Yes","status":"new","notes":"","date_added":"Apr 13, 2026"}'::jsonb,
  'Saudi Arabia',
  NULL,
  false,
  '2026-04-12T20:00:00.000Z',
  '2026-04-12T20:00:00.000Z'
WHERE NOT EXISTS (
  SELECT 1 FROM public.leads WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'rralturki@gmail.com'
);

-- Lead 152:Ahmed El shall (smilewaydc@gmail.com)
WITH inserted_person AS (
  INSERT INTO public.crm_people (
    tenant_id, full_name, email, phone, instagram, country, income_range, goal, obstacle, notes, created_at, updated_at
  ) VALUES (
    '520a4cfd-5183-4e11-aecc-bc71a52978b6',
    'Ahmed El shall',
    'smilewaydc@gmail.com',
    '0542547140',
    'Ahmed.moh.el.shall/dr..ahmed.el.shal',
    'Saudi Arabia',
    'Between $5k & $10k /mo',
    'Personal branding',
    'Need personal branding and self marketing',
    NULL,
    '2026-04-11T20:00:00.000Z',
    '2026-04-11T20:00:00.000Z'
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
  SELECT id FROM public.crm_people WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'smilewaydc@gmail.com'
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
  'El shall',
  'smilewaydc@gmail.com',
  '0542547140',
  'Ahmed.moh.el.shall/dr..ahmed.el.shal',
  'Doctor',
  'Between $5k & $10k /mo',
  'Personal branding',
  'Need personal branding and self marketing',
  true,
  'new',
  '{"first_name":"Ahmed","last_name":"El shall","email":"smilewaydc@gmail.com","phone":"0542547140","social_username":"Ahmed.moh.el.shall/dr..ahmed.el.shal","country":"Saudi Arabia","content_language":"","business_type":"Doctor","monthly_income_range":"Between $5k & $10k /mo","goals_objectives":"Personal branding","obstacles":"Need personal branding and self marketing","call_attendance_confirmation":"Yes","status":"new","notes":"","date_added":"Apr 12, 2026"}'::jsonb,
  'Saudi Arabia',
  NULL,
  false,
  '2026-04-11T20:00:00.000Z',
  '2026-04-11T20:00:00.000Z'
WHERE NOT EXISTS (
  SELECT 1 FROM public.leads WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'smilewaydc@gmail.com'
);

-- Lead 153:Rehab Nasser (rehabnasser.me@gmail.com)
WITH inserted_person AS (
  INSERT INTO public.crm_people (
    tenant_id, full_name, email, phone, instagram, country, income_range, goal, obstacle, notes, created_at, updated_at
  ) VALUES (
    '520a4cfd-5183-4e11-aecc-bc71a52978b6',
    'Rehab Nasser',
    'rehabnasser.me@gmail.com',
    '+971582112709',
    '@rehab_nasser.me',
    'United Arab Emirates',
    'Between $5k & $10k /mo',
    'I want to build a strong personal brand as a fashion brand consultant and creative director. To be established as a credible source of advice for brand owners and fashion entrepreneurs. My goal is to use social media as a tool to reach my niche audience and generate leads and bookings for my consulting services.

I need help building the right content strategy as well as generate the needed content in an efficient way that doesn’t require a lot of time',
    'I have lots of content ideas but I need help organizing them in a successful strategy and presenting them in a way that attracts my audience.',
    NULL,
    '2026-04-11T20:00:00.000Z',
    '2026-04-11T20:00:00.000Z'
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
  SELECT id FROM public.crm_people WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'rehabnasser.me@gmail.com'
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
  'Rehab',
  'Nasser',
  'rehabnasser.me@gmail.com',
  '+971582112709',
  '@rehab_nasser.me',
  'Service Provider, Consultant, Content Creator',
  'Between $5k & $10k /mo',
  'I want to build a strong personal brand as a fashion brand consultant and creative director. To be established as a credible source of advice for brand owners and fashion entrepreneurs. My goal is to use social media as a tool to reach my niche audience and generate leads and bookings for my consulting services.

I need help building the right content strategy as well as generate the needed content in an efficient way that doesn’t require a lot of time',
  'I have lots of content ideas but I need help organizing them in a successful strategy and presenting them in a way that attracts my audience.',
  true,
  'new',
  '{"first_name":"Rehab","last_name":"Nasser","email":"rehabnasser.me@gmail.com","phone":"+971582112709","social_username":"@rehab_nasser.me","country":"United Arab Emirates","content_language":"","business_type":"Service Provider, Consultant, Content Creator","monthly_income_range":"Between $5k & $10k /mo","goals_objectives":"I want to build a strong personal brand as a fashion brand consultant and creative director. To be established as a credible source of advice for brand owners and fashion entrepreneurs. My goal is to use social media as a tool to reach my niche audience and generate leads and bookings for my consulting services.\n\nI need help building the right content strategy as well as generate the needed content in an efficient way that doesn’t require a lot of time","obstacles":"I have lots of content ideas but I need help organizing them in a successful strategy and presenting them in a way that attracts my audience.","call_attendance_confirmation":"Yes","status":"new","notes":"","date_added":"Apr 12, 2026"}'::jsonb,
  'United Arab Emirates',
  NULL,
  false,
  '2026-04-11T20:00:00.000Z',
  '2026-04-11T20:00:00.000Z'
WHERE NOT EXISTS (
  SELECT 1 FROM public.leads WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'rehabnasser.me@gmail.com'
);

-- Lead 154:Mohammad Abdo (abdotry@yahoo.com)
WITH inserted_person AS (
  INSERT INTO public.crm_people (
    tenant_id, full_name, email, phone, instagram, country, income_range, goal, obstacle, notes, created_at, updated_at
  ) VALUES (
    '520a4cfd-5183-4e11-aecc-bc71a52978b6',
    'Mohammad Abdo',
    'abdotry@yahoo.com',
    '+4917661315961',
    '..',
    'Germany',
    'Between $5k & $10k /mo',
    'Educational Videos for the public',
    'Time',
    NULL,
    '2026-04-11T20:00:00.000Z',
    '2026-04-11T20:00:00.000Z'
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
  SELECT id FROM public.crm_people WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'abdotry@yahoo.com'
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
  'Abdo',
  'abdotry@yahoo.com',
  '+4917661315961',
  '..',
  'Doctor',
  'Between $5k & $10k /mo',
  'Educational Videos for the public',
  'Time',
  true,
  'qualified',
  '{"first_name":"Mohammad","last_name":"Abdo","email":"abdotry@yahoo.com","phone":"+4917661315961","social_username":"..","country":"Germany","content_language":"Arabic","business_type":"Doctor","monthly_income_range":"Between $5k & $10k /mo","goals_objectives":"Educational Videos for the public","obstacles":"Time","call_attendance_confirmation":"Yes","status":"qualified","notes":"","date_added":"Apr 12, 2026"}'::jsonb,
  'Germany',
  'Arabic',
  false,
  '2026-04-11T20:00:00.000Z',
  '2026-04-11T20:00:00.000Z'
WHERE NOT EXISTS (
  SELECT 1 FROM public.leads WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'abdotry@yahoo.com'
);

-- Lead 155:Sulaiman Taleb (stalib12@gmail.com)
WITH inserted_person AS (
  INSERT INTO public.crm_people (
    tenant_id, full_name, email, phone, instagram, country, income_range, goal, obstacle, notes, created_at, updated_at
  ) VALUES (
    '520a4cfd-5183-4e11-aecc-bc71a52978b6',
    'Sulaiman Taleb',
    'stalib12@gmail.com',
    '+966504777221',
    'Sulaiman.taleb',
    'Saudi Arabia',
    'More than $10k /mo',
    'Reaching out to people and my clinic will be fully booked',
    'Social media',
    NULL,
    '2026-04-11T20:00:00.000Z',
    '2026-04-11T20:00:00.000Z'
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
  SELECT id FROM public.crm_people WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'stalib12@gmail.com'
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
  'Sulaiman',
  'Taleb',
  'stalib12@gmail.com',
  '+966504777221',
  'Sulaiman.taleb',
  'Doctor',
  'More than $10k /mo',
  'Reaching out to people and my clinic will be fully booked',
  'Social media',
  true,
  'new',
  '{"first_name":"Sulaiman","last_name":"Taleb","email":"stalib12@gmail.com","phone":"+966504777221","social_username":"Sulaiman.taleb","country":"Saudi Arabia","content_language":"","business_type":"Doctor","monthly_income_range":"More than $10k /mo","goals_objectives":"Reaching out to people and my clinic will be fully booked","obstacles":"Social media","call_attendance_confirmation":"Yes","status":"new","notes":"","date_added":"Apr 12, 2026"}'::jsonb,
  'Saudi Arabia',
  NULL,
  false,
  '2026-04-11T20:00:00.000Z',
  '2026-04-11T20:00:00.000Z'
WHERE NOT EXISTS (
  SELECT 1 FROM public.leads WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'stalib12@gmail.com'
);

-- Lead 156:Hassaan Allam (sony00410@gmail.com)
WITH inserted_person AS (
  INSERT INTO public.crm_people (
    tenant_id, full_name, email, phone, instagram, country, income_range, goal, obstacle, notes, created_at, updated_at
  ) VALUES (
    '520a4cfd-5183-4e11-aecc-bc71a52978b6',
    'Hassaan Allam',
    'sony00410@gmail.com',
    '+966566857974',
    'Obgyn_hs',
    'Saudi Arabia',
    'Between $5k & $10k /mo',
    'How to increase productivity , how can increase my audience',
    'Too many similarities of my specialty as OB&GYN',
    NULL,
    '2026-04-11T20:00:00.000Z',
    '2026-04-11T20:00:00.000Z'
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
  SELECT id FROM public.crm_people WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'sony00410@gmail.com'
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
  'Hassaan',
  'Allam',
  'sony00410@gmail.com',
  '+966566857974',
  'Obgyn_hs',
  'Doctor',
  'Between $5k & $10k /mo',
  'How to increase productivity , how can increase my audience',
  'Too many similarities of my specialty as OB&GYN',
  true,
  'new',
  '{"first_name":"Hassaan","last_name":"Allam","email":"sony00410@gmail.com","phone":"+966566857974","social_username":"Obgyn_hs","country":"Saudi Arabia","content_language":"","business_type":"Doctor","monthly_income_range":"Between $5k & $10k /mo","goals_objectives":"How to increase productivity , how can increase my audience","obstacles":"Too many similarities of my specialty as OB&GYN","call_attendance_confirmation":"Yes","status":"new","notes":"","date_added":"Apr 12, 2026"}'::jsonb,
  'Saudi Arabia',
  NULL,
  false,
  '2026-04-11T20:00:00.000Z',
  '2026-04-11T20:00:00.000Z'
WHERE NOT EXISTS (
  SELECT 1 FROM public.leads WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'sony00410@gmail.com'
);

-- Lead 157:Muath Alnaqbi (p.m3ath@hotmail.com)
WITH inserted_person AS (
  INSERT INTO public.crm_people (
    tenant_id, full_name, email, phone, instagram, country, income_range, goal, obstacle, notes, created_at, updated_at
  ) VALUES (
    '520a4cfd-5183-4e11-aecc-bc71a52978b6',
    'Muath Alnaqbi',
    'p.m3ath@hotmail.com',
    '+971501925255',
    '@muathjn',
    'United Arab Emirates',
    'Between $5k & $10k /mo',
    'Dental health content . 
I want to start in social media but i don’t know how and when.',
    'Time, ideas and afraid to start',
    NULL,
    '2026-04-11T20:00:00.000Z',
    '2026-04-11T20:00:00.000Z'
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
  SELECT id FROM public.crm_people WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'p.m3ath@hotmail.com'
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
  'Muath',
  'Alnaqbi',
  'p.m3ath@hotmail.com',
  '+971501925255',
  '@muathjn',
  'Doctor',
  'Between $5k & $10k /mo',
  'Dental health content . 
I want to start in social media but i don’t know how and when.',
  'Time, ideas and afraid to start',
  true,
  'new',
  '{"first_name":"Muath","last_name":"Alnaqbi","email":"p.m3ath@hotmail.com","phone":"+971501925255","social_username":"@muathjn","country":"United Arab Emirates","content_language":"","business_type":"Doctor","monthly_income_range":"Between $5k & $10k /mo","goals_objectives":"Dental health content . \nI want to start in social media but i don’t know how and when.","obstacles":"Time, ideas and afraid to start","call_attendance_confirmation":"Yes","status":"new","notes":"","date_added":"Apr 12, 2026"}'::jsonb,
  'United Arab Emirates',
  NULL,
  false,
  '2026-04-11T20:00:00.000Z',
  '2026-04-11T20:00:00.000Z'
WHERE NOT EXISTS (
  SELECT 1 FROM public.leads WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'p.m3ath@hotmail.com'
);

-- Lead 158:Ahmed Yehia (yehia.ay@gmail.com)
WITH inserted_person AS (
  INSERT INTO public.crm_people (
    tenant_id, full_name, email, phone, instagram, country, income_range, goal, obstacle, notes, created_at, updated_at
  ) VALUES (
    '520a4cfd-5183-4e11-aecc-bc71a52978b6',
    'Ahmed Yehia',
    'yehia.ay@gmail.com',
    '+966534446078',
    '@afayad',
    'Saudi Arabia',
    'Between $5k & $10k /mo',
    'Clients acquisition',
    'Good agrncy',
    NULL,
    '2026-04-11T20:00:00.000Z',
    '2026-04-11T20:00:00.000Z'
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
  SELECT id FROM public.crm_people WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'yehia.ay@gmail.com'
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
  'Yehia',
  'yehia.ay@gmail.com',
  '+966534446078',
  '@afayad',
  'Entrepreneur',
  'Between $5k & $10k /mo',
  'Clients acquisition',
  'Good agrncy',
  true,
  'new',
  '{"first_name":"Ahmed","last_name":"Yehia","email":"yehia.ay@gmail.com","phone":"+966534446078","social_username":"@afayad","country":"Saudi Arabia","content_language":"","business_type":"Entrepreneur","monthly_income_range":"Between $5k & $10k /mo","goals_objectives":"Clients acquisition","obstacles":"Good agrncy","call_attendance_confirmation":"Yes","status":"new","notes":"","date_added":"Apr 12, 2026"}'::jsonb,
  'Saudi Arabia',
  NULL,
  false,
  '2026-04-11T20:00:00.000Z',
  '2026-04-11T20:00:00.000Z'
WHERE NOT EXISTS (
  SELECT 1 FROM public.leads WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'yehia.ay@gmail.com'
);

-- Lead 159:Ahmed Elbegawy (bejawe999@gmail.com)
WITH inserted_person AS (
  INSERT INTO public.crm_people (
    tenant_id, full_name, email, phone, instagram, country, income_range, goal, obstacle, notes, created_at, updated_at
  ) VALUES (
    '520a4cfd-5183-4e11-aecc-bc71a52978b6',
    'Ahmed Elbegawy',
    'bejawe999@gmail.com',
    '+966538550613',
    'I don’t have one yet',
    'Saudi Arabia',
    'More than $10k /mo',
    'I want to systamyz content creation optimizing for building trust with my audience and  driving the most leads possible',
    'patients',
    NULL,
    '2026-04-11T20:00:00.000Z',
    '2026-04-11T20:00:00.000Z'
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
  SELECT id FROM public.crm_people WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'bejawe999@gmail.com'
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
  'Elbegawy',
  'bejawe999@gmail.com',
  '+966538550613',
  'I don’t have one yet',
  'Service Provider',
  'More than $10k /mo',
  'I want to systamyz content creation optimizing for building trust with my audience and  driving the most leads possible',
  'patients',
  true,
  'new',
  '{"first_name":"Ahmed","last_name":"Elbegawy","email":"bejawe999@gmail.com","phone":"+966538550613","social_username":"I don’t have one yet","country":"Saudi Arabia","content_language":"","business_type":"Service Provider","monthly_income_range":"More than $10k /mo","goals_objectives":"I want to systamyz content creation optimizing for building trust with my audience and  driving the most leads possible","obstacles":"patients","call_attendance_confirmation":"Yes","status":"new","notes":"","date_added":"Apr 12, 2026"}'::jsonb,
  'Saudi Arabia',
  NULL,
  false,
  '2026-04-11T20:00:00.000Z',
  '2026-04-11T20:00:00.000Z'
WHERE NOT EXISTS (
  SELECT 1 FROM public.leads WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'bejawe999@gmail.com'
);

-- Lead 160:Hisham Silsilah (dr.h.silsilah@gmail.com)
WITH inserted_person AS (
  INSERT INTO public.crm_people (
    tenant_id, full_name, email, phone, instagram, country, income_range, goal, obstacle, notes, created_at, updated_at
  ) VALUES (
    '520a4cfd-5183-4e11-aecc-bc71a52978b6',
    'Hisham Silsilah',
    'dr.h.silsilah@gmail.com',
    '0533398338',
    'dr.hisham_silsilah',
    'Saudi Arabia',
    'Between $5k & $10k /mo',
    'Iam want to be famous pediatrician how creat videos on instagram and TikTok, currently Iam on residency Pediatric program so I want to talk about what matters the parents regarding their children health , emergencies care',
    'Finding time to creat the content 
Make my videos interesting and earn a lot of views 
Showing my face 
And the hole process',
    NULL,
    '2026-04-11T20:00:00.000Z',
    '2026-04-11T20:00:00.000Z'
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
  SELECT id FROM public.crm_people WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'dr.h.silsilah@gmail.com'
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
  'Hisham',
  'Silsilah',
  'dr.h.silsilah@gmail.com',
  '0533398338',
  'dr.hisham_silsilah',
  'Doctor',
  'Between $5k & $10k /mo',
  'Iam want to be famous pediatrician how creat videos on instagram and TikTok, currently Iam on residency Pediatric program so I want to talk about what matters the parents regarding their children health , emergencies care',
  'Finding time to creat the content 
Make my videos interesting and earn a lot of views 
Showing my face 
And the hole process',
  true,
  'new',
  '{"first_name":"Hisham","last_name":"Silsilah","email":"dr.h.silsilah@gmail.com","phone":"0533398338","social_username":"dr.hisham_silsilah","country":"Saudi Arabia","content_language":"","business_type":"Doctor","monthly_income_range":"Between $5k & $10k /mo","goals_objectives":"Iam want to be famous pediatrician how creat videos on instagram and TikTok, currently Iam on residency Pediatric program so I want to talk about what matters the parents regarding their children health , emergencies care","obstacles":"Finding time to creat the content \nMake my videos interesting and earn a lot of views \nShowing my face \nAnd the hole process","call_attendance_confirmation":"Yes","status":"new","notes":"","date_added":"Apr 12, 2026"}'::jsonb,
  'Saudi Arabia',
  NULL,
  false,
  '2026-04-11T20:00:00.000Z',
  '2026-04-11T20:00:00.000Z'
WHERE NOT EXISTS (
  SELECT 1 FROM public.leads WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'dr.h.silsilah@gmail.com'
);

-- Lead 161:Islam Khaled (dr.is83@gmail.com)
WITH inserted_person AS (
  INSERT INTO public.crm_people (
    tenant_id, full_name, email, phone, instagram, country, income_range, goal, obstacle, notes, created_at, updated_at
  ) VALUES (
    '520a4cfd-5183-4e11-aecc-bc71a52978b6',
    'Islam Khaled',
    'dr.is83@gmail.com',
    '0563682829',
    'Hhggg',
    'Saudi Arabia',
    'More than $10k /mo',
    'Gg',
    'Gg',
    NULL,
    '2026-04-11T20:00:00.000Z',
    '2026-04-11T20:00:00.000Z'
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
  SELECT id FROM public.crm_people WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'dr.is83@gmail.com'
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
  'Islam',
  'Khaled',
  'dr.is83@gmail.com',
  '0563682829',
  'Hhggg',
  'Doctor',
  'More than $10k /mo',
  'Gg',
  'Gg',
  true,
  'new',
  '{"first_name":"Islam","last_name":"Khaled","email":"dr.is83@gmail.com","phone":"0563682829","social_username":"Hhggg","country":"Saudi Arabia","content_language":"","business_type":"Doctor","monthly_income_range":"More than $10k /mo","goals_objectives":"Gg","obstacles":"Gg","call_attendance_confirmation":"Yes","status":"new","notes":"","date_added":"Apr 12, 2026"}'::jsonb,
  'Saudi Arabia',
  NULL,
  false,
  '2026-04-11T20:00:00.000Z',
  '2026-04-11T20:00:00.000Z'
WHERE NOT EXISTS (
  SELECT 1 FROM public.leads WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'dr.is83@gmail.com'
);

-- Lead 162:Hisham Basamh (hbasamh@hotmail.com)
WITH inserted_person AS (
  INSERT INTO public.crm_people (
    tenant_id, full_name, email, phone, instagram, country, income_range, goal, obstacle, notes, created_at, updated_at
  ) VALUES (
    '520a4cfd-5183-4e11-aecc-bc71a52978b6',
    'Hisham Basamh',
    'hbasamh@hotmail.com',
    '+966590029024',
    'Hbasamh',
    'Saudi Arabia',
    'Between $5k & $10k /mo',
    'More engagment',
    'Creating posts',
    NULL,
    '2026-04-10T20:00:00.000Z',
    '2026-04-10T20:00:00.000Z'
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
  SELECT id FROM public.crm_people WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'hbasamh@hotmail.com'
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
  'Hisham',
  'Basamh',
  'hbasamh@hotmail.com',
  '+966590029024',
  'Hbasamh',
  'Consultant',
  'Between $5k & $10k /mo',
  'More engagment',
  'Creating posts',
  true,
  'new',
  '{"first_name":"Hisham","last_name":"Basamh","email":"hbasamh@hotmail.com","phone":"+966590029024","social_username":"Hbasamh","country":"Saudi Arabia","content_language":"","business_type":"Consultant","monthly_income_range":"Between $5k & $10k /mo","goals_objectives":"More engagment","obstacles":"Creating posts","call_attendance_confirmation":"Yes","status":"new","notes":"","date_added":"Apr 11, 2026"}'::jsonb,
  'Saudi Arabia',
  NULL,
  false,
  '2026-04-10T20:00:00.000Z',
  '2026-04-10T20:00:00.000Z'
WHERE NOT EXISTS (
  SELECT 1 FROM public.leads WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'hbasamh@hotmail.com'
);

-- Lead 163:Sarah Abou chakra (sabouchakra@amd.com.sa)
WITH inserted_person AS (
  INSERT INTO public.crm_people (
    tenant_id, full_name, email, phone, instagram, country, income_range, goal, obstacle, notes, created_at, updated_at
  ) VALUES (
    '520a4cfd-5183-4e11-aecc-bc71a52978b6',
    'Sarah Abou chakra',
    'sabouchakra@amd.com.sa',
    '+966531671976',
    '@-',
    'Saudi Arabia',
    'More than $10k /mo',
    'Social media presence',
    'Ministry of health guidelines, no knowledge in design and content creation',
    NULL,
    '2026-04-10T20:00:00.000Z',
    '2026-04-10T20:00:00.000Z'
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
  SELECT id FROM public.crm_people WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'sabouchakra@amd.com.sa'
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
  'Sarah',
  'Abou chakra',
  'sabouchakra@amd.com.sa',
  '+966531671976',
  '@-',
  'Service Provider',
  'More than $10k /mo',
  'Social media presence',
  'Ministry of health guidelines, no knowledge in design and content creation',
  true,
  'new',
  '{"first_name":"Sarah","last_name":"Abou chakra","email":"sabouchakra@amd.com.sa","phone":"+966531671976","social_username":"@-","country":"Saudi Arabia","content_language":"","business_type":"Service Provider","monthly_income_range":"More than $10k /mo","goals_objectives":"Social media presence","obstacles":"Ministry of health guidelines, no knowledge in design and content creation","call_attendance_confirmation":"Yes","status":"new","notes":"","date_added":"Apr 11, 2026"}'::jsonb,
  'Saudi Arabia',
  NULL,
  false,
  '2026-04-10T20:00:00.000Z',
  '2026-04-10T20:00:00.000Z'
WHERE NOT EXISTS (
  SELECT 1 FROM public.leads WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'sabouchakra@amd.com.sa'
);

-- Lead 164:Muath Almurayyi (moathjony@gmail.com)
WITH inserted_person AS (
  INSERT INTO public.crm_people (
    tenant_id, full_name, email, phone, instagram, country, income_range, goal, obstacle, notes, created_at, updated_at
  ) VALUES (
    '520a4cfd-5183-4e11-aecc-bc71a52978b6',
    'Muath Almurayyi',
    'moathjony@gmail.com',
    '966515985092',
    'Dr.Muath Almurayyi',
    'Saudi Arabia',
    'Between $5k & $10k /mo',
    'Establish website 
Creat a weekly content through social media 1 video and 1 poster 
Increase followers and views',
    'Dont have enough time 
I dont know how reach more viewers',
    NULL,
    '2026-04-10T20:00:00.000Z',
    '2026-04-10T20:00:00.000Z'
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
  SELECT id FROM public.crm_people WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'moathjony@gmail.com'
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
  'Muath',
  'Almurayyi',
  'moathjony@gmail.com',
  '966515985092',
  'Dr.Muath Almurayyi',
  'Consultant, Doctor',
  'Between $5k & $10k /mo',
  'Establish website 
Creat a weekly content through social media 1 video and 1 poster 
Increase followers and views',
  'Dont have enough time 
I dont know how reach more viewers',
  true,
  'new',
  '{"first_name":"Muath","last_name":"Almurayyi","email":"moathjony@gmail.com","phone":"966515985092","social_username":"Dr.Muath Almurayyi","country":"Saudi Arabia","content_language":"","business_type":"Consultant, Doctor","monthly_income_range":"Between $5k & $10k /mo","goals_objectives":"Establish website \nCreat a weekly content through social media 1 video and 1 poster \nIncrease followers and views","obstacles":"Dont have enough time \nI dont know how reach more viewers","call_attendance_confirmation":"Yes","status":"new","notes":"","date_added":"Apr 11, 2026"}'::jsonb,
  'Saudi Arabia',
  NULL,
  false,
  '2026-04-10T20:00:00.000Z',
  '2026-04-10T20:00:00.000Z'
WHERE NOT EXISTS (
  SELECT 1 FROM public.leads WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'moathjony@gmail.com'
);

-- Lead 165:Mohamed Sabbagh (msabbagh221@gmail.com)
WITH inserted_person AS (
  INSERT INTO public.crm_people (
    tenant_id, full_name, email, phone, instagram, country, income_range, goal, obstacle, notes, created_at, updated_at
  ) VALUES (
    '520a4cfd-5183-4e11-aecc-bc71a52978b6',
    'Mohamed Sabbagh',
    'msabbagh221@gmail.com',
    '004915736795528',
    'Mohamed.sabbaghh',
    'Germany',
    'Between $5k & $10k /mo',
    'Famous to be',
    'صناعة محتوى تسويقي',
    NULL,
    '2026-04-10T20:00:00.000Z',
    '2026-04-10T20:00:00.000Z'
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
  SELECT id FROM public.crm_people WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'msabbagh221@gmail.com'
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
  'Sabbagh',
  'msabbagh221@gmail.com',
  '004915736795528',
  'Mohamed.sabbaghh',
  'Doctor',
  'Between $5k & $10k /mo',
  'Famous to be',
  'صناعة محتوى تسويقي',
  true,
  'qualified',
  '{"first_name":"Mohamed","last_name":"Sabbagh","email":"msabbagh221@gmail.com","phone":"004915736795528","social_username":"Mohamed.sabbaghh","country":"Germany","content_language":"Arabic","business_type":"Doctor","monthly_income_range":"Between $5k & $10k /mo","goals_objectives":"Famous to be","obstacles":"صناعة محتوى تسويقي","call_attendance_confirmation":"Yes","status":"qualified","notes":"","date_added":"Apr 11, 2026"}'::jsonb,
  'Germany',
  'Arabic',
  false,
  '2026-04-10T20:00:00.000Z',
  '2026-04-10T20:00:00.000Z'
WHERE NOT EXISTS (
  SELECT 1 FROM public.leads WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'msabbagh221@gmail.com'
);

-- Lead 166:Lina Baabbad (lina.baabbad@gmail.com)
WITH inserted_person AS (
  INSERT INTO public.crm_people (
    tenant_id, full_name, email, phone, instagram, country, income_range, goal, obstacle, notes, created_at, updated_at
  ) VALUES (
    '520a4cfd-5183-4e11-aecc-bc71a52978b6',
    'Lina Baabbad',
    'lina.baabbad@gmail.com',
    '966541800009',
    'Lina baabbad',
    'Saudi Arabia',
    'More than $10k /mo',
    'More active in social media',
    'Time',
    NULL,
    '2026-04-10T20:00:00.000Z',
    '2026-04-10T20:00:00.000Z'
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
  SELECT id FROM public.crm_people WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'lina.baabbad@gmail.com'
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
  'Baabbad',
  'lina.baabbad@gmail.com',
  '966541800009',
  'Lina baabbad',
  'Doctor',
  'More than $10k /mo',
  'More active in social media',
  'Time',
  true,
  'new',
  '{"first_name":"Lina","last_name":"Baabbad","email":"lina.baabbad@gmail.com","phone":"966541800009","social_username":"Lina baabbad","country":"Saudi Arabia","content_language":"","business_type":"Doctor","monthly_income_range":"More than $10k /mo","goals_objectives":"More active in social media","obstacles":"Time","call_attendance_confirmation":"Yes","status":"new","notes":"","date_added":"Apr 11, 2026"}'::jsonb,
  'Saudi Arabia',
  NULL,
  false,
  '2026-04-10T20:00:00.000Z',
  '2026-04-10T20:00:00.000Z'
WHERE NOT EXISTS (
  SELECT 1 FROM public.leads WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'lina.baabbad@gmail.com'
);

-- Lead 167:Mohamed Salem (pd.dr.med.m.salem@gmail.com)
WITH inserted_person AS (
  INSERT INTO public.crm_people (
    tenant_id, full_name, email, phone, instagram, country, income_range, goal, obstacle, notes, created_at, updated_at
  ) VALUES (
    '520a4cfd-5183-4e11-aecc-bc71a52978b6',
    'Mohamed Salem',
    'pd.dr.med.m.salem@gmail.com',
    '+4917631501329',
    '@iiiii',
    'Germany',
    'More than $10k /mo',
    'Reaching people seeking surgical operation for Pediatric cardiac surgery',
    'Nothing',
    NULL,
    '2026-04-10T20:00:00.000Z',
    '2026-04-10T20:00:00.000Z'
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
  SELECT id FROM public.crm_people WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'pd.dr.med.m.salem@gmail.com'
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
  'Salem',
  'pd.dr.med.m.salem@gmail.com',
  '+4917631501329',
  '@iiiii',
  'Doctor',
  'More than $10k /mo',
  'Reaching people seeking surgical operation for Pediatric cardiac surgery',
  'Nothing',
  true,
  'qualified',
  '{"first_name":"Mohamed","last_name":"Salem","email":"pd.dr.med.m.salem@gmail.com","phone":"+4917631501329","social_username":"@iiiii","country":"Germany","content_language":"English","business_type":"Doctor","monthly_income_range":"More than $10k /mo","goals_objectives":"Reaching people seeking surgical operation for Pediatric cardiac surgery","obstacles":"Nothing","call_attendance_confirmation":"Yes","status":"qualified","notes":"","date_added":"Apr 11, 2026"}'::jsonb,
  'Germany',
  'English',
  false,
  '2026-04-10T20:00:00.000Z',
  '2026-04-10T20:00:00.000Z'
WHERE NOT EXISTS (
  SELECT 1 FROM public.leads WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'pd.dr.med.m.salem@gmail.com'
);

-- Lead 168:Mark Nakad (mark@clinicsaver.com)
WITH inserted_person AS (
  INSERT INTO public.crm_people (
    tenant_id, full_name, email, phone, instagram, country, income_range, goal, obstacle, notes, created_at, updated_at
  ) VALUES (
    '520a4cfd-5183-4e11-aecc-bc71a52978b6',
    'Mark Nakad',
    'mark@clinicsaver.com',
    '+971558999524',
    'mark_nakad',
    'United Arab Emirates',
    'Between $5k & $10k /mo',
    'We want to position ClinicSaver Supplies as the go-to B2B marketplace for clinics in the UAE to order medical and aesthetic supplies.

Our goals are:
	•	Build strong brand awareness among clinics
	•	Generate consistent inbound leads from clinics and suppliers
	•	Educate the market on our “one order, one invoice, one delivery” model
	•	Drive conversions (clinic sign-ups and supplier onboarding)

We’re looking for high-quality, engaging video content that simplifies our value proposition, builds trust, and drives action.',
    'We just launched, we haven’t started any content for ClinicSaver Supplies.

We need a clear content strategy + execution that turns views into actual business.',
    NULL,
    '2026-04-10T20:00:00.000Z',
    '2026-04-10T20:00:00.000Z'
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
  SELECT id FROM public.crm_people WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'mark@clinicsaver.com'
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
  'Mark',
  'Nakad',
  'mark@clinicsaver.com',
  '+971558999524',
  'mark_nakad',
  'Entrepreneur, Service Provider, I have an app (ClinicSaver) similar to booking.com but for clinics, and now we have expanded to ClinicSaver Supplies, a B2B marketplace that allows clinics to order all their medical consumables, through a one order, one invoice, one delivery system.',
  'Between $5k & $10k /mo',
  'We want to position ClinicSaver Supplies as the go-to B2B marketplace for clinics in the UAE to order medical and aesthetic supplies.

Our goals are:
	•	Build strong brand awareness among clinics
	•	Generate consistent inbound leads from clinics and suppliers
	•	Educate the market on our “one order, one invoice, one delivery” model
	•	Drive conversions (clinic sign-ups and supplier onboarding)

We’re looking for high-quality, engaging video content that simplifies our value proposition, builds trust, and drives action.',
  'We just launched, we haven’t started any content for ClinicSaver Supplies.

We need a clear content strategy + execution that turns views into actual business.',
  true,
  'new',
  '{"first_name":"Mark","last_name":"Nakad","email":"mark@clinicsaver.com","phone":"+971558999524","social_username":"mark_nakad","country":"United Arab Emirates","content_language":"","business_type":"Entrepreneur, Service Provider, I have an app (ClinicSaver) similar to booking.com but for clinics, and now we have expanded to ClinicSaver Supplies, a B2B marketplace that allows clinics to order all their medical consumables, through a one order, one invoice, one delivery system.","monthly_income_range":"Between $5k & $10k /mo","goals_objectives":"We want to position ClinicSaver Supplies as the go-to B2B marketplace for clinics in the UAE to order medical and aesthetic supplies.\n\nOur goals are:\n\t•\tBuild strong brand awareness among clinics\n\t•\tGenerate consistent inbound leads from clinics and suppliers\n\t•\tEducate the market on our “one order, one invoice, one delivery” model\n\t•\tDrive conversions (clinic sign-ups and supplier onboarding)\n\nWe’re looking for high-quality, engaging video content that simplifies our value proposition, builds trust, and drives action.","obstacles":"We just launched, we haven’t started any content for ClinicSaver Supplies.\n\nWe need a clear content strategy + execution that turns views into actual business.","call_attendance_confirmation":"Yes","status":"new","notes":"","date_added":"Apr 11, 2026"}'::jsonb,
  'United Arab Emirates',
  NULL,
  false,
  '2026-04-10T20:00:00.000Z',
  '2026-04-10T20:00:00.000Z'
WHERE NOT EXISTS (
  SELECT 1 FROM public.leads WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'mark@clinicsaver.com'
);

-- Lead 169:Rasha Zainalabidin (dr.rasha_zainalabdin@hotmail.com)
WITH inserted_person AS (
  INSERT INTO public.crm_people (
    tenant_id, full_name, email, phone, instagram, country, income_range, goal, obstacle, notes, created_at, updated_at
  ) VALUES (
    '520a4cfd-5183-4e11-aecc-bc71a52978b6',
    'Rasha Zainalabidin',
    'dr.rasha_zainalabdin@hotmail.com',
    '00966553578696',
    '@dr_rashazain',
    'Saudi Arabia',
    'Between $5k & $10k /mo',
    'want to grow my personal brand as a leading dermatologist and aesthetic expert in the region, focusing on high-quality, science-based content that educates and builds trust.
I’m aiming to significantly scale my reach on TikTok and Instagram, improve engagement, and convert my audience into real patients.
I’d like support with content strategy, positioning, and creating viral yet credible content that aligns with my medical background.',
    'The main challenge is inconsistency in reach and recent drops in views despite high-quality content.
I also want to better align my content with the algorithm without losing my professional and scientific identity.
Additionally, I need a clearer strategy to balance educational content with high-performing viral formats.',
    NULL,
    '2026-04-10T20:00:00.000Z',
    '2026-04-10T20:00:00.000Z'
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
  SELECT id FROM public.crm_people WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'dr.rasha_zainalabdin@hotmail.com'
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
  'Rasha',
  'Zainalabidin',
  'dr.rasha_zainalabdin@hotmail.com',
  '00966553578696',
  '@dr_rashazain',
  'Service Provider',
  'Between $5k & $10k /mo',
  'want to grow my personal brand as a leading dermatologist and aesthetic expert in the region, focusing on high-quality, science-based content that educates and builds trust.
I’m aiming to significantly scale my reach on TikTok and Instagram, improve engagement, and convert my audience into real patients.
I’d like support with content strategy, positioning, and creating viral yet credible content that aligns with my medical background.',
  'The main challenge is inconsistency in reach and recent drops in views despite high-quality content.
I also want to better align my content with the algorithm without losing my professional and scientific identity.
Additionally, I need a clearer strategy to balance educational content with high-performing viral formats.',
  true,
  'new',
  '{"first_name":"Rasha","last_name":"Zainalabidin","email":"dr.rasha_zainalabdin@hotmail.com","phone":"00966553578696","social_username":"@dr_rashazain","country":"Saudi Arabia","content_language":"","business_type":"Service Provider","monthly_income_range":"Between $5k & $10k /mo","goals_objectives":"want to grow my personal brand as a leading dermatologist and aesthetic expert in the region, focusing on high-quality, science-based content that educates and builds trust.\nI’m aiming to significantly scale my reach on TikTok and Instagram, improve engagement, and convert my audience into real patients.\nI’d like support with content strategy, positioning, and creating viral yet credible content that aligns with my medical background.","obstacles":"The main challenge is inconsistency in reach and recent drops in views despite high-quality content.\nI also want to better align my content with the algorithm without losing my professional and scientific identity.\nAdditionally, I need a clearer strategy to balance educational content with high-performing viral formats.","call_attendance_confirmation":"Yes","status":"new","notes":"","date_added":"Apr 11, 2026"}'::jsonb,
  'Saudi Arabia',
  NULL,
  false,
  '2026-04-10T20:00:00.000Z',
  '2026-04-10T20:00:00.000Z'
WHERE NOT EXISTS (
  SELECT 1 FROM public.leads WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'dr.rasha_zainalabdin@hotmail.com'
);

-- Lead 170:Brandon Hill (chirobrandonhill@gmail.com)
WITH inserted_person AS (
  INSERT INTO public.crm_people (
    tenant_id, full_name, email, phone, instagram, country, income_range, goal, obstacle, notes, created_at, updated_at
  ) VALUES (
    '520a4cfd-5183-4e11-aecc-bc71a52978b6',
    'Brandon Hill',
    'chirobrandonhill@gmail.com',
    '+31636272404',
    'Hillhealing.amsterdam',
    'Netherlands (Kingdom of the)',
    'More than $10k /mo',
    'My partner speaks dutch, my dutch is ok, but we have a unique perspective on health. More so having an understanding healing isn''t physical, it just appears to be and we want other healers and people to know this information. Also being creative with us representing the current dutch culture or English and Dutch speakers always working together',
    'We get great results, but everyone think they do. So no one asks to learn from us. We teach as well, so many people are stuck on physical things when healing is really metaphyscial',
    NULL,
    '2026-04-10T20:00:00.000Z',
    '2026-04-10T20:00:00.000Z'
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
  SELECT id FROM public.crm_people WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'chirobrandonhill@gmail.com'
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
  'Brandon',
  'Hill',
  'chirobrandonhill@gmail.com',
  '+31636272404',
  'Hillhealing.amsterdam',
  'Chiropractor/wellness coach',
  'More than $10k /mo',
  'My partner speaks dutch, my dutch is ok, but we have a unique perspective on health. More so having an understanding healing isn''t physical, it just appears to be and we want other healers and people to know this information. Also being creative with us representing the current dutch culture or English and Dutch speakers always working together',
  'We get great results, but everyone think they do. So no one asks to learn from us. We teach as well, so many people are stuck on physical things when healing is really metaphyscial',
  true,
  'new',
  '{"first_name":"Brandon","last_name":"Hill","email":"chirobrandonhill@gmail.com","phone":"+31636272404","social_username":"Hillhealing.amsterdam","country":"Netherlands (Kingdom of the)","content_language":"","business_type":"Chiropractor/wellness coach","monthly_income_range":"More than $10k /mo","goals_objectives":"My partner speaks dutch, my dutch is ok, but we have a unique perspective on health. More so having an understanding healing isn''t physical, it just appears to be and we want other healers and people to know this information. Also being creative with us representing the current dutch culture or English and Dutch speakers always working together","obstacles":"We get great results, but everyone think they do. So no one asks to learn from us. We teach as well, so many people are stuck on physical things when healing is really metaphyscial","call_attendance_confirmation":"Yes","status":"new","notes":"","date_added":"Apr 11, 2026"}'::jsonb,
  'Netherlands (Kingdom of the)',
  NULL,
  false,
  '2026-04-10T20:00:00.000Z',
  '2026-04-10T20:00:00.000Z'
WHERE NOT EXISTS (
  SELECT 1 FROM public.leads WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'chirobrandonhill@gmail.com'
);

-- Lead 171:Brandon Hill (chirobrandonhill@gmail.com)
WITH inserted_person AS (
  INSERT INTO public.crm_people (
    tenant_id, full_name, email, phone, instagram, country, income_range, goal, obstacle, notes, created_at, updated_at
  ) VALUES (
    '520a4cfd-5183-4e11-aecc-bc71a52978b6',
    'Brandon Hill',
    'chirobrandonhill@gmail.com',
    '+31636272404',
    'Hillhealing.amsterdam',
    'Netherlands (Kingdom of the)',
    'More than $10k /mo',
    'My partner and I are running the businuess together. And we really focus on changing concepts from sickness to health through chiropractic. We use a specific technique. I am also a teacher, and would like more people wanting to learn how to heal from me.',
    'Other than my clients, no one knows how many people I actually heal or they don''t believe it. Or they think they know.',
    NULL,
    '2026-04-10T20:00:00.000Z',
    '2026-04-10T20:00:00.000Z'
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
  SELECT id FROM public.crm_people WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'chirobrandonhill@gmail.com'
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
  'Brandon',
  'Hill',
  'chirobrandonhill@gmail.com',
  '+31636272404',
  'Hillhealing.amsterdam',
  'Chiropractor/wellness coach',
  'More than $10k /mo',
  'My partner and I are running the businuess together. And we really focus on changing concepts from sickness to health through chiropractic. We use a specific technique. I am also a teacher, and would like more people wanting to learn how to heal from me.',
  'Other than my clients, no one knows how many people I actually heal or they don''t believe it. Or they think they know.',
  true,
  'new',
  '{"first_name":"Brandon","last_name":"Hill","email":"chirobrandonhill@gmail.com","phone":"+31636272404","social_username":"Hillhealing.amsterdam","country":"Netherlands (Kingdom of the)","content_language":"","business_type":"Chiropractor/wellness coach","monthly_income_range":"More than $10k /mo","goals_objectives":"My partner and I are running the businuess together. And we really focus on changing concepts from sickness to health through chiropractic. We use a specific technique. I am also a teacher, and would like more people wanting to learn how to heal from me.","obstacles":"Other than my clients, no one knows how many people I actually heal or they don''t believe it. Or they think they know.","call_attendance_confirmation":"Yes","status":"new","notes":"","date_added":"Apr 11, 2026"}'::jsonb,
  'Netherlands (Kingdom of the)',
  NULL,
  false,
  '2026-04-10T20:00:00.000Z',
  '2026-04-10T20:00:00.000Z'
WHERE NOT EXISTS (
  SELECT 1 FROM public.leads WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'chirobrandonhill@gmail.com'
);

-- Lead 172:Pratik Chudasama (dp@digitalpratik.com)
WITH inserted_person AS (
  INSERT INTO public.crm_people (
    tenant_id, full_name, email, phone, instagram, country, income_range, goal, obstacle, notes, created_at, updated_at
  ) VALUES (
    '520a4cfd-5183-4e11-aecc-bc71a52978b6',
    'Pratik Chudasama',
    'dp@digitalpratik.com',
    '+971585838502',
    'digitalpratik',
    'United Arab Emirates',
    'More than $10k /mo',
    'work with a team who knows what they are doing (not just yapping)',
    'not having an inhouse team here in dubai so would love to collaborate with likeminded social team',
    NULL,
    '2026-04-08T20:00:00.000Z',
    '2026-04-08T20:00:00.000Z'
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
  SELECT id FROM public.crm_people WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'dp@digitalpratik.com'
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
  'Pratik',
  'Chudasama',
  'dp@digitalpratik.com',
  '+971585838502',
  'digitalpratik',
  'Service Provider, Entrepreneur, Content Creator, Consultant, Online Coach',
  'More than $10k /mo',
  'work with a team who knows what they are doing (not just yapping)',
  'not having an inhouse team here in dubai so would love to collaborate with likeminded social team',
  true,
  'new',
  '{"first_name":"Pratik","last_name":"Chudasama","email":"dp@digitalpratik.com","phone":"+971585838502","social_username":"digitalpratik","country":"United Arab Emirates","content_language":"","business_type":"Service Provider, Entrepreneur, Content Creator, Consultant, Online Coach","monthly_income_range":"More than $10k /mo","goals_objectives":"work with a team who knows what they are doing (not just yapping)","obstacles":"not having an inhouse team here in dubai so would love to collaborate with likeminded social team","call_attendance_confirmation":"Yes","status":"new","notes":"","date_added":"Apr 9, 2026"}'::jsonb,
  'United Arab Emirates',
  NULL,
  false,
  '2026-04-08T20:00:00.000Z',
  '2026-04-08T20:00:00.000Z'
WHERE NOT EXISTS (
  SELECT 1 FROM public.leads WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'dp@digitalpratik.com'
);

-- Lead 173:Omar Messky (omarmeski@maven-x.com)
WITH inserted_person AS (
  INSERT INTO public.crm_people (
    tenant_id, full_name, email, phone, instagram, country, income_range, goal, obstacle, notes, created_at, updated_at
  ) VALUES (
    '520a4cfd-5183-4e11-aecc-bc71a52978b6',
    'Omar Messky',
    'omarmeski@maven-x.com',
    '+971553253483',
    '@',
    'Andorra',
    'Between $5k & $10k /mo',
    'asda',
    'sdasdasdas',
    NULL,
    '2026-04-08T20:00:00.000Z',
    '2026-04-08T20:00:00.000Z'
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
  SELECT id FROM public.crm_people WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'omarmeski@maven-x.com'
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
  'Messky',
  'omarmeski@maven-x.com',
  '+971553253483',
  '@',
  'Entrepreneur',
  'Between $5k & $10k /mo',
  'asda',
  'sdasdasdas',
  true,
  'new',
  '{"first_name":"Omar","last_name":"Messky","email":"omarmeski@maven-x.com","phone":"+971553253483","social_username":"@","country":"Andorra","content_language":"English","business_type":"Entrepreneur","monthly_income_range":"Between $5k & $10k /mo","goals_objectives":"asda","obstacles":"sdasdasdas","call_attendance_confirmation":"Yes","status":"new","notes":"","date_added":"Apr 9, 2026"}'::jsonb,
  'Andorra',
  'English',
  false,
  '2026-04-08T20:00:00.000Z',
  '2026-04-08T20:00:00.000Z'
WHERE NOT EXISTS (
  SELECT 1 FROM public.leads WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'omarmeski@maven-x.com'
);

-- Lead 174:testing testing (adib@theclips.agenc)
WITH inserted_person AS (
  INSERT INTO public.crm_people (
    tenant_id, full_name, email, phone, instagram, country, income_range, goal, obstacle, notes, created_at, updated_at
  ) VALUES (
    '520a4cfd-5183-4e11-aecc-bc71a52978b6',
    'testing testing',
    'adib@theclips.agenc',
    '1231',
    '1231',
    'United Arab Emirates',
    'Between $5k & $10k /mo',
    '123123123',
    '123123123123',
    NULL,
    '2026-04-07T20:00:00.000Z',
    '2026-04-07T20:00:00.000Z'
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
  SELECT id FROM public.crm_people WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'adib@theclips.agenc'
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
  'testing',
  'testing',
  'adib@theclips.agenc',
  '1231',
  '1231',
  'Service Provider',
  'Between $5k & $10k /mo',
  '123123123',
  '123123123123',
  true,
  'new',
  '{"first_name":"testing","last_name":"testing","email":"adib@theclips.agenc","phone":"1231","social_username":"1231","country":"United Arab Emirates","content_language":"","business_type":"Service Provider","monthly_income_range":"Between $5k & $10k /mo","goals_objectives":"123123123","obstacles":"123123123123","call_attendance_confirmation":"Yes","status":"new","notes":"","date_added":"Apr 8, 2026"}'::jsonb,
  'United Arab Emirates',
  NULL,
  false,
  '2026-04-07T20:00:00.000Z',
  '2026-04-07T20:00:00.000Z'
WHERE NOT EXISTS (
  SELECT 1 FROM public.leads WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'adib@theclips.agenc'
);

-- Lead 175:Testing Baroudi (test@gmail.com)
WITH inserted_person AS (
  INSERT INTO public.crm_people (
    tenant_id, full_name, email, phone, instagram, country, income_range, goal, obstacle, notes, created_at, updated_at
  ) VALUES (
    '520a4cfd-5183-4e11-aecc-bc71a52978b6',
    'Testing Baroudi',
    'test@gmail.com',
    '+971501759587',
    '@adib_braoudi',
    'United Arab Emirates',
    'Between $5k & $10k /mo',
    '123123',
    '21312',
    NULL,
    '2026-04-07T20:00:00.000Z',
    '2026-04-07T20:00:00.000Z'
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
  SELECT id FROM public.crm_people WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'test@gmail.com'
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
  'Testing',
  'Baroudi',
  'test@gmail.com',
  '+971501759587',
  '@adib_braoudi',
  'Service Provider',
  'Between $5k & $10k /mo',
  '123123',
  '21312',
  true,
  'new',
  '{"first_name":"Testing","last_name":"Baroudi","email":"test@gmail.com","phone":"+971501759587","social_username":"@adib_braoudi","country":"United Arab Emirates","content_language":"","business_type":"Service Provider","monthly_income_range":"Between $5k & $10k /mo","goals_objectives":"123123","obstacles":"21312","call_attendance_confirmation":"Yes","status":"new","notes":"","date_added":"Apr 8, 2026"}'::jsonb,
  'United Arab Emirates',
  NULL,
  false,
  '2026-04-07T20:00:00.000Z',
  '2026-04-07T20:00:00.000Z'
WHERE NOT EXISTS (
  SELECT 1 FROM public.leads WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'test@gmail.com'
);

-- Lead 176:Zahra Mansoor (zahramansoorr@gmail.com)
WITH inserted_person AS (
  INSERT INTO public.crm_people (
    tenant_id, full_name, email, phone, instagram, country, income_range, goal, obstacle, notes, created_at, updated_at
  ) VALUES (
    '520a4cfd-5183-4e11-aecc-bc71a52978b6',
    'Zahra Mansoor',
    'zahramansoorr@gmail.com',
    '+971556771998',
    'zahramansoor',
    'United Arab Emirates',
    'Between $5k & $10k /mo',
    'Personal branding',
    'lack of time and direction',
    NULL,
    '2026-04-07T20:00:00.000Z',
    '2026-04-07T20:00:00.000Z'
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
  SELECT id FROM public.crm_people WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'zahramansoorr@gmail.com'
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
  'Zahra',
  'Mansoor',
  'zahramansoorr@gmail.com',
  '+971556771998',
  'zahramansoor',
  'Other',
  'Between $5k & $10k /mo',
  'Personal branding',
  'lack of time and direction',
  true,
  'new',
  '{"first_name":"Zahra","last_name":"Mansoor","email":"zahramansoorr@gmail.com","phone":"+971556771998","social_username":"zahramansoor","country":"United Arab Emirates","content_language":"","business_type":"Other","monthly_income_range":"Between $5k & $10k /mo","goals_objectives":"Personal branding","obstacles":"lack of time and direction","call_attendance_confirmation":"Yes","status":"new","notes":"","date_added":"Apr 8, 2026"}'::jsonb,
  'United Arab Emirates',
  NULL,
  false,
  '2026-04-07T20:00:00.000Z',
  '2026-04-07T20:00:00.000Z'
WHERE NOT EXISTS (
  SELECT 1 FROM public.leads WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'zahramansoorr@gmail.com'
);

-- Lead 177:Ali V (vaidali194@gmail.com)
WITH inserted_person AS (
  INSERT INTO public.crm_people (
    tenant_id, full_name, email, phone, instagram, country, income_range, goal, obstacle, notes, created_at, updated_at
  ) VALUES (
    '520a4cfd-5183-4e11-aecc-bc71a52978b6',
    'Ali V',
    'vaidali194@gmail.com',
    '+971508641613',
    '@casavincenzo.co',
    'United Arab Emirates',
    'Between $5k & $10k /mo',
    'Its not a personal brand but an ecom business which i believe you dont focus on',
    'Quality content and strategy',
    NULL,
    '2026-04-06T20:00:00.000Z',
    '2026-04-06T20:00:00.000Z'
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
  SELECT id FROM public.crm_people WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'vaidali194@gmail.com'
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
  'Ali',
  'V',
  'vaidali194@gmail.com',
  '+971508641613',
  '@casavincenzo.co',
  'Other',
  'Between $5k & $10k /mo',
  'Its not a personal brand but an ecom business which i believe you dont focus on',
  'Quality content and strategy',
  true,
  'new',
  '{"first_name":"Ali","last_name":"V","email":"vaidali194@gmail.com","phone":"+971508641613","social_username":"@casavincenzo.co","country":"United Arab Emirates","content_language":"","business_type":"Other","monthly_income_range":"Between $5k & $10k /mo","goals_objectives":"Its not a personal brand but an ecom business which i believe you dont focus on","obstacles":"Quality content and strategy","call_attendance_confirmation":"Yes","status":"new","notes":"","date_added":"Apr 7, 2026"}'::jsonb,
  'United Arab Emirates',
  NULL,
  false,
  '2026-04-06T20:00:00.000Z',
  '2026-04-06T20:00:00.000Z'
WHERE NOT EXISTS (
  SELECT 1 FROM public.leads WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'vaidali194@gmail.com'
);

-- Lead 178:Hazem Akari (hazem88akkari@gmail.com)
WITH inserted_person AS (
  INSERT INTO public.crm_people (
    tenant_id, full_name, email, phone, instagram, country, income_range, goal, obstacle, notes, created_at, updated_at
  ) VALUES (
    '520a4cfd-5183-4e11-aecc-bc71a52978b6',
    'Hazem Akari',
    'hazem88akkari@gmail.com',
    '00971501751740',
    'https://www.instagram.com/hazem_consultant?igsh=MXFsMW1tcngwNjNkMQ%3D%3D&utm_source=qr',
    'United Arab Emirates',
    'Between $5k & $10k /mo',
    'Brand awareness 
Creat leads 
Landlords and clients
Landlords are more important as a start',
    'Low stock high demand 
I need to get the stock',
    NULL,
    '2026-04-05T20:00:00.000Z',
    '2026-04-05T20:00:00.000Z'
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
  SELECT id FROM public.crm_people WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'hazem88akkari@gmail.com'
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
  'Hazem',
  'Akari',
  'hazem88akkari@gmail.com',
  '00971501751740',
  'https://www.instagram.com/hazem_consultant?igsh=MXFsMW1tcngwNjNkMQ%3D%3D&utm_source=qr',
  'Consultant',
  'Between $5k & $10k /mo',
  'Brand awareness 
Creat leads 
Landlords and clients
Landlords are more important as a start',
  'Low stock high demand 
I need to get the stock',
  true,
  'new',
  '{"first_name":"Hazem","last_name":"Akari","email":"hazem88akkari@gmail.com","phone":"00971501751740","social_username":"https://www.instagram.com/hazem_consultant?igsh=MXFsMW1tcngwNjNkMQ%3D%3D&utm_source=qr","country":"United Arab Emirates","content_language":"","business_type":"Consultant","monthly_income_range":"Between $5k & $10k /mo","goals_objectives":"Brand awareness \nCreat leads \nLandlords and clients\nLandlords are more important as a start","obstacles":"Low stock high demand \nI need to get the stock","call_attendance_confirmation":"Yes","status":"new","notes":"","date_added":"Apr 6, 2026"}'::jsonb,
  'United Arab Emirates',
  NULL,
  false,
  '2026-04-05T20:00:00.000Z',
  '2026-04-05T20:00:00.000Z'
WHERE NOT EXISTS (
  SELECT 1 FROM public.leads WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'hazem88akkari@gmail.com'
);

-- Lead 179:Aleksa Rupic (rupic.aleksa@gmail.com)
WITH inserted_person AS (
  INSERT INTO public.crm_people (
    tenant_id, full_name, email, phone, instagram, country, income_range, goal, obstacle, notes, created_at, updated_at
  ) VALUES (
    '520a4cfd-5183-4e11-aecc-bc71a52978b6',
    'Aleksa Rupic',
    'rupic.aleksa@gmail.com',
    '+381646401513',
    '@aleksa_rupic',
    'Serbia',
    'More than $10k /mo',
    'Get more people to apply for our service and build a unique non-superficial brand.',
    'Overcoming perfectionism and putting out high-volume content. Also, the IG geo located algorithm.',
    NULL,
    '2026-04-05T20:00:00.000Z',
    '2026-04-05T20:00:00.000Z'
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
  SELECT id FROM public.crm_people WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'rupic.aleksa@gmail.com'
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
  'Aleksa',
  'Rupic',
  'rupic.aleksa@gmail.com',
  '+381646401513',
  '@aleksa_rupic',
  'Consultant',
  'More than $10k /mo',
  'Get more people to apply for our service and build a unique non-superficial brand.',
  'Overcoming perfectionism and putting out high-volume content. Also, the IG geo located algorithm.',
  true,
  'new',
  '{"first_name":"Aleksa","last_name":"Rupic","email":"rupic.aleksa@gmail.com","phone":"+381646401513","social_username":"@aleksa_rupic","country":"Serbia","content_language":"English","business_type":"Consultant","monthly_income_range":"More than $10k /mo","goals_objectives":"Get more people to apply for our service and build a unique non-superficial brand.","obstacles":"Overcoming perfectionism and putting out high-volume content. Also, the IG geo located algorithm.","call_attendance_confirmation":"Yes","status":"new","notes":"","date_added":"Apr 6, 2026"}'::jsonb,
  'Serbia',
  'English',
  false,
  '2026-04-05T20:00:00.000Z',
  '2026-04-05T20:00:00.000Z'
WHERE NOT EXISTS (
  SELECT 1 FROM public.leads WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'rupic.aleksa@gmail.com'
);

-- Lead 180:Karishma Samtani (petitegourmetdubai@gmail.com)
WITH inserted_person AS (
  INSERT INTO public.crm_people (
    tenant_id, full_name, email, phone, instagram, country, income_range, goal, obstacle, notes, created_at, updated_at
  ) VALUES (
    '520a4cfd-5183-4e11-aecc-bc71a52978b6',
    'Karishma Samtani',
    'petitegourmetdubai@gmail.com',
    '0504824317',
    '@petitegourmetdubai',
    'United Arab Emirates',
    'Between $5k & $10k /mo',
    'We want to reach the audience. Spread awareness about the brand and generate leads and take business to next level',
    'The current scenario in Dubai',
    NULL,
    '2026-04-05T20:00:00.000Z',
    '2026-04-05T20:00:00.000Z'
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
  SELECT id FROM public.crm_people WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'petitegourmetdubai@gmail.com'
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
  'Karishma',
  'Samtani',
  'petitegourmetdubai@gmail.com',
  '0504824317',
  '@petitegourmetdubai',
  'Service Provider',
  'Between $5k & $10k /mo',
  'We want to reach the audience. Spread awareness about the brand and generate leads and take business to next level',
  'The current scenario in Dubai',
  true,
  'new',
  '{"first_name":"Karishma","last_name":"Samtani","email":"petitegourmetdubai@gmail.com","phone":"0504824317","social_username":"@petitegourmetdubai","country":"United Arab Emirates","content_language":"","business_type":"Service Provider","monthly_income_range":"Between $5k & $10k /mo","goals_objectives":"We want to reach the audience. Spread awareness about the brand and generate leads and take business to next level","obstacles":"The current scenario in Dubai","call_attendance_confirmation":"Yes","status":"new","notes":"","date_added":"Apr 6, 2026"}'::jsonb,
  'United Arab Emirates',
  NULL,
  false,
  '2026-04-05T20:00:00.000Z',
  '2026-04-05T20:00:00.000Z'
WHERE NOT EXISTS (
  SELECT 1 FROM public.leads WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'petitegourmetdubai@gmail.com'
);

-- Lead 181:Dina ElBaz (elbazzdina36@gmail.com)
WITH inserted_person AS (
  INSERT INTO public.crm_people (
    tenant_id, full_name, email, phone, instagram, country, income_range, goal, obstacle, notes, created_at, updated_at
  ) VALUES (
    '520a4cfd-5183-4e11-aecc-bc71a52978b6',
    'Dina ElBaz',
    'elbazzdina36@gmail.com',
    '+971506402506',
    'F.eat_by_dina',
    'United Arab Emirates',
    'Between $5k & $10k /mo',
    'attracting more clients',
    'Content',
    NULL,
    '2026-04-04T20:00:00.000Z',
    '2026-04-04T20:00:00.000Z'
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
  SELECT id FROM public.crm_people WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'elbazzdina36@gmail.com'
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
  'Dina',
  'ElBaz',
  'elbazzdina36@gmail.com',
  '+971506402506',
  'F.eat_by_dina',
  'Other',
  'Between $5k & $10k /mo',
  'attracting more clients',
  'Content',
  true,
  'new',
  '{"first_name":"Dina","last_name":"ElBaz","email":"elbazzdina36@gmail.com","phone":"+971506402506","social_username":"F.eat_by_dina","country":"United Arab Emirates","content_language":"","business_type":"Other","monthly_income_range":"Between $5k & $10k /mo","goals_objectives":"attracting more clients","obstacles":"Content","call_attendance_confirmation":"Yes","status":"new","notes":"","date_added":"Apr 5, 2026"}'::jsonb,
  'United Arab Emirates',
  NULL,
  false,
  '2026-04-04T20:00:00.000Z',
  '2026-04-04T20:00:00.000Z'
WHERE NOT EXISTS (
  SELECT 1 FROM public.leads WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'elbazzdina36@gmail.com'
);

-- Lead 182:Zain Riaz (zain@sykon.ar)
WITH inserted_person AS (
  INSERT INTO public.crm_people (
    tenant_id, full_name, email, phone, instagram, country, income_range, goal, obstacle, notes, created_at, updated_at
  ) VALUES (
    '520a4cfd-5183-4e11-aecc-bc71a52978b6',
    'Zain Riaz',
    'zain@sykon.ar',
    '+971507559055',
    '@zain.m.riaz',
    'United Arab Emirates',
    'More than $10k /mo',
    'Personal brand let’s speak on WhatsApp',
    'Nothing',
    NULL,
    '2026-04-03T20:00:00.000Z',
    '2026-04-03T20:00:00.000Z'
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
  SELECT id FROM public.crm_people WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'zain@sykon.ar'
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
  'Zain',
  'Riaz',
  'zain@sykon.ar',
  '+971507559055',
  '@zain.m.riaz',
  'Service Provider',
  'More than $10k /mo',
  'Personal brand let’s speak on WhatsApp',
  'Nothing',
  true,
  'new',
  '{"first_name":"Zain","last_name":"Riaz","email":"zain@sykon.ar","phone":"+971507559055","social_username":"@zain.m.riaz","country":"United Arab Emirates","content_language":"","business_type":"Service Provider","monthly_income_range":"More than $10k /mo","goals_objectives":"Personal brand let’s speak on WhatsApp","obstacles":"Nothing","call_attendance_confirmation":"Yes","status":"new","notes":"","date_added":"Apr 4, 2026"}'::jsonb,
  'United Arab Emirates',
  NULL,
  false,
  '2026-04-03T20:00:00.000Z',
  '2026-04-03T20:00:00.000Z'
WHERE NOT EXISTS (
  SELECT 1 FROM public.leads WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'zain@sykon.ar'
);

-- Lead 183:Wajdi Albonji (wajdi_albonji@hotmail.com)
WITH inserted_person AS (
  INSERT INTO public.crm_people (
    tenant_id, full_name, email, phone, instagram, country, income_range, goal, obstacle, notes, created_at, updated_at
  ) VALUES (
    '520a4cfd-5183-4e11-aecc-bc71a52978b6',
    'Wajdi Albonji',
    'wajdi_albonji@hotmail.com',
    '+971561621846',
    'drwajdialbonji',
    'United Arab Emirates',
    'More than $10k /mo',
    'Building course
More influence 
Sell lrograms
Sell courses 
Building community',
    'More quality and startegy',
    NULL,
    '2026-04-03T20:00:00.000Z',
    '2026-04-03T20:00:00.000Z'
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
  SELECT id FROM public.crm_people WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'wajdi_albonji@hotmail.com'
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
  'Wajdi',
  'Albonji',
  'wajdi_albonji@hotmail.com',
  '+971561621846',
  'drwajdialbonji',
  'Doctor',
  'More than $10k /mo',
  'Building course
More influence 
Sell lrograms
Sell courses 
Building community',
  'More quality and startegy',
  true,
  'new',
  '{"first_name":"Wajdi","last_name":"Albonji","email":"wajdi_albonji@hotmail.com","phone":"+971561621846","social_username":"drwajdialbonji","country":"United Arab Emirates","content_language":"","business_type":"Doctor","monthly_income_range":"More than $10k /mo","goals_objectives":"Building course\nMore influence \nSell lrograms\nSell courses \nBuilding community","obstacles":"More quality and startegy","call_attendance_confirmation":"Yes","status":"new","notes":"","date_added":"Apr 4, 2026"}'::jsonb,
  'United Arab Emirates',
  NULL,
  false,
  '2026-04-03T20:00:00.000Z',
  '2026-04-03T20:00:00.000Z'
WHERE NOT EXISTS (
  SELECT 1 FROM public.leads WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'wajdi_albonji@hotmail.com'
);

-- Lead 184:Nauras Abuagela (nauras.abuagela@hotmail.com)
WITH inserted_person AS (
  INSERT INTO public.crm_people (
    tenant_id, full_name, email, phone, instagram, country, income_range, goal, obstacle, notes, created_at, updated_at
  ) VALUES (
    '520a4cfd-5183-4e11-aecc-bc71a52978b6',
    'Nauras Abuagela',
    'nauras.abuagela@hotmail.com',
    '+4917687112021',
    'dr.nauras.abuagela',
    'Germany',
    'Between $5k & $10k /mo',
    'Be more visible in Germany and uae',
    'Work',
    NULL,
    '2026-04-02T20:00:00.000Z',
    '2026-04-02T20:00:00.000Z'
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
  SELECT id FROM public.crm_people WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'nauras.abuagela@hotmail.com'
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
  'Nauras',
  'Abuagela',
  'nauras.abuagela@hotmail.com',
  '+4917687112021',
  'dr.nauras.abuagela',
  'Doctor',
  'Between $5k & $10k /mo',
  'Be more visible in Germany and uae',
  'Work',
  true,
  'contacted',
  '{"first_name":"Nauras","last_name":"Abuagela","email":"nauras.abuagela@hotmail.com","phone":"+4917687112021","social_username":"dr.nauras.abuagela","country":"Germany","content_language":"English","business_type":"Doctor","monthly_income_range":"Between $5k & $10k /mo","goals_objectives":"Be more visible in Germany and uae","obstacles":"Work","call_attendance_confirmation":"Yes","status":"contacted","notes":"","date_added":"Apr 3, 2026"}'::jsonb,
  'Germany',
  'English',
  false,
  '2026-04-02T20:00:00.000Z',
  '2026-04-02T20:00:00.000Z'
WHERE NOT EXISTS (
  SELECT 1 FROM public.leads WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'nauras.abuagela@hotmail.com'
);

-- Lead 185:Maripet Cabauatan (bubbly_pet@yahoo.com)
WITH inserted_person AS (
  INSERT INTO public.crm_people (
    tenant_id, full_name, email, phone, instagram, country, income_range, goal, obstacle, notes, created_at, updated_at
  ) VALUES (
    '520a4cfd-5183-4e11-aecc-bc71a52978b6',
    'Maripet Cabauatan',
    'bubbly_pet@yahoo.com',
    '0501537887',
    'Herrealwealth',
    'United Arab Emirates',
    'More than $10k /mo',
    'Scale up my business the content creation',
    'Content creation',
    NULL,
    '2026-04-02T20:00:00.000Z',
    '2026-04-02T20:00:00.000Z'
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
  SELECT id FROM public.crm_people WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'bubbly_pet@yahoo.com'
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
  'Maripet',
  'Cabauatan',
  'bubbly_pet@yahoo.com',
  '0501537887',
  'Herrealwealth',
  'Consultant',
  'More than $10k /mo',
  'Scale up my business the content creation',
  'Content creation',
  true,
  'new',
  '{"first_name":"Maripet","last_name":"Cabauatan","email":"bubbly_pet@yahoo.com","phone":"0501537887","social_username":"Herrealwealth","country":"United Arab Emirates","content_language":"","business_type":"Consultant","monthly_income_range":"More than $10k /mo","goals_objectives":"Scale up my business the content creation","obstacles":"Content creation","call_attendance_confirmation":"Yes","status":"new","notes":"","date_added":"Apr 3, 2026"}'::jsonb,
  'United Arab Emirates',
  NULL,
  false,
  '2026-04-02T20:00:00.000Z',
  '2026-04-02T20:00:00.000Z'
WHERE NOT EXISTS (
  SELECT 1 FROM public.leads WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'bubbly_pet@yahoo.com'
);

-- Lead 186:Mehran Jahani (dr_mjahani@yahoo.ca)
WITH inserted_person AS (
  INSERT INTO public.crm_people (
    tenant_id, full_name, email, phone, instagram, country, income_range, goal, obstacle, notes, created_at, updated_at
  ) VALUES (
    '520a4cfd-5183-4e11-aecc-bc71a52978b6',
    'Mehran Jahani',
    'dr_mjahani@yahoo.ca',
    '0618820000',
    '@health4life',
    'Netherlands',
    'More than $10k /mo',
    'Increase leads',
    'Low exposure',
    NULL,
    '2026-04-01T20:00:00.000Z',
    '2026-04-01T20:00:00.000Z'
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
  SELECT id FROM public.crm_people WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'dr_mjahani@yahoo.ca'
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
  'Mehran',
  'Jahani',
  'dr_mjahani@yahoo.ca',
  '0618820000',
  '@health4life',
  'Doctor',
  'More than $10k /mo',
  'Increase leads',
  'Low exposure',
  true,
  'contacted',
  '{"first_name":"Mehran","last_name":"Jahani","email":"dr_mjahani@yahoo.ca","phone":"0618820000","social_username":"@health4life","country":"Netherlands","content_language":"English","business_type":"Doctor","monthly_income_range":"More than $10k /mo","goals_objectives":"Increase leads","obstacles":"Low exposure","call_attendance_confirmation":"Yes","status":"contacted","notes":"","date_added":"Apr 2, 2026"}'::jsonb,
  'Netherlands',
  'English',
  false,
  '2026-04-01T20:00:00.000Z',
  '2026-04-01T20:00:00.000Z'
WHERE NOT EXISTS (
  SELECT 1 FROM public.leads WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'dr_mjahani@yahoo.ca'
);

-- Lead 187:Kais AlTahan (qaissyr82@gmail.com)
WITH inserted_person AS (
  INSERT INTO public.crm_people (
    tenant_id, full_name, email, phone, instagram, country, income_range, goal, obstacle, notes, created_at, updated_at
  ) VALUES (
    '520a4cfd-5183-4e11-aecc-bc71a52978b6',
    'Kais AlTahan',
    'qaissyr82@gmail.com',
    '00971508441603',
    'Qaiss_anas',
    'United Arab Emirates',
    'More than $10k /mo',
    'I’m a dentist working in a new clinic opened in alain / abudhabi 
I want to do videos and I want any ideas that helps me',
    'Shy and fear',
    NULL,
    '2026-04-01T20:00:00.000Z',
    '2026-04-01T20:00:00.000Z'
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
  SELECT id FROM public.crm_people WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'qaissyr82@gmail.com'
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
  'Kais',
  'AlTahan',
  'qaissyr82@gmail.com',
  '00971508441603',
  'Qaiss_anas',
  'Doctor',
  'More than $10k /mo',
  'I’m a dentist working in a new clinic opened in alain / abudhabi 
I want to do videos and I want any ideas that helps me',
  'Shy and fear',
  true,
  'new',
  '{"first_name":"Kais","last_name":"AlTahan","email":"qaissyr82@gmail.com","phone":"00971508441603","social_username":"Qaiss_anas","country":"United Arab Emirates","content_language":"","business_type":"Doctor","monthly_income_range":"More than $10k /mo","goals_objectives":"I’m a dentist working in a new clinic opened in alain / abudhabi \nI want to do videos and I want any ideas that helps me","obstacles":"Shy and fear","call_attendance_confirmation":"Yes","status":"new","notes":"","date_added":"Apr 2, 2026"}'::jsonb,
  'United Arab Emirates',
  NULL,
  false,
  '2026-04-01T20:00:00.000Z',
  '2026-04-01T20:00:00.000Z'
WHERE NOT EXISTS (
  SELECT 1 FROM public.leads WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'qaissyr82@gmail.com'
);

-- Lead 188:Ali Chamseddine (alichamseddine@hotmail.com)
WITH inserted_person AS (
  INSERT INTO public.crm_people (
    tenant_id, full_name, email, phone, instagram, country, income_range, goal, obstacle, notes, created_at, updated_at
  ) VALUES (
    '520a4cfd-5183-4e11-aecc-bc71a52978b6',
    'Ali Chamseddine',
    'alichamseddine@hotmail.com',
    '+971564353222',
    'alichamseddine',
    'United Arab Emirates',
    'More than $10k /mo',
    'i want to have a bigger sm visibility that will impact positively the bookings in my clinic',
    'I am not a big fan of social media',
    NULL,
    '2026-04-01T20:00:00.000Z',
    '2026-04-01T20:00:00.000Z'
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
  SELECT id FROM public.crm_people WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'alichamseddine@hotmail.com'
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
  'Ali',
  'Chamseddine',
  'alichamseddine@hotmail.com',
  '+971564353222',
  'alichamseddine',
  'Doctor',
  'More than $10k /mo',
  'i want to have a bigger sm visibility that will impact positively the bookings in my clinic',
  'I am not a big fan of social media',
  true,
  'new',
  '{"first_name":"Ali","last_name":"Chamseddine","email":"alichamseddine@hotmail.com","phone":"+971564353222","social_username":"alichamseddine","country":"United Arab Emirates","content_language":"","business_type":"Doctor","monthly_income_range":"More than $10k /mo","goals_objectives":"i want to have a bigger sm visibility that will impact positively the bookings in my clinic","obstacles":"I am not a big fan of social media","call_attendance_confirmation":"Yes","status":"new","notes":"","date_added":"Apr 2, 2026"}'::jsonb,
  'United Arab Emirates',
  NULL,
  false,
  '2026-04-01T20:00:00.000Z',
  '2026-04-01T20:00:00.000Z'
WHERE NOT EXISTS (
  SELECT 1 FROM public.leads WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'alichamseddine@hotmail.com'
);

-- Lead 189:Noor Al Ani (dr.nooralani@gmail.com)
WITH inserted_person AS (
  INSERT INTO public.crm_people (
    tenant_id, full_name, email, phone, instagram, country, income_range, goal, obstacle, notes, created_at, updated_at
  ) VALUES (
    '520a4cfd-5183-4e11-aecc-bc71a52978b6',
    'Noor Al Ani',
    'dr.nooralani@gmail.com',
    '01774131979',
    'Doc.noor.al.ani',
    'Germany',
    'Between $5k & $10k /mo',
    'I want to be famous especially in Germany for Arabic patients and also international im my mother language.',
    'The time to make content with high standards.',
    NULL,
    '2026-04-01T20:00:00.000Z',
    '2026-04-01T20:00:00.000Z'
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
  SELECT id FROM public.crm_people WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'dr.nooralani@gmail.com'
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
  'Noor',
  'Al Ani',
  'dr.nooralani@gmail.com',
  '01774131979',
  'Doc.noor.al.ani',
  'Doctor',
  'Between $5k & $10k /mo',
  'I want to be famous especially in Germany for Arabic patients and also international im my mother language.',
  'The time to make content with high standards.',
  true,
  'qualified',
  '{"first_name":"Noor","last_name":"Al Ani","email":"dr.nooralani@gmail.com","phone":"01774131979","social_username":"Doc.noor.al.ani","country":"Germany","content_language":"Arabic","business_type":"Doctor","monthly_income_range":"Between $5k & $10k /mo","goals_objectives":"I want to be famous especially in Germany for Arabic patients and also international im my mother language.","obstacles":"The time to make content with high standards.","call_attendance_confirmation":"Yes","status":"qualified","notes":"","date_added":"Apr 2, 2026"}'::jsonb,
  'Germany',
  'Arabic',
  false,
  '2026-04-01T20:00:00.000Z',
  '2026-04-01T20:00:00.000Z'
WHERE NOT EXISTS (
  SELECT 1 FROM public.leads WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'dr.nooralani@gmail.com'
);

-- Lead 190:Atallah Yaghi (atallah@cerebree.com)
WITH inserted_person AS (
  INSERT INTO public.crm_people (
    tenant_id, full_name, email, phone, instagram, country, income_range, goal, obstacle, notes, created_at, updated_at
  ) VALUES (
    '520a4cfd-5183-4e11-aecc-bc71a52978b6',
    'Atallah Yaghi',
    'atallah@cerebree.com',
    '0552299804',
    'https://x.com/CereBree',
    'United Arab Emirates',
    'More than $10k /mo',
    'I want to achieve 2 type of clients , autistic family for b2c 
Autistic clinics and organization ,
Business solution for big company through HRX',
    'I didnt start yet',
    NULL,
    '2026-04-01T20:00:00.000Z',
    '2026-04-01T20:00:00.000Z'
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
  SELECT id FROM public.crm_people WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'atallah@cerebree.com'
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
  'Atallah',
  'Yaghi',
  'atallah@cerebree.com',
  '0552299804',
  'https://x.com/CereBree',
  'Service Provider',
  'More than $10k /mo',
  'I want to achieve 2 type of clients , autistic family for b2c 
Autistic clinics and organization ,
Business solution for big company through HRX',
  'I didnt start yet',
  true,
  'new',
  '{"first_name":"Atallah","last_name":"Yaghi","email":"atallah@cerebree.com","phone":"0552299804","social_username":"https://x.com/CereBree","country":"United Arab Emirates","content_language":"","business_type":"Service Provider","monthly_income_range":"More than $10k /mo","goals_objectives":"I want to achieve 2 type of clients , autistic family for b2c \nAutistic clinics and organization ,\nBusiness solution for big company through HRX","obstacles":"I didnt start yet","call_attendance_confirmation":"Yes","status":"new","notes":"","date_added":"Apr 2, 2026"}'::jsonb,
  'United Arab Emirates',
  NULL,
  false,
  '2026-04-01T20:00:00.000Z',
  '2026-04-01T20:00:00.000Z'
WHERE NOT EXISTS (
  SELECT 1 FROM public.leads WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'atallah@cerebree.com'
);

-- Lead 191:Ibrahim Alheshma (kalakas.c.g.m@gmail.com)
WITH inserted_person AS (
  INSERT INTO public.crm_people (
    tenant_id, full_name, email, phone, instagram, country, income_range, goal, obstacle, notes, created_at, updated_at
  ) VALUES (
    '520a4cfd-5183-4e11-aecc-bc71a52978b6',
    'Ibrahim Alheshma',
    'kalakas.c.g.m@gmail.com',
    '+971508316056',
    'Kalakas.c.g.m',
    'United Arab Emirates',
    'More than $10k /mo',
    'More recognition in the market, More contracts and thriving as a contractor in abudhabi city and future in all of uae',
    'Targeting specifc audeince and making the content',
    NULL,
    '2026-04-01T20:00:00.000Z',
    '2026-04-01T20:00:00.000Z'
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
  SELECT id FROM public.crm_people WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'kalakas.c.g.m@gmail.com'
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
  'Alheshma',
  'kalakas.c.g.m@gmail.com',
  '+971508316056',
  'Kalakas.c.g.m',
  'Other',
  'More than $10k /mo',
  'More recognition in the market, More contracts and thriving as a contractor in abudhabi city and future in all of uae',
  'Targeting specifc audeince and making the content',
  true,
  'new',
  '{"first_name":"Ibrahim","last_name":"Alheshma","email":"kalakas.c.g.m@gmail.com","phone":"+971508316056","social_username":"Kalakas.c.g.m","country":"United Arab Emirates","content_language":"","business_type":"Other","monthly_income_range":"More than $10k /mo","goals_objectives":"More recognition in the market, More contracts and thriving as a contractor in abudhabi city and future in all of uae","obstacles":"Targeting specifc audeince and making the content","call_attendance_confirmation":"Yes","status":"new","notes":"","date_added":"Apr 2, 2026"}'::jsonb,
  'United Arab Emirates',
  NULL,
  false,
  '2026-04-01T20:00:00.000Z',
  '2026-04-01T20:00:00.000Z'
WHERE NOT EXISTS (
  SELECT 1 FROM public.leads WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'kalakas.c.g.m@gmail.com'
);

-- Lead 192:John Kairouz (ams2030nl@gmail.com)
WITH inserted_person AS (
  INSERT INTO public.crm_people (
    tenant_id, full_name, email, phone, instagram, country, income_range, goal, obstacle, notes, created_at, updated_at
  ) VALUES (
    '520a4cfd-5183-4e11-aecc-bc71a52978b6',
    'John Kairouz',
    'ams2030nl@gmail.com',
    '00971505335473',
    'John.kairouz',
    'United Arab Emirates',
    'Between $5k & $10k /mo',
    'Position myself as a recognized authority in behavioral leadership and CEO leadership architecture — specifically at the intersection of human behavior, decision-making, and organizational systems.
Build a strong online presence that mirrors my existing offline authority, so I’m not dependent on physical delivery to generate influence, opportunities, and revenue.
What I Want to Achieve (business outcomes)
Establish top-of-mind authority among:
CEOs
Senior leaders
Business owners
Build a high-quality audience (not mass followers) of decision-makers who:
Value depth over noise
Are willing to invest in transformation
Create a trusted leadership community that:
Engages with real challenges
Learns practical, applicable tools
Evolves into clients, partnerships, and long-term relationships',
    'Choosing the right service provider or partner',
    NULL,
    '2026-04-01T20:00:00.000Z',
    '2026-04-01T20:00:00.000Z'
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
  SELECT id FROM public.crm_people WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'ams2030nl@gmail.com'
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
  'John',
  'Kairouz',
  'ams2030nl@gmail.com',
  '00971505335473',
  'John.kairouz',
  'Consultant',
  'Between $5k & $10k /mo',
  'Position myself as a recognized authority in behavioral leadership and CEO leadership architecture — specifically at the intersection of human behavior, decision-making, and organizational systems.
Build a strong online presence that mirrors my existing offline authority, so I’m not dependent on physical delivery to generate influence, opportunities, and revenue.
What I Want to Achieve (business outcomes)
Establish top-of-mind authority among:
CEOs
Senior leaders
Business owners
Build a high-quality audience (not mass followers) of decision-makers who:
Value depth over noise
Are willing to invest in transformation
Create a trusted leadership community that:
Engages with real challenges
Learns practical, applicable tools
Evolves into clients, partnerships, and long-term relationships',
  'Choosing the right service provider or partner',
  true,
  'new',
  '{"first_name":"John","last_name":"Kairouz","email":"ams2030nl@gmail.com","phone":"00971505335473","social_username":"John.kairouz","country":"United Arab Emirates","content_language":"","business_type":"Consultant","monthly_income_range":"Between $5k & $10k /mo","goals_objectives":"Position myself as a recognized authority in behavioral leadership and CEO leadership architecture — specifically at the intersection of human behavior, decision-making, and organizational systems.\nBuild a strong online presence that mirrors my existing offline authority, so I’m not dependent on physical delivery to generate influence, opportunities, and revenue.\nWhat I Want to Achieve (business outcomes)\nEstablish top-of-mind authority among:\nCEOs\nSenior leaders\nBusiness owners\nBuild a high-quality audience (not mass followers) of decision-makers who:\nValue depth over noise\nAre willing to invest in transformation\nCreate a trusted leadership community that:\nEngages with real challenges\nLearns practical, applicable tools\nEvolves into clients, partnerships, and long-term relationships","obstacles":"Choosing the right service provider or partner","call_attendance_confirmation":"Yes","status":"new","notes":"","date_added":"Apr 2, 2026"}'::jsonb,
  'United Arab Emirates',
  NULL,
  false,
  '2026-04-01T20:00:00.000Z',
  '2026-04-01T20:00:00.000Z'
WHERE NOT EXISTS (
  SELECT 1 FROM public.leads WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'ams2030nl@gmail.com'
);

-- Lead 193:Marwa Eid (dr.marwa40@yahoo.com)
WITH inserted_person AS (
  INSERT INTO public.crm_people (
    tenant_id, full_name, email, phone, instagram, country, income_range, goal, obstacle, notes, created_at, updated_at
  ) VALUES (
    '520a4cfd-5183-4e11-aecc-bc71a52978b6',
    'Marwa Eid',
    'dr.marwa40@yahoo.com',
    '0547002600',
    'Dr.Marwa.Eid',
    'United Arab Emirates',
    'More than $10k /mo',
    'Marketing plan',
    'Marketing overall',
    NULL,
    '2026-03-31T20:00:00.000Z',
    '2026-03-31T20:00:00.000Z'
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
  SELECT id FROM public.crm_people WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'dr.marwa40@yahoo.com'
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
  'Marwa',
  'Eid',
  'dr.marwa40@yahoo.com',
  '0547002600',
  'Dr.Marwa.Eid',
  'Doctor',
  'More than $10k /mo',
  'Marketing plan',
  'Marketing overall',
  true,
  'new',
  '{"first_name":"Marwa","last_name":"Eid","email":"dr.marwa40@yahoo.com","phone":"0547002600","social_username":"Dr.Marwa.Eid","country":"United Arab Emirates","content_language":"","business_type":"Doctor","monthly_income_range":"More than $10k /mo","goals_objectives":"Marketing plan","obstacles":"Marketing overall","call_attendance_confirmation":"Yes","status":"new","notes":"","date_added":"Apr 1, 2026"}'::jsonb,
  'United Arab Emirates',
  NULL,
  false,
  '2026-03-31T20:00:00.000Z',
  '2026-03-31T20:00:00.000Z'
WHERE NOT EXISTS (
  SELECT 1 FROM public.leads WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'dr.marwa40@yahoo.com'
);

-- Lead 194:Farah Alnafoosi (f_alnafoosi@yahoo.com)
WITH inserted_person AS (
  INSERT INTO public.crm_people (
    tenant_id, full_name, email, phone, instagram, country, income_range, goal, obstacle, notes, created_at, updated_at
  ) VALUES (
    '520a4cfd-5183-4e11-aecc-bc71a52978b6',
    'Farah Alnafoosi',
    'f_alnafoosi@yahoo.com',
    '97150148101',
    'Dr.farahalnafoosi',
    'United Arab Emirates',
    'More than $10k /mo',
    'Going more viral and convert the followers to patients',
    'Reaching to my target audience',
    NULL,
    '2026-03-31T20:00:00.000Z',
    '2026-03-31T20:00:00.000Z'
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
  SELECT id FROM public.crm_people WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'f_alnafoosi@yahoo.com'
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
  'Farah',
  'Alnafoosi',
  'f_alnafoosi@yahoo.com',
  '97150148101',
  'Dr.farahalnafoosi',
  'Doctor',
  'More than $10k /mo',
  'Going more viral and convert the followers to patients',
  'Reaching to my target audience',
  true,
  'new',
  '{"first_name":"Farah","last_name":"Alnafoosi","email":"f_alnafoosi@yahoo.com","phone":"97150148101","social_username":"Dr.farahalnafoosi","country":"United Arab Emirates","content_language":"","business_type":"Doctor","monthly_income_range":"More than $10k /mo","goals_objectives":"Going more viral and convert the followers to patients","obstacles":"Reaching to my target audience","call_attendance_confirmation":"Yes","status":"new","notes":"","date_added":"Apr 1, 2026"}'::jsonb,
  'United Arab Emirates',
  NULL,
  false,
  '2026-03-31T20:00:00.000Z',
  '2026-03-31T20:00:00.000Z'
WHERE NOT EXISTS (
  SELECT 1 FROM public.leads WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'f_alnafoosi@yahoo.com'
);

-- Lead 195:Farah Alnafoosi (f_alnafoosi@yahoo.com)
WITH inserted_person AS (
  INSERT INTO public.crm_people (
    tenant_id, full_name, email, phone, instagram, country, income_range, goal, obstacle, notes, created_at, updated_at
  ) VALUES (
    '520a4cfd-5183-4e11-aecc-bc71a52978b6',
    'Farah Alnafoosi',
    'f_alnafoosi@yahoo.com',
    '501484101',
    'Dr.farahalnafoosi',
    'United Arab Emirates',
    'Between $5k & $10k /mo',
    'To reach more patients',
    'Not to be visible to the mu target audience',
    NULL,
    '2026-03-31T20:00:00.000Z',
    '2026-03-31T20:00:00.000Z'
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
  SELECT id FROM public.crm_people WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'f_alnafoosi@yahoo.com'
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
  'Farah',
  'Alnafoosi',
  'f_alnafoosi@yahoo.com',
  '501484101',
  'Dr.farahalnafoosi',
  'Doctor',
  'Between $5k & $10k /mo',
  'To reach more patients',
  'Not to be visible to the mu target audience',
  true,
  'new',
  '{"first_name":"Farah","last_name":"Alnafoosi","email":"f_alnafoosi@yahoo.com","phone":"501484101","social_username":"Dr.farahalnafoosi","country":"United Arab Emirates","content_language":"","business_type":"Doctor","monthly_income_range":"Between $5k & $10k /mo","goals_objectives":"To reach more patients","obstacles":"Not to be visible to the mu target audience","call_attendance_confirmation":"Yes","status":"new","notes":"","date_added":"Apr 1, 2026"}'::jsonb,
  'United Arab Emirates',
  NULL,
  false,
  '2026-03-31T20:00:00.000Z',
  '2026-03-31T20:00:00.000Z'
WHERE NOT EXISTS (
  SELECT 1 FROM public.leads WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'f_alnafoosi@yahoo.com'
);

-- Lead 196:Mohammed Chaudhry (mc@elev8mediaco.com)
WITH inserted_person AS (
  INSERT INTO public.crm_people (
    tenant_id, full_name, email, phone, instagram, country, income_range, goal, obstacle, notes, created_at, updated_at
  ) VALUES (
    '520a4cfd-5183-4e11-aecc-bc71a52978b6',
    'Mohammed Chaudhry',
    'mc@elev8mediaco.com',
    '00971501308588',
    'Mrmchaudhry',
    'United Arab Emirates',
    'More than $10k /mo',
    'Quicker and easier way to build my personal brand',
    'A process to quickly turn things around, work with multiple editors etc',
    NULL,
    '2026-03-31T20:00:00.000Z',
    '2026-03-31T20:00:00.000Z'
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
  SELECT id FROM public.crm_people WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'mc@elev8mediaco.com'
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
  'Chaudhry',
  'mc@elev8mediaco.com',
  '00971501308588',
  'Mrmchaudhry',
  'Service Provider',
  'More than $10k /mo',
  'Quicker and easier way to build my personal brand',
  'A process to quickly turn things around, work with multiple editors etc',
  true,
  'new',
  '{"first_name":"Mohammed","last_name":"Chaudhry","email":"mc@elev8mediaco.com","phone":"00971501308588","social_username":"Mrmchaudhry","country":"United Arab Emirates","content_language":"","business_type":"Service Provider","monthly_income_range":"More than $10k /mo","goals_objectives":"Quicker and easier way to build my personal brand","obstacles":"A process to quickly turn things around, work with multiple editors etc","call_attendance_confirmation":"Yes","status":"new","notes":"","date_added":"Apr 1, 2026"}'::jsonb,
  'United Arab Emirates',
  NULL,
  false,
  '2026-03-31T20:00:00.000Z',
  '2026-03-31T20:00:00.000Z'
WHERE NOT EXISTS (
  SELECT 1 FROM public.leads WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'mc@elev8mediaco.com'
);

-- Lead 197:Parham Shafe (shafe@dr-shafe.de)
WITH inserted_person AS (
  INSERT INTO public.crm_people (
    tenant_id, full_name, email, phone, instagram, country, income_range, goal, obstacle, notes, created_at, updated_at
  ) VALUES (
    '520a4cfd-5183-4e11-aecc-bc71a52978b6',
    'Parham Shafe',
    'shafe@dr-shafe.de',
    '004916094872794',
    'dr.shafe',
    'Germany',
    'Between $5k & $10k /mo',
    'High quality Videos of me educating and presenting cases',
    'No time',
    NULL,
    '2026-03-31T20:00:00.000Z',
    '2026-03-31T20:00:00.000Z'
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
  SELECT id FROM public.crm_people WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'shafe@dr-shafe.de'
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
  'Parham',
  'Shafe',
  'shafe@dr-shafe.de',
  '004916094872794',
  'dr.shafe',
  'Doctor',
  'Between $5k & $10k /mo',
  'High quality Videos of me educating and presenting cases',
  'No time',
  true,
  'qualified',
  '{"first_name":"Parham","last_name":"Shafe","email":"shafe@dr-shafe.de","phone":"004916094872794","social_username":"dr.shafe","country":"Germany","content_language":"","business_type":"Doctor","monthly_income_range":"Between $5k & $10k /mo","goals_objectives":"High quality Videos of me educating and presenting cases","obstacles":"No time","call_attendance_confirmation":"Yes","status":"qualified","notes":"","date_added":"Apr 1, 2026"}'::jsonb,
  'Germany',
  NULL,
  false,
  '2026-03-31T20:00:00.000Z',
  '2026-03-31T20:00:00.000Z'
WHERE NOT EXISTS (
  SELECT 1 FROM public.leads WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'shafe@dr-shafe.de'
);

-- Lead 198:Ziad Abdulrahim (zabdulrahim@gmx.de)
WITH inserted_person AS (
  INSERT INTO public.crm_people (
    tenant_id, full_name, email, phone, instagram, country, income_range, goal, obstacle, notes, created_at, updated_at
  ) VALUES (
    '520a4cfd-5183-4e11-aecc-bc71a52978b6',
    'Ziad Abdulrahim',
    'zabdulrahim@gmx.de',
    '+4915217306317',
    'Ziad_wanly',
    'Germany',
    'More than $10k /mo',
    'I want to win new patients who are read to invest 2000+ Euros in their teeth, for special treatment s which are not paid by insurance, i.e. Implants and clear aligners',
    'Making professional content needs time and I can’t make everything on my own. I don’t have the time or the means to do so',
    NULL,
    '2026-03-31T20:00:00.000Z',
    '2026-03-31T20:00:00.000Z'
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
  SELECT id FROM public.crm_people WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'zabdulrahim@gmx.de'
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
  'Ziad',
  'Abdulrahim',
  'zabdulrahim@gmx.de',
  '+4915217306317',
  'Ziad_wanly',
  'Doctor',
  'More than $10k /mo',
  'I want to win new patients who are read to invest 2000+ Euros in their teeth, for special treatment s which are not paid by insurance, i.e. Implants and clear aligners',
  'Making professional content needs time and I can’t make everything on my own. I don’t have the time or the means to do so',
  true,
  'qualified',
  '{"first_name":"Ziad","last_name":"Abdulrahim","email":"zabdulrahim@gmx.de","phone":"+4915217306317","social_username":"Ziad_wanly","country":"Germany","content_language":"","business_type":"Doctor","monthly_income_range":"More than $10k /mo","goals_objectives":"I want to win new patients who are read to invest 2000+ Euros in their teeth, for special treatment s which are not paid by insurance, i.e. Implants and clear aligners","obstacles":"Making professional content needs time and I can’t make everything on my own. I don’t have the time or the means to do so","call_attendance_confirmation":"Yes","status":"qualified","notes":"","date_added":"Apr 1, 2026"}'::jsonb,
  'Germany',
  NULL,
  false,
  '2026-03-31T20:00:00.000Z',
  '2026-03-31T20:00:00.000Z'
WHERE NOT EXISTS (
  SELECT 1 FROM public.leads WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'zabdulrahim@gmx.de'
);

-- Lead 199:Adam Shagrin (hello@rentta.com.au)
WITH inserted_person AS (
  INSERT INTO public.crm_people (
    tenant_id, full_name, email, phone, instagram, country, income_range, goal, obstacle, notes, created_at, updated_at
  ) VALUES (
    '520a4cfd-5183-4e11-aecc-bc71a52978b6',
    'Adam Shagrin',
    'hello@rentta.com.au',
    '+61478666569',
    'renttaproperty',
    'Australia',
    'More than $10k /mo',
    'More reach, clients and recognition on social media',
    'Don’t have the skill to do this',
    NULL,
    '2026-03-30T20:00:00.000Z',
    '2026-03-30T20:00:00.000Z'
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
  SELECT id FROM public.crm_people WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'hello@rentta.com.au'
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
  'Adam',
  'Shagrin',
  'hello@rentta.com.au',
  '+61478666569',
  'renttaproperty',
  'Service Provider',
  'More than $10k /mo',
  'More reach, clients and recognition on social media',
  'Don’t have the skill to do this',
  true,
  'new',
  '{"first_name":"Adam","last_name":"Shagrin","email":"hello@rentta.com.au","phone":"+61478666569","social_username":"renttaproperty","country":"Australia","content_language":"","business_type":"Service Provider","monthly_income_range":"More than $10k /mo","goals_objectives":"More reach, clients and recognition on social media","obstacles":"Don’t have the skill to do this","call_attendance_confirmation":"Yes","status":"new","notes":"","date_added":"Mar 31, 2026"}'::jsonb,
  'Australia',
  NULL,
  false,
  '2026-03-30T20:00:00.000Z',
  '2026-03-30T20:00:00.000Z'
WHERE NOT EXISTS (
  SELECT 1 FROM public.leads WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'hello@rentta.com.au'
);

-- Lead 200:Kanima Chugh (kanika.chugh@skvlawoffices.com)
WITH inserted_person AS (
  INSERT INTO public.crm_people (
    tenant_id, full_name, email, phone, instagram, country, income_range, goal, obstacle, notes, created_at, updated_at
  ) VALUES (
    '520a4cfd-5183-4e11-aecc-bc71a52978b6',
    'Kanima Chugh',
    'kanika.chugh@skvlawoffices.com',
    '+919999831083',
    '0',
    'Other',
    'More than $10k /mo',
    'I want to achieve realistic engaging and sophisticated content and marketing plan for my law firm based in India',
    'Finding the right person with the right aesthetics and vision',
    NULL,
    '2026-03-29T20:00:00.000Z',
    '2026-03-29T20:00:00.000Z'
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
  SELECT id FROM public.crm_people WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'kanika.chugh@skvlawoffices.com'
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
  'Kanima',
  'Chugh',
  'kanika.chugh@skvlawoffices.com',
  '+919999831083',
  '0',
  'Service Provider',
  'More than $10k /mo',
  'I want to achieve realistic engaging and sophisticated content and marketing plan for my law firm based in India',
  'Finding the right person with the right aesthetics and vision',
  true,
  'new',
  '{"first_name":"Kanima","last_name":"Chugh","email":"kanika.chugh@skvlawoffices.com","phone":"+919999831083","social_username":"0","country":"Other","content_language":"","business_type":"Service Provider","monthly_income_range":"More than $10k /mo","goals_objectives":"I want to achieve realistic engaging and sophisticated content and marketing plan for my law firm based in India","obstacles":"Finding the right person with the right aesthetics and vision","call_attendance_confirmation":"Yes","status":"new","notes":"","date_added":"Mar 30, 2026"}'::jsonb,
  'Other',
  NULL,
  false,
  '2026-03-29T20:00:00.000Z',
  '2026-03-29T20:00:00.000Z'
WHERE NOT EXISTS (
  SELECT 1 FROM public.leads WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'kanika.chugh@skvlawoffices.com'
);