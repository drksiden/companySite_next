import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '9000',
        pathname: '/static/**',
      },
      {
        protocol: 'https',
        hostname: 'pub-1506276de6ac4a07aa6fe582457507c1.r2.dev',
        port: '',
        pathname: '/**',
      },
    ],
    
  },
};

export default nextConfig;
