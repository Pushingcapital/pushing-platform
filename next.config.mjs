/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',      // Static export → Cloudflare Pages
  trailingSlash: true,   // /security/ not /security
  images: { unoptimized: true },
};

export default nextConfig;
