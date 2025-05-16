import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// DELETE /api/photos/[id]
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const photoId = params.id;
    
    // First check if the photo exists
    const photo = await prisma.photo.findUnique({
      where: { id: photoId },
    });

    if (!photo) {
      return NextResponse.json({ error: 'Photo not found' }, { status: 404 });
    }

    // Delete the photo
    await prisma.photo.delete({
      where: { id: photoId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting photo:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET /api/photos/[id]
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const photoId = params.id;
    
    const photo = await prisma.photo.findUnique({
      where: { id: photoId },
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

    if (!photo) {
      return NextResponse.json({ error: 'Photo not found' }, { status: 404 });
    }

    return NextResponse.json(photo);
  } catch (error) {
    console.error('Error fetching photo:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 