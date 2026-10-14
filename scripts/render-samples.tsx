/**
 * Renders one sample of every template into ./samples, without the web app or database.
 * Usage: npm run samples [-- path/to/signature.png]
 */
import React from "react";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { renderToBuffer } from "@react-pdf/renderer";
import { registerFonts } from "../src/pdf/theme";
import { AgreementPdf } from "../src/pdf/templates/agreement";
import { ProposalPdf } from "../src/pdf/templates/proposal";
import { OfferLetterPdf } from "../src/pdf/templates/offer-letter";
import { RelievingLetterPdf } from "../src/pdf/templates/relieving-letter";
import { InvoicePdf } from "../src/pdf/templates/invoice";
import { sampleDocs } from "./samples";

async function main() {
  registerFonts();
  const sigPath = process.argv[2];
  const signature = sigPath ? `data:image/png;base64,${readFileSync(sigPath).toString("base64")}` : null;
  const docs = sampleDocs(signature);
  mkdirSync("samples", { recursive: true });

  const jobs: [string, React.ReactElement][] = [
    ["agreement", <AgreementPdf key="a" doc={docs.agreement as never} />],
    ["proposal", <ProposalPdf key="p" doc={docs.proposal as never} />],
    ["offer-letter", <OfferLetterPdf key="o" doc={docs["offer-letter"] as never} />],
    ["relieving-letter", <RelievingLetterPdf key="r" doc={docs["relieving-letter"] as never} />],
    ["invoice", <InvoicePdf key="i" doc={docs.invoice as never} />],
  ];
  for (const [name, el] of jobs) {
    const buf = await renderToBuffer(el as never);
    writeFileSync(`samples/${name}.pdf`, buf);
    console.log(`samples/${name}.pdf (${Math.round(buf.length / 1024)} KB)`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
