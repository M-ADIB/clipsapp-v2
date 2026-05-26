-- Remove the trigger-generated default cycles so we can insert legacy cycles cleanly
DELETE FROM public.cycles c
WHERE c.tenant_id = '127f3184-fb0e-4b0b-8088-1a468c2bba52'
  AND c.name = 'Cycle 1'
  AND c.cycle_number = 1
  AND NOT EXISTS (SELECT 1 FROM public.videos v WHERE v.cycle_id = c.id);