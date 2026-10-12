"use server";

import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db, schema } from "@/db";

export async function deleteDocument(id: string) {
  await db.delete(schema.documents).where(eq(schema.documents.id, id));
  revalidatePath("/documents");
  redirect("/documents");
}
