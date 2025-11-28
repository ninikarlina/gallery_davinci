import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  staticPageGenerationTimeout: 60,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
