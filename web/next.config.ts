import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Allow the image optimizer to serve files from the local uploads directory.
    localPatterns: [
      { pathname: "/uploads/**" },
    ],
  },
};

export default nextConfig;
