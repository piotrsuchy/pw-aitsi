import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Allow the image optimizer to serve files from the local uploads directory.
    localPatterns: [
      { pathname: "/uploads/**" },
    ],
    // Allow external images from Google (user profile pictures).
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
