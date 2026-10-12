import { todayISO } from "@/lib/format";
import { SERVICE_LIBRARY } from "./library";
import type { AgreementInput, OfferLetterInput, ProposalInput, RelievingLetterInput } from "./schemas";

/** Starting values for each form. Dates default to today; everything else mirrors past Gritta AI documents. */

const lib = (key: string) => SERVICE_LIBRARY.find((s) => s.key === key)!;

function addDays(iso: string, days: number) {
  const d = new Date(iso + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function agreementDefaults(signatoryIds: string[]): AgreementInput {
  return {
    agreementDate: todayISO(),
    clientName: "",
    clientAddress: "",
    packageName: "",
    subtitle: "",
    termMonths: 3,
    services: ["call-setting", "follow-up", "sales-closer"].map((k) => ({ key: k, label: lib(k).label, description: lib(k).description })),
    exclusions: [],
    totalFee: 0,
    paymentMode: "advance",
    tranches: [],
    feeLateInterestPct: 1.5,
    commission: { enabled: false, percent: 15, paymentDays: 7, lateInterestPct: 10, exampleDealSize: 25000, exampleReceived: 15000 },
    nonRenewal: { enabled: false, noticeDays: 7 },
    terminationNoticeDays: 30,
    breachCureDays: 15,
    confidentialityYears: 2,
    signatoryIds,
  };
}

export function proposalDefaults(signatoryIds: string[]): ProposalInput {
  const keys = ["dm-setter", "appointment-setter", "sales-closer", "follow-up", "dashboard", "tracking-app"];
  return {
    date: todayISO(),
    title: "Sales Enablement Service Proposal",
    subtitle: "End-to-End Sales Coverage: Service Overview & Package Options",
    preparedFor: "",
    intro:
      "Gritta AI offers a complete, end-to-end sales coverage service that takes a lead from first contact through to a closed, converted opportunity, with no stage left unmanaged. Below is an overview of how the service works, followed by the package options currently available.",
    overviewIntro: "End-to-End Sales is delivered by a dedicated team working in a defined handoff sequence, so every lead is owned at every stage:",
    services: keys.map((k) => ({ key: k, label: lib(k).label, proposalLine: lib(k).proposalLine, matrixLabel: lib(k).matrixLabel })),
    packages: [
      {
        name: "Package 1",
        durationMonths: 3,
        price: 0,
        commissionPct: 0,
        scope: "",
        inclusions: Object.fromEntries(keys.map((k) => [k, k === "tracking-app" ? "optional" : "included"])),
      },
    ],
    notes: ["Pricing above is for the full contract term stated and is exclusive of applicable taxes unless otherwise agreed in writing."],
    signatoryIds,
  };
}

export function offerLetterDefaults(signatoryIds: string[]): OfferLetterInput {
  const today = todayISO();
  return {
    letterDate: today,
    salutation: "Mr.",
    candidateName: "",
    candidateAddress: "",
    position: "",
    department: "",
    employmentType: "Full-time",
    joiningDate: addDays(today, 14),
    workLocation: "Bengaluru",
    reportingTo: "",
    compensationAmount: 0,
    compensationPeriod: "per annum",
    probationMonths: 3,
    durationMonths: 0,
    noticePeriodDays: 30,
    acceptBy: addDays(today, 7),
    responsibilities: [],
    additionalTerms: [],
    signatoryIds: signatoryIds.slice(0, 1),
  };
}

export function relievingLetterDefaults(signatoryIds: string[]): RelievingLetterInput {
  const today = todayISO();
  return {
    letterDate: today,
    salutation: "Mr.",
    employeeName: "",
    position: "",
    joiningDate: "",
    lastWorkingDate: today,
    separationReason: "resignation",
    duesSettled: true,
    appreciation: "",
    signatoryIds: signatoryIds.slice(0, 1),
  };
}
