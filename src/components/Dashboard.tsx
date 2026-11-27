import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowDownRight,
  ArrowUpRight,
  Clock,
  FileText,
  Loader2,
  MousePointerClick,
  Plus,
  Users,
  X,
} from "lucide-react";
import { fetchDashboardStats } from "@/api/dashboardApi";
import { cn } from "@/lib/utils";
import type { DashboardStats, ReportType } from "@/types/types";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "./ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

// report_type_id → tipo; el color de cada tipo es fijo en todos los gráficos
const TIPOS: Array<{
  id: number;
  value: ReportType;
  label: string;
  color: string;
}> = [
  { id: 1, value: "agua", label: "Agua", color: "var(--chart-agua)" },
  {
    id: 2,
    value: "alimentos",
    label: "Alimentos",
    color: "var(--chart-alimentos)",
  },
  {
    id: 3,
    value: "nutricion",
    label: "Nutrición Animal",
    color: "var(--chart-nutricion)",
  },
];

const MESES = [
  "Ene",
  "Feb",
  "Mar",
  "Abr",
  "May",
  "Jun",
  "Jul",
  "Ago",
  "Sep",
  "Oct",
  "Nov",
  "Dic",
];

const porMesConfig = {
  agua: { label: "Agua", color: "var(--chart-agua)" },
  alimentos: { label: "Alimentos", color: "var(--chart-alimentos)" },
  nutricion: { label: "Nutrición Animal", color: "var(--chart-nutricion)" },
} satisfies ChartConfig;

const numero = new Intl.NumberFormat("es-AR", { maximumFractionDigits: 1 });

function formatDias(dias: number | null) {
  if (dias === null) return "—";
  return `${numero.format(dias)} ${dias === 1 ? "día" : "días"}`;
}

// Filtros elegidos con clic en los paneles; los nombres son para mostrar los chips
export interface Filtros {
  tipo?: number; // report_type_id
  clientId?: string;
  clienteNombre?: string;
  userId?: string;
  usuarioNombre?: string;
}

