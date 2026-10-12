import path from "node:path";
import { Font } from "@react-pdf/renderer";

export const COLORS = {
  brand: "#2E7A9E",
  brandLight: "#EAF4F8",
  dark: "#1F2937",
  grey: "#6B7280",
  line: "#D1D5DB",
  rowAlt: "#F7FAFC",
  labelBg: "#EEF2F6",
  green: "#1E8E5A",
  amber: "#B45309",
  white: "#FFFFFF",
};

export const ASSETS_DIR = path.join(process.cwd(), "src", "pdf", "assets");
export const LOGO_PATH = path.join(ASSETS_DIR, "logo.png");

let registered = false;

/** Carlito is metric-compatible with Calibri, so documents look the same as the earlier Word versions. */
export function registerFonts() {
  if (registered) return;
  const f = (file: string) => path.join(ASSETS_DIR, "fonts", file);
  Font.register({
    family: "Carlito",
    fonts: [
      { src: f("Carlito-Regular.ttf") },
      { src: f("Carlito-Bold.ttf"), fontWeight: "bold" },
      { src: f("Carlito-Italic.ttf"), fontStyle: "italic" },
      { src: f("Carlito-BoldItalic.ttf"), fontWeight: "bold", fontStyle: "italic" },
    ],
  });
  // Never split words across lines with hyphens.
  Font.registerHyphenationCallback((word) => [word]);
  registered = true;
}

export const FONT = "Carlito";
