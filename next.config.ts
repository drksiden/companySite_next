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
        protocol: 'https', // Cloudflare R2 обычно использует https
        hostname: 'pub-1e1504bc9c9d447f9ac06a9f65bbac2f.r2.dev',
        port: '', // Порт обычно не нужен для HTTPS и стандартных доменов
        pathname: '/**', // Разрешает любые пути на этом хосте
      },
    ],
    
  },
};

export default nextConfig;
