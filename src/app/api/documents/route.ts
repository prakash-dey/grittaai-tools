import { NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { db, schema } from "@/db";
import { isDocType } from "@/documents/schemas";
import { ValidationError, describeDocument, resolveDocument } from "@/documents/resolve";
import { renderPdf } from "@/pdf/render";

export const runtime = "nodejs";

/** Validate, snapshot signatories and bank details, test-render, then store the document. */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { type?: string; input?: unknown } | null;
  if (!body?.type || !isDocType(body.type)) return NextResponse.json({ error: "Unknown document type" }, { status: 400 });

  try {
    const doc = await resolveDocument(body.type, body.input);
    await renderPdf(doc); // fail before saving if the document cannot render
    const { title, recipient } = describeDocument(doc);
    const id = nanoid(12);
    await db.insert(schema.documents).values({ id, type: doc.type, title, recipient, data: doc, createdAt: new Date() });
    return NextResponse.json({ id });
  } catch (err) {
    if (err instanceof ValidationError) return NextResponse.json({ error: "Invalid input", issues: err.issues }, { status: 400 });
    console.error(err);
    return NextResponse.json({ error: "Could not save the document" }, { status: 500 });
  }
}
