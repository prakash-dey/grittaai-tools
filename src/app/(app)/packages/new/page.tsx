import { signatoryOptions } from "@/lib/data";
import { proposalDefaults } from "@/documents/defaults";
import { prefillFrom } from "@/lib/prefill";
import { ProposalForm } from "./proposal-form";

export const metadata = { title: "Package Creator" };
export const dynamic = "force-dynamic";

export default async function NewProposalPage({ searchParams }: { searchParams: Promise<{ from?: string }> }) {
  const { from } = await searchParams;
  const signatories = await signatoryOptions();
  const ids = signatories.map((s) => s.id);
  const initial = await prefillFrom("proposal", from, proposalDefaults(ids.slice(0, 1)), ids);
  return <ProposalForm key={from ?? "new"} initial={initial} signatories={signatories} />;
}
