import { signatoryOptions } from "@/lib/data";
import { offerLetterDefaults } from "@/documents/defaults";
import { prefillFrom } from "@/lib/prefill";
import { OfferLetterForm } from "./offer-letter-form";

export const metadata = { title: "Offer Letter" };
export const dynamic = "force-dynamic";

export default async function NewOfferLetterPage({ searchParams }: { searchParams: Promise<{ from?: string }> }) {
  const { from } = await searchParams;
  const signatories = await signatoryOptions();
  const ids = signatories.map((s) => s.id);
  const initial = await prefillFrom("offer-letter", from, offerLetterDefaults(ids), ids);
  return <OfferLetterForm key={from ?? "new"} initial={initial} signatories={signatories} />;
}
