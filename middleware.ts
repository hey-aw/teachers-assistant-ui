export const config = {
  matcher: [
    // Add routes that require authentication
    '/protected/:path*',
    '/api/protected/:path*',
  ],
};
