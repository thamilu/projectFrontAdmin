import type { NextConfig } from "next";

const backendOrigin =
  process.env.BACKEND_API_URL ||
  process.env.INTERNAL_API_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://localhost:8082";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: `${backendOrigin.replace(/\/$/, "")}/api/v1/:path*`,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**", // Permissive for admin to handle various R2 domains initially
      }
    ]
  }
};

export default nextConfig;
