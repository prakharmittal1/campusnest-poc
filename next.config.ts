import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  images: {
    // Demo photos are served from Unsplash.
    remotePatterns: [{ protocol: "https", hostname: "images.unsplash.com" }],
  },
};

// Loads i18n/request.ts, which picks the UI language for each request.
const withNextIntl = createNextIntlPlugin();

export default withNextIntl(nextConfig);
