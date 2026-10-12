import "server-only";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

const globalForDb = globalThis as unknown as { __grittaDb?: ReturnType<typeof drizzle<typeof schema>> };

function connect() {
  const client = createClient({
    url: process.env.DATABASE_URL ?? "file:./data/gritta.db",
    authToken: process.env.DATABASE_AUTH_TOKEN || undefined,
  });
  return drizzle(client, { schema });
}

/** Reuse one connection across hot reloads in development. */
export const db = globalForDb.__grittaDb ?? connect();
if (process.env.NODE_ENV !== "production") globalForDb.__grittaDb = db;

export { schema };
