import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';

const prisma = new PrismaClient();

// GET /api/estimates/[id] - Get a specific estimate
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const estimate = await prisma.estimate.findUnique({
      where: { id: params.id },
      include: {
        client: true,
        lineItems: true,
        jobs: true,
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!estimate) {
      return NextResponse.json({ message: 'Estimate not found' }, { status: 404 });
    }

    return NextResponse.json(estimate);
  } catch (error) {
    console.error('Error fetching estimate:', error);
    return NextResponse.json(
      { message: 'Error fetching estimate' },
      { status: 500 }
    );
  }
}

// PUT /api/estimates/[id] - Update a specific estimate
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const data = await req.json();

    // First, verify the estimate exists
    const existingEstimate = await prisma.estimate.findUnique({
      where: { id: params.id },
      include: { lineItems: true },
    });

    if (!existingEstimate) {
      return NextResponse.json({ message: 'Estimate not found' }, { status: 404 });
    }

    // Update the estimate with line items
    const updatedEstimate = await prisma.$transaction(async (tx) => {
      // Delete all existing line items first
      await tx.lineItem.deleteMany({
        where: { estimateId: params.id },
      });

      // Then update the estimate
      return tx.estimate.update({
        where: { id: params.id },
        data: {
          title: data.title,
          description: data.description || '',
          status: data.status || existingEstimate.status,
          price: data.price || existingEstimate.price,
          validUntil: data.validUntil ? new Date(data.validUntil) : existingEstimate.validUntil,
          clientId: data.clientId || existingEstimate.clientId,
          lineItems: {
            create: data.lineItems?.map(item => ({
              description: item.description,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              total: item.quantity * item.unitPrice,
            })) || [],
          },
        },
        include: {
          lineItems: true,
          client: true,
        },
      });
    });

    return NextResponse.json(updatedEstimate);
  } catch (error) {
    console.error('Error updating estimate:', error);
    return NextResponse.json(
      { message: 'Error updating estimate' },
      { status: 500 }
    );
  }
}

// DELETE /api/estimates/[id] - Delete a specific estimate
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // First, verify the estimate exists
    const existingEstimate = await prisma.estimate.findUnique({
      where: { id: params.id },
    });

    if (!existingEstimate) {
      return NextResponse.json({ message: 'Estimate not found' }, { status: 404 });
    }

    // Delete the estimate (this will cascade delete line items)
    await prisma.$transaction(async (tx) => {
      // First delete all line items
      await tx.lineItem.deleteMany({
        where: { estimateId: params.id },
      });

      // Then delete the estimate
      await tx.estimate.delete({
        where: { id: params.id },
      });
    });

    return NextResponse.json({ message: 'Estimate deleted successfully' });
  } catch (error) {
    console.error('Error deleting estimate:', error);
    return NextResponse.json(
      { message: 'Error deleting estimate' },
      { status: 500 }
    );
  }
} 