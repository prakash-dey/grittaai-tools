"use client";

import React from "react";
import { DocumentWorkspace, useFormState } from "@/components/workspace";
import { Button, Card, Checkbox, Field, NumberInput, Row, SignatoryPicker, StringListEditor, TextArea, TextInput, type SignatoryChoice } from "@/components/form";
import { IconPlus, IconTrash } from "@/components/icons";
import { SERVICE_LIBRARY, serviceByKey } from "@/documents/library";
import type { InclusionValue, ProposalInput } from "@/documents/schemas";
import { groupIndian } from "@/lib/format";

const INCLUSION_OPTIONS: { value: InclusionValue; label: string }[] = [
  { value: "included", label: "Included" },
  { value: "optional", label: "Optional" },
  { value: "client", label: "By client" },
  { value: "excluded", label: "Not included" },
];

export function ProposalForm({ initial, signatories }: { initial: ProposalInput; signatories: SignatoryChoice[] }) {
  const { state: p, set } = useFormState<ProposalInput>(initial);
  type Pkg = ProposalInput["packages"][number];

  const hasService = (key: string) => p.services.some((s) => s.key === key);
  const toggleService = (key: string, on: boolean) => {
    if (on) {
      const lib = serviceByKey(key)!;
      const next = [...p.services, { key, label: lib.label, proposalLine: lib.proposalLine, matrixLabel: lib.matrixLabel }];
      const order = (k: string) => {
        const i = SERVICE_LIBRARY.findIndex((s) => s.key === k);
        return i === -1 ? 999 : i;
      };
      set("services", next.sort((a, b) => order(a.key) - order(b.key)));
    } else {
      set("services", p.services.filter((s) => s.key !== key));
    }
  };
  const updateService = (key: string, patch: Partial<ProposalInput["services"][number]>) =>
    set("services", p.services.map((s) => (s.key === key ? { ...s, ...patch } : s)));
  const customServices = p.services.filter((s) => s.key.startsWith("custom-"));

  const updatePkg = (i: number, patch: Partial<Pkg>) => set("packages", p.packages.map((x, j) => (j === i ? { ...x, ...patch } : x)));
  const addPkg = () => {
    const last = p.packages[p.packages.length - 1];
    set("packages", [
      ...p.packages,
      { name: `Package ${p.packages.length + 1}`, durationMonths: last?.durationMonths ?? 3, price: 0, commissionPct: 0, scope: "", inclusions: { ...(last?.inclusions ?? {}) } },
    ]);
  };

  // The closure-by-client service is expressed as "By client" on the Sales Closer row, so hide it here.
  const selectable = SERVICE_LIBRARY.filter((s) => s.key !== "closure-by-client");

  return (
    <DocumentWorkspace type="proposal" title="Package Creator" subtitle="A service proposal comparing up to four packages side by side." value={p}>
      {(err) => (
        <>
          <Card title="Proposal">
            <Row>
              <Field label="Prepared for" hint="Optional. Leave blank for a general proposal.">
                <TextInput value={p.preparedFor} onChange={(v) => set("preparedFor", v)} placeholder="Client or company name" />
              </Field>
              <Field label="Date">
                <TextInput type="date" value={p.date} onChange={(v) => set("date", v)} />
              </Field>
            </Row>
            <Field label="Title" error={err("title")}>
              <TextInput value={p.title} onChange={(v) => set("title", v)} />
            </Field>
            <Field label="Subtitle">
              <TextInput value={p.subtitle} onChange={(v) => set("subtitle", v)} />
            </Field>
            <Field label="Introduction" error={err("intro")}>
              <TextArea rows={4} value={p.intro} onChange={(v) => set("intro", v)} />
            </Field>
          </Card>

          <Card title="Services" description="These become the service overview and the rows of the comparison table.">
            <Field label="Overview lead-in">
              <TextArea rows={2} value={p.overviewIntro} onChange={(v) => set("overviewIntro", v)} />
            </Field>
            {err("services") ? <p className="text-xs text-red-600">{err("services")}</p> : null}
            <div className="space-y-2">
              {selectable.map((lib) => {
                const cur = p.services.find((s) => s.key === lib.key);
                return (
                  <Checkbox key={lib.key} label={lib.label} checked={hasService(lib.key)} onChange={(on) => toggleService(lib.key, on)}>
                    {cur ? (
                      <>
                        <Field label="Name">
                          <TextInput value={cur.label} onChange={(v) => updateService(lib.key, { label: v })} />
                        </Field>
                        <Field label="Overview line">
                          <TextInput value={cur.proposalLine} onChange={(v) => updateService(lib.key, { proposalLine: v })} />
                        </Field>
                        <Field label="Comparison table label">
                          <TextInput value={cur.matrixLabel} onChange={(v) => updateService(lib.key, { matrixLabel: v })} />
                        </Field>
                      </>
                    ) : null}
                  </Checkbox>
                );
              })}
            </div>
            {customServices.map((s) => (
              <div key={s.key} className="space-y-2 rounded-lg border border-line p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Custom service</span>
                  <Button variant="ghost" className="px-2" onClick={() => set("services", p.services.filter((x) => x.key !== s.key))}>
                    <IconTrash className="h-4 w-4" />
                  </Button>
                </div>
                <TextInput value={s.label} placeholder="Name" onChange={(v) => updateService(s.key, { label: v, matrixLabel: s.matrixLabel || v })} />
                <TextInput value={s.proposalLine} placeholder="Overview line" onChange={(v) => updateService(s.key, { proposalLine: v })} />
                <TextInput value={s.matrixLabel} placeholder="Comparison table label" onChange={(v) => updateService(s.key, { matrixLabel: v })} />
              </div>
            ))}
            <Button
              variant="secondary"
              onClick={() => set("services", [...p.services, { key: `custom-${Date.now()}`, label: "", proposalLine: "", matrixLabel: "" }])}
            >
              <IconPlus className="h-4 w-4" /> Add custom service
            </Button>
          </Card>

          {p.packages.map((pkg, i) => (
            <Card
              key={i}
              title={pkg.name || `Package ${i + 1}`}
              actions={
                p.packages.length > 1 ? (
                  <Button variant="ghost" className="px-2" onClick={() => set("packages", p.packages.filter((_, j) => j !== i))}>
                    <IconTrash className="h-4 w-4" />
                  </Button>
                ) : null
              }
            >
              <Row>
                <Field label="Package name" error={err(`packages.${i}.name`)}>
                  <TextInput value={pkg.name} onChange={(v) => updatePkg(i, { name: v })} />
                </Field>
                <Field label="Duration">
                  <NumberInput value={pkg.durationMonths} onChange={(v) => updatePkg(i, { durationMonths: v })} suffix="months" />
                </Field>
              </Row>
              <Row>
                <Field label="Price for the full term" error={err(`packages.${i}.price`)} hint={pkg.price > 0 ? `Rs. ${groupIndian(pkg.price)}` : undefined}>
                  <NumberInput value={pkg.price} onChange={(v) => updatePkg(i, { price: v })} prefix="Rs." />
                </Field>
                <Field label="Commission per closed deal" hint="0 for none">
                  <NumberInput value={pkg.commissionPct} onChange={(v) => updatePkg(i, { commissionPct: v })} suffix="%" />
                </Field>
              </Row>
              <Field label="Scope summary" error={err(`packages.${i}.scope`)}>
                <TextInput value={pkg.scope} onChange={(v) => updatePkg(i, { scope: v })} placeholder="Full team of 4 + dashboard; tracking app optional" />
              </Field>
              <div>
                <p className="mb-2 text-[13px] font-medium">What is included</p>
                <div className="divide-y divide-line rounded-lg border border-line">
                  {p.services.map((s) => (
                    <div key={s.key} className="flex items-center justify-between gap-3 px-3 py-2">
                      <span className="min-w-0 truncate text-sm">{s.label || "Untitled service"}</span>
                      <div className="flex shrink-0 overflow-hidden rounded-md border border-line">
                        {INCLUSION_OPTIONS.filter((o) => o.value !== "client" || s.key === "sales-closer").map((o) => {
                          const on = (pkg.inclusions[s.key] ?? "excluded") === o.value;
                          return (
                            <button
                              key={o.value}
                              type="button"
                              onClick={() => updatePkg(i, { inclusions: { ...pkg.inclusions, [s.key]: o.value } })}
                              className={`px-2 py-1 text-[11px] ${on ? "bg-brand text-white" : "bg-white text-muted hover:bg-gray-50"}`}
                            >
                              {o.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          ))}
          {p.packages.length < 4 ? (
            <Button variant="secondary" onClick={addPkg}>
              <IconPlus className="h-4 w-4" /> Add package
            </Button>
          ) : null}

          <Card title="Notes">
            <StringListEditor items={p.notes} onChange={(v) => set("notes", v)} multiline addLabel="Add note" />
          </Card>

          <Card title="Signed by">
            <SignatoryPicker options={signatories} value={p.signatoryIds} onChange={(ids) => set("signatoryIds", ids)} />
          </Card>
        </>
      )}
    </DocumentWorkspace>
  );
}
