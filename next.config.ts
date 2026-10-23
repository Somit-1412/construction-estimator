import type { NextConfig } from "next";

const noCacheHeaders = [
  { key: "Cache-Control", value: "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0" },
  { key: "Pragma", value: "no-cache" },
  { key: "Expires", value: "0" },
  { key: "Surrogate-Control", value: "no-store" },
];

const nextConfig: NextConfig = {
  /* config options here */
  output: "standalone",
  allowedDevOrigins: ['*.trycloudflare.com'],
  async redirects() {
    return [
      { source: "/terms-and-conditions", destination: "/terms", permanent: true },
      { source: "/privacy-policy", destination: "/privacy", permanent: true },
      { source: "/cancellation-refund", destination: "/refund-policy", permanent: true },
      { source: "/refund", destination: "/refund-policy", permanent: true },
      { source: "/contact-us", destination: "/contact", permanent: true },
    ];
  },
  async headers() {
    return [
      {
        source: "/customer/:path*",
        headers: noCacheHeaders,
      },
      {
        source: "/customer",
        headers: noCacheHeaders,
      },
      {
        source: "/engineer/:path*",
        headers: noCacheHeaders,
      },
      {
        source: "/engineer",
        headers: noCacheHeaders,
      },
      {
        source: "/submit/:path*",
        headers: noCacheHeaders,
      },
      {
        source: "/submit",
        headers: noCacheHeaders,
      },
      {
        source: "/api/:path*",
        headers: noCacheHeaders,
      },
    ];
  },
};

export default nextConfig;
