/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
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
      }
    ],
  },
  env: {
    NEXT_PUBLIC_LANGGRAPH_ASSISTANT_ID: process.env.NEXT_PUBLIC_LANGGRAPH_ASSISTANT_ID,
    LANGRAPH_API_URL: process.env.LANGRAPH_API_URL,
    LANGSMITH_API_KEY: process.env.LANGSMITH_API_KEY,
    LANGCHAIN_API_KEY: process.env.LANGSMITH_API_KEY,
    AUTH0_SECRET: process.env.AUTH0_SECRET,
    AUTH0_ISSUER_BASE_URL: process.env.AUTH0_ISSUER_BASE_URL,
    AUTH0_CLIENT_ID: process.env.AUTH0_CLIENT_ID,
    AUTH0_CLIENT_SECRET: process.env.AUTH0_CLIENT_SECRET,
    AUTH0_AUDIENCE: process.env.AUTH0_AUDIENCE,
    AUTH0_SCOPE: process.env.AUTH0_SCOPE,
  },
};

module.exports = nextConfig; 