import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Vercel handles output automatically — no need for "standalone"
  serverExternalPackages: ["docusign-esign", "@google-cloud/vision", "@google-cloud/bigquery"],
  transpilePackages: ["@pushingcap/integrations"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "drive.google.com" },
    ],
  },
};

export default nextConfig;
