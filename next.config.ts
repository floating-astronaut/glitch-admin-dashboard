import type { NextConfig } from "next";
import { config } from "dotenv";

config();

// Kit's demo `assetPrefix` was pointed at the bundui showcase CDN
// (https://dashboard.shadcnuikit.com); removed in the v2 swap so
// assets resolve against our own deploy (dashboard.glitchexecutor.com).
//
// Static export — every route becomes a static HTML file shipped
// directly via Cloudflare Pages. No Workers, no 3 MiB cap. Build
// output goes to `out/`. AuthGuard runs entirely client-side; theme
// cookies are gone (handled by ActiveThemeProvider via localStorage).
// `images.unoptimized` is required because next/image's optimizer
// runs on Node and isn't available in static mode.
const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost"
      },
      {
        protocol: "https",
        hostname: "**"
      }
    ]
  }
};

export default nextConfig;
