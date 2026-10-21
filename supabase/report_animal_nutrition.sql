-- Informe de Nutrición animal (report_type_id = 3).
-- Correr en el SQL editor de Supabase. Sigue el mismo patrón que report_water / report_food:
-- una fila en reports + una fila acá con report_id como clave.

-- Si report_types todavía no tiene el tipo 3, agregarlo (ajustar las columnas a las de la tabla):
-- insert into report_types (id, name) values (3, 'nutricion');

create table if not exists public.report_animal_nutrition (
  report_id uuid primary key references public.reports (id) on delete cascade,

  -- Número
  numero_laboratorio integer,
  numero_propio integer unique,

  -- Solicitante
  orden integer,
  fecha_recepcion date,
  tipo_muestra text,
  detalle text,

  -- Resultados sobre sustancia: tal cual / seca
  humedad_tal_cual numeric,
  humedad_seca numeric,
  materia_seca_tal_cual numeric,
  materia_seca_seca numeric,
  proteina_bruta_tal_cual numeric,
  proteina_bruta_seca numeric,
  fdn_tal_cual numeric,
  fdn_seca numeric,
  fda_tal_cual numeric,
  fda_seca numeric,
  nitrogeno_tal_cual numeric,
  nitrogeno_seca numeric,
  extracto_etereo_tal_cual numeric,
  extracto_etereo_seca numeric,

  -- Resultados de un solo valor
  digestibilidad numeric,
  energia_metabolica numeric,
  ph numeric,
  proteina_verdadera numeric,
  nnp numeric,

  -- Actividad ureásica (delta pH): muestra / soja natural testigo
  actividad_ureasica_muestra numeric,
  actividad_ureasica_testigo numeric,

  -- Análisis libres de un valor (nombre + resultado)
  generic01_name text,
  generic01_number numeric,
  generic02_name text,
  generic02_number numeric,
  generic03_name text,
  generic03_number numeric,
  generic04_name text,
  generic04_number numeric,
  generic05_name text,
  generic05_number numeric,

  -- Análisis libres tal cual / seca (nombre + dos resultados)
  generic11_name text,
  generic11_tal_cual numeric,
  generic11_seca numeric,
  generic12_name text,
  generic12_tal_cual numeric,
  generic12_seca numeric,
  generic13_name text,
  generic13_tal_cual numeric,
  generic13_seca numeric,
  generic14_name text,
  generic14_tal_cual numeric,
  generic14_seca numeric,
  generic15_name text,
  generic15_tal_cual numeric,
  generic15_seca numeric,

  -- Conclusiones
  fecha_informe date,

  updated_at timestamptz not null default now()
);

-- Mismo acceso que las otras tablas de detalle: solo usuarios logueados.
-- Revisar que coincida con las políticas de report_water / report_food.
alter table public.report_animal_nutrition enable row level security;

create policy "authenticated full access"
  on public.report_animal_nutrition
  for all
  to authenticated
  using (true)
  with check (true);
