import type { NextConfig } from "next";
import { config } from "dotenv";

config();

// Kit's demo `assetPrefix` was pointed at the bundui showcase CDN
// (https://dashboard.shadcnuikit.com); removed in the v2 swap so
// assets resolve against our own deploy (dashboard.glitchexecutor.com).
const nextConfig: NextConfig = {
  images: {
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
