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
import delta from "@/assets/delta.png";
import LatoRegular from "@/assets/fonts/Lato-Regular.ttf";
import LatoBold from "@/assets/fonts/Lato-Bold.ttf";
import LatoItalic from "@/assets/fonts/Lato-Italic.ttf";
import LatoBoldItalic from "@/assets/fonts/Lato-BoldItalic.ttf";
import type { Report, ReportAnimalNutrition } from "@/types/types";
import {
  genericosTalCualSeca,
  genericosUnValor,
  talCualSecaCampos,
  unValorCampos,
} from "@/lib/nutricion";

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
  remitente: { width: "400px", margin: "10px auto 0" },
  columnaTitulo: { fontWeight: "bold", padding: "2px 6px" },
  demasColumnas: { padding: "2px 6px" },
  resultadosColumnas: { padding: "2px 6px", justifyContent: "center" },
  texto: { margin: "10px auto 0", width: "80%", fontSize: 9 },
  textoIndicativo: { width: "400px", margin: "10px auto 0", fontSize: 7 },
  resultados: { width: "80%", margin: "14px auto" },
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
    console.warn("[PDFNutricion] Fecha inválida recibida:", value);
    return "";
  }
  return parsed.format("DD/MM/YYYY");
};

// numeric columns can arrive as strings; a missing value or 0 is printed as "-"
const toNumber = (value: unknown) =>
  value === null || value === undefined || value === "" ? undefined : Number(value);

const hasValue = (value: unknown) => toNumber(value) !== undefined;

const formatValor = (value: unknown) => {
  const n = toNumber(value);
  return n === undefined || n === 0 ? "-" : formatter.format(n);
};

type PDFNutricionProps = {
  report: Report;
  nutrition: ReportAnimalNutrition;
  clientName: string;
  signature?: boolean;
};

