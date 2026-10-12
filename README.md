# Gritta AI Tools

One internal platform for Gritta AI's document tools. Fill in a form, watch the PDF update live, and download a signed copy.

| Tool | What it makes |
| --- | --- |
| **Agreement Creator** | Sales enablement services agreements: scope, fee, payment tranches, commission with a worked example, non-renewal terms. Gritta AI signs; the client's line stays blank. |
| **Package Creator** | Service proposals comparing up to four packages side by side. Saved packages can be loaded straight into a new agreement. |
| **Offer Letter** | Offers for full-time, part-time, contract and internship roles. The candidate's acceptance line stays blank. |
| **Exit Letter** | Single-page relieving letters. |

Shared across tools:

- **Settings**: company details, bank details, and signatories. Each signatory uploads a photo or scan of their signature once; the paper background is removed automatically.
- **Documents**: every generated document, with download, "duplicate and edit", and search. A saved document stores a copy of the signatures and bank details used at that moment, so editing Settings later never changes an issued document.
- **House style** built into every template: logo and wordmark header (no tagline), no em dashes (any typed are converted), clause numbers in a fixed column so text always lines up, section cross-references numbered automatically, and page numbers in the footer.

## Run it locally

Requires Node.js 20 or newer.

```bash
npm install
cp .env.example .env.local      # then set APP_PASSWORD and SESSION_SECRET
npm run setup                   # creates the database and seeds Gritta AI's details
npm run dev
```

Open http://localhost:3000, sign in with `APP_PASSWORD`, then go to **Settings** and upload each signatory's signature.

`npm run setup` seeds Monirul Islam (Co-Founder & CEO) as the first signatory and the company bank account. Add or edit people in Settings.

## Deploy

All configuration lives in four environment variables (see `.env.example`):

| Variable | Purpose |
| --- | --- |
| `APP_PASSWORD` | The team password for signing in |
| `SESSION_SECRET` | Long random string for signing the login cookie |
| `DATABASE_URL` | `file:./data/gritta.db` locally, or a Turso URL (`libsql://...`) |
| `DATABASE_AUTH_TOKEN` | Turso token (only for Turso) |

**Vercel (recommended for tools.grittaai.com):** serverless hosts have no lasting disk, so use a free [Turso](https://turso.tech) database.

1. Create a Turso database and token, and set the four variables in the Vercel project.
2. Run the migration and seed once from your machine against Turso:
   `DATABASE_URL=libsql://... DATABASE_AUTH_TOKEN=... npm run setup`
3. Deploy. Add `tools.grittaai.com` as a domain in Vercel.

**Any server with a disk (Railway, Render, a VPS):** keep the SQLite file. Run `npm install && npm run setup && npm run build && npm start` and mount `data/` on a persistent volume so documents survive redeploys.

Back up the database regularly: it holds signatures and every issued document.

## How it fits together

```
src/
  documents/        what each document needs
    schemas.ts      input fields and validation for every tool (zod)
    library.ts      pre-written service and exclusion clauses
    defaults.ts     starting values for each form
    resolve.ts      validates input and snapshots signatories + bank details
    meta.ts         tool names, descriptions and links
  pdf/
    components.tsx  letterhead, clauses, tables, signature blocks, footer
    templates/      one file per document type
    assets/         logo and fonts (Carlito, metric-compatible with Calibri)
  app/
    (app)/          the tool pages, Documents and Settings
    api/            preview, save and download endpoints
  db/schema.ts      settings, signatories and documents tables
```

The flow for every tool: the form posts its fields to `/api/preview/<type>` while you type, and to `/api/documents` when you click **Generate & save**. Both run the same validation and template, so the preview is exactly what gets saved.

## Changing templates

The templates are code, so wording changes are a quick edit:

- Fixed legal text (confidentiality, liability and so on): `src/pdf/templates/<type>.tsx`
- Default clause wording offered in the forms: `src/documents/library.ts`
- Default values (notice periods, interest rates, intro text): `src/documents/defaults.ts`

Run `npm run samples` to render one example of every template into `samples/` without starting the app. Pass a PNG to include a signature: `npm run samples -- path/to/signature.png`.

## Adding a new tool

1. Add an input schema to `src/documents/schemas.ts` and register it in `DOC_SCHEMAS`.
2. Add a resolved type in `src/documents/types.ts` and a title line in `describeDocument` (`resolve.ts`).
3. Add display info to `TOOLS` in `src/documents/meta.ts`. It then appears in the sidebar and on the home page.
4. Write the PDF template in `src/pdf/templates/` and add it to `src/pdf/render.tsx`.
5. Add defaults and a form page under `src/app/(app)/<tool>/new/`, built on `DocumentWorkspace`.

## Notes

- Signing in uses one shared team password. To give each person their own login later (for example, Google sign-in limited to @grittaai.com), replace `src/proxy.ts` and `src/app/login`.
- Signatures are stamped images, not cryptographic e-signatures. For agreements that need a legally verifiable digital signature, send the PDF through an e-sign service such as Aadhaar eSign or DocuSign.
- The templates are a starting point, not legal advice. Have a lawyer review the agreement and offer letter wording once before relying on them.
