import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

// GET: Fetch jobs with photos based on user role
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check user role
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, role: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const hasPhotos = searchParams.get('hasPhotos');
    
    // Build the filter based on user role and params
    let jobsFilter: any = {};
    
    // STAFF can only see their assigned jobs
    // ADMIN and MANAGER can see all jobs
    if (user.role === 'STAFF') {
      jobsFilter.assignedToId = session.user.id;
    }
    
    // Filter by jobs with photos if requested
    if (hasPhotos === 'true') {
      jobsFilter.photos = {
        some: {}
      };
    } else if (hasPhotos === 'false') {
      jobsFilter.photos = {
        none: {}
      };
    }

    // Fetch jobs with photos
    const jobs = await prisma.job.findMany({
      where: jobsFilter,
      select: {
        id: true,
        title: true,
        status: true,
        startDate: true,
        client: {
          select: {
            name: true,
          }
        },
        photos: {
          orderBy: {
            createdAt: 'desc',
          },
          include: {
            uploader: {
              select: {
                name: true,
              }
            }
          }
        },
        // Include assignedTo to show who the job is assigned to (useful for admins)
        assignedTo: user.role !== 'STAFF' ? {
          select: {
            id: true,
            name: true,
          }
        } : undefined
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    return NextResponse.json(jobs);
  } catch (error) {
    console.error('Error fetching jobs with photos:', error);
    return NextResponse.json(
      { error: 'Failed to fetch job photos' },
      { status: 500 }
    );
  }
} 