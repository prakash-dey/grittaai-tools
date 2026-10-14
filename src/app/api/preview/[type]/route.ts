import { NextResponse } from "next/server";
import { isDocType } from "@/documents/schemas";
import { resolveDraft } from "@/documents/resolve";
import { renderPdf } from "@/pdf/render";

export const runtime = "nodejs";

/**
 * Render a PDF from unsaved form input, for the live preview. Nothing is stored.
 * Incomplete input still renders; what is missing comes back in the X-Document-Issues header.
 */
export async function POST(request: Request, { params }: { params: Promise<{ type: string }> }) {
  const { type } = await params;
  if (!isDocType(type)) return NextResponse.json({ error: "Unknown document type" }, { status: 404 });

  try {
    const { doc, issues } = await resolveDraft(type, await request.json());
    const pdf = await renderPdf(doc);
    return new NextResponse(new Uint8Array(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Cache-Control": "no-store",
        "X-Document-Issues": encodeURIComponent(JSON.stringify(issues)),
      },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Could not render the preview" }, { status: 500 });
  }
}
