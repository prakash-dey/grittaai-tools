import type { AgreementInput, DocType, InvoiceInput, OfferLetterInput, ProposalInput, RelievingLetterInput } from "./schemas";

/** Frozen copies of shared data, stored inside each generated document. */
export type CompanySnapshot = { companyName: string; email: string; website: string; jurisdiction: string };
export type BankSnapshot = { accountName: string; accountNumber: string; ifsc: string; bankName: string | null };
export type SignatorySnapshot = { id: string; name: string; title: string; signature: string | null };

type Resolved<T extends DocType, I> = {
  type: T;
  input: I;
  company: CompanySnapshot;
  bank: BankSnapshot;
  signatories: SignatorySnapshot[];
};

export type ResolvedDoc =
  | Resolved<"agreement", AgreementInput>
  | Resolved<"proposal", ProposalInput>
  | Resolved<"offer-letter", OfferLetterInput>
  | Resolved<"relieving-letter", RelievingLetterInput>
  | Resolved<"invoice", InvoiceInput>;

export type ResolvedOf<T extends DocType> = Extract<ResolvedDoc, { type: T }>;
