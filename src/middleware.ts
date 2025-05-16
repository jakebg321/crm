import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Paths that don't require authentication
const publicPaths = ['/home', '/login', '/auth/register', '/features', '/pricing', '/contact'];

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Check if the path is public
  const isPublicPath = publicPaths.some(publicPath => 
    path === publicPath || path.startsWith(`${publicPath}/`)
  );
  
  // Get the token
  const token = await getToken({ 
    req: request, 
    secret: process.env.NEXTAUTH_SECRET 
  });
  
  const isAuthenticated = !!token;
  
  // Redirect authenticated users away from public pages like login
  if (isAuthenticated && isPublicPath) {
    return NextResponse.redirect(new URL('/', request.url));
  }
  
  // Redirect unauthenticated users to home page for protected routes
  if (!isAuthenticated && !isPublicPath && path !== '/') {
    // Keep the original path in the URL to redirect back after login
    const url = new URL('/home', request.url);
    return NextResponse.redirect(url);
  }
  
  // Redirect root path for unauthenticated users to home page
  if (!isAuthenticated && path === '/') {
    return NextResponse.redirect(new URL('/home', request.url));
  }
  
  return NextResponse.next();
}

// Matching all routes except for API, static files, and public paths
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}; 