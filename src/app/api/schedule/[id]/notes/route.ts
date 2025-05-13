import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

// GET /api/schedule/[id]/notes
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify the job exists and belongs to the user
    const job = await prisma.job.findFirst({
      where: {
        id: params.id,
        OR: [
          { createdById: session.user.id },
          { assignedToId: session.user.id }
        ]
      }
    });

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    const notes = await prisma.note.findMany({
      where: {
        jobId: params.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        createdBy: {
          select: {
            name: true
          }
        }
      }
    });

    return NextResponse.json(notes);
  } catch (error) {
    console.error('Error fetching notes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notes' },
      { status: 500 }
    );
  }
}

// POST /api/schedule/[id]/notes
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify the job exists and belongs to the user
    const job = await prisma.job.findFirst({
      where: {
        id: params.id,
        OR: [
          { createdById: session.user.id },
          { assignedToId: session.user.id }
        ]
      }
    });

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    const { content } = await request.json();
    if (!content) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    const note = await prisma.note.create({
      data: {
        content,
        jobId: params.id,
        createdById: session.user.id,
      },
      include: {
        createdBy: {
          select: {
            name: true
          }
        }
      }
    });

    return NextResponse.json(note);
  } catch (error) {
    console.error('Error creating note:', error);
    return NextResponse.json(
      { error: 'Failed to create note' },
      { status: 500 }
    );
  }
}

// PUT /api/schedule/[id]/notes/[noteId]
export async function PUT(
  request: Request,
  { params }: { params: { id: string; noteId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify the job exists and belongs to the user
    const job = await prisma.job.findFirst({
      where: {
        id: params.id,
        OR: [
          { createdById: session.user.id },
          { assignedToId: session.user.id }
        ]
      }
    });

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    const body = await request.json();
    const updateData: any = {};
    if (typeof body.completed === 'boolean') {
      updateData.completed = body.completed;
      updateData.completedAt = body.completed ? new Date() : null;
    }
    if (typeof body.content === 'string' && body.content.trim() !== '') {
      updateData.content = body.content.trim();
    }
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    const note = await prisma.note.update({
      where: {
        id: params.noteId,
        jobId: params.id,
      },
      data: updateData,
      include: {
        createdBy: {
          select: {
            name: true
          }
        }
      }
    });

    return NextResponse.json(note);
  } catch (error) {
    console.error('Error updating note:', error);
    return NextResponse.json(
      { error: 'Failed to update note' },
      { status: 500 }
    );
  }
}

// DELETE /api/schedule/[id]/notes/[noteId]
export async function DELETE(
  request: Request,
  { params }: { params: { id: string; noteId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify the job exists and belongs to the user
    const job = await prisma.job.findFirst({
      where: {
        id: params.id,
        OR: [
          { createdById: session.user.id },
          { assignedToId: session.user.id }
        ]
      }
    });

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    await prisma.note.delete({
      where: {
        id: params.noteId,
        jobId: params.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting note:', error);
    return NextResponse.json(
      { error: 'Failed to delete note' },
      { status: 500 }
    );
  }
} 