export function Dashboard() {
  const navigate = useNavigate();
  const anioActual = new Date().getFullYear();
  const [anio, setAnio] = useState(anioActual);
  const [filtros, setFiltros] = useState<Filtros>({});

  const statsQuery = useQuery<DashboardStats>({
    queryKey: [
      "dashboard",
      anio,
      filtros.tipo ?? null,
      filtros.clientId ?? null,
      filtros.userId ?? null,
    ],
    queryFn: () =>
      fetchDashboardStats(anio, {
        tipo: filtros.tipo,
        clientId: filtros.clientId,
        userId: filtros.userId,
      }),
    // Al cambiar de año o de filtro se sigue mostrando lo anterior hasta que llegue lo nuevo
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000,
  });

  const stats = statsQuery.data;
  const hayFiltros = !!(filtros.tipo || filtros.clientId || filtros.userId);
  const tipoFiltrado = TIPOS.find((t) => t.id === filtros.tipo);

  // Abre la lista de informes con los mismos filtros y el año elegido
  const verInformes = () => {
    const params = new URLSearchParams({
      desde: `${anio}-01-01`,
      hasta: `${anio}-12-31`,
    });
    if (tipoFiltrado) params.set("tipo", tipoFiltrado.value);
    if (filtros.clienteNombre) params.set("cliente", filtros.clienteNombre);
    if (filtros.userId) {
      params.set("creadoPor", filtros.userId);
      params.set("creadoPorNombre", filtros.usuarioNombre ?? "");
    }
    navigate(`/reports?${params}`);
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <h1 className="text-2xl md:text-4xl font-bold text-blue-600">Inicio</h1>
        <div className="flex items-center gap-2">
          {statsQuery.isFetching && (
            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
          )}
          <Select
            value={String(anio)}
            onValueChange={(v) => setAnio(Number(v))}
          >
            <SelectTrigger className="w-28 bg-white" aria-label="Año">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(stats?.anios ?? [anioActual]).map((a) => (
                <SelectItem key={a} value={String(a)}>
                  {a}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="default" onClick={() => navigate("/reports")}>
            <FileText className="w-4 h-4" />
            Ver informes
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-muted-foreground mr-1">
          Nuevo informe:
        </span>
        {TIPOS.map((tipo) => (
          <Button
            key={tipo.value}
            variant="success"
            size="sm"
            onClick={() => navigate(`/reports/${tipo.value}/new`)}
          >
            <Plus className="w-4 h-4" />
            {tipo.label}
          </Button>
        ))}
      </div>

      {/* Filtros activos */}
      <div className="flex flex-wrap items-center gap-2 min-h-9">
        {hayFiltros ? (
          <>
            <span className="text-sm text-muted-foreground mr-1">
              Filtrando por:
            </span>
            {tipoFiltrado && (
              <FiltroChip
                label={tipoFiltrado.label}
                onQuitar={() => setFiltros((f) => ({ ...f, tipo: undefined }))}
              />
            )}
            {filtros.clientId && (
              <FiltroChip
                label={filtros.clienteNombre ?? "Cliente"}
                onQuitar={() =>
                  setFiltros((f) => ({
                    ...f,
                    clientId: undefined,
                    clienteNombre: undefined,
                  }))
                }
              />
            )}
            {filtros.userId && (
              <FiltroChip
                label={`Cargados por ${filtros.usuarioNombre ?? "usuario"}`}
                onQuitar={() =>
                  setFiltros((f) => ({
                    ...f,
                    userId: undefined,
                    usuarioNombre: undefined,
                  }))
                }
              />
            )}
            <Button variant="outline" size="sm" onClick={() => setFiltros({})}>
              Quitar filtros
            </Button>
            <Button size="sm" onClick={verInformes}>
              <FileText className="w-4 h-4" />
              Ver estos informes
            </Button>
          </>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
            <MousePointerClick className="w-4 h-4" />
            Hacé clic en un tipo, un cliente o un usuario para filtrar todo el
            tablero.
          </span>
        )}
      </div>

      {statsQuery.isError && (
        <Card>
          <CardContent className="text-destructive">
            {statsQuery.error.message}
          </CardContent>
        </Card>
      )}

      {statsQuery.isPending && (
        <div className="flex items-center justify-center py-24 text-muted-foreground gap-2">
          <Loader2 className="w-5 h-5 animate-spin" />
          Cargando estadísticas...
        </div>
      )}

      {stats && (
        <DashboardContent
          stats={stats}
          anioActual={anioActual}
          filtros={filtros}
          setFiltros={setFiltros}
        />
      )}
    </div>
  );
}

function DashboardContent({
  stats,
  anioActual,
  filtros,
  setFiltros,
}: {
  stats: DashboardStats;
  anioActual: number;
  filtros: Filtros;
  setFiltros: React.Dispatch<React.SetStateAction<Filtros>>;
}) {
  // Clic en el elemento ya filtrado lo quita
  const toggleTipo = (value: string) => {
    const id = TIPOS.find((t) => t.value === value)?.id;
    setFiltros((f) => ({ ...f, tipo: f.tipo === id ? undefined : id }));
  };
  const toggleCliente = (clientId: string) => {
    const cliente = stats.ranking_clientes.find((c) => c.client_id === clientId);
    setFiltros((f) =>
      f.clientId === clientId
        ? { ...f, clientId: undefined, clienteNombre: undefined }
        : { ...f, clientId, clienteNombre: cliente?.nombre },
    );
  };
  const toggleUsuario = (userId: string) => {
    const usuario = stats.por_usuario.find((u) => u.user_id === userId);
    setFiltros((f) =>
      f.userId === userId
        ? { ...f, userId: undefined, usuarioNombre: undefined }
        : { ...f, userId, usuarioNombre: usuario?.nombre },
    );
  };
  const tipoSeleccionado = TIPOS.find((t) => t.id === filtros.tipo)?.value;

  const { anio } = stats;
  const anterior = stats.total_anterior_mismo_periodo;
  const variacion =
    anterior > 0 ? ((stats.total - anterior) / anterior) * 100 : null;

  // Promedio mensual sobre los meses transcurridos (todos si es un año pasado)
  const mesesTranscurridos =
    anio === anioActual ? new Date().getMonth() + 1 : 12;
  const promedioMensual = stats.total / mesesTranscurridos;

  const porMes = stats.por_mes.map((m) => ({
    ...m,
    mesLabel: MESES[m.mes - 1],
  }));
  const hayAnterior = stats.por_mes.some((m) => m.total_anterior > 0);

  const comparacionConfig = {
    total: { label: String(anio), color: "var(--chart-agua)" },
    total_anterior: {
      label: String(anio - 1),
      color: "var(--chart-anterior)",
    },
  } satisfies ChartConfig;

  return (
    <>
      {/* Indicadores */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          titulo={`Informes ${anio}`}
          valor={numero.format(stats.total)}
          icono={FileText}
        >
          {variacion === null ? (
            `Sin datos de ${anio - 1} para comparar`
          ) : (
            <span className="inline-flex items-center gap-1">
              {variacion >= 0 ? (
                <ArrowUpRight className="w-4 h-4 text-success" />
              ) : (
                <ArrowDownRight className="w-4 h-4 text-destructive" />
              )}
              {variacion >= 0 ? "+" : ""}
              {numero.format(variacion)}% vs. {anio - 1}
              {anio === anioActual ? " a la misma fecha" : ""}
            </span>
          )}
        </KpiCard>
        <KpiCard
          titulo="Promedio mensual"
          valor={numero.format(promedioMensual)}
          icono={FileText}
        >
          informes por mes
        </KpiCard>
        <KpiCard
          titulo="Clientes atendidos"
          valor={numero.format(stats.clientes_atendidos)}
          icono={Users}
        >
          con al menos un informe en {anio}
        </KpiCard>
        <KpiCard
          titulo="Demora promedio"
          valor={formatDias(stats.demora.promedio)}
          icono={Clock}
        >
          {stats.demora.informes > 0
            ? `de recepción a informe · mediana ${formatDias(stats.demora.mediana)}`
            : "sin informes con ambas fechas"}
        </KpiCard>
      </div>

      {/* Informes por mes, apilados por tipo */}
      <Card>
        <CardHeader>
          <CardTitle>Informes por mes</CardTitle>
          <CardDescription>{anio}, por tipo de análisis</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={porMesConfig}
            className="aspect-auto h-72 w-full"
          >
            <BarChart data={porMes} barCategoryGap="25%">
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="mesLabel"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <YAxis
                allowDecimals={false}
                tickLine={false}
                axisLine={false}
                width={32}
              />
              <ChartTooltip
                cursor={{ fill: "var(--muted)" }}
                content={<ChartTooltipContent />}
              />
              <ChartLegend content={<ChartLegendContent />} />
              {TIPOS.map((tipo, i) => (
                <Bar
                  key={tipo.value}
                  dataKey={tipo.value}
                  stackId="tipos"
                  fill={`var(--color-${tipo.value})`}
                  maxBarSize={24}
                  // Separación de 2px entre segmentos, con el color de la tarjeta
                  stroke="var(--card)"
                  strokeWidth={2}
                  radius={i === TIPOS.length - 1 ? [4, 4, 0, 0] : 0}
                />
              ))}
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Por tipo */}
        <Card>
          <CardHeader>
            <CardTitle>Análisis por tipo</CardTitle>
            <CardDescription>Cantidad de informes en {anio}</CardDescription>
          </CardHeader>
          <CardContent>
            <BarList
              items={TIPOS.map((tipo) => ({
                key: tipo.value,
                label: tipo.label,
                valor:
                  stats.por_tipo.find((t) => t.report_type_id === tipo.id)
                    ?.cantidad ?? 0,
                color: tipo.color,
              }))}
              conPorcentaje
              seleccionado={tipoSeleccionado}
              onSelect={toggleTipo}
            />
          </CardContent>
        </Card>

        {/* Demora por tipo */}
        <Card>
          <CardHeader>
            <CardTitle>Demora por tipo</CardTitle>
            <CardDescription>
              Días promedio entre la recepción de la muestra y el informe
            </CardDescription>
          </CardHeader>
          <CardContent>
            <BarList
              items={TIPOS.map((tipo) => {
                const d = stats.demora.por_tipo.find(
                  (t) => t.report_type_id === tipo.id,
                );
                return {
                  key: tipo.value,
                  label: tipo.label,
                  valor: d?.promedio ?? 0,
                  texto: d ? formatDias(d.promedio) : "—",
                  detalle: d
                    ? `${d.informes} ${d.informes === 1 ? "informe" : "informes"}`
                    : undefined,
                  color: tipo.color,
                };
              })}
              seleccionado={tipoSeleccionado}
              onSelect={toggleTipo}
            />
          </CardContent>
        </Card>

        {/* Ranking de clientes */}
        <Card>
          <CardHeader>
            <CardTitle>Clientes con más análisis</CardTitle>
            <CardDescription>Top 10 de {anio}</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.ranking_clientes.length === 0 ? (
              <SinDatos />
            ) : (
              <BarList
                items={stats.ranking_clientes.map((c) => ({
                  key: c.client_id,
                  label: `${c.puesto}. ${c.nombre}`,
                  valor: c.cantidad,
                  color: "var(--primary)",
                }))}
                seleccionado={filtros.clientId}
                onSelect={toggleCliente}
              />
            )}
          </CardContent>
        </Card>

        {/* Por usuario */}
        <Card>
          <CardHeader>
            <CardTitle>Informes por usuario</CardTitle>
            <CardDescription>Quién cargó cada informe en {anio}</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.por_usuario.length === 0 ? (
              <SinDatos />
            ) : (
              <BarList
                items={stats.por_usuario.map((u) => ({
                  // Los informes sin usuario registrado no se pueden filtrar
                  key: u.user_id ?? "sin-registrar",
                  label: u.nombre,
                  valor: u.cantidad,
                  color: "var(--primary)",
                  seleccionable: u.user_id !== null,
                }))}
                seleccionado={filtros.userId}
                onSelect={toggleUsuario}
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Comparación con el año anterior */}
      <Card>
        <CardHeader>
          <CardTitle>Comparación con {anio - 1}</CardTitle>
          <CardDescription>Total de informes por mes</CardDescription>
        </CardHeader>
        <CardContent>
          {hayAnterior ? (
            <ChartContainer
              config={comparacionConfig}
              className="aspect-auto h-64 w-full"
            >
              <LineChart data={porMes} margin={{ left: 4, right: 12 }}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="mesLabel"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <YAxis
                  allowDecimals={false}
                  tickLine={false}
                  axisLine={false}
                  width={32}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Line
                  dataKey="total_anterior"
                  stroke="var(--color-total_anterior)"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={false}
                />
                <Line
                  dataKey="total"
                  stroke="var(--color-total)"
                  strokeWidth={2}
                  dot={{ r: 4, fill: "var(--color-total)", strokeWidth: 0 }}
                />
              </LineChart>
            </ChartContainer>
          ) : (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Todavía no hay informes de {anio - 1} cargados en el sistema. La
              comparación aparece cuando haya datos de ambos años.
            </p>
          )}
        </CardContent>
      </Card>
    </>
  );
}

function KpiCard({
  titulo,
  valor,
  icono: Icono,
  children,
}: {
  titulo: string;
  valor: string;
  icono: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <Card className="gap-2">
      <CardHeader>
        <CardDescription className="flex items-center justify-between gap-2">
          {titulo}
          <Icono className="w-4 h-4" />
        </CardDescription>
        <CardTitle className="text-3xl font-semibold tabular-nums">
          {valor}
        </CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        {children}
      </CardContent>
    </Card>
  );
}

// Lista con barra horizontal proporcional al valor más alto.
// Con onSelect cada fila es un botón; si hay una elegida, las demás se atenúan.
function BarList({
  items,
  conPorcentaje,
  seleccionado,
  onSelect,
}: {
  items: Array<{
    key: string;
    label: string;
    valor: number;
    texto?: string;
    detalle?: string;
    color: string;
    seleccionable?: boolean; // por defecto true si hay onSelect
  }>;
  conPorcentaje?: boolean;
  seleccionado?: string;
  onSelect?: (key: string) => void;
}) {
  const max = Math.max(...items.map((i) => i.valor), 0);
  const total = items.reduce((acc, i) => acc + i.valor, 0);

  return (
    <ul className="space-y-1">
      {items.map((item) => {
        const clickeable = !!onSelect && item.seleccionable !== false;
        const activo = seleccionado === item.key;
        const atenuado = !!seleccionado && !activo;

        const contenido = (
          <>
            <div className="flex items-baseline justify-between gap-3 text-sm">
              <span
                className={cn("truncate", activo && "font-semibold")}
                title={item.label}
              >
                {item.label}
              </span>
              <span className="shrink-0 tabular-nums">
                <span className="font-medium">
                  {item.texto ?? numero.format(item.valor)}
                </span>
                {conPorcentaje && total > 0 && (
                  <span className="text-muted-foreground">
                    {" "}
                    · {Math.round((item.valor / total) * 100)}%
                  </span>
                )}
                {item.detalle && (
                  <span className="text-muted-foreground">
                    {" "}
                    · {item.detalle}
                  </span>
                )}
              </span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: max > 0 ? `${(item.valor / max) * 100}%` : "0%",
                  backgroundColor: item.color,
                }}
              />
            </div>
          </>
        );

        const clases = cn(
          "block w-full space-y-1 rounded-md px-2 py-1.5 text-left transition-opacity",
          atenuado && "opacity-40",
        );

        return (
          <li key={item.key}>
            {clickeable ? (
              <button
                type="button"
                onClick={() => onSelect(item.key)}
                aria-pressed={activo}
                title={activo ? "Quitar filtro" : "Filtrar por " + item.label}
                className={cn(
                  clases,
                  "cursor-pointer hover:bg-muted hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  activo && "bg-muted",
                )}
              >
                {contenido}
              </button>
            ) : (
              <div className={clases}>{contenido}</div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

function FiltroChip({
  label,
  onQuitar,
}: {
  label: string;
  onQuitar: () => void;
}) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 text-primary text-sm font-medium pl-3 pr-1 py-1">
      {label}
      <button
        type="button"
        onClick={onQuitar}
        title={`Quitar filtro ${label}`}
        className="rounded-full p-0.5 hover:bg-primary/20"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </span>
  );
}

function SinDatos() {
  return (
    <p className="py-6 text-center text-sm text-muted-foreground">
      Sin informes en este período
    </p>
  );
}
