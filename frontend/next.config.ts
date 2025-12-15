import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,

  // Turbopack configuration for WSL
  turbopack: {
    root: process.cwd(),
  },

  // Disable file system warnings in WSL
  experimental: {
    turbo: {
      resolveAlias: {},
    },
  },
};

export default nextConfig;
