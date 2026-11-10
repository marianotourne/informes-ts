import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Image,
  Font,
} from "@react-pdf/renderer";
import { Table, TR, TD } from "@ag-media/react-pdf-table";
import dayjs from "dayjs";
import logoHorizonte from "@/assets/logohorizonte.jpeg";
import firma from "@/assets/firma.png";
import LatoRegular from "@/assets/fonts/Lato-Regular.ttf";
import LatoBold from "@/assets/fonts/Lato-Bold.ttf";
import LatoItalic from "@/assets/fonts/Lato-Italic.ttf";
import LatoBoldItalic from "@/assets/fonts/Lato-BoldItalic.ttf";
import type { Report, ReportFood } from "@/types/types";
import {
  completarResultados,
  tieneResultado,
  unidadRecuento,
} from "@/lib/alimentos";

Font.registerHyphenationCallback((word) => [word]);

Font.register({
  family: "Lato",
  fonts: [
    { src: LatoRegular },
    { src: LatoBold, fontWeight: "bold" },
    { src: LatoItalic, fontStyle: "italic" },
    { src: LatoBoldItalic, fontStyle: "italic", fontWeight: "bold" },
  ],
});

const styles = StyleSheet.create({
  page: {
    padding: "30px 8px",
    margin: "0 auto",
    fontFamily: "Lato",
    fontSize: 10,
    display: "flex",
    justifyContent: "space-between",
  },
  encabezado: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    padding: "0 50px",
    marginBottom: "16px",
  },
  encabezadoImageLogo: { width: "100px" },
  tituloInforme: {
    textAlign: "center",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  remitente: { width: "400px", margin: "10px auto" },
  columnaTitulo: { fontWeight: "bold", padding: "4px 6px" },
  demasColumnas: { padding: "4px 6px" },
  texto: { margin: "10px auto 0", width: "80%", fontSize: 9 },
  resultados: { width: "80%", margin: "14px auto" },
  resultadosBase: { position: "relative" },
  // Exponent laid out inline after the 10, raised like a superscript
  potencia: { flexDirection: "row", alignItems: "flex-start" },
  resultadosExponente: { fontSize: 6, marginTop: -2, marginLeft: -0.5 },
  pieFirma: { marginLeft: "350px", fontSize: 9 },
});

