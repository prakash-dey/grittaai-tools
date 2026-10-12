"use client";

import { useActionState } from "react";
import { Card, inputCls } from "@/components/form";
import type { Settings } from "@/db/schema";
import { saveSettings } from "./actions";

function F({ name, label, defaultValue, hint }: { name: string; label: string; defaultValue: string; hint?: string }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[13px] font-medium">{label}</span>
      <input name={name} defaultValue={defaultValue} className={inputCls} />
      {hint ? <span className="mt-1 block text-xs text-muted">{hint}</span> : null}
    </label>
  );
}

export function CompanyForm({ settings }: { settings: Settings }) {
  const [state, action, pending] = useActionState(saveSettings, undefined);
  return (
    <form action={action}>
      <Card title="Company and payment details" description="Used in letterheads, footers and the payment section of agreements.">
        <div className="grid gap-4 sm:grid-cols-2">
          <F name="companyName" label="Company name" defaultValue={settings.companyName} />
          <F name="email" label="Email" defaultValue={settings.email} />
          <F name="website" label="Website" defaultValue={settings.website} />
          <F name="jurisdiction" label="Courts for disputes" defaultValue={settings.jurisdiction} hint="Named in the governing law clause" />
        </div>
        <div className="grid gap-4 border-t border-line pt-4 sm:grid-cols-2">
          <F name="bankAccountName" label="Account holder name" defaultValue={settings.bankAccountName} />
          <F name="bankAccountNumber" label="Account number" defaultValue={settings.bankAccountNumber} />
          <F name="bankIfsc" label="IFSC code" defaultValue={settings.bankIfsc} />
          <F name="bankName" label="Bank name" defaultValue={settings.bankName ?? ""} hint="Optional" />
        </div>
        <div className="flex items-center gap-3">
          <button disabled={pending} className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark disabled:opacity-50">
            {pending ? "Saving..." : "Save details"}
          </button>
          {state?.ok ? <span className="text-sm text-green-700">Saved</span> : null}
          {state?.error ? <span className="text-sm text-red-600">{state.error}</span> : null}
        </div>
      </Card>
    </form>
  );
}
