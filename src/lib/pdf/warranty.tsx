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
  accentLine: {
    height: 3,
    backgroundColor: PDF.accent,
    borderRadius: 2,
    marginTop: 12,
    marginBottom: 16,
  },

  // Period hero
  hero: {
    backgroundColor: PDF.primary,
    borderRadius: 10,
    padding: 16,
    marginBottom: 14,
  },
  heroTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  heroLabel: {
    fontSize: 7.5,
    fontWeight: 600,
    letterSpacing: 1.1,
    color: PDF.softFg,
    textTransform: "uppercase",
  },
  statusBadge: { borderRadius: 20, paddingHorizontal: 8, paddingVertical: 4 },
  statusText: {
    fontSize: 7,
    fontWeight: 700,
    letterSpacing: 0.8,
    color: PDF.white,
    textTransform: "uppercase",
  },
  heroRow: { flexDirection: "row" },
  heroCol: { flex: 1 },
  heroColBorder: { borderLeftWidth: 1, borderLeftColor: "#3A3A3A", paddingLeft: 12 },
  heroColLabel: { fontSize: 7.5, color: PDF.softFg, marginBottom: 4 },
  heroColValue: {
    fontFamily: "Barlow Condensed",
    fontWeight: 700,
    fontSize: 18,
    color: PDF.white,
  },
  heroColValueAccent: { color: PDF.accent },

  // Customer + appliance
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

  // Services + parts
  sectionRow: { flexDirection: "row", gap: 10, marginBottom: 12 },
  sectionCard: {
    flex: 1,
    backgroundColor: PDF.white,
    borderWidth: 1,
    borderColor: PDF.border,
    borderRadius: 8,
    padding: 12,
  },
  sectionHeader: { flexDirection: "row", alignItems: "center", gap: 5, marginBottom: 8 },
  sectionTitle: {
    fontSize: 8,
    fontWeight: 600,
    letterSpacing: 0.8,
    color: PDF.primary,
    textTransform: "uppercase",
  },
  bulletRow: { flexDirection: "row", marginBottom: 4, paddingRight: 4 },
  bullet: { width: 8, fontSize: 8.5, color: PDF.accent, fontWeight: 700 },
  bulletText: { flex: 1, fontSize: 8.7, lineHeight: 1.35, color: PDF.primary },
  empty: { fontSize: 8.3, color: PDF.mutedFg, fontStyle: "italic" },

  // Terms
  termsCard: {
    backgroundColor: "#FAFAFA",
    borderWidth: 1,
    borderColor: PDF.border,
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  termsText: {
    fontSize: 8.4,
    lineHeight: 1.45,
    color: PDF.primary,
    textAlign: "justify",
  },
  exclusionsCard: {
    backgroundColor: PDF.warm,
    borderWidth: 1,
    borderColor: PDF.accentBorder,
    borderLeftWidth: 3,
    borderLeftColor: PDF.accent,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  exclusionsTitle: { color: PDF.accent },

  // Signatures
  signatureRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 20,
    marginTop: 16,
  },
  signatureBox: { width: "47%", alignItems: "center" },
  signatureImage: { width: 120, height: 38, marginBottom: 4, objectFit: "contain" },
  signatureSpace: { height: 38, marginBottom: 4 },
  signatureLine: {
    width: "100%",
    borderTopWidth: 1.2,
    borderTopColor: PDF.primary,
    paddingTop: 6,
    alignItems: "center",
  },
  signatureLabel: { fontSize: 8, color: PDF.mutedFg },
  signatureName: {
    fontSize: 8.8,
    fontWeight: 600,
    color: PDF.primary,
    marginTop: 2,
  },
  signatureDate: { fontSize: 7.5, color: PDF.mutedFg, marginTop: 2 },

  // Footer
  footer: {
    position: "absolute",
    bottom: 28,
    left: 36,
    right: 36,
    borderTopWidth: 1,
    borderTopColor: PDF.border,
    paddingTop: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  qr: { width: 44, height: 44 },
  footerTextWrap: { flex: 1, marginLeft: 10 },
  footerTitle: { fontSize: 7.8, fontWeight: 600, color: PDF.primary },
  footerText: { fontSize: 7, color: PDF.mutedFg, marginTop: 1.5, lineHeight: 1.3 },
  footerRight: { alignItems: "flex-end", marginLeft: 8 },
  footerBrand: {
    fontFamily: "Barlow Condensed",
    fontWeight: 700,
    fontSize: 10,
    color: PDF.primary,
    letterSpacing: 0.4,
  },
  pageNumber: { fontSize: 7, color: PDF.mutedFg, marginTop: 3 },
});

export type WarrantyPdfData = {
  number: string;
  createdAt: string;
  status?: string;
  customer: {
    name: string;
    phone: string;
    email?: string | null;
    cpfCnpj?: string | null;
  };
  appliance: {
    type: string;
    brand: string;
    model?: string | null;
    serialNumber?: string | null;
  };
  services: string[];
  parts: string[];
  startDate: string;
  endDate: string;
  durationDays: number;
  terms: string;
  exclusions: string;
  technicianName?: string;
  signatureUrl?: string;
  customerSignatureUrl?: string;
  qrDataUrl?: string;
  company: {
    name: string;
    cnpj: string;
    address: string;
    phone: string;
    email: string;
    site: string;
  };
};

