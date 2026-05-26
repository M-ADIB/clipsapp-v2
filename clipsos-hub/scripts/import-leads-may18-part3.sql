-- ClipsOS V2 Leads Import Script - Part 3

-- Leads 101 to 150

-- Lead 101:Karishma SAMTANI (petitegourmetdubai@gmail.com)
WITH inserted_person AS (
  INSERT INTO public.crm_people (
    tenant_id, full_name, email, phone, instagram, country, income_range, goal, obstacle, notes, created_at, updated_at
  ) VALUES (
    '520a4cfd-5183-4e11-aecc-bc71a52978b6',
    'Karishma SAMTANI',
    'petitegourmetdubai@gmail.com',
    '050482431',
    '@petitegourmetdubai',
    'United Arab Emirates',
    'Between $5k & $10k /mo',
    'Visibility and leads',
    'Very slow visibility and very less leads. Have a strong brand.',
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
  'SAMTANI',
  'petitegourmetdubai@gmail.com',
  '050482431',
  '@petitegourmetdubai',
  'Service Provider',
  'Between $5k & $10k /mo',
  'Visibility and leads',
  'Very slow visibility and very less leads. Have a strong brand.',
  true,
  'new',
  '{"first_name":"Karishma","last_name":"SAMTANI","email":"petitegourmetdubai@gmail.com","phone":"050482431","social_username":"@petitegourmetdubai","country":"United Arab Emirates","content_language":"","business_type":"Service Provider","monthly_income_range":"Between $5k & $10k /mo","goals_objectives":"Visibility and leads","obstacles":"Very slow visibility and very less leads. Have a strong brand.","call_attendance_confirmation":"Yes","status":"new","notes":"","date_added":"Apr 20, 2026"}'::jsonb,
  'United Arab Emirates',
  NULL,
  false,
  '2026-04-19T20:00:00.000Z',
  '2026-04-19T20:00:00.000Z'
WHERE NOT EXISTS (
  SELECT 1 FROM public.leads WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'petitegourmetdubai@gmail.com'
);

-- Lead 102:Moza AlFalahi (moza.hf@gmail.com)
WITH inserted_person AS (
  INSERT INTO public.crm_people (
    tenant_id, full_name, email, phone, instagram, country, income_range, goal, obstacle, notes, created_at, updated_at
  ) VALUES (
    '520a4cfd-5183-4e11-aecc-bc71a52978b6',
    'Moza AlFalahi',
    'moza.hf@gmail.com',
    '+971568666555',
    '@lulu48871',
    'United Arab Emirates',
    'More than $10k /mo',
    'I would like to have patient flow',
    'Lots of companies',
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
  SELECT id FROM public.crm_people WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'moza.hf@gmail.com'
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
  'Moza',
  'AlFalahi',
  'moza.hf@gmail.com',
  '+971568666555',
  '@lulu48871',
  'Doctor',
  'More than $10k /mo',
  'I would like to have patient flow',
  'Lots of companies',
  true,
  'new',
  '{"first_name":"Moza","last_name":"AlFalahi","email":"moza.hf@gmail.com","phone":"+971568666555","social_username":"@lulu48871","country":"United Arab Emirates","content_language":"","business_type":"Doctor","monthly_income_range":"More than $10k /mo","goals_objectives":"I would like to have patient flow","obstacles":"Lots of companies","call_attendance_confirmation":"Yes","status":"new","notes":"","date_added":"Apr 20, 2026"}'::jsonb,
  'United Arab Emirates',
  NULL,
  false,
  '2026-04-19T20:00:00.000Z',
  '2026-04-19T20:00:00.000Z'
WHERE NOT EXISTS (
  SELECT 1 FROM public.leads WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'moza.hf@gmail.com'
);

-- Lead 103:Amer Kassar (amerx3003@gmail.com)
WITH inserted_person AS (
  INSERT INTO public.crm_people (
    tenant_id, full_name, email, phone, instagram, country, income_range, goal, obstacle, notes, created_at, updated_at
  ) VALUES (
    '520a4cfd-5183-4e11-aecc-bc71a52978b6',
    'Amer Kassar',
    'amerx3003@gmail.com',
    '0544560013',
    'Razanuae_',
    'United Arab Emirates',
    'More than $10k /mo',
    'Personal brand: 
I want to build authority with current clients and future prospects. Build trust.',
    'Filming , consisting , editing etc.',
    NULL,
    '2026-04-18T20:00:00.000Z',
    '2026-04-18T20:00:00.000Z'
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
  SELECT id FROM public.crm_people WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'amerx3003@gmail.com'
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
  'Kassar',
  'amerx3003@gmail.com',
  '0544560013',
  'Razanuae_',
  'Building materials',
  'More than $10k /mo',
  'Personal brand: 
I want to build authority with current clients and future prospects. Build trust.',
  'Filming , consisting , editing etc.',
  true,
  'new',
  '{"first_name":"Amer","last_name":"Kassar","email":"amerx3003@gmail.com","phone":"0544560013","social_username":"Razanuae_","country":"United Arab Emirates","content_language":"","business_type":"Building materials","monthly_income_range":"More than $10k /mo","goals_objectives":"Personal brand: \nI want to build authority with current clients and future prospects. Build trust.","obstacles":"Filming , consisting , editing etc.","call_attendance_confirmation":"Yes","status":"new","notes":"","date_added":"Apr 19, 2026"}'::jsonb,
  'United Arab Emirates',
  NULL,
  false,
  '2026-04-18T20:00:00.000Z',
  '2026-04-18T20:00:00.000Z'
WHERE NOT EXISTS (
  SELECT 1 FROM public.leads WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'amerx3003@gmail.com'
);

-- Lead 104:Muath Albarakati (mu3th898@live.com)
WITH inserted_person AS (
  INSERT INTO public.crm_people (
    tenant_id, full_name, email, phone, instagram, country, income_range, goal, obstacle, notes, created_at, updated_at
  ) VALUES (
    '520a4cfd-5183-4e11-aecc-bc71a52978b6',
    'Muath Albarakati',
    'mu3th898@live.com',
    '+966555655898',
    '.',
    'Saudi Arabia',
    'More than $10k /mo',
    'I want to create educational videos for the purpose of personal marketing.',
    '.',
    NULL,
    '2026-04-18T20:00:00.000Z',
    '2026-04-18T20:00:00.000Z'
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
  SELECT id FROM public.crm_people WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'mu3th898@live.com'
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
  'Albarakati',
  'mu3th898@live.com',
  '+966555655898',
  '.',
  'Doctor',
  'More than $10k /mo',
  'I want to create educational videos for the purpose of personal marketing.',
  '.',
  true,
  'new',
  '{"first_name":"Muath","last_name":"Albarakati","email":"mu3th898@live.com","phone":"+966555655898","social_username":".","country":"Saudi Arabia","content_language":"","business_type":"Doctor","monthly_income_range":"More than $10k /mo","goals_objectives":"I want to create educational videos for the purpose of personal marketing.","obstacles":".","call_attendance_confirmation":"Yes","status":"new","notes":"","date_added":"Apr 19, 2026"}'::jsonb,
  'Saudi Arabia',
  NULL,
  false,
  '2026-04-18T20:00:00.000Z',
  '2026-04-18T20:00:00.000Z'
WHERE NOT EXISTS (
  SELECT 1 FROM public.leads WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'mu3th898@live.com'
);

-- Lead 105:Dua Hamasha (duaahamasha@gmail.com)
WITH inserted_person AS (
  INSERT INTO public.crm_people (
    tenant_id, full_name, email, phone, instagram, country, income_range, goal, obstacle, notes, created_at, updated_at
  ) VALUES (
    '520a4cfd-5183-4e11-aecc-bc71a52978b6',
    'Dua Hamasha',
    'duaahamasha@gmail.com',
    '0547466624',
    'I dint have',
    'Saudi Arabia',
    'Between $5k & $10k /mo',
    'Start my channel',
    'Timing, shouting, and editing',
    NULL,
    '2026-04-18T20:00:00.000Z',
    '2026-04-18T20:00:00.000Z'
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
  SELECT id FROM public.crm_people WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'duaahamasha@gmail.com'
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
  'Dua',
  'Hamasha',
  'duaahamasha@gmail.com',
  '0547466624',
  'I dint have',
  'Consultant',
  'Between $5k & $10k /mo',
  'Start my channel',
  'Timing, shouting, and editing',
  true,
  'new',
  '{"first_name":"Dua","last_name":"Hamasha","email":"duaahamasha@gmail.com","phone":"0547466624","social_username":"I dint have","country":"Saudi Arabia","content_language":"","business_type":"Consultant","monthly_income_range":"Between $5k & $10k /mo","goals_objectives":"Start my channel","obstacles":"Timing, shouting, and editing","call_attendance_confirmation":"Yes","status":"new","notes":"","date_added":"Apr 19, 2026"}'::jsonb,
  'Saudi Arabia',
  NULL,
  false,
  '2026-04-18T20:00:00.000Z',
  '2026-04-18T20:00:00.000Z'
WHERE NOT EXISTS (
  SELECT 1 FROM public.leads WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'duaahamasha@gmail.com'
);

-- Lead 106:Ammar Azzawi (drazzawi85@gmail.com)
WITH inserted_person AS (
  INSERT INTO public.crm_people (
    tenant_id, full_name, email, phone, instagram, country, income_range, goal, obstacle, notes, created_at, updated_at
  ) VALUES (
    '520a4cfd-5183-4e11-aecc-bc71a52978b6',
    'Ammar Azzawi',
    'drazzawi85@gmail.com',
    '00966557311754',
    'Drazzawi',
    'Saudi Arabia',
    'More than $10k /mo',
    '1m followers for people based on Jeddah',
    'I do not have.',
    NULL,
    '2026-04-18T20:00:00.000Z',
    '2026-04-18T20:00:00.000Z'
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
  SELECT id FROM public.crm_people WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'drazzawi85@gmail.com'
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
  'Ammar',
  'Azzawi',
  'drazzawi85@gmail.com',
  '00966557311754',
  'Drazzawi',
  'Doctor',
  'More than $10k /mo',
  '1m followers for people based on Jeddah',
  'I do not have.',
  true,
  'new',
  '{"first_name":"Ammar","last_name":"Azzawi","email":"drazzawi85@gmail.com","phone":"00966557311754","social_username":"Drazzawi","country":"Saudi Arabia","content_language":"","business_type":"Doctor","monthly_income_range":"More than $10k /mo","goals_objectives":"1m followers for people based on Jeddah","obstacles":"I do not have.","call_attendance_confirmation":"Yes","status":"new","notes":"","date_added":"Apr 19, 2026"}'::jsonb,
  'Saudi Arabia',
  NULL,
  false,
  '2026-04-18T20:00:00.000Z',
  '2026-04-18T20:00:00.000Z'
WHERE NOT EXISTS (
  SELECT 1 FROM public.leads WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'drazzawi85@gmail.com'
);

-- Lead 107:Shaima Zaher (alshaimaa-zaher@hotmail.com)
WITH inserted_person AS (
  INSERT INTO public.crm_people (
    tenant_id, full_name, email, phone, instagram, country, income_range, goal, obstacle, notes, created_at, updated_at
  ) VALUES (
    '520a4cfd-5183-4e11-aecc-bc71a52978b6',
    'Shaima Zaher',
    'alshaimaa-zaher@hotmail.com',
    '0966548041893',
    '@dt.shaimazaher',
    'Saudi Arabia',
    'Between $5k & $10k /mo',
    'Reaching more audience',
    'Getting creative idea that’s not cringe',
    NULL,
    '2026-04-18T20:00:00.000Z',
    '2026-04-18T20:00:00.000Z'
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
  SELECT id FROM public.crm_people WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'alshaimaa-zaher@hotmail.com'
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
  'Shaima',
  'Zaher',
  'alshaimaa-zaher@hotmail.com',
  '0966548041893',
  '@dt.shaimazaher',
  'Doctor',
  'Between $5k & $10k /mo',
  'Reaching more audience',
  'Getting creative idea that’s not cringe',
  true,
  'new',
  '{"first_name":"Shaima","last_name":"Zaher","email":"alshaimaa-zaher@hotmail.com","phone":"0966548041893","social_username":"@dt.shaimazaher","country":"Saudi Arabia","content_language":"","business_type":"Doctor","monthly_income_range":"Between $5k & $10k /mo","goals_objectives":"Reaching more audience","obstacles":"Getting creative idea that’s not cringe","call_attendance_confirmation":"Yes","status":"new","notes":"","date_added":"Apr 19, 2026"}'::jsonb,
  'Saudi Arabia',
  NULL,
  false,
  '2026-04-18T20:00:00.000Z',
  '2026-04-18T20:00:00.000Z'
WHERE NOT EXISTS (
  SELECT 1 FROM public.leads WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'alshaimaa-zaher@hotmail.com'
);

-- Lead 108:Ali Almomin (d.elanbr.90@hotmail.com)
WITH inserted_person AS (
  INSERT INTO public.crm_people (
    tenant_id, full_name, email, phone, instagram, country, income_range, goal, obstacle, notes, created_at, updated_at
  ) VALUES (
    '520a4cfd-5183-4e11-aecc-bc71a52978b6',
    'Ali Almomin',
    'd.elanbr.90@hotmail.com',
    '0532873330',
    'Glory clinic',
    'Saudi Arabia',
    'Between $5k & $10k /mo',
    'F',
    'R',
    NULL,
    '2026-04-17T20:00:00.000Z',
    '2026-04-17T20:00:00.000Z'
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
  SELECT id FROM public.crm_people WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'd.elanbr.90@hotmail.com'
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
  'Almomin',
  'd.elanbr.90@hotmail.com',
  '0532873330',
  'Glory clinic',
  'Service Provider',
  'Between $5k & $10k /mo',
  'F',
  'R',
  true,
  'new',
  '{"first_name":"Ali","last_name":"Almomin","email":"d.elanbr.90@hotmail.com","phone":"0532873330","social_username":"Glory clinic","country":"Saudi Arabia","content_language":"","business_type":"Service Provider","monthly_income_range":"Between $5k & $10k /mo","goals_objectives":"F","obstacles":"R","call_attendance_confirmation":"Yes","status":"new","notes":"","date_added":"Apr 18, 2026"}'::jsonb,
  'Saudi Arabia',
  NULL,
  false,
  '2026-04-17T20:00:00.000Z',
  '2026-04-17T20:00:00.000Z'
WHERE NOT EXISTS (
  SELECT 1 FROM public.leads WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'd.elanbr.90@hotmail.com'
);

-- Lead 109:Abdulla Alyasi (abdullaaa@tripleaperfumes.com)
WITH inserted_person AS (
  INSERT INTO public.crm_people (
    tenant_id, full_name, email, phone, instagram, country, income_range, goal, obstacle, notes, created_at, updated_at
  ) VALUES (
    '520a4cfd-5183-4e11-aecc-bc71a52978b6',
    'Abdulla Alyasi',
    'abdullaaa@tripleaperfumes.com',
    '0526968683',
    'Itsalyasi',
    'United Arab Emirates',
    'More than $10k /mo',
    'I want to create content for Perfumes then direct this into generating awareness and sales for our brands and improve my personal branding online',
    'Creative direction, and shoot',
    NULL,
    '2026-04-17T20:00:00.000Z',
    '2026-04-17T20:00:00.000Z'
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
  SELECT id FROM public.crm_people WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'abdullaaa@tripleaperfumes.com'
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
  'Abdulla',
  'Alyasi',
  'abdullaaa@tripleaperfumes.com',
  '0526968683',
  'Itsalyasi',
  'Entrepreneur',
  'More than $10k /mo',
  'I want to create content for Perfumes then direct this into generating awareness and sales for our brands and improve my personal branding online',
  'Creative direction, and shoot',
  true,
  'new',
  '{"first_name":"Abdulla","last_name":"Alyasi","email":"abdullaaa@tripleaperfumes.com","phone":"0526968683","social_username":"Itsalyasi","country":"United Arab Emirates","content_language":"","business_type":"Entrepreneur","monthly_income_range":"More than $10k /mo","goals_objectives":"I want to create content for Perfumes then direct this into generating awareness and sales for our brands and improve my personal branding online","obstacles":"Creative direction, and shoot","call_attendance_confirmation":"Yes","status":"new","notes":"","date_added":"Apr 18, 2026"}'::jsonb,
  'United Arab Emirates',
  NULL,
  false,
  '2026-04-17T20:00:00.000Z',
  '2026-04-17T20:00:00.000Z'
WHERE NOT EXISTS (
  SELECT 1 FROM public.leads WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'abdullaaa@tripleaperfumes.com'
);

-- Lead 110:Joelle Raad (joelleraad@hotmail.com)
WITH inserted_person AS (
  INSERT INTO public.crm_people (
    tenant_id, full_name, email, phone, instagram, country, income_range, goal, obstacle, notes, created_at, updated_at
  ) VALUES (
    '520a4cfd-5183-4e11-aecc-bc71a52978b6',
    'Joelle Raad',
    'joelleraad@hotmail.com',
    '0505371775',
    'joelleraad.ae',
    'United Arab Emirates',
    'More than $10k /mo',
    'Build my brand',
    'Actual buyers',
    NULL,
    '2026-04-17T20:00:00.000Z',
    '2026-04-17T20:00:00.000Z'
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
  SELECT id FROM public.crm_people WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'joelleraad@hotmail.com'
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
  'Joelle',
  'Raad',
  'joelleraad@hotmail.com',
  '0505371775',
  'joelleraad.ae',
  'Luxury realestate selling',
  'More than $10k /mo',
  'Build my brand',
  'Actual buyers',
  true,
  'new',
  '{"first_name":"Joelle","last_name":"Raad","email":"joelleraad@hotmail.com","phone":"0505371775","social_username":"joelleraad.ae","country":"United Arab Emirates","content_language":"","business_type":"Luxury realestate selling","monthly_income_range":"More than $10k /mo","goals_objectives":"Build my brand","obstacles":"Actual buyers","call_attendance_confirmation":"Yes","status":"new","notes":"","date_added":"Apr 18, 2026"}'::jsonb,
  'United Arab Emirates',
  NULL,
  false,
  '2026-04-17T20:00:00.000Z',
  '2026-04-17T20:00:00.000Z'
WHERE NOT EXISTS (
  SELECT 1 FROM public.leads WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'joelleraad@hotmail.com'
);

-- Lead 111:Saleh Alsalehi (sssnm3@hotmail.com)
WITH inserted_person AS (
  INSERT INTO public.crm_people (
    tenant_id, full_name, email, phone, instagram, country, income_range, goal, obstacle, notes, created_at, updated_at
  ) VALUES (
    '520a4cfd-5183-4e11-aecc-bc71a52978b6',
    'Saleh Alsalehi',
    'sssnm3@hotmail.com',
    '+966550117711',
    '@saleh_moha8',
    'Saudi Arabia',
    'More than $10k /mo',
    'Content and production',
    'Production',
    NULL,
    '2026-04-17T20:00:00.000Z',
    '2026-04-17T20:00:00.000Z'
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
  SELECT id FROM public.crm_people WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'sssnm3@hotmail.com'
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
  'Saleh',
  'Alsalehi',
  'sssnm3@hotmail.com',
  '+966550117711',
  '@saleh_moha8',
  'Consultant',
  'More than $10k /mo',
  'Content and production',
  'Production',
  true,
  'new',
  '{"first_name":"Saleh","last_name":"Alsalehi","email":"sssnm3@hotmail.com","phone":"+966550117711","social_username":"@saleh_moha8","country":"Saudi Arabia","content_language":"","business_type":"Consultant","monthly_income_range":"More than $10k /mo","goals_objectives":"Content and production","obstacles":"Production","call_attendance_confirmation":"Yes","status":"new","notes":"","date_added":"Apr 18, 2026"}'::jsonb,
  'Saudi Arabia',
  NULL,
  false,
  '2026-04-17T20:00:00.000Z',
  '2026-04-17T20:00:00.000Z'
WHERE NOT EXISTS (
  SELECT 1 FROM public.leads WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'sssnm3@hotmail.com'
);

-- Lead 112:Manal Al Amoudi (dr.manal.alamoudi@gmail.com)
WITH inserted_person AS (
  INSERT INTO public.crm_people (
    tenant_id, full_name, email, phone, instagram, country, income_range, goal, obstacle, notes, created_at, updated_at
  ) VALUES (
    '520a4cfd-5183-4e11-aecc-bc71a52978b6',
    'Manal Al Amoudi',
    'dr.manal.alamoudi@gmail.com',
    '+966503696145',
    'Manal Al Amoudi',
    'Saudi Arabia',
    'More than $10k /mo',
    'Content spread',
    'Need more viewers and followers',
    NULL,
    '2026-04-17T20:00:00.000Z',
    '2026-04-17T20:00:00.000Z'
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
  SELECT id FROM public.crm_people WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'dr.manal.alamoudi@gmail.com'
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
  'Manal',
  'Al Amoudi',
  'dr.manal.alamoudi@gmail.com',
  '+966503696145',
  'Manal Al Amoudi',
  'Consultant',
  'More than $10k /mo',
  'Content spread',
  'Need more viewers and followers',
  true,
  'new',
  '{"first_name":"Manal","last_name":"Al Amoudi","email":"dr.manal.alamoudi@gmail.com","phone":"+966503696145","social_username":"Manal Al Amoudi","country":"Saudi Arabia","content_language":"","business_type":"Consultant","monthly_income_range":"More than $10k /mo","goals_objectives":"Content spread","obstacles":"Need more viewers and followers","call_attendance_confirmation":"Yes","status":"new","notes":"","date_added":"Apr 18, 2026"}'::jsonb,
  'Saudi Arabia',
  NULL,
  false,
  '2026-04-17T20:00:00.000Z',
  '2026-04-17T20:00:00.000Z'
WHERE NOT EXISTS (
  SELECT 1 FROM public.leads WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'dr.manal.alamoudi@gmail.com'
);

-- Lead 113:Osama Khan (dr.osamakh@outlook.com)
WITH inserted_person AS (
  INSERT INTO public.crm_people (
    tenant_id, full_name, email, phone, instagram, country, income_range, goal, obstacle, notes, created_at, updated_at
  ) VALUES (
    '520a4cfd-5183-4e11-aecc-bc71a52978b6',
    'Osama Khan',
    'dr.osamakh@outlook.com',
    '0591611744',
    '@drosamad',
    'Saudi Arabia',
    'Between $5k & $10k /mo',
    'I want to understand you business model to make sure we are able to work together. I want to grow in social media but sometimes it is difficult due to busy schedules',
    'Time
Growth plan',
    NULL,
    '2026-04-17T20:00:00.000Z',
    '2026-04-17T20:00:00.000Z'
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
  SELECT id FROM public.crm_people WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'dr.osamakh@outlook.com'
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
  'Osama',
  'Khan',
  'dr.osamakh@outlook.com',
  '0591611744',
  '@drosamad',
  'Doctor',
  'Between $5k & $10k /mo',
  'I want to understand you business model to make sure we are able to work together. I want to grow in social media but sometimes it is difficult due to busy schedules',
  'Time
Growth plan',
  true,
  'new',
  '{"first_name":"Osama","last_name":"Khan","email":"dr.osamakh@outlook.com","phone":"0591611744","social_username":"@drosamad","country":"Saudi Arabia","content_language":"","business_type":"Doctor","monthly_income_range":"Between $5k & $10k /mo","goals_objectives":"I want to understand you business model to make sure we are able to work together. I want to grow in social media but sometimes it is difficult due to busy schedules","obstacles":"Time\nGrowth plan","call_attendance_confirmation":"Yes","status":"new","notes":"","date_added":"Apr 18, 2026"}'::jsonb,
  'Saudi Arabia',
  NULL,
  false,
  '2026-04-17T20:00:00.000Z',
  '2026-04-17T20:00:00.000Z'
WHERE NOT EXISTS (
  SELECT 1 FROM public.leads WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'dr.osamakh@outlook.com'
);

-- Lead 114:Mohamed Al-Nassef (dralnassef@gmail.com)
WITH inserted_person AS (
  INSERT INTO public.crm_people (
    tenant_id, full_name, email, phone, instagram, country, income_range, goal, obstacle, notes, created_at, updated_at
  ) VALUES (
    '520a4cfd-5183-4e11-aecc-bc71a52978b6',
    'Mohamed Al-Nassef',
    'dralnassef@gmail.com',
    '966594172088',
    'i dont have',
    'Saudi Arabia',
    'Between $5k & $10k /mo',
    'social media profile',
    'no time',
    NULL,
    '2026-04-17T20:00:00.000Z',
    '2026-04-17T20:00:00.000Z'
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
  SELECT id FROM public.crm_people WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'dralnassef@gmail.com'
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
  'Al-Nassef',
  'dralnassef@gmail.com',
  '966594172088',
  'i dont have',
  'Doctor',
  'Between $5k & $10k /mo',
  'social media profile',
  'no time',
  true,
  'new',
  '{"first_name":"Mohamed","last_name":"Al-Nassef","email":"dralnassef@gmail.com","phone":"966594172088","social_username":"i dont have","country":"Saudi Arabia","content_language":"","business_type":"Doctor","monthly_income_range":"Between $5k & $10k /mo","goals_objectives":"social media profile","obstacles":"no time","call_attendance_confirmation":"Yes","status":"new","notes":"","date_added":"Apr 18, 2026"}'::jsonb,
  'Saudi Arabia',
  NULL,
  false,
  '2026-04-17T20:00:00.000Z',
  '2026-04-17T20:00:00.000Z'
WHERE NOT EXISTS (
  SELECT 1 FROM public.leads WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'dralnassef@gmail.com'
);

-- Lead 115:Dominique Samaha (ds4spineart@gmail.com)
WITH inserted_person AS (
  INSERT INTO public.crm_people (
    tenant_id, full_name, email, phone, instagram, country, income_range, goal, obstacle, notes, created_at, updated_at
  ) VALUES (
    '520a4cfd-5183-4e11-aecc-bc71a52978b6',
    'Dominique Samaha',
    'ds4spineart@gmail.com',
    '00966534974444',
    'ds4spineart',
    'Saudi Arabia',
    'More than $10k /mo',
    'Media exposure',
    'Time and professional set up',
    NULL,
    '2026-04-16T20:00:00.000Z',
    '2026-04-16T20:00:00.000Z'
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
  SELECT id FROM public.crm_people WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'ds4spineart@gmail.com'
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
  'Dominique',
  'Samaha',
  'ds4spineart@gmail.com',
  '00966534974444',
  'ds4spineart',
  'Doctor',
  'More than $10k /mo',
  'Media exposure',
  'Time and professional set up',
  true,
  'new',
  '{"first_name":"Dominique","last_name":"Samaha","email":"ds4spineart@gmail.com","phone":"00966534974444","social_username":"ds4spineart","country":"Saudi Arabia","content_language":"","business_type":"Doctor","monthly_income_range":"More than $10k /mo","goals_objectives":"Media exposure","obstacles":"Time and professional set up","call_attendance_confirmation":"Yes","status":"new","notes":"","date_added":"Apr 17, 2026"}'::jsonb,
  'Saudi Arabia',
  NULL,
  false,
  '2026-04-16T20:00:00.000Z',
  '2026-04-16T20:00:00.000Z'
WHERE NOT EXISTS (
  SELECT 1 FROM public.leads WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'ds4spineart@gmail.com'
);

-- Lead 116:Rabea Akram (rabea204@hotmail.com)
WITH inserted_person AS (
  INSERT INTO public.crm_people (
    tenant_id, full_name, email, phone, instagram, country, income_range, goal, obstacle, notes, created_at, updated_at
  ) VALUES (
    '520a4cfd-5183-4e11-aecc-bc71a52978b6',
    'Rabea Akram',
    'rabea204@hotmail.com',
    '+966554500296',
    '@dr.rabeaakram',
    'Saudi Arabia',
    'Between $5k & $10k /mo',
    'Content creation, videos, all social media content',
    'Not happy with the results until now',
    NULL,
    '2026-04-16T20:00:00.000Z',
    '2026-04-16T20:00:00.000Z'
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
  SELECT id FROM public.crm_people WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'rabea204@hotmail.com'
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
  'Rabea',
  'Akram',
  'rabea204@hotmail.com',
  '+966554500296',
  '@dr.rabeaakram',
  'Doctor',
  'Between $5k & $10k /mo',
  'Content creation, videos, all social media content',
  'Not happy with the results until now',
  true,
  'new',
  '{"first_name":"Rabea","last_name":"Akram","email":"rabea204@hotmail.com","phone":"+966554500296","social_username":"@dr.rabeaakram","country":"Saudi Arabia","content_language":"","business_type":"Doctor","monthly_income_range":"Between $5k & $10k /mo","goals_objectives":"Content creation, videos, all social media content","obstacles":"Not happy with the results until now","call_attendance_confirmation":"Yes","status":"new","notes":"","date_added":"Apr 17, 2026"}'::jsonb,
  'Saudi Arabia',
  NULL,
  false,
  '2026-04-16T20:00:00.000Z',
  '2026-04-16T20:00:00.000Z'
WHERE NOT EXISTS (
  SELECT 1 FROM public.leads WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'rabea204@hotmail.com'
);

-- Lead 117:Sanaa Sulimani (sana2.sulimani@hotmail.com)
WITH inserted_person AS (
  INSERT INTO public.crm_people (
    tenant_id, full_name, email, phone, instagram, country, income_range, goal, obstacle, notes, created_at, updated_at
  ) VALUES (
    '520a4cfd-5183-4e11-aecc-bc71a52978b6',
    'Sanaa Sulimani',
    'sana2.sulimani@hotmail.com',
    '+966540367589',
    'Dr.s',
    'Saudi Arabia',
    'More than $10k /mo',
    'People to know me',
    'Shy',
    NULL,
    '2026-04-16T20:00:00.000Z',
    '2026-04-16T20:00:00.000Z'
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
  SELECT id FROM public.crm_people WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'sana2.sulimani@hotmail.com'
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
  'Sanaa',
  'Sulimani',
  'sana2.sulimani@hotmail.com',
  '+966540367589',
  'Dr.s',
  'Doctor',
  'More than $10k /mo',
  'People to know me',
  'Shy',
  true,
  'new',
  '{"first_name":"Sanaa","last_name":"Sulimani","email":"sana2.sulimani@hotmail.com","phone":"+966540367589","social_username":"Dr.s","country":"Saudi Arabia","content_language":"","business_type":"Doctor","monthly_income_range":"More than $10k /mo","goals_objectives":"People to know me","obstacles":"Shy","call_attendance_confirmation":"Yes","status":"new","notes":"","date_added":"Apr 17, 2026"}'::jsonb,
  'Saudi Arabia',
  NULL,
  false,
  '2026-04-16T20:00:00.000Z',
  '2026-04-16T20:00:00.000Z'
WHERE NOT EXISTS (
  SELECT 1 FROM public.leads WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'sana2.sulimani@hotmail.com'
);

-- Lead 118:Mohaned Salih (mohaneds45@hotmail.com)
WITH inserted_person AS (
  INSERT INTO public.crm_people (
    tenant_id, full_name, email, phone, instagram, country, income_range, goal, obstacle, notes, created_at, updated_at
  ) VALUES (
    '520a4cfd-5183-4e11-aecc-bc71a52978b6',
    'Mohaned Salih',
    'mohaneds45@hotmail.com',
    '+971509755947',
    'Therealmohaned_',
    'United Arab Emirates',
    'Between $5k & $10k /mo',
    'Branding and getting my name out there in real estate, organic views and leads',
    'Don’t have a team who can take care of this side of the business',
    NULL,
    '2026-04-16T20:00:00.000Z',
    '2026-04-16T20:00:00.000Z'
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
  SELECT id FROM public.crm_people WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'mohaneds45@hotmail.com'
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
  'Mohaned',
  'Salih',
  'mohaneds45@hotmail.com',
  '+971509755947',
  'Therealmohaned_',
  'Consultant',
  'Between $5k & $10k /mo',
  'Branding and getting my name out there in real estate, organic views and leads',
  'Don’t have a team who can take care of this side of the business',
  true,
  'new',
  '{"first_name":"Mohaned","last_name":"Salih","email":"mohaneds45@hotmail.com","phone":"+971509755947","social_username":"Therealmohaned_","country":"United Arab Emirates","content_language":"","business_type":"Consultant","monthly_income_range":"Between $5k & $10k /mo","goals_objectives":"Branding and getting my name out there in real estate, organic views and leads","obstacles":"Don’t have a team who can take care of this side of the business","call_attendance_confirmation":"Yes","status":"new","notes":"","date_added":"Apr 17, 2026"}'::jsonb,
  'United Arab Emirates',
  NULL,
  false,
  '2026-04-16T20:00:00.000Z',
  '2026-04-16T20:00:00.000Z'
WHERE NOT EXISTS (
  SELECT 1 FROM public.leads WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'mohaneds45@hotmail.com'
);

-- Lead 119:Marwa Eid (dr.marwa40@yahoo.com)
WITH inserted_person AS (
  INSERT INTO public.crm_people (
    tenant_id, full_name, email, phone, instagram, country, income_range, goal, obstacle, notes, created_at, updated_at
  ) VALUES (
    '520a4cfd-5183-4e11-aecc-bc71a52978b6',
    'Marwa Eid',
    'dr.marwa40@yahoo.com',
    '971547002600',
    'Dr.marwa.eid',
    'United Arab Emirates',
    'More than $10k /mo',
    'Marketing plan to have more patients, more true followers and to be more famous',
    'I need creative team to have creative attractive content on social media',
    NULL,
    '2026-04-16T20:00:00.000Z',
    '2026-04-16T20:00:00.000Z'
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
  '971547002600',
  'Dr.marwa.eid',
  'Doctor',
  'More than $10k /mo',
  'Marketing plan to have more patients, more true followers and to be more famous',
  'I need creative team to have creative attractive content on social media',
  true,
  'new',
  '{"first_name":"Marwa","last_name":"Eid","email":"dr.marwa40@yahoo.com","phone":"971547002600","social_username":"Dr.marwa.eid","country":"United Arab Emirates","content_language":"","business_type":"Doctor","monthly_income_range":"More than $10k /mo","goals_objectives":"Marketing plan to have more patients, more true followers and to be more famous","obstacles":"I need creative team to have creative attractive content on social media","call_attendance_confirmation":"Yes","status":"new","notes":"","date_added":"Apr 17, 2026"}'::jsonb,
  'United Arab Emirates',
  NULL,
  false,
  '2026-04-16T20:00:00.000Z',
  '2026-04-16T20:00:00.000Z'
WHERE NOT EXISTS (
  SELECT 1 FROM public.leads WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'dr.marwa40@yahoo.com'
);

-- Lead 120:Dr. Sami Alyami (samialyami@hotmail.com)
WITH inserted_person AS (
  INSERT INTO public.crm_people (
    tenant_id, full_name, email, phone, instagram, country, income_range, goal, obstacle, notes, created_at, updated_at
  ) VALUES (
    '520a4cfd-5183-4e11-aecc-bc71a52978b6',
    'Dr. Sami Alyami',
    'samialyami@hotmail.com',
    '+966558888224',
    '@drsamialyami_subat',
    'Saudi Arabia',
    'More than $10k /mo',
    'More spread of name and services',
    'Busy',
    NULL,
    '2026-04-16T20:00:00.000Z',
    '2026-04-16T20:00:00.000Z'
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
  SELECT id FROM public.crm_people WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'samialyami@hotmail.com'
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
  'Dr. Sami',
  'Alyami',
  'samialyami@hotmail.com',
  '+966558888224',
  '@drsamialyami_subat',
  'Doctor',
  'More than $10k /mo',
  'More spread of name and services',
  'Busy',
  true,
  'new',
  '{"first_name":"Dr. Sami","last_name":"Alyami","email":"samialyami@hotmail.com","phone":"+966558888224","social_username":"@drsamialyami_subat","country":"Saudi Arabia","content_language":"","business_type":"Doctor","monthly_income_range":"More than $10k /mo","goals_objectives":"More spread of name and services","obstacles":"Busy","call_attendance_confirmation":"Yes","status":"new","notes":"","date_added":"Apr 17, 2026"}'::jsonb,
  'Saudi Arabia',
  NULL,
  false,
  '2026-04-16T20:00:00.000Z',
  '2026-04-16T20:00:00.000Z'
WHERE NOT EXISTS (
  SELECT 1 FROM public.leads WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'samialyami@hotmail.com'
);

-- Lead 121:Saud Binjudiaan (saudbinjudiaan@hotmail.com)
WITH inserted_person AS (
  INSERT INTO public.crm_people (
    tenant_id, full_name, email, phone, instagram, country, income_range, goal, obstacle, notes, created_at, updated_at
  ) VALUES (
    '520a4cfd-5183-4e11-aecc-bc71a52978b6',
    'Saud Binjudiaan',
    'saudbinjudiaan@hotmail.com',
    '+966562151717',
    '.',
    'Saudi Arabia',
    'Between $5k & $10k /mo',
    'More patient in my clinic',
    'No time to advirtise my self',
    NULL,
    '2026-04-16T20:00:00.000Z',
    '2026-04-16T20:00:00.000Z'
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
  SELECT id FROM public.crm_people WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'saudbinjudiaan@hotmail.com'
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
  'Saud',
  'Binjudiaan',
  'saudbinjudiaan@hotmail.com',
  '+966562151717',
  '.',
  'Doctor, Consultant',
  'Between $5k & $10k /mo',
  'More patient in my clinic',
  'No time to advirtise my self',
  true,
  'new',
  '{"first_name":"Saud","last_name":"Binjudiaan","email":"saudbinjudiaan@hotmail.com","phone":"+966562151717","social_username":".","country":"Saudi Arabia","content_language":"","business_type":"Doctor, Consultant","monthly_income_range":"Between $5k & $10k /mo","goals_objectives":"More patient in my clinic","obstacles":"No time to advirtise my self","call_attendance_confirmation":"Yes","status":"new","notes":"","date_added":"Apr 17, 2026"}'::jsonb,
  'Saudi Arabia',
  NULL,
  false,
  '2026-04-16T20:00:00.000Z',
  '2026-04-16T20:00:00.000Z'
WHERE NOT EXISTS (
  SELECT 1 FROM public.leads WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'saudbinjudiaan@hotmail.com'
);

-- Lead 122:Abdullah Almahmoud (abdullahfjalmahmoud@gmail.com)
WITH inserted_person AS (
  INSERT INTO public.crm_people (
    tenant_id, full_name, email, phone, instagram, country, income_range, goal, obstacle, notes, created_at, updated_at
  ) VALUES (
    '520a4cfd-5183-4e11-aecc-bc71a52978b6',
    'Abdullah Almahmoud',
    'abdullahfjalmahmoud@gmail.com',
    '+966552982703',
    'abdullahalmahmoud_',
    'Saudi Arabia',
    'More than $10k /mo',
    'Address public spreading education and awareness',
    'Been famous enough',
    NULL,
    '2026-04-16T20:00:00.000Z',
    '2026-04-16T20:00:00.000Z'
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
  SELECT id FROM public.crm_people WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'abdullahfjalmahmoud@gmail.com'
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
  'Almahmoud',
  'abdullahfjalmahmoud@gmail.com',
  '+966552982703',
  'abdullahalmahmoud_',
  'Consultant, Doctor',
  'More than $10k /mo',
  'Address public spreading education and awareness',
  'Been famous enough',
  true,
  'qualified',
  '{"first_name":"Abdullah","last_name":"Almahmoud","email":"abdullahfjalmahmoud@gmail.com","phone":"+966552982703","social_username":"abdullahalmahmoud_","country":"Saudi Arabia","content_language":"","business_type":"Consultant, Doctor","monthly_income_range":"More than $10k /mo","goals_objectives":"Address public spreading education and awareness","obstacles":"Been famous enough","call_attendance_confirmation":"Yes","status":"qualified","notes":"","date_added":"Apr 17, 2026"}'::jsonb,
  'Saudi Arabia',
  NULL,
  false,
  '2026-04-16T20:00:00.000Z',
  '2026-04-16T20:00:00.000Z'
WHERE NOT EXISTS (
  SELECT 1 FROM public.leads WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'abdullahfjalmahmoud@gmail.com'
);

-- Lead 123:Mohammad Hamdan (doctorhamdan@gmail.com)
WITH inserted_person AS (
  INSERT INTO public.crm_people (
    tenant_id, full_name, email, phone, instagram, country, income_range, goal, obstacle, notes, created_at, updated_at
  ) VALUES (
    '520a4cfd-5183-4e11-aecc-bc71a52978b6',
    'Mohammad Hamdan',
    'doctorhamdan@gmail.com',
    '+966560556946',
    'Hamdan_dermatology',
    'Saudi Arabia',
    'Between $5k & $10k /mo',
    'Fame 
Followers
Higher load of patients',
    'No idea',
    NULL,
    '2026-04-16T20:00:00.000Z',
    '2026-04-16T20:00:00.000Z'
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
  SELECT id FROM public.crm_people WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'doctorhamdan@gmail.com'
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
  'Hamdan',
  'doctorhamdan@gmail.com',
  '+966560556946',
  'Hamdan_dermatology',
  'Doctor',
  'Between $5k & $10k /mo',
  'Fame 
Followers
Higher load of patients',
  'No idea',
  true,
  'new',
  '{"first_name":"Mohammad","last_name":"Hamdan","email":"doctorhamdan@gmail.com","phone":"+966560556946","social_username":"Hamdan_dermatology","country":"Saudi Arabia","content_language":"","business_type":"Doctor","monthly_income_range":"Between $5k & $10k /mo","goals_objectives":"Fame \nFollowers\nHigher load of patients","obstacles":"No idea","call_attendance_confirmation":"Yes","status":"new","notes":"","date_added":"Apr 17, 2026"}'::jsonb,
  'Saudi Arabia',
  NULL,
  false,
  '2026-04-16T20:00:00.000Z',
  '2026-04-16T20:00:00.000Z'
WHERE NOT EXISTS (
  SELECT 1 FROM public.leads WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'doctorhamdan@gmail.com'
);

-- Lead 124:Ahmed Hijazi (pt.ahmedhijazi@gmail.com)
WITH inserted_person AS (
  INSERT INTO public.crm_people (
    tenant_id, full_name, email, phone, instagram, country, income_range, goal, obstacle, notes, created_at, updated_at
  ) VALUES (
    '520a4cfd-5183-4e11-aecc-bc71a52978b6',
    'Ahmed Hijazi',
    'pt.ahmedhijazi@gmail.com',
    '+966540910917',
    'Don’t have',
    'Saudi Arabia',
    'Between $5k & $10k /mo',
    'Make a professional page in social media',
    'How i start a unique journey',
    NULL,
    '2026-04-16T20:00:00.000Z',
    '2026-04-16T20:00:00.000Z'
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
  SELECT id FROM public.crm_people WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'pt.ahmedhijazi@gmail.com'
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
  'Hijazi',
  'pt.ahmedhijazi@gmail.com',
  '+966540910917',
  'Don’t have',
  'Doctor',
  'Between $5k & $10k /mo',
  'Make a professional page in social media',
  'How i start a unique journey',
  true,
  'new',
  '{"first_name":"Ahmed","last_name":"Hijazi","email":"pt.ahmedhijazi@gmail.com","phone":"+966540910917","social_username":"Don’t have","country":"Saudi Arabia","content_language":"","business_type":"Doctor","monthly_income_range":"Between $5k & $10k /mo","goals_objectives":"Make a professional page in social media","obstacles":"How i start a unique journey","call_attendance_confirmation":"Yes","status":"new","notes":"","date_added":"Apr 17, 2026"}'::jsonb,
  'Saudi Arabia',
  NULL,
  false,
  '2026-04-16T20:00:00.000Z',
  '2026-04-16T20:00:00.000Z'
WHERE NOT EXISTS (
  SELECT 1 FROM public.leads WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'pt.ahmedhijazi@gmail.com'
);

-- Lead 125:Bader Aldawsari (badermd37@gmail.com)
WITH inserted_person AS (
  INSERT INTO public.crm_people (
    tenant_id, full_name, email, phone, instagram, country, income_range, goal, obstacle, notes, created_at, updated_at
  ) VALUES (
    '520a4cfd-5183-4e11-aecc-bc71a52978b6',
    'Bader Aldawsari',
    'badermd37@gmail.com',
    '+966546001482',
    '@baderOMP',
    'Saudi Arabia',
    'Between $5k & $10k /mo',
    'Raise awareness about my speciality 
Become well known in the field of oral medicine and pathology 
Increase followers and patient follow',
    'No awareness about the speciality 
Less flow of parient',
    NULL,
    '2026-04-16T20:00:00.000Z',
    '2026-04-16T20:00:00.000Z'
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
  SELECT id FROM public.crm_people WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'badermd37@gmail.com'
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
  'Bader',
  'Aldawsari',
  'badermd37@gmail.com',
  '+966546001482',
  '@baderOMP',
  'Doctor',
  'Between $5k & $10k /mo',
  'Raise awareness about my speciality 
Become well known in the field of oral medicine and pathology 
Increase followers and patient follow',
  'No awareness about the speciality 
Less flow of parient',
  true,
  'new',
  '{"first_name":"Bader","last_name":"Aldawsari","email":"badermd37@gmail.com","phone":"+966546001482","social_username":"@baderOMP","country":"Saudi Arabia","content_language":"","business_type":"Doctor","monthly_income_range":"Between $5k & $10k /mo","goals_objectives":"Raise awareness about my speciality \nBecome well known in the field of oral medicine and pathology \nIncrease followers and patient follow","obstacles":"No awareness about the speciality \nLess flow of parient","call_attendance_confirmation":"Yes","status":"new","notes":"","date_added":"Apr 17, 2026"}'::jsonb,
  'Saudi Arabia',
  NULL,
  false,
  '2026-04-16T20:00:00.000Z',
  '2026-04-16T20:00:00.000Z'
WHERE NOT EXISTS (
  SELECT 1 FROM public.leads WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'badermd37@gmail.com'
);

-- Lead 126:Omar Ahmed (omar-0757@hotmail.com)
WITH inserted_person AS (
  INSERT INTO public.crm_people (
    tenant_id, full_name, email, phone, instagram, country, income_range, goal, obstacle, notes, created_at, updated_at
  ) VALUES (
    '520a4cfd-5183-4e11-aecc-bc71a52978b6',
    'Omar Ahmed',
    'omar-0757@hotmail.com',
    '+966548690757',
    'Dr.3mar',
    'Saudi Arabia',
    'More than $10k /mo',
    'Share my knowledge',
    'Expressing my self in good way',
    NULL,
    '2026-04-16T20:00:00.000Z',
    '2026-04-16T20:00:00.000Z'
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
  SELECT id FROM public.crm_people WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'omar-0757@hotmail.com'
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
  'Ahmed',
  'omar-0757@hotmail.com',
  '+966548690757',
  'Dr.3mar',
  'Consultant',
  'More than $10k /mo',
  'Share my knowledge',
  'Expressing my self in good way',
  true,
  'new',
  '{"first_name":"Omar","last_name":"Ahmed","email":"omar-0757@hotmail.com","phone":"+966548690757","social_username":"Dr.3mar","country":"Saudi Arabia","content_language":"","business_type":"Consultant","monthly_income_range":"More than $10k /mo","goals_objectives":"Share my knowledge","obstacles":"Expressing my self in good way","call_attendance_confirmation":"Yes","status":"new","notes":"","date_added":"Apr 17, 2026"}'::jsonb,
  'Saudi Arabia',
  NULL,
  false,
  '2026-04-16T20:00:00.000Z',
  '2026-04-16T20:00:00.000Z'
WHERE NOT EXISTS (
  SELECT 1 FROM public.leads WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'omar-0757@hotmail.com'
);

-- Lead 127:Laleh Astaneh (laleh_adt@yahoo.com)
WITH inserted_person AS (
  INSERT INTO public.crm_people (
    tenant_id, full_name, email, phone, instagram, country, income_range, goal, obstacle, notes, created_at, updated_at
  ) VALUES (
    '520a4cfd-5183-4e11-aecc-bc71a52978b6',
    'Laleh Astaneh',
    'laleh_adt@yahoo.com',
    '00971509200838',
    'Gh',
    'United Arab Emirates',
    'More than $10k /mo',
    'More visibility',
    'Visibility',
    NULL,
    '2026-04-16T20:00:00.000Z',
    '2026-04-16T20:00:00.000Z'
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
  SELECT id FROM public.crm_people WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'laleh_adt@yahoo.com'
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
  'Laleh',
  'Astaneh',
  'laleh_adt@yahoo.com',
  '00971509200838',
  'Gh',
  'Physical therapy',
  'More than $10k /mo',
  'More visibility',
  'Visibility',
  true,
  'new',
  '{"first_name":"Laleh","last_name":"Astaneh","email":"laleh_adt@yahoo.com","phone":"00971509200838","social_username":"Gh","country":"United Arab Emirates","content_language":"","business_type":"Physical therapy","monthly_income_range":"More than $10k /mo","goals_objectives":"More visibility","obstacles":"Visibility","call_attendance_confirmation":"Yes","status":"new","notes":"","date_added":"Apr 17, 2026"}'::jsonb,
  'United Arab Emirates',
  NULL,
  false,
  '2026-04-16T20:00:00.000Z',
  '2026-04-16T20:00:00.000Z'
WHERE NOT EXISTS (
  SELECT 1 FROM public.leads WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'laleh_adt@yahoo.com'
);

-- Lead 128:Mouhamed Hamdi (hamdi.m1@hotmail.com)
WITH inserted_person AS (
  INSERT INTO public.crm_people (
    tenant_id, full_name, email, phone, instagram, country, income_range, goal, obstacle, notes, created_at, updated_at
  ) VALUES (
    '520a4cfd-5183-4e11-aecc-bc71a52978b6',
    'Mouhamed Hamdi',
    'hamdi.m1@hotmail.com',
    '+44 7438 282881',
    'Drmouhamedhamdi',
    'United Kingdom of Great Britain and Northern Ireland (the)',
    'Between $5k & $10k /mo',
    'Let’s talk and see',
    'Nothing- im looking for the right agency to start with',
    NULL,
    '2026-04-15T20:00:00.000Z',
    '2026-04-15T20:00:00.000Z'
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
  SELECT id FROM public.crm_people WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'hamdi.m1@hotmail.com'
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
  'Mouhamed',
  'Hamdi',
  'hamdi.m1@hotmail.com',
  '+44 7438 282881',
  'Drmouhamedhamdi',
  'Doctor',
  'Between $5k & $10k /mo',
  'Let’s talk and see',
  'Nothing- im looking for the right agency to start with',
  true,
  'new',
  '{"first_name":"Mouhamed","last_name":"Hamdi","email":"hamdi.m1@hotmail.com","phone":"+44 7438 282881","social_username":"Drmouhamedhamdi","country":"United Kingdom of Great Britain and Northern Ireland (the)","content_language":"","business_type":"Doctor","monthly_income_range":"Between $5k & $10k /mo","goals_objectives":"Let’s talk and see","obstacles":"Nothing- im looking for the right agency to start with","call_attendance_confirmation":"Yes","status":"new","notes":"","date_added":"Apr 16, 2026"}'::jsonb,
  'United Kingdom of Great Britain and Northern Ireland (the)',
  NULL,
  false,
  '2026-04-15T20:00:00.000Z',
  '2026-04-15T20:00:00.000Z'
WHERE NOT EXISTS (
  SELECT 1 FROM public.leads WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'hamdi.m1@hotmail.com'
);

-- Lead 129:Lina Baabbad (lina.baabbad@gmail.com)
WITH inserted_person AS (
  INSERT INTO public.crm_people (
    tenant_id, full_name, email, phone, instagram, country, income_range, goal, obstacle, notes, created_at, updated_at
  ) VALUES (
    '520a4cfd-5183-4e11-aecc-bc71a52978b6',
    'Lina Baabbad',
    'lina.baabbad@gmail.com',
    '966541800009',
    'Lina.baabbad',
    'Saudi Arabia',
    'More than $10k /mo',
    'build a strong personal brand as a leading OB-GYN and cosmetic gynecology',
    'Time',
    NULL,
    '2026-04-15T20:00:00.000Z',
    '2026-04-15T20:00:00.000Z'
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
  'Lina.baabbad',
  'Doctor',
  'More than $10k /mo',
  'build a strong personal brand as a leading OB-GYN and cosmetic gynecology',
  'Time',
  true,
  'new',
  '{"first_name":"Lina","last_name":"Baabbad","email":"lina.baabbad@gmail.com","phone":"966541800009","social_username":"Lina.baabbad","country":"Saudi Arabia","content_language":"","business_type":"Doctor","monthly_income_range":"More than $10k /mo","goals_objectives":"build a strong personal brand as a leading OB-GYN and cosmetic gynecology","obstacles":"Time","call_attendance_confirmation":"Yes","status":"new","notes":"","date_added":"Apr 16, 2026"}'::jsonb,
  'Saudi Arabia',
  NULL,
  false,
  '2026-04-15T20:00:00.000Z',
  '2026-04-15T20:00:00.000Z'
WHERE NOT EXISTS (
  SELECT 1 FROM public.leads WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'lina.baabbad@gmail.com'
);

-- Lead 130:Nada Alghamdi (dr.derma.sa@gmail.com)
WITH inserted_person AS (
  INSERT INTO public.crm_people (
    tenant_id, full_name, email, phone, instagram, country, income_range, goal, obstacle, notes, created_at, updated_at
  ) VALUES (
    '520a4cfd-5183-4e11-aecc-bc71a52978b6',
    'Nada Alghamdi',
    'dr.derma.sa@gmail.com',
    '0503405533',
    'Drnadaalghamdi',
    'Saudi Arabia',
    'Between $5k & $10k /mo',
    'More spread more followers more bookings',
    'Busy missing creative reels',
    NULL,
    '2026-04-15T20:00:00.000Z',
    '2026-04-15T20:00:00.000Z'
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
  SELECT id FROM public.crm_people WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'dr.derma.sa@gmail.com'
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
  'Nada',
  'Alghamdi',
  'dr.derma.sa@gmail.com',
  '0503405533',
  'Drnadaalghamdi',
  'Doctor',
  'Between $5k & $10k /mo',
  'More spread more followers more bookings',
  'Busy missing creative reels',
  true,
  'new',
  '{"first_name":"Nada","last_name":"Alghamdi","email":"dr.derma.sa@gmail.com","phone":"0503405533","social_username":"Drnadaalghamdi","country":"Saudi Arabia","content_language":"","business_type":"Doctor","monthly_income_range":"Between $5k & $10k /mo","goals_objectives":"More spread more followers more bookings","obstacles":"Busy missing creative reels","call_attendance_confirmation":"Yes","status":"new","notes":"","date_added":"Apr 16, 2026"}'::jsonb,
  'Saudi Arabia',
  NULL,
  false,
  '2026-04-15T20:00:00.000Z',
  '2026-04-15T20:00:00.000Z'
WHERE NOT EXISTS (
  SELECT 1 FROM public.leads WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'dr.derma.sa@gmail.com'
);

-- Lead 131:Danya Aldahan (aldahandanya@gmail.com)
WITH inserted_person AS (
  INSERT INTO public.crm_people (
    tenant_id, full_name, email, phone, instagram, country, income_range, goal, obstacle, notes, created_at, updated_at
  ) VALUES (
    '520a4cfd-5183-4e11-aecc-bc71a52978b6',
    'Danya Aldahan',
    'aldahandanya@gmail.com',
    '00966548903219',
    'Dr.danyaladahan@gmail.com',
    'Saudi Arabia',
    'Between $5k & $10k /mo',
    'To be known by patients',
    'Difficulty filming, editing and posting',
    NULL,
    '2026-04-15T20:00:00.000Z',
    '2026-04-15T20:00:00.000Z'
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
  SELECT id FROM public.crm_people WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'aldahandanya@gmail.com'
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
  'Danya',
  'Aldahan',
  'aldahandanya@gmail.com',
  '00966548903219',
  'Dr.danyaladahan@gmail.com',
  'Doctor',
  'Between $5k & $10k /mo',
  'To be known by patients',
  'Difficulty filming, editing and posting',
  true,
  'new',
  '{"first_name":"Danya","last_name":"Aldahan","email":"aldahandanya@gmail.com","phone":"00966548903219","social_username":"Dr.danyaladahan@gmail.com","country":"Saudi Arabia","content_language":"","business_type":"Doctor","monthly_income_range":"Between $5k & $10k /mo","goals_objectives":"To be known by patients","obstacles":"Difficulty filming, editing and posting","call_attendance_confirmation":"Yes","status":"new","notes":"","date_added":"Apr 16, 2026"}'::jsonb,
  'Saudi Arabia',
  NULL,
  false,
  '2026-04-15T20:00:00.000Z',
  '2026-04-15T20:00:00.000Z'
WHERE NOT EXISTS (
  SELECT 1 FROM public.leads WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'aldahandanya@gmail.com'
);

-- Lead 132:Munna Mansoor (vallilmansoor@yahoo.com)
WITH inserted_person AS (
  INSERT INTO public.crm_people (
    tenant_id, full_name, email, phone, instagram, country, income_range, goal, obstacle, notes, created_at, updated_at
  ) VALUES (
    '520a4cfd-5183-4e11-aecc-bc71a52978b6',
    'Munna Mansoor',
    'vallilmansoor@yahoo.com',
    '0503721625',
    'Mansoor',
    'United Arab Emirates',
    'Between $5k & $10k /mo',
    'Online presence',
    'Camera fear',
    NULL,
    '2026-04-15T20:00:00.000Z',
    '2026-04-15T20:00:00.000Z'
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
  SELECT id FROM public.crm_people WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'vallilmansoor@yahoo.com'
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
  'Munna',
  'Mansoor',
  'vallilmansoor@yahoo.com',
  '0503721625',
  'Mansoor',
  'Doctor',
  'Between $5k & $10k /mo',
  'Online presence',
  'Camera fear',
  true,
  'new',
  '{"first_name":"Munna","last_name":"Mansoor","email":"vallilmansoor@yahoo.com","phone":"0503721625","social_username":"Mansoor","country":"United Arab Emirates","content_language":"","business_type":"Doctor","monthly_income_range":"Between $5k & $10k /mo","goals_objectives":"Online presence","obstacles":"Camera fear","call_attendance_confirmation":"Yes","status":"new","notes":"","date_added":"Apr 16, 2026"}'::jsonb,
  'United Arab Emirates',
  NULL,
  false,
  '2026-04-15T20:00:00.000Z',
  '2026-04-15T20:00:00.000Z'
WHERE NOT EXISTS (
  SELECT 1 FROM public.leads WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'vallilmansoor@yahoo.com'
);

-- Lead 133:Danya Aldahan (dr.aldahan@gmail.com)
WITH inserted_person AS (
  INSERT INTO public.crm_people (
    tenant_id, full_name, email, phone, instagram, country, income_range, goal, obstacle, notes, created_at, updated_at
  ) VALUES (
    '520a4cfd-5183-4e11-aecc-bc71a52978b6',
    'Danya Aldahan',
    'dr.aldahan@gmail.com',
    '00966548903219',
    'Dr.danyaaldahan',
    'Saudi Arabia',
    'Between $5k & $10k /mo',
    'Build a client base and get known in the field',
    'I have difficulty recording, editing and  posting',
    NULL,
    '2026-04-15T20:00:00.000Z',
    '2026-04-15T20:00:00.000Z'
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
  SELECT id FROM public.crm_people WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'dr.aldahan@gmail.com'
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
  'Danya',
  'Aldahan',
  'dr.aldahan@gmail.com',
  '00966548903219',
  'Dr.danyaaldahan',
  'Doctor',
  'Between $5k & $10k /mo',
  'Build a client base and get known in the field',
  'I have difficulty recording, editing and  posting',
  true,
  'new',
  '{"first_name":"Danya","last_name":"Aldahan","email":"dr.aldahan@gmail.com","phone":"00966548903219","social_username":"Dr.danyaaldahan","country":"Saudi Arabia","content_language":"","business_type":"Doctor","monthly_income_range":"Between $5k & $10k /mo","goals_objectives":"Build a client base and get known in the field","obstacles":"I have difficulty recording, editing and  posting","call_attendance_confirmation":"Yes","status":"new","notes":"","date_added":"Apr 16, 2026"}'::jsonb,
  'Saudi Arabia',
  NULL,
  false,
  '2026-04-15T20:00:00.000Z',
  '2026-04-15T20:00:00.000Z'
WHERE NOT EXISTS (
  SELECT 1 FROM public.leads WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'dr.aldahan@gmail.com'
);

-- Lead 134:Maan Abuzaid (dr.maanabuzaid@gmail.com)
WITH inserted_person AS (
  INSERT INTO public.crm_people (
    tenant_id, full_name, email, phone, instagram, country, income_range, goal, obstacle, notes, created_at, updated_at
  ) VALUES (
    '520a4cfd-5183-4e11-aecc-bc71a52978b6',
    'Maan Abuzaid',
    'dr.maanabuzaid@gmail.com',
    '00966504383820',
    'https://snapchat.com/t/aclKIRKl',
    'Saudi Arabia',
    'More than $10k /mo',
    'More followers 
To reach to more people',
    'The time 
Content 
Technical issues',
    NULL,
    '2026-04-15T20:00:00.000Z',
    '2026-04-15T20:00:00.000Z'
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
  SELECT id FROM public.crm_people WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'dr.maanabuzaid@gmail.com'
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
  'Maan',
  'Abuzaid',
  'dr.maanabuzaid@gmail.com',
  '00966504383820',
  'https://snapchat.com/t/aclKIRKl',
  'Doctor',
  'More than $10k /mo',
  'More followers 
To reach to more people',
  'The time 
Content 
Technical issues',
  true,
  'new',
  '{"first_name":"Maan","last_name":"Abuzaid","email":"dr.maanabuzaid@gmail.com","phone":"00966504383820","social_username":"https://snapchat.com/t/aclKIRKl","country":"Saudi Arabia","content_language":"","business_type":"Doctor","monthly_income_range":"More than $10k /mo","goals_objectives":"More followers \nTo reach to more people","obstacles":"The time \nContent \nTechnical issues","call_attendance_confirmation":"Yes","status":"new","notes":"","date_added":"Apr 16, 2026"}'::jsonb,
  'Saudi Arabia',
  NULL,
  false,
  '2026-04-15T20:00:00.000Z',
  '2026-04-15T20:00:00.000Z'
WHERE NOT EXISTS (
  SELECT 1 FROM public.leads WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'dr.maanabuzaid@gmail.com'
);

-- Lead 135:Rahul Raj (rahulrajnestef@gmail.com)
WITH inserted_person AS (
  INSERT INTO public.crm_people (
    tenant_id, full_name, email, phone, instagram, country, income_range, goal, obstacle, notes, created_at, updated_at
  ) VALUES (
    '520a4cfd-5183-4e11-aecc-bc71a52978b6',
    'Rahul Raj',
    'rahulrajnestef@gmail.com',
    '0569282228',
    'rahulrajnestef@gmail.com',
    'United Arab Emirates',
    'More than $10k /mo',
    'Hi this is Rahul I''m enquiring for my roomate who''s a doctor and he wish to start medical related content creation on Instagram.',
    'Kindly give a callback so that we can discuss further',
    NULL,
    '2026-04-15T20:00:00.000Z',
    '2026-04-15T20:00:00.000Z'
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
  SELECT id FROM public.crm_people WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'rahulrajnestef@gmail.com'
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
  'Rahul',
  'Raj',
  'rahulrajnestef@gmail.com',
  '0569282228',
  'rahulrajnestef@gmail.com',
  'Doctor',
  'More than $10k /mo',
  'Hi this is Rahul I''m enquiring for my roomate who''s a doctor and he wish to start medical related content creation on Instagram.',
  'Kindly give a callback so that we can discuss further',
  true,
  'new',
  '{"first_name":"Rahul","last_name":"Raj","email":"rahulrajnestef@gmail.com","phone":"0569282228","social_username":"rahulrajnestef@gmail.com","country":"United Arab Emirates","content_language":"","business_type":"Doctor","monthly_income_range":"More than $10k /mo","goals_objectives":"Hi this is Rahul I''m enquiring for my roomate who''s a doctor and he wish to start medical related content creation on Instagram.","obstacles":"Kindly give a callback so that we can discuss further","call_attendance_confirmation":"Yes","status":"new","notes":"","date_added":"Apr 16, 2026"}'::jsonb,
  'United Arab Emirates',
  NULL,
  false,
  '2026-04-15T20:00:00.000Z',
  '2026-04-15T20:00:00.000Z'
WHERE NOT EXISTS (
  SELECT 1 FROM public.leads WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'rahulrajnestef@gmail.com'
);

-- Lead 136:Ghassan Yacoub (vikki.chubar@gmail.com)
WITH inserted_person AS (
  INSERT INTO public.crm_people (
    tenant_id, full_name, email, phone, instagram, country, income_range, goal, obstacle, notes, created_at, updated_at
  ) VALUES (
    '520a4cfd-5183-4e11-aecc-bc71a52978b6',
    'Ghassan Yacoub',
    'vikki.chubar@gmail.com',
    '+971564080507',
    'الدكتور غسان gh',
    'United Arab Emirates',
    'More than $10k /mo',
    'Make vedio',
    'Bad',
    NULL,
    '2026-04-14T20:00:00.000Z',
    '2026-04-14T20:00:00.000Z'
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
  SELECT id FROM public.crm_people WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'vikki.chubar@gmail.com'
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
  'Ghassan',
  'Yacoub',
  'vikki.chubar@gmail.com',
  '+971564080507',
  'الدكتور غسان gh',
  'Doctor',
  'More than $10k /mo',
  'Make vedio',
  'Bad',
  true,
  'new',
  '{"first_name":"Ghassan","last_name":"Yacoub","email":"vikki.chubar@gmail.com","phone":"+971564080507","social_username":"الدكتور غسان gh","country":"United Arab Emirates","content_language":"","business_type":"Doctor","monthly_income_range":"More than $10k /mo","goals_objectives":"Make vedio","obstacles":"Bad","call_attendance_confirmation":"Yes","status":"new","notes":"","date_added":"Apr 15, 2026"}'::jsonb,
  'United Arab Emirates',
  NULL,
  false,
  '2026-04-14T20:00:00.000Z',
  '2026-04-14T20:00:00.000Z'
WHERE NOT EXISTS (
  SELECT 1 FROM public.leads WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'vikki.chubar@gmail.com'
);

-- Lead 137:Pankaj Hotchandani (dr.pankajhotchandani@gmail.com)
WITH inserted_person AS (
  INSERT INTO public.crm_people (
    tenant_id, full_name, email, phone, instagram, country, income_range, goal, obstacle, notes, created_at, updated_at
  ) VALUES (
    '520a4cfd-5183-4e11-aecc-bc71a52978b6',
    'Pankaj Hotchandani',
    'dr.pankajhotchandani@gmail.com',
    '+9710562439755',
    'Presidental_dubai',
    'United Arab Emirates',
    'Between $5k & $10k /mo',
    'Personal branding - 

Need to reach a huge audience by creating a highly engaging and entertaining content so the people can find it interesting and not boring',
    'A good agency',
    NULL,
    '2026-04-14T20:00:00.000Z',
    '2026-04-14T20:00:00.000Z'
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
  SELECT id FROM public.crm_people WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'dr.pankajhotchandani@gmail.com'
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
  'Pankaj',
  'Hotchandani',
  'dr.pankajhotchandani@gmail.com',
  '+9710562439755',
  'Presidental_dubai',
  'Doctor',
  'Between $5k & $10k /mo',
  'Personal branding - 

Need to reach a huge audience by creating a highly engaging and entertaining content so the people can find it interesting and not boring',
  'A good agency',
  true,
  'new',
  '{"first_name":"Pankaj","last_name":"Hotchandani","email":"dr.pankajhotchandani@gmail.com","phone":"+9710562439755","social_username":"Presidental_dubai","country":"United Arab Emirates","content_language":"","business_type":"Doctor","monthly_income_range":"Between $5k & $10k /mo","goals_objectives":"Personal branding - \n\nNeed to reach a huge audience by creating a highly engaging and entertaining content so the people can find it interesting and not boring","obstacles":"A good agency","call_attendance_confirmation":"Yes","status":"new","notes":"","date_added":"Apr 15, 2026"}'::jsonb,
  'United Arab Emirates',
  NULL,
  false,
  '2026-04-14T20:00:00.000Z',
  '2026-04-14T20:00:00.000Z'
WHERE NOT EXISTS (
  SELECT 1 FROM public.leads WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'dr.pankajhotchandani@gmail.com'
);

-- Lead 138:nawaf alenezi (vw.g@yahoo.com)
WITH inserted_person AS (
  INSERT INTO public.crm_people (
    tenant_id, full_name, email, phone, instagram, country, income_range, goal, obstacle, notes, created_at, updated_at
  ) VALUES (
    '520a4cfd-5183-4e11-aecc-bc71a52978b6',
    'nawaf alenezi',
    'vw.g@yahoo.com',
    '004915167778880',
    'dr-nawaf alenezi',
    'Germany',
    'Between $5k & $10k /mo',
    'more income',
    'follow',
    NULL,
    '2026-04-14T20:00:00.000Z',
    '2026-04-14T20:00:00.000Z'
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
  SELECT id FROM public.crm_people WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'vw.g@yahoo.com'
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
  'nawaf',
  'alenezi',
  'vw.g@yahoo.com',
  '004915167778880',
  'dr-nawaf alenezi',
  'Doctor',
  'Between $5k & $10k /mo',
  'more income',
  'follow',
  true,
  'new',
  '{"first_name":"nawaf","last_name":"alenezi","email":"vw.g@yahoo.com","phone":"004915167778880","social_username":"dr-nawaf alenezi","country":"Germany","content_language":"Arabic","business_type":"Doctor","monthly_income_range":"Between $5k & $10k /mo","goals_objectives":"more income","obstacles":"follow","call_attendance_confirmation":"Yes","status":"new","notes":"","date_added":"Apr 15, 2026"}'::jsonb,
  'Germany',
  'Arabic',
  false,
  '2026-04-14T20:00:00.000Z',
  '2026-04-14T20:00:00.000Z'
WHERE NOT EXISTS (
  SELECT 1 FROM public.leads WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'vw.g@yahoo.com'
);

-- Lead 139:Ahmed Aljabr (ahmed001@windowslive.com)
WITH inserted_person AS (
  INSERT INTO public.crm_people (
    tenant_id, full_name, email, phone, instagram, country, income_range, goal, obstacle, notes, created_at, updated_at
  ) VALUES (
    '520a4cfd-5183-4e11-aecc-bc71a52978b6',
    'Ahmed Aljabr',
    'ahmed001@windowslive.com',
    '00966535774233',
    'Dr_ahmedaljabr',
    'Saudi Arabia',
    'Between $5k & $10k /mo',
    '……..',
    '………',
    NULL,
    '2026-04-14T20:00:00.000Z',
    '2026-04-14T20:00:00.000Z'
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
  SELECT id FROM public.crm_people WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'ahmed001@windowslive.com'
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
  'Aljabr',
  'ahmed001@windowslive.com',
  '00966535774233',
  'Dr_ahmedaljabr',
  'Doctor',
  'Between $5k & $10k /mo',
  '……..',
  '………',
  true,
  'new',
  '{"first_name":"Ahmed","last_name":"Aljabr","email":"ahmed001@windowslive.com","phone":"00966535774233","social_username":"Dr_ahmedaljabr","country":"Saudi Arabia","content_language":"","business_type":"Doctor","monthly_income_range":"Between $5k & $10k /mo","goals_objectives":"……..","obstacles":"………","call_attendance_confirmation":"Yes","status":"new","notes":"","date_added":"Apr 15, 2026"}'::jsonb,
  'Saudi Arabia',
  NULL,
  false,
  '2026-04-14T20:00:00.000Z',
  '2026-04-14T20:00:00.000Z'
WHERE NOT EXISTS (
  SELECT 1 FROM public.leads WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'ahmed001@windowslive.com'
);

-- Lead 140:Hani Nassar (dr_haninassar@hotmail.com)
WITH inserted_person AS (
  INSERT INTO public.crm_people (
    tenant_id, full_name, email, phone, instagram, country, income_range, goal, obstacle, notes, created_at, updated_at
  ) VALUES (
    '520a4cfd-5183-4e11-aecc-bc71a52978b6',
    'Hani Nassar',
    'dr_haninassar@hotmail.com',
    '+966507774383',
    'Dr.haninassar',
    'Saudi Arabia',
    'More than $10k /mo',
    'Increase page trafficking 
Increase my media presence so it can be
reflected in the form of increase clinic income',
    'Budget
Return on investment',
    NULL,
    '2026-04-14T20:00:00.000Z',
    '2026-04-14T20:00:00.000Z'
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
  SELECT id FROM public.crm_people WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'dr_haninassar@hotmail.com'
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
  'Hani',
  'Nassar',
  'dr_haninassar@hotmail.com',
  '+966507774383',
  'Dr.haninassar',
  'Doctor',
  'More than $10k /mo',
  'Increase page trafficking 
Increase my media presence so it can be
reflected in the form of increase clinic income',
  'Budget
Return on investment',
  true,
  'new',
  '{"first_name":"Hani","last_name":"Nassar","email":"dr_haninassar@hotmail.com","phone":"+966507774383","social_username":"Dr.haninassar","country":"Saudi Arabia","content_language":"","business_type":"Doctor","monthly_income_range":"More than $10k /mo","goals_objectives":"Increase page trafficking \nIncrease my media presence so it can be\nreflected in the form of increase clinic income","obstacles":"Budget\nReturn on investment","call_attendance_confirmation":"Yes","status":"new","notes":"","date_added":"Apr 15, 2026"}'::jsonb,
  'Saudi Arabia',
  NULL,
  false,
  '2026-04-14T20:00:00.000Z',
  '2026-04-14T20:00:00.000Z'
WHERE NOT EXISTS (
  SELECT 1 FROM public.leads WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'dr_haninassar@hotmail.com'
);

-- Lead 141:Asma Alameeri (dr.asma.alameri@gmail.com)
WITH inserted_person AS (
  INSERT INTO public.crm_people (
    tenant_id, full_name, email, phone, instagram, country, income_range, goal, obstacle, notes, created_at, updated_at
  ) VALUES (
    '520a4cfd-5183-4e11-aecc-bc71a52978b6',
    'Asma Alameeri',
    'dr.asma.alameri@gmail.com',
    '0502422424',
    '@drasmaalameeri',
    'United Arab Emirates',
    'Between $5k & $10k /mo',
    'Increase followers',
    'Time',
    NULL,
    '2026-04-14T20:00:00.000Z',
    '2026-04-14T20:00:00.000Z'
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
  SELECT id FROM public.crm_people WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'dr.asma.alameri@gmail.com'
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
  'Asma',
  'Alameeri',
  'dr.asma.alameri@gmail.com',
  '0502422424',
  '@drasmaalameeri',
  'Doctor',
  'Between $5k & $10k /mo',
  'Increase followers',
  'Time',
  true,
  'new',
  '{"first_name":"Asma","last_name":"Alameeri","email":"dr.asma.alameri@gmail.com","phone":"0502422424","social_username":"@drasmaalameeri","country":"United Arab Emirates","content_language":"","business_type":"Doctor","monthly_income_range":"Between $5k & $10k /mo","goals_objectives":"Increase followers","obstacles":"Time","call_attendance_confirmation":"Yes","status":"new","notes":"","date_added":"Apr 15, 2026"}'::jsonb,
  'United Arab Emirates',
  NULL,
  false,
  '2026-04-14T20:00:00.000Z',
  '2026-04-14T20:00:00.000Z'
WHERE NOT EXISTS (
  SELECT 1 FROM public.leads WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'dr.asma.alameri@gmail.com'
);

-- Lead 142:Hattan Alghamdi (halghamdi87@gmail.com)
WITH inserted_person AS (
  INSERT INTO public.crm_people (
    tenant_id, full_name, email, phone, instagram, country, income_range, goal, obstacle, notes, created_at, updated_at
  ) VALUES (
    '520a4cfd-5183-4e11-aecc-bc71a52978b6',
    'Hattan Alghamdi',
    'halghamdi87@gmail.com',
    '+966545357271',
    'Hattan_alghamdi',
    'Saudi Arabia',
    'Between $5k & $10k /mo',
    'Customers, fame, followera',
    'Time',
    NULL,
    '2026-04-14T20:00:00.000Z',
    '2026-04-14T20:00:00.000Z'
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
  SELECT id FROM public.crm_people WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'halghamdi87@gmail.com'
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
  'Hattan',
  'Alghamdi',
  'halghamdi87@gmail.com',
  '+966545357271',
  'Hattan_alghamdi',
  'Doctor',
  'Between $5k & $10k /mo',
  'Customers, fame, followera',
  'Time',
  true,
  'new',
  '{"first_name":"Hattan","last_name":"Alghamdi","email":"halghamdi87@gmail.com","phone":"+966545357271","social_username":"Hattan_alghamdi","country":"Saudi Arabia","content_language":"","business_type":"Doctor","monthly_income_range":"Between $5k & $10k /mo","goals_objectives":"Customers, fame, followera","obstacles":"Time","call_attendance_confirmation":"Yes","status":"new","notes":"","date_added":"Apr 15, 2026"}'::jsonb,
  'Saudi Arabia',
  NULL,
  false,
  '2026-04-14T20:00:00.000Z',
  '2026-04-14T20:00:00.000Z'
WHERE NOT EXISTS (
  SELECT 1 FROM public.leads WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'halghamdi87@gmail.com'
);

-- Lead 143:Niclas Eckert (niclas@niccos.com)
WITH inserted_person AS (
  INSERT INTO public.crm_people (
    tenant_id, full_name, email, phone, instagram, country, income_range, goal, obstacle, notes, created_at, updated_at
  ) VALUES (
    '520a4cfd-5183-4e11-aecc-bc71a52978b6',
    'Niclas Eckert',
    'niclas@niccos.com',
    '+491732634188',
    'eckertniclas',
    'Germany',
    'More than $10k /mo',
    'I want to grow my TikTok and Youtube with English Audience',
    'The Recording and Setup',
    NULL,
    '2026-04-13T20:00:00.000Z',
    '2026-04-13T20:00:00.000Z'
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
  SELECT id FROM public.crm_people WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'niclas@niccos.com'
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
  'Niclas',
  'Eckert',
  'niclas@niccos.com',
  '+491732634188',
  'eckertniclas',
  'Entrepreneur, Service Provider, Content Creator, Consultant',
  'More than $10k /mo',
  'I want to grow my TikTok and Youtube with English Audience',
  'The Recording and Setup',
  true,
  'new',
  '{"first_name":"Niclas","last_name":"Eckert","email":"niclas@niccos.com","phone":"+491732634188","social_username":"eckertniclas","country":"Germany","content_language":"English","business_type":"Entrepreneur, Service Provider, Content Creator, Consultant","monthly_income_range":"More than $10k /mo","goals_objectives":"I want to grow my TikTok and Youtube with English Audience","obstacles":"The Recording and Setup","call_attendance_confirmation":"Yes","status":"new","notes":"","date_added":"Apr 14, 2026"}'::jsonb,
  'Germany',
  'English',
  false,
  '2026-04-13T20:00:00.000Z',
  '2026-04-13T20:00:00.000Z'
WHERE NOT EXISTS (
  SELECT 1 FROM public.leads WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'niclas@niccos.com'
);

-- Lead 144:Zahra Babiker (zehairaabdelmalik@gmail.com)
WITH inserted_person AS (
  INSERT INTO public.crm_people (
    tenant_id, full_name, email, phone, instagram, country, income_range, goal, obstacle, notes, created_at, updated_at
  ) VALUES (
    '520a4cfd-5183-4e11-aecc-bc71a52978b6',
    'Zahra Babiker',
    'zehairaabdelmalik@gmail.com',
    '+966500914092',
    '@dr.zahraa_abdelmalik',
    'Saudi Arabia',
    'Between $5k & $10k /mo',
    'I want to grow my personal brand as a orthodontist and increase my income through social media.',
    'Lack of time due to work, and not having a clear strategy for content creation and growth.',
    NULL,
    '2026-04-13T20:00:00.000Z',
    '2026-04-13T20:00:00.000Z'
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
  SELECT id FROM public.crm_people WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'zehairaabdelmalik@gmail.com'
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
  'Babiker',
  'zehairaabdelmalik@gmail.com',
  '+966500914092',
  '@dr.zahraa_abdelmalik',
  'Doctor',
  'Between $5k & $10k /mo',
  'I want to grow my personal brand as a orthodontist and increase my income through social media.',
  'Lack of time due to work, and not having a clear strategy for content creation and growth.',
  true,
  'new',
  '{"first_name":"Zahra","last_name":"Babiker","email":"zehairaabdelmalik@gmail.com","phone":"+966500914092","social_username":"@dr.zahraa_abdelmalik","country":"Saudi Arabia","content_language":"","business_type":"Doctor","monthly_income_range":"Between $5k & $10k /mo","goals_objectives":"I want to grow my personal brand as a orthodontist and increase my income through social media.","obstacles":"Lack of time due to work, and not having a clear strategy for content creation and growth.","call_attendance_confirmation":"Yes","status":"new","notes":"","date_added":"Apr 14, 2026"}'::jsonb,
  'Saudi Arabia',
  NULL,
  false,
  '2026-04-13T20:00:00.000Z',
  '2026-04-13T20:00:00.000Z'
WHERE NOT EXISTS (
  SELECT 1 FROM public.leads WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'zehairaabdelmalik@gmail.com'
);

-- Lead 145:Khalid Khoshim (kkhoshim@gmail.com)
WITH inserted_person AS (
  INSERT INTO public.crm_people (
    tenant_id, full_name, email, phone, instagram, country, income_range, goal, obstacle, notes, created_at, updated_at
  ) VALUES (
    '520a4cfd-5183-4e11-aecc-bc71a52978b6',
    'Khalid Khoshim',
    'kkhoshim@gmail.com',
    '0566439943',
    'Dr.khalid.alkhushaim',
    'Saudi Arabia',
    'More than $10k /mo',
    'I need a professional agency to take my social media instagram to the next level , I already have an amazing content but I need help with creative videos reels etc',
    'I have been looking for a professional agence',
    NULL,
    '2026-04-13T20:00:00.000Z',
    '2026-04-13T20:00:00.000Z'
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
  SELECT id FROM public.crm_people WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'kkhoshim@gmail.com'
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
  'Khoshim',
  'kkhoshim@gmail.com',
  '0566439943',
  'Dr.khalid.alkhushaim',
  'Doctor',
  'More than $10k /mo',
  'I need a professional agency to take my social media instagram to the next level , I already have an amazing content but I need help with creative videos reels etc',
  'I have been looking for a professional agence',
  true,
  'new',
  '{"first_name":"Khalid","last_name":"Khoshim","email":"kkhoshim@gmail.com","phone":"0566439943","social_username":"Dr.khalid.alkhushaim","country":"Saudi Arabia","content_language":"","business_type":"Doctor","monthly_income_range":"More than $10k /mo","goals_objectives":"I need a professional agency to take my social media instagram to the next level , I already have an amazing content but I need help with creative videos reels etc","obstacles":"I have been looking for a professional agence","call_attendance_confirmation":"Yes","status":"new","notes":"","date_added":"Apr 14, 2026"}'::jsonb,
  'Saudi Arabia',
  NULL,
  false,
  '2026-04-13T20:00:00.000Z',
  '2026-04-13T20:00:00.000Z'
WHERE NOT EXISTS (
  SELECT 1 FROM public.leads WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'kkhoshim@gmail.com'
);

-- Lead 146:Osama Morshed (dr.osamamorshed@gmail.com)
WITH inserted_person AS (
  INSERT INTO public.crm_people (
    tenant_id, full_name, email, phone, instagram, country, income_range, goal, obstacle, notes, created_at, updated_at
  ) VALUES (
    '520a4cfd-5183-4e11-aecc-bc71a52978b6',
    'Osama Morshed',
    'dr.osamamorshed@gmail.com',
    '00966596160161',
    'dr.osama_morshed',
    'Saudi Arabia',
    'Between $5k & $10k /mo',
    'More patient and income',
    'Money',
    NULL,
    '2026-04-13T20:00:00.000Z',
    '2026-04-13T20:00:00.000Z'
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
  SELECT id FROM public.crm_people WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'dr.osamamorshed@gmail.com'
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
  'Osama',
  'Morshed',
  'dr.osamamorshed@gmail.com',
  '00966596160161',
  'dr.osama_morshed',
  'Doctor',
  'Between $5k & $10k /mo',
  'More patient and income',
  'Money',
  true,
  'new',
  '{"first_name":"Osama","last_name":"Morshed","email":"dr.osamamorshed@gmail.com","phone":"00966596160161","social_username":"dr.osama_morshed","country":"Saudi Arabia","content_language":"","business_type":"Doctor","monthly_income_range":"Between $5k & $10k /mo","goals_objectives":"More patient and income","obstacles":"Money","call_attendance_confirmation":"Yes","status":"new","notes":"","date_added":"Apr 14, 2026"}'::jsonb,
  'Saudi Arabia',
  NULL,
  false,
  '2026-04-13T20:00:00.000Z',
  '2026-04-13T20:00:00.000Z'
WHERE NOT EXISTS (
  SELECT 1 FROM public.leads WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'dr.osamamorshed@gmail.com'
);

-- Lead 147:Ahmad Matar (drmatar87@hotmail.com)
WITH inserted_person AS (
  INSERT INTO public.crm_people (
    tenant_id, full_name, email, phone, instagram, country, income_range, goal, obstacle, notes, created_at, updated_at
  ) VALUES (
    '520a4cfd-5183-4e11-aecc-bc71a52978b6',
    'Ahmad Matar',
    'drmatar87@hotmail.com',
    '01734607332',
    'Matar',
    'Germany',
    'Between $5k & $10k /mo',
    'Famous, being content creator and health advising',
    'Time',
    NULL,
    '2026-04-13T20:00:00.000Z',
    '2026-04-13T20:00:00.000Z'
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
  SELECT id FROM public.crm_people WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'drmatar87@hotmail.com'
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
  'Ahmad',
  'Matar',
  'drmatar87@hotmail.com',
  '01734607332',
  'Matar',
  'Doctor',
  'Between $5k & $10k /mo',
  'Famous, being content creator and health advising',
  'Time',
  true,
  'new',
  '{"first_name":"Ahmad","last_name":"Matar","email":"drmatar87@hotmail.com","phone":"01734607332","social_username":"Matar","country":"Germany","content_language":"Arabic","business_type":"Doctor","monthly_income_range":"Between $5k & $10k /mo","goals_objectives":"Famous, being content creator and health advising","obstacles":"Time","call_attendance_confirmation":"Yes","status":"new","notes":"","date_added":"Apr 14, 2026"}'::jsonb,
  'Germany',
  'Arabic',
  false,
  '2026-04-13T20:00:00.000Z',
  '2026-04-13T20:00:00.000Z'
WHERE NOT EXISTS (
  SELECT 1 FROM public.leads WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'drmatar87@hotmail.com'
);

-- Lead 148:Tooba Khan (khantooba@hotmail.com)
WITH inserted_person AS (
  INSERT INTO public.crm_people (
    tenant_id, full_name, email, phone, instagram, country, income_range, goal, obstacle, notes, created_at, updated_at
  ) VALUES (
    '520a4cfd-5183-4e11-aecc-bc71a52978b6',
    'Tooba Khan',
    'khantooba@hotmail.com',
    '0528010464',
    '@dr.tooba.khan',
    'United Arab Emirates',
    'More than $10k /mo',
    'I want to build my own patient base',
    'I don’t advertise myself',
    NULL,
    '2026-04-13T20:00:00.000Z',
    '2026-04-13T20:00:00.000Z'
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
  SELECT id FROM public.crm_people WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'khantooba@hotmail.com'
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
  'Tooba',
  'Khan',
  'khantooba@hotmail.com',
  '0528010464',
  '@dr.tooba.khan',
  'Doctor',
  'More than $10k /mo',
  'I want to build my own patient base',
  'I don’t advertise myself',
  true,
  'new',
  '{"first_name":"Tooba","last_name":"Khan","email":"khantooba@hotmail.com","phone":"0528010464","social_username":"@dr.tooba.khan","country":"United Arab Emirates","content_language":"","business_type":"Doctor","monthly_income_range":"More than $10k /mo","goals_objectives":"I want to build my own patient base","obstacles":"I don’t advertise myself","call_attendance_confirmation":"Yes","status":"new","notes":"","date_added":"Apr 14, 2026"}'::jsonb,
  'United Arab Emirates',
  NULL,
  false,
  '2026-04-13T20:00:00.000Z',
  '2026-04-13T20:00:00.000Z'
WHERE NOT EXISTS (
  SELECT 1 FROM public.leads WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'khantooba@hotmail.com'
);

-- Lead 149:Ebtissam AlMeghaiseeb (e_meghaiseeb@hotmail.com)
WITH inserted_person AS (
  INSERT INTO public.crm_people (
    tenant_id, full_name, email, phone, instagram, country, income_range, goal, obstacle, notes, created_at, updated_at
  ) VALUES (
    '520a4cfd-5183-4e11-aecc-bc71a52978b6',
    'Ebtissam AlMeghaiseeb',
    'e_meghaiseeb@hotmail.com',
    '+966591290590',
    'C',
    'Saudi Arabia',
    'Between $5k & $10k /mo',
    'Reach more people',
    'Time  management',
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
  SELECT id FROM public.crm_people WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'e_meghaiseeb@hotmail.com'
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
  'Ebtissam',
  'AlMeghaiseeb',
  'e_meghaiseeb@hotmail.com',
  '+966591290590',
  'C',
  'Doctor',
  'Between $5k & $10k /mo',
  'Reach more people',
  'Time  management',
  true,
  'new',
  '{"first_name":"Ebtissam","last_name":"AlMeghaiseeb","email":"e_meghaiseeb@hotmail.com","phone":"+966591290590","social_username":"C","country":"Saudi Arabia","content_language":"","business_type":"Doctor","monthly_income_range":"Between $5k & $10k /mo","goals_objectives":"Reach more people","obstacles":"Time  management","call_attendance_confirmation":"Yes","status":"new","notes":"","date_added":"Apr 13, 2026"}'::jsonb,
  'Saudi Arabia',
  NULL,
  false,
  '2026-04-12T20:00:00.000Z',
  '2026-04-12T20:00:00.000Z'
WHERE NOT EXISTS (
  SELECT 1 FROM public.leads WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'e_meghaiseeb@hotmail.com'
);

-- Lead 150:Yasser Khoshaim (khoshaimy85@gmail.com)
WITH inserted_person AS (
  INSERT INTO public.crm_people (
    tenant_id, full_name, email, phone, instagram, country, income_range, goal, obstacle, notes, created_at, updated_at
  ) VALUES (
    '520a4cfd-5183-4e11-aecc-bc71a52978b6',
    'Yasser Khoshaim',
    'khoshaimy85@gmail.com',
    '0556699772',
    'Dryas85',
    'Saudi Arabia',
    'Between $5k & $10k /mo',
    'I want to increase awareness about my specialty ( palliative care ) amonv cancer patients and increase my clinic patients list .',
    'Don’t know how to reach large number of people and how to start my first video.',
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
  SELECT id FROM public.crm_people WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'khoshaimy85@gmail.com'
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
  'Yasser',
  'Khoshaim',
  'khoshaimy85@gmail.com',
  '0556699772',
  'Dryas85',
  'Consultant, Doctor',
  'Between $5k & $10k /mo',
  'I want to increase awareness about my specialty ( palliative care ) amonv cancer patients and increase my clinic patients list .',
  'Don’t know how to reach large number of people and how to start my first video.',
  true,
  'new',
  '{"first_name":"Yasser","last_name":"Khoshaim","email":"khoshaimy85@gmail.com","phone":"0556699772","social_username":"Dryas85","country":"Saudi Arabia","content_language":"","business_type":"Consultant, Doctor","monthly_income_range":"Between $5k & $10k /mo","goals_objectives":"I want to increase awareness about my specialty ( palliative care ) amonv cancer patients and increase my clinic patients list .","obstacles":"Don’t know how to reach large number of people and how to start my first video.","call_attendance_confirmation":"Yes","status":"new","notes":"","date_added":"Apr 13, 2026"}'::jsonb,
  'Saudi Arabia',
  NULL,
  false,
  '2026-04-12T20:00:00.000Z',
  '2026-04-12T20:00:00.000Z'
WHERE NOT EXISTS (
  SELECT 1 FROM public.leads WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'khoshaimy85@gmail.com'
);