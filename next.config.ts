import type { NextConfig } from "next";

const configuredApiBaseUrl =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000/api/v1";
const apiBaseUrl = /\/api\/v1\/?$/i.test(configuredApiBaseUrl)
  ? configuredApiBaseUrl
  : `${configuredApiBaseUrl.replace(/\/$/, "")}/api/v1`;

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${apiBaseUrl.replace(/\/$/, "")}/:path*`,
      },
    ];
  },
};

export default nextConfig;
