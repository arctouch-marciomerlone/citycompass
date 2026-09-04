import type { NextConfig } from "next";

const nextConfig = {
  typedRoutes: true,
  experimental: {
    typedEnv: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "us-west-2.graphassets.com",
        pathname: "/**",
      },
    ],
  },
} satisfies NextConfig;

export default nextConfig;
