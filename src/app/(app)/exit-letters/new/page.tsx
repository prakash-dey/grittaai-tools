import { signatoryOptions } from "@/lib/data";
import { relievingLetterDefaults } from "@/documents/defaults";
import { prefillFrom } from "@/lib/prefill";
import { ExitLetterForm } from "./exit-letter-form";

export const metadata = { title: "Exit Letter" };
export const dynamic = "force-dynamic";

export default async function NewExitLetterPage({ searchParams }: { searchParams: Promise<{ from?: string }> }) {
  const { from } = await searchParams;
  const signatories = await signatoryOptions();
  const ids = signatories.map((s) => s.id);
  const initial = await prefillFrom("relieving-letter", from, relievingLetterDefaults(ids), ids);
  return <ExitLetterForm key={from ?? "new"} initial={initial} signatories={signatories} />;
}
