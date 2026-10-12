"use server";

import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db, schema } from "@/db";

const settingsSchema = z.object({
  companyName: z.string().trim().min(1, "Company name is required"),
  email: z.string().trim().email("Enter a valid email"),
  website: z.string().trim().min(1, "Website is required"),
  jurisdiction: z.string().trim().min(1, "Jurisdiction is required"),
  bankAccountName: z.string().trim().min(1, "Account holder name is required"),
  bankAccountNumber: z.string().trim().regex(/^\d{6,20}$/, "Account number should be 6 to 20 digits"),
  bankIfsc: z.string().trim().toUpperCase().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, "IFSC should look like SBIN0002013"),
  bankName: z.string().trim().optional(),
});

export async function saveSettings(_prev: { ok?: boolean; error?: string } | undefined, formData: FormData) {
  const parsed = settingsSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const v = parsed.data;
  await db
    .update(schema.settings)
    .set({ ...v, bankName: v.bankName || null, updatedAt: new Date() })
    .where(eq(schema.settings.id, "default"));
  revalidatePath("/", "layout");
  return { ok: true };
}

const personSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  title: z.string().trim().min(1, "Title is required"),
});

export async function createSignatory(input: { name: string; title: string }) {
  const v = personSchema.parse(input);
  const existing = await db.select({ id: schema.signatories.id }).from(schema.signatories);
  await db.insert(schema.signatories).values({ id: nanoid(10), ...v, signature: null, active: true, sortOrder: existing.length, createdAt: new Date() });
  revalidatePath("/", "layout");
}

export async function updateSignatory(id: string, input: { name: string; title: string; active: boolean }) {
  const v = personSchema.parse(input);
  await db.update(schema.signatories).set({ ...v, active: input.active }).where(eq(schema.signatories.id, id));
  revalidatePath("/", "layout");
}

const MAX_SIGNATURE_BYTES = 1_500_000;

export async function setSignature(id: string, dataUrl: string | null) {
  if (dataUrl !== null) {
    if (!dataUrl.startsWith("data:image/png;base64,")) throw new Error("Signature must be a PNG image");
    if (dataUrl.length > MAX_SIGNATURE_BYTES) throw new Error("Signature image is too large");
  }
  await db.update(schema.signatories).set({ signature: dataUrl }).where(eq(schema.signatories.id, id));
  revalidatePath("/", "layout");
}

/** Removing a signatory does not affect documents already issued; they keep their own snapshot. */
export async function deleteSignatory(id: string) {
  await db.delete(schema.signatories).where(eq(schema.signatories.id, id));
  revalidatePath("/", "layout");
}
