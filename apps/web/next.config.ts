import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: [
    '@imprint/schemas',
    '@imprint/impact-engine',
    '@imprint/provider-adapters',
  ],
};

export default nextConfig;
