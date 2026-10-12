"use client";

import React from "react";
import { IconAlert, IconPlus, IconTrash } from "./icons";

export const inputCls =
  "w-full rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand-100 disabled:bg-gray-50";

export function Card({ title, description, children, actions }: { title: string; description?: string; children: React.ReactNode; actions?: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-line bg-white p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-[15px] font-semibold">{title}</h2>
          {description ? <p className="mt-0.5 text-[13px] text-muted">{description}</p> : null}
        </div>
        {actions}
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

export function Field({ label, hint, error, children, className = "" }: { label: string; hint?: string; error?: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1 block text-[13px] font-medium text-ink/90">{label}</span>
      {children}
      {error ? <span className="mt-1 block text-xs text-red-600">{error}</span> : hint ? <span className="mt-1 block text-xs text-muted">{hint}</span> : null}
    </label>
  );
}

export function Row({ children, cols = 2 }: { children: React.ReactNode; cols?: 2 | 3 | 4 }) {
  const c = { 2: "sm:grid-cols-2", 3: "sm:grid-cols-3", 4: "sm:grid-cols-2 lg:grid-cols-4" }[cols];
  return <div className={`grid grid-cols-1 gap-4 ${c}`}>{children}</div>;
}

export function TextInput({ value, onChange, ...rest }: Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value"> & { value: string; onChange: (v: string) => void }) {
  return <input {...rest} value={value} onChange={(e) => onChange(e.target.value)} className={inputCls} />;
}

export function NumberInput({ value, onChange, prefix, suffix, ...rest }: Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value"> & { value: number; onChange: (v: number) => void; prefix?: string; suffix?: string }) {
  return (
    <div className="flex items-stretch overflow-hidden rounded-lg border border-line bg-white focus-within:border-brand focus-within:ring-2 focus-within:ring-brand-100">
      {prefix ? <span className="flex items-center bg-gray-50 px-2.5 text-sm text-muted">{prefix}</span> : null}
      <input
        {...rest}
        type="number"
        inputMode="decimal"
        value={Number.isFinite(value) ? value : ""}
        onChange={(e) => onChange(e.target.value === "" ? 0 : Number(e.target.value))}
        className="w-full min-w-0 px-3 py-2 text-sm outline-none"
      />
      {suffix ? <span className="flex items-center bg-gray-50 px-2.5 text-sm text-muted">{suffix}</span> : null}
    </div>
  );
}

export function TextArea({ value, onChange, rows = 3, ...rest }: Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "onChange" | "value"> & { value: string; onChange: (v: string) => void }) {
  return <textarea {...rest} rows={rows} value={value} onChange={(e) => onChange(e.target.value)} className={`${inputCls} leading-relaxed`} />;
}

export function Select<T extends string>({ value, onChange, options }: { value: T; onChange: (v: T) => void; options: readonly { value: T; label: string }[] }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value as T)} className={inputCls}>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

export function Toggle({ checked, onChange, label, description }: { checked: boolean; onChange: (v: boolean) => void; label: string; description?: string }) {
  return (
    <label className="flex cursor-pointer items-start gap-3">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`mt-0.5 inline-flex h-5 w-9 shrink-0 items-center rounded-full transition ${checked ? "bg-brand" : "bg-gray-300"}`}
      >
        <span className={`h-4 w-4 rounded-full bg-white shadow transition ${checked ? "translate-x-[18px]" : "translate-x-0.5"}`} />
      </button>
      <span>
        <span className="block text-sm font-medium">{label}</span>
        {description ? <span className="block text-xs text-muted">{description}</span> : null}
      </span>
    </label>
  );
}

export function Checkbox({ checked, onChange, label, children }: { checked: boolean; onChange: (v: boolean) => void; label: string; children?: React.ReactNode }) {
  return (
    <div className={`rounded-lg border p-3 transition ${checked ? "border-brand/40 bg-brand-50/50" : "border-line"}`}>
      <label className="flex cursor-pointer items-center gap-2.5">
        <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="h-4 w-4 accent-[var(--color-brand)]" />
        <span className="text-sm font-medium">{label}</span>
      </label>
      {checked && children ? <div className="mt-3 space-y-3 pl-6">{children}</div> : null}
    </div>
  );
}

