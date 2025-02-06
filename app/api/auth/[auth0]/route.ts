import { handleAuth } from '@auth0/nextjs-auth0';

export const GET = handleAuth();

export const config = {
  runtime: 'edge',
  env: {
    AUTH0_BASE_URL: process.env.AUTH0_BASE_URL,
  },
};
