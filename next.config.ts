import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Required for Cloudflare Workers
  experimental: {
    // Enable server actions
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
  // Image optimization - use Cloudflare Images or unoptimized
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
