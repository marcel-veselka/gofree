import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  transpilePackages: [
    '@gofree/api',
    '@gofree/auth',
    '@gofree/core',
    '@gofree/db',
    '@gofree/ui',
    '@gofree/ai',
    '@gofree/realtime',
  ],
  serverExternalPackages: ['@prisma/client', '.prisma/client'],
};

export default nextConfig;
