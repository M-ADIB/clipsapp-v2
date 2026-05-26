-- ClipsOS V2 Leads Import Script
-- Generated on 2026-05-25T07:36:11.678Z
BEGIN;

-- Lead 1: Roumaissa Hamadou (roumeissak89@gmail.com)
WITH inserted_person AS (
  INSERT INTO public.crm_people (
    tenant_id, full_name, email, phone, instagram, country, income_range, goal, obstacle, notes, created_at, updated_at
  ) VALUES (
    '520a4cfd-5183-4e11-aecc-bc71a52978b6',
    'Roumaissa Hamadou',
    'roumeissak89@gmail.com',
    '0561080977',
    'Roumeissaa',
    'United Arab Emirates',
    '$10,000 - $30,000',
    'Compains and content',
    'Not getting the work I need and new idea',
    NULL,
    '2026-05-17T20:00:00.000Z',
    '2026-05-17T20:00:00.000Z'
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
  SELECT id FROM public.crm_people WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'roumeissak89@gmail.com'
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
  'Roumaissa',
  'Hamadou',
  'roumeissak89@gmail.com',
  '0561080977',
  'Roumeissaa',
  'Service Provider',
  '$10,000 - $30,000',
  'Compains and content',
  'Not getting the work I need and new idea',
  true,
  'new',
  '{"first_name":"Roumaissa","last_name":"Hamadou","email":"roumeissak89@gmail.com","phone":"0561080977","social_username":"Roumeissaa","country":"United Arab Emirates","content_language":"","business_type":"Service Provider","monthly_income_range":"$10,000 - $30,000","goals_objectives":"Compains and content","obstacles":"Not getting the work I need and new idea","call_attendance_confirmation":"Yes","status":"new","notes":"","date_added":"May 18, 2026"}'::jsonb,
  'United Arab Emirates',
  NULL,
  false,
  '2026-05-17T20:00:00.000Z',
  '2026-05-17T20:00:00.000Z'
WHERE NOT EXISTS (
  SELECT 1 FROM public.leads WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'roumeissak89@gmail.com'
);


-- Lead 2: momen jamal (momen.jamal123@gnail.com)
WITH inserted_person AS (
  INSERT INTO public.crm_people (
    tenant_id, full_name, email, phone, instagram, country, income_range, goal, obstacle, notes, created_at, updated_at
  ) VALUES (
    '520a4cfd-5183-4e11-aecc-bc71a52978b6',
    'momen jamal',
    'momen.jamal123@gnail.com',
    '0569085490',
    '_momenjamal',
    'United Arab Emirates',
    '$0 - $10,000',
    'new personal brand',
    'leads',
    NULL,
    '2026-05-16T20:00:00.000Z',
    '2026-05-16T20:00:00.000Z'
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
  SELECT id FROM public.crm_people WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'momen.jamal123@gnail.com'
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
  'momen',
  'jamal',
  'momen.jamal123@gnail.com',
  '0569085490',
  '_momenjamal',
  'Consultant',
  '$0 - $10,000',
  'new personal brand',
  'leads',
  true,
  'new',
  '{"first_name":"momen","last_name":"jamal","email":"momen.jamal123@gnail.com","phone":"0569085490","social_username":"_momenjamal","country":"United Arab Emirates","content_language":"","business_type":"Consultant","monthly_income_range":"$0 - $10,000","goals_objectives":"new personal brand","obstacles":"leads","call_attendance_confirmation":"Yes","status":"new","notes":"","date_added":"May 17, 2026"}'::jsonb,
  'United Arab Emirates',
  NULL,
  false,
  '2026-05-16T20:00:00.000Z',
  '2026-05-16T20:00:00.000Z'
WHERE NOT EXISTS (
  SELECT 1 FROM public.leads WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'momen.jamal123@gnail.com'
);


-- Lead 3: Hammad Ebrahimi (eijaz7175@gmail.com)
WITH inserted_person AS (
  INSERT INTO public.crm_people (
    tenant_id, full_name, email, phone, instagram, country, income_range, goal, obstacle, notes, created_at, updated_at
  ) VALUES (
    '520a4cfd-5183-4e11-aecc-bc71a52978b6',
    'Hammad Ebrahimi',
    'eijaz7175@gmail.com',
    '+989161776014',
    'Made21310',
    'Iran (Islamic Republic of)',
    '$0 - $10,000',
    'Hello please I need to learn how to influence and scale my mentorship program to go viral and earn more subscription and student with social media',
    'No strategy or idea about how to start',
    NULL,
    '2026-05-16T20:00:00.000Z',
    '2026-05-16T20:00:00.000Z'
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
  SELECT id FROM public.crm_people WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'eijaz7175@gmail.com'
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
  'Hammad',
  'Ebrahimi',
  'eijaz7175@gmail.com',
  '+989161776014',
  'Made21310',
  'Online Coach',
  '$0 - $10,000',
  'Hello please I need to learn how to influence and scale my mentorship program to go viral and earn more subscription and student with social media',
  'No strategy or idea about how to start',
  true,
  'new',
  '{"first_name":"Hammad","last_name":"Ebrahimi","email":"eijaz7175@gmail.com","phone":"+989161776014","social_username":"Made21310","country":"Iran (Islamic Republic of)","content_language":"","business_type":"Online Coach","monthly_income_range":"$0 - $10,000","goals_objectives":"Hello please I need to learn how to influence and scale my mentorship program to go viral and earn more subscription and student with social media","obstacles":"No strategy or idea about how to start","call_attendance_confirmation":"Yes","status":"new","notes":"","date_added":"May 17, 2026"}'::jsonb,
  'Iran (Islamic Republic of)',
  NULL,
  false,
  '2026-05-16T20:00:00.000Z',
  '2026-05-16T20:00:00.000Z'
WHERE NOT EXISTS (
  SELECT 1 FROM public.leads WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'eijaz7175@gmail.com'
);


-- Lead 4: Saeed Al-blooshi (s3eed.binkaram77@hotmail.com)
WITH inserted_person AS (
  INSERT INTO public.crm_people (
    tenant_id, full_name, email, phone, instagram, country, income_range, goal, obstacle, notes, created_at, updated_at
  ) VALUES (
    '520a4cfd-5183-4e11-aecc-bc71a52978b6',
    'Saeed Al-blooshi',
    's3eed.binkaram77@hotmail.com',
    '0521016601',
    'Saeedbinkaram',
    'United Arab Emirates',
    '$0 - $10,000',
    'I want to create social media content, as a real estate agent mainly.',
    'To make the video, maybe a bit practice on talking to a camera and that’s it.',
    NULL,
    '2026-05-16T20:00:00.000Z',
    '2026-05-16T20:00:00.000Z'
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
  SELECT id FROM public.crm_people WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 's3eed.binkaram77@hotmail.com'
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
  'Saeed',
  'Al-blooshi',
  's3eed.binkaram77@hotmail.com',
  '0521016601',
  'Saeedbinkaram',
  'Service Provider',
  '$0 - $10,000',
  'I want to create social media content, as a real estate agent mainly.',
  'To make the video, maybe a bit practice on talking to a camera and that’s it.',
  true,
  'new',
  '{"first_name":"Saeed","last_name":"Al-blooshi","email":"s3eed.binkaram77@hotmail.com","phone":"0521016601","social_username":"Saeedbinkaram","country":"United Arab Emirates","content_language":"","business_type":"Service Provider","monthly_income_range":"$0 - $10,000","goals_objectives":"I want to create social media content, as a real estate agent mainly.","obstacles":"To make the video, maybe a bit practice on talking to a camera and that’s it.","call_attendance_confirmation":"Yes","status":"new","notes":"","date_added":"May 17, 2026"}'::jsonb,
  'United Arab Emirates',
  NULL,
  false,
  '2026-05-16T20:00:00.000Z',
  '2026-05-16T20:00:00.000Z'
WHERE NOT EXISTS (
  SELECT 1 FROM public.leads WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 's3eed.binkaram77@hotmail.com'
);


-- Lead 5: Elie Chammas (elieg.chammas@gmail.com)
WITH inserted_person AS (
  INSERT INTO public.crm_people (
    tenant_id, full_name, email, phone, instagram, country, income_range, goal, obstacle, notes, created_at, updated_at
  ) VALUES (
    '520a4cfd-5183-4e11-aecc-bc71a52978b6',
    'Elie Chammas',
    'elieg.chammas@gmail.com',
    '+971585349286',
    'Elieechammas',
    'United Arab Emirates',
    '$0 - $10,000',
    'I wanna grow my social media and get bookings',
    'Strategy and execution',
    NULL,
    '2026-05-16T20:00:00.000Z',
    '2026-05-16T20:00:00.000Z'
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
  SELECT id FROM public.crm_people WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'elieg.chammas@gmail.com'
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
  'Elie',
  'Chammas',
  'elieg.chammas@gmail.com',
  '+971585349286',
  'Elieechammas',
  'DJ',
  '$0 - $10,000',
  'I wanna grow my social media and get bookings',
  'Strategy and execution',
  true,
  'new',
  '{"first_name":"Elie","last_name":"Chammas","email":"elieg.chammas@gmail.com","phone":"+971585349286","social_username":"Elieechammas","country":"United Arab Emirates","content_language":"","business_type":"DJ","monthly_income_range":"$0 - $10,000","goals_objectives":"I wanna grow my social media and get bookings","obstacles":"Strategy and execution","call_attendance_confirmation":"Yes","status":"new","notes":"","date_added":"May 17, 2026"}'::jsonb,
  'United Arab Emirates',
  NULL,
  false,
  '2026-05-16T20:00:00.000Z',
  '2026-05-16T20:00:00.000Z'
WHERE NOT EXISTS (
  SELECT 1 FROM public.leads WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'elieg.chammas@gmail.com'
);


-- Lead 6: Fawz Safaa (drfawz3@hotmail.com)
WITH inserted_person AS (
  INSERT INTO public.crm_people (
    tenant_id, full_name, email, phone, instagram, country, income_range, goal, obstacle, notes, created_at, updated_at
  ) VALUES (
    '520a4cfd-5183-4e11-aecc-bc71a52978b6',
    'Fawz Safaa',
    'drfawz3@hotmail.com',
    '+971552706472',
    '@dr.fawzz',
    'United Arab Emirates',
    '$0 - $10,000',
    '.',
    '.',
    NULL,
    '2026-05-16T20:00:00.000Z',
    '2026-05-16T20:00:00.000Z'
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
  SELECT id FROM public.crm_people WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'drfawz3@hotmail.com'
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
  'Fawz',
  'Safaa',
  'drfawz3@hotmail.com',
  '+971552706472',
  '@dr.fawzz',
  'Doctor',
  '$0 - $10,000',
  '.',
  '.',
  true,
  'new',
  '{"first_name":"Fawz","last_name":"Safaa","email":"drfawz3@hotmail.com","phone":"+971552706472","social_username":"@dr.fawzz","country":"United Arab Emirates","content_language":"","business_type":"Doctor","monthly_income_range":"$0 - $10,000","goals_objectives":".","obstacles":".","call_attendance_confirmation":"Yes","status":"new","notes":"","date_added":"May 17, 2026"}'::jsonb,
  'United Arab Emirates',
  NULL,
  false,
  '2026-05-16T20:00:00.000Z',
  '2026-05-16T20:00:00.000Z'
WHERE NOT EXISTS (
  SELECT 1 FROM public.leads WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'drfawz3@hotmail.com'
);


-- Lead 7: Mohammed Bitar (support@sikkini.com)
WITH inserted_person AS (
  INSERT INTO public.crm_people (
    tenant_id, full_name, email, phone, instagram, country, income_range, goal, obstacle, notes, created_at, updated_at
  ) VALUES (
    '520a4cfd-5183-4e11-aecc-bc71a52978b6',
    'Mohammed Bitar',
    'support@sikkini.com',
    '0507265400',
    'mbitar1987@gmail.com',
    'United Arab Emirates',
    '$0 - $10,000',
    'Getting leads that converts to actual business',
    'I just started, and I need help to scale',
    NULL,
    '2026-05-15T20:00:00.000Z',
    '2026-05-15T20:00:00.000Z'
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
  SELECT id FROM public.crm_people WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'support@sikkini.com'
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
  'Bitar',
  'support@sikkini.com',
  '0507265400',
  'mbitar1987@gmail.com',
  'Service Provider',
  '$0 - $10,000',
  'Getting leads that converts to actual business',
  'I just started, and I need help to scale',
  true,
  'new',
  '{"first_name":"Mohammed","last_name":"Bitar","email":"support@sikkini.com","phone":"0507265400","social_username":"mbitar1987@gmail.com","country":"United Arab Emirates","content_language":"","business_type":"Service Provider","monthly_income_range":"$0 - $10,000","goals_objectives":"Getting leads that converts to actual business","obstacles":"I just started, and I need help to scale","call_attendance_confirmation":"Yes","status":"new","notes":"","date_added":"May 16, 2026"}'::jsonb,
  'United Arab Emirates',
  NULL,
  false,
  '2026-05-15T20:00:00.000Z',
  '2026-05-15T20:00:00.000Z'
WHERE NOT EXISTS (
  SELECT 1 FROM public.leads WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'support@sikkini.com'
);


-- Lead 8: Aryan Rezaee (by.aryanrezaee@gmail.com)
WITH inserted_person AS (
  INSERT INTO public.crm_people (
    tenant_id, full_name, email, phone, instagram, country, income_range, goal, obstacle, notes, created_at, updated_at
  ) VALUES (
    '520a4cfd-5183-4e11-aecc-bc71a52978b6',
    'Aryan Rezaee',
    'by.aryanrezaee@gmail.com',
    '00971553818208',
    '@by.aryanrezaee',
    'United Arab Emirates',
    '$0 - $10,000',
    'I want to achieve organic leads and grow my page',
    'My videos are not getting any leads and they are not going viral',
    NULL,
    '2026-05-15T20:00:00.000Z',
    '2026-05-15T20:00:00.000Z'
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
  SELECT id FROM public.crm_people WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'by.aryanrezaee@gmail.com'
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
  'Aryan',
  'Rezaee',
  'by.aryanrezaee@gmail.com',
  '00971553818208',
  '@by.aryanrezaee',
  'Consultant',
  '$0 - $10,000',
  'I want to achieve organic leads and grow my page',
  'My videos are not getting any leads and they are not going viral',
  true,
  'new',
  '{"first_name":"Aryan","last_name":"Rezaee","email":"by.aryanrezaee@gmail.com","phone":"00971553818208","social_username":"@by.aryanrezaee","country":"United Arab Emirates","content_language":"","business_type":"Consultant","monthly_income_range":"$0 - $10,000","goals_objectives":"I want to achieve organic leads and grow my page","obstacles":"My videos are not getting any leads and they are not going viral","call_attendance_confirmation":"Yes","status":"new","notes":"","date_added":"May 16, 2026"}'::jsonb,
  'United Arab Emirates',
  NULL,
  false,
  '2026-05-15T20:00:00.000Z',
  '2026-05-15T20:00:00.000Z'
WHERE NOT EXISTS (
  SELECT 1 FROM public.leads WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'by.aryanrezaee@gmail.com'
);


-- Lead 9: Madhuri Podeti (beachfrontbymadhu@gmail.com)
WITH inserted_person AS (
  INSERT INTO public.crm_people (
    tenant_id, full_name, email, phone, instagram, country, income_range, goal, obstacle, notes, created_at, updated_at
  ) VALUES (
    '520a4cfd-5183-4e11-aecc-bc71a52978b6',
    'Madhuri Podeti',
    'beachfrontbymadhu@gmail.com',
    '+971562219622',
    'Reale_madhu',
    'United Arab Emirates',
    '$10,000 - $30,000',
    'Intellectual content + Genuine leads',
    'Trust in the right service provider at reasonable cost.',
    NULL,
    '2026-05-15T20:00:00.000Z',
    '2026-05-15T20:00:00.000Z'
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
  SELECT id FROM public.crm_people WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'beachfrontbymadhu@gmail.com'
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
  'Madhuri',
  'Podeti',
  'beachfrontbymadhu@gmail.com',
  '+971562219622',
  'Reale_madhu',
  'Service Provider',
  '$10,000 - $30,000',
  'Intellectual content + Genuine leads',
  'Trust in the right service provider at reasonable cost.',
  true,
  'new',
  '{"first_name":"Madhuri","last_name":"Podeti","email":"beachfrontbymadhu@gmail.com","phone":"+971562219622","social_username":"Reale_madhu","country":"United Arab Emirates","content_language":"","business_type":"Service Provider","monthly_income_range":"$10,000 - $30,000","goals_objectives":"Intellectual content + Genuine leads","obstacles":"Trust in the right service provider at reasonable cost.","call_attendance_confirmation":"Yes","status":"new","notes":"","date_added":"May 16, 2026"}'::jsonb,
  'United Arab Emirates',
  NULL,
  false,
  '2026-05-15T20:00:00.000Z',
  '2026-05-15T20:00:00.000Z'
WHERE NOT EXISTS (
  SELECT 1 FROM public.leads WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'beachfrontbymadhu@gmail.com'
);


-- Lead 10: Sudqi Mohammad (sudqidana9@gmail.com)
WITH inserted_person AS (
  INSERT INTO public.crm_people (
    tenant_id, full_name, email, phone, instagram, country, income_range, goal, obstacle, notes, created_at, updated_at
  ) VALUES (
    '520a4cfd-5183-4e11-aecc-bc71a52978b6',
    'Sudqi Mohammad',
    'sudqidana9@gmail.com',
    '0564422077',
    'Sudqidana',
    'United Arab Emirates',
    '$0 - $10,000',
    'Leads and interested  buyers and sellers and deal closing',
    'Having problems with my lead generation sources',
    NULL,
    '2026-05-15T20:00:00.000Z',
    '2026-05-15T20:00:00.000Z'
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
  SELECT id FROM public.crm_people WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'sudqidana9@gmail.com'
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
  'Sudqi',
  'Mohammad',
  'sudqidana9@gmail.com',
  '0564422077',
  'Sudqidana',
  'Real Estate broker',
  '$0 - $10,000',
  'Leads and interested  buyers and sellers and deal closing',
  'Having problems with my lead generation sources',
  true,
  'new',
  '{"first_name":"Sudqi","last_name":"Mohammad","email":"sudqidana9@gmail.com","phone":"0564422077","social_username":"Sudqidana","country":"United Arab Emirates","content_language":"","business_type":"Real Estate broker","monthly_income_range":"$0 - $10,000","goals_objectives":"Leads and interested  buyers and sellers and deal closing","obstacles":"Having problems with my lead generation sources","call_attendance_confirmation":"Yes","status":"new","notes":"","date_added":"May 16, 2026"}'::jsonb,
  'United Arab Emirates',
  NULL,
  false,
  '2026-05-15T20:00:00.000Z',
  '2026-05-15T20:00:00.000Z'
WHERE NOT EXISTS (
  SELECT 1 FROM public.leads WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'sudqidana9@gmail.com'
);


-- Lead 11: Hamed Amiran (hamed.amiran@yahoo.com)
WITH inserted_person AS (
  INSERT INTO public.crm_people (
    tenant_id, full_name, email, phone, instagram, country, income_range, goal, obstacle, notes, created_at, updated_at
  ) VALUES (
    '520a4cfd-5183-4e11-aecc-bc71a52978b6',
    'Hamed Amiran',
    'hamed.amiran@yahoo.com',
    '+971507605028',
    'Thehamedamiran',
    'United Arab Emirates',
    '$0 - $10,000',
    'Get more clients who want to buy Farm lands , full building with stable  rental income , buy asset that appreciate in value ( not just any project or  any developer)',
    'I need more buyer leads, Local Emarati Buyer ,and more also strong international buyers',
    NULL,
    '2026-05-14T20:00:00.000Z',
    '2026-05-14T20:00:00.000Z'
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
  SELECT id FROM public.crm_people WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'hamed.amiran@yahoo.com'
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
  'Hamed',
  'Amiran',
  'hamed.amiran@yahoo.com',
  '+971507605028',
  'Thehamedamiran',
  'Service Provider',
  '$0 - $10,000',
  'Get more clients who want to buy Farm lands , full building with stable  rental income , buy asset that appreciate in value ( not just any project or  any developer)',
  'I need more buyer leads, Local Emarati Buyer ,and more also strong international buyers',
  true,
  'new',
  '{"first_name":"Hamed","last_name":"Amiran","email":"hamed.amiran@yahoo.com","phone":"+971507605028","social_username":"Thehamedamiran","country":"United Arab Emirates","content_language":"","business_type":"Service Provider","monthly_income_range":"$0 - $10,000","goals_objectives":"Get more clients who want to buy Farm lands , full building with stable  rental income , buy asset that appreciate in value ( not just any project or  any developer)","obstacles":"I need more buyer leads, Local Emarati Buyer ,and more also strong international buyers","call_attendance_confirmation":"Yes","status":"new","notes":"","date_added":"May 15, 2026"}'::jsonb,
  'United Arab Emirates',
  NULL,
  false,
  '2026-05-14T20:00:00.000Z',
  '2026-05-14T20:00:00.000Z'
WHERE NOT EXISTS (
  SELECT 1 FROM public.leads WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'hamed.amiran@yahoo.com'
);


-- Lead 12: Marie Louise Jensen (feldvossae@gmail.com)
WITH inserted_person AS (
  INSERT INTO public.crm_people (
    tenant_id, full_name, email, phone, instagram, country, income_range, goal, obstacle, notes, created_at, updated_at
  ) VALUES (
    '520a4cfd-5183-4e11-aecc-bc71a52978b6',
    'Marie Louise Jensen',
    'feldvossae@gmail.com',
    '0568967045',
    'N/A',
    'United Arab Emirates',
    '$0 - $10,000',
    'Become number one in my community and close more deals',
    'I am not very good with social media.',
    NULL,
    '2026-05-14T20:00:00.000Z',
    '2026-05-14T20:00:00.000Z'
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
  SELECT id FROM public.crm_people WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'feldvossae@gmail.com'
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
  'Marie Louise',
  'Jensen',
  'feldvossae@gmail.com',
  '0568967045',
  'N/A',
  'Real Estate',
  '$0 - $10,000',
  'Become number one in my community and close more deals',
  'I am not very good with social media.',
  true,
  'new',
  '{"first_name":"Marie Louise","last_name":"Jensen","email":"feldvossae@gmail.com","phone":"0568967045","social_username":"N/A","country":"United Arab Emirates","content_language":"","business_type":"Real Estate","monthly_income_range":"$0 - $10,000","goals_objectives":"Become number one in my community and close more deals","obstacles":"I am not very good with social media.","call_attendance_confirmation":"Yes","status":"new","notes":"","date_added":"May 15, 2026"}'::jsonb,
  'United Arab Emirates',
  NULL,
  false,
  '2026-05-14T20:00:00.000Z',
  '2026-05-14T20:00:00.000Z'
WHERE NOT EXISTS (
  SELECT 1 FROM public.leads WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'feldvossae@gmail.com'
);


-- Lead 13: jon g (g@g.cpm)
WITH inserted_person AS (
  INSERT INTO public.crm_people (
    tenant_id, full_name, email, phone, instagram, country, income_range, goal, obstacle, notes, created_at, updated_at
  ) VALUES (
    '520a4cfd-5183-4e11-aecc-bc71a52978b6',
    'jon g',
    'g@g.cpm',
    '971544941891',
    'a',
    'Afghanistan',
    '$10,000 - $30,000',
    'a',
    'a',
    NULL,
    '2026-05-14T20:00:00.000Z',
    '2026-05-14T20:00:00.000Z'
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
  SELECT id FROM public.crm_people WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'g@g.cpm'
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
  'jon',
  'g',
  'g@g.cpm',
  '971544941891',
  'a',
  'Service Provider',
  '$10,000 - $30,000',
  'a',
  'a',
  true,
  'new',
  '{"first_name":"jon","last_name":"g","email":"g@g.cpm","phone":"971544941891","social_username":"a","country":"Afghanistan","content_language":"","business_type":"Service Provider","monthly_income_range":"$10,000 - $30,000","goals_objectives":"a","obstacles":"a","call_attendance_confirmation":"Yes","status":"new","notes":"","date_added":"May 15, 2026"}'::jsonb,
  'Afghanistan',
  NULL,
  false,
  '2026-05-14T20:00:00.000Z',
  '2026-05-14T20:00:00.000Z'
WHERE NOT EXISTS (
  SELECT 1 FROM public.leads WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'g@g.cpm'
);


-- Lead 14: Emilie Rose Norey (investwithemilie@gmail.com)
WITH inserted_person AS (
  INSERT INTO public.crm_people (
    tenant_id, full_name, email, phone, instagram, country, income_range, goal, obstacle, notes, created_at, updated_at
  ) VALUES (
    '520a4cfd-5183-4e11-aecc-bc71a52978b6',
    'Emilie Rose Norey',
    'investwithemilie@gmail.com',
    '0551598440',
    'Emilie Rose Reels',
    'United Arab Emirates',
    '$30,000 - $50,000',
    'Help in constant strategy, conversion and lead gen',
    'Finding the write team',
    NULL,
    '2026-05-13T20:00:00.000Z',
    '2026-05-13T20:00:00.000Z'
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
  SELECT id FROM public.crm_people WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'investwithemilie@gmail.com'
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
  'Emilie',
  'Rose Norey',
  'investwithemilie@gmail.com',
  '0551598440',
  'Emilie Rose Reels',
  'Real estate',
  '$30,000 - $50,000',
  'Help in constant strategy, conversion and lead gen',
  'Finding the write team',
  true,
  'new',
  '{"first_name":"Emilie","last_name":"Rose Norey","email":"investwithemilie@gmail.com","phone":"0551598440","social_username":"Emilie Rose Reels","country":"United Arab Emirates","content_language":"","business_type":"Real estate","monthly_income_range":"$30,000 - $50,000","goals_objectives":"Help in constant strategy, conversion and lead gen","obstacles":"Finding the write team","call_attendance_confirmation":"Yes","status":"new","notes":"","date_added":"May 14, 2026"}'::jsonb,
  'United Arab Emirates',
  NULL,
  false,
  '2026-05-13T20:00:00.000Z',
  '2026-05-13T20:00:00.000Z'
WHERE NOT EXISTS (
  SELECT 1 FROM public.leads WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'investwithemilie@gmail.com'
);


-- Lead 15: Tony Deeb (deebantoine@gmail.com)
WITH inserted_person AS (
  INSERT INTO public.crm_people (
    tenant_id, full_name, email, phone, instagram, country, income_range, goal, obstacle, notes, created_at, updated_at
  ) VALUES (
    '520a4cfd-5183-4e11-aecc-bc71a52978b6',
    'Tony Deeb',
    'deebantoine@gmail.com',
    '0566593330',
    '@dubaipropertysoul',
    'United Arab Emirates',
    '$0 - $10,000',
    'Generating Mid and High cheques qualified leads',
    'Social media strategies',
    NULL,
    '2026-05-13T20:00:00.000Z',
    '2026-05-13T20:00:00.000Z'
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
  SELECT id FROM public.crm_people WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'deebantoine@gmail.com'
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
  'Tony',
  'Deeb',
  'deebantoine@gmail.com',
  '0566593330',
  '@dubaipropertysoul',
  'Real estate broker',
  '$0 - $10,000',
  'Generating Mid and High cheques qualified leads',
  'Social media strategies',
  true,
  'new',
  '{"first_name":"Tony","last_name":"Deeb","email":"deebantoine@gmail.com","phone":"0566593330","social_username":"@dubaipropertysoul","country":"United Arab Emirates","content_language":"","business_type":"Real estate broker","monthly_income_range":"$0 - $10,000","goals_objectives":"Generating Mid and High cheques qualified leads","obstacles":"Social media strategies","call_attendance_confirmation":"Yes","status":"new","notes":"","date_added":"May 14, 2026"}'::jsonb,
  'United Arab Emirates',
  NULL,
  false,
  '2026-05-13T20:00:00.000Z',
  '2026-05-13T20:00:00.000Z'
WHERE NOT EXISTS (
  SELECT 1 FROM public.leads WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'deebantoine@gmail.com'
);


-- Lead 16: Zahra Abbas (info@zazewelz.con)
WITH inserted_person AS (
  INSERT INTO public.crm_people (
    tenant_id, full_name, email, phone, instagram, country, income_range, goal, obstacle, notes, created_at, updated_at
  ) VALUES (
    '520a4cfd-5183-4e11-aecc-bc71a52978b6',
    'Zahra Abbas',
    'info@zazewelz.con',
    '+971504761420',
    'Zazewelz',
    'United Arab Emirates',
    '$0 - $10,000',
    'Increase awareness and sales',
    'Marketing',
    NULL,
    '2026-05-13T20:00:00.000Z',
    '2026-05-13T20:00:00.000Z'
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
  SELECT id FROM public.crm_people WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'info@zazewelz.con'
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
  'Abbas',
  'info@zazewelz.con',
  '+971504761420',
  'Zazewelz',
  'Accessories',
  '$0 - $10,000',
  'Increase awareness and sales',
  'Marketing',
  true,
  'new',
  '{"first_name":"Zahra","last_name":"Abbas","email":"info@zazewelz.con","phone":"+971504761420","social_username":"Zazewelz","country":"United Arab Emirates","content_language":"","business_type":"Accessories","monthly_income_range":"$0 - $10,000","goals_objectives":"Increase awareness and sales","obstacles":"Marketing","call_attendance_confirmation":"Yes","status":"new","notes":"","date_added":"May 14, 2026"}'::jsonb,
  'United Arab Emirates',
  NULL,
  false,
  '2026-05-13T20:00:00.000Z',
  '2026-05-13T20:00:00.000Z'
WHERE NOT EXISTS (
  SELECT 1 FROM public.leads WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'info@zazewelz.con'
);


-- Lead 17: mohamed elgebaly (mohamedelgably278@gmail.com)
WITH inserted_person AS (
  INSERT INTO public.crm_people (
    tenant_id, full_name, email, phone, instagram, country, income_range, goal, obstacle, notes, created_at, updated_at
  ) VALUES (
    '520a4cfd-5183-4e11-aecc-bc71a52978b6',
    'mohamed elgebaly',
    'mohamedelgably278@gmail.com',
    '+971 50 909 6815',
    '@moelgably',
    'United Arab Emirates',
    '$10,000 - $30,000',
    'asdsad',
    'sasdasdsa',
    NULL,
    '2026-05-13T20:00:00.000Z',
    '2026-05-13T20:00:00.000Z'
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
  SELECT id FROM public.crm_people WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'mohamedelgably278@gmail.com'
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
  'mohamed',
  'elgebaly',
  'mohamedelgably278@gmail.com',
  '+971 50 909 6815',
  '@moelgably',
  'Service Provider',
  '$10,000 - $30,000',
  'asdsad',
  'sasdasdsa',
  true,
  'new',
  '{"first_name":"mohamed","last_name":"elgebaly","email":"mohamedelgably278@gmail.com","phone":"+971 50 909 6815","social_username":"@moelgably","country":"United Arab Emirates","content_language":"","business_type":"Service Provider","monthly_income_range":"$10,000 - $30,000","goals_objectives":"asdsad","obstacles":"sasdasdsa","call_attendance_confirmation":"Yes","status":"new","notes":"","date_added":"May 14, 2026"}'::jsonb,
  'United Arab Emirates',
  NULL,
  false,
  '2026-05-13T20:00:00.000Z',
  '2026-05-13T20:00:00.000Z'
WHERE NOT EXISTS (
  SELECT 1 FROM public.leads WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'mohamedelgably278@gmail.com'
);


-- Lead 18: Ekaterina Sh (ppp@gmail.com)
WITH inserted_person AS (
  INSERT INTO public.crm_people (
    tenant_id, full_name, email, phone, instagram, country, income_range, goal, obstacle, notes, created_at, updated_at
  ) VALUES (
    '520a4cfd-5183-4e11-aecc-bc71a52978b6',
    'Ekaterina Sh',
    'ppp@gmail.com',
    '+971501057877',
    'realestate_ekaterina',
    'United Arab Emirates',
    '$0 - $10,000',
    'gain the audience of buyers and brokers',
    'social media',
    NULL,
    '2026-05-12T20:00:00.000Z',
    '2026-05-12T20:00:00.000Z'
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
  SELECT id FROM public.crm_people WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'ppp@gmail.com'
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
  'Ekaterina',
  'Sh',
  'ppp@gmail.com',
  '+971501057877',
  'realestate_ekaterina',
  'real estate',
  '$0 - $10,000',
  'gain the audience of buyers and brokers',
  'social media',
  true,
  'new',
  '{"first_name":"Ekaterina","last_name":"Sh","email":"ppp@gmail.com","phone":"+971501057877","social_username":"realestate_ekaterina","country":"United Arab Emirates","content_language":"","business_type":"real estate","monthly_income_range":"$0 - $10,000","goals_objectives":"gain the audience of buyers and brokers","obstacles":"social media","call_attendance_confirmation":"Yes","status":"new","notes":"","date_added":"May 13, 2026"}'::jsonb,
  'United Arab Emirates',
  NULL,
  false,
  '2026-05-12T20:00:00.000Z',
  '2026-05-12T20:00:00.000Z'
WHERE NOT EXISTS (
  SELECT 1 FROM public.leads WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'ppp@gmail.com'
);


-- Lead 19: Mutaz Samaha (samahamotaz@hotmail.com)
WITH inserted_person AS (
  INSERT INTO public.crm_people (
    tenant_id, full_name, email, phone, instagram, country, income_range, goal, obstacle, notes, created_at, updated_at
  ) VALUES (
    '520a4cfd-5183-4e11-aecc-bc71a52978b6',
    'Mutaz Samaha',
    'samahamotaz@hotmail.com',
    '+971563573280',
    'Tealdesignstudio',
    'United Arab Emirates',
    '$0 - $10,000',
    'In call',
    'In call',
    NULL,
    '2026-05-12T20:00:00.000Z',
    '2026-05-12T20:00:00.000Z'
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
  SELECT id FROM public.crm_people WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'samahamotaz@hotmail.com'
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
  'Mutaz',
  'Samaha',
  'samahamotaz@hotmail.com',
  '+971563573280',
  'Tealdesignstudio',
  'Service Provider',
  '$0 - $10,000',
  'In call',
  'In call',
  true,
  'new',
  '{"first_name":"Mutaz","last_name":"Samaha","email":"samahamotaz@hotmail.com","phone":"+971563573280","social_username":"Tealdesignstudio","country":"United Arab Emirates","content_language":"","business_type":"Service Provider","monthly_income_range":"$0 - $10,000","goals_objectives":"In call","obstacles":"In call","call_attendance_confirmation":"Yes","status":"new","notes":"","date_added":"May 13, 2026"}'::jsonb,
  'United Arab Emirates',
  NULL,
  false,
  '2026-05-12T20:00:00.000Z',
  '2026-05-12T20:00:00.000Z'
WHERE NOT EXISTS (
  SELECT 1 FROM public.leads WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'samahamotaz@hotmail.com'
);


-- Lead 20: Mutaz Sam (samahamotaz@hotmail.com)
WITH inserted_person AS (
  INSERT INTO public.crm_people (
    tenant_id, full_name, email, phone, instagram, country, income_range, goal, obstacle, notes, created_at, updated_at
  ) VALUES (
    '520a4cfd-5183-4e11-aecc-bc71a52978b6',
    'Mutaz Sam',
    'samahamotaz@hotmail.com',
    '0563573280',
    'Teal',
    'United Arab Emirates',
    '$0 - $10,000',
    'Video and exposure',
    'In call',
    NULL,
    '2026-05-12T20:00:00.000Z',
    '2026-05-12T20:00:00.000Z'
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
  SELECT id FROM public.crm_people WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'samahamotaz@hotmail.com'
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
  'Mutaz',
  'Sam',
  'samahamotaz@hotmail.com',
  '0563573280',
  'Teal',
  'Service Provider',
  '$0 - $10,000',
  'Video and exposure',
  'In call',
  true,
  'new',
  '{"first_name":"Mutaz","last_name":"Sam","email":"samahamotaz@hotmail.com","phone":"0563573280","social_username":"Teal","country":"United Arab Emirates","content_language":"","business_type":"Service Provider","monthly_income_range":"$0 - $10,000","goals_objectives":"Video and exposure","obstacles":"In call","call_attendance_confirmation":"Yes","status":"new","notes":"","date_added":"May 13, 2026"}'::jsonb,
  'United Arab Emirates',
  NULL,
  false,
  '2026-05-12T20:00:00.000Z',
  '2026-05-12T20:00:00.000Z'
WHERE NOT EXISTS (
  SELECT 1 FROM public.leads WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'samahamotaz@hotmail.com'
);


-- Lead 21: Zeina Knio (zeina.a.knio@gmail.com)
WITH inserted_person AS (
  INSERT INTO public.crm_people (
    tenant_id, full_name, email, phone, instagram, country, income_range, goal, obstacle, notes, created_at, updated_at
  ) VALUES (
    '520a4cfd-5183-4e11-aecc-bc71a52978b6',
    'Zeina Knio',
    'zeina.a.knio@gmail.com',
    '0528707532',
    '@dr.zeinaknio',
    'United Arab Emirates',
    '$0 - $10,000',
    'Content creation that is different from the market',
    'Time',
    NULL,
    '2026-05-12T20:00:00.000Z',
    '2026-05-12T20:00:00.000Z'
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
  SELECT id FROM public.crm_people WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'zeina.a.knio@gmail.com'
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
  'Zeina',
  'Knio',
  'zeina.a.knio@gmail.com',
  '0528707532',
  '@dr.zeinaknio',
  'Doctor',
  '$0 - $10,000',
  'Content creation that is different from the market',
  'Time',
  true,
  'new',
  '{"first_name":"Zeina","last_name":"Knio","email":"zeina.a.knio@gmail.com","phone":"0528707532","social_username":"@dr.zeinaknio","country":"United Arab Emirates","content_language":"","business_type":"Doctor","monthly_income_range":"$0 - $10,000","goals_objectives":"Content creation that is different from the market","obstacles":"Time","call_attendance_confirmation":"Yes","status":"new","notes":"","date_added":"May 13, 2026"}'::jsonb,
  'United Arab Emirates',
  NULL,
  false,
  '2026-05-12T20:00:00.000Z',
  '2026-05-12T20:00:00.000Z'
WHERE NOT EXISTS (
  SELECT 1 FROM public.leads WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'zeina.a.knio@gmail.com'
);


-- Lead 22: Margarita Fedorova (fedorova.margo.rita@gmail.com)
WITH inserted_person AS (
  INSERT INTO public.crm_people (
    tenant_id, full_name, email, phone, instagram, country, income_range, goal, obstacle, notes, created_at, updated_at
  ) VALUES (
    '520a4cfd-5183-4e11-aecc-bc71a52978b6',
    'Margarita Fedorova',
    'fedorova.margo.rita@gmail.com',
    '0569174407',
    'Coach.margo.rita',
    'United Arab Emirates',
    '$0 - $10,000',
    'Gym marketing',
    'No time for marketing',
    NULL,
    '2026-05-12T20:00:00.000Z',
    '2026-05-12T20:00:00.000Z'
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
  SELECT id FROM public.crm_people WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'fedorova.margo.rita@gmail.com'
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
  'Margarita',
  'Fedorova',
  'fedorova.margo.rita@gmail.com',
  '0569174407',
  'Coach.margo.rita',
  'Gym',
  '$0 - $10,000',
  'Gym marketing',
  'No time for marketing',
  true,
  'new',
  '{"first_name":"Margarita","last_name":"Fedorova","email":"fedorova.margo.rita@gmail.com","phone":"0569174407","social_username":"Coach.margo.rita","country":"United Arab Emirates","content_language":"","business_type":"Gym","monthly_income_range":"$0 - $10,000","goals_objectives":"Gym marketing","obstacles":"No time for marketing","call_attendance_confirmation":"Yes","status":"new","notes":"","date_added":"May 13, 2026"}'::jsonb,
  'United Arab Emirates',
  NULL,
  false,
  '2026-05-12T20:00:00.000Z',
  '2026-05-12T20:00:00.000Z'
WHERE NOT EXISTS (
  SELECT 1 FROM public.leads WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'fedorova.margo.rita@gmail.com'
);


-- Lead 23: Osman Gumus (osman.gumus@outlook.com)
WITH inserted_person AS (
  INSERT INTO public.crm_people (
    tenant_id, full_name, email, phone, instagram, country, income_range, goal, obstacle, notes, created_at, updated_at
  ) VALUES (
    '520a4cfd-5183-4e11-aecc-bc71a52978b6',
    'Osman Gumus',
    'osman.gumus@outlook.com',
    '+971505321907',
    'osmang',
    'United Arab Emirates',
    '$0 - $10,000',
    'Building personal brand and close more deals by getting leads through social media',
    'Kinda being nervous in front of camera not feeling %100 comfortable',
    NULL,
    '2026-05-12T20:00:00.000Z',
    '2026-05-12T20:00:00.000Z'
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
  SELECT id FROM public.crm_people WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'osman.gumus@outlook.com'
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
  'Osman',
  'Gumus',
  'osman.gumus@outlook.com',
  '+971505321907',
  'osmang',
  'Consultant',
  '$0 - $10,000',
  'Building personal brand and close more deals by getting leads through social media',
  'Kinda being nervous in front of camera not feeling %100 comfortable',
  true,
  'new',
  '{"first_name":"Osman","last_name":"Gumus","email":"osman.gumus@outlook.com","phone":"+971505321907","social_username":"osmang","country":"United Arab Emirates","content_language":"","business_type":"Consultant","monthly_income_range":"$0 - $10,000","goals_objectives":"Building personal brand and close more deals by getting leads through social media","obstacles":"Kinda being nervous in front of camera not feeling %100 comfortable","call_attendance_confirmation":"Yes","status":"new","notes":"","date_added":"May 13, 2026"}'::jsonb,
  'United Arab Emirates',
  NULL,
  false,
  '2026-05-12T20:00:00.000Z',
  '2026-05-12T20:00:00.000Z'
WHERE NOT EXISTS (
  SELECT 1 FROM public.leads WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'osman.gumus@outlook.com'
);


-- Lead 24: fd sdfg (dfgdfs@gmail.com)
WITH inserted_person AS (
  INSERT INTO public.crm_people (
    tenant_id, full_name, email, phone, instagram, country, income_range, goal, obstacle, notes, created_at, updated_at
  ) VALUES (
    '520a4cfd-5183-4e11-aecc-bc71a52978b6',
    'fd sdfg',
    'dfgdfs@gmail.com',
    '+445675675678',
    '@dfgfgergrthet',
    'United Arab Emirates',
    '$0 - $10,000',
    'zvcb',
    'dfgsdfg',
    NULL,
    '2026-05-12T20:00:00.000Z',
    '2026-05-12T20:00:00.000Z'
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
  SELECT id FROM public.crm_people WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'dfgdfs@gmail.com'
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
  'fd',
  'sdfg',
  'dfgdfs@gmail.com',
  '+445675675678',
  '@dfgfgergrthet',
  'Entrepreneur',
  '$0 - $10,000',
  'zvcb',
  'dfgsdfg',
  true,
  'new',
  '{"first_name":"fd","last_name":"sdfg","email":"dfgdfs@gmail.com","phone":"+445675675678","social_username":"@dfgfgergrthet","country":"United Arab Emirates","content_language":"","business_type":"Entrepreneur","monthly_income_range":"$0 - $10,000","goals_objectives":"zvcb","obstacles":"dfgsdfg","call_attendance_confirmation":"Yes","status":"new","notes":"","date_added":"May 13, 2026"}'::jsonb,
  'United Arab Emirates',
  NULL,
  false,
  '2026-05-12T20:00:00.000Z',
  '2026-05-12T20:00:00.000Z'
WHERE NOT EXISTS (
  SELECT 1 FROM public.leads WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'dfgdfs@gmail.com'
);


-- Lead 25: Seerat Kaur (seerat.k7@gmail.com)
WITH inserted_person AS (
  INSERT INTO public.crm_people (
    tenant_id, full_name, email, phone, instagram, country, income_range, goal, obstacle, notes, created_at, updated_at
  ) VALUES (
    '520a4cfd-5183-4e11-aecc-bc71a52978b6',
    'Seerat Kaur',
    'seerat.k7@gmail.com',
    '+971585423270',
    'Seeratk_',
    'United Arab Emirates',
    '$0 - $10,000',
    'I want to achieve consistent production and publication of good content.',
    'Inability to stay consistent and to maintain those systems that ensure consistency',
    NULL,
    '2026-05-11T20:00:00.000Z',
    '2026-05-11T20:00:00.000Z'
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
  SELECT id FROM public.crm_people WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'seerat.k7@gmail.com'
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
  'Seerat',
  'Kaur',
  'seerat.k7@gmail.com',
  '+971585423270',
  'Seeratk_',
  'Content Creator',
  '$0 - $10,000',
  'I want to achieve consistent production and publication of good content.',
  'Inability to stay consistent and to maintain those systems that ensure consistency',
  true,
  'new',
  '{"first_name":"Seerat","last_name":"Kaur","email":"seerat.k7@gmail.com","phone":"+971585423270","social_username":"Seeratk_","country":"United Arab Emirates","content_language":"","business_type":"Content Creator","monthly_income_range":"$0 - $10,000","goals_objectives":"I want to achieve consistent production and publication of good content.","obstacles":"Inability to stay consistent and to maintain those systems that ensure consistency","call_attendance_confirmation":"Yes","status":"new","notes":"","date_added":"May 12, 2026"}'::jsonb,
  'United Arab Emirates',
  NULL,
  false,
  '2026-05-11T20:00:00.000Z',
  '2026-05-11T20:00:00.000Z'
WHERE NOT EXISTS (
  SELECT 1 FROM public.leads WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'seerat.k7@gmail.com'
);


-- Lead 26: Seerat Kaur (seerat.k7@gmail.com)
WITH inserted_person AS (
  INSERT INTO public.crm_people (
    tenant_id, full_name, email, phone, instagram, country, income_range, goal, obstacle, notes, created_at, updated_at
  ) VALUES (
    '520a4cfd-5183-4e11-aecc-bc71a52978b6',
    'Seerat Kaur',
    'seerat.k7@gmail.com',
    '+971585423270',
    'Seeratk_',
    'United Arab Emirates',
    '$0 - $10,000',
    'I want to achieve consistent production and publication of good content',
    'Consistency and failure to maintain systems',
    NULL,
    '2026-05-11T20:00:00.000Z',
    '2026-05-11T20:00:00.000Z'
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
  SELECT id FROM public.crm_people WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'seerat.k7@gmail.com'
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
  'Seerat',
  'Kaur',
  'seerat.k7@gmail.com',
  '+971585423270',
  'Seeratk_',
  'Content Creator',
  '$0 - $10,000',
  'I want to achieve consistent production and publication of good content',
  'Consistency and failure to maintain systems',
  true,
  'new',
  '{"first_name":"Seerat","last_name":"Kaur","email":"seerat.k7@gmail.com","phone":"+971585423270","social_username":"Seeratk_","country":"United Arab Emirates","content_language":"","business_type":"Content Creator","monthly_income_range":"$0 - $10,000","goals_objectives":"I want to achieve consistent production and publication of good content","obstacles":"Consistency and failure to maintain systems","call_attendance_confirmation":"Yes","status":"new","notes":"","date_added":"May 12, 2026"}'::jsonb,
  'United Arab Emirates',
  NULL,
  false,
  '2026-05-11T20:00:00.000Z',
  '2026-05-11T20:00:00.000Z'
WHERE NOT EXISTS (
  SELECT 1 FROM public.leads WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'seerat.k7@gmail.com'
);


-- Lead 27: Ali Ahmed (zubair.aliahmed19@gmail.com)
WITH inserted_person AS (
  INSERT INTO public.crm_people (
    tenant_id, full_name, email, phone, instagram, country, income_range, goal, obstacle, notes, created_at, updated_at
  ) VALUES (
    '520a4cfd-5183-4e11-aecc-bc71a52978b6',
    'Ali Ahmed',
    'zubair.aliahmed19@gmail.com',
    '971585494490',
    'aliahmed.realestate',
    'United Arab Emirates',
    '$0 - $10,000',
    'Social video content - videos leads marketting',
    'Dont know where to start or how to start.',
    NULL,
    '2026-05-11T20:00:00.000Z',
    '2026-05-11T20:00:00.000Z'
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
  SELECT id FROM public.crm_people WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'zubair.aliahmed19@gmail.com'
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
  'Ahmed',
  'zubair.aliahmed19@gmail.com',
  '971585494490',
  'aliahmed.realestate',
  'Off plan  real estate',
  '$0 - $10,000',
  'Social video content - videos leads marketting',
  'Dont know where to start or how to start.',
  true,
  'new',
  '{"first_name":"Ali","last_name":"Ahmed","email":"zubair.aliahmed19@gmail.com","phone":"971585494490","social_username":"aliahmed.realestate","country":"United Arab Emirates","content_language":"","business_type":"Off plan  real estate","monthly_income_range":"$0 - $10,000","goals_objectives":"Social video content - videos leads marketting","obstacles":"Dont know where to start or how to start.","call_attendance_confirmation":"Yes","status":"new","notes":"","date_added":"May 12, 2026"}'::jsonb,
  'United Arab Emirates',
  NULL,
  false,
  '2026-05-11T20:00:00.000Z',
  '2026-05-11T20:00:00.000Z'
WHERE NOT EXISTS (
  SELECT 1 FROM public.leads WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'zubair.aliahmed19@gmail.com'
);


-- Lead 28: Abbas Rajani (geniousabbas@gmail.com)
WITH inserted_person AS (
  INSERT INTO public.crm_people (
    tenant_id, full_name, email, phone, instagram, country, income_range, goal, obstacle, notes, created_at, updated_at
  ) VALUES (
    '520a4cfd-5183-4e11-aecc-bc71a52978b6',
    'Abbas Rajani',
    'geniousabbas@gmail.com',
    '+1 (737) 297-0461',
    'https://www.instagram.com/abbas_rajani/',
    'United States of America (the)',
    '$0 - $10,000',
    'My goal is to build a personal brand through content creation on Instagram and TikTok, with the objective of establishing credibility and attracting potential clients toward my social media marketing services.',
    'My biggest obstacle is clarity — I''m unsure how to structure my content and present myself in a way that effectively communicates my expertise and attracts the right audience.',
    NULL,
    '2026-05-11T20:00:00.000Z',
    '2026-05-11T20:00:00.000Z'
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
  SELECT id FROM public.crm_people WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'geniousabbas@gmail.com'
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
  'Abbas',
  'Rajani',
  'geniousabbas@gmail.com',
  '+1 (737) 297-0461',
  'https://www.instagram.com/abbas_rajani/',
  'Service Provider, Entrepreneur',
  '$0 - $10,000',
  'My goal is to build a personal brand through content creation on Instagram and TikTok, with the objective of establishing credibility and attracting potential clients toward my social media marketing services.',
  'My biggest obstacle is clarity — I''m unsure how to structure my content and present myself in a way that effectively communicates my expertise and attracts the right audience.',
  true,
  'new',
  '{"first_name":"Abbas","last_name":"Rajani","email":"geniousabbas@gmail.com","phone":"+1 (737) 297-0461","social_username":"https://www.instagram.com/abbas_rajani/","country":"United States of America (the)","content_language":"","business_type":"Service Provider, Entrepreneur","monthly_income_range":"$0 - $10,000","goals_objectives":"My goal is to build a personal brand through content creation on Instagram and TikTok, with the objective of establishing credibility and attracting potential clients toward my social media marketing services.","obstacles":"My biggest obstacle is clarity — I''m unsure how to structure my content and present myself in a way that effectively communicates my expertise and attracts the right audience.","call_attendance_confirmation":"Yes","status":"new","notes":"","date_added":"May 12, 2026"}'::jsonb,
  'United States of America (the)',
  NULL,
  false,
  '2026-05-11T20:00:00.000Z',
  '2026-05-11T20:00:00.000Z'
WHERE NOT EXISTS (
  SELECT 1 FROM public.leads WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'geniousabbas@gmail.com'
);


-- Lead 29: Narek Harutyunyan (nar.harutyunyan@gmail.com)
WITH inserted_person AS (
  INSERT INTO public.crm_people (
    tenant_id, full_name, email, phone, instagram, country, income_range, goal, obstacle, notes, created_at, updated_at
  ) VALUES (
    '520a4cfd-5183-4e11-aecc-bc71a52978b6',
    'Narek Harutyunyan',
    'nar.harutyunyan@gmail.com',
    '+971582743868',
    '@narek_dubai',
    'United Arab Emirates',
    '$0 - $10,000',
    'Getting audience, generating leads, becoming a known real estate advisor,',
    'Quality content, choosing the right audience',
    NULL,
    '2026-05-10T20:00:00.000Z',
    '2026-05-10T20:00:00.000Z'
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
  SELECT id FROM public.crm_people WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'nar.harutyunyan@gmail.com'
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
  'Narek',
  'Harutyunyan',
  'nar.harutyunyan@gmail.com',
  '+971582743868',
  '@narek_dubai',
  'Consultant, Real Estate Agency',
  '$0 - $10,000',
  'Getting audience, generating leads, becoming a known real estate advisor,',
  'Quality content, choosing the right audience',
  true,
  'new',
  '{"first_name":"Narek","last_name":"Harutyunyan","email":"nar.harutyunyan@gmail.com","phone":"+971582743868","social_username":"@narek_dubai","country":"United Arab Emirates","content_language":"","business_type":"Consultant, Real Estate Agency","monthly_income_range":"$0 - $10,000","goals_objectives":"Getting audience, generating leads, becoming a known real estate advisor,","obstacles":"Quality content, choosing the right audience","call_attendance_confirmation":"Yes","status":"new","notes":"","date_added":"May 11, 2026"}'::jsonb,
  'United Arab Emirates',
  NULL,
  false,
  '2026-05-10T20:00:00.000Z',
  '2026-05-10T20:00:00.000Z'
WHERE NOT EXISTS (
  SELECT 1 FROM public.leads WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'nar.harutyunyan@gmail.com'
);


-- Lead 30: Yazan Kataish (yazan.kataish@alwanfitout.com)
WITH inserted_person AS (
  INSERT INTO public.crm_people (
    tenant_id, full_name, email, phone, instagram, country, income_range, goal, obstacle, notes, created_at, updated_at
  ) VALUES (
    '520a4cfd-5183-4e11-aecc-bc71a52978b6',
    'Yazan Kataish',
    'yazan.kataish@alwanfitout.com',
    '0522828505',
    'Alwanfitout',
    'United Arab Emirates',
    '$50,000 - $100,000',
    'Generate high quality leads and sign off new projects',
    'Many reasons',
    NULL,
    '2026-05-10T20:00:00.000Z',
    '2026-05-10T20:00:00.000Z'
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
  SELECT id FROM public.crm_people WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'yazan.kataish@alwanfitout.com'
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
  'Yazan',
  'Kataish',
  'yazan.kataish@alwanfitout.com',
  '0522828505',
  'Alwanfitout',
  'Fitout and construction services',
  '$50,000 - $100,000',
  'Generate high quality leads and sign off new projects',
  'Many reasons',
  true,
  'new',
  '{"first_name":"Yazan","last_name":"Kataish","email":"yazan.kataish@alwanfitout.com","phone":"0522828505","social_username":"Alwanfitout","country":"United Arab Emirates","content_language":"","business_type":"Fitout and construction services","monthly_income_range":"$50,000 - $100,000","goals_objectives":"Generate high quality leads and sign off new projects","obstacles":"Many reasons","call_attendance_confirmation":"Yes","status":"new","notes":"","date_added":"May 11, 2026"}'::jsonb,
  'United Arab Emirates',
  NULL,
  false,
  '2026-05-10T20:00:00.000Z',
  '2026-05-10T20:00:00.000Z'
WHERE NOT EXISTS (
  SELECT 1 FROM public.leads WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'yazan.kataish@alwanfitout.com'
);


-- Lead 31: Hussam Beydoun (hussambeydoun@gmail.com)
WITH inserted_person AS (
  INSERT INTO public.crm_people (
    tenant_id, full_name, email, phone, instagram, country, income_range, goal, obstacle, notes, created_at, updated_at
  ) VALUES (
    '520a4cfd-5183-4e11-aecc-bc71a52978b6',
    'Hussam Beydoun',
    'hussambeydoun@gmail.com',
    '0522438818',
    'Hussambeydoun',
    'United Arab Emirates',
    '$0 - $10,000',
    'Personal branding and building trust with real estate investors',
    'Finding the right content and marketing agency',
    NULL,
    '2026-05-10T20:00:00.000Z',
    '2026-05-10T20:00:00.000Z'
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
  SELECT id FROM public.crm_people WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'hussambeydoun@gmail.com'
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
  'Hussam',
  'Beydoun',
  'hussambeydoun@gmail.com',
  '0522438818',
  'Hussambeydoun',
  'Real estate consultant',
  '$0 - $10,000',
  'Personal branding and building trust with real estate investors',
  'Finding the right content and marketing agency',
  true,
  'new',
  '{"first_name":"Hussam","last_name":"Beydoun","email":"hussambeydoun@gmail.com","phone":"0522438818","social_username":"Hussambeydoun","country":"United Arab Emirates","content_language":"","business_type":"Real estate consultant","monthly_income_range":"$0 - $10,000","goals_objectives":"Personal branding and building trust with real estate investors","obstacles":"Finding the right content and marketing agency","call_attendance_confirmation":"Yes","status":"new","notes":"","date_added":"May 11, 2026"}'::jsonb,
  'United Arab Emirates',
  NULL,
  false,
  '2026-05-10T20:00:00.000Z',
  '2026-05-10T20:00:00.000Z'
WHERE NOT EXISTS (
  SELECT 1 FROM public.leads WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'hussambeydoun@gmail.com'
);


-- Lead 32: Narek Harutyunyan (nar.harutyunyan@gmail.com)
WITH inserted_person AS (
  INSERT INTO public.crm_people (
    tenant_id, full_name, email, phone, instagram, country, income_range, goal, obstacle, notes, created_at, updated_at
  ) VALUES (
    '520a4cfd-5183-4e11-aecc-bc71a52978b6',
    'Narek Harutyunyan',
    'nar.harutyunyan@gmail.com',
    '+971582743868',
    'narek_dubai',
    'United Arab Emirates',
    '$0 - $10,000',
    'Reach out to new people and go viral be most know real estate advisor',
    'Getting leads, becoming popular on OG',
    NULL,
    '2026-05-10T20:00:00.000Z',
    '2026-05-10T20:00:00.000Z'
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
  SELECT id FROM public.crm_people WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'nar.harutyunyan@gmail.com'
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
  'Narek',
  'Harutyunyan',
  'nar.harutyunyan@gmail.com',
  '+971582743868',
  'narek_dubai',
  'Consultant, Real Estate',
  '$0 - $10,000',
  'Reach out to new people and go viral be most know real estate advisor',
  'Getting leads, becoming popular on OG',
  true,
  'new',
  '{"first_name":"Narek","last_name":"Harutyunyan","email":"nar.harutyunyan@gmail.com","phone":"+971582743868","social_username":"narek_dubai","country":"United Arab Emirates","content_language":"","business_type":"Consultant, Real Estate","monthly_income_range":"$0 - $10,000","goals_objectives":"Reach out to new people and go viral be most know real estate advisor","obstacles":"Getting leads, becoming popular on OG","call_attendance_confirmation":"Yes","status":"new","notes":"","date_added":"May 11, 2026"}'::jsonb,
  'United Arab Emirates',
  NULL,
  false,
  '2026-05-10T20:00:00.000Z',
  '2026-05-10T20:00:00.000Z'
WHERE NOT EXISTS (
  SELECT 1 FROM public.leads WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'nar.harutyunyan@gmail.com'
);


-- Lead 33: Omar Messky (omarmeski@maven-x.com)
WITH inserted_person AS (
  INSERT INTO public.crm_people (
    tenant_id, full_name, email, phone, instagram, country, income_range, goal, obstacle, notes, created_at, updated_at
  ) VALUES (
    '520a4cfd-5183-4e11-aecc-bc71a52978b6',
    'Omar Messky',
    'omarmeski@maven-x.com',
    '+971553253483',
    '@omarmeski',
    'United Arab Emirates',
    '$10,000 - $30,000',
    'Test',
    'Test',
    NULL,
    '2026-05-10T20:00:00.000Z',
    '2026-05-10T20:00:00.000Z'
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
  '@omarmeski',
  'Entrepreneur',
  '$10,000 - $30,000',
  'Test',
  'Test',
  true,
  'new',
  '{"first_name":"Omar","last_name":"Messky","email":"omarmeski@maven-x.com","phone":"+971553253483","social_username":"@omarmeski","country":"United Arab Emirates","content_language":"","business_type":"Entrepreneur","monthly_income_range":"$10,000 - $30,000","goals_objectives":"Test","obstacles":"Test","call_attendance_confirmation":"Yes","status":"new","notes":"","date_added":"May 11, 2026"}'::jsonb,
  'United Arab Emirates',
  NULL,
  false,
  '2026-05-10T20:00:00.000Z',
  '2026-05-10T20:00:00.000Z'
WHERE NOT EXISTS (
  SELECT 1 FROM public.leads WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'omarmeski@maven-x.com'
);


-- Lead 34: Jean-Pierre Traboulsi (traboulsijp@gmail.com)
WITH inserted_person AS (
  INSERT INTO public.crm_people (
    tenant_id, full_name, email, phone, instagram, country, income_range, goal, obstacle, notes, created_at, updated_at
  ) VALUES (
    '520a4cfd-5183-4e11-aecc-bc71a52978b6',
    'Jean-Pierre Traboulsi',
    'traboulsijp@gmail.com',
    '507683090',
    'traboulsijp@gmail.com',
    'United Arab Emirates',
    '$0 - $10,000',
    'Create leads for a new business',
    'Market, war, reaching the right customer',
    NULL,
    '2026-05-09T20:00:00.000Z',
    '2026-05-09T20:00:00.000Z'
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
  SELECT id FROM public.crm_people WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'traboulsijp@gmail.com'
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
  'Jean-Pierre',
  'Traboulsi',
  'traboulsijp@gmail.com',
  '507683090',
  'traboulsijp@gmail.com',
  'Home Spa',
  '$0 - $10,000',
  'Create leads for a new business',
  'Market, war, reaching the right customer',
  true,
  'new',
  '{"first_name":"Jean-Pierre","last_name":"Traboulsi","email":"traboulsijp@gmail.com","phone":"507683090","social_username":"traboulsijp@gmail.com","country":"United Arab Emirates","content_language":"","business_type":"Home Spa","monthly_income_range":"$0 - $10,000","goals_objectives":"Create leads for a new business","obstacles":"Market, war, reaching the right customer","call_attendance_confirmation":"Yes","status":"new","notes":"","date_added":"May 10, 2026"}'::jsonb,
  'United Arab Emirates',
  NULL,
  false,
  '2026-05-09T20:00:00.000Z',
  '2026-05-09T20:00:00.000Z'
WHERE NOT EXISTS (
  SELECT 1 FROM public.leads WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'traboulsijp@gmail.com'
);


-- Lead 35: Mohamed Bahnasi (dentsobhi@gmail.com)
WITH inserted_person AS (
  INSERT INTO public.crm_people (
    tenant_id, full_name, email, phone, instagram, country, income_range, goal, obstacle, notes, created_at, updated_at
  ) VALUES (
    '520a4cfd-5183-4e11-aecc-bc71a52978b6',
    'Mohamed Bahnasi',
    'dentsobhi@gmail.com',
    '+971562666021',
    'Dr.penthousedxb',
    'United Arab Emirates',
    '$0 - $10,000',
    'Generate lead and increase sales volume and followers',
    'Market challenges',
    NULL,
    '2026-05-09T20:00:00.000Z',
    '2026-05-09T20:00:00.000Z'
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
  SELECT id FROM public.crm_people WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'dentsobhi@gmail.com'
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
  'Bahnasi',
  'dentsobhi@gmail.com',
  '+971562666021',
  'Dr.penthousedxb',
  'Entrepreneur, Consultant, Service Provider',
  '$0 - $10,000',
  'Generate lead and increase sales volume and followers',
  'Market challenges',
  true,
  'new',
  '{"first_name":"Mohamed","last_name":"Bahnasi","email":"dentsobhi@gmail.com","phone":"+971562666021","social_username":"Dr.penthousedxb","country":"United Arab Emirates","content_language":"","business_type":"Entrepreneur, Consultant, Service Provider","monthly_income_range":"$0 - $10,000","goals_objectives":"Generate lead and increase sales volume and followers","obstacles":"Market challenges","call_attendance_confirmation":"Yes","status":"new","notes":"","date_added":"May 10, 2026"}'::jsonb,
  'United Arab Emirates',
  NULL,
  false,
  '2026-05-09T20:00:00.000Z',
  '2026-05-09T20:00:00.000Z'
WHERE NOT EXISTS (
  SELECT 1 FROM public.leads WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'dentsobhi@gmail.com'
);


-- Lead 36: Sandy Aouad (sandyaouad@hotmail.com)
WITH inserted_person AS (
  INSERT INTO public.crm_people (
    tenant_id, full_name, email, phone, instagram, country, income_range, goal, obstacle, notes, created_at, updated_at
  ) VALUES (
    '520a4cfd-5183-4e11-aecc-bc71a52978b6',
    'Sandy Aouad',
    'sandyaouad@hotmail.com',
    '+971549969606',
    'Sandyaouad1',
    'France',
    '$10,000 - $30,000',
    'I have 3 campaigns 

Sandy Aouad ( public figure ) ( usa/uk)
Beauty of poverty ( Movie ) ( usa/uk )
Sandy Aouad ( Publish figure ) ( Arab world )',
    'Someone is after ny accounts always',
    NULL,
    '2026-05-09T20:00:00.000Z',
    '2026-05-09T20:00:00.000Z'
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
  SELECT id FROM public.crm_people WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'sandyaouad@hotmail.com'
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
  'Sandy',
  'Aouad',
  'sandyaouad@hotmail.com',
  '+971549969606',
  'Sandyaouad1',
  'I have a movie called beauty of poverty on Prime Video, I have a brand new that will have a fashion show in Carlton Cannes and I have my own public figure as in me',
  '$10,000 - $30,000',
  'I have 3 campaigns 

Sandy Aouad ( public figure ) ( usa/uk)
Beauty of poverty ( Movie ) ( usa/uk )
Sandy Aouad ( Publish figure ) ( Arab world )',
  'Someone is after ny accounts always',
  true,
  'new',
  '{"first_name":"Sandy","last_name":"Aouad","email":"sandyaouad@hotmail.com","phone":"+971549969606","social_username":"Sandyaouad1","country":"France","content_language":"English, Arabic","business_type":"I have a movie called beauty of poverty on Prime Video, I have a brand new that will have a fashion show in Carlton Cannes and I have my own public figure as in me","monthly_income_range":"$10,000 - $30,000","goals_objectives":"I have 3 campaigns \n\nSandy Aouad ( public figure ) ( usa/uk)\nBeauty of poverty ( Movie ) ( usa/uk )\nSandy Aouad ( Publish figure ) ( Arab world )","obstacles":"Someone is after ny accounts always","call_attendance_confirmation":"Yes","status":"new","notes":"","date_added":"May 10, 2026"}'::jsonb,
  'France',
  'English, Arabic',
  false,
  '2026-05-09T20:00:00.000Z',
  '2026-05-09T20:00:00.000Z'
WHERE NOT EXISTS (
  SELECT 1 FROM public.leads WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'sandyaouad@hotmail.com'
);


-- Lead 37: Hermann Tatang (hermanndxb@gmail.com)
WITH inserted_person AS (
  INSERT INTO public.crm_people (
    tenant_id, full_name, email, phone, instagram, country, income_range, goal, obstacle, notes, created_at, updated_at
  ) VALUES (
    '520a4cfd-5183-4e11-aecc-bc71a52978b6',
    'Hermann Tatang',
    'hermanndxb@gmail.com',
    '+971558094017',
    '@hermanndxb',
    'United Arab Emirates',
    '$0 - $10,000',
    '50k social media followers and make 500k commission from social media in the next 12 months',
    'Time and consistency',
    NULL,
    '2026-05-08T20:00:00.000Z',
    '2026-05-08T20:00:00.000Z'
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
  SELECT id FROM public.crm_people WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'hermanndxb@gmail.com'
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
  'Hermann',
  'Tatang',
  'hermanndxb@gmail.com',
  '+971558094017',
  '@hermanndxb',
  'Realtor',
  '$0 - $10,000',
  '50k social media followers and make 500k commission from social media in the next 12 months',
  'Time and consistency',
  true,
  'new',
  '{"first_name":"Hermann","last_name":"Tatang","email":"hermanndxb@gmail.com","phone":"+971558094017","social_username":"@hermanndxb","country":"United Arab Emirates","content_language":"","business_type":"Realtor","monthly_income_range":"$0 - $10,000","goals_objectives":"50k social media followers and make 500k commission from social media in the next 12 months","obstacles":"Time and consistency","call_attendance_confirmation":"Yes","status":"new","notes":"","date_added":"May 9, 2026"}'::jsonb,
  'United Arab Emirates',
  NULL,
  false,
  '2026-05-08T20:00:00.000Z',
  '2026-05-08T20:00:00.000Z'
WHERE NOT EXISTS (
  SELECT 1 FROM public.leads WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'hermanndxb@gmail.com'
);


-- Lead 38: Ivan Molchanov (ivan@vanmolch.com)
WITH inserted_person AS (
  INSERT INTO public.crm_people (
    tenant_id, full_name, email, phone, instagram, country, income_range, goal, obstacle, notes, created_at, updated_at
  ) VALUES (
    '520a4cfd-5183-4e11-aecc-bc71a52978b6',
    'Ivan Molchanov',
    'ivan@vanmolch.com',
    '+31640958586',
    '@ivanmolch',
    'United Arab Emirates',
    '$30,000 - $50,000',
    'Build online presence to establish community',
    'No online presence',
    NULL,
    '2026-05-08T20:00:00.000Z',
    '2026-05-08T20:00:00.000Z'
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
  SELECT id FROM public.crm_people WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'ivan@vanmolch.com'
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
  'Ivan',
  'Molchanov',
  'ivan@vanmolch.com',
  '+31640958586',
  '@ivanmolch',
  'Broker',
  '$30,000 - $50,000',
  'Build online presence to establish community',
  'No online presence',
  true,
  'new',
  '{"first_name":"Ivan","last_name":"Molchanov","email":"ivan@vanmolch.com","phone":"+31640958586","social_username":"@ivanmolch","country":"United Arab Emirates","content_language":"","business_type":"Broker","monthly_income_range":"$30,000 - $50,000","goals_objectives":"Build online presence to establish community","obstacles":"No online presence","call_attendance_confirmation":"Yes","status":"new","notes":"","date_added":"May 9, 2026"}'::jsonb,
  'United Arab Emirates',
  NULL,
  false,
  '2026-05-08T20:00:00.000Z',
  '2026-05-08T20:00:00.000Z'
WHERE NOT EXISTS (
  SELECT 1 FROM public.leads WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'ivan@vanmolch.com'
);


-- Lead 39: Sandeep Kotian (sandeep.kotian@justlife.com)
WITH inserted_person AS (
  INSERT INTO public.crm_people (
    tenant_id, full_name, email, phone, instagram, country, income_range, goal, obstacle, notes, created_at, updated_at
  ) VALUES (
    '520a4cfd-5183-4e11-aecc-bc71a52978b6',
    'Sandeep Kotian',
    'sandeep.kotian@justlife.com',
    '0586407092',
    'Sandeep_kotian_',
    'United Arab Emirates',
    '$0 - $10,000',
    'Get more followers',
    'Consistency',
    NULL,
    '2026-05-08T20:00:00.000Z',
    '2026-05-08T20:00:00.000Z'
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
  SELECT id FROM public.crm_people WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'sandeep.kotian@justlife.com'
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
  'Sandeep',
  'Kotian',
  'sandeep.kotian@justlife.com',
  '0586407092',
  'Sandeep_kotian_',
  'Service Provider',
  '$0 - $10,000',
  'Get more followers',
  'Consistency',
  true,
  'new',
  '{"first_name":"Sandeep","last_name":"Kotian","email":"sandeep.kotian@justlife.com","phone":"0586407092","social_username":"Sandeep_kotian_","country":"United Arab Emirates","content_language":"","business_type":"Service Provider","monthly_income_range":"$0 - $10,000","goals_objectives":"Get more followers","obstacles":"Consistency","call_attendance_confirmation":"Yes","status":"new","notes":"","date_added":"May 9, 2026"}'::jsonb,
  'United Arab Emirates',
  NULL,
  false,
  '2026-05-08T20:00:00.000Z',
  '2026-05-08T20:00:00.000Z'
WHERE NOT EXISTS (
  SELECT 1 FROM public.leads WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'sandeep.kotian@justlife.com'
);


-- Lead 40: Ta G (b)
WITH inserted_person AS (
  INSERT INTO public.crm_people (
    tenant_id, full_name, email, phone, instagram, country, income_range, goal, obstacle, notes, created_at, updated_at
  ) VALUES (
    '520a4cfd-5183-4e11-aecc-bc71a52978b6',
    'Ta G',
    'b',
    '8',
    'B',
    'Åland Islands',
    '$10,000 - $30,000',
    'H',
    'H',
    NULL,
    '2026-05-08T20:00:00.000Z',
    '2026-05-08T20:00:00.000Z'
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
  SELECT id FROM public.crm_people WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'b'
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
  'Ta',
  'G',
  'b',
  '8',
  'B',
  'Service Provider',
  '$10,000 - $30,000',
  'H',
  'H',
  true,
  'new',
  '{"first_name":"Ta","last_name":"G","email":"b","phone":"8","social_username":"B","country":"Åland Islands","content_language":"","business_type":"Service Provider","monthly_income_range":"$10,000 - $30,000","goals_objectives":"H","obstacles":"H","call_attendance_confirmation":"Yes","status":"new","notes":"","date_added":"May 9, 2026"}'::jsonb,
  'Åland Islands',
  NULL,
  false,
  '2026-05-08T20:00:00.000Z',
  '2026-05-08T20:00:00.000Z'
WHERE NOT EXISTS (
  SELECT 1 FROM public.leads WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'b'
);


-- Lead 41: Anas Yassin (anas.gtr.95@gmail.com)
WITH inserted_person AS (
  INSERT INTO public.crm_people (
    tenant_id, full_name, email, phone, instagram, country, income_range, goal, obstacle, notes, created_at, updated_at
  ) VALUES (
    '520a4cfd-5183-4e11-aecc-bc71a52978b6',
    'Anas Yassin',
    'anas.gtr.95@gmail.com',
    '0507048022',
    'Anasyassiin',
    'United Arab Emirates',
    '$0 - $10,000',
    '1',
    'q',
    NULL,
    '2026-05-08T20:00:00.000Z',
    '2026-05-08T20:00:00.000Z'
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
  SELECT id FROM public.crm_people WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'anas.gtr.95@gmail.com'
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
  'Yassin',
  'anas.gtr.95@gmail.com',
  '0507048022',
  'Anasyassiin',
  'Consultant, Content Creator, Online Coach',
  '$0 - $10,000',
  '1',
  'q',
  true,
  'new',
  '{"first_name":"Anas","last_name":"Yassin","email":"anas.gtr.95@gmail.com","phone":"0507048022","social_username":"Anasyassiin","country":"United Arab Emirates","content_language":"","business_type":"Consultant, Content Creator, Online Coach","monthly_income_range":"$0 - $10,000","goals_objectives":"1","obstacles":"q","call_attendance_confirmation":"Yes","status":"new","notes":"","date_added":"May 9, 2026"}'::jsonb,
  'United Arab Emirates',
  NULL,
  false,
  '2026-05-08T20:00:00.000Z',
  '2026-05-08T20:00:00.000Z'
WHERE NOT EXISTS (
  SELECT 1 FROM public.leads WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'anas.gtr.95@gmail.com'
);


-- Lead 42: Sandra Azizi (sandra@watchxglobal.com)
WITH inserted_person AS (
  INSERT INTO public.crm_people (
    tenant_id, full_name, email, phone, instagram, country, income_range, goal, obstacle, notes, created_at, updated_at
  ) VALUES (
    '520a4cfd-5183-4e11-aecc-bc71a52978b6',
    'Sandra Azizi',
    'sandra@watchxglobal.com',
    '+971566836338',
    'Watchxdxb',
    'United Arab Emirates',
    '$0 - $10,000',
    'I want to speak to someone from the team',
    'No obstacles, evaluating options',
    NULL,
    '2026-05-08T20:00:00.000Z',
    '2026-05-08T20:00:00.000Z'
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
  SELECT id FROM public.crm_people WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'sandra@watchxglobal.com'
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
  'Sandra',
  'Azizi',
  'sandra@watchxglobal.com',
  '+971566836338',
  'Watchxdxb',
  'Entrepreneur',
  '$0 - $10,000',
  'I want to speak to someone from the team',
  'No obstacles, evaluating options',
  true,
  'new',
  '{"first_name":"Sandra","last_name":"Azizi","email":"sandra@watchxglobal.com","phone":"+971566836338","social_username":"Watchxdxb","country":"United Arab Emirates","content_language":"","business_type":"Entrepreneur","monthly_income_range":"$0 - $10,000","goals_objectives":"I want to speak to someone from the team","obstacles":"No obstacles, evaluating options","call_attendance_confirmation":"Yes","status":"new","notes":"","date_added":"May 9, 2026"}'::jsonb,
  'United Arab Emirates',
  NULL,
  false,
  '2026-05-08T20:00:00.000Z',
  '2026-05-08T20:00:00.000Z'
WHERE NOT EXISTS (
  SELECT 1 FROM public.leads WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'sandra@watchxglobal.com'
);


-- Lead 43: Mohamed Mousa (m.mousa@passportgates.com)
WITH inserted_person AS (
  INSERT INTO public.crm_people (
    tenant_id, full_name, email, phone, instagram, country, income_range, goal, obstacle, notes, created_at, updated_at
  ) VALUES (
    '520a4cfd-5183-4e11-aecc-bc71a52978b6',
    'Mohamed Mousa',
    'm.mousa@passportgates.com',
    '+972528549971',
    '@mousa.s.m',
    'United Arab Emirates',
    '$10,000 - $30,000',
    'Leads through organic content. And being viral',
    'Views and leads quality',
    NULL,
    '2026-05-07T20:00:00.000Z',
    '2026-05-07T20:00:00.000Z'
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
  SELECT id FROM public.crm_people WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'm.mousa@passportgates.com'
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
  'Mousa',
  'm.mousa@passportgates.com',
  '+972528549971',
  '@mousa.s.m',
  'Service Provider',
  '$10,000 - $30,000',
  'Leads through organic content. And being viral',
  'Views and leads quality',
  true,
  'new',
  '{"first_name":"Mohamed","last_name":"Mousa","email":"m.mousa@passportgates.com","phone":"+972528549971","social_username":"@mousa.s.m","country":"United Arab Emirates","content_language":"","business_type":"Service Provider","monthly_income_range":"$10,000 - $30,000","goals_objectives":"Leads through organic content. And being viral","obstacles":"Views and leads quality","call_attendance_confirmation":"Yes","status":"new","notes":"","date_added":"May 8, 2026"}'::jsonb,
  'United Arab Emirates',
  NULL,
  false,
  '2026-05-07T20:00:00.000Z',
  '2026-05-07T20:00:00.000Z'
WHERE NOT EXISTS (
  SELECT 1 FROM public.leads WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'm.mousa@passportgates.com'
);


-- Lead 44: Omar Meski (omar.messky@gmail.com)
WITH inserted_person AS (
  INSERT INTO public.crm_people (
    tenant_id, full_name, email, phone, instagram, country, income_range, goal, obstacle, notes, created_at, updated_at
  ) VALUES (
    '520a4cfd-5183-4e11-aecc-bc71a52978b6',
    'Omar Meski',
    'omar.messky@gmail.com',
    '553253483',
    '@omarmeski',
    'United Arab Emirates',
    '$0 - $10,000',
    'Test',
    'Test',
    NULL,
    '2026-05-07T20:00:00.000Z',
    '2026-05-07T20:00:00.000Z'
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
  SELECT id FROM public.crm_people WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'omar.messky@gmail.com'
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
  'Meski',
  'omar.messky@gmail.com',
  '553253483',
  '@omarmeski',
  'Entrepreneur',
  '$0 - $10,000',
  'Test',
  'Test',
  true,
  'new',
  '{"first_name":"Omar","last_name":"Meski","email":"omar.messky@gmail.com","phone":"553253483","social_username":"@omarmeski","country":"United Arab Emirates","content_language":"","business_type":"Entrepreneur","monthly_income_range":"$0 - $10,000","goals_objectives":"Test","obstacles":"Test","call_attendance_confirmation":"Yes","status":"new","notes":"","date_added":"May 8, 2026"}'::jsonb,
  'United Arab Emirates',
  NULL,
  false,
  '2026-05-07T20:00:00.000Z',
  '2026-05-07T20:00:00.000Z'
WHERE NOT EXISTS (
  SELECT 1 FROM public.leads WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'omar.messky@gmail.com'
);


-- Lead 45: 12312 312312312 (31233213123@gmail.com)
WITH inserted_person AS (
  INSERT INTO public.crm_people (
    tenant_id, full_name, email, phone, instagram, country, income_range, goal, obstacle, notes, created_at, updated_at
  ) VALUES (
    '520a4cfd-5183-4e11-aecc-bc71a52978b6',
    '12312 312312312',
    '31233213123@gmail.com',
    '+97150187523',
    '@adib',
    'Åland Islands',
    '$10,000 - $30,000',
    '532rwcere3wrf',
    '23rf23qr3er23r23',
    NULL,
    '2026-05-07T20:00:00.000Z',
    '2026-05-07T20:00:00.000Z'
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
  SELECT id FROM public.crm_people WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = '31233213123@gmail.com'
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
  '12312',
  '312312312',
  '31233213123@gmail.com',
  '+97150187523',
  '@adib',
  'Service Provider',
  '$10,000 - $30,000',
  '532rwcere3wrf',
  '23rf23qr3er23r23',
  true,
  'new',
  '{"first_name":"12312","last_name":"312312312","email":"31233213123@gmail.com","phone":"+97150187523","social_username":"@adib","country":"Åland Islands","content_language":"","business_type":"Service Provider","monthly_income_range":"$10,000 - $30,000","goals_objectives":"532rwcere3wrf","obstacles":"23rf23qr3er23r23","call_attendance_confirmation":"Yes","status":"new","notes":"","date_added":"May 8, 2026"}'::jsonb,
  'Åland Islands',
  NULL,
  false,
  '2026-05-07T20:00:00.000Z',
  '2026-05-07T20:00:00.000Z'
WHERE NOT EXISTS (
  SELECT 1 FROM public.leads WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = '31233213123@gmail.com'
);


-- Lead 46: Test Revenue (test@revenue.com)
WITH inserted_person AS (
  INSERT INTO public.crm_people (
    tenant_id, full_name, email, phone, instagram, country, income_range, goal, obstacle, notes, created_at, updated_at
  ) VALUES (
    '520a4cfd-5183-4e11-aecc-bc71a52978b6',
    'Test Revenue',
    'test@revenue.com',
    '+971500000000',
    '@testrevenue',
    'United Arab Emirates',
    '$0 - $10,000',
    'Test disqualifier flow',
    'Testing',
    NULL,
    '2026-05-07T20:00:00.000Z',
    '2026-05-07T20:00:00.000Z'
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
  SELECT id FROM public.crm_people WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'test@revenue.com'
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
  'Revenue',
  'test@revenue.com',
  '+971500000000',
  '@testrevenue',
  'Consultant',
  '$0 - $10,000',
  'Test disqualifier flow',
  'Testing',
  true,
  'new',
  '{"first_name":"Test","last_name":"Revenue","email":"test@revenue.com","phone":"+971500000000","social_username":"@testrevenue","country":"United Arab Emirates","content_language":"","business_type":"Consultant","monthly_income_range":"$0 - $10,000","goals_objectives":"Test disqualifier flow","obstacles":"Testing","call_attendance_confirmation":"Yes","status":"new","notes":"","date_added":"May 8, 2026"}'::jsonb,
  'United Arab Emirates',
  NULL,
  false,
  '2026-05-07T20:00:00.000Z',
  '2026-05-07T20:00:00.000Z'
WHERE NOT EXISTS (
  SELECT 1 FROM public.leads WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'test@revenue.com'
);


-- Lead 47: Anas Benchikar (anassbenchikar@gmail.com)
WITH inserted_person AS (
  INSERT INTO public.crm_people (
    tenant_id, full_name, email, phone, instagram, country, income_range, goal, obstacle, notes, created_at, updated_at
  ) VALUES (
    '520a4cfd-5183-4e11-aecc-bc71a52978b6',
    'Anas Benchikar',
    'anassbenchikar@gmail.com',
    '0569018725',
    'Bettercallanasdxb',
    'United Arab Emirates',
    'Between $5k & $10k /mo',
    'Increase outbound Reach',
    'Format',
    NULL,
    '2026-05-07T20:00:00.000Z',
    '2026-05-07T20:00:00.000Z'
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
  SELECT id FROM public.crm_people WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'anassbenchikar@gmail.com'
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
  'Benchikar',
  'anassbenchikar@gmail.com',
  '0569018725',
  'Bettercallanasdxb',
  'Real estate',
  'Between $5k & $10k /mo',
  'Increase outbound Reach',
  'Format',
  true,
  'new',
  '{"first_name":"Anas","last_name":"Benchikar","email":"anassbenchikar@gmail.com","phone":"0569018725","social_username":"Bettercallanasdxb","country":"United Arab Emirates","content_language":"","business_type":"Real estate","monthly_income_range":"Between $5k & $10k /mo","goals_objectives":"Increase outbound Reach","obstacles":"Format","call_attendance_confirmation":"Yes","status":"new","notes":"","date_added":"May 8, 2026"}'::jsonb,
  'United Arab Emirates',
  NULL,
  false,
  '2026-05-07T20:00:00.000Z',
  '2026-05-07T20:00:00.000Z'
WHERE NOT EXISTS (
  SELECT 1 FROM public.leads WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'anassbenchikar@gmail.com'
);


-- Lead 48: Sarah Salibi (info.sarahsalibi@gmail.com)
WITH inserted_person AS (
  INSERT INTO public.crm_people (
    tenant_id, full_name, email, phone, instagram, country, income_range, goal, obstacle, notes, created_at, updated_at
  ) VALUES (
    '520a4cfd-5183-4e11-aecc-bc71a52978b6',
    'Sarah Salibi',
    'info.sarahsalibi@gmail.com',
    '+971509298767',
    'Sarahsalibi',
    'United Arab Emirates',
    'Between $5k & $10k /mo',
    'Relevant content creation that can boost my podcast views and monetize it',
    'Lack of having a team so i get to do all of it alone and it is not sustainable',
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
  SELECT id FROM public.crm_people WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'info.sarahsalibi@gmail.com'
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
  'Salibi',
  'info.sarahsalibi@gmail.com',
  '+971509298767',
  'Sarahsalibi',
  'Content Creator',
  'Between $5k & $10k /mo',
  'Relevant content creation that can boost my podcast views and monetize it',
  'Lack of having a team so i get to do all of it alone and it is not sustainable',
  true,
  'new',
  '{"first_name":"Sarah","last_name":"Salibi","email":"info.sarahsalibi@gmail.com","phone":"+971509298767","social_username":"Sarahsalibi","country":"United Arab Emirates","content_language":"","business_type":"Content Creator","monthly_income_range":"Between $5k & $10k /mo","goals_objectives":"Relevant content creation that can boost my podcast views and monetize it","obstacles":"Lack of having a team so i get to do all of it alone and it is not sustainable","call_attendance_confirmation":"Yes","status":"new","notes":"","date_added":"May 7, 2026"}'::jsonb,
  'United Arab Emirates',
  NULL,
  false,
  '2026-05-06T20:00:00.000Z',
  '2026-05-06T20:00:00.000Z'
WHERE NOT EXISTS (
  SELECT 1 FROM public.leads WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'info.sarahsalibi@gmail.com'
);


-- Lead 49: Test Submission (test@clipsos.com)
WITH inserted_person AS (
  INSERT INTO public.crm_people (
    tenant_id, full_name, email, phone, instagram, country, income_range, goal, obstacle, notes, created_at, updated_at
  ) VALUES (
    '520a4cfd-5183-4e11-aecc-bc71a52978b6',
    'Test Submission',
    'test@clipsos.com',
    '+971501234567',
    '@testuser',
    'United Arab Emirates',
    'More than $10k /mo',
    'Testing form submission',
    'Testing obstacle field',
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
  SELECT id FROM public.crm_people WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'test@clipsos.com'
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
  'Submission',
  'test@clipsos.com',
  '+971501234567',
  '@testuser',
  'Consultant',
  'More than $10k /mo',
  'Testing form submission',
  'Testing obstacle field',
  true,
  'new',
  '{"first_name":"Test","last_name":"Submission","email":"test@clipsos.com","phone":"+971501234567","social_username":"@testuser","country":"United Arab Emirates","content_language":"","business_type":"Consultant","monthly_income_range":"More than $10k /mo","goals_objectives":"Testing form submission","obstacles":"Testing obstacle field","call_attendance_confirmation":"Yes","status":"new","notes":"","date_added":"May 7, 2026"}'::jsonb,
  'United Arab Emirates',
  NULL,
  false,
  '2026-05-06T20:00:00.000Z',
  '2026-05-06T20:00:00.000Z'
WHERE NOT EXISTS (
  SELECT 1 FROM public.leads WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'test@clipsos.com'
);


-- Lead 50: adib testing (adib@theclips.agency)
WITH inserted_person AS (
  INSERT INTO public.crm_people (
    tenant_id, full_name, email, phone, instagram, country, income_range, goal, obstacle, notes, created_at, updated_at
  ) VALUES (
    '520a4cfd-5183-4e11-aecc-bc71a52978b6',
    'adib testing',
    'adib@theclips.agency',
    '+971',
    '@adib',
    'Afghanistan',
    'More than $10k /mo',
    '213123123213',
    '1312312321313',
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
  SELECT id FROM public.crm_people WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'adib@theclips.agency'
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
  'adib',
  'testing',
  'adib@theclips.agency',
  '+971',
  '@adib',
  'Service Provider',
  'More than $10k /mo',
  '213123123213',
  '1312312321313',
  true,
  'new',
  '{"first_name":"adib","last_name":"testing","email":"adib@theclips.agency","phone":"+971","social_username":"@adib","country":"Afghanistan","content_language":"","business_type":"Service Provider","monthly_income_range":"More than $10k /mo","goals_objectives":"213123123213","obstacles":"1312312321313","call_attendance_confirmation":"Yes","status":"new","notes":"","date_added":"May 7, 2026"}'::jsonb,
  'Afghanistan',
  NULL,
  false,
  '2026-05-06T20:00:00.000Z',
  '2026-05-06T20:00:00.000Z'
WHERE NOT EXISTS (
  SELECT 1 FROM public.leads WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'adib@theclips.agency'
);


-- Lead 51: Test Test (test@test.com)
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


-- Lead 52: Rania Barghout (rania@thenextchapter.vip)
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


-- Lead 53: Safwan Ayach (griffine.no2@gmail.com)
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


-- Lead 54: Selin Cetin (scmacos@icloud.com)
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


-- Lead 55: Francesco Ceccarini (francesco@bullwaves.com)
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


-- Lead 56: Lucas Silva (lucassilva.malden@gmail.com)
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


-- Lead 57: Mukhammadjon Tilavov (tilavoff27@gmail.com)
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


-- Lead 58: Najah Musthafa (najahmusthafa@gmail.com)
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


-- Lead 59: Jagdish Golani (jsginfinite@gmail.com)
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


-- Lead 60: Khalid Majed (khalidmajed7@gmail.com)
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


-- Lead 61: Drhanadi Khamiri (hanadi.khamiri@hotmail.com)
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


-- Lead 62: Anas Idries (anas.fouad@hotmail.com)
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


-- Lead 63: Halil Bircan (hbircan94@gmail.com)
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


-- Lead 64: Baraa Kalash (baraakalashbaraakalash@gmail.com)
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


-- Lead 65: ‏hamza Hamoud (hamza200191@gmail.com)
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


-- Lead 66: Dhdb Dbdbdb (bdbdbdbd)
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


-- Lead 67: Hameed BABELLI (hameedbabelli@gmail.com)
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


-- Lead 68: Bushra Alzubaidi (balzubaidi00@gmail.com)
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


-- Lead 69: Muzamil Memon (muzamil9884@gmail.com)
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


-- Lead 70: Muzamil Memon (muzamil9884@gmail.com)
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


-- Lead 71: Ciara Duffy (ciaraduffy2724@gmail.com)
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


-- Lead 72: Jumaima Zain (saifjumaima@gmail.com)
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


-- Lead 73: Munisa Mirza (yasmin.ue@gmail.com)
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


-- Lead 74: Amer Alaaeddin (ameralqassar220@gmail.com)
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


-- Lead 75: Faiz Felemban (faizam3@hotmail.com)
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


-- Lead 76: Nicolette Connors (nicoletteinvestdubai@gmail.com)
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


-- Lead 77: Ibrahim Ab (dubai@gmail.com)
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


-- Lead 78: Yousef Aldobikhi (yousef10100@gmail.com)
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


-- Lead 79: Hamidah Safi (hamida.a.safi@gmail.com)
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


-- Lead 80: Omar Abbas (alsamrai70@gmail.com)
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


-- Lead 81: Wael Hosni (whosni.med@gmail.com)
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


-- Lead 82: Praveen Dawar (prandawar@gmail.com)
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


-- Lead 83: Lina Riman (lriman@hotmail.com)
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


-- Lead 84: Mohammad Ak (bashirakil5@gmail.com)
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


-- Lead 85: Raul Rodriguez (letstalk@raulrmediagroup.com)
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


-- Lead 86: Marian Khatib (mariankh.gmail.com)
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


-- Lead 87: Rola El amine (rola.elamine@rakbank.ae)
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


-- Lead 88: Ruba Al chamaa (roubachamaa@yahoo.com)
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


-- Lead 89: Sagar Patel (sagar.patell@outlook.com)
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


-- Lead 90: Marian Khatib (mariankh@gmail.com)
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


-- Lead 91: Mohamed Alfawaz (dr.alfawazface@gmail.com)
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


-- Lead 92: Ahmed Alali (amral.aj@hotmail.com)
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


-- Lead 93: Tristan Pirouz (tristan@dsgnbynd.com)
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


-- Lead 94: Rami Hababat (ramiha878@gmail.com)
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


-- Lead 95: Rami Ha (ramiha878@gmail.com)
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


-- Lead 96: Mohammed Yashar (yashar@spacesandbeyond.ae)
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


-- Lead 97: Fatimah Al Hammad (faabalhammad@gmail.com)
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


-- Lead 98: Moath Abuayaha (moathabuaysha@gmail.com)
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


-- Lead 99: Abdullah Junid (abdwlahjunid@gmail.com)
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


-- Lead 100: Rania Barghout (rania@thenextchapter.vip)
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


-- Lead 101: Karishma SAMTANI (petitegourmetdubai@gmail.com)
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


-- Lead 102: Moza AlFalahi (moza.hf@gmail.com)
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


-- Lead 103: Amer Kassar (amerx3003@gmail.com)
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


-- Lead 104: Muath Albarakati (mu3th898@live.com)
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


-- Lead 105: Dua Hamasha (duaahamasha@gmail.com)
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


-- Lead 106: Ammar Azzawi (drazzawi85@gmail.com)
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


-- Lead 107: Shaima Zaher (alshaimaa-zaher@hotmail.com)
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


-- Lead 108: Ali Almomin (d.elanbr.90@hotmail.com)
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


-- Lead 109: Abdulla Alyasi (abdullaaa@tripleaperfumes.com)
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


-- Lead 110: Joelle Raad (joelleraad@hotmail.com)
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


-- Lead 111: Saleh Alsalehi (sssnm3@hotmail.com)
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


-- Lead 112: Manal Al Amoudi (dr.manal.alamoudi@gmail.com)
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


-- Lead 113: Osama Khan (dr.osamakh@outlook.com)
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


-- Lead 114: Mohamed Al-Nassef (dralnassef@gmail.com)
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


-- Lead 115: Dominique Samaha (ds4spineart@gmail.com)
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


-- Lead 116: Rabea Akram (rabea204@hotmail.com)
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


-- Lead 117: Sanaa Sulimani (sana2.sulimani@hotmail.com)
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


-- Lead 118: Mohaned Salih (mohaneds45@hotmail.com)
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


-- Lead 119: Marwa Eid (dr.marwa40@yahoo.com)
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


-- Lead 120: Dr. Sami Alyami (samialyami@hotmail.com)
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


-- Lead 121: Saud Binjudiaan (saudbinjudiaan@hotmail.com)
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


-- Lead 122: Abdullah Almahmoud (abdullahfjalmahmoud@gmail.com)
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


-- Lead 123: Mohammad Hamdan (doctorhamdan@gmail.com)
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


-- Lead 124: Ahmed Hijazi (pt.ahmedhijazi@gmail.com)
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


-- Lead 125: Bader Aldawsari (badermd37@gmail.com)
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


-- Lead 126: Omar Ahmed (omar-0757@hotmail.com)
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


-- Lead 127: Laleh Astaneh (laleh_adt@yahoo.com)
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


-- Lead 128: Mouhamed Hamdi (hamdi.m1@hotmail.com)
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


-- Lead 129: Lina Baabbad (lina.baabbad@gmail.com)
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


-- Lead 130: Nada Alghamdi (dr.derma.sa@gmail.com)
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


-- Lead 131: Danya Aldahan (aldahandanya@gmail.com)
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


-- Lead 132: Munna Mansoor (vallilmansoor@yahoo.com)
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


-- Lead 133: Danya Aldahan (dr.aldahan@gmail.com)
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


-- Lead 134: Maan Abuzaid (dr.maanabuzaid@gmail.com)
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


-- Lead 135: Rahul Raj (rahulrajnestef@gmail.com)
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


-- Lead 136: Ghassan Yacoub (vikki.chubar@gmail.com)
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


-- Lead 137: Pankaj Hotchandani (dr.pankajhotchandani@gmail.com)
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


-- Lead 138: nawaf alenezi (vw.g@yahoo.com)
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


-- Lead 139: Ahmed Aljabr (ahmed001@windowslive.com)
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


-- Lead 140: Hani Nassar (dr_haninassar@hotmail.com)
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


-- Lead 141: Asma Alameeri (dr.asma.alameri@gmail.com)
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


-- Lead 142: Hattan Alghamdi (halghamdi87@gmail.com)
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


-- Lead 143: Niclas Eckert (niclas@niccos.com)
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


-- Lead 144: Zahra Babiker (zehairaabdelmalik@gmail.com)
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


-- Lead 145: Khalid Khoshim (kkhoshim@gmail.com)
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


-- Lead 146: Osama Morshed (dr.osamamorshed@gmail.com)
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


-- Lead 147: Ahmad Matar (drmatar87@hotmail.com)
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


-- Lead 148: Tooba Khan (khantooba@hotmail.com)
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


-- Lead 149: Ebtissam AlMeghaiseeb (e_meghaiseeb@hotmail.com)
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


-- Lead 150: Yasser Khoshaim (khoshaimy85@gmail.com)
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


-- Lead 151: Rakan Al-Turki (rralturki@gmail.com)
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


-- Lead 152: Ahmed El shall (smilewaydc@gmail.com)
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


-- Lead 153: Rehab Nasser (rehabnasser.me@gmail.com)
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


-- Lead 154: Mohammad Abdo (abdotry@yahoo.com)
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


-- Lead 155: Sulaiman Taleb (stalib12@gmail.com)
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


-- Lead 156: Hassaan Allam (sony00410@gmail.com)
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


-- Lead 157: Muath Alnaqbi (p.m3ath@hotmail.com)
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


-- Lead 158: Ahmed Yehia (yehia.ay@gmail.com)
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


-- Lead 159: Ahmed Elbegawy (bejawe999@gmail.com)
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


-- Lead 160: Hisham Silsilah (dr.h.silsilah@gmail.com)
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


-- Lead 161: Islam Khaled (dr.is83@gmail.com)
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


-- Lead 162: Hisham Basamh (hbasamh@hotmail.com)
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


-- Lead 163: Sarah Abou chakra (sabouchakra@amd.com.sa)
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


-- Lead 164: Muath Almurayyi (moathjony@gmail.com)
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


-- Lead 165: Mohamed Sabbagh (msabbagh221@gmail.com)
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


-- Lead 166: Lina Baabbad (lina.baabbad@gmail.com)
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


-- Lead 167: Mohamed Salem (pd.dr.med.m.salem@gmail.com)
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


-- Lead 168: Mark Nakad (mark@clinicsaver.com)
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


-- Lead 169: Rasha Zainalabidin (dr.rasha_zainalabdin@hotmail.com)
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


-- Lead 170: Brandon Hill (chirobrandonhill@gmail.com)
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


-- Lead 171: Brandon Hill (chirobrandonhill@gmail.com)
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


-- Lead 172: Pratik Chudasama (dp@digitalpratik.com)
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


-- Lead 173: Omar Messky (omarmeski@maven-x.com)
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


-- Lead 174: testing testing (adib@theclips.agenc)
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


-- Lead 175: Testing Baroudi (test@gmail.com)
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


-- Lead 176: Zahra Mansoor (zahramansoorr@gmail.com)
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


-- Lead 177: Ali V (vaidali194@gmail.com)
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


-- Lead 178: Hazem Akari (hazem88akkari@gmail.com)
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


-- Lead 179: Aleksa Rupic (rupic.aleksa@gmail.com)
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


-- Lead 180: Karishma Samtani (petitegourmetdubai@gmail.com)
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


-- Lead 181: Dina ElBaz (elbazzdina36@gmail.com)
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


-- Lead 182: Zain Riaz (zain@sykon.ar)
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


-- Lead 183: Wajdi Albonji (wajdi_albonji@hotmail.com)
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


-- Lead 184: Nauras Abuagela (nauras.abuagela@hotmail.com)
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


-- Lead 185: Maripet Cabauatan (bubbly_pet@yahoo.com)
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


-- Lead 186: Mehran Jahani (dr_mjahani@yahoo.ca)
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


-- Lead 187: Kais AlTahan (qaissyr82@gmail.com)
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


-- Lead 188: Ali Chamseddine (alichamseddine@hotmail.com)
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


-- Lead 189: Noor Al Ani (dr.nooralani@gmail.com)
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


-- Lead 190: Atallah Yaghi (atallah@cerebree.com)
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


-- Lead 191: Ibrahim Alheshma (kalakas.c.g.m@gmail.com)
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


-- Lead 192: John Kairouz (ams2030nl@gmail.com)
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


-- Lead 193: Marwa Eid (dr.marwa40@yahoo.com)
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


-- Lead 194: Farah Alnafoosi (f_alnafoosi@yahoo.com)
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


-- Lead 195: Farah Alnafoosi (f_alnafoosi@yahoo.com)
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


-- Lead 196: Mohammed Chaudhry (mc@elev8mediaco.com)
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


-- Lead 197: Parham Shafe (shafe@dr-shafe.de)
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


-- Lead 198: Ziad Abdulrahim (zabdulrahim@gmx.de)
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


-- Lead 199: Adam Shagrin (hello@rentta.com.au)
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


-- Lead 200: Kanima Chugh (kanika.chugh@skvlawoffices.com)
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


-- Lead 201: Vatche Kavlakian (vatche@ndigitec.com)
WITH inserted_person AS (
  INSERT INTO public.crm_people (
    tenant_id, full_name, email, phone, instagram, country, income_range, goal, obstacle, notes, created_at, updated_at
  ) VALUES (
    '520a4cfd-5183-4e11-aecc-bc71a52978b6',
    'Vatche Kavlakian',
    'vatche@ndigitec.com',
    '0502422171',
    'Vkavlakian',
    'United Arab Emirates',
    'More than $10k /mo',
    'Increase revenue',
    'Less orders',
    NULL,
    '2026-03-28T20:00:00.000Z',
    '2026-03-28T20:00:00.000Z'
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
  SELECT id FROM public.crm_people WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'vatche@ndigitec.com'
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
  'Vatche',
  'Kavlakian',
  'vatche@ndigitec.com',
  '0502422171',
  'Vkavlakian',
  'Service Provider',
  'More than $10k /mo',
  'Increase revenue',
  'Less orders',
  true,
  'new',
  '{"first_name":"Vatche","last_name":"Kavlakian","email":"vatche@ndigitec.com","phone":"0502422171","social_username":"Vkavlakian","country":"United Arab Emirates","content_language":"","business_type":"Service Provider","monthly_income_range":"More than $10k /mo","goals_objectives":"Increase revenue","obstacles":"Less orders","call_attendance_confirmation":"Yes","status":"new","notes":"","date_added":"Mar 29, 2026"}'::jsonb,
  'United Arab Emirates',
  NULL,
  false,
  '2026-03-28T20:00:00.000Z',
  '2026-03-28T20:00:00.000Z'
WHERE NOT EXISTS (
  SELECT 1 FROM public.leads WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'vatche@ndigitec.com'
);


-- Lead 202: Mustafa Etbina (mustafa.etbina@hotmail.com)
WITH inserted_person AS (
  INSERT INTO public.crm_people (
    tenant_id, full_name, email, phone, instagram, country, income_range, goal, obstacle, notes, created_at, updated_at
  ) VALUES (
    '520a4cfd-5183-4e11-aecc-bc71a52978b6',
    'Mustafa Etbina',
    'mustafa.etbina@hotmail.com',
    '0505900307',
    NULL,
    'Unknown',
    NULL,
    NULL,
    NULL,
    NULL,
    '2026-03-28T20:00:00.000Z',
    '2026-03-28T20:00:00.000Z'
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
  SELECT id FROM public.crm_people WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'mustafa.etbina@hotmail.com'
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
  'Mustafa',
  'Etbina',
  'mustafa.etbina@hotmail.com',
  '0505900307',
  NULL,
  'Other',
  NULL,
  NULL,
  NULL,
  false,
  'new',
  '{"first_name":"Mustafa","last_name":"Etbina","email":"mustafa.etbina@hotmail.com","phone":"0505900307","social_username":"","country":"Unknown","content_language":"","business_type":"Other","monthly_income_range":"","goals_objectives":"","obstacles":"","call_attendance_confirmation":"No","status":"new","notes":"","date_added":"Mar 29, 2026"}'::jsonb,
  'Unknown',
  NULL,
  false,
  '2026-03-28T20:00:00.000Z',
  '2026-03-28T20:00:00.000Z'
WHERE NOT EXISTS (
  SELECT 1 FROM public.leads WHERE tenant_id = '520a4cfd-5183-4e11-aecc-bc71a52978b6' AND email = 'mustafa.etbina@hotmail.com'
);

COMMIT;