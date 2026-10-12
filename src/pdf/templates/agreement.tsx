import React from "react";
import { Document, Text, View } from "@react-pdf/renderer";
import {
  BlankSignBlock, Clause, ClauseIndent, Divider, DocPage, DocTitle, KeyValueTable, Letterhead, Para,
  SectionHeading, SigLabel, SignedBlock, Spacer, Table, styles,
} from "../components";
import type { ResolvedOf } from "@/documents/types";
import { formatDate, numWithWord, pct, rupees, rupeesWithWords } from "@/lib/format";

type Section = { key: string; title: string; render: (n: number) => React.ReactNode };

export function AgreementPdf({ doc }: { doc: ResolvedOf<"agreement"> }) {
  const { input: a, company, bank, signatories } = doc;
  const term = numWithWord(a.termMonths);
  const date = formatDate(a.agreementDate);
  const hasCommission = a.commission.enabled && a.commission.percent > 0;
  const closureByClient = a.services.some((s) => s.key === "closure-by-client");
  const subtitle = a.subtitle || `${a.termMonths}-Month Engagement`;
  const serviceNames = a.services.filter((s) => s.key !== "closure-by-client").map((s) => s.label.toLowerCase());
  const serviceSummary =
    serviceNames.length <= 1
      ? serviceNames.join("")
      : `${serviceNames.slice(0, -1).join(", ")} and ${serviceNames[serviceNames.length - 1]}`;

  // Sections are numbered in order, so cross-references (e.g. "Section 9") are always correct.
  const sections: Section[] = [];
  const num = (key: string) => sections.findIndex((s) => s.key === key) + 1;

  sections.push({
    key: "recitals",
    title: "Recitals",
    render: () => (
      <>
        <Para>WHEREAS, the Company operates a human-powered sales enablement and lead-conversion service; and</Para>
        <Para>
          {`WHEREAS, the Client wishes to engage the Company to provide ${serviceSummary || "sales support"} services for the Client's business, as described in this Agreement; and`}
        </Para>
        <Para>NOW, THEREFORE, in consideration of the mutual covenants and agreements contained herein, the Parties agree as follows:</Para>
      </>
    ),
  });

  sections.push({
    key: "scope",
    title: "Scope of Services",
    render: (n) => {
      let i = 0;
      return (
        <>
          <Para>The Company shall provide the following services ("Services") to the Client for the duration of this Agreement:</Para>
          {a.services.map((svc) => (
            <Clause key={svc.label + i} num={`${n}.${++i}`} lead={svc.label}>
              {svc.description}
            </Clause>
          ))}
          {a.exclusions.length === 1 ? (
            <Clause num={`${n}.${++i}`} lead="Exclusions">
              {a.exclusions[0]}
            </Clause>
          ) : (
            a.exclusions.map((ex, k) => (
              <Clause key={k} num={`${n}.${++i}`} lead={`Exclusion ${k + 1}`}>
                {ex}
              </Clause>
            ))
          )}
        </>
      );
    },
  });

  sections.push({
    key: "term",
    title: "Term",
    render: (n) => (
      <>
        <Clause num={`${n}.1`}>
          {`This Agreement shall commence on the Effective Date and shall continue for a period of ${term} months ("Term"), unless terminated earlier in accordance with Section ${num("termination")} of this Agreement.`}
        </Clause>
        <Clause num={`${n}.2`}>
          Upon expiry of the Term, this Agreement may be renewed or extended only upon the mutual written consent of both Parties, on such terms as the Parties may agree at that time.
        </Clause>
      </>
    ),
  });

  sections.push({
    key: "fees",
    title: "Fees and Payment",
    render: (n) => {
      const tranches = a.paymentMode === "tranches";
      return (
        <>
          <Para>The package and fee applicable to this Agreement are set out below:</Para>
          <KeyValueTable
            title="Package Detail"
            labelWidth={38}
            highlightLast
            rows={[
              ["Package", a.packageName],
              ["Contract Term", `${term} months from the Effective Date`],
              ["Total Fee", `${rupeesWithWords(a.totalFee)} for the full ${a.termMonths}-month term`],
            ]}
          />
          <Clause num={`${n}.1`}>
            {`The Total Fee of ${rupees(a.totalFee)} stated above is payable by the Client to the Company for the entire ${a.termMonths}-month Term and is exclusive of applicable taxes (including GST, if applicable), which shall be borne additionally by the Client unless otherwise agreed in writing.`}
          </Clause>
          {tranches ? (
            <>
              <Clause num={`${n}.2`}>
                {`The Total Fee shall be payable in ${numWithWord(a.tranches.length).replace(/^\d+ \((\w+)\)$/, "$1")} ${a.tranches.length === 1 ? "tranche" : "tranches"}, as set out below:`}
              </Clause>
              <Table
                columns={[
                  { title: "Tranche", width: 12, align: "center" },
                  { title: "Amount", width: 22 },
                  { title: "When Payable", width: 66 },
                ]}
                rows={a.tranches.map((t, i) => [String(i + 1), rupees(t.amount), t.when])}
                labelColumn
              />
            </>
          ) : (
            <Clause num={`${n}.2`}>
              Unless otherwise agreed in writing between the Parties, the Total Fee shall be payable in advance, prior to the commencement of Services, or in such installments as the Parties may separately agree in writing.
            </Clause>
          )}
          <Clause num={`${n}.3`}>All payments due under this Agreement shall be remitted to the bank account specified below:</Clause>
          <KeyValueTable
            title="Payment Details"
            labelWidth={30}
            rows={[
              ["Account Holder Name", bank.accountName],
              ["Account Number", bank.accountNumber],
              ["IFSC Code", bank.ifsc],
              ...(bank.bankName ? ([["Bank", bank.bankName]] as [string, string][]) : []),
            ]}
          />
          <Clause num={`${n}.4`}>
            The Client shall be solely responsible for ensuring that payments are correctly remitted to the above account. The Company shall not be liable for any loss arising from incorrect account details used by the Client, provided the details above were accurately supplied.
          </Clause>
          <Clause num={`${n}.5`}>
            {`${tranches ? "Any tranche of the Total Fee" : "Any amount"} not paid by its due date shall accrue interest at ${pct(a.feeLateInterestPct)} per month, or the maximum rate permitted by applicable law, whichever is lower, until paid in full.`}
          </Clause>
        </>
      );
    },
  });

  if (hasCommission) {
    const c = a.commission;
    const showExample = c.exampleDealSize > 0 && c.exampleReceived > 0;
    const first = (c.percent / 100) * c.exampleReceived;
    const remaining = c.exampleDealSize - c.exampleReceived;
    sections.push({
      key: "commission",
      title: "Commission",
      render: (n) => (
        <>
          <Clause num={`${n}.1`}>
            {`In addition to the Total Fee, the Company shall be entitled to a commission of ${pct(c.percent)} on the value of each deal closed by the Company on the Client's behalf.`}
          </Clause>
          <Clause num={`${n}.2`}>
            Commission shall be charged only on the amount actually received by the Client from the closed lead at any given time, and not on the full quoted deal size. Where a lead pays the Client in parts, commission shall be charged incrementally, as and when each part-payment is received by the Client.
          </Clause>
          {showExample ? (
            <ClauseIndent>
              <View wrap={false}>
              <Para>The following example illustrates how commission is calculated:</Para>
              <KeyValueTable
                title="Worked Example"
                labelWidth={55}
                rows={[
                  ["Total deal size", rupees(c.exampleDealSize)],
                  ["Amount actually received by the Client from the lead at closure", rupees(c.exampleReceived)],
                  [`Commission due to the Company at this stage (${pct(c.percent)} of ${rupees(c.exampleReceived)})`, rupees(first)],
                  ...(remaining > 0
                    ? ([
                        [
                          `When the Client subsequently receives the remaining ${rupees(remaining)} from that lead`,
                          `A further ${pct(c.percent)} (${rupees((c.percent / 100) * remaining)}) becomes due on that amount`,
                        ],
                      ] as [string, string][])
                    : []),
                ]}
              />
              </View>
            </ClauseIndent>
          ) : null}
          <Clause num={`${n}.3`}>
            {`Commission due under this Section shall be paid by the Client to the Company within ${numWithWord(c.paymentDays)} days of each relevant deal closure or part-payment receipt, as applicable.`}
          </Clause>
          <Clause num={`${n}.4`}>
            {`Any commission not paid within the ${c.paymentDays}-day period specified above shall accrue interest at ${pct(c.lateInterestPct)} per month, or the maximum rate permitted by applicable law, whichever is lower, until paid in full.`}
          </Clause>
        </>
      ),
    });
  }

  sections.push({
    key: "client",
    title: "Client Responsibilities",
    render: (n) => {
      const items = [
        "The Client shall provide timely access to relevant information, materials, and points of contact reasonably required by the Company to perform the Services.",
        ...(closureByClient
          ? ["The Client's own team shall be responsible for conducting the final sales closure call for each qualified lead handed over by the Company, and for informing the Company of the outcome so that records remain accurate."]
          : []),
        ...(hasCommission
          ? [`The Client shall promptly inform the Company of all amounts received from closed leads, so that commission under Section ${num("commission")} may be accurately calculated and invoiced.`]
          : []),
        "The Client shall respond to leads and booked meetings handed over by the Company within a reasonable time, so as not to diminish the prospect of conversion.",
      ];
      return items.map((t, i) => (
        <Clause key={i} num={`${n}.${i + 1}`}>
          {t}
        </Clause>
      ));
    },
  });

  sections.push({
    key: "confidentiality",
    title: "Confidentiality",
    render: (n) => (
      <>
        <Clause num={`${n}.1`}>
          Each Party agrees to keep confidential all non-public business, technical, financial, and customer information disclosed by the other Party in connection with this Agreement ("Confidential Information"), and shall not disclose such information to any third party without the prior written consent of the disclosing Party, except as required by law.
        </Clause>
        <Clause num={`${n}.2`}>
          {`This obligation of confidentiality shall survive the termination or expiry of this Agreement for a period of ${numWithWord(a.confidentialityYears)} ${a.confidentialityYears === 1 ? "year" : "years"}.`}
        </Clause>
      </>
    ),
  });

  sections.push({
    key: "data",
    title: "Data and Lead Ownership",
    render: (n) => (
      <>
        <Clause num={`${n}.1`}>All leads generated, qualified, or handled under this Agreement, and all associated data, shall remain the property of the Client.</Clause>
        <Clause num={`${n}.2`}>
          The Company shall use lead and client data solely for the purpose of performing the Services under this Agreement and shall not use such data for any other purpose without the Client's prior written consent.
        </Clause>
      </>
    ),
  });

  sections.push({
    key: "termination",
    title: a.nonRenewal.enabled ? "Termination and Non-Renewal" : "Termination",
    render: (n) => {
      const items: string[] = [
        `Either Party may terminate this Agreement for convenience by providing ${numWithWord(a.terminationNoticeDays)} days' prior written notice to the other Party.`,
        `Either Party may terminate this Agreement with immediate effect, by written notice, in the event of a material breach of this Agreement by the other Party that remains uncured for ${numWithWord(a.breachCureDays)} days after written notice of such breach.`,
      ];
      if (a.nonRenewal.enabled) {
        items.push(
          `If the Client does not wish to continue the engagement into the following month, the Client shall inform the Company in writing at least ${numWithWord(a.nonRenewal.noticeDays)} days before the start of that month. In such a case, any amount already paid in advance by the Client for that following month shall be refunded by the Company to the Client.`,
        );
      }
      items.push(
        `In the event of termination by the Client for convenience prior to completion of the Term, fees already paid for the elapsed portion of the Term shall be deemed earned and non-refundable${a.nonRenewal.enabled ? `, save for any advance refundable under Section ${n}.3` : ""}, and any fees for the remaining, unelapsed portion of the Term shall be refunded on a pro-rata basis, unless otherwise agreed in writing.`,
      );
      return items.map((t, i) => (
        <Clause key={i} num={`${n}.${i + 1}`}>
          {t}
        </Clause>
      ));
    },
  });

  sections.push({
    key: "contractor",
    title: "Independent Contractor Status",
    render: (n) => (
      <Clause num={`${n}.1`}>
        The Company and its personnel are independent contractors and are not employees, agents, partners, or joint venturers of the Client. Nothing in this Agreement shall be construed to create an employer-employee relationship, partnership, or joint venture between the Parties.
      </Clause>
    ),
  });

  sections.push({
    key: "liability",
    title: "Limitation of Liability",
    render: (n) => (
      <>
        <Clause num={`${n}.1`}>The Company shall perform the Services using reasonable skill and care but does not guarantee any specific number of leads, conversions, or sales outcomes.</Clause>
        <Clause num={`${n}.2`}>
          Neither Party shall be liable to the other for any indirect, incidental, special, or consequential damages arising out of or in connection with this Agreement. Each Party's aggregate liability under this Agreement shall not exceed the Total Fee paid or payable under this Agreement.
        </Clause>
      </>
    ),
  });

  sections.push({
    key: "law",
    title: "Governing Law and Dispute Resolution",
    render: (n) => (
      <>
        <Clause num={`${n}.1`}>This Agreement shall be governed by and construed in accordance with the laws of India.</Clause>
        <Clause num={`${n}.2`}>
          {`Any dispute arising out of or in connection with this Agreement shall first be addressed through good-faith negotiation between the Parties. If unresolved within 30 (thirty) days, the dispute shall be subject to the exclusive jurisdiction of the courts at ${company.jurisdiction}.`}
        </Clause>
      </>
    ),
  });

  sections.push({
    key: "notices",
    title: "Notices",
    render: (n) => (
      <Clause num={`${n}.1`}>
        Any notice required under this Agreement shall be delivered in writing to the addresses of the respective Parties as set out in this Agreement, or to such other address as either Party may notify in writing.
      </Clause>
    ),
  });

  sections.push({
    key: "general",
    title: "General",
    render: (n) => (
      <>
        <Clause num={`${n}.1`}>
          This Agreement constitutes the entire understanding between the Parties with respect to its subject matter and supersedes all prior discussions, negotiations, and agreements, whether written or oral.
        </Clause>
        <Clause num={`${n}.2`}>This Agreement may only be amended by a written instrument signed by authorized representatives of both Parties.</Clause>
        <Clause num={`${n}.3`}>If any provision of this Agreement is held invalid or unenforceable, the remaining provisions shall continue in full force and effect.</Clause>
      </>
    ),
  });

  return (
    <Document title={`Agreement - ${a.clientName}`} author={company.companyName} creator={`${company.companyName} Tools`}>
      <DocPage company={company}>
        <Letterhead company={company} />
        <DocTitle title="Sales Enablement Services Agreement" subtitle={subtitle} />
        <Para>
          {`This Sales Enablement Services Agreement ("Agreement") is made and entered into on ${date} ("Effective Date"), by and between the parties identified below.`}
        </Para>
        <KeyValueTable
          labelWidth={25}
          rows={[
            ["Agreement Date", date],
            ["Service Provider", `${company.companyName} ("the Company" / "Service Provider")`],
            ["Client", `${a.clientName} ("the Client")`],
            ["Client Address", a.clientAddress],
          ]}
        />
        <Para>{`${company.companyName} and ${a.clientName} are each referred to individually as a "Party" and collectively as the "Parties."`}</Para>
        {sections.map((sec, i) => (
          <View key={sec.key}>
            <SectionHeading num={i + 1}>{sec.title}</SectionHeading>
            {sec.render(i + 1)}
          </View>
        ))}
      </DocPage>

      <DocPage company={company}>
        <Letterhead company={company} />
        <Text style={[styles.title, { fontSize: 13, marginBottom: 14 }]}>SIGNATURES</Text>
        <Para>IN WITNESS WHEREOF, the Parties have executed this Agreement as of the Effective Date first written above.</Para>
        <Spacer h={10} />
        <SigLabel>{`For and on behalf of ${company.companyName}:`}</SigLabel>
        {signatories.map((sg) => (
          <SignedBlock key={sg.id} signatory={sg} companyName={company.companyName} />
        ))}
        <Divider marginVertical={8} />
        <Spacer h={8} />
        <SigLabel>For and on behalf of the Client:</SigLabel>
        <BlankSignBlock name={a.clientName} role="Client" />
      </DocPage>
    </Document>
  );
}
