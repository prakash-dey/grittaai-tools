"use client";

import React from "react";
import { DocumentWorkspace, useFormState } from "@/components/workspace";
import { Card, Field, Row, Select, SignatoryPicker, TextArea, TextInput, Toggle, type SignatoryChoice } from "@/components/form";
import { separationReasonLabels, type RelievingLetterInput } from "@/documents/schemas";

export function ExitLetterForm({ initial, signatories }: { initial: RelievingLetterInput; signatories: SignatoryChoice[] }) {
  const { state: r, set } = useFormState<RelievingLetterInput>(initial);
  return (
    <DocumentWorkspace type="relieving-letter" title="Exit Letter" subtitle="A single-page relieving letter, signed by the selected signatory." value={r}>
      {(err) => (
        <>
          <Card title="Employee">
            <Row cols={3}>
              <Field label="Title">
                <Select value={r.salutation} onChange={(v) => set("salutation", v)} options={[{ value: "Mr.", label: "Mr." }, { value: "Ms.", label: "Ms." }, { value: "Mx.", label: "Mx." }]} />
              </Field>
              <Field label="Full name" error={err("employeeName")} className="sm:col-span-2">
                <TextInput value={r.employeeName} onChange={(v) => set("employeeName", v)} />
              </Field>
            </Row>
            <Field label="Position" error={err("position")}>
              <TextInput value={r.position} onChange={(v) => set("position", v)} placeholder="Founding Business Development Representative" />
            </Field>
          </Card>

          <Card title="Dates">
            <Row cols={3}>
              <Field label="Joining date" error={err("joiningDate")}>
                <TextInput type="date" value={r.joiningDate} onChange={(v) => set("joiningDate", v)} />
              </Field>
              <Field label="Last working date" error={err("lastWorkingDate")}>
                <TextInput type="date" value={r.lastWorkingDate} onChange={(v) => set("lastWorkingDate", v)} />
              </Field>
              <Field label="Letter date">
                <TextInput type="date" value={r.letterDate} onChange={(v) => set("letterDate", v)} />
              </Field>
            </Row>
          </Card>

          <Card title="Separation">
            <Field label="Reason">
              <Select
                value={r.separationReason}
                onChange={(v) => set("separationReason", v)}
                options={(Object.keys(separationReasonLabels) as (keyof typeof separationReasonLabels)[]).map((k) => ({ value: k, label: separationReasonLabels[k] }))}
              />
            </Field>
            <Toggle checked={r.duesSettled} onChange={(v) => set("duesSettled", v)} label="All dues settled" description="Adds a line confirming dues are settled as of the letter date." />
            <Field label="Closing line" hint="Leave blank for the standard appreciation line.">
              <TextArea rows={2} value={r.appreciation} onChange={(v) => set("appreciation", v)} />
            </Field>
          </Card>

          <Card title="Signed by">
            <SignatoryPicker single options={signatories} value={r.signatoryIds} onChange={(ids) => set("signatoryIds", ids)} />
            {err("signatoryIds") ? <p className="text-xs text-red-600">{err("signatoryIds")}</p> : null}
          </Card>
        </>
      )}
    </DocumentWorkspace>
  );
}
