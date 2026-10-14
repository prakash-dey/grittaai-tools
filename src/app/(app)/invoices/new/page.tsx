import { nextInvoiceNumber, signatoryOptions } from "@/lib/data";
import { invoiceDefaults } from "@/documents/defaults";
import { prefillFrom } from "@/lib/prefill";
import { InvoiceForm } from "./invoice-form";

export const metadata = { title: "Invoice" };
export const dynamic = "force-dynamic";

export default async function NewInvoicePage({ searchParams }: { searchParams: Promise<{ from?: string }> }) {
  const { from } = await searchParams;
  const [signatories, invoiceNumber] = await Promise.all([signatoryOptions(), nextInvoiceNumber()]);
  const ids = signatories.map((s) => s.id);
  const defaults = invoiceDefaults(ids, invoiceNumber);
  const prefilled = await prefillFrom("invoice", from, defaults, ids);
  // A duplicated invoice gets the next number and a due date counted from today.
  const initial = prefilled === defaults ? defaults : { ...prefilled, invoiceNumber, dueDate: defaults.dueDate };
  return <InvoiceForm key={from ?? "new"} initial={initial} signatories={signatories} />;
}
