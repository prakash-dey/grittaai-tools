"use client";

import React from "react";
import { DocumentWorkspace, useFormState } from "@/components/workspace";
import { Card, Field, NumberInput, Row, Select, SignatoryPicker, StringListEditor, TextArea, TextInput, type SignatoryChoice } from "@/components/form";
import { employmentTypes, type OfferLetterInput } from "@/documents/schemas";
import { groupIndian, numberToWordsIndian } from "@/lib/format";

export function OfferLetterForm({ initial, signatories }: { initial: OfferLetterInput; signatories: SignatoryChoice[] }) {
  const { state: o, set, patch } = useFormState<OfferLetterInput>(initial);
  const isIntern = o.employmentType === "Internship";
  const isContract = o.employmentType === "Contract";

  function changeType(t: OfferLetterInput["employmentType"]) {
    // Sensible switches: interns get a monthly stipend and a fixed duration.
    if (t === "Internship") patch({ employmentType: t, compensationPeriod: "per month", probationMonths: 0, durationMonths: o.durationMonths || 3, noticePeriodDays: 7 });
    else if (t === "Contract") patch({ employmentType: t, probationMonths: 0, durationMonths: o.durationMonths || 6 });
    else patch({ employmentType: t, durationMonths: 0, probationMonths: o.probationMonths || 3, compensationPeriod: "per annum" });
  }

  return (
    <DocumentWorkspace type="offer-letter" title="Offer Letter" subtitle="Offer letters for hires and interns. The candidate's acceptance signature is left blank." value={o}>
      {(err) => (
        <>
          <Card title="Candidate">
            <Row cols={3}>
              <Field label="Title">
                <Select value={o.salutation} onChange={(v) => set("salutation", v)} options={[{ value: "Mr.", label: "Mr." }, { value: "Ms.", label: "Ms." }, { value: "Mx.", label: "Mx." }]} />
              </Field>
              <Field label="Full name" error={err("candidateName")} className="sm:col-span-2">
                <TextInput value={o.candidateName} onChange={(v) => set("candidateName", v)} />
              </Field>
            </Row>
            <Field label="Address" hint="Optional">
              <TextArea rows={2} value={o.candidateAddress} onChange={(v) => set("candidateAddress", v)} />
            </Field>
          </Card>

          <Card title="Role">
            <Row>
              <Field label="Position" error={err("position")}>
                <TextInput value={o.position} onChange={(v) => set("position", v)} placeholder="Business Development Representative" />
              </Field>
              <Field label="Department" hint="Optional">
                <TextInput value={o.department} onChange={(v) => set("department", v)} />
              </Field>
            </Row>
            <Row>
              <Field label="Employment type">
                <Select value={o.employmentType} onChange={changeType} options={employmentTypes.map((t) => ({ value: t, label: t }))} />
              </Field>
              <Field label="Reporting to" hint="Optional">
                <TextInput value={o.reportingTo} onChange={(v) => set("reportingTo", v)} />
              </Field>
            </Row>
            <Row>
              <Field label="Date of joining">
                <TextInput type="date" value={o.joiningDate} onChange={(v) => set("joiningDate", v)} />
              </Field>
              <Field label="Work location" error={err("workLocation")}>
                <TextInput value={o.workLocation} onChange={(v) => set("workLocation", v)} />
              </Field>
            </Row>
          </Card>

          <Card title="Compensation and terms">
            <Row>
              <Field
                label={isIntern ? "Stipend" : o.compensationPeriod === "per annum" ? "CTC" : "Salary"}
                error={err("compensationAmount")}
                hint={o.compensationAmount > 0 ? `Rs. ${groupIndian(o.compensationAmount)} (${numberToWordsIndian(o.compensationAmount)})` : undefined}
              >
                <NumberInput value={o.compensationAmount} onChange={(v) => set("compensationAmount", v)} prefix="Rs." />
              </Field>
              <Field label="Paid">
                <Select value={o.compensationPeriod} onChange={(v) => set("compensationPeriod", v)} options={[{ value: "per annum", label: "Per annum" }, { value: "per month", label: "Per month" }]} />
              </Field>
            </Row>
            <Row>
              {isIntern || isContract ? (
                <Field label={isIntern ? "Internship duration" : "Contract duration"}>
                  <NumberInput value={o.durationMonths} onChange={(v) => set("durationMonths", v)} suffix="months" />
                </Field>
              ) : (
                <Field label="Probation" hint="0 for no probation">
                  <NumberInput value={o.probationMonths} onChange={(v) => set("probationMonths", v)} suffix="months" />
                </Field>
              )}
              <Field label="Notice period">
                <NumberInput value={o.noticePeriodDays} onChange={(v) => set("noticePeriodDays", v)} suffix="days" />
              </Field>
            </Row>
            <Row>
              <Field label="Letter date">
                <TextInput type="date" value={o.letterDate} onChange={(v) => set("letterDate", v)} />
              </Field>
              <Field label="Accept by">
                <TextInput type="date" value={o.acceptBy} onChange={(v) => set("acceptBy", v)} />
              </Field>
            </Row>
          </Card>

          <Card title="Responsibilities" description="Optional. Listed as bullet points.">
            <StringListEditor items={o.responsibilities} onChange={(v) => set("responsibilities", v)} addLabel="Add responsibility" />
          </Card>

          <Card title="Additional terms" description="Optional. Each becomes its own numbered term.">
            <StringListEditor items={o.additionalTerms} onChange={(v) => set("additionalTerms", v)} multiline addLabel="Add term" />
          </Card>

          <Card title="Signed by">
            <SignatoryPicker single options={signatories} value={o.signatoryIds} onChange={(ids) => set("signatoryIds", ids)} />
          </Card>
        </>
      )}
    </DocumentWorkspace>
  );
}