export function Button({ variant = "primary", className = "", ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "ghost" | "danger" }) {
  const v = {
    primary: "bg-brand text-white hover:bg-brand-dark",
    secondary: "border border-line bg-white text-ink hover:bg-gray-50",
    ghost: "text-muted hover:bg-gray-100 hover:text-ink",
    danger: "text-red-600 hover:bg-red-50",
  }[variant];
  return (
    <button
      type="button"
      {...rest}
      className={`inline-flex items-center justify-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${v} ${className}`}
    />
  );
}

/** Edit a list of free-text lines (notes, exclusions, responsibilities). */
export function StringListEditor({ items, onChange, placeholder, addLabel = "Add line", multiline = false }: { items: string[]; onChange: (v: string[]) => void; placeholder?: string; addLabel?: string; multiline?: boolean }) {
  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="flex items-start gap-2">
          {multiline ? (
            <TextArea value={item} rows={2} placeholder={placeholder} onChange={(v) => onChange(items.map((x, j) => (j === i ? v : x)))} />
          ) : (
            <TextInput value={item} placeholder={placeholder} onChange={(v) => onChange(items.map((x, j) => (j === i ? v : x)))} />
          )}
          <Button variant="ghost" className="px-2" aria-label="Remove" onClick={() => onChange(items.filter((_, j) => j !== i))}>
            <IconTrash className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <Button variant="secondary" onClick={() => onChange([...items, ""])}>
        <IconPlus className="h-4 w-4" />
        {addLabel}
      </Button>
    </div>
  );
}

export type SignatoryChoice = { id: string; name: string; title: string; hasSignature: boolean; signature: string | null };

/** Pick who signs for the company. Warns when a signatory has no uploaded signature yet. */
export function SignatoryPicker({ options, value, onChange, single = false }: { options: SignatoryChoice[]; value: string[]; onChange: (ids: string[]) => void; single?: boolean }) {
  if (options.length === 0) {
    return (
      <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
        No signatories yet. Add one in <a href="/settings" className="font-medium underline">Settings</a>.
      </p>
    );
  }
  const toggle = (id: string) => {
    if (single) return onChange([id]);
    onChange(value.includes(id) ? value.filter((v) => v !== id) : [...value, id]);
  };
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {options.map((o) => {
        const on = value.includes(o.id);
        return (
          <button
            key={o.id}
            type="button"
            onClick={() => toggle(o.id)}
            className={`flex items-center gap-3 rounded-lg border p-3 text-left transition ${on ? "border-brand bg-brand-50/60 ring-1 ring-brand" : "border-line hover:border-gray-300"}`}
          >
            <span className={`flex h-4 w-4 shrink-0 items-center justify-center border ${single ? "rounded-full" : "rounded"} ${on ? "border-brand bg-brand" : "border-gray-300"}`}>
              {on ? <span className={`h-1.5 w-1.5 bg-white ${single ? "rounded-full" : "rounded-sm"}`} /> : null}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium">{o.name}</span>
              <span className="block truncate text-xs text-muted">{o.title}</span>
            </span>
            {o.signature ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={o.signature} alt="" className="h-7 max-w-[80px] object-contain" />
            ) : (
              <span className="flex items-center gap-1 text-[11px] text-amber-700" title="No signature uploaded. The line will be left blank.">
                <IconAlert className="h-3.5 w-3.5" />
                No signature
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export function ErrorList({ errors }: { errors: { path: string; message: string }[] }) {
  if (!errors.length) return null;
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
      <p className="mb-1 font-medium">Fix these before generating:</p>
      <ul className="list-disc space-y-0.5 pl-5">
        {errors.map((e, i) => (
          <li key={i}>{e.message}</li>
        ))}
      </ul>
    </div>
  );
}
