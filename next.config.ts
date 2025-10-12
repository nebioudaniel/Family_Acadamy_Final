import type { NextConfig } from "next";

const nextConfig: NextConfig = {
   experimental: {
    serverActions: {
      bodySizeLimit: '3gb', // ✅ Allow up to 3 GB uploads
    },
  },
};

export default nextConfig;
