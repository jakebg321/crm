import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET /api/schedule/[id] - Get a specific job
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id || !session.user.companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Looking for job ID:', params.id);
    console.log('Current user ID:', session.user.id);
    console.log('User company ID:', session.user.companyId);

    // Build query based on role
    const whereCondition: any = { 
      id: params.id,
      companyId: session.user.companyId // Always filter by company ID
    };
    
    // For STAFF role, they can only see jobs they created or are assigned to
    if (session.user.role === 'STAFF') {
      whereCondition.OR = [
        { createdById: session.user.id },
        { assignedToId: session.user.id }
      ];
    }
    // For ADMIN and MANAGER, they can see all jobs in their company (already filtered by companyId)

    const job = await prisma.job.findFirst({
      where: whereCondition,
      include: {
        client: true,
        assignedTo: true,
        createdBy: true,
        notes: {
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!job) {
      return NextResponse.json({ error: 'Job not found or you do not have permission to view it' }, { status: 404 });
    }

    return NextResponse.json(job);
  } catch (error) {
    console.error('Error fetching job:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PUT /api/schedule/[id] - Update a job
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id || !session.user.companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // First verify the job exists and belongs to this company
    const existingJob = await prisma.job.findFirst({
      where: { 
        id: params.id,
        companyId: session.user.companyId
      },
    });

    if (!existingJob) {
      return NextResponse.json({ error: 'Job not found or you do not have permission to modify it' }, { status: 404 });
    }

    // For STAFF role, they can only update jobs they created or are assigned to
    if (session.user.role === 'STAFF') {
      if (existingJob.createdById !== session.user.id && existingJob.assignedToId !== session.user.id) {
        return NextResponse.json({ error: 'You do not have permission to update this job' }, { status: 403 });
      }
    }

    const body = await request.json();
    const {
      title,
      description,
      type,
      status,
      startDate,
      endDate,
      price,
      clientId,
      assignedToId,
    } = body;

    // If clientId is provided, verify it belongs to this company
    if (clientId) {
      const client = await prisma.client.findFirst({
        where: { id: clientId, companyId: session.user.companyId },
      });
      if (!client) {
        return NextResponse.json({ error: 'Client not found or does not belong to your company' }, { status: 400 });
      }
    }

    // If assignedToId is provided, verify user belongs to this company
    if (assignedToId) {
      const assignedUser = await prisma.user.findFirst({
        where: { id: assignedToId, companyId: session.user.companyId },
      });
      if (!assignedUser) {
        return NextResponse.json({ error: 'Assigned user not found or does not belong to your company' }, { status: 400 });
      }
    }

    const job = await prisma.job.update({
      where: { id: params.id },
      data: {
        title,
        description,
        type,
        status,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        price,
        clientId,
        assignedToId,
      },
      include: {
        client: true,
        assignedTo: true,
      },
    });

    return NextResponse.json(job);
  } catch (error) {
    console.error('Error updating job:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE /api/schedule/[id] - Delete a job
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id || !session.user.companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // First verify the job exists and belongs to this company
    const existingJob = await prisma.job.findFirst({
      where: { 
        id: params.id,
        companyId: session.user.companyId
      },
    });

    if (!existingJob) {
      return NextResponse.json({ error: 'Job not found or you do not have permission to delete it' }, { status: 404 });
    }

    // Only ADMIN, MANAGER, or the job creator can delete jobs
    if (session.user.role === 'STAFF' && existingJob.createdById !== session.user.id) {
      return NextResponse.json({ error: 'You do not have permission to delete this job' }, { status: 403 });
    }

    await prisma.job.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Job deleted successfully' });
  } catch (error) {
    console.error('Error deleting job:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 