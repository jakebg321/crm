import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Redirect staff/jobs API to the main schedule API
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the search parameters
    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    
    // Build the redirect URL to the main schedule API
    let redirectUrl = '/api/schedule';
    const params = new URLSearchParams();
    
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    // Add employeeId parameter to filter for the current user if they are staff
    if (session.user.role === 'STAFF') {
      params.append('employeeId', session.user.id);
    }
    
    // Append params if there are any
    if (params.toString()) {
      redirectUrl += `?${params.toString()}`;
    }
    
    // Log the redirection
    console.log(`Redirecting from /api/staff/jobs to ${redirectUrl}`);
    
    // Redirect to the main schedule API
    return NextResponse.redirect(new URL(redirectUrl, request.url));
  } catch (error) {
    console.error('Error in staff/jobs API redirect:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 