const formatter = new Intl.NumberFormat("es-AR", {
  style: "decimal",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

const formatDate = (value?: string | null) => {
  if (!value) return "";
  const parsed = dayjs(value);
  if (!parsed.isValid()) {
    console.warn("[PDFAlimentos] Fecha inválida recibida:", value);
    return "";
  }
  return parsed.format("DD/MM/YYYY");
};

// Count as "base x 10ⁿ": one space before the "x" and the exponent right
// after the 10 (e.g. "1,5 x 10³", "<1 x 10²")
const Potencia = ({
  base,
  exponente,
}: {
  base: string;
  exponente?: number;
}) => (
  <View style={styles.potencia}>
    <Text>{`${base} x 10`}</Text>
    <Text style={styles.resultadosExponente}>{exponente}</Text>
  </View>
);

// Text result as-is, "<10", "<1 x 10²" or "base x 10ⁿ"
const ValorRecuento = ({
  recuento,
}: {
  recuento: {
    base?: number;
    exponente?: number;
    menor10: boolean;
    menor1?: boolean;
    texto: string;
  };
}) => {
  if (recuento.texto) return <Text>{recuento.texto}</Text>;
  if (recuento.menor10) return <Text>{`<10`}</Text>;
  if (recuento.menor1) return <Potencia base="<1" exponente={2} />;
  return (
    <Potencia
      base={formatter.format(recuento.base ?? 0)}
      exponente={recuento.exponente}
    />
  );
};

type PDFAlimentosProps = {
  report: Report;
  food: ReportFood;
  clientName: string;
  signature?: boolean;
};

export const PDFAlimentos = ({
  food,
  clientName,
  signature = true,
}: PDFAlimentosProps) => {
  const fechaRecepcion = formatDate(food.fecha_recepcion);
  const fechaInicio = formatDate(food.fecha_inicio);
  const fechaInforme = formatDate(food.fecha_informe);

  const r = completarResultados(food.resultados);
  const { humedad, ph, gradosbrics: gradosBrics } = r;

  const recuentos = [
    { id: 1, title: "Aerobias mesófilas", recuento: r.aerobias },
    { id: 2, title: "Coliformes totales", recuento: r.coliformesTotales },
    {
      id: 3,
      title: "Coliformes termotolerantes",
      recuento: r.coliformesTermotolerantes,
    },
  ];

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View>
          <View style={styles.encabezado}>
            <Image style={styles.encabezadoImageLogo} src={logoHorizonte} />
            <Text>
              {`Nº ${food.numero_laboratorio ?? ""} - ${food.numero_propio ?? ""}`}
            </Text>
          </View>
          <Text style={styles.tituloInforme}>
            Análisis microbiológicos de alimentos
          </Text>
          <Table style={styles.remitente} weightings={[0.3, 0.8]}>
            <TR>
              <TD style={styles.columnaTitulo}>Remite la muestra</TD>
              <TD style={styles.demasColumnas}>{clientName}</TD>
            </TR>
            <TR>
              <TD style={styles.columnaTitulo}>Dirección</TD>
              <TD style={styles.demasColumnas}>{food.remitente_direccion}</TD>
            </TR>
            <TR>
              <TD style={styles.columnaTitulo}>Fecha de recepción</TD>
              <TD style={styles.demasColumnas}>{fechaRecepcion}</TD>
            </TR>
            <TR>
              <TD style={styles.columnaTitulo}>Fecha de inicio</TD>
              <TD style={styles.demasColumnas}>{fechaInicio}</TD>
            </TR>
            <TR>
              <TD style={styles.columnaTitulo}>Detalle</TD>
              <TD style={styles.demasColumnas}>{food.detalle}</TD>
            </TR>
            <TR>
              <TD style={styles.columnaTitulo}>Matriz</TD>
              <TD style={styles.demasColumnas}>{food.matriz}</TD>
            </TR>
            <TR>
              <TD style={styles.columnaTitulo}>Marca comercial</TD>
              <TD style={styles.demasColumnas}>{food.marca_comercial}</TD>
            </TR>
          </Table>
          <View style={styles.resultados}>
            <Text style={{ fontWeight: "bold", marginBottom: 5 }}>
              Resultados de los análisis
            </Text>
            {/* Same 400px total; the value column is wide enough for text
                results on one line, and the name column still fits the longest
                fixed label (Estafilococos aureus coag. positiva (UFC/ml)) */}
            <Table style={styles.remitente} weightings={[0.55, 0.45]}>
              {recuentos.map(({ id, title, recuento }) =>
                tieneResultado(recuento) ? (
                  <TR key={id}>
                    <TD style={styles.columnaTitulo}>
                      {`${title}${unidadRecuento(recuento)}`}
                    </TD>
                    <TD style={styles.demasColumnas}>
                      <ValorRecuento recuento={recuento} />
                    </TD>
                  </TR>
                ) : null,
              )}

              {/* ESTAFILOCOCO */}
              {tieneResultado(r.estafilococo) && (
                <TR>
                  <TD style={styles.columnaTitulo}>
                    <Text style={{ fontStyle: "italic" }}>
                      Estafilococos aureus{" "}
                    </Text>
                    <Text>
                      {`coag. positiva${unidadRecuento(r.estafilococo)}`}
                    </Text>
                  </TD>
                  <TD style={styles.demasColumnas}>
                    <ValorRecuento recuento={r.estafilococo} />
                  </TD>
                </TR>
              )}

              {/* BACTERIAS ACIDOLÁCTICAS */}
              {tieneResultado(r.bacterias) && (
                <TR>
                  <TD style={styles.columnaTitulo}>
                    {`Bacterias acido-lácticas${unidadRecuento(r.bacterias)}`}
                  </TD>
                  <TD style={styles.demasColumnas}>
                    <ValorRecuento recuento={r.bacterias} />
                  </TD>
                </TR>
              )}

              {/* SULFITO REDUCTORES */}
              {tieneResultado(r.sulfito) && (
                <TR>
                  <TD style={styles.columnaTitulo}>
                    {`Sulfito reductores${unidadRecuento(r.sulfito)}`}
                  </TD>
                  <TD style={styles.demasColumnas}>
                    <ValorRecuento recuento={r.sulfito} />
                  </TD>
                </TR>
              )}

              {/* ESCHERICHIA COLI */}
              {tieneResultado(r.escherichia) && (
                <TR>
                  <TD style={styles.columnaTitulo}>
                    {/* Extra space: the italic "i" leans into the "(" */}
                    <Text style={{ fontStyle: "italic" }}>Escherichia coli </Text>
                    <Text>{unidadRecuento(r.escherichia)}</Text>
                  </TD>
                  <TD style={styles.demasColumnas}>
                    <ValorRecuento recuento={r.escherichia} />
                  </TD>
                </TR>
              )}

              {/* MOHOS Y LEVADURAS */}
              {tieneResultado(r.mohos) && (
                <TR>
                  <TD style={styles.columnaTitulo}>
                    {`Mohos y levaduras${unidadRecuento(r.mohos)}`}
                  </TD>
                  <TD style={styles.demasColumnas}>
                    <ValorRecuento recuento={r.mohos} />
                  </TD>
                </TR>
              )}

              {/* SALMONELLA */}
              {r.salmonella.presencia && (
                <TR>
                  <TD style={[styles.columnaTitulo, { fontStyle: "italic" }]}>
                    Salmonella spp
                  </TD>
                  <TD style={styles.demasColumnas}>
                    {`${r.salmonella.presencia}/${r.salmonella.base ?? ""} ${r.salmonella.unidad ?? ""}`}
                  </TD>
                </TR>
              )}

              {/* Humedad */}
              {humedad !== undefined && (
                <TR>
                  <TD style={styles.columnaTitulo}>Humedad (%)</TD>
                  <TD style={styles.demasColumnas}>
                    {formatter.format(humedad)}
                  </TD>
                </TR>
              )}

              {/* pH */}
              {ph !== undefined && (
                <TR>
                  <TD style={styles.columnaTitulo}>pH</TD>
                  <TD style={styles.demasColumnas}>{formatter.format(ph)}</TD>
                </TR>
              )}

              {/* Grados Brix */}
              {gradosBrics !== undefined && (
                <TR>
                  <TD style={styles.columnaTitulo}>° Brix</TD>
                  <TD style={styles.demasColumnas}>
                    {formatter.format(gradosBrics)}
                  </TD>
                </TR>
              )}

              {/* Otros análisis */}
              {r.otros.map((otro, index) => (
                <TR key={index}>
                  <TD style={styles.columnaTitulo}>{otro.nombre}</TD>
                  <TD style={styles.demasColumnas}>
                    {formatter.format(otro.valor ?? 0)}
                  </TD>
                </TR>
              ))}

              {/* Otros recuentos (provisionally the last rows) */}
              {r.otrosRecuentos.map((recuento, index) => (
                <TR key={`recuento-${index}`}>
                  <TD style={styles.columnaTitulo}>
                    {`${recuento.nombre}${unidadRecuento(recuento)}`}
                  </TD>
                  <TD style={styles.demasColumnas}>
                    <ValorRecuento recuento={recuento} />
                  </TD>
                </TR>
              ))}
            </Table>
            {food.observaciones && (
              <View>
                <Text
                  style={{
                    marginLeft: "30px",
                    fontStyle: "italic",
                    fontSize: 9,
                  }}
                >
                  {food.observaciones}
                </Text>
              </View>
            )}
          </View>
        </View>

        <View>
          <View style={styles.texto}>
            <Text>Tandil, {fechaInforme}</Text>
          </View>
          <View style={styles.pieFirma}>
            {signature ? (
              <>
                <Image style={styles.encabezadoImageLogo} src={firma} />
                <Text>Lic. Savina López - Mat. Nº 10442</Text>
              </>
            ) : (
              <View style={{ height: 50 }} />
            )}
            <Text>Microbiología de Agua y Análisis de Alimentos</Text>
            <Text>Laboratorio Horizonte</Text>
            <Text>Las Heras 615 - Tandil</Text>
            <Text>Tel. 249-4560651</Text>
          </View>
          <Text style={[styles.texto, { fontStyle: "italic" }]}>
            Este laboratorio bromatológico está habilitado por el Ministerio de
            Salud de la Provincia de Buenos Aires, habilitación n° 2900-44730.
          </Text>
        </View>
      </Page>
    </Document>
  );
};
