import React from "react";
import { Document, Text, View } from "@react-pdf/renderer";
import {
  BlankSignBlock, Bullet, Clause, ClauseIndent, DocPage, DocTitle, KeyValueTable, Letterhead, Para,
  SectionHeading, SignedBlock, Spacer,
} from "../components";
import type { ResolvedOf } from "@/documents/types";
import { formatDate, numWithWord, rupees, rupeesWithWords } from "@/lib/format";

export function OfferLetterPdf({ doc }: { doc: ResolvedOf<"offer-letter"> }) {
  const { input: o, company, signatories } = doc;
  const isIntern = o.employmentType === "Internship";
  const isContract = o.employmentType === "Contract";
  const engagement = isIntern ? "internship" : isContract ? "engagement" : "employment";
  const firstName = o.candidateName.trim().split(/\s+/)[0];
  const payLabel = isIntern ? "Stipend" : o.compensationPeriod === "per annum" ? "Cost to Company (CTC)" : "Salary";
  const pay = `${rupees(o.compensationAmount)} ${o.compensationPeriod}`;

  const terms: { lead: string; text: React.ReactNode; extra?: React.ReactNode }[] = [];

  terms.push({
    lead: "Compensation",
    text: `Your ${payLabel.replace(" (CTC)", "").replace("Cost to Company", "cost to company").toLowerCase()} will be ${rupeesWithWords(o.compensationAmount)} ${o.compensationPeriod}, paid monthly${isIntern ? "" : " and subject to applicable statutory deductions and taxes"}.`,
  });

  if ((isIntern || isContract) && o.durationMonths > 0) {
    terms.push({
      lead: "Duration",
      text: isIntern
        ? `This internship is for a period of ${numWithWord(o.durationMonths)} months from your date of joining. On successful completion, you will receive an internship completion certificate.`
        : `This engagement is for a period of ${numWithWord(o.durationMonths)} months from your date of joining, and may be extended by mutual written agreement.`,
    });
  } else if (!isIntern && !isContract && o.probationMonths > 0) {
    terms.push({
      lead: "Probation",
      text: `You will be on probation for ${numWithWord(o.probationMonths)} months from your date of joining. On satisfactory completion, your employment will be confirmed in writing.`,
    });
  }

  if (o.responsibilities.length) {
    terms.push({
      lead: "Responsibilities",
      text: "Your key responsibilities will include the following, along with any other duties reasonably assigned to you:",
      extra: (
        <ClauseIndent>
          {o.responsibilities.map((r, i) => (
            <Bullet key={i}>{r}</Bullet>
          ))}
        </ClauseIndent>
      ),
    });
  }

  terms.push({
    lead: "Confidentiality",
    text: `You will keep all confidential information of ${company.companyName}, its clients and its partners strictly confidential, both during and after your ${engagement}.`,
  });
  terms.push({
    lead: "Intellectual Property",
    text: `All work, materials and ideas produced by you in the course of your ${engagement} shall be the sole property of ${company.companyName}.`,
  });
  terms.push({
    lead: "Notice Period",
    text:
      o.noticePeriodDays > 0
        ? `Either party may end this ${engagement} by giving ${numWithWord(o.noticePeriodDays)} days' written notice to the other. ${company.companyName} may end the ${engagement} with immediate effect in the case of misconduct or a serious breach of company policy.`
        : `Either party may end this ${engagement} by giving written notice to the other. ${company.companyName} may end the ${engagement} with immediate effect in the case of misconduct or a serious breach of company policy.`,
  });
  terms.push({
    lead: "Documents",
    text: "On your date of joining, please share copies of your educational certificates, identity proof, address proof and, where applicable, relieving letters from previous employers.",
  });
  for (const t of o.additionalTerms) terms.push({ lead: "", text: t });

  const keyRows: [string, string][] = [
    ["Position", o.position],
    ...(o.department ? ([["Department", o.department]] as [string, string][]) : []),
    ["Employment Type", o.employmentType],
    ["Date of Joining", formatDate(o.joiningDate)],
    ["Work Location", o.workLocation],
    ...(o.reportingTo ? ([["Reporting To", o.reportingTo]] as [string, string][]) : []),
    ...((isIntern || isContract) && o.durationMonths > 0 ? ([["Duration", `${numWithWord(o.durationMonths)} months`]] as [string, string][]) : []),
    ...(!isIntern && !isContract && o.probationMonths > 0 ? ([["Probation Period", `${numWithWord(o.probationMonths)} months`]] as [string, string][]) : []),
    ...(o.noticePeriodDays > 0 ? ([["Notice Period", `${numWithWord(o.noticePeriodDays)} days`]] as [string, string][]) : []),
    [payLabel, pay],
  ];

  return (
    <Document title={`Offer Letter - ${o.candidateName}`} author={company.companyName} creator={`${company.companyName} Tools`}>
      <DocPage company={company}>
        <Letterhead company={company} />
        <DocTitle title={isIntern ? "Internship Offer Letter" : "Offer Letter"} />
        <Text style={{ textAlign: "right", marginBottom: 12 }}>{`Date: ${formatDate(o.letterDate)}`}</Text>
        <Text>To,</Text>
        <Text style={{ fontWeight: "bold" }}>{`${o.salutation} ${o.candidateName}`}</Text>
        {o.candidateAddress ? <Text>{o.candidateAddress}</Text> : null}
        <Spacer h={10} />
        <Text style={{ marginBottom: 10 }}>
          <Text style={{ fontWeight: "bold" }}>Subject: </Text>
          <Text style={{ fontWeight: "bold", textDecoration: "underline" }}>
            {isIntern ? `Offer of Internship as ${o.position}` : `Offer of ${isContract ? "Engagement" : "Employment"} as ${o.position}`}
          </Text>
        </Text>
        <Para>{`Dear ${firstName},`}</Para>
        <Para>
          {`We are pleased to offer you the position of ${o.position}${o.department ? ` in the ${o.department} team` : ""} at ${company.companyName}. This letter sets out the key terms of your ${engagement}, which will begin on ${formatDate(o.joiningDate)}.`}
        </Para>
        <KeyValueTable title="Key Terms" labelWidth={32} rows={keyRows} highlightLast />

        <SectionHeading>{`Terms of ${isIntern ? "Internship" : isContract ? "Engagement" : "Employment"}`}</SectionHeading>
        {terms.map((t, i) => (
          <View key={i}>
            <Clause num={`${i + 1}.`} lead={t.lead || undefined}>
              {t.text}
            </Clause>
            {t.extra}
          </View>
        ))}

        <Spacer h={4} />
        <Para>
          {`This offer is valid until ${formatDate(o.acceptBy)}. Please sign the acceptance below and return a copy of this letter to confirm. We look forward to welcoming you to ${company.companyName}.`}
        </Para>

        <View wrap={false}>
          <Spacer h={6} />
          <Text style={{ marginBottom: 4 }}>{`For ${company.companyName},`}</Text>
          {signatories.map((sg) => (
            <SignedBlock key={sg.id} signatory={sg} companyName={company.companyName} />
          ))}
        </View>

        <View wrap={false}>
          <SectionHeading>Acceptance</SectionHeading>
          <Para>{`I, ${o.candidateName}, have read and understood the terms of this offer and accept them.`}</Para>
          <BlankSignBlock name={o.candidateName} role={isIntern ? "Intern" : "Candidate"} />
        </View>
      </DocPage>
    </Document>
  );
}
