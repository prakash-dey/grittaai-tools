import React from "react";
import { Document, Text, View } from "@react-pdf/renderer";
import { DocPage, DocTitle, Letterhead, Para, SignedBlock, Spacer } from "../components";
import type { ResolvedOf } from "@/documents/types";
import { capitalize, formatDate, pronouns } from "@/lib/format";

export function RelievingLetterPdf({ doc }: { doc: ResolvedOf<"relieving-letter"> }) {
  const { input: r, company, signatories } = doc;
  const p = pronouns(r.salutation);
  const parts = r.employeeName.trim().split(/\s+/);
  const firstName = parts[0];
  // "Mr. Islam"; for Mx. use the full name, which reads naturally without a gendered title.
  const shortRef = r.salutation === "Mx." ? r.employeeName : `${r.salutation} ${parts[parts.length - 1]}`;
  const join = formatDate(r.joiningDate);
  const last = formatDate(r.lastWorkingDate);
  const isIntern = r.separationReason === "internship-completion";

  const reason = {
    resignation: `following ${p.possessive} resignation and subsequent completion of the exit formalities`,
    "internship-completion": `upon successful completion of ${p.possessive} internship and the exit formalities`,
    "contract-completion": `upon completion of ${p.possessive} contract term and the exit formalities`,
    mutual: "following a mutual separation and completion of the exit formalities",
  }[r.separationReason];

  const appreciation =
    r.appreciation ||
    `We place on record our appreciation for ${p.possessive} commitment and contribution to ${company.companyName}, and we wish ${p.object} continued success in all ${p.possessive} future endeavors.`;

  const bold = { fontWeight: "bold" as const };

  return (
    <Document title={`Relieving Letter - ${r.employeeName}`} author={company.companyName} creator={`${company.companyName} Tools`}>
      <DocPage company={company} showPageNumbers={false}>
        <Letterhead company={company} />
        <DocTitle title="Relieving Letter" />
        <Text style={{ textAlign: "right", marginBottom: 14 }}>{`Date: ${formatDate(r.letterDate)}`}</Text>
        <Text>To,</Text>
        <Text style={bold}>{`${r.salutation} ${r.employeeName}`}</Text>
        <Text>{r.position}</Text>
        <Spacer h={14} />
        <Text style={{ marginBottom: 14 }}>
          <Text style={bold}>Subject: </Text>
          <Text style={{ ...bold, textDecoration: "underline" }}>Relieving Letter</Text>
        </Text>
        <Para>{`Dear ${firstName},`}</Para>
        <Spacer h={4} />
        <Para>
          {`This is to certify that ${r.salutation} ${r.employeeName} was ${isIntern ? "associated" : "employed"} with ${company.companyName} as `}
          <Text style={bold}>{r.position}</Text>
          {" from "}
          <Text style={bold}>{join}</Text>
          {" to "}
          <Text style={bold}>{last}</Text>
          {`. During this period, ${p.subject} discharged ${p.possessive} duties and responsibilities diligently and made a valuable contribution to the growth of the organization.`}
        </Para>
        <Para>
          {`${shortRef} has been relieved of ${p.possessive} duties at ${company.companyName}, effective ${last}, ${reason}.`}
          {r.duesSettled ? " All dues, if any, have been settled between both parties as of the date of this letter." : ""}
        </Para>
        <Para>{capitalize(appreciation)}</Para>
        <Spacer h={18} />
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
