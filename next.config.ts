import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ['your-medusa-backend-url', 'localhost:3000'], // Замените на ваш домен Medusa
  },
};

export default nextConfig;
