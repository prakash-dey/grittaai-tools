import Link from "next/link";
import { TOOLS } from "@/documents/meta";
import { isDocType } from "@/documents/schemas";
import { IconCopy, IconDownload } from "./icons";

type Row = { id: string; type: string; title: string; recipient: string; createdAt: Date };

const dateFmt = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata" });

export function DocumentTable({ docs }: { docs: Row[] }) {
  if (!docs.length) {
    return <p className="rounded-xl border border-dashed border-line bg-white p-8 text-center text-sm text-muted">No documents yet. Pick a tool to create the first one.</p>;
  }
  return (
    <div className="overflow-hidden rounded-xl border border-line bg-white">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-left text-xs text-muted">
          <tr>
            <th className="px-4 py-2.5 font-medium">Recipient</th>
            <th className="hidden px-4 py-2.5 font-medium md:table-cell">Document</th>
            <th className="hidden px-4 py-2.5 font-medium sm:table-cell">Type</th>
            <th className="px-4 py-2.5 font-medium">Created</th>
            <th className="px-4 py-2.5" />
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {docs.map((d) => {
            const tool = isDocType(d.type) ? TOOLS[d.type] : null;
            return (
              <tr key={d.id} className="hover:bg-gray-50/60">
                <td className="px-4 py-3">
                  <Link href={`/documents/${d.id}`} className="font-medium hover:text-brand">
                    {d.recipient}
                  </Link>
                </td>
                <td className="hidden max-w-[320px] truncate px-4 py-3 text-muted md:table-cell">{d.title}</td>
                <td className="hidden px-4 py-3 sm:table-cell">
                  <span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs text-brand">{tool?.short ?? d.type}</span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-muted">{dateFmt.format(d.createdAt)}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1">
                    {tool ? (
                      <Link href={`${tool.href}?from=${d.id}`} title="Duplicate" className="rounded-md p-1.5 text-muted hover:bg-gray-100 hover:text-ink">
                        <IconCopy className="h-4 w-4" />
                      </Link>
                    ) : null}
                    <a href={`/api/documents/${d.id}/pdf?download=1`} title="Download PDF" className="rounded-md p-1.5 text-muted hover:bg-gray-100 hover:text-ink">
                      <IconDownload className="h-4 w-4" />
                    </a>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
