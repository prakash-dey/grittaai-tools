import "server-only";
import { eq, inArray } from "drizzle-orm";
import { db, schema } from "@/db";
import { clean, formatDate } from "@/lib/format";
import { DOC_SCHEMAS, type DocType } from "./schemas";
import type { ResolvedDoc } from "./types";
import { TOOLS } from "./meta";

export class ValidationError extends Error {
  constructor(public issues: { path: string; message: string }[]) {
    super(issues.map((i) => i.message).join("; "));
  }
}

/** Apply the house style (no em/en dashes) to every string in the user's input. */
function deepClean<T>(value: T): T {
  if (typeof value === "string") return clean(value) as T;
  if (Array.isArray(value)) return value.map(deepClean) as T;
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, deepClean(v)])) as T;
  }
  return value;
}

/**
 * Validate raw form input and attach frozen copies of company, bank and signatory data.
 * The result is everything a template needs, and is what gets stored for a saved document.
 */
export async function resolveDocument(type: DocType, raw: unknown): Promise<ResolvedDoc> {
  const parsed = DOC_SCHEMAS[type].safeParse(raw);
  if (!parsed.success) {
    // Say which list item an error belongs to, e.g. "Package 2: Enter an amount above zero".
    const itemLabel: Record<string, string> = { packages: "Package", tranches: "Tranche", services: "Service" };
    throw new ValidationError(
      parsed.error.issues.map((i) => {
        const [root, index] = i.path;
        const prefix = typeof index === "number" && itemLabel[String(root)] ? `${itemLabel[String(root)]} ${index + 1}: ` : "";
        return { path: i.path.join("."), message: prefix + i.message };
      }),
    );
  }
  const input = deepClean(parsed.data);

  const [settings] = await db.select().from(schema.settings).where(eq(schema.settings.id, "default"));
  if (!settings) throw new Error("Company settings are missing. Run `npm run setup`.");

  const ids = input.signatoryIds;
  const rows = ids.length ? await db.select().from(schema.signatories).where(inArray(schema.signatories.id, ids)) : [];
  const signatories = ids
    .map((id) => rows.find((r) => r.id === id))
    .filter((r): r is NonNullable<typeof r> => Boolean(r))
    .map((r) => ({ id: r.id, name: r.name, title: r.title, signature: r.signature }));
  if (signatories.length !== ids.length) {
    throw new ValidationError([{ path: "signatoryIds", message: "A selected signatory no longer exists" }]);
  }

  return {
    type,
    input,
    company: {
      companyName: settings.companyName,
      email: settings.email,
      website: settings.website,
      jurisdiction: settings.jurisdiction,
    },
    bank: {
      accountName: settings.bankAccountName,
      accountNumber: settings.bankAccountNumber,
      ifsc: settings.bankIfsc,
      bankName: settings.bankName,
    },
    signatories,
  } as ResolvedDoc;
}

/** Human-readable title and recipient for the document history list. */
export function describeDocument(doc: ResolvedDoc) {
  const tool = TOOLS[doc.type];
  switch (doc.type) {
    case "agreement":
      return { title: `${tool.short}: ${doc.input.packageName}`, recipient: doc.input.clientName, date: formatDate(doc.input.agreementDate) };
    case "proposal":
      return { title: `${tool.short}: ${doc.input.title}`, recipient: doc.input.preparedFor || "General", date: formatDate(doc.input.date) };
    case "offer-letter":
      return { title: `${tool.short}: ${doc.input.position}`, recipient: doc.input.candidateName, date: formatDate(doc.input.letterDate) };
    case "relieving-letter":
      return { title: `${tool.short}: ${doc.input.position}`, recipient: doc.input.employeeName, date: formatDate(doc.input.letterDate) };
  }
}

/** Safe download filename, e.g. "Gritta_AI_Agreement_Avik_Bhattacharyya.pdf" */
export function fileNameFor(doc: ResolvedDoc) {
  const { recipient } = describeDocument(doc);
  const kind = { agreement: "Agreement", proposal: "Proposal", "offer-letter": "Offer_Letter", "relieving-letter": "Relieving_Letter" }[doc.type];
  const slug = (s: string) => s.replace(/[^A-Za-z0-9]+/g, "_").replace(/^_|_$/g, "");
  return `${slug(doc.company.companyName)}_${kind}_${slug(recipient)}.pdf`;
}
