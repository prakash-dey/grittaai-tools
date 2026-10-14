import "server-only";
import { asc, desc, eq } from "drizzle-orm";
import { db, schema } from "@/db";
import type { ResolvedDoc } from "@/documents/types";
import type { DocType } from "@/documents/schemas";

export async function getSettings() {
  const [row] = await db.select().from(schema.settings).where(eq(schema.settings.id, "default"));
  return row ?? null;
}

export async function listSignatories({ activeOnly = false } = {}) {
  const rows = await db.select().from(schema.signatories).orderBy(asc(schema.signatories.sortOrder), asc(schema.signatories.createdAt));
  return activeOnly ? rows.filter((r) => r.active) : rows;
}

/** Light shape for pickers: no need to ship full signature images to every form. */
export async function signatoryOptions() {
  const rows = await listSignatories({ activeOnly: true });
  return rows.map((r) => ({ id: r.id, name: r.name, title: r.title, hasSignature: Boolean(r.signature), signature: r.signature }));
}
export type SignatoryOption = Awaited<ReturnType<typeof signatoryOptions>>[number];

export async function listDocuments(type?: DocType) {
  const q = db
    .select({
      id: schema.documents.id,
      type: schema.documents.type,
      title: schema.documents.title,
      recipient: schema.documents.recipient,
      createdAt: schema.documents.createdAt,
    })
    .from(schema.documents)
    .orderBy(desc(schema.documents.createdAt));
  return type ? q.where(eq(schema.documents.type, type)) : q;
}

export async function getDocument(id: string) {
  const [row] = await db.select().from(schema.documents).where(eq(schema.documents.id, id));
  if (!row) return null;
  return { ...row, data: row.data as ResolvedDoc };
}

/** Every package from every saved proposal, so an agreement can start from one. */
export async function proposalPackages() {
  const rows = await db.select().from(schema.documents).where(eq(schema.documents.type, "proposal")).orderBy(desc(schema.documents.createdAt));
  return rows.flatMap((row) => {
    const doc = row.data as Extract<ResolvedDoc, { type: "proposal" }>;
    return doc.input.packages.map((pkg, i) => ({
      id: `${row.id}:${i}`,
      proposalTitle: doc.input.preparedFor ? `${doc.input.title} (${doc.input.preparedFor})` : doc.input.title,
      createdAt: row.createdAt.getTime(),
      pkg,
      services: doc.input.services,
    }));
  });
}
export type ProposalPackageOption = Awaited<ReturnType<typeof proposalPackages>>[number];

/**
 * The number after the most recent saved invoice: the trailing digits go up by one and keep
 * their width ("GAI-2026-009" -> "GAI-2026-010"). Starts at "INV-0001".
 */
export async function nextInvoiceNumber() {
  const rows = await db.select().from(schema.documents).where(eq(schema.documents.type, "invoice")).orderBy(desc(schema.documents.createdAt)).limit(1);
  const last = rows[0] ? (rows[0].data as Extract<ResolvedDoc, { type: "invoice" }>).input.invoiceNumber : null;
  const m = last ? /^(.*?)(\d+)(\D*)$/.exec(last) : null;
  if (!m) return last ? `${last}-2` : "INV-0001";
  const n = String(Number(m[2]) + 1).padStart(m[2].length, "0");
  return `${m[1]}${n}${m[3]}`;
}
