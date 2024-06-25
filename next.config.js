/** @type {import('next').NextConfig} */
const nextConfig = {
  images: { 
    remotePatterns: [ 
      {
        hostname: 'tremendous-panda-612.convex.site',
      }, 
   {
        hostname: 'spotted-swordfish-236.convex.site',
      }, 
    ],
  }, 
};

module.exports = nextConfig;
