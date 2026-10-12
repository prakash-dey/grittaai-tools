"use client";

import { useTransition } from "react";
import { deleteDocument } from "./actions";

export function DeleteDocumentButton({ id }: { id: string }) {
  const [pending, start] = useTransition();
  return (
    <button
      disabled={pending}
      onClick={() => {
        if (confirm("Delete this document from history? The PDF can no longer be downloaded from here.")) start(() => deleteDocument(id));
      }}
      className="text-sm text-red-600 hover:underline disabled:opacity-50"
    >
      {pending ? "Deleting..." : "Delete from history"}
    </button>
  );
}
