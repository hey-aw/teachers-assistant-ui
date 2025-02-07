/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  trailingSlash: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.auth0.com',
        pathname: '/avatar/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 's.gravatar.com',
        pathname: '/avatar/**',
      },
      {
        protocol: 'https',
        hostname: 'ui-avatars.com',
        pathname: '/api/**',
      }
    ],
  },
  // Exclude .swa paths from middleware processing
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: '/((?!.swa).*)',
          destination: '/$1',
        }
      ]
    }
  }
};

module.exports = nextConfig;