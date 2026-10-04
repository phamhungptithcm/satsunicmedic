import type { NextConfig } from "next";
const origin = process.env.API_ORIGIN ?? "http://127.0.0.1:4186";
const config: NextConfig = {
  output: "standalone",
  poweredByHeader: false,
  transpilePackages: ["@hs/contracts", "@hs/anatomy-viewer", "@hs/api-client"],
  async rewrites() {
    return [
      { source: "/api/v1/:path*", destination: `${origin}/api/v1/:path*` },
      { source: "/auth/:path*", destination: `${origin}/auth/:path*` },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Cache-Control", value: "private, no-store" },
        ],
      },
    ];
  },
};
export default config;
