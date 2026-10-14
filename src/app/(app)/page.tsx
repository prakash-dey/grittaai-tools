import Link from "next/link";
import { listDocuments, listSignatories } from "@/lib/data";
import { TOOLS } from "@/documents/meta";
import { DOC_TYPES, isDocType } from "@/documents/schemas";
import { IconAlert, TOOL_ICONS } from "@/components/icons";
import { DocumentTable } from "@/components/document-table";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [docs, signatories] = await Promise.all([listDocuments(), listSignatories({ activeOnly: true })]);
  const missing = signatories.filter((s) => !s.signature);
  const counts = Object.fromEntries(DOC_TYPES.map((t) => [t, docs.filter((d) => d.type === t).length]));

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-8">
      <h1 className="text-2xl font-semibold tracking-tight">Gritta AI Tools</h1>
      <p className="mt-1 text-sm text-muted">Pick a tool, fill in the details, and download a signed PDF.</p>

      {missing.length ? (
        <div className="mt-6 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <IconAlert className="mt-0.5 h-5 w-5 shrink-0" />
          <p>
            {missing.map((s) => s.name).join(", ")} {missing.length === 1 ? "has" : "have"} no signature uploaded yet, so documents they sign will have a blank line.{" "}
            <Link href="/settings" className="font-medium underline">
              Upload in Settings
            </Link>
          </p>
        </div>
      ) : null}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {DOC_TYPES.map((t) => {
          const tool = TOOLS[t];
          const Icon = TOOL_ICONS[tool.icon];
          return (
            <Link key={t} href={tool.href} className="group rounded-xl border border-line bg-white p-5 transition hover:border-brand hover:shadow-sm">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand transition group-hover:bg-brand group-hover:text-white">
                <Icon />
              </span>
              <h2 className="mt-4 font-semibold">{tool.name}</h2>
              <p className="mt-1 text-sm text-muted">{tool.description}</p>
              <p className="mt-3 text-xs text-muted">
                {counts[t]} {counts[t] === 1 ? "document" : "documents"}
              </p>
            </Link>
          );
        })}
      </div>

      <div className="mt-10 flex items-end justify-between">
        <h2 className="text-lg font-semibold">Recent documents</h2>
        <Link href="/documents" className="text-sm text-brand hover:underline">
          View all
        </Link>
      </div>
      <div className="mt-3">
        <DocumentTable docs={docs.slice(0, 8).filter((d) => isDocType(d.type))} />
      </div>
    </main>
  );
}
