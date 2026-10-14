import type { DocType } from "./schemas";

/** Display info for each tool. Adding a tool to the platform starts here. */
export const TOOLS: Record<
  DocType,
  { name: string; short: string; description: string; href: string; icon: "agreement" | "package" | "offer" | "exit" | "invoice" }
> = {
  agreement: {
    name: "Agreement Creator",
    short: "Agreement",
    description: "Client service agreements with scope, fees, payment tranches and commission.",
    href: "/agreements/new",
    icon: "agreement",
  },
  proposal: {
    name: "Package Creator",
    short: "Proposal",
    description: "Service proposals that compare packages side by side for a client.",
    href: "/packages/new",
    icon: "package",
  },
  "offer-letter": {
    name: "Offer Letter",
    short: "Offer letter",
    description: "Offer letters for full-time hires, interns and contractors.",
    href: "/offer-letters/new",
    icon: "offer",
  },
  "relieving-letter": {
    name: "Exit Letter",
    short: "Relieving letter",
    description: "Single-page relieving letters for employees and interns who are leaving.",
    href: "/exit-letters/new",
    icon: "exit",
  },
  invoice: {
    name: "Invoice",
    short: "Invoice",
    description: "Client invoices with line items, optional GST, advance received and bank details.",
    href: "/invoices/new",
    icon: "invoice",
  },
};
