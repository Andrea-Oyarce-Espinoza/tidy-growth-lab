create table public.plans (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null check (jsonb_typeof(data) = 'object' and octet_length(data::text) <= 10000000),
  revision integer not null default 1
);
alter table public.plans enable row level security;
revoke all on public.plans from anon;
grant select, insert, update, delete on public.plans to authenticated;
create policy "Read own plan" on public.plans for select to authenticated using ((select auth.uid()) = user_id);
create policy "Create own plan" on public.plans for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Update own plan" on public.plans for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Delete own plan" on public.plans for delete to authenticated using ((select auth.uid()) = user_id);
