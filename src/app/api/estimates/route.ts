import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

// GET /api/estimates - Get all estimates
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || !session.user.companyId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const estimates = await prisma.estimate.findMany({
      where: {
        company: {
          id: session.user.companyId
        }
      },
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
    
    if (!session || !session.user || !session.user.id || !session.user.companyId) {
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

    // Calculate total price from line items
    const totalPrice = data.lineItems.reduce(
      (sum: number, item: any) => sum + (item.total || item.quantity * item.unitPrice),
      0
    );

    // Create the estimate with lineItems
    const estimate = await prisma.estimate.create({
      data: {
        title: data.title,
        description: data.description || '',
        status: 'DRAFT',
        price: totalPrice,
        validUntil: new Date(data.validUntil),
        clientId: data.clientId,
        createdById: session.user.id,
        companyId: session.user.companyId,
        lineItems: {
          create: data.lineItems.map((item: any) => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.total || (item.quantity * item.unitPrice),
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
      { message: 'Error creating estimate', error: String(error) },
      { status: 500 }
    );
  }
} 