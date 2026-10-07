begin;

alter table public.synonimoak_2 enable row level security;
alter table public.synonym_groups enable row level security;

drop policy if exists "Authenticated users read active synonimoak" on public.synonimoak_2;
drop policy if exists "Authenticated users read active synonym groups" on public.synonym_groups;

create policy "Authenticated users read active synonimoak"
  on public.synonimoak_2 for select
  to authenticated
  using (active = true);

create policy "Authenticated users read active synonym groups"
  on public.synonym_groups for select
  to authenticated
  using (active = true);

revoke all on public.synonimoak_2 from anon;
revoke all on public.synonym_groups from anon;
grant select on public.synonimoak_2 to authenticated;
grant select on public.synonym_groups to authenticated;

commit;
