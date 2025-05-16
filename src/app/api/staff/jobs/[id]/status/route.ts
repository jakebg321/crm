import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { JobStatus } from '@prisma/client';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get request body
    const body = await request.json();
    const { status } = body;

    // Validate status is a valid JobStatus
    if (!status || !Object.values(JobStatus).includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status value' },
        { status: 400 }
      );
    }

    // Check if job exists
    const job = await prisma.job.findUnique({
      where: { id: params.id },
      include: { assignedTo: true }
    });

    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
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
        { error: 'You are not authorized to update this job' },
        { status: 403 }
      );
    }

    // Prepare update data
    const updateData: any = {
      status,
    };

    // If completing a job, record completion time
    if (status === JobStatus.COMPLETED && job.status !== JobStatus.COMPLETED) {
      updateData.completedAt = new Date();
    }

    // Update job status
    const updatedJob = await prisma.job.update({
      where: { id: params.id },
      data: updateData,
      include: {
        client: true,
        assignedTo: true,
      },
    });

    // Add a note about the status change
    await prisma.note.create({
      data: {
        content: `Status updated to ${status.replace('_', ' ')}`,
        jobId: params.id,
        createdById: session.user.id,
      },
    });

    return NextResponse.json(updatedJob);
  } catch (error) {
    console.error('Error updating job status:', error);
    return NextResponse.json(
      { error: 'Failed to update job status' },
      { status: 500 }
    );
  }
} 