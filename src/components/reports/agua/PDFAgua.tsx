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
import type { Report, ReportWater } from "@/types/types";

const Br = () => "\n";

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
  conclusiones: { width: "80%", margin: "10px auto" },
  conclusionesColumna: {
    padding: "0 4px",
    justifyContent: "center",
    alignItems: "center",
  },
  // Nuevo: fontSize como NÚMERO, no string con "px"
  conclusionesResultadoDestacado: {
    fontWeight: "bold",
    fontSize: 16,
  },
  pieFirma: { marginLeft: "350px", fontSize: 9 },
});

const formatDate = (value?: string) => {
  if (!value) return "";
  const parsed = dayjs(value);
  if (!parsed.isValid()) {
    console.warn("[PDFAgua] Fecha inválida recibida:", value);
    return "";
  }
  return parsed.format("DD/MM/YYYY");
};

type PDFAguaProps = {
  report: Report;
  water: ReportWater;
  clientName: string;
  signature?: boolean;
};

export const PDFAgua = ({
  water,
  clientName,
  signature = true,
}: PDFAguaProps) => {
  const fechaRecepcion = formatDate(water.fecha_recepcion);
  const fechaInicio = formatDate(water.fecha_inicio);
  const fechaInforme = formatDate(water.fecha_informe);

  const aerobiasDeficiente = water.aerobias === ">500";
  const aerobiasAceptable = water.aerobias === "<10";
  const bacteriasPresencia = !!water.bacterias && water.bacterias !== "<1,1";
  const coliformesPresencia = !!water.coliformes && water.coliformes !== "<1,1";
  const escherichiaPresencia = water.escherichia === "Presencia";
  const pseudomonaPresencia = water.pseudomona === "Presencia";

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.encabezado}>
          <Image style={styles.encabezadoImageLogo} src={logoHorizonte} />
          <Text>
            {`Nº ${water.numero_laboratorio ?? ""} - ${water.numero_propio ?? ""}`}
          </Text>
        </View>

        <Text style={styles.tituloInforme}>
          Análisis microbiológicos de agua
        </Text>

        <Table style={styles.remitente} weightings={[0.3, 0.8]}>
          <TR>
            <TD style={styles.columnaTitulo}>Remite la muestra</TD>
            <TD style={styles.demasColumnas}>{clientName}</TD>
          </TR>
          <TR>
            <TD style={styles.columnaTitulo}>Recepción de muestra</TD>
            <TD style={styles.demasColumnas}>{fechaRecepcion}</TD>
          </TR>
          <TR>
            <TD style={styles.columnaTitulo}>Fecha de inicio</TD>
            <TD style={styles.demasColumnas}>{fechaInicio}</TD>
          </TR>
          <TR>
            <TD style={styles.columnaTitulo}>Dirección de muestreo</TD>
            <TD style={styles.demasColumnas}>{water.remitente_direccion}</TD>
          </TR>
          <TR>
            <TD style={styles.columnaTitulo}>Detalle de muestra</TD>
            <TD style={styles.demasColumnas}>{water.detalle}</TD>
          </TR>
        </Table>

        <View style={styles.texto}>
          <Text style={{ marginBottom: 12 }}>
            Se realizaron determinaciones de rutina según Art. 982 del Código
            Alimentario Argentino, desarrolladas en Laboratorio Horizonte (Las
            Heras 615 - Tandil).
          </Text>
          <Text style={{ marginBottom: 12 }}>
            <Text style={{ fontWeight: "bold" }}>Metodología empleada: </Text>
            Recuento de microorganismos aerobios en placa. Recuento de
            coliformes totales, coliformes fecales y{" "}
            <Text style={{ fontStyle: "italic" }}>Escherichia coli</Text>,
            método NMP por tubos múltiples. Detección de{" "}
            <Text style={{ fontStyle: "italic" }}>Pseudomona aeruginosa:</Text>{" "}
            Estandar Methods for the Examination of Water y Wasterwater 21st
            Edition (2005).
          </Text>
        </View>

        <View style={styles.resultados}>
          <Text style={{ fontWeight: "bold", marginBottom: 5 }}>
            Resultados de los análisis
          </Text>
          <Table weightings={[0.36, 0.36, 0.28]}>
            {water.aerobias && (
              <TR>
                <TD
                  style={
                    aerobiasDeficiente
                      ? [styles.columnaTitulo, { textDecoration: "underline" }]
                      : [styles.columnaTitulo]
                  }
                >
                  Recuento de aerobias mesófilas
                </TD>
                <TD style={styles.demasColumnas}>
                  {aerobiasDeficiente
                    ? "Calidad deficiente"
                    : aerobiasAceptable
                      ? "Calidad aceptable"
                      : ""}
                </TD>
                <TD style={styles.demasColumnas}>
                  {`${water.aerobias} UFC/ml`}
                </TD>
              </TR>
            )}

            {water.bacterias && (
              <TR>
                <TD
                  style={
                    bacteriasPresencia
                      ? [styles.columnaTitulo, { textDecoration: "underline" }]
                      : [styles.columnaTitulo]
                  }
                >
                  NMP Bacterias coliformes
                </TD>
                <TD style={styles.demasColumnas}>
                  {bacteriasPresencia
                    ? "Presencia"
                    : "Ausencia / No se detecta"}
                </TD>
                <TD style={styles.demasColumnas}>
                  {`${water.bacterias} NMP/100 ml`}
                </TD>
              </TR>
            )}

            {water.coliformes && (
              <TR>
                <TD
                  style={
                    coliformesPresencia
                      ? [styles.columnaTitulo, { textDecoration: "underline" }]
                      : [styles.columnaTitulo]
                  }
                >
                  NMP Coliformes termotolerantes
                </TD>
                <TD style={styles.demasColumnas}>
                  {coliformesPresencia
                    ? "Presencia"
                    : "Ausencia / No se detecta"}
                </TD>
                <TD style={styles.demasColumnas}>
                  {`${water.coliformes} NMP/100 ml`}
                </TD>
              </TR>
            )}

            {water.escherichia && (
              <TR>
                <TD
                  style={
                    escherichiaPresencia
                      ? [
                          styles.columnaTitulo,
                          { fontStyle: "italic", textDecoration: "underline" },
                        ]
                      : [styles.columnaTitulo, { fontStyle: "italic" }]
                  }
                >
                  Escherichia coli
                </TD>
                <TD style={styles.demasColumnas}>
                  {escherichiaPresencia
                    ? "Presencia"
                    : "Ausencia / No se detecta"}
                </TD>
                <TD style={styles.demasColumnas}>
                  {`${water.escherichia}/100 ml`}
                </TD>
              </TR>
            )}

            {water.pseudomona && (
              <TR>
                <TD
                  style={
                    pseudomonaPresencia
                      ? [
                          styles.columnaTitulo,
                          { fontStyle: "italic", textDecoration: "underline" },
                        ]
                      : [styles.columnaTitulo, { fontStyle: "italic" }]
                  }
                >
                  Pseudomona aeruginosa
                </TD>
                <TD style={styles.demasColumnas}>
                  {pseudomonaPresencia
                    ? "Presencia"
                    : "Ausencia / No se detecta"}
                </TD>
                <TD style={styles.demasColumnas}>
                  {`${water.pseudomona}/100 ml`}
                </TD>
              </TR>
            )}
          </Table>
        </View>

        {water.resultado && (
          <Table style={styles.conclusiones} weightings={[0.2, 0.48, 0.32]}>
            <TR style={{ fontWeight: "bold", height: 20 }}>
              <TD style={styles.conclusionesColumna}>Conclusión</TD>
              <TD style={styles.conclusionesColumna}>Resultados parámetros</TD>
              <TD style={styles.conclusionesColumna}>Leyendas asociadas</TD>
            </TR>
            <TR style={{ height: 70 }}>
              <TD
                style={[
                  styles.conclusionesColumna,
                  styles.conclusionesResultadoDestacado,
                ]}
              >
                {water.resultado}
              </TD>
              <TD style={styles.conclusionesColumna}>
                {water.resultado === "Deficiente" ? (
                  <Text>
                    Rec. de aerobias mesófilas {">"} 500 UFC/ml. <Br />
                    <Text>
                      El resto de los parámetros cumplen con el CAA (art. 982)
                    </Text>
                  </Text>
                ) : water.resultado === "Potable" ? (
                  <Text>Cumplen con CAA (art. 982)</Text>
                ) : (
                  <View>
                    <Text>
                      Bacterias coliformes: {"<"} 1,1 NMP en 100 ml
                      <Br />
                    </Text>
                    <Text>
                      <Text style={{ fontStyle: "italic" }}>
                        Escherichia coli:{" "}
                      </Text>
                      ausencia en 100 ml
                      <Br />
                    </Text>
                    <Text>
                      <Text style={{ fontStyle: "italic" }}>
                        Pseudomona aeruginosa:{" "}
                      </Text>
                      ausencia en 100 ml
                    </Text>
                  </View>
                )}
              </TD>
              <TD style={styles.conclusionesColumna}>
                {water.resultado === "Deficiente" ? (
                  <Text>
                    Observación: se recomienda higienizar las instalaciones y
                    realizar un nuevo recuento. CAA (art. 982)
                  </Text>
                ) : water.resultado === "Potable" ? (
                  <Text>
                    Observación: Los parámetros analizados cumplen con los
                    límites especificados en el Código Alimentario Argentino
                    (art. 982)
                  </Text>
                ) : (
                  <Text>
                    Observación: el/los parámetros subrayados no cumplen con los
                    límites establecidos en el Código Alimentario Argentino
                    (art. 982)
                  </Text>
                )}
              </TD>
            </TR>
          </Table>
        )}

        <View>
          <View style={styles.texto}>
            {water.persona === "Personal del laboratorio" ? (
              <Text>
                NOTA: La muestra fue tomada por personal del laboratorio.
              </Text>
            ) : (
              <Text>
                NOTA: El laboratorio procesa la muestra remitida pero no se hace
                responsable de su identificación. La muestra fue tomada por
                persona exenta al laboratorio.
              </Text>
            )}
          </View>
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
            Laboratorio bromatológico habilitado por el Ministerio de Salud de
            la Provincia de Buenos Aires, habilitación n° 2900-44730.
          </Text>
        </View>
      </Page>
    </Document>
  );
};
