import { Document, Page, Text, View, Image, StyleSheet } from "@react-pdf/renderer";
import { PDF, SABTEC_LOGO_DATA_URI } from "./theme";

const styles = StyleSheet.create({
  page: {
    paddingTop: 34,
    paddingHorizontal: 36,
    paddingBottom: 104,
    fontFamily: "Barlow",
    fontSize: 9,
    color: PDF.primary,
    backgroundColor: PDF.white,
  },

  // Header
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  logo: { width: 96, height: 52.6 },
  headerRight: { alignItems: "flex-end" },
  docTitle: {
    fontFamily: "Barlow Condensed",
    fontWeight: 700,
    fontSize: 25,
    letterSpacing: 0.6,
    color: PDF.primary,
  },
  docNumber: {
    fontSize: 10,
    fontWeight: 600,
    color: PDF.accent,
    marginTop: 4,
    letterSpacing: 0.4,
  },
  docMeta: { fontSize: 8, color: PDF.mutedFg, marginTop: 2 },
  statusWrap: { marginTop: 6, alignSelf: "flex-end" },
  statusBadge: { borderRadius: 20, paddingHorizontal: 8, paddingVertical: 4 },
  statusText: {
    fontSize: 7,
    fontWeight: 700,
    letterSpacing: 0.8,
    color: PDF.white,
    textTransform: "uppercase",
  },
  accentLine: {
    height: 3,
    backgroundColor: PDF.accent,
    borderRadius: 2,
    marginTop: 12,
    marginBottom: 16,
  },

  // Customer + appliance cards
  cardsRow: { flexDirection: "row", gap: 10, marginBottom: 12 },
  card: {
    flex: 1,
    backgroundColor: "#FAFAFA",
    borderWidth: 1,
    borderColor: PDF.border,
    borderRadius: 8,
    padding: 12,
  },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: 5, marginBottom: 6 },
  dot: { width: 5, height: 5, borderRadius: 3, backgroundColor: PDF.accent },
  cardTitle: {
    fontSize: 8,
    fontWeight: 600,
    letterSpacing: 0.8,
    color: PDF.mutedFg,
    textTransform: "uppercase",
  },
  cardMain: {
    fontSize: 11.5,
    fontWeight: 700,
    color: PDF.primary,
    marginBottom: 6,
    lineHeight: 1.25,
  },
  metaRow: { flexDirection: "row", marginBottom: 3 },
  metaLabel: { width: 52, fontSize: 7.5, color: PDF.mutedFg },
  metaValue: { flex: 1, fontSize: 8.7, color: PDF.primary },
  metaValueStrong: { fontWeight: 600 },

  // Diagnosis
  diagnosisCard: {
    backgroundColor: "#FAFAFA",
    borderWidth: 1,
    borderColor: PDF.border,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  diagnosisText: { fontSize: 9, color: PDF.primary, lineHeight: 1.4, textAlign: "justify" },

  // Items table
  table: { marginBottom: 12 },
  tableHeader: { flexDirection: "row", backgroundColor: PDF.primary, padding: 8, borderTopLeftRadius: 6, borderTopRightRadius: 6 },
  tableHeaderCell: { fontSize: 8.5, fontFamily: "Barlow Condensed", fontWeight: 700, color: PDF.white },
  tableRow: { flexDirection: "row", padding: 8, borderBottom: `1px solid ${PDF.border}` },
  tableRowAlt: { backgroundColor: "#FAFAFA" },
  tableCell: { fontSize: 9, color: PDF.primary },
  colDesc: { width: "50%" },
  colQty: { width: "10%", textAlign: "center" },
  colUnit: { width: "20%", textAlign: "right" },
  colTotal: { width: "20%", textAlign: "right" },

  // Totals
  totalsBlock: { backgroundColor: PDF.primary, borderRadius: 10, padding: 16, marginTop: 4 },
  totalsRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  totalsLabel: { fontSize: 9.5, color: PDF.white },
  totalsValue: { fontSize: 9.5, fontWeight: 600, color: PDF.white },
  totalFinal: { flexDirection: "row", justifyContent: "space-between", marginTop: 8, paddingTop: 10, borderTopWidth: 1, borderTopColor: "#3A3A3A" },
  totalFinalLabel: { fontSize: 13, fontWeight: 700, color: PDF.white },
  totalFinalValue: { fontSize: 16, fontFamily: "Barlow Condensed", fontWeight: 700, color: PDF.accent },

  // Validity badge
  validityBadge: { backgroundColor: PDF.accent, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4, alignSelf: "flex-start", marginTop: 10, marginBottom: 12 },
  validityText: { fontSize: 8.5, fontWeight: 700, color: PDF.white },

  // Conditions
  conditionsCard: { backgroundColor: "#FAFAFA", borderWidth: 1, borderColor: PDF.border, borderRadius: 8, padding: 12, marginTop: 2 },
  conditionsText: { fontSize: 8.5, color: PDF.primary, lineHeight: 1.4, marginBottom: 2 },

  // Signatures
  signatureRow: { flexDirection: "row", justifyContent: "space-between", gap: 20, marginTop: 16 },
  signatureBox: { width: "47%", alignItems: "center" },
  signatureImage: { width: 120, height: 38, marginBottom: 4, objectFit: "contain" },
  signatureSpace: { height: 38, marginBottom: 4 },
  signatureLine: { width: "100%", borderTopWidth: 1.2, borderTopColor: PDF.primary, paddingTop: 6, alignItems: "center" },
  signatureLabel: { fontSize: 8, color: PDF.mutedFg },
  signatureName: { fontSize: 8.8, fontWeight: 600, color: PDF.primary, marginTop: 2 },
  signatureDate: { fontSize: 7.5, color: PDF.mutedFg, marginTop: 2 },

  // Footer
  footer: { position: "absolute", bottom: 28, left: 36, right: 36, borderTopWidth: 1, borderTopColor: PDF.border, paddingTop: 8, flexDirection: "row", alignItems: "center" },
  qr: { width: 44, height: 44 },
  footerTextWrap: { flex: 1, marginLeft: 10 },
  footerTitle: { fontSize: 7.8, fontWeight: 600, color: PDF.primary },
  footerText: { fontSize: 7, color: PDF.mutedFg, marginTop: 1.5, lineHeight: 1.3 },
  footerRight: { alignItems: "flex-end", marginLeft: 8 },
  footerBrand: { fontFamily: "Barlow Condensed", fontWeight: 700, fontSize: 10, color: PDF.primary, letterSpacing: 0.4 },
  pageNumber: { fontSize: 7, color: PDF.mutedFg, marginTop: 3 },
});

