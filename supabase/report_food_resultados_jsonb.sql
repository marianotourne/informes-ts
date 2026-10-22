-- Informe de Alimentos: pasa los resultados a una columna jsonb, igual que nutrición animal.
-- Correr una sola vez en el SQL editor de Supabase.
-- BORRA todos los informes de alimentos (eran datos de prueba).

begin;

-- 1. Borrar los informes de alimentos de prueba (detalle primero, por la FK)
delete from public.report_food;
delete from public.reports where report_type_id = 2;

-- 2. Sacar las columnas de resultados
alter table public.report_food
  drop column if exists aerobias_base,
  drop column if exists aerobias_exponente,
  drop column if exists aerobias_menor10,
  drop column if exists aerobias_unidad,
  drop column if exists coliformes_totales_base,
  drop column if exists coliformes_totales_exponente,
  drop column if exists coliformes_totales_menor10,
  drop column if exists coliformes_totales_unidad,
  drop column if exists coliformes_termotolerantes_base,
  drop column if exists coliformes_termotolerantes_exponente,
  drop column if exists coliformes_termotolerantes_menor10,
  drop column if exists coliformes_termotolerantes_unidad,
  drop column if exists bacterias_base,
  drop column if exists bacterias_exponente,
  drop column if exists bacterias_menor10,
  drop column if exists bacterias_unidad,
  drop column if exists sulfito_base,
  drop column if exists sulfito_exponente,
  drop column if exists sulfito_menor10,
  drop column if exists sulfito_unidad,
  drop column if exists escherichia_base,
  drop column if exists escherichia_exponente,
  drop column if exists escherichia_menor10,
  drop column if exists escherichia_unidad,
  drop column if exists estafilococo_base,
  drop column if exists estafilococo_exponente,
  drop column if exists estafilococo_menor1,
  drop column if exists estafilococo_menor10,
  drop column if exists estafilococo_unidad,
  drop column if exists mohos_base,
  drop column if exists mohos_exponente,
  drop column if exists mohos_menor1,
  drop column if exists mohos_menor10,
  drop column if exists mohos_unidad,
  drop column if exists salmonella_base,
  drop column if exists salmonella_presencia,
  drop column if exists salmonella_unidad,
  drop column if exists humedad,
  drop column if exists grados_brics,
  drop column if exists ph,
  drop column if exists generic01_name,
  drop column if exists generic01_number;

-- 3. Resultados: el objeto `resultados` del formulario tal cual (ver AlimentosResultados
-- en src/lib/zodSchemas.ts). Solo se usa para el PDF y para editar, no para consultas.
-- Ejemplo:
--   {
--     "aerobias": { "base": 1.5, "exponente": 3, "menor10": false, "unidad": "g" },
--     "estafilococo": { "menor10": false, "menor1": true, "unidad": "g" },
--     "salmonella": { "base": 25, "presencia": "Ausencia", "unidad": "g" },
--     "ph": 6.8,
--     "otros": [{ "nombre": "Cloruros (%)", "valor": 1.2 }]
--   }
-- Los valores vacíos no se guardan; al leer se completan con vacíos.
alter table public.report_food
  add column resultados jsonb not null default '{}'::jsonb
    check (jsonb_typeof(resultados) = 'object');

commit;
