import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// POST /api/photos - Upload a new photo
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await req.json();
    const { url, fileName, caption, photoType, jobId } = data;

    if (!url || !fileName || !jobId) {
      return NextResponse.json({ error: 'Required fields missing' }, { status: 400 });
    }

    // Verify job exists
    const job = await prisma.job.findUnique({
      where: { id: jobId }
    });

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    const photo = await prisma.photo.create({
      data: {
        url,
        fileName,
        caption,
        photoType: photoType || 'OTHER',
        jobId,
        uploaderId: session.user.id,
      }
    });

    return NextResponse.json(photo, { status: 201 });
  } catch (error) {
    console.error('Error uploading photo:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET /api/photos - Get all photos
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(req.url);
    const jobId = url.searchParams.get('jobId');

    let photos;
    if (jobId) {
      photos = await prisma.photo.findMany({
        where: { jobId },
        orderBy: { createdAt: 'desc' },
        include: {
          uploader: {
            select: {
              id: true,
              name: true,
            }
          }
        }
      });
    } else {
      photos = await prisma.photo.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
          uploader: {
            select: {
              id: true,
              name: true,
            }
          },
          job: {
            select: {
              id: true,
              title: true,
            }
          }
        }
      });
    }

    return NextResponse.json(photos);
  } catch (error) {
    console.error('Error fetching photos:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 