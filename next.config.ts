import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.deviantart.net' },
      { protocol: 'https', hostname: '**.wixmp.com' }
    ]
  }
};

export default nextConfig;