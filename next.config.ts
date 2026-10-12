import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // React-PDF and libSQL run on the server only and must not be bundled.
  serverExternalPackages: ["@react-pdf/renderer", "@libsql/client", "libsql"],
  // Make sure the font and logo files used by the PDF engine ship with the server build.
  // Signature images are sent to a server action as PNG data URLs.
  experimental: { serverActions: { bodySizeLimit: "2mb" } },
  outputFileTracingIncludes: {
    "/api/**/*": ["./src/pdf/assets/**/*"],
  },
};

export default nextConfig;
