import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

/** Single-row table holding company profile and payment details. */
export const settings = sqliteTable("settings", {
  id: text("id").primaryKey(), // always "default"
  companyName: text("company_name").notNull(),
  email: text("email").notNull(),
  website: text("website").notNull(),
  jurisdiction: text("jurisdiction").notNull(), // courts named in agreements, e.g. "Bengaluru, Karnataka"
  bankAccountName: text("bank_account_name").notNull(),
  bankAccountNumber: text("bank_account_number").notNull(),
  bankIfsc: text("bank_ifsc").notNull(),
  bankName: text("bank_name"),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
});

/** People who sign documents on behalf of the company. */
export const signatories = sqliteTable("signatories", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  title: text("title").notNull(),
  /** PNG data URL of the uploaded signature (background already removed). Null until uploaded. */
  signature: text("signature"),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
});

/**
 * Every generated document. `data` is the full JSON input, including a snapshot of the
 * signatories and bank details at the moment of generation, so editing a signatory later
 * never changes a document that has already been issued.
 */
export const documents = sqliteTable("documents", {
  id: text("id").primaryKey(),
  type: text("type").notNull(), // "agreement" | "proposal" | "offer-letter" | "relieving-letter" | "invoice"
  title: text("title").notNull(),
  recipient: text("recipient").notNull(),
  data: text("data", { mode: "json" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
});

export type Settings = typeof settings.$inferSelect;
export type Signatory = typeof signatories.$inferSelect;
export type DocumentRow = typeof documents.$inferSelect;
