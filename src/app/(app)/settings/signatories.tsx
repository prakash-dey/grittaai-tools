"use client";

import { useRef, useState, useTransition } from "react";
import { Button, Card, TextInput, Toggle } from "@/components/form";
import { IconAlert, IconPlus, IconTrash } from "@/components/icons";
import { processSignature } from "@/lib/signature-image";
import { createSignatory, deleteSignatory, setSignature, updateSignatory } from "./actions";

type Person = { id: string; name: string; title: string; signature: string | null; active: boolean };

function SignatoryCard({ person }: { person: Person }) {
  const [name, setName] = useState(person.name);
  const [title, setTitle] = useState(person.title);
  const [active, setActive] = useState(person.active);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const dirty = name !== person.name || title !== person.title || active !== person.active;

  async function onFile(file: File | undefined) {
    if (!file) return;
    setError(null);
    try {
      setDraft(await processSignature(file));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div className="rounded-xl border border-line p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <TextInput value={name} onChange={setName} placeholder="Full name" />
        <TextInput value={title} onChange={setTitle} placeholder="Title, e.g. Co-Founder & CEO" />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
        <div>
          <p className="mb-1.5 text-[13px] font-medium">Signature</p>
          <div className="flex h-24 items-center justify-center rounded-lg border border-dashed border-line bg-[repeating-linear-gradient(45deg,#fafafa,#fafafa_8px,#f3f4f6_8px,#f3f4f6_16px)]">
            {draft || person.signature ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={draft ?? person.signature!} alt={`${person.name} signature`} className="max-h-20 max-w-[90%] object-contain" />
            ) : (
              <span className="flex items-center gap-1.5 text-xs text-amber-700">
                <IconAlert className="h-4 w-4" /> No signature uploaded
              </span>
            )}
          </div>
          {draft ? (
            <div className="mt-2 flex items-center gap-2">
              <span className="text-xs text-muted">Background removed. Does this look right?</span>
              <Button
                className="ml-auto"
                disabled={pending}
                onClick={() =>
                  start(async () => {
                    await setSignature(person.id, draft);
                    setDraft(null);
                  })
                }
              >
                Use this signature
              </Button>
              <Button variant="secondary" onClick={() => setDraft(null)}>
                Cancel
              </Button>
            </div>
          ) : null}
          {error ? <p className="mt-2 text-xs text-red-600">{error}</p> : null}
        </div>
        <div className="flex flex-col gap-2">
          <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
          <Button variant="secondary" onClick={() => fileRef.current?.click()}>
            {person.signature ? "Replace signature" : "Upload signature"}
          </Button>
          {person.signature && !draft ? (
            <Button variant="ghost" disabled={pending} onClick={() => start(() => setSignature(person.id, null))}>
              Remove signature
            </Button>
          ) : null}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-line pt-3">
        <Toggle checked={active} onChange={setActive} label="Available to sign" />
        <div className="ml-auto flex gap-2">
          <Button
            variant="danger"
            disabled={pending}
            onClick={() => {
              if (confirm(`Remove ${person.name}? Documents already issued are not affected.`)) start(() => deleteSignatory(person.id));
            }}
          >
            <IconTrash className="h-4 w-4" />
          </Button>
          {dirty ? (
            <Button disabled={pending || !name.trim() || !title.trim()} onClick={() => start(() => updateSignatory(person.id, { name, title, active }))}>
              Save changes
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function SignatoriesManager({ people }: { people: Person[] }) {
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [pending, start] = useTransition();

  return (
    <Card
      title="Signatories"
      description="Upload a photo or scan of each signature on white paper. The background is removed automatically."
      actions={
        <Button variant="secondary" onClick={() => setAdding(true)}>
          <IconPlus className="h-4 w-4" /> Add signatory
        </Button>
      }
    >
      {adding ? (
        <div className="space-y-3 rounded-xl border border-brand/40 bg-brand-50/40 p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <TextInput value={name} onChange={setName} placeholder="Full name" autoFocus />
            <TextInput value={title} onChange={setTitle} placeholder="Title, e.g. Co-Founder & CEO" />
          </div>
          <div className="flex gap-2">
            <Button
              disabled={pending || !name.trim() || !title.trim()}
              onClick={() =>
                start(async () => {
                  await createSignatory({ name, title });
                  setName("");
                  setTitle("");
                  setAdding(false);
                })
              }
            >
              Add
            </Button>
            <Button variant="ghost" onClick={() => setAdding(false)}>
              Cancel
            </Button>
          </div>
        </div>
      ) : null}
      {people.map((p) => (
        <SignatoryCard key={`${p.id}:${p.name}:${p.title}:${p.active}`} person={p} />
      ))}
      {people.length === 0 && !adding ? <p className="text-sm text-muted">No signatories yet.</p> : null}
    </Card>
  );
}
