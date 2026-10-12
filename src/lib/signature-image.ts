/**
 * Browser-side cleanup for an uploaded signature photo or scan:
 * removes the paper background, deepens the ink, crops to the signature, and returns a PNG data URL.
 */
export async function processSignature(file: File, opts: { threshold?: number } = {}): Promise<string> {
  const threshold = opts.threshold ?? 0.72; // 0..1 brightness above which a pixel counts as paper
  const bitmap = await createImageBitmap(file);
  const maxW = 1400;
  const scale = Math.min(1, maxW / bitmap.width);
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
  ctx.drawImage(bitmap, 0, 0, w, h);
  const img = ctx.getImageData(0, 0, w, h);
  const d = img.data;

  // Estimate paper brightness from the brightest pixels so shadows and grey paper are handled.
  const lums = new Float32Array(w * h);
  for (let i = 0, p = 0; i < d.length; i += 4, p++) {
    const a = d[i + 3] / 255;
    lums[p] = a === 0 ? 1 : (0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]) / 255;
  }
  const sorted = Array.from(lums).sort((x, y) => x - y);
  const paper = sorted[Math.floor(sorted.length * 0.9)] || 1;
  const cut = paper * threshold;
  const soft = paper * 0.12;

  let minX = w, minY = h, maxX = -1, maxY = -1;
  for (let p = 0, i = 0; p < lums.length; p++, i += 4) {
    const l = lums[p];
    // Alpha ramps from opaque (dark ink) to transparent (paper) for smooth edges.
    let alpha = l <= cut - soft ? 1 : l >= cut ? 0 : (cut - l) / soft;
    alpha *= d[i + 3] / 255;
    if (alpha < 0.08) {
      d[i + 3] = 0;
      continue;
    }
    // Darken the ink a little so faint pen strokes still print clearly.
    d[i] = Math.round(d[i] * 0.55);
    d[i + 1] = Math.round(d[i + 1] * 0.55);
    d[i + 2] = Math.round(d[i + 2] * 0.65);
    d[i + 3] = Math.round(alpha * 255);
    const x = p % w, y = (p / w) | 0;
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }
  if (maxX < 0) throw new Error("Could not find a signature in that image. Try a clearer photo on white paper.");
  ctx.putImageData(img, 0, 0);

  const pad = 8;
  const cx = Math.max(0, minX - pad), cy = Math.max(0, minY - pad);
  const cw = Math.min(w, maxX + pad) - cx, ch = Math.min(h, maxY + pad) - cy;

  // Store at a fixed height that prints sharply but keeps the file small.
  const outH = Math.min(240, ch);
  const outW = Math.round((cw / ch) * outH);
  const out = document.createElement("canvas");
  out.width = outW;
  out.height = outH;
  out.getContext("2d")!.drawImage(canvas, cx, cy, cw, ch, 0, 0, outW, outH);
  return out.toDataURL("image/png");
}
