-- RLS por rol: los internos leen y escriben todo; los externos no acceden a nada
-- (la lectura de sus informes se habilita con client_users, en el paso siguiente).
-- Reemplaza las políticas "cualquier usuario logueado puede todo" que había.
-- Correr en el SQL editor de Supabase, de una sola vez. Antes de correrlo, verificar
-- que todos los usuarios del laboratorio tengan rol = 'interno' en profiles.

begin;

-- 1. ¿El usuario logueado es interno?
--    security definer: lee profiles sin pasar por su propio RLS (si no, la política
--    de profiles se llamaría a sí misma). Sin perfil = no interno.
create or replace function public.is_interno()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and rol = 'interno'
  );
$$;

-- 2. Borrar las políticas viejas
drop policy if exists "Allow authenticated users to delete clients" on public.clients;
drop policy if exists "Allow authenticated users to insert clients" on public.clients;
drop policy if exists "Allow authenticated users to read clients" on public.clients;
drop policy if exists "Allow authenticated users to update clients" on public.clients;

drop policy if exists "Allow authenticated delete" on public.reports;
drop policy if exists "Allow authenticated insert" on public.reports;
drop policy if exists "Allow authenticated read" on public.reports;
drop policy if exists "Allow authenticated update" on public.reports;

drop policy if exists "authenticated can delete water reports" on public.report_water;
drop policy if exists "authenticated can insert water reports" on public.report_water;
drop policy if exists "authenticated can select water reports" on public.report_water;
drop policy if exists "authenticated can update water reports" on public.report_water;

drop policy if exists "authenticated can delete food reports" on public.report_food;
drop policy if exists "authenticated can insert food reports" on public.report_food;
drop policy if exists "authenticated can select food reports" on public.report_food;
drop policy if exists "authenticated can update food reports" on public.report_food;

drop policy if exists "authenticated full access" on public.report_animal_nutrition;

drop policy if exists "authenticated read profiles" on public.profiles;

-- 3. Internos: acceso total.
--    (select ...) hace que Postgres evalúe la función una vez por consulta y no por fila.
create policy "internos full access" on public.clients
  for all to authenticated
  using ((select public.is_interno()))
  with check ((select public.is_interno()));

create policy "internos full access" on public.reports
  for all to authenticated
  using ((select public.is_interno()))
  with check ((select public.is_interno()));

create policy "internos full access" on public.report_water
  for all to authenticated
  using ((select public.is_interno()))
  with check ((select public.is_interno()));

create policy "internos full access" on public.report_food
  for all to authenticated
  using ((select public.is_interno()))
  with check ((select public.is_interno()));

create policy "internos full access" on public.report_animal_nutrition
  for all to authenticated
  using ((select public.is_interno()))
  with check ((select public.is_interno()));

-- 4. Profiles: cada uno lee el suyo; los internos leen todos. Nadie escribe desde la app.
create policy "read own or internos read all" on public.profiles
  for select to authenticated
  using (id = (select auth.uid()) or (select public.is_interno()));

commit;
