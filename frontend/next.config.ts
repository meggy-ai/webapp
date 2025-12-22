import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,

  // Disable file system warnings in WSL
  experimental: {
    // Remove invalid turbo configuration
  },
};

export default nextConfig;
