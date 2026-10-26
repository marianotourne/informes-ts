-- Usuarios externos: qué clientes puede ver cada uno.
-- Un externo ve (solo lectura) sus clientes y los informes de esos clientes.
-- Correr en el SQL editor de Supabase, de una sola vez, después de rls.sql.

begin;

-- 1. Relación usuario externo ↔ cliente (un usuario puede tener varios clientes y viceversa)
create table if not exists public.client_users (
  client_id uuid not null references public.clients (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (client_id, user_id)
);

create index if not exists client_users_user_id_idx on public.client_users (user_id);

-- 2. RLS de client_users: los internos la administran; cada externo lee sus filas
alter table public.client_users enable row level security;

create policy "internos full access" on public.client_users
  for all to authenticated
  using ((select public.is_interno()))
  with check ((select public.is_interno()));

create policy "read own" on public.client_users
  for select to authenticated
  using (user_id = (select auth.uid()));

-- 3. Externos: lectura de sus clientes y de los informes de esos clientes.
--    Se suman a "internos full access" (las políticas se combinan con OR).
create policy "externos read own clients" on public.clients
  for select to authenticated
  using (id in (
    select client_id from public.client_users where user_id = (select auth.uid())
  ));

create policy "externos read own reports" on public.reports
  for select to authenticated
  using (client_id in (
    select client_id from public.client_users where user_id = (select auth.uid())
  ));

create policy "externos read own reports" on public.report_water
  for select to authenticated
  using (report_id in (
    select r.id from public.reports r
    join public.client_users cu on cu.client_id = r.client_id
    where cu.user_id = (select auth.uid())
  ));

create policy "externos read own reports" on public.report_food
  for select to authenticated
  using (report_id in (
    select r.id from public.reports r
    join public.client_users cu on cu.client_id = r.client_id
    where cu.user_id = (select auth.uid())
  ));

create policy "externos read own reports" on public.report_animal_nutrition
  for select to authenticated
  using (report_id in (
    select r.id from public.reports r
    join public.client_users cu on cu.client_id = r.client_id
    where cu.user_id = (select auth.uid())
  ));

commit;

-- 4. Dar de alta un externo (después de crear el usuario en Authentication → Users;
--    el trigger de profiles.sql ya le crea el perfil como 'externo'):
--
-- update public.profiles set nombre = 'Juan Pérez'
-- where id = (select id from auth.users where email = 'juan@cliente.com');
--
-- insert into public.client_users (client_id, user_id)
-- select c.id, u.id
-- from public.clients c, auth.users u
-- where c.name = 'Razón social exacta del cliente'
--   and u.email = 'juan@cliente.com';
--
-- Ver qué clientes tiene asignado cada externo:
-- select u.email, c.name
-- from public.client_users cu
-- join auth.users u on u.id = cu.user_id
-- join public.clients c on c.id = cu.client_id
-- order by u.email, c.name;
