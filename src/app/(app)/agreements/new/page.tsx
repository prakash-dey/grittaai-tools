import { proposalPackages, signatoryOptions } from "@/lib/data";
import { agreementDefaults } from "@/documents/defaults";
import { prefillFrom } from "@/lib/prefill";
import { AgreementForm } from "./agreement-form";

export const metadata = { title: "Agreement Creator" };
export const dynamic = "force-dynamic";

export default async function NewAgreementPage({ searchParams }: { searchParams: Promise<{ from?: string }> }) {
  const { from } = await searchParams;
  const [signatories, packages] = await Promise.all([signatoryOptions(), proposalPackages()]);
  const ids = signatories.map((s) => s.id);
  const initial = await prefillFrom("agreement", from, agreementDefaults(ids.slice(0, 1)), ids);
  return <AgreementForm key={from ?? "new"} initial={initial} signatories={signatories} packages={packages} />;
}