export type QuotePdfData = {
  number: string;
  createdAt: string;
  status?: string;
  validUntil: string;
  customer: { name: string; phone: string; email?: string | null; cpfCnpj?: string | null; address?: string | null; city?: string | null };
  appliance: { type: string; brand: string; model?: string | null; serialNumber?: string | null; voltage?: string | null };
  diagnosis: string;
  items: { description: string; quantity: number; unitPrice: number; total: number }[];
  laborCost: number;
  partsCost: number;
  discount: number;
  total: number;
  technicianName?: string;
  qrDataUrl?: string;
  company: { name: string; cnpj: string; address: string; phone: string; email: string; site: string };
};

export function QuotePdf({ data }: { data: QuotePdfData }) {
  const logoSrc = SABTEC_LOGO_DATA_URI;
  const status = (data.status || "RASCUNHO").toUpperCase();
  const isApproved = status === "APROVADO" || status === "CONVERTIDO";
  const statusLabel = isApproved ? "APROVADO" : "PENDENTE";
  const statusBg = isApproved ? PDF.success : PDF.accent;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Image src={logoSrc} style={styles.logo} />
          <View style={styles.headerRight}>
            <Text style={styles.docTitle}>ORÇAMENTO</Text>
            <Text style={styles.docNumber}>{data.number}</Text>
            <Text style={styles.docMeta}>Emitido em {data.createdAt}</Text>
            <View style={styles.statusWrap}>
              <View style={[styles.statusBadge, { backgroundColor: statusBg }]}>
                <Text style={styles.statusText}>{statusLabel}</Text>
              </View>
            </View>
          </View>
        </View>
        <View style={styles.accentLine} />

        {/* Customer + appliance */}
        <View style={styles.cardsRow}>
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.dot} />
              <Text style={styles.cardTitle}>Cliente</Text>
            </View>
            <Text style={styles.cardMain}>{data.customer.name}</Text>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Telefone</Text>
              <Text style={[styles.metaValue, styles.metaValueStrong]}>{data.customer.phone}</Text>
            </View>
            {data.customer.email && (
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>E-mail</Text>
                <Text style={styles.metaValue}>{data.customer.email}</Text>
              </View>
            )}
            {data.customer.cpfCnpj && (
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>CPF/CNPJ</Text>
                <Text style={styles.metaValue}>{data.customer.cpfCnpj}</Text>
              </View>
            )}
            {data.customer.address && (
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Endereço</Text>
                <Text style={styles.metaValue}>{data.customer.address}{data.customer.city ? ` — ${data.customer.city}` : ""}</Text>
              </View>
            )}
          </View>

          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.dot} />
              <Text style={styles.cardTitle}>Aparelho</Text>
            </View>
            <Text style={styles.cardMain}>{data.appliance.type}</Text>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Marca</Text>
              <Text style={[styles.metaValue, styles.metaValueStrong]}>{data.appliance.brand}</Text>
            </View>
            {data.appliance.model && (
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Modelo</Text>
                <Text style={styles.metaValue}>{data.appliance.model}</Text>
              </View>
            )}
            {data.appliance.serialNumber && (
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Nº de série</Text>
                <Text style={styles.metaValue}>{data.appliance.serialNumber}</Text>
              </View>
            )}
            {data.appliance.voltage && (
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Voltagem</Text>
                <Text style={styles.metaValue}>{data.appliance.voltage}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Diagnosis */}
        <View style={styles.diagnosisCard}>
          <View style={styles.cardHeader}>
            <View style={styles.dot} />
            <Text style={styles.cardTitle}>Diagnóstico</Text>
          </View>
          <Text style={styles.diagnosisText}>{data.diagnosis}</Text>
        </View>

        {/* Items table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, styles.colDesc]}>Descrição</Text>
            <Text style={[styles.tableHeaderCell, styles.colQty]}>Qtd</Text>
            <Text style={[styles.tableHeaderCell, styles.colUnit]}>Unitário</Text>
            <Text style={[styles.tableHeaderCell, styles.colTotal]}>Total</Text>
          </View>
          {data.items.map((it, i) => (
            <View key={i} style={[styles.tableRow, i % 2 === 1 ? styles.tableRowAlt : {}]}>
              <Text style={[styles.tableCell, styles.colDesc]}>{it.description}</Text>
              <Text style={[styles.tableCell, styles.colQty]}>{it.quantity}</Text>
              <Text style={[styles.tableCell, styles.colUnit]}>R$ {it.unitPrice.toFixed(2)}</Text>
              <Text style={[styles.tableCell, styles.colTotal]}>R$ {it.total.toFixed(2)}</Text>
            </View>
          ))}
          <View style={styles.tableRow}>
            <Text style={[styles.tableCell, styles.colDesc, { fontFamily: "Barlow", fontWeight: 700 }]}>Mão de obra</Text>
            <Text style={[styles.tableCell, styles.colQty]} />
            <Text style={[styles.tableCell, styles.colUnit]} />
            <Text style={[styles.tableCell, styles.colTotal, { fontFamily: "Barlow", fontWeight: 700 }]}>R$ {data.laborCost.toFixed(2)}</Text>
          </View>
        </View>

        {/* Totals */}
        <View style={styles.totalsBlock}>
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>Subtotal peças</Text>
            <Text style={styles.totalsValue}>R$ {data.partsCost.toFixed(2)}</Text>
          </View>
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>Mão de obra</Text>
            <Text style={styles.totalsValue}>R$ {data.laborCost.toFixed(2)}</Text>
          </View>
          {data.discount > 0 && (
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>Desconto</Text>
              <Text style={styles.totalsValue}>- R$ {data.discount.toFixed(2)}</Text>
            </View>
          )}
          <View style={styles.totalFinal}>
            <Text style={styles.totalFinalLabel}>TOTAL</Text>
            <Text style={styles.totalFinalValue}>R$ {data.total.toFixed(2)}</Text>
          </View>
        </View>

        {/* Validity */}
        <View style={styles.validityBadge}>
          <Text style={styles.validityText}>Validade: até {data.validUntil}</Text>
        </View>

        {/* Conditions */}
        <View style={styles.conditionsCard}>
          <View style={styles.cardHeader}>
            <View style={styles.dot} />
            <Text style={styles.cardTitle}>Condições</Text>
          </View>
          <Text style={styles.conditionsText}>• Serviço executado mediante aprovação deste orçamento.</Text>
          <Text style={styles.conditionsText}>• Garantia de 90 dias sobre serviços e peças substituídas.</Text>
          {data.technicianName && <Text style={styles.conditionsText}>• Técnico responsável: {data.technicianName}</Text>}
        </View>

        {/* Signatures */}
        <View style={styles.signatureRow} minPresenceAhead={90}>
          <View style={styles.signatureBox}>
            <View style={styles.signatureSpace} />
            <View style={styles.signatureLine}>
              <Text style={styles.signatureLabel}>Assinatura do técnico</Text>
              {data.technicianName && <Text style={styles.signatureName}>{data.technicianName}</Text>}
            </View>
          </View>

          <View style={styles.signatureBox}>
            <View style={styles.signatureSpace} />
            <View style={styles.signatureLine}>
              <Text style={styles.signatureLabel}>Assinatura do cliente</Text>
              <Text style={styles.signatureDate}>Assinatura: ____ / ____ / ________</Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer} fixed>
          {data.qrDataUrl ? <Image src={data.qrDataUrl} style={styles.qr} /> : null}
          <View style={styles.footerTextWrap}>
            <Text style={styles.footerTitle}>{data.company.name}</Text>
            <Text style={styles.footerText}>
              CNPJ {data.company.cnpj} · {data.company.phone} · {data.company.email}
            </Text>
            <Text style={styles.footerText}>
              {data.company.address} · {data.company.site}
            </Text>
            <Text style={styles.footerText}>Valide este documento escaneando o QR Code.</Text>
          </View>
          <View style={styles.footerRight}>
            <Text style={styles.footerBrand}>SABTEC</Text>
            <Text
              style={styles.pageNumber}
              render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`}
            />
          </View>
        </View>
      </Page>
    </Document>
  );
}
