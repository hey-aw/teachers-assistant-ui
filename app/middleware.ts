import { NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';

export async function middleware(req) {
  const session = await getSession(req, NextResponse.next());

  if (!session || !session.user) {
    return NextResponse.redirect('/api/auth/login');
  }

  const { email, email_verified } = session.user;

  if (!email.endsWith('@eddolearning.com') || !email_verified) {
    return NextResponse.redirect('/not-found');
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/protected/:path*',
    '/api/protected/:path*',
  ],
};
