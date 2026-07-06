import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export',
  basePath: '/my-community',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
