import type { NextConfig } from 'next';
import { auth } from '@db/convex/auth';

const nextConfig: NextConfig = {
  transpilePackages: ['@ui', '@db'],
  env: {
    NEXT_PUBLIC_CONVEX_URL: process.env.NEXT_PUBLIC_CONVEX_URL || 'http://localhost:3000',
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
};

export default nextConfig;
