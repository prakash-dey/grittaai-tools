/**
 * Pre-written clause text. Forms let you tick these and edit the wording per document,
 * so the templates stay fixed while each document only fills in its variables.
 */

export type ServiceItem = {
  key: string;
  /** Bold lead-in in the agreement, e.g. "DM Setter" */
  label: string;
  /** Agreement clause text (third person, "The Company shall ...") */
  description: string;
  /** One-line description used in the proposal's service overview */
  proposalLine: string;
  /** Row label in the proposal's package comparison table */
  matrixLabel: string;
};

export const SERVICE_LIBRARY: ServiceItem[] = [
  {
    key: "dm-setter",
    label: "DM Setter",
    description:
      "The Company's DM Setter shall handle all inbound and outbound chat communications with prospective leads and shall hand off qualified conversations to the Appointment Setter.",
    proposalLine: "handles all inbound and outbound chats and hands the conversation over to the Appointment Setter.",
    matrixLabel: "DM Setter: inbound & outbound chat handling",
  },
  {
    key: "appointment-setter",
    label: "Appointment Setter",
    description:
      "The Company's Appointment Setter shall call every lead received and shall qualify each lead prior to handing it over for closure.",
    proposalLine: "calls every lead and qualifies it before it is passed on to the Sales Closer.",
    matrixLabel: "Appointment Setter: call & lead qualification",
  },
  {
    key: "call-setting",
    label: "Call Setting",
    description:
      "The Company shall handle call setting for the Client's incoming leads, including call booking, so that every incoming lead is engaged promptly.",
    proposalLine: "handles call setting and call booking for every incoming lead.",
    matrixLabel: "Call setting & call booking for incoming leads",
  },
  {
    key: "sales-closer",
    label: "Sales Closing",
    description:
      "The Company shall close all booked meetings on behalf of the Client, taking responsibility for sales closure under this Agreement.",
    proposalLine: "closes the deal on all qualified leads and booked meetings.",
    matrixLabel: "Sales Closer: deal closure",
  },
  {
    key: "closure-by-client",
    label: "Sales Closure",
    description:
      "The final sales closure call for each qualified lead shall be taken by the Client's own team. The Company's responsibility under this Agreement ends at the point of a qualified, ready-to-close lead being handed over to the Client.",
    proposalLine: "the final closure call is taken by the client's own team.",
    matrixLabel: "Sales closure taken by client",
  },
  {
    key: "follow-up",
    label: "Sales Follow-up",
    description:
      "The Company's Sales Follow-up Executive shall manage ongoing follow-up with leads so that no lead is missed, with the objective of converting leads into closed opportunities.",
    proposalLine: "manages ongoing follow-up so no lead is missed, converting stalled leads into opportunities.",
    matrixLabel: "Sales Follow-up Executive: opportunity conversion",
  },
  {
    key: "dashboard",
    label: "Reporting Dashboard",
    description:
      "The Company shall provide the Client with access to a live dashboard through which the Client may check the status and progress of leads in real time.",
    proposalLine: "gives the client full visibility into every lead's status and progress, in real time.",
    matrixLabel: "Live progress dashboard",
  },
  {
    key: "tracking-app",
    label: "Client Tracking App",
    description:
      "The Company shall provide the Client with access to an application through which the Client may track current progress on the go.",
    proposalLine: "an app for the client to track current progress on the go.",
    matrixLabel: "Client progress-tracking app",
  },
];

export const EXCLUSION_LIBRARY: { key: string; text: string }[] = [
  {
    key: "no-social",
    text: "The Company shall not handle any social media account or social media direct messages (DMs) of the Client. Such activities do not form part of the Services under this Agreement.",
  },
  {
    key: "no-closer-app",
    text: "The dedicated Sales Closer role and the optional client progress-tracking mobile application are not included under this Package and do not form part of the Services under this Agreement.",
  },
];

export function serviceByKey(key: string | undefined) {
  return SERVICE_LIBRARY.find((s) => s.key === key);
}
