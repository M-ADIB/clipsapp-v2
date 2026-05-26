-- ClipsOS V2 Leads Import Script - Part 5

-- Leads 201 to 202

-- Lead 201:Vatche Kavlakian (vatche@ndigitec.com)
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

-- Lead 202:Mustafa Etbina (mustafa.etbina@hotmail.com)
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