function statusColor(status: string) {
  if (status === "CANCELADA") return PDF.danger;
  if (status === "VENCIDA") return "#525252";
  return PDF.accent;
}

export function WarrantyPdf({ data }: { data: WarrantyPdfData }) {
  const logoSrc = SABTEC_LOGO_DATA_URI;
  const status = (data.status || "ATIVA").toUpperCase();

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Image src={logoSrc} style={styles.logo} />
          <View style={styles.headerRight}>
            <Text style={styles.docTitle}>TERMO DE GARANTIA</Text>
            <Text style={styles.docNumber}>{data.number}</Text>
            <Text style={styles.docMeta}>Emitido em {data.createdAt}</Text>
          </View>
        </View>
        <View style={styles.accentLine} />

        {/* Period */}
        <View style={styles.hero} wrap={false}>
          <View style={styles.heroTop}>
            <Text style={styles.heroLabel}>Período de garantia</Text>
            <View style={[styles.statusBadge, { backgroundColor: statusColor(status) }]}>
              <Text style={styles.statusText}>{status}</Text>
            </View>
          </View>
          <View style={styles.heroRow}>
            <View style={styles.heroCol}>
              <Text style={styles.heroColLabel}>Início</Text>
              <Text style={styles.heroColValue}>{data.startDate}</Text>
            </View>
            <View style={[styles.heroCol, styles.heroColBorder]}>
              <Text style={styles.heroColLabel}>Término</Text>
              <Text style={[styles.heroColValue, styles.heroColValueAccent]}>{data.endDate}</Text>
            </View>
            <View style={[styles.heroCol, styles.heroColBorder]}>
              <Text style={styles.heroColLabel}>Cobertura</Text>
              <Text style={[styles.heroColValue, styles.heroColValueAccent]}>
                {data.durationDays} dias
              </Text>
            </View>
          </View>
        </View>

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
          </View>
        </View>

        {/* Services + parts */}
        <View style={styles.sectionRow}>
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <View style={styles.dot} />
              <Text style={styles.sectionTitle}>Serviços realizados</Text>
            </View>
            {data.services.length ? (
              data.services.map((service, index) => (
                <View key={index} style={styles.bulletRow}>
                  <Text style={styles.bullet}>•</Text>
                  <Text style={styles.bulletText}>{service}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.empty}>Não informado.</Text>
            )}
          </View>

          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <View style={styles.dot} />
              <Text style={styles.sectionTitle}>Peças substituídas</Text>
            </View>
            {data.parts.length ? (
              data.parts.map((part, index) => (
                <View key={index} style={styles.bulletRow}>
                  <Text style={styles.bullet}>•</Text>
                  <Text style={styles.bulletText}>{part}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.empty}>Nenhuma peça substituída.</Text>
            )}
          </View>
        </View>

        {/* Terms */}
        <View style={styles.termsCard}>
          <View style={styles.sectionHeader}>
            <View style={styles.dot} />
            <Text style={styles.sectionTitle}>Condições da garantia</Text>
          </View>
          <Text style={styles.termsText}>{data.terms}</Text>
        </View>

        {/* Exclusions */}
        <View style={styles.exclusionsCard}>
          <View style={styles.sectionHeader}>
            <View style={styles.dot} />
            <Text style={[styles.sectionTitle, styles.exclusionsTitle]}>Exclusões</Text>
          </View>
          <Text style={styles.termsText}>{data.exclusions}</Text>
        </View>

        {/* Signatures */}
        <View style={styles.signatureRow} minPresenceAhead={90}>
          <View style={styles.signatureBox}>
            {data.signatureUrl ? (
              <Image src={data.signatureUrl} style={styles.signatureImage} />
            ) : (
              <View style={styles.signatureSpace} />
            )}
            <View style={styles.signatureLine}>
              <Text style={styles.signatureLabel}>Assinatura do técnico</Text>
              {data.technicianName && (
                <Text style={styles.signatureName}>{data.technicianName}</Text>
              )}
              {data.signatureUrl && (
                <Text style={styles.signatureDate}>Assinatura digital</Text>
              )}
            </View>
          </View>

          <View style={styles.signatureBox}>
            {data.customerSignatureUrl ? (
              <Image src={data.customerSignatureUrl} style={styles.signatureImage} />
            ) : (
              <View style={styles.signatureSpace} />
            )}
            <View style={styles.signatureLine}>
              <Text style={styles.signatureLabel}>Assinatura do cliente</Text>
              {data.customerSignatureUrl && (
                <Text style={styles.signatureDate}>Assinatura digital</Text>
              )}
              {!data.customerSignatureUrl && (
                <Text style={styles.signatureDate}>Data: ____ / ____ / ________</Text>
              )}
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
              render={({ pageNumber, totalPages }) =>
                `Página ${pageNumber} de ${totalPages}`
              }
            />
          </View>
        </View>
      </Page>
    </Document>
  );
}
