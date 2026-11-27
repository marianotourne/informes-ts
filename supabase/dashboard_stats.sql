-- Estadísticas para el dashboard de inicio (solo internos).
-- Devuelve un único JSON chico con todo lo agregado; la app no descarga los informes.
-- Correr en el SQL editor de Supabase, después de rls.sql y profiles.sql.
--
-- Fecha de cada informe: fecha_informe de la tabla de detalle; si está vacía, el día
-- (hora de Argentina) en que se cargó el informe. Es la misma fecha que muestra la lista.
--
-- Filtros opcionales (null = sin filtrar): tipo de informe, cliente y usuario que lo cargó.
-- Cada panel que lista una dimensión ignora su propio filtro, para que se siga viendo el
-- resto y el elegido aparezca resaltado: el ranking de clientes no aplica p_client_id, los
-- paneles por tipo no aplican p_tipo y el de usuarios no aplica p_user_id. Los indicadores
-- y los gráficos por mes aplican todos.
--
-- Ejemplos:
--   select public.dashboard_stats(2026);
--   select public.dashboard_stats(2026, p_tipo => 3);

-- La versión anterior tenía un solo parámetro; con otra firma quedarían dos funciones
drop function if exists public.dashboard_stats(integer);

create or replace function public.dashboard_stats(
  p_anio integer,
  p_tipo integer default null,
  p_client_id uuid default null,
  p_user_id uuid default null
)
returns jsonb
language plpgsql
stable
-- security invoker (por defecto): corre con el RLS del usuario que la llama
set search_path = ''
as $$
declare
  v_hoy date := (now() at time zone 'America/Argentina/Buenos_Aires')::date;
  -- Para comparar contra el año anterior "a la misma altura": si es el año en curso,
  -- se cuenta el año anterior solo hasta el mismo día; si es un año pasado, completo.
  v_corte_anterior date;
  v_result jsonb;
