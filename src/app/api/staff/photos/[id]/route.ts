import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { unlink } from 'fs/promises';
import { join } from 'path';
import { ensureUploadsDir } from '@/lib/utils';

// DELETE: Remove a specific photo
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Ensure uploads directory exists
    ensureUploadsDir();
    
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find the photo
    const photo = await prisma.photo.findUnique({
      where: { id: params.id },
      include: {
        job: {
          select: {
            id: true,
            assignedToId: true,
          }
        }
      }
    });

    if (!photo) {
      return NextResponse.json({ error: 'Photo not found' }, { status: 404 });
    }

    // Check user permissions
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, role: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user is authorized to delete this photo
    const isPhotoUploader = photo.uploaderId === user.id;
    const isJobAssignee = photo.job.assignedToId === user.id;
    const isAdminOrManager = ['ADMIN', 'MANAGER'].includes(user.role);

    if (!isPhotoUploader && !isJobAssignee && !isAdminOrManager) {
      return NextResponse.json(
        { error: 'You are not authorized to delete this photo' },
        { status: 403 }
      );
    }

    // Delete the file from disk
    try {
      const filePath = join(process.cwd(), 'public', photo.url);
      await unlink(filePath);
    } catch (err) {
      console.error('Error deleting file from disk:', err);
      // Continue with DB deletion even if file deletion fails
    }

    // Delete the photo from the database
    await prisma.photo.delete({
      where: { id: params.id }
    });

    // Add a note about the deletion
    await prisma.note.create({
      data: {
        content: `Deleted a photo`,
        jobId: photo.jobId,
        createdById: session.user.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting photo:', error);
    return NextResponse.json(
      { error: 'Failed to delete photo' },
      { status: 500 }
    );
  }
} 