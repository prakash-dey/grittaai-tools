import React from "react";
import { Document, Text, View } from "@react-pdf/renderer";
import { Bullet, DocPage, DocTitle, KeyValueTable, Letterhead, SectionHeading, SignedBlock, Spacer, Table, styles } from "../components";
import { COLORS } from "../theme";
import type { ResolvedOf } from "@/documents/types";
import { invoiceTotals } from "@/documents/schemas";
import { formatDate, groupIndian, numberToWordsIndian, pct, rupees } from "@/lib/format";

/** 1250.5 -> "Rupees One Thousand Two Hundred Fifty and Fifty Paise only" */
function amountInWords(n: number) {
  const paise = Math.round((n - Math.floor(n)) * 100);
  return `Rupees ${numberToWordsIndian(n)}${paise ? ` and ${numberToWordsIndian(paise)} Paise` : ""} only`;
}

/** Amounts in the line-item table always show two decimals so the column lines up. */
function money(n: number) {
  const [int, dec] = n.toFixed(2).split(".");
  return `${groupIndian(Number(int))}.${dec}`;
}

export function InvoicePdf({ doc }: { doc: ResolvedOf<"invoice"> }) {
  const { input: inv, company, bank, signatories } = doc;
  const t = invoiceTotals(inv);
  const muted = { fontSize: 9.5, color: COLORS.grey };
  const label = { fontSize: 9, color: COLORS.grey, letterSpacing: 0.4, marginBottom: 3 };

  const totalRows: [string, string][] = [["Subtotal", rupees(t.subtotal)]];
  if (t.cgst) totalRows.push([`CGST @ ${pct(t.halfRate)}`, rupees(t.cgst)], [`SGST @ ${pct(t.halfRate)}`, rupees(t.sgst)]);
  if (t.igst) totalRows.push([`IGST @ ${pct(inv.tax.ratePct)}`, rupees(t.igst)]);
  totalRows.push(["Total", rupees(t.total)]);
  if (inv.amountPaid > 0) totalRows.push(["Less: Amount received", `- ${rupees(inv.amountPaid)}`], ["Balance due", rupees(t.balance)]);

  return (
    <Document title={`Invoice ${inv.invoiceNumber} - ${inv.clientName}`} author={company.companyName} creator={`${company.companyName} Tools`}>
      <DocPage company={company} showPageNumbers={false}>
        <Letterhead company={company} />
        <DocTitle title={t.taxed ? "Tax Invoice" : "Invoice"} />

        <View style={{ flexDirection: "row", marginBottom: 14 }}>
          <View style={{ flex: 1, paddingRight: 16 }}>
            <Text style={label}>BILL TO</Text>
            <Text style={styles.bold}>{inv.clientName}</Text>
            <Text style={{ lineHeight: 1.35 }}>{inv.clientAddress}</Text>
            {inv.clientGstin ? <Text style={muted}>{`GSTIN: ${inv.clientGstin}`}</Text> : null}
          </View>
          <View style={{ width: "42%" }}>
            <KeyValueTable
              labelWidth={45}
              rows={[
                ["Invoice No.", inv.invoiceNumber],
                ["Invoice Date", formatDate(inv.invoiceDate)],
                ["Due Date", formatDate(inv.dueDate)],
                ...(inv.placeOfSupply ? ([["Place of Supply", inv.placeOfSupply]] as [string, string][]) : []),
                ...(inv.tax.companyGstin && inv.tax.mode !== "none" ? ([["Our GSTIN", inv.tax.companyGstin]] as [string, string][]) : []),
              ]}
            />
          </View>
        </View>

        <Table
          columns={[
            { title: "#", width: 6, align: "center" },
            { title: "Description", width: 52 },
            { title: "Qty", width: 9, align: "right" },
            { title: "Rate (Rs.)", width: 16, align: "right" },
            { title: "Amount (Rs.)", width: 17, align: "right" },
          ]}
          rows={inv.items.map((item, i) => [String(i + 1), item.description, String(Number(item.quantity.toFixed(2))), money(item.rate), money(t.lines[i])])}
        />

        <View style={{ flexDirection: "row" }} wrap={false}>
          <View style={{ flex: 1, paddingRight: 16 }}>
            <Text style={label}>AMOUNT IN WORDS</Text>
            <Text style={{ ...styles.italic, lineHeight: 1.35 }}>{amountInWords(inv.amountPaid > 0 ? t.balance : t.total)}</Text>
            {inv.showBankDetails ? (
              <View style={{ marginTop: 12 }}>
                <Text style={label}>PAYMENT DETAILS</Text>
                {[
                  ["Account Name", bank.accountName],
                  ["Account Number", bank.accountNumber],
                  ["IFSC", bank.ifsc],
                  ...(bank.bankName ? [["Bank", bank.bankName]] : []),
                ].map(([k, v]) => (
                  <View key={k} style={{ flexDirection: "row", marginBottom: 1.5 }}>
                    <Text style={{ width: 88, ...muted }}>{k}</Text>
                    <Text style={{ flex: 1, ...styles.bold, fontSize: 9.5 }}>{v}</Text>
                  </View>
                ))}
              </View>
            ) : null}
          </View>
          <View style={{ width: "42%" }}>
            <KeyValueTable labelWidth={55} rows={totalRows} highlightLast />
          </View>
        </View>

        {inv.notes.length ? (
          <View wrap={false}>
            <SectionHeading>Notes</SectionHeading>
            {inv.notes.map((n, i) => (
              <Bullet key={i}>{n}</Bullet>
            ))}
          </View>
        ) : null}

        <Spacer h={18} />
        <View wrap={false}>
          <Text style={{ marginBottom: 4 }}>{`For ${company.companyName},`}</Text>
          {signatories.map((sg) => (
            <SignedBlock key={sg.id} signatory={sg} companyName={company.companyName} />
          ))}
          <Text style={muted}>This is a computer-generated invoice.</Text>
        </View>
      </DocPage>
    </Document>
  );
}
