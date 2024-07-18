/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        hostname: 'portfolioshub.com',
      },
      {
        hostname: 'tremendous-panda-612.convex.site',
      },
      {
        hostname: 'spotted-swordfish-236.convex.site',
      },
    ],
  },
  transpilePackages: ['next-mdx-remote'],
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
};

module.exports = nextConfig;
