import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Turbopack configuration to fix workspace root detection
  turbopack: {
    root: ".",
  },
  
  // Configure image optimization for static export
  images: {
    unoptimized: true,
  },
  
  // Ensure trailing slashes for cleaner URLs
  trailingSlash: true,
};

export default nextConfig;
