"use client";

import React from "react";
import { DocumentWorkspace, useFormState } from "@/components/workspace";
import {
  Button, Card, Field, NumberInput, Row, Select, SignatoryPicker, StringListEditor, TextArea, TextInput, Toggle,
  type SignatoryChoice,
} from "@/components/form";
import { IconPlus, IconTrash } from "@/components/icons";
import { invoiceTotals, taxModeLabels, type InvoiceInput } from "@/documents/schemas";
import { groupIndian, numberToWordsIndian } from "@/lib/format";

export function InvoiceForm({ initial, signatories }: { initial: InvoiceInput; signatories: SignatoryChoice[] }) {
  const { state: inv, set } = useFormState<InvoiceInput>(initial);
  const t = invoiceTotals(inv);
  const setItem = (i: number, p: Partial<InvoiceInput["items"][number]>) => set("items", inv.items.map((x, j) => (j === i ? { ...x, ...p } : x)));

  return (
    <DocumentWorkspace type="invoice" title="Invoice" subtitle="Client invoice with line items, optional GST and payment details." value={inv}>
      {(err) => (
        <>
          <Card title="Invoice">
            <Row cols={3}>
              <Field label="Invoice number" hint="Counts up from the last saved invoice" error={err("invoiceNumber")}>
                <TextInput value={inv.invoiceNumber} onChange={(v) => set("invoiceNumber", v)} />
              </Field>
              <Field label="Invoice date">
                <TextInput type="date" value={inv.invoiceDate} onChange={(v) => set("invoiceDate", v)} />
              </Field>
              <Field label="Due date" error={err("dueDate")}>
                <TextInput type="date" value={inv.dueDate} onChange={(v) => set("dueDate", v)} />
              </Field>
            </Row>
          </Card>

          <Card title="Bill to">
            <Field label="Client name" error={err("clientName")}>
              <TextInput value={inv.clientName} onChange={(v) => set("clientName", v)} placeholder="Avik Bhattacharyya" />
            </Field>
            <Field label="Client address" error={err("clientAddress")}>
              <TextArea rows={2} value={inv.clientAddress} onChange={(v) => set("clientAddress", v)} placeholder="Nea Plus, Sus, Pune - 411021" />
            </Field>
            <Row>
              <Field label="Client GSTIN" hint="Optional">
                <TextInput value={inv.clientGstin} onChange={(v) => set("clientGstin", v)} />
              </Field>
              <Field label="Place of supply" hint="Optional, e.g. Maharashtra (27)">
                <TextInput value={inv.placeOfSupply} onChange={(v) => set("placeOfSupply", v)} />
              </Field>
            </Row>
          </Card>

          <Card title="Items">
            {err("items") ? <p className="text-xs text-red-600">{err("items")}</p> : null}
            <div className="space-y-2">
              {inv.items.map((item, i) => (
                <div key={i} className="flex items-start gap-2 rounded-lg border border-line p-3">
                  <span className="mt-2 w-5 text-sm font-semibold text-muted">{i + 1}</span>
                  <div className="grid flex-1 gap-2">
                    <TextArea rows={2} value={item.description} placeholder="Sales enablement services: Month 1 of 3" onChange={(v) => setItem(i, { description: v })} />
                    <div className="grid gap-2 sm:grid-cols-[110px_1fr_auto] sm:items-center">
                      <NumberInput value={item.quantity} onChange={(v) => setItem(i, { quantity: v })} suffix="qty" />
                      <NumberInput value={item.rate} onChange={(v) => setItem(i, { rate: v })} prefix="Rs." />
                      <span className="text-right text-sm text-muted">Rs. {groupIndian(t.lines[i] ?? 0)}</span>
                    </div>
                  </div>
                  <Button variant="ghost" className="px-2" aria-label="Remove item" disabled={inv.items.length === 1} onClick={() => set("items", inv.items.filter((_, j) => j !== i))}>
                    <IconTrash className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            <Button variant="secondary" onClick={() => set("items", [...inv.items, { description: "", quantity: 1, rate: 0 }])}>
              <IconPlus className="h-4 w-4" /> Add item
            </Button>
          </Card>

          <Card title="Tax">
            <Field label="GST">
              <Select
                value={inv.tax.mode}
                onChange={(v) => set("tax", { ...inv.tax, mode: v })}
                options={(Object.keys(taxModeLabels) as (keyof typeof taxModeLabels)[]).map((k) => ({ value: k, label: taxModeLabels[k] }))}
              />
            </Field>
            {inv.tax.mode !== "none" ? (
              <Row>
                <Field label="GST rate" error={err("tax.ratePct")}>
                  <NumberInput value={inv.tax.ratePct} onChange={(v) => set("tax", { ...inv.tax, ratePct: v })} suffix="%" />
                </Field>
                <Field label="Gritta AI GSTIN" error={err("tax.companyGstin")}>
                  <TextInput value={inv.tax.companyGstin} onChange={(v) => set("tax", { ...inv.tax, companyGstin: v })} />
                </Field>
              </Row>
            ) : null}
          </Card>

          <Card title="Payment">
            <Field
              label="Amount already received"
              hint={inv.amountPaid > 0 ? "Shown as a deduction, with the balance due" : "Leave at 0 if nothing has been paid yet"}
              error={err("amountPaid")}
            >
              <NumberInput value={inv.amountPaid} onChange={(v) => set("amountPaid", v)} prefix="Rs." />
            </Field>
            <div className="rounded-lg bg-gray-50 p-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted">Total</span>
                <span className="font-medium">Rs. {groupIndian(t.total)}</span>
              </div>
              {inv.amountPaid > 0 ? (
                <div className="mt-1 flex justify-between">
                  <span className="text-muted">Balance due</span>
                  <span className="font-medium">Rs. {groupIndian(t.balance)}</span>
                </div>
              ) : null}
              {t.total > 0 ? <p className="mt-1 text-xs text-muted">Rupees {numberToWordsIndian(inv.amountPaid > 0 ? t.balance : t.total)} only</p> : null}
            </div>
            <Toggle checked={inv.showBankDetails} onChange={(v) => set("showBankDetails", v)} label="Show bank details" description="Adds the company bank account from Settings." />
          </Card>

          <Card title="Notes" description="Optional. Leave empty to skip the Notes section.">
            <StringListEditor items={inv.notes} onChange={(v) => set("notes", v)} addLabel="Add note" placeholder="Payment terms, references..." />
          </Card>

          <Card title="Signed by">
            <SignatoryPicker single options={signatories} value={inv.signatoryIds} onChange={(ids) => set("signatoryIds", ids)} />
            {err("signatoryIds") ? <p className="text-xs text-red-600">{err("signatoryIds")}</p> : null}
          </Card>
        </>
      )}
    </DocumentWorkspace>
  );
}
