"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { DocType } from "@/documents/schemas";
import { Button, ErrorList } from "./form";
import { IconCheck, IconEye } from "./icons";
import { PdfPreview } from "./pdf-preview";

type Issue = { path: string; message: string };

/**
 * Two-pane layout used by every tool: the form on the left, a live PDF preview on the right.
 * The preview re-renders shortly after the user stops typing.
 */
export function DocumentWorkspace({
  type,
  title,
  subtitle,
  value,
  children,
}: {
  type: DocType;
  title: string;
  subtitle: string;
  value: unknown;
  children: (errorFor: (path: string) => string | undefined) => React.ReactNode;
}) {
  const router = useRouter();
  const [previewPdf, setPreviewPdf] = useState<Blob | null>(null);
  const [previewing, setPreviewing] = useState(false);
  const [issues, setIssues] = useState<Issue[]>([]);
  // Missing fields are only pointed out once the user tries to generate, not while they are still typing.
  const [showIssues, setShowIssues] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [showPreviewMobile, setShowPreviewMobile] = useState(false);
  const serialized = JSON.stringify(value);

  useEffect(() => {
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      setPreviewing(true);
      try {
        const res = await fetch(`/api/preview/${type}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: serialized,
          signal: ctrl.signal,
        });
        if (res.ok) {
          setPreviewPdf(await res.blob());
          setIssues(JSON.parse(decodeURIComponent(res.headers.get("X-Document-Issues") ?? "%5B%5D")));
          setPreviewError(null);
        } else {
          const body = await res.json().catch(() => ({}));
          setPreviewError(body.error ?? "Preview failed");
        }
      } catch (err) {
        if ((err as Error).name !== "AbortError") setPreviewError("Could not reach the server for a preview.");
      } finally {
        if (!ctrl.signal.aborted) setPreviewing(false);
      }
    }, 700);
    return () => {
      ctrl.abort();
      clearTimeout(t);
    };
  }, [serialized, type]);

  // The server validates strictly and refuses incomplete documents, so nothing is saved
  // (or downloadable) until every required field is filled in.
  async function save() {
    setSaving(true);
    setSaveError(null);
    try {
      const res = await fetch(`/api/documents`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, input: value }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (body.issues) {
          setIssues(body.issues);
          setShowIssues(true);
        }
        setSaveError(body.error ?? "Could not save the document.");
        return;
      }
      router.push(`/documents/${body.id}?created=1`);
    } finally {
      setSaving(false);
    }
  }

  const visibleIssues = showIssues ? issues : [];
  const errorFor = (path: string) => visibleIssues.find((i) => i.path === path || i.path.startsWith(path + "."))?.message;

  return (
    <div className="flex min-h-screen flex-col xl:flex-row">
      <div className="min-w-0 flex-1 px-4 py-6 sm:px-8 xl:max-w-[640px] 2xl:max-w-[720px]">
        <header className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-1 text-sm text-muted">{subtitle}</p>
        </header>
        <div className="space-y-5 pb-28">{children(errorFor)}</div>
        <div className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-white/95 px-4 py-3 backdrop-blur sm:px-8 lg:left-60 xl:right-auto xl:w-[640px] 2xl:w-[720px]">
          <div className="space-y-2">
            {visibleIssues.length ? <ErrorList errors={visibleIssues} /> : null}
            {saveError && !issues.length ? <p className="text-sm text-red-600">{saveError}</p> : null}
            <div className="flex items-center gap-2">
              <Button onClick={save} disabled={saving} className={issues.length ? "opacity-60" : ""}>
                <IconCheck className="h-4 w-4" />
                {saving ? "Saving..." : "Generate & save"}
              </Button>
              <Button variant="secondary" className="xl:hidden" onClick={() => setShowPreviewMobile((v) => !v)}>
                <IconEye className="h-4 w-4" />
                {showPreviewMobile ? "Hide preview" : "Preview"}
              </Button>
              <span className={`ml-auto text-xs ${previewError ? "text-red-600" : "text-muted"}`}>
                {previewing
                  ? "Updating preview..."
                  : previewError
                    ? previewError
                    : issues.length
                      ? `${issues.length} ${issues.length === 1 ? "field needs" : "fields need"} attention before you can download`
                      : "Ready to generate"}
              </span>
            </div>
          </div>
        </div>
      </div>
      <div
        className={`${showPreviewMobile ? "fixed inset-0 z-30 flex" : "hidden"} flex-col bg-gray-200 xl:sticky xl:top-0 xl:flex xl:h-screen xl:flex-1`}
      >
        <div className="flex items-center justify-between border-b border-gray-300 bg-gray-100 px-4 py-2 text-xs text-muted">
          <span>Live preview</span>
          <button className="xl:hidden" onClick={() => setShowPreviewMobile(false)}>
            Close
          </button>
        </div>
        {previewPdf ? (
          <div className="min-h-0 flex-1">
            <PdfPreview data={previewPdf} />
          </div>
        ) : (
          <div className="flex flex-1 items-center justify-center text-sm text-muted">
            {previewError ?? "Rendering preview..."}
          </div>
        )}
      </div>
    </div>
  );
}

/** Small helper so forms can update nested state immutably: set("commission.percent", 15). */
export function useFormState<T extends object>(initial: T) {
  const [state, setState] = useState<T>(initial);
  const set = <K extends keyof T>(key: K, v: T[K]) => setState((s) => ({ ...s, [key]: v }));
  const patch = (p: Partial<T>) => setState((s) => ({ ...s, ...p }));
  return { state, set, patch, setState };
}
