import Link from "next/link";
import { listDocuments } from "@/lib/data";
import { TOOLS } from "@/documents/meta";
import { DOC_TYPES, isDocType } from "@/documents/schemas";
import { DocumentTable } from "@/components/document-table";

export const metadata = { title: "Documents" };
export const dynamic = "force-dynamic";

export default async function DocumentsPage({ searchParams }: { searchParams: Promise<{ type?: string; q?: string }> }) {
  const { type, q } = await searchParams;
  const filterType = type && isDocType(type) ? type : undefined;
  let docs = await listDocuments(filterType);
  if (q) {
    const needle = q.toLowerCase();
    docs = docs.filter((d) => d.recipient.toLowerCase().includes(needle) || d.title.toLowerCase().includes(needle));
  }

  const chip = (label: string, value?: string) => {
    const active = (value ?? "") === (filterType ?? "");
    const params = new URLSearchParams();
    if (value) params.set("type", value);
    if (q) params.set("q", q);
    return (
      <Link
        key={label}
        href={`/documents${params.size ? `?${params}` : ""}`}
        className={`rounded-full px-3 py-1 text-sm ${active ? "bg-brand text-white" : "border border-line bg-white text-ink/80 hover:bg-gray-50"}`}
      >
        {label}
      </Link>
    );
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-8">
      <h1 className="text-2xl font-semibold tracking-tight">Documents</h1>
      <p className="mt-1 text-sm text-muted">Every generated document, with the exact details and signatures used at the time.</p>
      <div className="mt-6 flex flex-wrap items-center gap-2">
        {chip("All")}
        {DOC_TYPES.map((t) => chip(TOOLS[t].short, t))}
        <form className="ml-auto" action="/documents">
          {filterType ? <input type="hidden" name="type" value={filterType} /> : null}
          <input
            name="q"
            defaultValue={q}
            placeholder="Search by name..."
            className="w-56 rounded-lg border border-line bg-white px-3 py-1.5 text-sm outline-none focus:border-brand"
          />
        </form>
      </div>
      <div className="mt-4">
        <DocumentTable docs={docs} />
      </div>
    </main>
  );
}
