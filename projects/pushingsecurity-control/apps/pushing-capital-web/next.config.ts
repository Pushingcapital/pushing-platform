import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  serverExternalPackages: ["docusign-esign"],
  transpilePackages: ["@pushingcap/integrations"],
};

export default nextConfig;
