import "server-only";
import { getDocument } from "./data";
import type { DocType } from "@/documents/schemas";
import { todayISO } from "./format";

const DATE_FIELD: Record<DocType, string> = {
  agreement: "agreementDate",
  proposal: "date",
  "offer-letter": "letterDate",
  "relieving-letter": "letterDate",
  invoice: "invoiceDate",
};

/**
 * When a form is opened with ?from=<documentId>, start from that document's input
 * (with today's date) so a similar document takes seconds to make.
 */
export async function prefillFrom<T>(type: DocType, from: string | undefined, fallback: T, validSignatoryIds: string[]): Promise<T> {
  if (!from) return fallback;
  const row = await getDocument(from);
  if (!row || row.data.type !== type) return fallback;
  const input = { ...(row.data.input as Record<string, unknown>) };
  input[DATE_FIELD[type]] = todayISO();
  const ids = (input.signatoryIds as string[]).filter((id) => validSignatoryIds.includes(id));
  input.signatoryIds = ids.length ? ids : (fallback as { signatoryIds: string[] }).signatoryIds;
  return input as T;
}
