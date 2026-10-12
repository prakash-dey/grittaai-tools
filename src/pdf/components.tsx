import React from "react";
import { Image, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import type { Style } from "@react-pdf/stylesheet";
import { COLORS, FONT, LOGO_PATH } from "./theme";
import type { CompanySnapshot, SignatorySnapshot } from "@/documents/types";

const s = StyleSheet.create({
  page: {
    fontFamily: FONT,
    fontSize: 10.5,
    color: COLORS.dark,
    paddingTop: 34,
    paddingBottom: 54,
    paddingHorizontal: 56,
  },
  // Line height is set per text style: on the Page it hides render-prop text (page numbers),
  // and on a wrapper View it is inherited inconsistently.
  letterheadLogo: { width: 34, height: 34, alignSelf: "center", marginBottom: 4 },
  wordmark: {
    fontSize: 19,
    fontWeight: "bold",
    color: COLORS.brand,
    textAlign: "center",
    letterSpacing: 2,
  },
  letterheadRule: { borderBottomWidth: 1.5, borderBottomColor: COLORS.brand, marginTop: 10, marginBottom: 16 },
  title: { fontSize: 15, fontWeight: "bold", textAlign: "center", letterSpacing: 0.8 },
  subtitle: { fontSize: 10, color: COLORS.grey, textAlign: "center", marginTop: 2 },
  section: {
    fontSize: 12,
    fontWeight: "bold",
    color: COLORS.brand,
    letterSpacing: 0.4,
    borderBottomWidth: 0.75,
    borderBottomColor: COLORS.brand,
    paddingBottom: 3,
    marginTop: 14,
    marginBottom: 8,
  },
  para: { fontSize: 10.5, textAlign: "justify", marginBottom: 7, lineHeight: 1.42 },
  clauseRow: { flexDirection: "row", marginBottom: 6 },
  clauseNum: { width: 28, fontSize: 10.5, fontWeight: "bold", lineHeight: 1.42 },
  clauseBody: { flex: 1, fontSize: 10.5, textAlign: "justify", lineHeight: 1.42 },
  bold: { fontWeight: "bold" },
  italic: { fontStyle: "italic" },
  table: { borderWidth: 0.75, borderColor: COLORS.dark, marginBottom: 10 },
  tr: { flexDirection: "row" },
  th: { backgroundColor: COLORS.brand, color: COLORS.white, fontWeight: "bold", fontSize: 9.5 },
  td: { paddingVertical: 5, paddingHorizontal: 7, fontSize: 9.5, lineHeight: 1.3 },
  footerRule: { position: "absolute", bottom: 34, left: 56, right: 56, borderTopWidth: 0.5, borderTopColor: COLORS.line },
  footerLeft: { position: "absolute", bottom: 22, left: 56, fontSize: 8, color: COLORS.grey },
  footerRight: { position: "absolute", bottom: 22, left: 56, right: 56, fontSize: 8, color: COLORS.grey, textAlign: "right" },
  sigImage: { height: 34, objectFit: "contain", objectPosition: "left bottom", marginBottom: 2 },
  sigSpace: { height: 36 },
  sigLine: { borderBottomWidth: 0.75, borderBottomColor: COLORS.dark, marginBottom: 4 },
  sigName: { fontWeight: "bold", fontSize: 11 },
  sigTitle: { fontStyle: "italic", fontSize: 9.5, color: COLORS.grey },
  sigLabel: { fontWeight: "bold", fontSize: 11, color: COLORS.brand, marginBottom: 6 },
});

export const styles = s;

/** A4 page with the running footer (contact line + page numbers). */
export function DocPage({ company, children, showPageNumbers = true }: { company: CompanySnapshot; children: React.ReactNode; showPageNumbers?: boolean }) {
  return (
    <Page size="A4" style={s.page}>
      {children}
      <View style={s.footerRule} fixed />
      <Text style={s.footerLeft} fixed>{`${company.companyName}  |  ${company.email}  |  ${company.website}`}</Text>
      {showPageNumbers ? (
        <Text style={s.footerRight} fixed render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
      ) : null}
    </Page>
  );
}

export function Letterhead({ company }: { company: CompanySnapshot }) {
  return (
    <View>
      {/* eslint-disable-next-line jsx-a11y/alt-text */}
      <Image src={LOGO_PATH} style={s.letterheadLogo} />
      <Text style={s.wordmark}>{company.companyName.toUpperCase()}</Text>
      <View style={s.letterheadRule} />
    </View>
  );
}

export function DocTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={s.title}>{title.toUpperCase()}</Text>
      {subtitle ? <Text style={s.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

export function SectionHeading({ num, children }: { num?: number | string; children: string }) {
  return (
    <Text style={s.section} minPresenceAhead={40}>
      {num !== undefined ? `${num}. ` : ""}
      {children.toUpperCase()}
    </Text>
  );
}

export function Para({ children, style }: { children: React.ReactNode; style?: Style }) {
  return <Text style={style ? [s.para, style] : s.para}>{children}</Text>;
}

/** Numbered clause. The number sits in a fixed-width column, so text always starts at the same distance. */
export function Clause({ num, lead, children }: { num: string; lead?: string; children: React.ReactNode }) {
  return (
    <View style={s.clauseRow} wrap={false}>
      <Text style={s.clauseNum}>{num}</Text>
      <Text style={s.clauseBody}>
        {lead ? <Text style={s.bold}>{`${lead}: `}</Text> : null}
        {children}
      </Text>
    </View>
  );
}

/** Indented content that lines up with clause text (for tables and notes under a clause). */
export function ClauseIndent({ children }: { children: React.ReactNode }) {
  return <View style={{ marginLeft: 28 }}>{children}</View>;
}

export function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <View style={s.clauseRow} wrap={false}>
      <Text style={{ width: 14 }}>{"•"}</Text>
      <Text style={s.clauseBody}>{children}</Text>
    </View>
  );
}

export type Column = { title: string; width: number; align?: "left" | "center" | "right" };
export type CellValue = React.ReactNode;

/**
 * Bordered table. `widths` are proportions (they need not sum to 100).
 * `highlightRows` get the light brand fill; the first column can be shaded as a label column.
 */
export function Table({
  columns,
  rows,
  headerFill = COLORS.brand,
  labelColumn = false,
  highlightRows = [],
  boldRows = [],
}: {
  columns: Column[];
  rows: CellValue[][];
  headerFill?: string;
  labelColumn?: boolean;
  highlightRows?: number[];
  boldRows?: number[];
}) {
  const w = (c: Column) => ({ flexGrow: c.width, flexShrink: 1, flexBasis: 0 });
  const showHeader = columns.some((c) => c.title);
  return (
    <View style={s.table} wrap={false}>
      {showHeader ? (
        <View style={[s.tr, { backgroundColor: headerFill }]}>
          {columns.map((c, i) => (
            <View
              key={i}
              style={{ ...w(c), borderLeftWidth: i ? 0.75 : 0, borderColor: COLORS.dark, justifyContent: "center" }}
            >
              <Text style={[s.td, s.th, { backgroundColor: headerFill, textAlign: c.align ?? "left" }]}>{c.title}</Text>
            </View>
          ))}
        </View>
      ) : null}
      {rows.map((row, r) => {
        const highlight = highlightRows.includes(r);
        const zebra = !highlight && r % 2 === 1 ? COLORS.rowAlt : undefined;
        return (
          <View
            key={r}
            style={[s.tr, { borderTopWidth: showHeader || r ? 0.75 : 0, borderColor: COLORS.dark }]}
          >
            {row.map((cell, i) => {
              const fill = highlight
                ? COLORS.brandLight
                : labelColumn && i === 0
                  ? COLORS.rowAlt
                  : zebra;
              const isLabel = labelColumn && i === 0;
              return (
                <View
                  key={i}
                  style={{
                    ...w(columns[i]),
                    borderLeftWidth: i ? 0.75 : 0,
                    borderColor: COLORS.dark,
                    backgroundColor: fill,
                    justifyContent: "center",
                  }}
                >
                  {typeof cell === "string" || typeof cell === "number" ? (
                    <Text
                      style={[
                        s.td,
                        { textAlign: columns[i].align ?? "left" },
                        isLabel || boldRows.includes(r) ? s.bold : {},
                        highlight ? { color: COLORS.brand, fontWeight: "bold" } : {},
                      ]}
                    >
                      {String(cell)}
                    </Text>
                  ) : (
                    <View style={s.td}>{cell}</View>
                  )}
                </View>
              );
            })}
          </View>
        );
      })}
    </View>
  );
}

/** Two-column label/value table with a coloured title bar, e.g. "Payment Details". */
export function KeyValueTable({
  title,
  rows,
  labelWidth = 35,
  highlightLast = false,
}: {
  title?: string;
  rows: [string, CellValue][];
  labelWidth?: number;
  highlightLast?: boolean;
}) {
  return (
    <View wrap={false}>
      {title ? (
        <View style={{ backgroundColor: COLORS.brand, borderWidth: 0.75, borderBottomWidth: 0, borderColor: COLORS.dark }}>
          <Text style={[s.td, s.th]}>{title}</Text>
        </View>
      ) : null}
      <Table
        columns={[
          { title: "", width: labelWidth },
          { title: "", width: 100 - labelWidth },
        ]}
        rows={rows}
        labelColumn
        highlightRows={highlightLast ? [rows.length - 1] : []}
      />
    </View>
  );
}

/** Company signatory: uploaded signature image above the line when available. */
export function SignedBlock({ signatory, companyName }: { signatory: SignatorySnapshot; companyName: string }) {
  return (
    <View wrap={false} style={{ marginBottom: 18, width: "62%" }}>
      {signatory.signature ? (
        // eslint-disable-next-line jsx-a11y/alt-text
        <Image src={signatory.signature} style={s.sigImage} />
      ) : (
        <View style={s.sigSpace} />
      )}
      <View style={s.sigLine} />
      <Text style={s.sigName}>{signatory.name}</Text>
      <Text style={s.sigTitle}>{`${signatory.title}, ${companyName}`}</Text>
    </View>
  );
}

/** Recipient signature: always left blank for them to sign. */
export function BlankSignBlock({ name, role, showDate = true }: { name: string; role: string; showDate?: boolean }) {
  return (
    <View wrap={false} style={{ marginBottom: 12, width: "62%" }}>
      <View style={s.sigSpace} />
      <View style={s.sigLine} />
      <Text style={s.sigName}>{name}</Text>
      <Text style={s.sigTitle}>{role}</Text>
      {showDate ? <Text style={{ fontSize: 9.5, marginTop: 4 }}>Date: _______________________</Text> : null}
    </View>
  );
}

export function SigLabel({ children }: { children: string }) {
  return <Text style={s.sigLabel}>{children}</Text>;
}

export function Divider({ marginVertical = 10 }: { marginVertical?: number }) {
  return <View style={{ borderBottomWidth: 0.5, borderBottomColor: COLORS.line, marginVertical }} />;
}

export function Spacer({ h }: { h: number }) {
  return <View style={{ height: h }} />;
}

/** Status pill for proposal comparison tables (coloured dot + label, no special glyphs needed). */
export function Status({ value }: { value: "included" | "optional" | "client" | "excluded" }) {
  const map = {
    included: { label: "Included", color: COLORS.green, dot: true },
    optional: { label: "Optional", color: COLORS.amber, dot: true },
    client: { label: "Handled by client", color: COLORS.grey, dot: false },
    excluded: { label: "Not included", color: COLORS.grey, dot: false },
  }[value];
  return (
    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
      {map.dot ? (
        <View style={{ width: 5, height: 5, borderRadius: 2.5, backgroundColor: map.color, marginRight: 4 }} />
      ) : null}
      <Text
        style={{
          fontSize: 9,
          color: map.color,
          fontWeight: map.dot ? "bold" : "normal",
          fontStyle: value === "client" ? "italic" : "normal",
        }}
      >
        {map.label}
      </Text>
    </View>
  );
}
