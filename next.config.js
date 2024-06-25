/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'tremendous-panda-612.convex.cloud',
      },
    ],
  },
};