export const PDFNutricion = ({
  nutrition,
  clientName,
  signature = true,
}: PDFNutricionProps) => {
  const fechaRecepcion = formatDate(nutrition.fecha_recepcion);
  const fechaInforme = formatDate(nutrition.fecha_informe);

  // Rows with two values (fixed + free-form), shown when at least one is loaded
  const filasTalCualSeca = [
    ...talCualSecaCampos.map(({ column, label }) => ({
      key: column,
      title: label,
      talCual: nutrition[`${column}_tal_cual`],
      seca: nutrition[`${column}_seca`],
    })),
    ...genericosTalCualSeca.map((g) => ({
      key: g,
      title: nutrition[`${g}_name`] ?? "",
      talCual: nutrition[`${g}_tal_cual`],
      seca: nutrition[`${g}_seca`],
    })),
  ].filter((fila) => hasValue(fila.talCual) || hasValue(fila.seca));

  // Rows with a single value (fixed + free-form)
  const filasUnValor = [
    ...unValorCampos.map(({ column, label }) => ({
      key: column,
      title: label,
      valor: nutrition[column],
    })),
    ...genericosUnValor.map((g) => ({
      key: g,
      title: nutrition[`${g}_name`] ?? "",
      valor: nutrition[`${g}_number`],
    })),
  ].filter((fila) => hasValue(fila.valor));

  const tieneActividadUreasica =
    hasValue(nutrition.actividad_ureasica_muestra) ||
    hasValue(nutrition.actividad_ureasica_testigo);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View>
          <View style={styles.encabezado}>
            <Image style={styles.encabezadoImageLogo} src={logoHorizonte} />
            <Text>{`Nº ${nutrition.numero_propio ?? ""}`}</Text>
          </View>
          <Text style={styles.tituloInforme}>CERTIFICADO DE ANÁLISIS</Text>
          <Table style={styles.remitente} weightings={[0.3, 0.8]}>
            <TR>
              <TD style={styles.columnaTitulo}>Solicitante</TD>
              <TD style={styles.demasColumnas}>{clientName}</TD>
            </TR>
            <TR>
              <TD style={styles.columnaTitulo}>Orden</TD>
              <TD style={styles.demasColumnas}>{nutrition.orden ?? ""}</TD>
            </TR>
            <TR>
              <TD style={styles.columnaTitulo}>Fecha de recepción</TD>
              <TD style={styles.demasColumnas}>{fechaRecepcion}</TD>
            </TR>
            <TR>
              <TD style={styles.columnaTitulo}>Nº muestra</TD>
              <TD style={styles.demasColumnas}>
                {nutrition.numero_laboratorio ?? ""}
              </TD>
            </TR>
            <TR>
              <TD style={styles.columnaTitulo}>Tipo de muestra</TD>
              <TD style={styles.demasColumnas}>{nutrition.tipo_muestra}</TD>
            </TR>
            <TR>
              <TD style={styles.columnaTitulo}>Detalle</TD>
              <TD style={styles.demasColumnas}>{nutrition.detalle}</TD>
            </TR>
          </Table>
          <View style={styles.resultados}>
            <Text style={{ fontWeight: "bold", marginBottom: 5 }}>
              Resultados
            </Text>
            <Table style={styles.remitente} weightings={[0.8, 0.3, 0.3]}>
              <TR>
                <TD style={[styles.columnaTitulo, { border: "none" }]}></TD>
                <TD
                  style={[
                    styles.demasColumnas,
                    { border: "none", fontWeight: "bold" },
                  ]}
                >
                  Sobre sustancia
                </TD>
                <TD style={[styles.demasColumnas, { border: "none" }]}></TD>
              </TR>
              <TR>
                <TD style={styles.columnaTitulo}></TD>
                <TD style={styles.resultadosColumnas}>Tal cual</TD>
                <TD style={styles.resultadosColumnas}>Seca</TD>
              </TR>

              {filasTalCualSeca.map((fila) => (
                <TR key={fila.key}>
                  <TD style={styles.columnaTitulo}>{fila.title}</TD>
                  <TD style={styles.resultadosColumnas}>
                    {formatValor(fila.talCual)}
                  </TD>
                  <TD style={styles.resultadosColumnas}>
                    {formatValor(fila.seca)}
                  </TD>
                </TR>
              ))}

              {/* Single-value rows span the two value columns */}
              <Table weightings={[0.738, 0.6]}>
                {filasUnValor.map((fila) => (
                  <TR key={fila.key}>
                    <TD style={styles.columnaTitulo}>{fila.title}</TD>
                    <TD style={styles.resultadosColumnas}>
                      {formatter.format(toNumber(fila.valor) ?? 0)}
                    </TD>
                  </TR>
                ))}
              </Table>
            </Table>

            {tieneActividadUreasica && (
              <Table style={styles.remitente} weightings={[0.5, 0.3, 0.3]}>
                <TR>
                  <TD
                    style={[
                      styles.columnaTitulo,
                      { textDecoration: "underline" },
                    ]}
                  >
                    Actividad ureásica
                  </TD>
                  <TD style={styles.resultadosColumnas}>Muestra</TD>
                  <TD style={styles.resultadosColumnas}>
                    Soja natural. Testigo
                  </TD>
                </TR>
                <TR>
                  <TD style={styles.columnaTitulo}>
                    <Image
                      style={{ height: "12px", width: "8px", marginRight: "4px" }}
                      src={delta}
                    />
                    pH
                  </TD>
                  <TD style={styles.resultadosColumnas}>
                    {formatValor(nutrition.actividad_ureasica_muestra)}
                  </TD>
                  <TD style={styles.resultadosColumnas}>
                    {formatValor(nutrition.actividad_ureasica_testigo)}
                  </TD>
                </TR>
              </Table>
            )}

            <View style={styles.textoIndicativo}>
              <Text>Determinación de humedad: método gravimétrico</Text>
              <Text>
                Determinación de proteína bruta: Método Kjeldhal (factor: 6,25)
              </Text>
              <Text>
                Determinación de materia grasa/extracto etéreo: extracción
                soxhlet
              </Text>
              <Text>
                NNP: % de nitrógeno no proteico expresado en base a la PB
              </Text>
              <Text>
                Determinación de FDN y FDA: Método Van Soest Digestibilidad y EM
                por cálculo a partir de FDA
              </Text>
            </View>
          </View>
        </View>

        <View>
          <View style={styles.texto}>
            <Text>
              Los análisis fueron realizados sobre la muestra recibida del
              cliente, el laboratorio no se hace responsable por la toma de
              muestra.-
            </Text>
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
            Este laboratorio bromatológico está habilitado por el Ministerio de
            Salud de la Provincia de Buenos Aires, habilitación n° 2900-44730.
          </Text>
        </View>
      </Page>
    </Document>
  );
};
