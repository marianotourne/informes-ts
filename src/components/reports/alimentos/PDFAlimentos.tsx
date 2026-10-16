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
  resultadosExponente: {
    position: "absolute",
    top: "-2px",
    right: "-4px",
    fontSize: 6,
  },
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

// humedad, ph and grados_brics are still text columns in the database
const toNumber = (value?: number | string | null) =>
  value === null || value === undefined || value === "" ? undefined : Number(value);

const hasValue = (value?: number | null) => value !== null && value !== undefined;

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

  const humedad = toNumber(food.humedad);
  const ph = toNumber(food.ph);
  const gradosBrics = toNumber(food.grados_brics);

  const recuentos = [
    {
      id: 1,
      title: "Aerobias mesófilas (UFC/",
      base: food.aerobias_base,
      exponente: food.aerobias_exponente,
      menor10: food.aerobias_menor10,
      unidad: food.aerobias_unidad,
    },
    {
      id: 2,
      title: "Coliformes totales (UFC/",
      base: food.coliformes_totales_base,
      exponente: food.coliformes_totales_exponente,
      menor10: food.coliformes_totales_menor10,
      unidad: food.coliformes_totales_unidad,
    },
    {
      id: 3,
      title: "Coliformes termotolerantes (UFC/",
      base: food.coliformes_termotolerantes_base,
      exponente: food.coliformes_termotolerantes_exponente,
      menor10: food.coliformes_termotolerantes_menor10,
      unidad: food.coliformes_termotolerantes_unidad,
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
                      {`${recuento.title} ${recuento.unidad ?? ""})`}
                    </TD>
                    <TD style={styles.demasColumnas}>
                      {recuento.menor10 ? (
                        `<10`
                      ) : (
                        <>
                          <Text style={styles.resultadosBase}>
                            {formatter.format(recuento.base ?? 0)}
                          </Text>
                          {!!recuento.exponente && (
                            <View>
                              <Text> x 10</Text>
                              <Text style={styles.resultadosExponente}>
                                {recuento.exponente}
                              </Text>
                            </View>
                          )}
                        </>
                      )}
                    </TD>
                  </TR>
                ) : null,
              )}

              {/* ESTAFILOCOCO */}
              {(food.estafilococo_menor10 ||
                food.estafilococo_menor1 ||
                hasValue(food.estafilococo_base)) && (
                <TR>
                  <TD style={styles.columnaTitulo}>
                    <Text style={{ fontStyle: "italic" }}>
                      Estafilococos aureus{" "}
                    </Text>
                    <Text>
                      {`coag. positiva (UFC/${food.estafilococo_unidad ?? ""})`}
                    </Text>
                  </TD>
                  <TD style={styles.demasColumnas}>
                    {food.estafilococo_menor10 ? (
                      <View>
                        <Text style={styles.resultadosBase}>{`<10`}</Text>
                      </View>
                    ) : food.estafilococo_menor1 ? (
                      <View>
                        <View>
                          <Text style={styles.resultadosBase}>{`<1 x 10`}</Text>
                          <Text style={styles.resultadosExponente}>{`2`}</Text>
                        </View>
                      </View>
                    ) : (
                      <View>
                        <Text style={styles.resultadosBase}>
                          {`${formatter.format(food.estafilococo_base ?? 0)} x 10`}
                        </Text>
                        <Text style={styles.resultadosExponente}>
                          {food.estafilococo_exponente}
                        </Text>
                      </View>
                    )}
                  </TD>
                </TR>
              )}

              {/* BACTERIAS ACIDOLÁCTICAS */}
              {(food.bacterias_menor10 || hasValue(food.bacterias_base)) && (
                <TR>
                  <TD style={styles.columnaTitulo}>
                    {`Bacterias acido-lácticas (UFC/${food.bacterias_unidad ?? ""})`}
                  </TD>
                  <TD style={styles.demasColumnas}>
                    {food.bacterias_menor10 ? (
                      `<10`
                    ) : (
                      <View>
                        <Text style={styles.resultadosBase}>
                          {`${formatter.format(food.bacterias_base ?? 0)} x 10`}
                        </Text>
                        <Text style={styles.resultadosExponente}>
                          {food.bacterias_exponente}
                        </Text>
                      </View>
                    )}
                  </TD>
                </TR>
              )}

              {/* SULFITO REDUCTORES */}
              {(food.sulfito_menor10 || hasValue(food.sulfito_base)) && (
                <TR>
                  <TD style={styles.columnaTitulo}>
                    {`Sulfito reductores (UFC/${food.sulfito_unidad ?? ""})`}
                  </TD>
                  <TD style={styles.demasColumnas}>
                    {food.sulfito_menor10 ? (
                      `<10`
                    ) : (
                      <View>
                        <Text style={styles.resultadosBase}>
                          {`${formatter.format(food.sulfito_base ?? 0)} x 10`}
                        </Text>
                        <Text style={styles.resultadosExponente}>
                          {food.sulfito_exponente}
                        </Text>
                      </View>
                    )}
                  </TD>
                </TR>
              )}

              {/* ESCHERICHIA COLI */}
              {(food.escherichia_menor10 || hasValue(food.escherichia_base)) && (
                <TR>
                  <TD style={styles.columnaTitulo}>
                    <Text style={{ fontStyle: "italic" }}>
                      Escherichia coli{" "}
                    </Text>
                    <Text>{`(UFC/${food.escherichia_unidad ?? ""})`}</Text>
                  </TD>
                  <TD style={styles.demasColumnas}>
                    {food.escherichia_menor10 ? (
                      `<10`
                    ) : (
                      <View>
                        <Text style={styles.resultadosBase}>
                          {`${formatter.format(food.escherichia_base ?? 0)} x 10`}
                        </Text>
                        <Text style={styles.resultadosExponente}>
                          {food.escherichia_exponente}
                        </Text>
                      </View>
                    )}
                  </TD>
                </TR>
              )}

              {/* MOHOS Y LEVADURAS */}
              {(food.mohos_menor10 ||
                food.mohos_menor1 ||
                hasValue(food.mohos_base)) && (
                <TR>
                  <TD style={styles.columnaTitulo}>
                    {`Mohos y levaduras (UFC/${food.mohos_unidad ?? ""})`}
                  </TD>
                  <TD style={styles.demasColumnas}>
                    {food.mohos_menor10 ? (
                      <View>
                        <Text style={styles.resultadosBase}>{`<10`}</Text>
                      </View>
                    ) : food.mohos_menor1 ? (
                      <View>
                        <View>
                          <Text style={styles.resultadosBase}>{`<1 x 10`}</Text>
                          <Text style={styles.resultadosExponente}>{`2`}</Text>
                        </View>
                      </View>
                    ) : (
                      <View>
                        <Text style={styles.resultadosBase}>
                          {`${formatter.format(food.mohos_base ?? 0)} x 10`}
                        </Text>
                        <Text style={styles.resultadosExponente}>
                          {food.mohos_exponente}
                        </Text>
                      </View>
                    )}
                  </TD>
                </TR>
              )}

              {/* SALMONELLA */}
              {food.salmonella_presencia && (
                <TR>
                  <TD style={[styles.columnaTitulo, { fontStyle: "italic" }]}>
                    Salmonella spp
                  </TD>
                  <TD style={styles.demasColumnas}>
                    {`${food.salmonella_presencia}/${food.salmonella_base ?? ""} ${food.salmonella_unidad ?? ""}`}
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

              {/* Generic01 */}
              {food.generic01_name && (
                <TR>
                  <TD style={styles.columnaTitulo}>{food.generic01_name}</TD>
                  <TD style={styles.demasColumnas}>
                    {food.generic01_number ?? ""}
                  </TD>
                </TR>
              )}
            </Table>
            {food.observaciones && (
              <View>
                <Text
                  style={{ marginLeft: "30px", fontStyle: "italic", fontSize: 9 }}
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
