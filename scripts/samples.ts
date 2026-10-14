import type { ResolvedDoc } from "../src/documents/types";

/** Realistic sample documents, used by `npm run samples` and as a reference for each template's data. */

const company = {
  companyName: "Gritta AI",
  email: "team@grittaai.com",
  website: "grittaai.com",
  jurisdiction: "Bengaluru, Karnataka",
};
const bank = { accountName: "Monirul Islam", accountNumber: "37330848247", ifsc: "SBIN0002013", bankName: "State Bank of India" };

export function sampleDocs(signature: string | null): Record<string, ResolvedDoc> {
  const monirul = { id: "s1", name: "Monirul Islam", title: "Co-Founder & CEO", signature };
  return {
    agreement: {
      type: "agreement",
      company,
      bank,
      signatories: [monirul],
      input: {
        agreementDate: "2026-10-09",
        clientName: "Avik Bhattacharyya",
        clientAddress: "Nea Plus, Sus, Pune - 411021",
        packageName: "Call Setting, Sales Follow-up and Sales Closing Services",
        subtitle: "Call Setting, Follow-up & Sales Closing: 3-Month Engagement",
        termMonths: 3,
        services: [
          { key: "call-setting", label: "Call Setting", description: "The Company shall handle call setting for the Client's incoming leads, including call booking, so that every incoming lead is engaged promptly." },
          { key: "follow-up", label: "Sales Follow-up", description: "The Company shall take follow-up of leads, forming part of the Client's pre-sales lead management, so that no lead is missed prior to closure." },
          { key: "sales-closer", label: "Sales Closing", description: "The Company shall close all booked meetings on behalf of the Client, taking responsibility for sales closure under this Agreement." },
        ],
        exclusions: [
          "The Company shall not handle any social media account or social media direct messages (DMs) of the Client. Such activities do not form part of the Services under this Agreement.",
        ],
        totalFee: 90000,
        paymentMode: "tranches",
        tranches: [
          { amount: 30000, when: "Payable upfront, upon signing of this Agreement" },
          { amount: 30000, when: "Payable as and when the Company closes the Client's first deal (or first few deals, cumulatively), out of the proceeds received by the Client from such closure(s)" },
          { amount: 30000, when: "Payable exactly 30 (thirty) days after the date of signing of this Agreement, irrespective of deal closures" },
        ],
        feeLateInterestPct: 1.5,
        commission: { enabled: true, percent: 15, paymentDays: 7, lateInterestPct: 10, exampleDealSize: 25000, exampleReceived: 15000 },
        nonRenewal: { enabled: true, noticeDays: 7 },
        terminationNoticeDays: 30,
        breachCureDays: 15,
        confidentialityYears: 2,
        signatoryIds: ["s1"],
      },
    },
    proposal: {
      type: "proposal",
      company,
      bank,
      signatories: [monirul],
      input: {
        date: "2026-10-12",
        title: "Sales Enablement Service Proposal",
        subtitle: "End-to-End Sales Coverage: Service Overview & Package Options",
        preparedFor: "",
        intro:
          "Gritta AI offers a complete, end-to-end sales coverage service that takes a lead from first contact through to a closed, converted opportunity, with no stage left unmanaged. Below is an overview of how the service works, followed by the package options currently available.",
        overviewIntro: "End-to-End Sales is delivered by a dedicated team working in a defined handoff sequence, so every lead is owned at every stage:",
        services: ["dm-setter", "appointment-setter", "sales-closer", "follow-up", "dashboard", "tracking-app"].map((key) => {
          const lib = {
            "dm-setter": ["DM Setter", "handles all inbound and outbound chats and hands the conversation over to the Appointment Setter.", "DM Setter: inbound & outbound chat handling"],
            "appointment-setter": ["Appointment Setter", "calls every lead and qualifies it before it is passed on to the Sales Closer.", "Appointment Setter: call & lead qualification"],
            "sales-closer": ["Sales Closer", "closes the deal on all qualified leads.", "Sales Closer: deal closure"],
            "follow-up": ["Sales Follow-up Executive", "manages ongoing follow-up so no lead is missed, converting stalled leads into opportunities.", "Sales Follow-up Executive: opportunity conversion"],
            dashboard: ["Live Dashboard", "gives the client full visibility into every lead's status and progress, in real time.", "Live progress dashboard"],
            "tracking-app": ["Client Tracking App (optional)", "an app for the client to track current progress on the go, available as an add-on.", "Client progress-tracking app (optional add-on)"],
          }[key]!;
          return { key, label: lib[0], proposalLine: lib[1], matrixLabel: lib[2] };
        }),
        packages: [
          { name: "Agreement 1", durationMonths: 6, price: 275000, commissionPct: 15, scope: "Full team of 4 + dashboard; tracking app optional", inclusions: { "dm-setter": "included", "appointment-setter": "included", "sales-closer": "included", "follow-up": "included", dashboard: "included", "tracking-app": "optional" } },
          { name: "Agreement 2", durationMonths: 3, price: 150000, commissionPct: 15, scope: "Full team of 4 + dashboard; tracking app optional", inclusions: { "dm-setter": "included", "appointment-setter": "included", "sales-closer": "included", "follow-up": "included", dashboard: "included", "tracking-app": "optional" } },
          { name: "Agreement 3", durationMonths: 6, price: 130000, commissionPct: 0, scope: "3-person team + dashboard; client closes sales, no app", inclusions: { "dm-setter": "included", "appointment-setter": "included", "sales-closer": "client", "follow-up": "included", dashboard: "included", "tracking-app": "excluded" } },
          { name: "Agreement 4", durationMonths: 3, price: 75000, commissionPct: 0, scope: "3-person team + dashboard; client closes sales, no app", inclusions: { "dm-setter": "included", "appointment-setter": "included", "sales-closer": "client", "follow-up": "included", dashboard: "included", "tracking-app": "excluded" } },
        ],
        notes: [
          "All packages include the live progress dashboard as standard.",
          "Agreements 1 and 2 carry an additional 15% commission on every deal closed, over and above the package fee.",
          "Under Agreements 3 and 4, the final sales closure call is taken by the client's own team; Gritta AI manages lead intake, qualification, and follow-up.",
          "Pricing above is for the full contract term stated and is exclusive of applicable taxes unless otherwise agreed in writing.",
        ],
        signatoryIds: ["s1"],
      },
    },
    "offer-letter": {
      type: "offer-letter",
      company,
      bank,
      signatories: [monirul],
      input: {
        letterDate: "2026-10-12",
        salutation: "Ms.",
        candidateName: "Ananya Sharma",
        candidateAddress: "HSR Layout, Bengaluru - 560102",
        position: "Business Development Intern",
        department: "Business Development",
        employmentType: "Internship",
        joiningDate: "2026-11-02",
        workLocation: "Remote",
        reportingTo: "Monirul Islam, Co-Founder & CEO",
        compensationAmount: 15000,
        compensationPeriod: "per month",
        probationMonths: 0,
        durationMonths: 3,
        noticePeriodDays: 7,
        acceptBy: "2026-10-19",
        responsibilities: [
          "Research and qualify prospective clinic clients",
          "Support outbound outreach and follow-up sequences",
          "Maintain accurate lead records and weekly reports",
        ],
        additionalTerms: [],
        signatoryIds: ["s1"],
      },
    },
    "relieving-letter": {
      type: "relieving-letter",
      company,
      bank,
      signatories: [monirul],
      input: {
        letterDate: "2026-09-09",
        salutation: "Mr.",
        employeeName: "Rahul Verma",
        position: "Business Development Representative",
        joiningDate: "2025-05-01",
        lastWorkingDate: "2026-09-09",
        separationReason: "resignation",
        duesSettled: true,
        appreciation: "",
        signatoryIds: ["s1"],
      },
    },
    invoice: {
      type: "invoice",
      company,
      bank,
      signatories: [monirul],
      input: {
        invoiceNumber: "GAI-2026-014",
        invoiceDate: "2026-10-14",
        dueDate: "2026-10-21",
        clientName: "Avik Bhattacharyya",
        clientAddress: "Nea Plus, Sus, Pune - 411021",
        clientGstin: "27ABCDE1234F1Z5",
        placeOfSupply: "Maharashtra (27)",
        items: [
          { description: "Call Setting, Sales Follow-up and Sales Closing Services: Tranche 1 of 3", quantity: 1, rate: 30000 },
          { description: "Live reporting dashboard setup", quantity: 1, rate: 5000 },
          { description: "Additional closing calls", quantity: 4, rate: 1250 },
        ],
        tax: { mode: "igst", ratePct: 18, companyGstin: "29ABCDE1234F1Z5" },
        amountPaid: 10000,
        showBankDetails: true,
        notes: ["Please quote the invoice number when making the payment."],
        signatoryIds: ["s1"],
      },
    },
  };
}
