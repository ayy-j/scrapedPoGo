import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Restrict page extensions to .tsx/.ts so Next.js ignores
     the CommonJS scraper files under src/pages/ */
  pageExtensions: ["tsx", "ts"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pokemn.quest",
      },
      {
        protocol: "https",
        hostname: "btzr53b2kyiebsam.public.blob.vercel-storage.com",
      },
    ],
  },
};

export default nextConfig;
