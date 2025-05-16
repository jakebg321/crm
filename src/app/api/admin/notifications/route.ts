import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

// GET: Fetch notifications for admins
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin or manager
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, role: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (!['ADMIN', 'MANAGER'].includes(user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Get query parameters
    const lastCheckedParam = request.nextUrl.searchParams.get('lastChecked');
    const lastChecked = lastCheckedParam ? new Date(lastCheckedParam) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // Default to 7 days ago
    
    // Create and gather notifications
    const notifications = [];
    
    // 1. Get recent photo uploads
    const recentPhotos = await prisma.photo.findMany({
      where: {
        createdAt: { gt: lastChecked }
      },
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            assignedTo: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        uploader: {
          select: {
            id: true,
            name: true
          }
        }
      },
      take: 20
    });
    
    // Format photo notifications
    for (const photo of recentPhotos) {
      notifications.push({
        id: `photo-${photo.id}`,
        type: 'PHOTO_UPLOAD',
        title: 'New Photo Uploaded',
        message: `${photo.uploader.name} uploaded a ${photo.photoType.toLowerCase()} photo for "${photo.job.title}"`,
        timestamp: photo.createdAt,
        data: {
          photoId: photo.id,
          jobId: photo.job.id,
          photoType: photo.photoType,
          photoUrl: photo.url,
          staffId: photo.uploader.id,
          staffName: photo.uploader.name,
          jobTitle: photo.job.title
        },
        read: false
      });
    }
    
    // 2. You can add other notification types here (job status changes, new clients, etc.)
    
    // Sort all notifications by timestamp (newest first)
    notifications.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    return NextResponse.json({
      notifications,
      unreadCount: notifications.length,
      lastChecked: new Date()
    });
  } catch (error) {
    console.error('Error fetching admin notifications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
} 