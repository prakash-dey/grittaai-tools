import { NextResponse } from "next/server";
import { getDocument } from "@/lib/data";
import { fileNameFor } from "@/documents/resolve";
import { renderPdf } from "@/pdf/render";

export const runtime = "nodejs";

/** Re-render a saved document from its stored snapshot. Add ?download=1 to force a download. */
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const row = await getDocument(id);
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const pdf = await renderPdf(row.data);
  const download = new URL(request.url).searchParams.get("download") === "1";
  const name = fileNameFor(row.data);
  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `${download ? "attachment" : "inline"}; filename="${name}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
