# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Web app for a microbiology lab to create, edit, and export analysis reports ("informes") as PDFs. The UI, user-facing strings, and domain field names are in Spanish (e.g. `remitente`, `resultados`, `conclusiones`); keep that convention. It is a TypeScript rewrite of the older Firebase/Formik app in `../informes`.

## Commands

- `npm run dev` — Vite dev server
- `npm run build` — type-check (`tsc -b`) then production build; this is the main correctness check
- `npm run lint` — ESLint
- `npm run preview` — serve the built `dist/`

There is no test suite.

Requires `.env.local` with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.

## Stack

React 19 + Vite 7 + TypeScript, Tailwind v4 (via `@tailwindcss/vite`, no tailwind config file), shadcn/ui ("new-york" style, components in `src/components/ui`), react-router-dom v7, TanStack Query, react-hook-form + zod v4, Supabase (auth + Postgres), `@react-pdf/renderer` for PDFs. `@` aliases to `src/`. `vite-plugin-node-polyfills` is needed for react-pdf in the browser.

## Architecture

**Data layer.** All Supabase access goes through `src/api/*Api.ts` (plain async functions that throw `Error` with a Spanish message). The client is created in `src/utils/supabase.ts`. Clients are wrapped in TanStack Query by `src/hooks/useClients.ts` (query key `["clients"]`, toasts on mutation). Reports use a mix: the list in `Reports.tsx` uses `useQuery`, while the form/view pages call the API directly in `useEffect`.

**Report data model (two-table pattern).** Every report is a row in `reports` (`client_id`, `report_type_id`: 1 = agua, 2 = alimentos, 3 = nutrición animal) plus a row in a type-specific table keyed by `report_id` (`report_water`, `report_food`, `report_animal_nutrition`; the SQL for the latter is in `supabase/report_animal_nutrition.sql`). Create/update functions write both tables sequentially (not transactional). Fetches load `reports` and then the detail table and stitch them into the `FullReport` discriminated union in `src/types/types.ts`. Nutrition stores all of `resultados` in a single `jsonb` column with the same shape as the form (no queries run on it; it only feeds the PDF and editing). `src/lib/nutricion.ts` lists the fixed analyses (key ↔ label) for the form and PDF, and `completarResultados` fills in keys missing from the stored JSON.

**Forms.** Zod schemas and inferred form types live in `src/lib/zodSchemas.ts`. The form shape is nested by section (`numero`, `remitente`, `resultados`, `conclusiones`), and the API layer maps it to snake_case DB columns. A single form component handles both new and edit (`AguaReportForm` serves `/reports/agua/new` and `/reports/agua/:id/edit`; it switches on the `:id` param and resets the form from a `mapReportToFormValues` helper). Each section is its own component that reads the form via `useFormContext` from a parent `FormProvider`. Sections shared between report types live in `src/components/reports/common/`; type-specific ones live in `src/components/reports/<type>/`.

**PDF generation.** `PDFAgua.tsx` is a `@react-pdf/renderer` document (Lato fonts and logo/signature images bundled from `src/assets`). It is rendered in-page with `PDFViewer`/`PDFDownloadLink` in `ViewReportAgua` and generated on demand with `pdf()` from the reports list. Filenames come from `buildAguaReportFilename` in `src/lib/utils.ts`.

**Routing and auth.** Routes are in `src/App.tsx`. Every route except `/login` is wrapped in `ProtectedRoute` (uses `useAuth`, which is Supabase session state). The list pages are wrapped in `<Layout>` in `App.tsx`, while report form/view pages render `<Layout>` themselves.

**Theme and buttons.** The shadcn theme tokens live in `src/index.css` (primary = the app's blue-600, plus custom `success`/`warning` tokens). Use the tokens instead of hard-coded colors on shadcn components. `Button` variants by meaning: `success` for confirm/create (Guardar, Agregar, Nuevo…), `destructive` for Eliminar, `default` (blue) for main neutral actions (Buscar, Descargar PDF), `outline` for Cancelar/Limpiar, `ghost` for Volver and toolbar actions, `warning` for non-destructive actions that need attention. Dark-mode tokens exist under `.dark`, but nothing toggles that class yet.

**Dates.** Dates are stored as `YYYY-MM-DD` strings. Use `formatDate` in `src/hooks/useDate.ts` for display; it parses as local time to avoid UTC day-shift. Don't use `new Date(str)` directly.
