import { z } from "zod";

/** Input schemas for every tool. Forms post these shapes; the server validates them before rendering. */

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Pick a date");
const money = z.coerce.number().positive("Enter an amount above zero");
const nonNeg = z.coerce.number().min(0);
const text = (label: string) => z.string().trim().min(1, `${label} is required`);
const signatoryIds = z.array(z.string()).min(1, "Pick at least one signatory");

export const salutationSchema = z.enum(["Mr.", "Ms.", "Mx."]);

/* ---------------------------------- Agreement ---------------------------------- */

export const agreementSchema = z
  .object({
    agreementDate: isoDate,
    clientName: text("Client name"),
    clientAddress: text("Client address"),
    packageName: text("Package description"),
    subtitle: z.string().trim().default(""),
    termMonths: z.coerce.number().int().min(1).max(60),
    services: z
      .array(z.object({ key: z.string().optional(), label: text("Service name"), description: text("Service description") }))
      .min(1, "Add at least one service"),
    exclusions: z.array(z.string().trim().min(1)).default([]),
    totalFee: money,
    paymentMode: z.enum(["advance", "tranches"]),
    tranches: z.array(z.object({ amount: money, when: text("Payment timing") })).default([]),
    feeLateInterestPct: nonNeg,
    commission: z.object({
      enabled: z.boolean(),
      percent: nonNeg,
      paymentDays: z.coerce.number().int().min(1),
      lateInterestPct: nonNeg,
      exampleDealSize: nonNeg,
      exampleReceived: nonNeg,
    }),
    nonRenewal: z.object({ enabled: z.boolean(), noticeDays: z.coerce.number().int().min(1) }),
    terminationNoticeDays: z.coerce.number().int().min(1),
    breachCureDays: z.coerce.number().int().min(1),
    confidentialityYears: z.coerce.number().int().min(1),
    signatoryIds,
  })
  .superRefine((v, ctx) => {
    if (v.paymentMode === "tranches") {
      if (v.tranches.length === 0) {
        ctx.addIssue({ code: "custom", path: ["tranches"], message: "Add at least one tranche" });
      }
      const sum = v.tranches.reduce((s, t) => s + t.amount, 0);
      if (v.tranches.length && Math.abs(sum - v.totalFee) > 0.5) {
        ctx.addIssue({
          code: "custom",
          path: ["tranches"],
          message: `Tranches add up to ${sum.toLocaleString("en-IN")} but the total fee is ${v.totalFee.toLocaleString("en-IN")}`,
        });
      }
    }
    if (v.commission.enabled && v.commission.exampleReceived > v.commission.exampleDealSize) {
      ctx.addIssue({ code: "custom", path: ["commission", "exampleReceived"], message: "Amount received cannot exceed the deal size" });
    }
  });
export type AgreementInput = z.infer<typeof agreementSchema>;

/* ---------------------------------- Proposal ---------------------------------- */

export const inclusionValue = z.enum(["included", "optional", "client", "excluded"]);
export type InclusionValue = z.infer<typeof inclusionValue>;

export const proposalSchema = z.object({
  date: isoDate,
  title: text("Title"),
  subtitle: z.string().trim().default(""),
  preparedFor: z.string().trim().default(""),
  intro: text("Introduction"),
  overviewIntro: z.string().trim().default(""),
  services: z
    .array(
      z.object({
        key: text("Service key"),
        label: text("Service name"),
        proposalLine: text("Service description"),
        matrixLabel: text("Comparison label"),
      }),
    )
    .min(1, "Add at least one service"),
  packages: z
    .array(
      z.object({
        name: text("Package name"),
        durationMonths: z.coerce.number().int().min(1).max(60),
        price: money,
        commissionPct: nonNeg.default(0),
        scope: text("Scope summary"),
        inclusions: z.record(z.string(), inclusionValue),
      }),
    )
    .min(1, "Add at least one package")
    .max(4, "A proposal fits up to 4 packages side by side"),
  notes: z.array(z.string().trim().min(1)).default([]),
  signatoryIds,
});
export type ProposalInput = z.infer<typeof proposalSchema>;

/* -------------------------------- Offer letter -------------------------------- */

export const employmentTypes = ["Full-time", "Internship", "Part-time", "Contract"] as const;

export const offerLetterSchema = z.object({
  letterDate: isoDate,
  salutation: salutationSchema,
  candidateName: text("Candidate name"),
  candidateAddress: z.string().trim().default(""),
  position: text("Position"),
  department: z.string().trim().default(""),
  employmentType: z.enum(employmentTypes),
  joiningDate: isoDate,
  workLocation: text("Work location"),
  reportingTo: z.string().trim().default(""),
  compensationAmount: money,
  compensationPeriod: z.enum(["per annum", "per month"]),
  /** Probation for permanent roles, or total duration for internships and contracts. 0 = not applicable. */
  probationMonths: nonNeg.default(0),
  durationMonths: nonNeg.default(0),
  noticePeriodDays: z.coerce.number().int().min(0),
  acceptBy: isoDate,
  responsibilities: z.array(z.string().trim().min(1)).default([]),
  additionalTerms: z.array(z.string().trim().min(1)).default([]),
  signatoryIds,
});
export type OfferLetterInput = z.infer<typeof offerLetterSchema>;

