import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Demo photos are served from Unsplash.
    remotePatterns: [{ protocol: "https", hostname: "images.unsplash.com" }],
  },
};

export default nextConfig;
