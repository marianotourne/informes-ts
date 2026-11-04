-- Lista de usuarios externos con su email, para asignarlos a clientes desde la app.
-- El email está en auth.users, que la app no puede leer: esta función lo expone
-- solo a los internos (security definer + chequeo de is_interno()).
-- Correr en el SQL editor de Supabase, después de rls.sql y client_users.sql.

create or replace function public.list_externos()
returns table (id uuid, nombre text, email text, created_at timestamptz)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not public.is_interno() then
    raise exception 'Solo los usuarios internos pueden ver la lista de usuarios';
  end if;

  return query
    select p.id, p.nombre, u.email::text, p.created_at
    from public.profiles p
    join auth.users u on u.id = p.id
    where p.rol = 'externo'
    order by p.created_at desc;
end;
$$;

revoke all on function public.list_externos() from public, anon;
grant execute on function public.list_externos() to authenticated;
