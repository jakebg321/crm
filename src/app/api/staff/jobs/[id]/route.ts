import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

// Redirect staff/jobs/[id] API to the main schedule/[id] API
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
    const redirectUrl = `/api/schedule/${jobId}`;
    
    // Log the redirection
    console.log(`Redirecting from /api/staff/jobs/${jobId} to ${redirectUrl}`);
    
    // Redirect to the main schedule API
    return NextResponse.redirect(new URL(redirectUrl, request.url));
  } catch (error) {
    console.error('Error in staff/jobs/[id] API redirect:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Redirect PUT requests (status updates) to the main schedule API
export async function PUT(
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
    const redirectUrl = `/api/schedule/${jobId}`;
    
    // Log the redirection
    console.log(`Redirecting PUT from /api/staff/jobs/${jobId} to ${redirectUrl}`);
    
    // Redirect to the main schedule API
    return NextResponse.redirect(new URL(redirectUrl, request.url));
  } catch (error) {
    console.error('Error in staff/jobs/[id] PUT redirect:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET_original(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if job exists
    const job = await prisma.job.findUnique({
      where: { id: params.id },
      include: {
        client: true,
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        notes: {
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    // Check if user is assigned to this job or is admin/manager
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, role: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const isAssigned = job.assignedToId === user.id;
    const isAdminOrManager = ['ADMIN', 'MANAGER'].includes(user.role);

    if (!isAssigned && !isAdminOrManager) {
      return NextResponse.json(
        { error: 'You are not authorized to view this job' },
        { status: 403 }
      );
    }

    return NextResponse.json(job);
  } catch (error) {
    console.error('Error fetching job details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch job details' },
      { status: 500 }
    );
  }
} 