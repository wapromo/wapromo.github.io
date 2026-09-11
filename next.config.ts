import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  ...(process.env.BUILD_TARGET === "pages" ? {
    output: "export" as const,
    images: { unoptimized: true },
  } : {}),
};

export default nextConfig;