begin
  if not public.is_interno() then
    raise exception 'Solo los usuarios internos pueden ver las estadísticas';
  end if;

  if p_anio = extract(year from v_hoy)::integer then
    v_corte_anterior := (v_hoy - interval '1 year')::date;
  else
    v_corte_anterior := make_date(p_anio - 1, 12, 31);
  end if;

  with detalle as (
    select report_id, fecha_recepcion, fecha_informe from public.report_water
    union all
    select report_id, fecha_recepcion, fecha_informe from public.report_food
    union all
    select report_id, fecha_recepcion, fecha_informe from public.report_animal_nutrition
  ),
  base as (
    select
      r.id,
      r.client_id,
      r.report_type_id,
      r.created_by,
      d.fecha_recepcion,
      d.fecha_informe,
      f.fecha,
      extract(year from f.fecha)::integer as anio,
      -- Qué filtros cumple cada informe; cada panel combina los que le corresponden
      (p_tipo is null or r.report_type_id = p_tipo) as ok_tipo,
      (p_client_id is null or r.client_id = p_client_id) as ok_cliente,
      (p_user_id is null or r.created_by = p_user_id) as ok_usuario
    from public.reports r
    join detalle d on d.report_id = r.id
    cross join lateral (
      select coalesce(
        d.fecha_informe,
        (r.created_at at time zone 'America/Argentina/Buenos_Aires')::date
      ) as fecha
    ) f
  ),
  del_anio as (
    select * from base where anio = p_anio
  ),
  -- Informes del año que cumplen todos los filtros
  filtrados as (
    select * from del_anio where ok_tipo and ok_cliente and ok_usuario
  ),
  -- Días entre recepción e informe; se descartan fechas faltantes o invertidas.
  -- Sin el filtro de tipo: el total se calcula aparte, y el panel por tipo lo ignora.
  demoras as (
    select report_type_id, ok_tipo, (fecha_informe - fecha_recepcion) as dias
    from del_anio
    where ok_cliente and ok_usuario
      and fecha_informe is not null
      and fecha_recepcion is not null
      and fecha_informe >= fecha_recepcion
  )
  select jsonb_build_object(
    'anio', p_anio,

    -- Años con informes (para el selector); siempre incluye el actual. Sin filtros.
    'anios', (
      select coalesce(jsonb_agg(a order by a desc), '[]'::jsonb)
      from (
        select distinct anio as a from base
        union
        select extract(year from v_hoy)::integer
      ) t
    ),

    'total', (select count(*) from filtrados),

    'total_anterior_mismo_periodo', (
      select count(*) from base
      where anio = p_anio - 1
        and fecha <= v_corte_anterior
        and ok_tipo and ok_cliente and ok_usuario
    ),

    'clientes_atendidos', (select count(distinct client_id) from filtrados),

    -- Panel por tipo: ignora p_tipo
    'por_tipo', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'report_type_id', report_type_id, 'cantidad', cantidad
      ) order by report_type_id), '[]'::jsonb)
      from (
        select report_type_id, count(*) as cantidad
        from del_anio
        where ok_cliente and ok_usuario
        group by report_type_id
      ) t
    ),

    -- 12 meses, por tipo para el año elegido y el total del año anterior. Todos los filtros.
    'por_mes', (
      select jsonb_agg(jsonb_build_object(
        'mes', m.mes,
        'agua', coalesce(c.agua, 0),
        'alimentos', coalesce(c.alimentos, 0),
        'nutricion', coalesce(c.nutricion, 0),
        'total', coalesce(c.total, 0),
        'total_anterior', coalesce(p.total, 0)
      ) order by m.mes)
      from generate_series(1, 12) as m(mes)
      left join (
        select
          extract(month from fecha)::integer as mes,
          count(*) filter (where report_type_id = 1) as agua,
          count(*) filter (where report_type_id = 2) as alimentos,
          count(*) filter (where report_type_id = 3) as nutricion,
          count(*) as total
        from filtrados group by 1
      ) c on c.mes = m.mes
      left join (
        select extract(month from fecha)::integer as mes, count(*) as total
        from base
        where anio = p_anio - 1 and ok_tipo and ok_cliente and ok_usuario
        group by 1
      ) p on p.mes = m.mes
    ),

    -- Ranking de clientes: ignora p_client_id. El top 10, más el cliente elegido si
    -- quedó fuera del top (con su puesto real).
    'ranking_clientes', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'client_id', t.client_id,
        'nombre', t.nombre,
        'cantidad', t.cantidad,
        'puesto', t.puesto
      ) order by t.puesto), '[]'::jsonb)
      from (
        select
          b.client_id,
          coalesce(c.name, 'Sin nombre') as nombre,
          count(*) as cantidad,
          row_number() over (order by count(*) desc, c.name) as puesto
        from del_anio b
        left join public.clients c on c.id = b.client_id
        where b.ok_tipo and b.ok_usuario
        group by b.client_id, c.name
      ) t
      where t.puesto <= 10 or t.client_id = p_client_id
    ),

    'demora', jsonb_build_object(
      'promedio', (select round(avg(dias), 1) from demoras where ok_tipo),
      'mediana', (
        select percentile_cont(0.5) within group (order by dias::double precision)
        from demoras where ok_tipo
      ),
      'informes', (select count(*) from demoras where ok_tipo),
      -- Panel por tipo: ignora p_tipo
      'por_tipo', (
        select coalesce(jsonb_agg(jsonb_build_object(
          'report_type_id', report_type_id,
          'promedio', promedio,
          'informes', informes
        ) order by report_type_id), '[]'::jsonb)
        from (
          select report_type_id, round(avg(dias), 1) as promedio, count(*) as informes
          from demoras group by report_type_id
        ) t
      )
    ),

    -- Panel por usuario: ignora p_user_id. user_id null = informes sin usuario registrado.
    'por_usuario', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'user_id', t.user_id, 'nombre', t.nombre, 'cantidad', t.cantidad
      ) order by t.cantidad desc, t.nombre), '[]'::jsonb)
      from (
        select
          b.created_by as user_id,
          coalesce(p.nombre, 'Sin registrar') as nombre,
          count(*) as cantidad
        from del_anio b
        left join public.profiles p on p.id = b.created_by
        where b.ok_tipo and b.ok_cliente
        group by b.created_by, p.nombre
      ) t
    )
  )
  into v_result;

  return v_result;
end;
$$;

revoke all on function public.dashboard_stats(integer, integer, uuid, uuid) from public, anon;
grant execute on function public.dashboard_stats(integer, integer, uuid, uuid) to authenticated;