/* ------------------------------ Relieving letter ------------------------------ */

export const separationReasonLabels = {
  resignation: "Resignation",
  "internship-completion": "Internship completed",
  "contract-completion": "Contract completed",
  mutual: "Mutual separation",
} as const;

export const relievingLetterSchema = z.object({
  letterDate: isoDate,
  salutation: salutationSchema,
  employeeName: text("Employee name"),
  position: text("Position"),
  joiningDate: isoDate,
  lastWorkingDate: isoDate,
  separationReason: z.enum(["resignation", "internship-completion", "contract-completion", "mutual"]),
  duesSettled: z.boolean(),
  appreciation: z.string().trim().default(""),
  signatoryIds: z.array(z.string()).length(1, "Pick one signatory"),
});
export type RelievingLetterInput = z.infer<typeof relievingLetterSchema>;

/* ----------------------------------- Invoice ----------------------------------- */

export const taxModeLabels = {
  none: "No GST",
  "cgst-sgst": "CGST + SGST (same state)",
  igst: "IGST (other state)",
} as const;

const round2 = (n: number) => Math.round(n * 100) / 100;

/** Line amounts, tax and balance for an invoice. Shared by the form, validation and the PDF. */
export function invoiceTotals(v: { items: { quantity: number; rate: number }[]; tax: { mode: keyof typeof taxModeLabels; ratePct: number }; amountPaid: number }) {
  const lines = v.items.map((i) => round2((i.quantity || 0) * (i.rate || 0)));
  const subtotal = round2(lines.reduce((s, n) => s + n, 0));
  const taxed = v.tax.mode !== "none" && v.tax.ratePct > 0;
  const halfRate = v.tax.ratePct / 2;
  const cgst = taxed && v.tax.mode === "cgst-sgst" ? round2((subtotal * halfRate) / 100) : 0;
  const sgst = cgst;
  const igst = taxed && v.tax.mode === "igst" ? round2((subtotal * v.tax.ratePct) / 100) : 0;
  const total = round2(subtotal + cgst + sgst + igst);
  return { lines, subtotal, taxed, halfRate, cgst, sgst, igst, total, balance: round2(total - (v.amountPaid || 0)) };
}

export const invoiceSchema = z
  .object({
    invoiceNumber: text("Invoice number"),
    invoiceDate: isoDate,
    dueDate: isoDate,
    clientName: text("Client name"),
    clientAddress: text("Client address"),
    clientGstin: z.string().trim().toUpperCase().default(""),
    placeOfSupply: z.string().trim().default(""),
    items: z
      .array(
        z.object({
          description: text("Description"),
          quantity: z.coerce.number().positive("Quantity must be above zero"),
          rate: money,
        }),
      )
      .min(1, "Add at least one item"),
    tax: z.object({
      mode: z.enum(["none", "cgst-sgst", "igst"]),
      ratePct: nonNeg,
      companyGstin: z.string().trim().toUpperCase().default(""),
    }),
    amountPaid: nonNeg.default(0),
    showBankDetails: z.boolean(),
    /** Optional: blank lines are dropped rather than flagged. */
    notes: z.array(z.string().trim()).default([]).transform((list) => list.filter(Boolean)),
    signatoryIds: z.array(z.string()).length(1, "Pick one signatory"),
  })
  .superRefine((v, ctx) => {
    if (v.dueDate < v.invoiceDate) {
      ctx.addIssue({ code: "custom", path: ["dueDate"], message: "Due date cannot be before the invoice date" });
    }
    if (v.tax.mode !== "none") {
      if (!v.tax.companyGstin) ctx.addIssue({ code: "custom", path: ["tax", "companyGstin"], message: "Enter Gritta AI's GSTIN to charge GST" });
      if (v.tax.ratePct <= 0) ctx.addIssue({ code: "custom", path: ["tax", "ratePct"], message: "Enter a GST rate above zero" });
    }
    const { total } = invoiceTotals(v);
    if (v.amountPaid > total + 0.005) {
      ctx.addIssue({ code: "custom", path: ["amountPaid"], message: "Amount already paid cannot exceed the invoice total" });
    }
  });
export type InvoiceInput = z.infer<typeof invoiceSchema>;

/* ---------------------------------- Registry ---------------------------------- */

export const DOC_SCHEMAS = {
  agreement: agreementSchema,
  proposal: proposalSchema,
  "offer-letter": offerLetterSchema,
  "relieving-letter": relievingLetterSchema,
  invoice: invoiceSchema,
} as const;

export type DocType = keyof typeof DOC_SCHEMAS;
export const DOC_TYPES = Object.keys(DOC_SCHEMAS) as DocType[];

export function isDocType(v: string): v is DocType {
  return v in DOC_SCHEMAS;
}
