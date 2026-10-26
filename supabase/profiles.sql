-- Perfiles de usuario + quién registró cada informe.
-- Correr en el SQL editor de Supabase, de una sola vez.

-- 1. Perfil por usuario: nombre para mostrar y rol.
--    interno = personal del laboratorio, externo = cliente que solo ve sus informes.
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  nombre text not null,
  rol text not null default 'externo' check (rol in ('interno', 'externo')),
  created_at timestamptz not null default now()
);

-- Los usuarios logueados pueden leer los perfiles (para mostrar nombres).
-- No hay políticas de insert/update: los perfiles se editan desde el SQL editor,
-- así nadie puede cambiarse el rol desde la app.
-- (En el paso de usuarios externos se restringe qué perfiles ve cada uno.)
alter table public.profiles enable row level security;

create policy "authenticated read profiles"
  on public.profiles
  for select
  to authenticated
  using (true);

-- 2. Al crearse un usuario en Auth se le crea su perfil automáticamente.
--    Arranca como 'externo' (el rol con menos permisos); a los internos hay que
--    cambiarles el rol a mano: update public.profiles set rol = 'interno' where id = ...
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, nombre)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', new.email));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 3. Perfiles para los usuarios que ya existen: todos internos, con el email como nombre.
insert into public.profiles (id, nombre, rol)
select id, email, 'interno'
from auth.users
on conflict (id) do nothing;

-- 4. Poner los nombres reales (repetir por cada usuario):
-- update public.profiles set nombre = 'Mariano Tourné'
-- where id = (select id from auth.users where email = 'nicotourne@gmail.com');

-- 5. Quién registró cada informe. El default lo completa la base con el usuario
--    logueado, la app no manda nada. Los informes existentes quedan en null.
alter table public.reports
  add column if not exists created_by uuid default auth.uid()
    references public.profiles (id) on delete set null;
