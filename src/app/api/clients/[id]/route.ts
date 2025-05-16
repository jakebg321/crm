import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET /api/clients/[id] - Get a single client by ID
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const clientId = params.id;

    const client = await prisma.client.findUnique({
      where: { id: clientId },
      include: {
        jobs: true,
        estimates: true,
      },
    });

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    return NextResponse.json(client);
  } catch (error) {
    console.error('Error fetching client:', error);
    return NextResponse.json(
      { error: 'Failed to fetch client' },
      { status: 500 }
    );
  }
}

// PUT /api/clients/[id] - Update a client
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const clientId = params.id;
    const data = await request.json();

    // Update client
    const client = await prisma.client.update({
      where: { id: clientId },
      data,
    });

    return NextResponse.json(client);
  } catch (error) {
    console.error('Error updating client:', error);
    return NextResponse.json(
      { error: 'Failed to update client' },
      { status: 500 }
    );
  }
}

// DELETE /api/clients/[id] - Delete a client
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const clientId = params.id;

    // Check if client has related jobs or estimates - we'll use this for response metadata
    const clientWithRelations = await prisma.client.findUnique({
      where: { id: clientId },
      select: {
        name: true,
        _count: {
          select: {
            jobs: true,
            estimates: true,
          },
        },
      },
    });

    if (!clientWithRelations) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    // Get query parameter to check if cascade delete is requested
    const url = new URL(request.url);
    const cascade = url.searchParams.get('cascade') === 'true';

    // If not cascade and has relations, return error with counts
    if (!cascade && (clientWithRelations._count.jobs > 0 || clientWithRelations._count.estimates > 0)) {
      return NextResponse.json(
        {
          error: 'Cannot delete client with associated records',
          clientName: clientWithRelations.name,
          relations: {
            jobs: clientWithRelations._count.jobs,
            estimates: clientWithRelations._count.estimates,
          },
          requiresCascade: true,
        },
        { status: 400 }
      );
    }

    // If cascade delete is requested, delete all related entities in a transaction
    if (cascade) {
      // Perform cascading delete in a transaction for atomicity
      await prisma.$transaction(async (tx) => {
        // 1. Find all jobs associated with this client
        const jobs = await tx.job.findMany({
          where: { clientId },
          select: { id: true },
        });
        
        const jobIds = jobs.map(job => job.id);
        
        // 2. Delete all notes associated with these jobs
        if (jobIds.length > 0) {
          await tx.note.deleteMany({
            where: { jobId: { in: jobIds } },
          });
          
          // 3. Delete all photos associated with these jobs
          await tx.photo.deleteMany({
            where: { jobId: { in: jobIds } },
          });
        }
        
        // 4. Delete all jobs
        if (jobIds.length > 0) {
          await tx.job.deleteMany({
            where: { id: { in: jobIds } },
          });
        }
        
        // 5. Find all estimates associated with this client
        const estimates = await tx.estimate.findMany({
          where: { clientId },
          select: { id: true },
        });
        
        const estimateIds = estimates.map(est => est.id);
        
        // 6. Delete all line items associated with these estimates
        if (estimateIds.length > 0) {
          await tx.lineItem.deleteMany({
            where: { estimateId: { in: estimateIds } },
          });
          
          // 7. Delete all estimates
          await tx.estimate.deleteMany({
            where: { id: { in: estimateIds } },
          });
        }
        
        // 8. Finally delete the client
        await tx.client.delete({
          where: { id: clientId },
        });
      });
      
      return NextResponse.json({ 
        success: true,
        message: `Client and all related records deleted successfully`,
        deletedRelations: {
          jobs: clientWithRelations._count.jobs,
          estimates: clientWithRelations._count.estimates,
        }
      });
    }
    
    // Simple delete if no relations
    await prisma.client.delete({
      where: { id: clientId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting client:', error);
    return NextResponse.json(
      { error: 'Failed to delete client' },
      { status: 500 }
    );
  }
} 