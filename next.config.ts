import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  turbopack: {
    // ensure Turbopack uses this folder as root when other lockfiles exist
    root: __dirname,
  },
};

export default nextConfig;
