-- Auto-create Cycle 1 when a project is created.
-- Also expose a helper to compute the next cycle_number per project.

create or replace function public.create_default_cycle()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.cycles (tenant_id, client_id, project_id, name, cycle_number, order_index)
  values (new.tenant_id, new.client_id, new.id, 'Cycle 1', 1, 0);
  return new;
end;
$$;

drop trigger if exists trg_project_default_cycle on public.projects;

create trigger trg_project_default_cycle
after insert on public.projects
for each row execute function public.create_default_cycle();

create or replace function public.next_cycle_number(_project_id uuid)
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(max(cycle_number), 0) + 1
  from public.cycles
  where project_id = _project_id;
$$;