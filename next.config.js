/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 's.gravatar.com',
        pathname: '/avatar/**',
      }
    ],
    unoptimized: true,
  },
  // Disable server components since we're doing static export
  experimental: {
    appDir: true,
  }
};

module.exports = nextConfig;
