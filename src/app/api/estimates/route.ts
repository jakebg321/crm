import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';

const prisma = new PrismaClient();

// GET /api/estimates - Get all estimates
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const estimates = await prisma.estimate.findMany({
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        lineItems: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(estimates);
  } catch (error) {
    console.error('Error fetching estimates:', error);
    return NextResponse.json(
      { message: 'Error fetching estimates' },
      { status: 500 }
    );
  }
}

// POST /api/estimates - Create a new estimate
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const data = await req.json();
    
    // Validate required fields
    if (!data.title || !data.clientId || !data.validUntil) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create the estimate with lineItems
    const estimate = await prisma.estimate.create({
      data: {
        title: data.title,
        description: data.description || '',
        status: 'DRAFT',
        price: data.price || 0,
        validUntil: new Date(data.validUntil),
        clientId: data.clientId,
        createdById: session.user.id,
        lineItems: {
          create: data.lineItems.map(item => ({
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

    return NextResponse.json(estimate, { status: 201 });
  } catch (error) {
    console.error('Error creating estimate:', error);
    return NextResponse.json(
      { message: 'Error creating estimate' },
      { status: 500 }
    );
  }
} 