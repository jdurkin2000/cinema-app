import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "image.tmdb.org",
        port: "",       // leave empty unless you need a non-standard port
        pathname: "/t/p/**", // match TMDb poster & backdrop paths
      }
    ],
  }
};

export default nextConfig;
