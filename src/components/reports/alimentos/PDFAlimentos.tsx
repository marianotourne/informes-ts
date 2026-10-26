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
import { completarResultados } from "@/lib/alimentos";

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

const hasValue = (value?: number | null) =>
  value !== null && value !== undefined;

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
    {
      id: 1,
      title: "Aerobias mesófilas (UFC/",
      base: r.aerobias.base,
      exponente: r.aerobias.exponente,
      menor10: r.aerobias.menor10,
      unidad: r.aerobias.unidad,
    },
    {
      id: 2,
      title: "Coliformes totales (UFC/",
      base: r.coliformesTotales.base,
      exponente: r.coliformesTotales.exponente,
      menor10: r.coliformesTotales.menor10,
      unidad: r.coliformesTotales.unidad,
    },
    {
      id: 3,
      title: "Coliformes termotolerantes (UFC/",
      base: r.coliformesTermotolerantes.base,
      exponente: r.coliformesTermotolerantes.exponente,
      menor10: r.coliformesTermotolerantes.menor10,
      unidad: r.coliformesTermotolerantes.unidad,
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
            <Table style={styles.remitente} weightings={[0.8, 0.3]}>
              {recuentos.map((recuento) =>
                recuento.menor10 || hasValue(recuento.base) ? (
                  <TR key={recuento.id}>
                    <TD style={styles.columnaTitulo}>
                      {`${recuento.title}${recuento.unidad ?? ""})`}
                    </TD>
                    <TD style={styles.demasColumnas}>
                      {recuento.menor10 ? (
                        `<10`
                      ) : (
                        <Potencia
                          base={formatter.format(recuento.base ?? 0)}
                          exponente={recuento.exponente}
                        />
                      )}
                    </TD>
                  </TR>
                ) : null,
              )}

              {/* ESTAFILOCOCO */}
              {(r.estafilococo.menor10 ||
                r.estafilococo.menor1 ||
                hasValue(r.estafilococo.base)) && (
                <TR>
                  <TD style={styles.columnaTitulo}>
                    <Text style={{ fontStyle: "italic" }}>
                      Estafilococos aureus{" "}
                    </Text>
                    <Text>
                      {`coag. positiva (UFC/${r.estafilococo.unidad ?? ""})`}
                    </Text>
                  </TD>
                  <TD style={styles.demasColumnas}>
                    {r.estafilococo.menor10 ? (
                      <View>
                        <Text style={styles.resultadosBase}>{`<10`}</Text>
                      </View>
                    ) : r.estafilococo.menor1 ? (
                      <Potencia base="<1" exponente={2} />
                    ) : (
                      <Potencia
                        base={formatter.format(r.estafilococo.base ?? 0)}
                        exponente={r.estafilococo.exponente}
                      />
                    )}
                  </TD>
                </TR>
              )}

              {/* BACTERIAS ACIDOLÁCTICAS */}
              {(r.bacterias.menor10 || hasValue(r.bacterias.base)) && (
                <TR>
                  <TD style={styles.columnaTitulo}>
                    {`Bacterias acido-lácticas (UFC/${r.bacterias.unidad ?? ""})`}
                  </TD>
                  <TD style={styles.demasColumnas}>
                    {r.bacterias.menor10 ? (
                      `<10`
                    ) : (
                      <Potencia
                        base={formatter.format(r.bacterias.base ?? 0)}
                        exponente={r.bacterias.exponente}
                      />
                    )}
                  </TD>
                </TR>
              )}

              {/* SULFITO REDUCTORES */}
              {(r.sulfito.menor10 || hasValue(r.sulfito.base)) && (
                <TR>
                  <TD style={styles.columnaTitulo}>
                    {`Sulfito reductores (UFC/${r.sulfito.unidad ?? ""})`}
                  </TD>
                  <TD style={styles.demasColumnas}>
                    {r.sulfito.menor10 ? (
                      `<10`
                    ) : (
                      <Potencia
                        base={formatter.format(r.sulfito.base ?? 0)}
                        exponente={r.sulfito.exponente}
                      />
                    )}
                  </TD>
                </TR>
              )}

              {/* ESCHERICHIA COLI */}
              {(r.escherichia.menor10 || hasValue(r.escherichia.base)) && (
                <TR>
                  <TD style={styles.columnaTitulo}>
                    <Text style={{ fontStyle: "italic" }}>
                      Escherichia coli{" "}
                    </Text>
                    <Text>{`(UFC/${r.escherichia.unidad ?? ""})`}</Text>
                  </TD>
                  <TD style={styles.demasColumnas}>
                    {r.escherichia.menor10 ? (
                      `<10`
                    ) : (
                      <Potencia
                        base={formatter.format(r.escherichia.base ?? 0)}
                        exponente={r.escherichia.exponente}
                      />
                    )}
                  </TD>
                </TR>
              )}

              {/* MOHOS Y LEVADURAS */}
              {(r.mohos.menor10 ||
                r.mohos.menor1 ||
                hasValue(r.mohos.base)) && (
                <TR>
                  <TD style={styles.columnaTitulo}>
                    {`Mohos y levaduras (UFC/${r.mohos.unidad ?? ""})`}
                  </TD>
                  <TD style={styles.demasColumnas}>
                    {r.mohos.menor10 ? (
                      <View>
                        <Text style={styles.resultadosBase}>{`<10`}</Text>
                      </View>
                    ) : r.mohos.menor1 ? (
                      <Potencia base="<1" exponente={2} />
                    ) : (
                      <Potencia
                        base={formatter.format(r.mohos.base ?? 0)}
                        exponente={r.mohos.exponente}
                      />
                    )}
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
                    {`${recuento.nombre} (UFC/${recuento.unidad})`}
                  </TD>
                  <TD style={styles.demasColumnas}>
                    {recuento.menor10 ? (
                      `<10`
                    ) : (
                      <Potencia
                        base={formatter.format(recuento.base ?? 0)}
                        exponente={recuento.exponente}
                      />
                    )}
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
