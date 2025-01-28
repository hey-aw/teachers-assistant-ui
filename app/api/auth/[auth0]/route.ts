import { handleAuth } from '@auth0/nextjs-auth0';
import { NextRequest } from 'next/server';

export const GET = handleAuth();

// Handle POST requests if needed
export { GET as POST }; 
