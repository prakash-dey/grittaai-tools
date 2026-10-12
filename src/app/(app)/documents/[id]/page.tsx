import Link from "next/link";
import { notFound } from "next/navigation";
import { getDocument } from "@/lib/data";
import { TOOLS } from "@/documents/meta";
import { describeDocument } from "@/documents/resolve";
import { IconCheck, IconCopy, IconDownload } from "@/components/icons";
import { DeleteDocumentButton } from "./delete-button";
import { PdfPreview } from "@/components/pdf-preview";

export const dynamic = "force-dynamic";

export default async function DocumentPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ created?: string }> }) {
  const { id } = await params;
  const { created } = await searchParams;
  const row = await getDocument(id);
  if (!row) notFound();
  const doc = row.data;
  const tool = TOOLS[doc.type];
  const info = describeDocument(doc);

  return (
    <main className="flex min-h-screen flex-col xl:flex-row">
      <div className="px-4 py-8 sm:px-8 xl:w-[400px] xl:shrink-0">
        <Link href="/documents" className="text-sm text-muted hover:text-ink">
          &larr; All documents
        </Link>
        {created ? (
          <p className="mt-4 flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-800">
            <IconCheck className="h-4 w-4" /> Saved. Download the PDF below.
          </p>
        ) : null}
        <span className="mt-4 inline-block rounded-full bg-brand-50 px-2 py-0.5 text-xs text-brand">{tool.short}</span>
        <h1 className="mt-2 text-xl font-semibold">{info.recipient}</h1>
        <p className="mt-1 text-sm text-muted">{row.title}</p>

        <dl className="mt-6 space-y-3 text-sm">
          <div>
            <dt className="text-xs text-muted">Document date</dt>
            <dd>{info.date}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted">Signed by</dt>
            <dd>{doc.signatories.map((s) => `${s.name} (${s.title})`).join(", ")}</dd>
          </div>
        </dl>

        <div className="mt-6 flex flex-wrap gap-2">
          <a href={`/api/documents/${id}/pdf?download=1`} className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-3.5 py-2 text-sm font-medium text-white hover:bg-brand-dark">
            <IconDownload className="h-4 w-4" /> Download PDF
          </a>
          <Link href={`${tool.href}?from=${id}`} className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-white px-3.5 py-2 text-sm font-medium hover:bg-gray-50">
            <IconCopy className="h-4 w-4" /> Duplicate & edit
          </Link>
        </div>
        <p className="mt-3 text-xs text-muted">Saved documents never change. To make a correction, duplicate it, edit, and generate a new version.</p>
        <div className="mt-8 border-t border-line pt-4">
          <DeleteDocumentButton id={id} />
        </div>
      </div>
      <div className="flex min-h-[70vh] flex-1 bg-gray-200 xl:sticky xl:top-0 xl:h-screen">
        <PdfPreview src={`/api/documents/${id}/pdf`} />
      </div>
    </main>
  );
}
