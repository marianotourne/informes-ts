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

  -- Resultados: el objeto `resultados` del formulario tal cual (ver NutricionResultados
  -- en src/lib/zodSchemas.ts). Solo se usa para el PDF y para editar, no para consultas.
  -- Ejemplo:
  --   {
  --     "humedad": { "talCual": 12.5, "seca": 0 },
  --     "ph": 6.8,
  --     "actividadUreasica": { "muestra": 0.05, "testigo": 2.1 },
  --     "otrosSobreSustancia": [{ "nombre": "Cenizas (%)", "talCual": 7.2, "seca": 8.1 }],
  --     "otros": [{ "nombre": "Calcio (%)", "valor": 0.9 }]
  --   }
  -- Los valores vacíos no se guardan; al leer se completan con vacíos.
  resultados jsonb not null default '{}'::jsonb
    check (jsonb_typeof(resultados) = 'object'),

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
