-- ClipsOS V2 Leads Import Script - Part 1

-- Leads 1 to 50

-- Lead 1:Roumaissa Hamadou (roumeissak89@gmail.com)
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

-- Lead 2:momen jamal (momen.jamal123@gnail.com)
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

-- Lead 3:Hammad Ebrahimi (eijaz7175@gmail.com)
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

-- Lead 4:Saeed Al-blooshi (s3eed.binkaram77@hotmail.com)
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

-- Lead 5:Elie Chammas (elieg.chammas@gmail.com)
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

-- Lead 6:Fawz Safaa (drfawz3@hotmail.com)
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

-- Lead 7:Mohammed Bitar (support@sikkini.com)
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

-- Lead 8:Aryan Rezaee (by.aryanrezaee@gmail.com)
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

-- Lead 9:Madhuri Podeti (beachfrontbymadhu@gmail.com)
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

-- Lead 10:Sudqi Mohammad (sudqidana9@gmail.com)
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

-- Lead 11:Hamed Amiran (hamed.amiran@yahoo.com)
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

-- Lead 12:Marie Louise Jensen (feldvossae@gmail.com)
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

-- Lead 13:jon g (g@g.cpm)
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

-- Lead 14:Emilie Rose Norey (investwithemilie@gmail.com)
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

-- Lead 15:Tony Deeb (deebantoine@gmail.com)
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

-- Lead 16:Zahra Abbas (info@zazewelz.con)
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

-- Lead 17:mohamed elgebaly (mohamedelgably278@gmail.com)
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

-- Lead 18:Ekaterina Sh (ppp@gmail.com)
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

-- Lead 19:Mutaz Samaha (samahamotaz@hotmail.com)
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

-- Lead 20:Mutaz Sam (samahamotaz@hotmail.com)
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

-- Lead 21:Zeina Knio (zeina.a.knio@gmail.com)
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

-- Lead 22:Margarita Fedorova (fedorova.margo.rita@gmail.com)
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

-- Lead 23:Osman Gumus (osman.gumus@outlook.com)
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

-- Lead 24:fd sdfg (dfgdfs@gmail.com)
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

-- Lead 25:Seerat Kaur (seerat.k7@gmail.com)
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

-- Lead 26:Seerat Kaur (seerat.k7@gmail.com)
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

-- Lead 27:Ali Ahmed (zubair.aliahmed19@gmail.com)
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

-- Lead 28:Abbas Rajani (geniousabbas@gmail.com)
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

-- Lead 29:Narek Harutyunyan (nar.harutyunyan@gmail.com)
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

-- Lead 30:Yazan Kataish (yazan.kataish@alwanfitout.com)
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

-- Lead 31:Hussam Beydoun (hussambeydoun@gmail.com)
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

-- Lead 32:Narek Harutyunyan (nar.harutyunyan@gmail.com)
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

-- Lead 33:Omar Messky (omarmeski@maven-x.com)
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

-- Lead 34:Jean-Pierre Traboulsi (traboulsijp@gmail.com)
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

-- Lead 35:Mohamed Bahnasi (dentsobhi@gmail.com)
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

-- Lead 36:Sandy Aouad (sandyaouad@hotmail.com)
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

-- Lead 37:Hermann Tatang (hermanndxb@gmail.com)
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

-- Lead 38:Ivan Molchanov (ivan@vanmolch.com)
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

-- Lead 39:Sandeep Kotian (sandeep.kotian@justlife.com)
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

-- Lead 40:Ta G (b)
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

-- Lead 41:Anas Yassin (anas.gtr.95@gmail.com)
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

-- Lead 42:Sandra Azizi (sandra@watchxglobal.com)
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

-- Lead 43:Mohamed Mousa (m.mousa@passportgates.com)
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

-- Lead 44:Omar Meski (omar.messky@gmail.com)
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

-- Lead 45:12312 312312312 (31233213123@gmail.com)
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

-- Lead 46:Test Revenue (test@revenue.com)
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

-- Lead 47:Anas Benchikar (anassbenchikar@gmail.com)
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

-- Lead 48:Sarah Salibi (info.sarahsalibi@gmail.com)
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

-- Lead 49:Test Submission (test@clipsos.com)
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

-- Lead 50:adib testing (adib@theclips.agency)
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