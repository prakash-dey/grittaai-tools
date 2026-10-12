import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import * as schema from "../src/db/schema";
import { loadEnv } from "./env";

async function main() {
  loadEnv();
  const client = createClient({
    url: process.env.DATABASE_URL ?? "file:./data/gritta.db",
    authToken: process.env.DATABASE_AUTH_TOKEN || undefined,
  });
  const db = drizzle(client, { schema });

  const existing = await db.select().from(schema.settings).where(eq(schema.settings.id, "default"));
  if (existing.length === 0) {
    await db.insert(schema.settings).values({
      id: "default",
      companyName: "Gritta AI",
      email: "team@grittaai.com",
      website: "grittaai.com",
      jurisdiction: "Bengaluru, Karnataka",
      bankAccountName: "Monirul Islam",
      bankAccountNumber: "37330848247",
      bankIfsc: "SBIN0002013",
      bankName: "State Bank of India",
      updatedAt: new Date(),
    });
    console.log("Seeded company settings");
  }

  const people = await db.select().from(schema.signatories);
  if (people.length === 0) {
    await db.insert(schema.signatories).values({
      id: nanoid(10),
      name: "Monirul Islam",
      title: "Co-Founder & CEO",
      signature: null,
      active: true,
      sortOrder: 0,
      createdAt: new Date(),
    });
    console.log("Seeded signatory: Monirul Islam (upload the signature in Settings)");
  }

  client.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
