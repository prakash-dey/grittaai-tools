"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Renders every page of a PDF to canvases with pdf.js.
 * Works the same in all browsers, including mobile ones that cannot show PDFs inline.
 */
export function PdfPreview({ data, src }: { data?: Blob | null; src?: string }) {
  const container = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const el = container.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setWidth(Math.floor(entry.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (!width || (!data && !src)) return;
    let cancelled = false;
    (async () => {
      try {
        const pdfjs = await import("pdfjs-dist");
        pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
        const bytes = data ? new Uint8Array(await data.arrayBuffer()) : new Uint8Array(await (await fetch(src!)).arrayBuffer());
        const pdf = await pdfjs.getDocument({ data: bytes }).promise;
        const pageWidth = Math.min(width - 32, 820);
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const canvases: HTMLCanvasElement[] = [];
        for (let n = 1; n <= pdf.numPages; n++) {
          const page = await pdf.getPage(n);
          const base = page.getViewport({ scale: 1 });
          const viewport = page.getViewport({ scale: (pageWidth / base.width) * dpr });
          const canvas = document.createElement("canvas");
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          canvas.style.width = `${pageWidth}px`;
          canvas.className = "mx-auto mb-4 block bg-white shadow-md";
          await page.render({ canvasContext: canvas.getContext("2d")!, viewport }).promise;
          canvases.push(canvas);
          if (cancelled) return;
        }
        if (cancelled || !container.current) return;
        // Swap all pages at once so the preview never flickers while re-rendering.
        const holder = container.current.querySelector("[data-pages]")!;
        holder.replaceChildren(...canvases);
        setError(null);
        await pdf.destroy();
      } catch (e) {
        if (!cancelled) setError((e as Error).message || "Could not display the preview");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [data, src, width]);

  return (
    <div ref={container} className="h-full w-full overflow-y-auto px-4 py-4">
      {error ? <p className="p-4 text-sm text-red-600">{error}</p> : null}
      <div data-pages />
    </div>
  );
}
