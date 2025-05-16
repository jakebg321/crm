import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    // Get the session
    const session = await getServerSession(authOptions);
    
    // Get request information
    const url = new URL(req.url);
    const searchParams = url.searchParams;
    const allParams = {};
    
    // Convert URLSearchParams to plain object
    searchParams.forEach((value, key) => {
      allParams[key] = value;
    });
    
    // Return useful debugging information
    return NextResponse.json({
      session: {
        exists: !!session,
        user: session?.user ? {
          id: session.user.id,
          email: session.user.email,
          role: session.user.role,
          // Omit sensitive information
        } : null
      },
      request: {
        method: req.method,
        url: req.url,
        pathname: url.pathname,
        searchParams: allParams,
        headers: {
          // Include a few important headers
          'content-type': req.headers.get('content-type'),
          'user-agent': req.headers.get('user-agent'),
          'referer': req.headers.get('referer'),
        }
      },
      timestamp: new Date().toISOString(),
      message: "Debug endpoint is functioning correctly"
    });
  } catch (error) {
    console.error('Error in debug endpoint:', error);
    return NextResponse.json({ 
      error: 'Debug endpoint encountered an error',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 