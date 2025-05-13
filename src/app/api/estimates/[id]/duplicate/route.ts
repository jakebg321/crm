import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]/route';

const prisma = new PrismaClient();

// POST /api/estimates/[id]/duplicate - Duplicate an estimate
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Find the original estimate with line items
    const originalEstimate = await prisma.estimate.findUnique({
      where: { id: params.id },
      include: { lineItems: true },
    });

    if (!originalEstimate) {
      return NextResponse.json({ message: 'Estimate not found' }, { status: 404 });
    }

    // Create a new estimate with copied data
    const newEstimate = await prisma.estimate.create({
      data: {
        title: `Copy of ${originalEstimate.title}`,
        description: originalEstimate.description,
        status: 'DRAFT', // Always start as draft
        price: originalEstimate.price,
        validUntil: new Date(new Date().setMonth(new Date().getMonth() + 1)), // Default 30 days from now
        clientId: originalEstimate.clientId,
        createdById: session.user.id,
        lineItems: {
          create: originalEstimate.lineItems.map(item => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.quantity * item.unitPrice,
          })),
        },
      },
      include: {
        lineItems: true,
        client: true,
      },
    });

    return NextResponse.json(newEstimate, { status: 201 });
  } catch (error) {
    console.error('Error duplicating estimate:', error);
    return NextResponse.json(
      { message: 'Error duplicating estimate' },
      { status: 500 }
    );
  }
} 