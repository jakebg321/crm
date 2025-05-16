import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

// Redirect staff/jobs/[id]/notes API to the main schedule/[id]/notes API
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const jobId = params.id;
    const redirectUrl = `/api/schedule/${jobId}/notes`;
    
    // Log the redirection
    console.log(`Redirecting from /api/staff/jobs/${jobId}/notes to ${redirectUrl}`);
    
    // Redirect to the main schedule API
    return NextResponse.redirect(new URL(redirectUrl, request.url));
  } catch (error) {
    console.error('Error in staff/jobs/[id]/notes API redirect:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Redirect POST requests (adding notes) to the main schedule API
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const jobId = params.id;
    const redirectUrl = `/api/schedule/${jobId}/notes`;
    
    // Log the redirection
    console.log(`Redirecting POST from /api/staff/jobs/${jobId}/notes to ${redirectUrl}`);
    
    // Redirect to the main schedule API
    return NextResponse.redirect(new URL(redirectUrl, request.url));
  } catch (error) {
    console.error('Error in staff/jobs/[id]/notes POST redirect:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 