import React from "react";
import { Document, Text, View } from "@react-pdf/renderer";
import {
  Bullet, Clause, DocPage, DocTitle, Letterhead, Para, SectionHeading, SignedBlock, Spacer, Status, Table,
} from "../components";
import { COLORS } from "../theme";
import type { ResolvedOf } from "@/documents/types";
import { formatDate, pct, rupees } from "@/lib/format";

export function ProposalPdf({ doc }: { doc: ResolvedOf<"proposal"> }) {
  const { input: p, company, signatories } = doc;
  const months = (m: number) => `${m} ${m === 1 ? "month" : "months"}`;

  const priceCell = (pkg: (typeof p.packages)[number], align: "left" | "center") => (
    <View style={{ alignItems: align === "center" ? "center" : "flex-start" }}>
      <Text style={{ fontWeight: "bold", color: COLORS.brand, fontSize: 9.5 }}>{rupees(pkg.price)}</Text>
      {pkg.commissionPct > 0 ? (
        <Text style={{ fontSize: 7.5, fontStyle: "italic", color: COLORS.grey, textAlign: align }}>
          {`+ ${pct(pkg.commissionPct)} commission per closed deal`}
        </Text>
      ) : null}
    </View>
  );

  const planWidth = Math.min(17, 66 / p.packages.length);
  const featureWidth = 100 - planWidth * p.packages.length;

  return (
    <Document title={p.title} author={company.companyName} creator={`${company.companyName} Tools`}>
      <DocPage company={company}>
        <Letterhead company={company} />
        <DocTitle title={p.title} subtitle={p.subtitle} />
        <View style={{ flexDirection: "row", justifyContent: p.preparedFor ? "space-between" : "flex-end", marginBottom: 10 }}>
          {p.preparedFor ? <Text style={{ fontSize: 10 }}>{`Prepared for: ${p.preparedFor}`}</Text> : null}
          <Text style={{ fontSize: 10 }}>{`Date: ${formatDate(p.date)}`}</Text>
        </View>
        <Para>{p.intro}</Para>

        <SectionHeading num={1}>Service Overview</SectionHeading>
        {p.overviewIntro ? <Para>{p.overviewIntro}</Para> : null}
        {p.services.map((svc, i) => (
          <Clause key={svc.key} num={`${i + 1}.`} lead={svc.label}>
            {svc.proposalLine}
          </Clause>
        ))}

        <SectionHeading num={2}>Package Options</SectionHeading>
        <Para>
          {`${p.packages.length === 1 ? "The package below is" : `${["Two", "Three", "Four"][p.packages.length - 2]} package options are`} available, varying by contract duration and scope:`}
        </Para>
        <Table
          headerFill={COLORS.dark}
          columns={[
            { title: "Package", width: 22 },
            { title: "Duration", width: 14, align: "center" },
            { title: "Price", width: 22, align: "center" },
            { title: "Scope", width: 42 },
          ]}
          rows={p.packages.map((pkg) => [
            <Text key="n" style={{ fontWeight: "bold", color: COLORS.brand, fontSize: 10 }}>{pkg.name}</Text>,
            months(pkg.durationMonths),
            priceCell(pkg, "center"),
            <Text key="s" style={{ fontSize: 8.5, fontStyle: "italic", color: COLORS.grey }}>{pkg.scope}</Text>,
          ])}
        />

        <View break={p.services.length + p.packages.length > 9}>
          <SectionHeading num={3}>Detailed Inclusions by Package</SectionHeading>
          <Table
            columns={[
              { title: "Service Inclusion", width: featureWidth },
              ...p.packages.map((pkg) => ({ title: pkg.name, width: planWidth, align: "center" as const })),
            ]}
            rows={[
              ...p.services.map((svc) => [
                svc.matrixLabel,
                ...p.packages.map((pkg, i) => <Status key={i} value={pkg.inclusions[svc.key] ?? "excluded"} />),
              ]),
              ["Contract Duration", ...p.packages.map((pkg) => months(pkg.durationMonths))],
              ["Investment", ...p.packages.map((pkg, i) => <View key={i}>{priceCell(pkg, "center")}</View>)],
            ]}
            boldRows={[p.services.length]}
            highlightRows={[p.services.length + 1]}
          />
        </View>

        {p.notes.length ? (
          <>
            <SectionHeading num={4}>Notes</SectionHeading>
            {p.notes.map((n, i) => (
              <Bullet key={i}>{n}</Bullet>
            ))}
          </>
        ) : null}

        <Spacer h={16} />
        <View wrap={false}>
          <Text style={{ marginBottom: 4 }}>{`For ${company.companyName},`}</Text>
          {signatories.map((sg) => (
            <SignedBlock key={sg.id} signatory={sg} companyName={company.companyName} />
          ))}
        </View>
      </DocPage>
    </Document>
  );
}
