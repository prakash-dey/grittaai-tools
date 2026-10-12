"use client";

import React from "react";
import { DocumentWorkspace, useFormState } from "@/components/workspace";
import {
  Button, Card, Checkbox, Field, NumberInput, Row, SignatoryPicker, StringListEditor, TextArea, TextInput, Toggle,
  type SignatoryChoice,
} from "@/components/form";
import { IconPlus, IconTrash } from "@/components/icons";
import { EXCLUSION_LIBRARY, SERVICE_LIBRARY, serviceByKey } from "@/documents/library";
import type { AgreementInput } from "@/documents/schemas";
import type { ProposalPackageOption } from "@/lib/data";
import { groupIndian, numberToWordsIndian } from "@/lib/format";

export function AgreementForm({
  initial,
  signatories,
  packages,
}: {
  initial: AgreementInput;
  signatories: SignatoryChoice[];
  packages: ProposalPackageOption[];
}) {
  const { state: a, set, patch } = useFormState<AgreementInput>(initial);

  const librarySelected = (key: string) => a.services.some((s) => s.key === key);
  const toggleLibrary = (key: string, on: boolean) => {
    if (on) {
      const item = serviceByKey(key)!;
      // Keep library order, with custom services after.
      const next = [...a.services, { key, label: item.label, description: item.description }];
      const order = (k?: string) => {
        const i = SERVICE_LIBRARY.findIndex((s) => s.key === k);
        return i === -1 ? 999 : i;
      };
      set("services", next.sort((x, y) => order(x.key) - order(y.key)));
    } else {
      set("services", a.services.filter((s) => s.key !== key));
    }
  };
  const updateService = (key: string | undefined, idx: number, p: Partial<AgreementInput["services"][number]>) =>
    set("services", a.services.map((s, i) => ((key ? s.key === key : i === idx) ? { ...s, ...p } : s)));
  const customServices = a.services.map((s, i) => ({ s, i })).filter(({ s }) => !s.key);

  const exclusionOn = (text: string) => a.exclusions.includes(text);
  const libraryExclusionTexts = EXCLUSION_LIBRARY.map((e) => e.text);
  const customExclusions = a.exclusions.filter((t) => !libraryExclusionTexts.includes(t));

  const trancheSum = a.tranches.reduce((s, t) => s + (t.amount || 0), 0);

  function loadPackage(id: string) {
    const opt = packages.find((p) => p.id === id);
    if (!opt) return;
    const { pkg } = opt;
    const services: AgreementInput["services"] = [];
    for (const lib of SERVICE_LIBRARY) {
      const v = pkg.inclusions[lib.key];
      if (lib.key === "sales-closer" && v === "client") {
        const c = serviceByKey("closure-by-client")!;
        services.push({ key: c.key, label: c.label, description: c.description });
      } else if (v === "included") {
        services.push({ key: lib.key, label: lib.label, description: lib.description });
      }
    }
    patch({
      packageName: pkg.name,
      subtitle: `${pkg.name}: ${pkg.durationMonths}-Month Engagement`,
      termMonths: pkg.durationMonths,
      totalFee: pkg.price,
      services: services.length ? services : a.services,
      commission: { ...a.commission, enabled: pkg.commissionPct > 0, percent: pkg.commissionPct > 0 ? pkg.commissionPct : a.commission.percent },
    });
  }

  return (
    <DocumentWorkspace
      type="agreement"
      title="Agreement Creator"
      subtitle="Sales enablement services agreement. Gritta AI signs; the client's signature is left blank."
      value={a}
    >
      {(err) => (
        <>
          <Card title="Client">
            <Row>
              <Field label="Client name" error={err("clientName")}>
                <TextInput value={a.clientName} onChange={(v) => set("clientName", v)} placeholder="Avik Bhattacharyya" />
              </Field>
              <Field label="Agreement date" hint="Also the Effective Date">
                <TextInput type="date" value={a.agreementDate} onChange={(v) => set("agreementDate", v)} />
              </Field>
            </Row>
            <Field label="Client address" error={err("clientAddress")}>
              <TextArea rows={2} value={a.clientAddress} onChange={(v) => set("clientAddress", v)} placeholder="Nea Plus, Sus, Pune - 411021" />
            </Field>
          </Card>

          <Card
            title="Package"
            description="Start from a package in a saved proposal, or fill this in directly."
            actions={
              packages.length ? (
                <select
                  defaultValue=""
                  onChange={(e) => {
                    loadPackage(e.target.value);
                    e.target.value = "";
                  }}
                  className="max-w-[220px] rounded-lg border border-line bg-white px-2 py-1.5 text-xs"
                >
                  <option value="" disabled>
                    Load from proposal...
                  </option>
                  {packages.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.pkg.name} ({p.proposalTitle})
                    </option>
                  ))}
                </select>
              ) : null
            }
          >
            <Field label="Package description" hint="Shown in the Package Detail table" error={err("packageName")}>
              <TextInput value={a.packageName} onChange={(v) => set("packageName", v)} placeholder="Package 3: 6-Month End-to-End Sales Support, Except Sales Closure" />
            </Field>
            <Row>
              <Field label="Subtitle under the title" hint={`Leave blank for "${a.termMonths}-Month Engagement"`}>
                <TextInput value={a.subtitle} onChange={(v) => set("subtitle", v)} />
              </Field>
              <Field label="Term" error={err("termMonths")}>
                <NumberInput value={a.termMonths} onChange={(v) => set("termMonths", v)} suffix="months" />
              </Field>
            </Row>
          </Card>

          <Card title="Scope of services" description="Tick what is included. Wording can be edited per agreement.">
            {err("services") ? <p className="text-xs text-red-600">{err("services")}</p> : null}
            <div className="space-y-2">
              {SERVICE_LIBRARY.map((lib) => {
                const current = a.services.find((s) => s.key === lib.key);
                return (
                  <Checkbox key={lib.key} label={lib.label} checked={librarySelected(lib.key)} onChange={(on) => toggleLibrary(lib.key, on)}>
                    {current ? (
                      <>
                        <Field label="Heading">
                          <TextInput value={current.label} onChange={(v) => updateService(lib.key, -1, { label: v })} />
                        </Field>
                        <Field label="Clause text">
                          <TextArea rows={3} value={current.description} onChange={(v) => updateService(lib.key, -1, { description: v })} />
                        </Field>
                      </>
                    ) : null}
                  </Checkbox>
                );
              })}
            </div>
            {customServices.map(({ s, i }) => (
              <div key={i} className="space-y-3 rounded-lg border border-line p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Custom service</span>
                  <Button variant="ghost" className="px-2" onClick={() => set("services", a.services.filter((_, j) => j !== i))}>
                    <IconTrash className="h-4 w-4" />
                  </Button>
                </div>
                <TextInput value={s.label} onChange={(v) => updateService(undefined, i, { label: v })} placeholder="Heading" />
                <TextArea rows={3} value={s.description} onChange={(v) => updateService(undefined, i, { description: v })} placeholder="The Company shall..." />
              </div>
            ))}
            <Button variant="secondary" onClick={() => set("services", [...a.services, { label: "", description: "" }])}>
              <IconPlus className="h-4 w-4" /> Add custom service
            </Button>

            <div className="border-t border-line pt-4">
              <p className="mb-2 text-[13px] font-medium">Exclusions</p>
              <div className="space-y-2">
                {EXCLUSION_LIBRARY.map((ex) => (
                  <Checkbox
                    key={ex.key}
                    label={ex.text.split(".")[0]}
                    checked={exclusionOn(ex.text)}
                    onChange={(on) => set("exclusions", on ? [...a.exclusions, ex.text] : a.exclusions.filter((t) => t !== ex.text))}
                  />
                ))}
              </div>
              <div className="mt-3">
                <StringListEditor
                  items={customExclusions}
                  multiline
                  addLabel="Add custom exclusion"
                  placeholder="The Company shall not..."
                  onChange={(list) => set("exclusions", [...a.exclusions.filter((t) => libraryExclusionTexts.includes(t)), ...list])}
                />
              </div>
            </div>
          </Card>

          <Card title="Fees and payment">
            <Field
              label="Total fee for the full term"
              error={err("totalFee")}
              hint={a.totalFee > 0 ? `Rs. ${groupIndian(a.totalFee)} (Rupees ${numberToWordsIndian(a.totalFee)} only)` : undefined}
            >
              <NumberInput value={a.totalFee} onChange={(v) => set("totalFee", v)} prefix="Rs." />
            </Field>
            <div className="flex gap-2">
              {(["advance", "tranches"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => set("paymentMode", m)}
                  className={`flex-1 rounded-lg border px-3 py-2 text-sm ${a.paymentMode === m ? "border-brand bg-brand-50 font-medium text-brand" : "border-line"}`}
                >
                  {m === "advance" ? "Paid in advance" : "Paid in tranches"}
                </button>
              ))}
            </div>
            {a.paymentMode === "tranches" ? (
              <div className="space-y-2">
                {a.tranches.map((t, i) => (
                  <div key={i} className="flex items-start gap-2 rounded-lg border border-line p-3">
                    <span className="mt-2 w-5 text-sm font-semibold text-muted">{i + 1}</span>
                    <div className="grid flex-1 gap-2 sm:grid-cols-[160px_1fr]">
                      <NumberInput value={t.amount} prefix="Rs." onChange={(v) => set("tranches", a.tranches.map((x, j) => (j === i ? { ...x, amount: v } : x)))} />
                      <TextArea rows={2} value={t.when} placeholder="Payable upfront, upon signing of this Agreement" onChange={(v) => set("tranches", a.tranches.map((x, j) => (j === i ? { ...x, when: v } : x)))} />
                    </div>
                    <Button variant="ghost" className="px-2" onClick={() => set("tranches", a.tranches.filter((_, j) => j !== i))}>
                      <IconTrash className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <div className="flex items-center justify-between">
                  <Button variant="secondary" onClick={() => set("tranches", [...a.tranches, { amount: 0, when: "" }])}>
                    <IconPlus className="h-4 w-4" /> Add tranche
                  </Button>
                  <span className={`text-xs ${Math.abs(trancheSum - a.totalFee) > 0.5 ? "text-red-600" : "text-green-700"}`}>
                    Tranches total Rs. {groupIndian(trancheSum)} of Rs. {groupIndian(a.totalFee)}
                  </span>
                </div>
              </div>
            ) : null}
            <Field label="Late payment interest on the fee">
              <NumberInput value={a.feeLateInterestPct} onChange={(v) => set("feeLateInterestPct", v)} suffix="% per month" />
            </Field>
          </Card>

          <Card title="Commission" actions={<Toggle checked={a.commission.enabled} onChange={(v) => set("commission", { ...a.commission, enabled: v })} label="" />}>
            {a.commission.enabled ? (
              <>
                <Row cols={3}>
                  <Field label="Commission">
                    <NumberInput value={a.commission.percent} onChange={(v) => set("commission", { ...a.commission, percent: v })} suffix="%" />
                  </Field>
                  <Field label="Pay within">
                    <NumberInput value={a.commission.paymentDays} onChange={(v) => set("commission", { ...a.commission, paymentDays: v })} suffix="days" />
                  </Field>
                  <Field label="Late interest">
                    <NumberInput value={a.commission.lateInterestPct} onChange={(v) => set("commission", { ...a.commission, lateInterestPct: v })} suffix="%/mo" />
                  </Field>
                </Row>
                <p className="text-xs text-muted">Commission is charged only on amounts the client actually receives. The worked example below goes into the agreement (set both to 0 to leave it out).</p>
                <Row>
                  <Field label="Example deal size">
                    <NumberInput value={a.commission.exampleDealSize} onChange={(v) => set("commission", { ...a.commission, exampleDealSize: v })} prefix="Rs." />
                  </Field>
                  <Field label="Example amount received" error={err("commission.exampleReceived")}>
                    <NumberInput value={a.commission.exampleReceived} onChange={(v) => set("commission", { ...a.commission, exampleReceived: v })} prefix="Rs." />
                  </Field>
                </Row>
              </>
            ) : (
              <p className="text-sm text-muted">No commission. Turn on to add a commission section.</p>
            )}
          </Card>

          <Card title="Term and termination">
            <Toggle
              checked={a.nonRenewal.enabled}
              onChange={(v) => set("nonRenewal", { ...a.nonRenewal, enabled: v })}
              label="Monthly non-renewal with refund"
              description="Client can stop before next month with notice and get that month's advance back."
            />
            {a.nonRenewal.enabled ? (
              <Field label="Notice before the next month">
                <NumberInput value={a.nonRenewal.noticeDays} onChange={(v) => set("nonRenewal", { ...a.nonRenewal, noticeDays: v })} suffix="days" />
              </Field>
            ) : null}
            <Row cols={3}>
              <Field label="Termination notice">
                <NumberInput value={a.terminationNoticeDays} onChange={(v) => set("terminationNoticeDays", v)} suffix="days" />
              </Field>
              <Field label="Breach cure period">
                <NumberInput value={a.breachCureDays} onChange={(v) => set("breachCureDays", v)} suffix="days" />
              </Field>
              <Field label="Confidentiality">
                <NumberInput value={a.confidentialityYears} onChange={(v) => set("confidentialityYears", v)} suffix="years" />
              </Field>
            </Row>
          </Card>

          <Card title="Signed by" description="Uploaded signatures are stamped on the signature page.">
            <SignatoryPicker options={signatories} value={a.signatoryIds} onChange={(ids) => set("signatoryIds", ids)} />
            {err("signatoryIds") ? <p className="text-xs text-red-600">{err("signatoryIds")}</p> : null}
          </Card>
        </>
      )}
    </DocumentWorkspace>
  );
}
