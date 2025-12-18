// next.config.ts
/** @type {import('next').NextConfig} */
const nextConfig = {
  // standalone output только для production
  ...(process.env.NODE_ENV === 'production' && { output: "standalone" }),
  // Разрешаем cross-origin запросы в dev режиме для работы по IP
  ...(process.env.NODE_ENV === 'development' && {
    allowedDevOrigins: ['192.168.31.235:3000', 'localhost:3000'],
  }),
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pub-1506276de6ac4a07aa6fe582457507c1.r2.dev",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "r2.asia-ntb.kz",
        pathname: "/**",
      },
    ],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  experimental: {
    optimizePackageImports: ["framer-motion"],
  },
  // Отключаем агрессивное кэширование для предотвращения проблем с устаревшим контентом
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
  // Игнорируем нативные модули winston-loki при сборке
  webpack: (config: any, { isServer }: { isServer: boolean }) => {
    if (!isServer) {
      // На клиенте игнорируем winston-loki и связанные нативные модули
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
      
      // Игнорируем winston-loki и snappy на клиенте
      config.resolve.alias = {
        ...config.resolve.alias,
        'winston-loki': false,
        'snappy': false,
        '@napi-rs/snappy': false,
      };
    }
    
    // Игнорируем нативные модули (.node файлы)
    config.module.rules.push({
      test: /\.node$/,
      use: 'ignore-loader',
    });
    
    // Игнорируем проблемные модули snappy
    config.module.rules.push({
      test: /node_modules[\\/]snappy[\\/]/,
      use: 'ignore-loader',
    });
    
    return config;
  },
};

module.exports = nextConfig;
