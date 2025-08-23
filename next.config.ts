// next.config.ts
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pub-1506276de6ac4a07aa6fe582457507c1.r2.dev",
        pathname: "/**",
      },
    ],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  experimental: {
    optimizePackageImports: ["framer-motion"],
  },
};

module.exports = nextConfig;
