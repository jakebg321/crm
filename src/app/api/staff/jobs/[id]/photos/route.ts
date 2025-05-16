import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { PhotoType } from '@prisma/client';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { ensureUploadsDir } from '@/lib/utils';

// GET: Fetch all photos for a specific job
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

    // Check user role and permissions
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, role: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Determine if user has admin/manager privileges
    const isAdminOrManager = ['ADMIN', 'MANAGER'].includes(user.role);

    // Fetch the job with photos
    const job = await prisma.job.findUnique({
      where: { id: params.id },
      include: {
        client: {
          select: {
            name: true,
          }
        },
        assignedTo: {
          select: {
            id: true,
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
        }
      }
    });

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    // Check if user is assigned to this job or is admin/manager
    const isAssigned = job.assignedToId === user.id;

    // Staff can only view their own assigned jobs, but admin/manager can view all
    if (!isAssigned && !isAdminOrManager) {
      return NextResponse.json(
        { error: 'You are not authorized to view photos for this job' },
        { status: 403 }
      );
    }

    return NextResponse.json(job);
  } catch (error) {
    console.error('Error fetching job photos:', error);
    return NextResponse.json(
      { error: 'Failed to fetch job photos' },
      { status: 500 }
    );
  }
}

// POST: Upload a new photo for a job
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

    // Check if job exists
    const job = await prisma.job.findUnique({
      where: { id: params.id },
      select: { id: true, assignedToId: true }
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
        { error: 'You are not authorized to add photos to this job' },
        { status: 403 }
      );
    }

    // Process the multipart form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }
    
    // Get other form fields
    const photoType = formData.get('photoType') as PhotoType || PhotoType.OTHER;
    const caption = formData.get('caption') as string || null;
    const dateStr = formData.get('date') as string || null;
    
    // Create a date object from the dateStr (default to now if not provided)
    let photoDate: Date;
    if (dateStr) {
      // Create a date object for the specified date, set to noon to avoid timezone issues
      photoDate = new Date(`${dateStr}T12:00:00`);
      
      // If the date is invalid, default to current date
      if (isNaN(photoDate.getTime())) {
        photoDate = new Date();
      }
    } else {
      photoDate = new Date();
    }
    
    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG and WebP images are allowed.' },
        { status: 400 }
      );
    }
    
    // Generate a unique filename
    const fileName = `${uuidv4()}-${file.name.replace(/\s/g, '_')}`;
    
    // Ensure uploads directory exists
    ensureUploadsDir();
    
    // Get the uploads directory path
    const uploadsDir = join(process.cwd(), 'public', 'uploads');
    
    // Save file to disk
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    const filePath = join(uploadsDir, fileName);
    await writeFile(filePath, buffer);
    
    // Save photo info to database
    const photo = await prisma.photo.create({
      data: {
        fileName,
        url: `/uploads/${fileName}`,
        caption,
        photoType,
        jobId: params.id,
        uploaderId: session.user.id,
        // Use the provided date for the createdAt timestamp
        createdAt: photoDate,
      },
    });
    
    // Add a note about the photo upload
    const photoTypeStr = photoType.charAt(0) + photoType.slice(1).toLowerCase();
    const dateFormatted = photoDate.toLocaleDateString();
    await prisma.note.create({
      data: {
        content: `Added a ${photoTypeStr} photo for ${dateFormatted}${caption ? `: "${caption}"` : ''}`,
        jobId: params.id,
        createdById: session.user.id,
      },
    });
    
    return NextResponse.json(photo);
  } catch (error) {
    console.error('Error uploading photo:', error);
    return NextResponse.json(
      { error: 'Failed to upload photo' },
      { status: 500 }
    );
  }
} 