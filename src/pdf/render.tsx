import "server-only";
import React from "react";
import { renderToBuffer } from "@react-pdf/renderer";
import type { ResolvedDoc } from "@/documents/types";
import { registerFonts } from "./theme";
import { AgreementPdf } from "./templates/agreement";
import { ProposalPdf } from "./templates/proposal";
import { OfferLetterPdf } from "./templates/offer-letter";
import { RelievingLetterPdf } from "./templates/relieving-letter";
import { InvoicePdf } from "./templates/invoice";

/** Render any resolved document to a PDF buffer. */
export async function renderPdf(doc: ResolvedDoc): Promise<Buffer> {
  registerFonts();
  switch (doc.type) {
    case "agreement":
      return renderToBuffer(<AgreementPdf doc={doc} />);
    case "proposal":
      return renderToBuffer(<ProposalPdf doc={doc} />);
    case "offer-letter":
      return renderToBuffer(<OfferLetterPdf doc={doc} />);
    case "relieving-letter":
      return renderToBuffer(<RelievingLetterPdf doc={doc} />);
    case "invoice":
      return renderToBuffer(<InvoicePdf doc={doc} />);
  }
}
